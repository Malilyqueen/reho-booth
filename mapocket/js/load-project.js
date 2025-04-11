function loadAndRenderProject(projectId) {
  const savedProjects = JSON.parse(localStorage.getItem("savedProjects") || "[]");
  const project = savedProjects.find(p => p.id === projectId);

  if (!project) {
    console.error("Aucun projet trouvé pour cet ID");
    return;
  }

  console.log("Chargement du projet :", project.projectName);
  renderProjectData(project);
}

function renderProjectData(project) {
  const container = document.getElementById("categoriesContainer");
  if (!container) {
    console.error("Conteneur de catégories non trouvé");
    return;
  }

  // Remplir le budget total
  const totalBudgetElement = document.getElementById("totalBudget");
  if (totalBudgetElement) {
    totalBudgetElement.textContent = project.totalBudget;
  }

  // Injecter les catégories dans le DOM
  if (project.categories && project.categories.length > 0) {
    project.categories.forEach((category, index) => {
      const categoryElements = container.querySelectorAll(".expense-category");
      if (index >= categoryElements.length) {
        console.warn(`Pas assez d'éléments de catégorie (${categoryElements.length}) pour le projet (${project.categories.length})`);
        return;
      }
      
      const categoryElement = categoryElements[index];
      
      // Remplir le nom de la catégorie
      const nameElement = categoryElement.querySelector(".category-name");
      if (nameElement) nameElement.textContent = category.name;
      
      // Remplir le montant de la catégorie
      const amountElement = categoryElement.querySelector(".category-amount");
      if (amountElement) amountElement.textContent = category.amount;
      
      // Remplir les sous-catégories
      if (category.subcategories && category.subcategories.length > 0) {
        const subcategoriesContainer = categoryElement.querySelector(".subcategories-container");
        if (!subcategoriesContainer) return;
        
        const subcategoryElements = subcategoriesContainer.querySelectorAll(".subcategory");
        
        category.subcategories.forEach((subcategory, subIndex) => {
          if (subIndex >= subcategoryElements.length) return;
          
          const subcategoryElement = subcategoryElements[subIndex];
          
          // Remplir le nom et montant de la sous-catégorie
          const subNameElement = subcategoryElement.querySelector(".subcategory-name");
          const subAmountElement = subcategoryElement.querySelector(".subcategory-amount");
          
          if (subNameElement) subNameElement.textContent = subcategory.name;
          if (subAmountElement) subAmountElement.textContent = subcategory.amount;
          
          // Trouver ou créer le conteneur de lignes
          const linesContainer = subcategoryElement.querySelector(".lines-container");
          if (!linesContainer) return;
          
          // Vider le conteneur de lignes existant pour éviter les doublons
          linesContainer.innerHTML = "";
          
          // Remplir les lignes en utilisant la méthode d'ajout de lignes
          if (subcategory.lines && subcategory.lines.length > 0) {
            subcategory.lines.forEach(line => {
              const numericAmount = extractNumberFromString(line.amount);
              addExpenseLine(linesContainer, line.name, numericAmount);
            });
          }
          
          // Ajouter un bouton pour ajouter une nouvelle ligne
          const addButton = document.createElement("button");
          addButton.classList.add("add-line-btn");
          addButton.textContent = "➕ Ajouter une dépense";
          addButton.addEventListener("click", function() {
            addExpenseLine(linesContainer);
            recalculateAllAmounts();
          });
          
          // Vérifier si le bouton existe déjà
          if (!subcategoryElement.querySelector(".add-line-btn")) {
            linesContainer.after(addButton);
          }
        });
      }
    });
  }
  
  // Attendre que tout soit affiché avant de recalculer
  setTimeout(() => {
    recalculateAllAmounts();
  }, 0);
}

function addExpenseLine(container, name = "", amount = 0) {
  console.log(`Ajout d'une ligne: "${name}" avec montant ${amount}`);
  
  const div = document.createElement("div");
  div.classList.add("expense-line");

  div.innerHTML = `
    <input type="text" class="line-name" placeholder="Nom de la dépense" value="${name}">
    <input type="number" class="line-amount" placeholder="Montant" value="${amount}">
    <button class="delete-line">🗑️</button>
  `;

  // Ajouter au DOM
  container.appendChild(div);

  // Ajouter listeners
  div.querySelector(".line-amount").addEventListener("input", () => {
    recalculateAllAmounts();
  });
  
  div.querySelector(".line-name").addEventListener("input", () => {
    // Sauvegarder le changement de nom
    console.log("Nom de ligne modifié");
  });
  
  div.querySelector(".delete-line").addEventListener("click", () => {
    div.remove();
    recalculateAllAmounts();
  });
  
  return div;
}

