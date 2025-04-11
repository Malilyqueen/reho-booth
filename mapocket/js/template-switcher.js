/**
 * Gestionnaire de changement de templates pour MaPocket
 * Ce module gère la mise à jour des catégories suggérées lors du changement de template
 */

// Variables globales
let currentTemplate = ""; // Type de projet actuellement sélectionné
let startFromScratch = false; // Option pour partir de zéro

/**
 * Initialise le gestionnaire de changement de templates
 */
function initializeTemplateSwitcher() {
    console.log("Initialisation du gestionnaire de changement de templates...");
    
    // Récupérer toutes les options de templates
    const templateOptions = document.querySelectorAll('.template-option');
    
    // Ajouter des écouteurs d'événements à chaque option
    templateOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            // Désélectionner tous les templates
            templateOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Sélectionner le template cliqué
            this.classList.add('selected');
            
            // Mettre à jour le type de projet
            const templateType = this.getAttribute('data-template');
            updateSelectedTemplate(templateType);
            
            // Générer les suggestions de catégories basées sur le template
            if (!startFromScratch) {
                loadTemplateSuggestions(templateType);
            }
            
            // Mettre à jour le titre de la page
            document.querySelector('.project-type').textContent = templateType;
            document.getElementById('projectName').value = templateType + ' de ' + (document.getElementById('projectName').value.split(' de ')[1] || 'Projet');
        });
    });
    
    // Option pour partir de zéro
    const startFromScratchCheckbox = document.getElementById('startFromScratch');
    if (startFromScratchCheckbox) {
        startFromScratchCheckbox.addEventListener('change', function() {
            startFromScratch = this.checked;
            
            // Si l'option est cochée, vider les catégories
            if (startFromScratch) {
                document.getElementById('expenseCategories').innerHTML = '';
                updateTotalBudget(0);
            } else {
                // Sinon, charger les suggestions du template actuel
                const selectedOption = document.querySelector('.template-option.selected');
                if (selectedOption) {
                    const templateType = selectedOption.getAttribute('data-template');
                    loadTemplateSuggestions(templateType);
                }
            }
        });
    }
    
    // Initialiser avec le template actuellement sélectionné
    const initialSelectedTemplate = document.querySelector('.template-option.selected');
    if (initialSelectedTemplate) {
        const templateType = initialSelectedTemplate.getAttribute('data-template');
        currentTemplate = templateType;
        
        // Vérifier si l'option "partir de zéro" est cochée
        if (startFromScratchCheckbox && !startFromScratchCheckbox.checked) {
            loadTemplateSuggestions(templateType);
        }
    }
}

/**
 * Met à jour le template sélectionné
 * @param {string} templateType - Le type de template sélectionné
 */
function updateSelectedTemplate(templateType) {
    currentTemplate = templateType;
    
    // Mettre à jour le champ caché pour le formulaire
    const templateInput = document.getElementById('template');
    if (templateInput) {
        templateInput.value = templateType;
    }
    
    // Déclencher un événement personnalisé pour informer les autres modules
    const event = new CustomEvent('templateChanged', { detail: { template: templateType } });
    document.dispatchEvent(event);
    
    console.log("Template sélectionné:", templateType);
}

/**
 * Charge les suggestions de catégories basées sur le template sélectionné
 * @param {string} templateType - Le type de template
 */
function loadTemplateSuggestions(templateType) {
    // Récupérer les suggestions pour ce template
    const suggestions = getSuggestionsByTemplate(templateType);
    
    // Générer le HTML pour les catégories suggérées
    const categoriesHTML = generateCategoriesHTML(suggestions);
    
    // Mettre à jour le conteneur de catégories
    const categoriesContainer = document.getElementById('expenseCategories');
    if (categoriesContainer) {
        categoriesContainer.innerHTML = categoriesHTML;
    }
    
    // Initialiser les champs modifiables
    initializeEditableFields();
    
    // Mettre à jour le total du budget
    recalculateTotalBudget();
    
    console.log("Suggestions de catégories chargées pour le template:", templateType);
}

/**
 * Recalcule le budget total à partir des lignes de dépenses
 */
function recalculateTotalBudget() {
    let total = 0;
    
    // Parcourir toutes les lignes de dépense pour calculer le total
    const expenseLines = document.querySelectorAll('.expense-line-amount');
    expenseLines.forEach(line => {
        const amount = parseAmount(line.value);
        if (!isNaN(amount)) {
            total += amount;
        }
    });
    
    // Mettre à jour l'affichage du total
    updateTotalBudget(total);
    
    return total;
}

