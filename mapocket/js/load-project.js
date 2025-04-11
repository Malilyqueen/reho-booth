/**
 * Système simplifié et robuste pour le chargement et le rendu des projets
 */

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
  // Vérifier si nous sommes sur la page de détail ou d'édition de projet
  const categoriesContainer = document.getElementById("categoriesContainer");
  if (!categoriesContainer) {
    console.warn("Conteneur de catégories non trouvé");
    return;
  }
  
  // Remplir le budget total
  const totalBudgetElement = document.getElementById("totalBudget");
  if (totalBudgetElement) {
    totalBudgetElement.textContent = project.totalBudget || "0";
  }
  
  // Injecter les catégories dans le DOM
  if (project.categories && project.categories.length > 0) {
    project.categories.forEach((category, index) => {
      const categoryElements = categoriesContainer.querySelectorAll(".expense-category");
      if (index >= categoryElements.length) {
        console.warn(`Pas assez d'éléments de catégorie (${categoryElements.length}) pour le projet (${project.categories.length})`);
        return;
      }
      
      const categoryElement = categoryElements[index];
      
      // Remplir le nom et montant de la catégorie
      const nameElement = categoryElement.querySelector(".category-name");
      const amountElement = categoryElement.querySelector(".category-amount");
      
      if (nameElement) nameElement.textContent = category.name;
      if (amountElement) amountElement.textContent = category.amount;
      
      // Remplir les sous-catégories
      if (category.subcategories && category.subcategories.length > 0) {
        const subcategoriesContainer = categoryElement.querySelector(".subcategories-container");
        if (!subcategoriesContainer) {
          console.warn("Conteneur de sous-catégories non trouvé");
          return;
        }
        
        const subcategoryElements = subcategoriesContainer.querySelectorAll(".subcategory");
        
        category.subcategories.forEach((subcategory, subIndex) => {
          if (subIndex >= subcategoryElements.length) {
            console.warn(`Pas assez d'éléments de sous-catégorie pour la catégorie ${category.name}`);
            return;
          }
          
          const subcategoryElement = subcategoryElements[subIndex];
          
          // Remplir le nom et montant de la sous-catégorie
          const subNameElement = subcategoryElement.querySelector(".subcategory-name");
          const subAmountElement = subcategoryElement.querySelector(".subcategory-amount");
          
          if (subNameElement) subNameElement.textContent = subcategory.name;
          if (subAmountElement) subAmountElement.textContent = subcategory.amount;
          
          // Remplir les lignes
          if (subcategory.lines && subcategory.lines.length > 0) {
            const linesContainer = subcategoryElement.querySelector(".lines-container");
            if (!linesContainer) {
              console.warn("Conteneur de lignes non trouvé");
              return;
            }
            
            const lineElements = linesContainer.querySelectorAll(".expense-line");
            
            subcategory.lines.forEach((line, lineIndex) => {
              if (lineIndex >= lineElements.length) {
                console.warn(`Pas assez d'éléments de ligne pour la sous-catégorie ${subcategory.name}`);
                return;
              }
              
              const lineElement = lineElements[lineIndex];
              
              // Remplir le nom et montant de la ligne
              const lineNameElement = lineElement.querySelector(".line-name");
              const lineAmountElement = lineElement.querySelector(".line-amount");
              
              if (lineNameElement) lineNameElement.textContent = line.name;
              if (lineAmountElement) lineAmountElement.textContent = line.amount;
            });
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

function recalculateAllAmounts() {
  console.log("💸 Démarrage du recalcul complet des montants");
  let total = 0;

  document.querySelectorAll(".expense-category").forEach(catEl => {
    let catTotal = 0;
    const categoryName = catEl.querySelector(".category-name")?.textContent || "Catégorie";

    catEl.querySelectorAll(".subcategory").forEach(subcatEl => {
      let subTotal = 0;
      const subcategoryName = subcatEl.querySelector(".subcategory-name")?.textContent || "Sous-catégorie";
      
      subcatEl.querySelectorAll(".expense-line").forEach(lineEl => {
        // Gestion correcte des deux types d'éléments possibles (input ou span)
        const amountElement = lineEl.querySelector(".line-amount");
        let amount = 0;
        
        if (amountElement) {
          // Si c'est un input, utiliser sa valeur
          if (amountElement.tagName === "INPUT") {
            amount = parseFloat(amountElement.value || "0") || 0;
          } 
          // Sinon utiliser le texte
          else {
            amount = extractNumberFromString(amountElement.textContent);
          }
        }
        
        subTotal += amount;
      });

      const subDisplay = subcatEl.querySelector(".subcategory-amount");
      if (subDisplay) {
        const oldValue = extractNumberFromString(subDisplay.textContent);
        
        // Ne pas écraser les valeurs manuelles si pas de lignes
        const hasLines = subcatEl.querySelectorAll(".expense-line").length > 0;
        if (hasLines || oldValue <= 0) {
          subDisplay.textContent = formatCurrency(subTotal);
          console.log(`  - Sous-catégorie "${subcategoryName}": ${subTotal}`);
        } else {
          console.log(`  - Sous-catégorie "${subcategoryName}": valeur manuelle conservée (${oldValue})`);
          subTotal = oldValue; // Utiliser la valeur manuelle existante
        }
      }

      catTotal += subTotal;
    });

    const catDisplay = catEl.querySelector(".category-amount");
    if (catDisplay) {
      const oldValue = extractNumberFromString(catDisplay.textContent);
      
      // Ne pas écraser les valeurs manuelles si pas de sous-catégories
      const hasSubcategories = catEl.querySelectorAll(".subcategory").length > 0;
      if (hasSubcategories || oldValue <= 0) {
        catDisplay.textContent = formatCurrency(catTotal);
        console.log(`- Catégorie "${categoryName}": ${catTotal}`);
      } else {
        console.log(`- Catégorie "${categoryName}": valeur manuelle conservée (${oldValue})`);
        catTotal = oldValue; // Utiliser la valeur manuelle existante
      }
    }

    total += catTotal;
  });

  const totalDisplay = document.getElementById("totalBudget");
  if (totalDisplay) {
    totalDisplay.textContent = formatCurrency(total);
  }

  console.log(`💸 Recalcul terminé. Budget total: ${total}`);
}

function extractNumberFromString(str) {
  if (!str) return 0;
  
  // Supprimer tout sauf les chiffres, points et virgules
  const cleaned = str.replace(/[^\d.,]/g, '').replace(',', '.');
  
  // Convertir en nombre
  const value = parseFloat(cleaned);
  return isNaN(value) ? 0 : value;
}

function formatCurrency(amount) {
  // Déterminer le symbole de devise à utiliser
  let symbol = "€";
  
  // 1. Essayer de récupérer depuis les préférences utilisateur
  if (window.userPreferences && window.userPreferences.currency) {
    switch (window.userPreferences.currency) {
      case "EUR": symbol = "€"; break;
      case "USD": symbol = "$"; break;
      case "MAD": symbol = "DH"; break;
      case "AED": symbol = "AED"; break;
    }
  }
  // 2. Sinon essayer de récupérer depuis le budget total
  else {
    const totalBudget = document.getElementById("totalBudget");
    if (totalBudget && totalBudget.textContent) {
      const match = totalBudget.textContent.match(/^([^\d]+)/);
      if (match && match[1]) {
        symbol = match[1].trim();
      }
    }
  }
  
  return `${symbol} ${amount.toFixed(2).replace('.', ',')}`;
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
  const urlParams = new URLSearchParams(window.location.search);
  const editMode = urlParams.get('edit');
  const projectId = urlParams.get('id');
  
  if (projectId) {
    // Attendre que le DOM soit complètement chargé
    window.addEventListener('load', function() {
      if (editMode === 'true') {
        console.log("Mode édition détecté, chargement du projet:", projectId);
        setTimeout(() => {
          loadAndRenderProject(projectId);
          
          // Attacher les écouteurs d'événements après le chargement
          document.querySelectorAll('.expense-line .line-amount, .subcategory-amount, .category-amount').forEach(el => {
            el.addEventListener('input', () => setTimeout(recalculateAllAmounts, 0));
            el.addEventListener('blur', () => setTimeout(recalculateAllAmounts, 0));
          });
        }, 500); // Attendre que les autres scripts aient initialisé le DOM
      }
    });
  }
});