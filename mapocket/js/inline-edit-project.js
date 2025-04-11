/**
 * inline-edit-project.js
 * Permet l'édition directe des catégories, sous-catégories et lignes de dépenses
 * dans la page projet-vue.html sans redirection vers une autre page.
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Initialisation de l\'édition directe dans projet-vue.html...');
    
    // Attendre que le DOM soit complètement chargé et que les données du projet soient disponibles
    setTimeout(initializeInlineEditing, 500);
});

/**
 * Initialise les fonctionnalités d'édition directe
 */
function initializeInlineEditing() {
    console.log('Configuration de l\'édition directe...');
    
    // Ajouter un bouton pour basculer en mode édition
    addEditModeToggle();
    
    // Ajouter les gestionnaires d'événements pour les actions d'édition
    // mais ils seront activés uniquement lorsque le mode édition sera actif
    setupEditEventHandlers();
}

/**
 * Ajoute un bouton pour basculer en mode édition
 */
function addEditModeToggle() {
    // Chercher différents sélecteurs possibles pour l'en-tête du projet
    const projectHeader = document.querySelector('.project-header') || 
                          document.querySelector('.project-head') ||
                          document.querySelector('.project-info') ||
                          document.querySelector('.project-actions') ||
                          document.querySelector('.btn-group') ||
                          document.querySelector('#modifyBtn')?.parentNode;
    
    if (!projectHeader) {
        // Si l'en-tête n'a pas été trouvée, créons un conteneur pour notre bouton
        console.log('Création d\'un conteneur pour le bouton d\'édition');
        const mainContent = document.querySelector('main') || document.querySelector('#main-content');
        
        if (mainContent) {
            const buttonContainer = document.createElement('div');
            buttonContainer.id = 'edit-button-container';
            buttonContainer.style.margin = '10px 0';
            buttonContainer.style.textAlign = 'right';
            
            // Insérer au début du contenu principal
            if (mainContent.firstChild) {
                mainContent.insertBefore(buttonContainer, mainContent.firstChild);
            } else {
                mainContent.appendChild(buttonContainer);
            }
            
            // Maintenant, ajoutons le bouton à ce conteneur
            const editToggleBtn = document.createElement('button');
            editToggleBtn.id = 'toggleEditMode';
            editToggleBtn.className = 'btn btn-primary';
            editToggleBtn.innerHTML = '<i class="fas fa-edit"></i> Modifier les lignes';
            
            buttonContainer.appendChild(editToggleBtn);
            
            // Gestionnaire d'événement pour le basculement du mode édition
            editToggleBtn.addEventListener('click', function() {
                const isEditMode = document.body.classList.contains('edit-mode');
                
                if (isEditMode) {
                    // Désactiver le mode édition
                    document.body.classList.remove('edit-mode');
                    this.innerHTML = '<i class="fas fa-edit"></i> Modifier les lignes';
                    disableEditMode();
                } else {
                    // Activer le mode édition
                    document.body.classList.add('edit-mode');
                    this.innerHTML = '<i class="fas fa-check"></i> Terminer l\'édition';
                    enableEditMode();
                }
            });
        } else {
            console.error('Impossible de trouver un conteneur pour ajouter le bouton d\'édition');
        }
    } else {
        // Si l'en-tête a été trouvée, ajoutons le bouton normalement
        const editToggleBtn = document.createElement('button');
        editToggleBtn.id = 'toggleEditMode';
        editToggleBtn.className = 'btn btn-primary';
        editToggleBtn.innerHTML = '<i class="fas fa-edit"></i> Modifier les lignes';
        editToggleBtn.style.marginLeft = '10px';
        
        // Ajouter le bouton à l'en-tête du projet
        projectHeader.appendChild(editToggleBtn);
        
        // Gestionnaire d'événement pour le basculement du mode édition
        editToggleBtn.addEventListener('click', function() {
            const isEditMode = document.body.classList.contains('edit-mode');
            
            if (isEditMode) {
                // Désactiver le mode édition
                document.body.classList.remove('edit-mode');
                this.innerHTML = '<i class="fas fa-edit"></i> Modifier les lignes';
                disableEditMode();
            } else {
                // Activer le mode édition
                document.body.classList.add('edit-mode');
                this.innerHTML = '<i class="fas fa-check"></i> Terminer l\'édition';
                enableEditMode();
            }
        });
    }
    
    // Ajouter des styles pour le mode édition
    addEditModeStyles();
}