/**
 * Met à jour l'affichage du budget total
 * @param {number} amount - Le montant total
 */
function updateTotalBudget(amount) {
    // Mettre à jour l'affichage du budget total
    const totalBudgetElement = document.querySelector('.total-budget-amount');
    if (totalBudgetElement) {
        totalBudgetElement.textContent = formatCurrency(amount);
    }
    
    // Mettre également à jour le champ de budget total
    const totalBudgetInput = document.getElementById('totalBudget');
    if (totalBudgetInput) {
        totalBudgetInput.value = formatCurrency(amount);
    }
}

/**
 * Parse un montant depuis une chaîne de caractères
 * @param {string} amountStr - La chaîne à parser
 * @returns {number} - Le montant en nombre
 */
function parseAmount(amountStr) {
    if (!amountStr) return 0;
    
    // Supprimer tout ce qui n'est pas un chiffre, un point ou une virgule
    const cleanedStr = amountStr.toString().replace(/[^0-9.,]/g, '');
    
    // Remplacer la virgule par un point pour la conversion
    const normalized = cleanedStr.replace(',', '.');
    
    // Convertir en nombre
    const amount = parseFloat(normalized);
    
    return isNaN(amount) ? 0 : amount;
}

/**
 * Formate un montant en devise
 * @param {number} amount - Le montant à formater
 * @returns {string} - La chaîne formatée
 */
function formatCurrency(amount) {
    // S'assurer que amount est un nombre
    const numAmount = parseFloat(amount) || 0;
    
    // Récupérer le symbole de devise actuel
    const currencySymbol = window.currencySymbol || '€';
    
    // Formater avec 2 décimales fixes
    return currencySymbol + ' ' + numAmount.toFixed(2).replace('.', ',');
}

/**
 * Initialise les champs modifiables
 */
function initializeEditableFields() {
    // Ajouter des écouteurs d'événements pour les changements de texte
    document.querySelectorAll('.editable-field').forEach(field => {
        field.addEventListener('input', function() {
            // Si c'est un champ de montant, recalculer le budget
            if (field.classList.contains('expense-line-amount')) {
                recalculateTotalBudget();
            }
        });
    });
    
    // Ajouter des écouteurs pour la suppression de catégories
    document.querySelectorAll('.btn-delete-category').forEach(button => {
        button.addEventListener('click', function() {
            const category = this.closest('.category');
            if (category && confirm('Voulez-vous vraiment supprimer cette catégorie ?')) {
                category.remove();
                recalculateTotalBudget();
            }
        });
    });
    
    // Ajouter des écouteurs pour la suppression de sous-catégories
    document.querySelectorAll('.btn-delete-subcategory').forEach(button => {
        button.addEventListener('click', function() {
            const subcategory = this.closest('.subcategory');
            if (subcategory && confirm('Voulez-vous vraiment supprimer cette sous-catégorie ?')) {
                subcategory.remove();
                recalculateTotalBudget();
            }
        });
    });
    
    // Ajouter des écouteurs pour l'ajout de catégories
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', function() {
            addNewCategory();
        });
    }
    
    // Ajouter des écouteurs pour l'ajout de sous-catégories
    document.querySelectorAll('.btn-add-subcategory').forEach(button => {
        button.addEventListener('click', function() {
            const categoryIndex = this.getAttribute('data-category-index');
            addNewSubcategory(categoryIndex);
        });
    });
    
    // Ajouter des écouteurs pour l'ajout de lignes de dépense
    document.querySelectorAll('.btn-add-expense-line').forEach(button => {
        button.addEventListener('click', function() {
            const categoryIndex = this.getAttribute('data-category-index');
            const subcategoryIndex = this.getAttribute('data-subcategory-index');
            addNewExpenseLine(categoryIndex, subcategoryIndex);
        });
    });
}

/**
 * Ajoute une nouvelle catégorie
 */
