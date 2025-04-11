/**
 * updateTemplateCategoriesUI.js
 * 
 * Ce fichier définit la fonction updateTemplateCategoriesUI
 * qui est responsable de mettre à jour l'interface utilisateur
 * quand un template de projet est sélectionné.
 */

// Fonction principale d'initialisation
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initialisation du gestionnaire de template UI');
    
    // Créer la fonction si elle n'existe pas déjà
    if (typeof window.updateTemplateCategoriesUI === 'undefined') {
        window.updateTemplateCategoriesUI = function(templateName) {
            console.log('Mise à jour du template UI pour:', templateName);
            
            // Vérifier si nous sommes en mode édition
            const urlParams = new URLSearchParams(window.location.search);
            const isEditMode = urlParams.get('edit') === 'true';
            const projectId = urlParams.get('id');
            
            if (isEditMode && projectId) {
                // En mode édition, préserver les données existantes
                console.log('Mode édition détecté, conservation des catégories existantes');
                return;
            }
            
            // En mode création, appliquer le template
            applyTemplateToUI(templateName);
        };
    }
});

/**
 * Applique un template à l'interface utilisateur en créant les catégories appropriées
 */
function applyTemplateToUI(templateName) {
    console.log('Application du template:', templateName);
    
    // Récupérer le conteneur de catégories
    const categoriesContainer = document.getElementById('categoriesContainer');
    if (!categoriesContainer) {
        console.error('Conteneur de catégories non trouvé');
        return;
    }
    
    // Vider le conteneur
    categoriesContainer.innerHTML = '';
    
    // Récupérer les catégories par défaut pour ce template
    let defaultCategories = [];
    
    try {
        // Essayer d'accéder aux catégories par défaut depuis les différentes sources
        if (typeof DEFAULT_TEMPLATES !== 'undefined' && DEFAULT_TEMPLATES[templateName]) {
            defaultCategories = DEFAULT_TEMPLATES[templateName];
        } else if (typeof DEFAULT_CATEGORIES !== 'undefined' && DEFAULT_CATEGORIES[templateName]) {
            defaultCategories = DEFAULT_CATEGORIES[templateName];
        } else if (typeof window.defaultCategories !== 'undefined' && window.defaultCategories[templateName]) {
            defaultCategories = window.defaultCategories[templateName];
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des catégories par défaut:', error);
    }
    
    // Si on a trouvé des catégories, les ajouter
    if (defaultCategories && defaultCategories.length > 0) {
        defaultCategories.forEach(category => {
            const categoryElement = createCategoryElement(category);
            categoriesContainer.appendChild(categoryElement);
        });
        
        // Attacher les gestionnaires d'événements
        initializeEventListeners();
        
        // Effectuer le calcul initial
        if (typeof recalculateAllAmounts === 'function') {
            setTimeout(recalculateAllAmounts, 0);
        }
    } else {
        console.warn('Aucune catégorie par défaut trouvée pour le template:', templateName);
    }
}

/**
 * Crée un élément de catégorie à partir d'un objet de données
 */
function createCategoryElement(category) {
    const categoryElement = document.createElement('div');
    categoryElement.className = 'expense-category';
    
    // Construire la structure HTML
    categoryElement.innerHTML = `
        <div class="category-header">
            <div class="category-name" contenteditable="true">${category.name || category.nom || ''}</div>
            <div class="category-amount" contenteditable="true">${category.amount || category.montant || '0'}</div>
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
    
    // Ajouter les sous-catégories si présentes
    const subcategoriesContainer = categoryElement.querySelector('.subcategories-container');
    const subcategories = category.subcategories || category.sous_categories || [];
    
    subcategories.forEach(subcategory => {
        const subcategoryElement = createSubcategoryElement(subcategory);
        subcategoriesContainer.appendChild(subcategoryElement);
    });
    
    return categoryElement;
}

/**
 * Crée un élément de sous-catégorie à partir d'un objet de données
 */
function createSubcategoryElement(subcategory) {
    const subcategoryElement = document.createElement('div');
    subcategoryElement.className = 'subcategory';
    
    // Construire la structure HTML
    subcategoryElement.innerHTML = `
        <div class="subcategory-header">
            <div class="subcategory-name" contenteditable="true">${subcategory.name || subcategory.nom || ''}</div>
            <div class="subcategory-amount" contenteditable="true">${subcategory.amount || subcategory.montant || '0'}</div>
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
    
    // Ajouter les lignes si présentes
    const linesContainer = subcategoryElement.querySelector('.lines-container');
    
    // Si des lignes sont définies, les ajouter avec la structure attendue (inputs)
    if (subcategory.lines && subcategory.lines.length > 0) {
        subcategory.lines.forEach(line => {
            const lineElement = document.createElement('div');
            lineElement.className = 'expense-line';
            
            // Les montants numériques extraits pour les inputs
            const amount = (line.amount || line.montant) ? 
                extractNumberFromString(line.amount || line.montant) : 0;
            
            // Créer avec la structure d'input souhaitée
            lineElement.innerHTML = `
                <input type="text" class="line-name" placeholder="Nom de la dépense" value="${line.name || line.nom || ''}">
                <input type="number" class="line-amount" placeholder="Montant" value="${amount}">
                <button class="delete-line">🗑️</button>
            `;
            
            // Ajouter les gestionnaires d'événements pour la ligne
            const amountInput = lineElement.querySelector('.line-amount');
            if (amountInput) {
                amountInput.addEventListener('input', function() {
                    setTimeout(recalculateAllAmounts, 0);
                });
            }
            
            const deleteBtn = lineElement.querySelector('.delete-line');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', function() {
                    lineElement.remove();
                    setTimeout(recalculateAllAmounts, 0);
                });
            }
            
            linesContainer.appendChild(lineElement);
        });
    }
    
    return subcategoryElement;
}

/**
 * Initialise tous les écouteurs d'événements nécessaires
 */
function initializeEventListeners() {
    // Écouteurs pour les boutons d'ajout de ligne
    document.querySelectorAll('.add-line-btn').forEach(button => {
        button.addEventListener('click', function() {
            const subcategory = this.closest('.subcategory');
            const linesContainer = subcategory.querySelector('.lines-container');
            
            if (linesContainer && typeof addExpenseLine === 'function') {
                addExpenseLine(linesContainer);
                setTimeout(recalculateAllAmounts, 0);
            }
        });
    });
    
    // Écouteurs pour les montants
    document.querySelectorAll('.category-amount, .subcategory-amount, .line-amount').forEach(el => {
        el.addEventListener('input', function() {
            setTimeout(recalculateAllAmounts, 0);
        });
        el.addEventListener('blur', function() {
            setTimeout(recalculateAllAmounts, 0);
        });
    });
}

/**
 * Extrait un nombre d'une chaîne de caractères (utilitaire)
 */
function extractNumberFromString(str) {
    if (!str) return 0;
    
    // Supprimer tout sauf les chiffres, points et virgules
    const cleaned = String(str).replace(/[^\d.,]/g, '').replace(',', '.');
    
    // Convertir en nombre
    const value = parseFloat(cleaned);
    return isNaN(value) ? 0 : value;
}