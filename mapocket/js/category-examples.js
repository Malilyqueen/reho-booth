/**
 * Exemples de catégories pour démontrer la logique de budget flexible
 * 
 * Ce fichier contient des exemples concrets de la structure:
 * Catégorie > Sous-catégorie > Ligne
 * avec la logique de calcul en cascade demandée.
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Chargement des exemples de catégories...');
    
    // Ajouter un bouton pour insérer l'exemple dans la création de projet
    setupExampleButton();
});

/**
 * Configure le bouton d'exemple
 */
function setupExampleButton() {
    // Vérifier si nous sommes sur la page de création de projet
    const categoriesContainer = document.querySelector('.expense-categories');
    if (!categoriesContainer) return;
    
    // Créer le bouton d'exemple
    const exampleButton = document.createElement('button');
    exampleButton.className = 'btn btn-sm btn-example';
    exampleButton.innerHTML = '<i class="fas fa-lightbulb"></i> Voir un exemple';
    exampleButton.style.marginLeft = '10px';
    exampleButton.style.backgroundColor = '#f0ad4e';
    exampleButton.style.color = 'white';
    
    // Ajouter le bouton après le bouton d'ajout de catégorie
    const addCategoryBtn = document.querySelector('.btn-add-category');
    if (addCategoryBtn && addCategoryBtn.parentNode) {
        addCategoryBtn.parentNode.appendChild(exampleButton);
    }
    
    // Attacher l'événement au clic
    exampleButton.addEventListener('click', function() {
        insertExampleCategories();
    });
}

/**
 * Insère les exemples de catégories dans le conteneur
 */
function insertExampleCategories() {
    // Vider les catégories existantes si nécessaire
    const categoriesContainer = document.querySelector('#categoriesContainer');
    if (!categoriesContainer) return;
    
    // Supprimer le placeholder de chargement s'il existe
    const loadingPlaceholder = categoriesContainer.querySelector('.loading-placeholder');
    if (loadingPlaceholder) {
        loadingPlaceholder.remove();
    }
    
    // Ajouter l'exemple de Publicité
    const publiciteCategory = createExampleCategory('Publicité', '€ 2 500,00');
    categoriesContainer.appendChild(publiciteCategory);
    
    // Ajouter la sous-catégorie Facebook
    const facebookSubcategory = createExampleSubcategory('Facebook', '€ 1 500,00');
    const subcategoriesContainer = publiciteCategory.querySelector('.subcategories-container');
    subcategoriesContainer.appendChild(facebookSubcategory);
    
    // Ajouter une ligne de retargeting
    const retargetingLine = createExampleLine('Retargeting', '€ 500,00');
    const linesContainer = facebookSubcategory.querySelector('.expense-lines');
    linesContainer.appendChild(retargetingLine);
    
    // Ajouter une autre ligne pour Facebook
    const acquisitionLine = createExampleLine('Acquisition', '€ 1 000,00');
    linesContainer.appendChild(acquisitionLine);
    
    // Ajouter une autre sous-catégorie (LinkedIn)
    const linkedinSubcategory = createExampleSubcategory('LinkedIn', '€ 1 000,00');
    subcategoriesContainer.appendChild(linkedinSubcategory);
    
    // Ajouter des lignes pour LinkedIn
    const sponsoredLine = createExampleLine('Messages sponsorisés', '€ 600,00');
    const inMailLine = createExampleLine('InMail', '€ 400,00');
    linkedinSubcategory.querySelector('.expense-lines').appendChild(sponsoredLine);
    linkedinSubcategory.querySelector('.expense-lines').appendChild(inMailLine);
    
    // Ajouter un texte explicatif
    addExplanationText();
    
    // Initialiser les comportements
    setTimeout(function() {
        if (typeof attachBudgetAmountListeners === 'function') {
            attachBudgetAmountListeners();
        }
        if (typeof updateTotals === 'function') {
            updateTotals();
        }
    }, 100);
}

/**
 * Crée une catégorie d'exemple
 */
function createExampleCategory(name, amount) {
    const category = document.createElement('div');
    category.className = 'expense-category';
    category.innerHTML = `
        <div class="category-header">
            <div class="category-name" contenteditable="true">${name}</div>
            <div class="category-amount" contenteditable="true">${amount}</div>
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
    return category;
}

/**
 * Crée une sous-catégorie d'exemple
 */
function createExampleSubcategory(name, amount) {
    const subcategory = document.createElement('div');
    subcategory.className = 'subcategory';
    subcategory.innerHTML = `
        <div class="subcategory-header">
            <div class="subcategory-name" contenteditable="true">${name}</div>
            <div class="subcategory-amount" contenteditable="true">${amount}</div>
            <div class="subcategory-actions">
                <button class="btn-sm delete-subcategory-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        <div class="expense-lines"></div>
        <div class="subcategory-footer">
            <button class="btn-sm add-line-btn">
                <i class="fas fa-plus"></i> Ajouter une ligne
            </button>
        </div>
    `;
    return subcategory;
}

/**
 * Crée une ligne d'exemple
 */
function createExampleLine(name, amount) {
    const line = document.createElement('div');
    line.className = 'expense-line';
    line.innerHTML = `
        <div class="line-name" contenteditable="true">${name}</div>
        <div class="line-amount" contenteditable="true">${amount}</div>
        <div class="line-actions">
            <button class="btn-sm delete-line-btn">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    return line;
}

/**
 * Ajoute un texte explicatif pour l'exemple
 */
function addExplanationText() {
    const categoriesContainer = document.querySelector('#categoriesContainer');
    if (!categoriesContainer) return;
    
    const explanationDiv = document.createElement('div');
    explanationDiv.className = 'example-explanation';
    explanationDiv.style.marginTop = '20px';
    explanationDiv.style.padding = '15px';
    explanationDiv.style.backgroundColor = '#f8f9fa';
    explanationDiv.style.border = '1px solid #e9ecef';
    explanationDiv.style.borderRadius = '5px';
    
    explanationDiv.innerHTML = `
        <h4 style="color: #6f802b;"><i class="fas fa-info-circle"></i> Comment fonctionne la logique en cascade</h4>
        <p>Dans cet exemple de <strong>Publicité</strong>, vous pouvez :</p>
        <ol>
            <li>Modifier directement un montant à n'importe quel niveau</li>
            <li>Ajouter ou supprimer des sous-catégories et des lignes</li>
            <li>Observer le calcul automatique lorsque des sous-niveaux existent</li>
        </ol>
        <p>Essayez maintenant de :</p>
        <ul>
            <li>Modifier le montant d'une ligne → La sous-catégorie correspondante sera mise à jour automatiquement</li>
            <li>Supprimer une sous-catégorie → La catégorie redeviendra modifiable directement</li>
            <li>Ajouter une nouvelle ligne → Les calculs se feront automatiquement</li>
        </ul>
        <p><strong>Conseil :</strong> Vous pouvez cliquer sur n'importe quel montant pour le modifier directement.</p>
    `;
    
    categoriesContainer.appendChild(explanationDiv);
}