function recalculateAllAmounts() {
  let total = 0;
  console.log("💰 Démarrage du recalcul complet des montants");

  document.querySelectorAll(".expense-category").forEach(catEl => {
    let catTotal = 0;
    const categoryName = catEl.querySelector(".category-name")?.textContent || "Catégorie";
    
    console.log(`- Calcul de la catégorie: ${categoryName}`);

    catEl.querySelectorAll(".subcategory").forEach(subcatEl => {
      let subTotal = 0;
      const subcategoryName = subcatEl.querySelector(".subcategory-name")?.textContent || "Sous-catégorie";
      
      console.log(`  - Calcul de la sous-catégorie: ${subcategoryName}`);

      // Parcourir toutes les lignes de dépenses pour cette sous-catégorie
      subcatEl.querySelectorAll(".expense-line").forEach(lineEl => {
        const lineAmount = lineEl.querySelector(".line-amount");
        const lineNameEl = lineEl.querySelector(".line-name");
        let lineName = "Ligne";
        let amount = 0;
        
        // Récupérer le nom correct selon le type d'élément
        if (lineNameEl) {
          if (lineNameEl.tagName === 'INPUT') {
            lineName = lineNameEl.value || "Ligne";
          } else {
            lineName = lineNameEl.textContent || "Ligne";
          }
        }
        
        // Extraction du montant selon le type d'élément
        if (lineAmount) {
          if (lineAmount.tagName === 'INPUT') {
            // Si c'est un input, utiliser sa valeur
            amount = parseFloat(lineAmount.value) || 0;
          } else {
            // Sinon extraire le nombre du texte (en supprimant la devise, etc.)
            amount = extractNumberFromString(lineAmount.textContent);
          }
        }
        
        subTotal += amount;
        console.log(`    > ${lineName}: ${amount}`);
      });

      // Mettre à jour l'affichage de la sous-catégorie
      const subDisplay = subcatEl.querySelector(".subcategory-amount");
      if (subDisplay) {
        subDisplay.textContent = formatCurrency(subTotal);
        console.log(`  => Sous-total ${subcategoryName}: ${subTotal}`);
      }

      catTotal += subTotal;
    });

    // Mettre à jour l'affichage de la catégorie
    const catDisplay = catEl.querySelector(".category-amount");
    if (catDisplay) {
      catDisplay.textContent = formatCurrency(catTotal);
      console.log(`=> Total ${categoryName}: ${catTotal}`);
    }

    total += catTotal;
  });

  // Mettre à jour le budget total
  const totalDisplay = document.getElementById("totalBudget");
  if (totalDisplay) {
    totalDisplay.textContent = formatCurrency(total);
  }

  console.log("💸 Recalcul terminé. Budget total : ", total);
}

function extractNumberFromString(str) {
  if (!str) return 0;
  
  // Supprimer tout sauf les chiffres, points et virgules
  const cleaned = String(str).replace(/[^\d.,]/g, '').replace(',', '.');
  
  // Convertir en nombre
  const value = parseFloat(cleaned);
  return isNaN(value) ? 0 : value;
}

function formatCurrency(amount) {
  // Déterminer le symbole de devise à partir du budget total existant
  const totalBudgetElement = document.getElementById("totalBudget");
  let symbol = "€";
  
  if (totalBudgetElement && totalBudgetElement.textContent) {
    const match = totalBudgetElement.textContent.match(/^([^\d]+)/);
    if (match && match[1]) {
      symbol = match[1].trim();
    }
  }
  
  return `${symbol} ${amount.toFixed(2).replace(".", ",")}`;
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
  const urlParams = new URLSearchParams(window.location.search);
  const editMode = urlParams.get('edit');
  const projectId = urlParams.get('id');
  
  if (projectId && editMode === 'true') {
    // Attendre que le DOM soit complètement chargé
    window.addEventListener('load', function() {
      console.log("Mode édition détecté, chargement du projet:", projectId);
      // Laisser du temps pour que le DOM se construise
      setTimeout(() => {
        loadAndRenderProject(projectId);
        
        // Attacher les écouteurs d'événements après le chargement
        document.querySelectorAll('.expense-line .line-amount, .subcategory-amount, .category-amount').forEach(el => {
          el.addEventListener('input', () => setTimeout(recalculateAllAmounts, 0));
          el.addEventListener('blur', () => setTimeout(recalculateAllAmounts, 0));
        });
      }, 500);
    });
  }
});