/**
 * Ajoute les styles CSS nécessaires pour le mode édition
 */
function addEditModeStyles() {
    const styleEl = document.createElement('style');
    styleEl.textContent = `
        body.edit-mode .expense-line-name,
        body.edit-mode .expense-line-amount {
            border: 1px solid #ddd;
            padding: 5px;
            border-radius: 4px;
            background-color: #f9f9f9;
        }
        
        body.edit-mode .expense-line-name:focus,
        body.edit-mode .expense-line-amount:focus {
            border-color: #007bff;
            outline: none;
            box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
        }
        
        body.edit-mode .btn-add-line,
        body.edit-mode .btn-add-subcategory {
            display: inline-block;
        }
        
        body.edit-mode .btn-delete-line {
            display: inline-block;
            background: none;
            border: none;
            color: #dc3545;
            cursor: pointer;
            padding: 2px 5px;
        }
        
        .btn-add-line,
        .btn-add-subcategory,
        .btn-delete-line {
            display: none;
        }
        
        .btn-add-line,
        .btn-add-subcategory {
            background: none;
            border: 1px solid #28a745;
            color: #28a745;
            cursor: pointer;
            padding: 3px 10px;
            margin-top: 5px;
            margin-bottom: 10px;
            border-radius: 4px;
            font-size: 0.8em;
        }
    `;
    document.head.appendChild(styleEl);
}

/**
 * Configure les gestionnaires d'événements pour les éléments éditables
 */
function setupEditEventHandlers() {
    // Lorsqu'on clique sur le bouton "Ajouter une ligne"
    document.addEventListener('click', function(e) {
        // Vérifier si c'est un bouton d'ajout de ligne et si le mode édition est actif
        if (e.target.matches('.btn-add-line') && document.body.classList.contains('edit-mode')) {
            const subcategoryElement = e.target.closest('.expense-subcategory') || 
                                      e.target.closest('.subcategory');
            
            if (subcategoryElement) {
                addNewExpenseLine(subcategoryElement, e.target);
            }
        }
        
        // Vérifier si c'est un bouton d'ajout de sous-catégorie et si le mode édition est actif
        if (e.target.matches('.btn-add-subcategory') && document.body.classList.contains('edit-mode')) {
            const categoryElement = e.target.closest('.expense-category');
            
            if (categoryElement) {
                addNewSubcategory(categoryElement, e.target);
            }
        }
        
        // Vérifier si c'est un bouton de suppression de ligne et si le mode édition est actif
        if (e.target.matches('.btn-delete-line') && document.body.classList.contains('edit-mode')) {
            const lineElement = e.target.closest('.expense-line');
            
            if (lineElement && confirm('Voulez-vous vraiment supprimer cette ligne ?')) {
                lineElement.remove();
                recalculateAmounts();
                saveProjectChanges();
            }
        }
    });
}

/**
 * Active le mode édition pour toutes les lignes de dépenses
 */
function enableEditMode() {
    console.log('Activation du mode édition...');
    
    // Rendre les noms de lignes éditables
    document.querySelectorAll('.expense-line-name, .line-name').forEach(element => {
        makeNameEditable(element);
    });
    
    // Rendre les montants de lignes éditables
    document.querySelectorAll('.expense-line-amount, .line-amount').forEach(element => {
        makeAmountEditable(element);
    });
    
    // Ajouter des boutons "Ajouter une ligne" à chaque sous-catégorie
    document.querySelectorAll('.expense-subcategory, .subcategory').forEach(subcategory => {
        // Vérifier si le bouton existe déjà
        if (!subcategory.querySelector('.btn-add-line')) {
            const addButton = document.createElement('button');
            addButton.className = 'btn-add-line';
            addButton.innerHTML = '<i class="fas fa-plus"></i> Ajouter une ligne';
            subcategory.appendChild(addButton);
        }
    });
    
    // Ajouter des boutons "Ajouter une sous-catégorie" à chaque catégorie
    document.querySelectorAll('.expense-category').forEach(category => {
        // Vérifier si le bouton existe déjà
        if (!category.querySelector('.btn-add-subcategory')) {
            const addButton = document.createElement('button');
            addButton.className = 'btn-add-subcategory';
            addButton.innerHTML = '<i class="fas fa-plus"></i> Ajouter une sous-catégorie';
            category.appendChild(addButton);
        }
    });
    
    // Ajouter des boutons de suppression à chaque ligne
    document.querySelectorAll('.expense-line').forEach(line => {
        // Vérifier si le bouton existe déjà
        if (!line.querySelector('.btn-delete-line')) {
            const deleteButton = document.createElement('button');
            deleteButton.className = 'btn-delete-line';
            deleteButton.innerHTML = '<i class="fas fa-times"></i>';
            line.appendChild(deleteButton);
        }
    });
}

