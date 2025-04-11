/**
 * Charge un projet à partir de son ID et le rend dans l'interface
 * @param {string} projectId - L'identifiant du projet à charger
 */
function loadAndRenderProject(projectId) {
  console.log("📂 Chargement du projet:", projectId);
  
  // Essayer d'abord de trouver le projet dans 'savedProjects'
  let savedProjects = JSON.parse(localStorage.getItem("savedProjects") || "[]");
  let project = savedProjects.find(p => p.id === projectId);
  
  // Si pas trouvé, essayer dans 'mapocket_projects'
  if (!project) {
    const altProjects = JSON.parse(localStorage.getItem("mapocket_projects") || "[]");
    project = altProjects.find(p => p.id === projectId);
    
    if (project) {
      console.log("Projet trouvé dans une source alternative: mapocket_projects");
    }
  }

  if (!project) {
    console.error("❌ Aucun projet trouvé pour cet ID:", projectId);
    return;
  }

  console.log("✅ Projet trouvé:", project.projectName);
  console.log("📊 Données du projet:", JSON.stringify(project).substring(0, 200) + "...");
  
  // Sauvegarder le projet global actuel pour référence ultérieure
  window.currentEditedProject = project;
  
  // Rendre le projet dans l'interface
  renderProjectData(project);
}

/**
 * Rend les données d'un projet dans l'interface
 * @param {Object} project - Les données du projet à rendre
 */
function renderProjectData(project) {
  const container = document.getElementById("categoriesContainer");
  if (!container) {
    console.error("❌ Conteneur de catégories non trouvé");
    return;
  }

  // Remplir le budget total
  const totalBudgetElement = document.getElementById("totalBudget");
  if (totalBudgetElement) {
    totalBudgetElement.textContent = project.totalBudget;
    console.log("💰 Budget total défini à:", project.totalBudget);
  }

  // Vider le conteneur pour éviter les doublons
  container.innerHTML = "";
  
  // Injecter les catégories dans le DOM
  if (project.categories && project.categories.length > 0) {
    project.categories.forEach((category, index) => {
      // Créer un élément de catégorie
      const categoryElement = document.createElement("div");
      categoryElement.className = "expense-category";
      categoryElement.innerHTML = `
        <div class="category-header">
          <div class="category-name" contenteditable="true">${category.name || ''}</div>
          <div class="category-amount" contenteditable="true">${category.amount || '0'}</div>
          <div class="category-actions">
            <button class="btn-sm delete-category-btn">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        <div class="subcategories-container"></div>
        <div class="category-footer">
          <button class="btn-sm add-subcategory-btn">
            <i class="fas fa-plus"></i> Ajouter une sous-catégorie
          </button>
        </div>
      `;
      
      // Ajouter la catégorie au conteneur
      container.appendChild(categoryElement);
      
      // Trouver le conteneur de sous-catégories
      const subcategoriesContainer = categoryElement.querySelector(".subcategories-container");
      
      // Ajouter les sous-catégories
      if (category.subcategories && category.subcategories.length > 0) {
        category.subcategories.forEach((subcategory) => {
          // Créer un élément de sous-catégorie
          const subcategoryElement = document.createElement("div");
          subcategoryElement.className = "subcategory";
          subcategoryElement.innerHTML = `
            <div class="subcategory-header">
              <div class="subcategory-name" contenteditable="true">${subcategory.name || ''}</div>
              <div class="subcategory-amount" contenteditable="true">${subcategory.amount || '0'}</div>
              <div class="subcategory-actions">
                <button class="btn-sm delete-subcategory-btn">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
            <div class="lines-container"></div>
            <div class="subcategory-footer">
              <button class="btn-sm add-line-btn">
                <i class="fas fa-plus"></i> Ajouter une ligne
              </button>
            </div>
          `;
          
          // Ajouter la sous-catégorie au conteneur
          subcategoriesContainer.appendChild(subcategoryElement);
          
          // Trouver le conteneur de lignes
          const linesContainer = subcategoryElement.querySelector(".lines-container");
          
          // Ajouter les lignes avec une structure propre (inputs)
          if (subcategory.lines && subcategory.lines.length > 0) {
            subcategory.lines.forEach(line => {
              const numericAmount = extractNumberFromString(line.amount);
              console.log(`💵 Ajout ligne: ${line.name} = ${numericAmount}`);
              addExpenseLine(linesContainer, line.name, numericAmount);
            });
          }
          
          // Ajouter les écouteurs d'événements à la sous-catégorie
          const addLineBtn = subcategoryElement.querySelector(".add-line-btn");
          if (addLineBtn) {
            addLineBtn.addEventListener("click", function() {
              addExpenseLine(linesContainer);
              recalculateAllAmounts();
            });
          }
        });
      }
    });
  }
  
  // Initialiser tous les gestionnaires d'événements
  initializeProjectEventListeners();
  
  // Attendre que tout soit affiché avant de recalculer
  setTimeout(() => {
    recalculateAllAmounts();
  }, 0);
}

/**
 * Initialise tous les écouteurs d'événements du projet
 */