function addNewCategory() {
    const categoriesContainer = document.getElementById('expenseCategories');
    const categoryCount = document.querySelectorAll('.category').length;
    
    const newCategoryHTML = `
    <div class="category" data-category-index="${categoryCount}">
        <div class="category-header">
            <div class="category-name-container">
                <span class="category-emoji"></span>
                <input type="text" class="category-name editable-field" value="Nouvelle catégorie" data-original="Nouvelle catégorie">
            </div>
            <div class="category-actions">
                <span class="category-amount">€ 0,00</span>
                <button type="button" class="btn-delete-category" title="Supprimer cette catégorie">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        </div>
        <div class="subcategories">
            <button type="button" class="btn-add-subcategory" data-category-index="${categoryCount}">
                <i class="fas fa-plus"></i> Ajouter une sous-catégorie
            </button>
        </div>
    </div>
    `;
    
    // Insérer la nouvelle catégorie avant le bouton d'ajout
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = newCategoryHTML;
    categoriesContainer.insertBefore(tempDiv.firstElementChild, addCategoryBtn);
    
    // Ajouter les écouteurs d'événements
    initializeEditableFields();
}

/**
 * Ajoute une nouvelle sous-catégorie
 * @param {number} categoryIndex - L'index de la catégorie parente
 */
function addNewSubcategory(categoryIndex) {
    const category = document.querySelector(`.category[data-category-index="${categoryIndex}"]`);
    if (!category) return;
    
    const subcategoriesContainer = category.querySelector('.subcategories');
    const subcategoryCount = category.querySelectorAll('.subcategory').length;
    
    const newSubcategoryHTML = `
    <div class="subcategory" data-category-index="${categoryIndex}" data-subcategory-index="${subcategoryCount}">
        <div class="subcategory-header">
            <div class="subcategory-name-container">
                <span class="subcategory-emoji"></span>
                <input type="text" class="subcategory-name editable-field" value="Nouvelle sous-catégorie" data-original="Nouvelle sous-catégorie">
            </div>
            <div class="subcategory-actions">
                <span class="subcategory-amount">€ 0,00</span>
                <button type="button" class="btn-add-expense-line" title="Ajouter une ligne de dépense" data-category-index="${categoryIndex}" data-subcategory-index="${subcategoryCount}">
                    <i class="fas fa-plus"></i>
                </button>
                <button type="button" class="btn-delete-subcategory" title="Supprimer cette sous-catégorie">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        </div>
        <div class="expense-lines">
            <!-- Les lignes seront ajoutées ici -->
        </div>
    </div>
    `;
    
    // Insérer la nouvelle sous-catégorie avant le bouton d'ajout
    const addSubcategoryBtn = category.querySelector('.btn-add-subcategory');
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = newSubcategoryHTML;
    subcategoriesContainer.insertBefore(tempDiv.firstElementChild, addSubcategoryBtn);
    
    // Ajouter les écouteurs d'événements
    initializeEditableFields();
}

/**
 * Ajoute une nouvelle ligne de dépense
 * @param {number} categoryIndex - L'index de la catégorie parente
 * @param {number} subcategoryIndex - L'index de la sous-catégorie parente
 */
function addNewExpenseLine(categoryIndex, subcategoryIndex) {
    const subcategory = document.querySelector(`.subcategory[data-category-index="${categoryIndex}"][data-subcategory-index="${subcategoryIndex}"]`);
    if (!subcategory) return;
    
    const expenseLinesContainer = subcategory.querySelector('.expense-lines');
    const lineCount = subcategory.querySelectorAll('.expense-line').length;
    
    const newLineHTML = `
    <div class="expense-line" data-line-index="${lineCount}">
        <div class="expense-line-content">
            <input type="text" class="expense-line-name editable-field" value="Nouvelle dépense" data-original="Nouvelle dépense">
            <div class="expense-line-amount-container">
                <input type="text" class="expense-line-amount editable-field" value="€ 0,00" data-original="0">
                <button type="button" class="btn-delete-expense-line" title="Supprimer cette ligne">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        </div>
    </div>
    `;
    
    // Insérer la nouvelle ligne
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = newLineHTML;
    expenseLinesContainer.appendChild(tempDiv.firstElementChild);
    
    // Ajouter les écouteurs d'événements
    initializeEditableFields();
    
    // Mettre à jour les totaux
    recalculateTotalBudget();
    
    // Mettre le focus sur le nom de la nouvelle ligne
    const newLineNameInput = expenseLinesContainer.querySelector(`.expense-line[data-line-index="${lineCount}"] .expense-line-name`);
    if (newLineNameInput) {
        newLineNameInput.focus();
        newLineNameInput.select();
    }
}

// Initialiser le gestionnaire de templates au chargement du document
document.addEventListener('DOMContentLoaded', function() {
    initializeTemplateSwitcher();
});