/**
 * Désactive le mode édition
 */
function disableEditMode() {
    console.log('Désactivation du mode édition...');
    
    // Convertir les champs de saisie en texte statique
    document.querySelectorAll('.expense-line-name.editable, .line-name.editable').forEach(input => {
        const value = input.value;
        const span = document.createElement('span');
        span.className = 'expense-line-name';
        span.textContent = value;
        input.parentNode.replaceChild(span, input);
    });
    
    document.querySelectorAll('.expense-line-amount.editable, .line-amount.editable').forEach(input => {
        const value = input.value;
        const span = document.createElement('span');
        span.className = 'expense-line-amount';
        span.textContent = formatCurrency(parseFloat(value) || 0);
        input.parentNode.replaceChild(span, input);
    });
    
    // Sauvegarder les changements une dernière fois
    recalculateAmounts();
    saveProjectChanges();
}

/**
 * Rend un élément de nom de ligne éditable
 */
function makeNameEditable(element) {
    // Si c'est déjà un champ de saisie, ne rien faire
    if (element.tagName === 'INPUT') return;
    
    const value = element.textContent.trim();
    const input = document.createElement('input');
    input.type = 'text';
    input.className = element.className + ' editable';
    input.value = value;
    
    // Gestionnaire pour mettre à jour les données lorsque la valeur change
    input.addEventListener('change', function() {
        saveProjectChanges();
    });
    
    // Remplacer l'élément statique par le champ de saisie
    element.parentNode.replaceChild(input, element);
}

/**
 * Rend un élément de montant de ligne éditable
 */