function initializeProjectEventListeners() {
  // Écouteurs pour les boutons de suppression de catégorie
  document.querySelectorAll('.delete-category-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const category = this.closest('.expense-category');
      if (category) {
        category.remove();
        recalculateAllAmounts();
      }
    });
  });
  
  // Écouteurs pour les boutons de suppression de sous-catégorie
  document.querySelectorAll('.delete-subcategory-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const subcategory = this.closest('.subcategory');
      if (subcategory) {
        subcategory.remove();
        recalculateAllAmounts();
      }
    });
  });
  
  // Écouteurs pour les montants modifiables
  document.querySelectorAll('.category-amount, .subcategory-amount').forEach(el => {
    el.addEventListener('input', () => setTimeout(recalculateAllAmounts, 0));
    el.addEventListener('blur', () => setTimeout(recalculateAllAmounts, 0));
  });
  
  // Écouteurs pour les boutons d'ajout de sous-catégorie
  document.querySelectorAll('.add-subcategory-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const category = this.closest('.expense-category');
      const container = category.querySelector('.subcategories-container');
      if (container) {
        // Créer une nouvelle sous-catégorie
        const subcategory = document.createElement('div');
        subcategory.className = 'subcategory';
        subcategory.innerHTML = `
          <div class="subcategory-header">
            <div class="subcategory-name" contenteditable="true">Nouvelle sous-catégorie</div>
            <div class="subcategory-amount" contenteditable="true">0</div>
            <div class="subcategory-actions">
              <button class="btn-sm delete-subcategory-btn">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          <div class="lines-container"></div>
          <div class="subcategory-footer">
            <button class="btn-sm add-line-btn">
              <i class="fas fa-plus"></i> Ajouter une ligne
            </button>
          </div>
        `;
        container.appendChild(subcategory);
        
        // Ajouter les écouteurs d'événements
        const deleteBtn = subcategory.querySelector('.delete-subcategory-btn');
        if (deleteBtn) {
          deleteBtn.addEventListener('click', function() {
            subcategory.remove();
            recalculateAllAmounts();
          });
        }
        
        const addLineBtn = subcategory.querySelector('.add-line-btn');
        if (addLineBtn) {
          const linesContainer = subcategory.querySelector('.lines-container');
          addLineBtn.addEventListener('click', function() {
            addExpenseLine(linesContainer);
            recalculateAllAmounts();
          });
        }
        
        const amountEl = subcategory.querySelector('.subcategory-amount');
        if (amountEl) {
          amountEl.addEventListener('input', () => setTimeout(recalculateAllAmounts, 0));
          amountEl.addEventListener('blur', () => setTimeout(recalculateAllAmounts, 0));
        }
        
        recalculateAllAmounts();
      }
    });
  });
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
  console.log("Initialisation du système de chargement de projet...");
  
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
  } else {
    // Mode création
    console.log("Mode création détecté, initialisation du recalcul automatique");
    
    // Attendre que le DOM soit complètement chargé
    window.addEventListener('load', function() {
      // Veiller à ce que les modifications déclenchent le recalcul
      // même en mode création
      document.addEventListener('click', function(e) {
        // Quand on clique sur un bouton d'ajout de ligne ou de sous-catégorie
        if (e.target.classList.contains('add-line-btn') || 
            e.target.closest('.add-line-btn') ||
            e.target.classList.contains('add-subcategory-btn') || 
            e.target.closest('.add-subcategory-btn')) {
          setTimeout(recalculateAllAmounts, 100);
        }
        
        // Quand on clique sur un bouton de suppression
        if (e.target.classList.contains('delete-line') || 
            e.target.closest('.delete-line') ||
            e.target.classList.contains('delete-subcategory-btn') || 
            e.target.closest('.delete-subcategory-btn') ||
            e.target.classList.contains('delete-category-btn') || 
            e.target.closest('.delete-category-btn')) {
          setTimeout(recalculateAllAmounts, 100);
        }
      });
      
      // Observer les changements dans les montants (en mode création aussi)
      function attachInputListeners() {
        document.querySelectorAll('input.line-amount, .category-amount, .subcategory-amount').forEach(el => {
          el.addEventListener('input', () => setTimeout(recalculateAllAmounts, 0));
          el.addEventListener('blur', () => setTimeout(recalculateAllAmounts, 0));
          el.addEventListener('change', () => setTimeout(recalculateAllAmounts, 0));
        });
      }
      
      // Attacher initialement
      attachInputListeners();
      
      // Observer les ajouts au DOM pour réattacher les écouteurs
      const observer = new MutationObserver(function(mutations) {
        let shouldReattach = false;
        
        mutations.forEach(mutation => {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            shouldReattach = true;
          }
        });
        
        if (shouldReattach) {
          attachInputListeners();
        }
      });
      
      // Observer tout le conteneur de projets
      const container = document.getElementById('categoriesContainer') || document.getElementById('expenseCategories');
      if (container) {
        observer.observe(container, { childList: true, subtree: true });
      }
      
      // Initialiser le recalcul au démarrage
      setTimeout(recalculateAllAmounts, 1000);
    });
  }
});