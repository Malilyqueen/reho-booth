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
          
          // Remplir les lignes
          if (subcategory.lines && subcategory.lines.length > 0) {
            const linesContainer = subcategoryElement.querySelector(".lines-container");
            if (!linesContainer) return;
            
            const lineElements = linesContainer.querySelectorAll(".expense-line");
            
            subcategory.lines.forEach((line, lineIndex) => {
              if (lineIndex >= lineElements.length) return;
              
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
  let total = 0;

  document.querySelectorAll(".expense-category").forEach(catEl => {
    let catTotal = 0;

    catEl.querySelectorAll(".subcategory").forEach(subcatEl => {
      let subTotal = 0;
      subcatEl.querySelectorAll(".expense-line").forEach(lineEl => {
        const input = lineEl.querySelector(".line-amount");
        const amount = parseFloat(input?.value || 0);
        subTotal += amount;
      });

      const subDisplay = subcatEl.querySelector(".subcategory-amount");
      if (subDisplay) {
        subDisplay.textContent = formatCurrency(subTotal);
      }

      catTotal += subTotal;
    });

    const catDisplay = catEl.querySelector(".category-amount");
    if (catDisplay) {
      catDisplay.textContent = formatCurrency(catTotal);
    }

    total += catTotal;
  });

  const totalDisplay = document.getElementById("totalBudget");
  if (totalDisplay) {
    totalDisplay.textContent = formatCurrency(total);
  }

  console.log("💸 Recalcul terminé. Budget total : ", total);
}

function formatCurrency(amount) {
  return `€ ${amount.toFixed(2).replace(".", ",")}`;
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