function makeAmountEditable(element) {
    // Si c'est déjà un champ de saisie, ne rien faire
    if (element.tagName === 'INPUT') return;
    
    // Extraire la valeur numérique (enlever la devise et le formatage)
    const numericValue = parseFloat(element.textContent.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
    
    const input = document.createElement('input');
    input.type = 'number';
    input.step = '0.01';
    input.min = '0';
    input.className = element.className + ' editable';
    input.value = numericValue.toFixed(2);
    
    // Gestionnaire pour recalculer les montants et sauvegarder
    input.addEventListener('input', function() {
        recalculateAmounts();
    });
    
    input.addEventListener('change', function() {
        saveProjectChanges();
    });
    
    // Remplacer l'élément statique par le champ de saisie
    element.parentNode.replaceChild(input, element);
}

/**
 * Ajoute une nouvelle ligne de dépense à une sous-catégorie
 */
function addNewExpenseLine(subcategoryElement, beforeElement) {
    // Créer une nouvelle ligne de dépense
    const newLine = document.createElement('div');
    newLine.className = 'expense-line';
    
    // Créer le champ de nom
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'expense-line-name editable';
    nameInput.placeholder = 'Nom de la dépense';
    
    // Gestionnaire pour sauvegarder les changements
    nameInput.addEventListener('change', function() {
        saveProjectChanges();
    });
    
    // Créer le champ de montant
    const amountInput = document.createElement('input');
    amountInput.type = 'number';
    amountInput.step = '0.01';
    amountInput.min = '0';
    amountInput.className = 'expense-line-amount editable';
    amountInput.value = '0.00';
    
    // Gestionnaires pour recalculer et sauvegarder
    amountInput.addEventListener('input', function() {
        recalculateAmounts();
    });
    
    amountInput.addEventListener('change', function() {
        saveProjectChanges();
    });
    
    // Créer le bouton de suppression
    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn-delete-line';
    deleteButton.innerHTML = '<i class="fas fa-times"></i>';
    
    // Assembler la ligne
    newLine.appendChild(nameInput);
    newLine.appendChild(amountInput);
    newLine.appendChild(deleteButton);
    
    // Insérer avant le bouton "Ajouter une ligne"
    subcategoryElement.insertBefore(newLine, beforeElement);
    
    // Recalculer les montants et sauvegarder
    recalculateAmounts();
    saveProjectChanges();
    
    // Donner le focus au champ de nom
    nameInput.focus();
}

/**
 * Ajoute une nouvelle sous-catégorie à une catégorie
 */
function addNewSubcategory(categoryElement, beforeElement) {
    // Demander le nom de la nouvelle sous-catégorie
    const subcategoryName = prompt('Nom de la nouvelle sous-catégorie:');
    if (!subcategoryName || subcategoryName.trim() === '') return;
    
    // Créer une nouvelle sous-catégorie
    const newSubcategory = document.createElement('div');
    newSubcategory.className = 'expense-subcategory';
    
    // Créer l'en-tête de la sous-catégorie
    const subcategoryHeader = document.createElement('h4');
    subcategoryHeader.innerHTML = subcategoryName + ' <span class="subcategory-amount">0,00 €</span>';
    
    // Créer le bouton "Ajouter une ligne"
    const addLineButton = document.createElement('button');
    addLineButton.className = 'btn-add-line';
    addLineButton.innerHTML = '<i class="fas fa-plus"></i> Ajouter une ligne';
    
    // Assembler la sous-catégorie
    newSubcategory.appendChild(subcategoryHeader);
    newSubcategory.appendChild(addLineButton);
    
    // Insérer avant le bouton "Ajouter une sous-catégorie"
    categoryElement.insertBefore(newSubcategory, beforeElement);
    
    // Mettre à jour le projet
    saveProjectChanges();
}

/**
 * Recalcule tous les montants (lignes → sous-catégories → catégories → total)
 */
function recalculateAmounts() {
    console.log('Recalcul des montants en cascade...');
    
    let totalBudget = 0;
    
    // Pour chaque catégorie
    document.querySelectorAll('.expense-category').forEach(category => {
        let categoryTotal = 0;
        
        // Pour chaque sous-catégorie dans cette catégorie
        category.querySelectorAll('.expense-subcategory, .subcategory').forEach(subcategory => {
            let subcategoryTotal = 0;
            
            // Pour chaque ligne dans cette sous-catégorie
            subcategory.querySelectorAll('.expense-line-amount, .line-amount').forEach(amountElement => {
                // Récupérer la valeur (différent selon qu'il s'agit d'un champ input ou d'un span)
                let value = 0;
                if (amountElement.tagName === 'INPUT') {
                    value = parseFloat(amountElement.value) || 0;
                } else {
                    value = parseFloat(amountElement.textContent.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
                }
                
                subcategoryTotal += value;
            });
            
            // Mettre à jour le montant de la sous-catégorie
            const subcategoryAmountElement = subcategory.querySelector('.subcategory-amount');
            if (subcategoryAmountElement) {
                subcategoryAmountElement.textContent = formatCurrency(subcategoryTotal);
            }
            
            categoryTotal += subcategoryTotal;
        });
        
        // Mettre à jour le montant de la catégorie
        const categoryAmountElement = category.querySelector('.category-amount');
        if (categoryAmountElement) {
            categoryAmountElement.textContent = formatCurrency(categoryTotal);
        }
        
        totalBudget += categoryTotal;
    });
    
    // Mettre à jour le budget total du projet
    const totalBudgetElement = document.getElementById('totalBudget') || 
                               document.querySelector('.budget-total-amount');
    if (totalBudgetElement) {
        totalBudgetElement.textContent = formatCurrency(totalBudget);
    }
    
    console.log('Nouveau total du budget:', formatCurrency(totalBudget));
}

/**
 * Formate un montant avec le symbole de devise et séparateur de milliers
 */
function formatAmount(amount) {
  return amount.toFixed(2).replace('.', ',');
}

function formatCurrency(amount) {
    // Récupérer le symbole de devise du projet actuel
    let currencySymbol = '€';
    
    try {
        const currentProject = JSON.parse(localStorage.getItem('currentProject'));
        if (currentProject && currentProject.currencySymbol) {
            currencySymbol = currentProject.currencySymbol;
        }
    } catch (error) {
        console.warn('Erreur lors de la récupération du symbole de devise:', error);
    }
    
    // Formatage du montant en utilisant la fonction formatAmount
    return currencySymbol + ' ' + formatAmount(amount);
}

/**
 * Sauvegarde les modifications du projet dans le localStorage
 */
function saveProjectChanges() {
    console.log('Sauvegarde des modifications du projet...');
    
    // Récupérer l'ID du projet actuel
    const projectId = localStorage.getItem('viewProjectId') || 
                     localStorage.getItem('projectInEditing');
    
    if (!projectId) {
        console.error('ID du projet non trouvé pour la sauvegarde');
        return;
    }
    
    // Récupérer tous les projets
    let allProjects = [];
    try {
        allProjects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
    } catch (error) {
        console.error('Erreur lors de la récupération des projets:', error);
        return;
    }
    
    // Trouver le projet à modifier
    const projectIndex = allProjects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) {
        console.error('Projet non trouvé dans la liste pour la sauvegarde');
        return;
    }
    
    // Récupérer le projet actuel
    const project = allProjects[projectIndex];
    
    // Mettre à jour le projet avec les nouvelles données
    project.categories = collectCategoriesData();
    
    // Calculer et mettre à jour le budget total
    let totalBudget = 0;
    project.categories.forEach(category => {
        totalBudget += parseFloat(category.amount.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
    });
    
    // Mettre à jour le budget total du projet
    project.totalBudget = formatCurrency(totalBudget);
    
    // Mettre à jour le projet dans la liste
    allProjects[projectIndex] = project;
    
    // Sauvegarder la liste mise à jour
    localStorage.setItem('savedProjects', JSON.stringify(allProjects));
    
    // Mettre à jour également le projet courant
    localStorage.setItem('currentProject', JSON.stringify(project));
    
    console.log('Projet sauvegardé avec succès');
    
    // Afficher une notification si la fonction existe
    if (typeof showNotification === 'function') {
        showNotification('Projet sauvegardé', 'success');
    }
}

/**
 * Collecte les données des catégories à partir du DOM
 */
function collectCategoriesData() {
    const categories = [];
    
    document.querySelectorAll('.expense-category').forEach(categoryElement => {
        const categoryNameElement = categoryElement.querySelector('h3');
        if (!categoryNameElement) return;
        
        const categoryName = categoryNameElement.childNodes[0].textContent.trim();
        const categoryAmountElement = categoryElement.querySelector('.category-amount');
        const categoryAmount = categoryAmountElement ? categoryAmountElement.textContent : '0,00 €';
        
        const subcategories = [];
        
        categoryElement.querySelectorAll('.expense-subcategory, .subcategory').forEach(subcategoryElement => {
            const subcategoryNameElement = subcategoryElement.querySelector('h4');
            if (!subcategoryNameElement) return;
            
            const subcategoryName = subcategoryNameElement.childNodes[0].textContent.trim();
            const subcategoryAmountElement = subcategoryElement.querySelector('.subcategory-amount');
            const subcategoryAmount = subcategoryAmountElement ? subcategoryAmountElement.textContent : '0,00 €';
            
            const lines = [];
            
            subcategoryElement.querySelectorAll('.expense-line').forEach(lineElement => {
                const lineNameElement = lineElement.querySelector('.expense-line-name, .line-name');
                const lineAmountElement = lineElement.querySelector('.expense-line-amount, .line-amount');
                
                if (!lineNameElement || !lineAmountElement) return;
                
                // Récupérer les valeurs (différent selon qu'il s'agit d'un champ input ou d'un span)
                let lineName, lineAmount;
                
                if (lineNameElement.tagName === 'INPUT') {
                    lineName = lineNameElement.value;
                } else {
                    lineName = lineNameElement.textContent;
                }
                
                if (lineAmountElement.tagName === 'INPUT') {
                    const numericAmount = parseFloat(lineAmountElement.value) || 0;
                    lineAmount = formatCurrency(numericAmount);
                } else {
                    lineAmount = lineAmountElement.textContent;
                }
                
                lines.push({
                    name: lineName,
                    amount: lineAmount
                });
            });
            
            subcategories.push({
                name: subcategoryName,
                amount: subcategoryAmount,
                lines: lines
            });
        });
        
        categories.push({
            name: categoryName,
            amount: categoryAmount,
            subcategories: subcategories
        });
    });
    
    return categories;
}

// Initialiser l'édition directe une fois que la page est chargée
document.addEventListener('DOMContentLoaded', initializeInlineEditing);