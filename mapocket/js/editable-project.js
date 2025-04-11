/**
 * editable-project.js
 * Fonctions permettant de rendre les projets modifiables directement dans la fiche de résumé
 * Élimine le besoin d'un écran séparé de modification
 */

// Activer l'édition directe dans la vue projet
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initialisation du mode édition directe des lignes...');
    
    // Remplacer la fonction loadCategories standard par notre version éditable
    // Cette fonction sera appelée par project-detail.js
    initializeEditableCategories();
    
    // Ajouter un bouton pour basculer entre mode vue et édition directe
    addToggleEditButton();
});

// Fonction pour recalculer tous les montants du projet (cascade)
function recalculateProjectAmounts() {
    console.log('Recalcul des montants du projet...');
    
    // Récupérer le projet actuel
    const project = window.currentProject;
    if (!project) return;
    
    // Parcourir chaque catégorie
    if (project.categories && Array.isArray(project.categories)) {
        project.categories.forEach(category => {
            // Réinitialiser le montant de la catégorie
            let categoryTotal = 0;
            
            // Parcourir chaque sous-catégorie
            if (category.subcategories && Array.isArray(category.subcategories)) {
                category.subcategories.forEach(subcategory => {
                    // Réinitialiser le montant de la sous-catégorie
                    let subcategoryTotal = 0;
                    
                    // Parcourir chaque ligne
                    if (subcategory.lines && Array.isArray(subcategory.lines)) {
                        subcategory.lines.forEach(line => {
                            // Convertir le montant de la ligne en nombre (éventuellement avec une devise)
                            let lineAmount = 0;
                            if (typeof line.amount === 'string') {
                                // Extraire juste le nombre de la chaîne (ignorer la devise)
                                const matches = line.amount.match(/[\d,.]+/);
                                if (matches) {
                                    lineAmount = parseFloat(matches[0].replace(/,/g, '.'));
                                }
                            } else if (typeof line.amount === 'number') {
                                lineAmount = line.amount;
                            }
                            
                            // Ajouter au total de la sous-catégorie
                            subcategoryTotal += lineAmount || 0;
                        });
                    }
                    
                    // Mettre à jour le montant de la sous-catégorie (avec formatage)
                    subcategory.amount = formatCurrency(subcategoryTotal);
                    
                    // Ajouter au total de la catégorie
                    categoryTotal += subcategoryTotal;
                });
            }
            
            // Mettre à jour le montant de la catégorie (avec formatage)
            category.amount = formatCurrency(categoryTotal);
        });
        
        // Calculer le budget total du projet (somme des catégories)
        let totalBudget = 0;
        project.categories.forEach(category => {
            if (typeof category.amount === 'string') {
                const matches = category.amount.match(/[\d,.]+/);
                if (matches) {
                    totalBudget += parseFloat(matches[0].replace(/,/g, '.'));
                }
            } else if (typeof category.amount === 'number') {
                totalBudget += category.amount;
            }
        });
        
        // Mettre à jour le budget total du projet (avec formatage)
        project.totalBudget = formatCurrency(totalBudget);
    }
    
    // Mettre à jour l'interface utilisateur si nécessaire
    updateProjectUI(project);
    
    console.log('Recalcul terminé. Nouveau budget total:', project.totalBudget);
}

// Fonction pour collecter les données du DOM et sauvegarder le projet
function collectAndSaveProjectData() {
    console.log('Collecte et sauvegarde des données du projet...');
    
    // Récupérer le projet actuel
    const project = window.currentProject;
    if (!project) {
        console.warn('Aucun projet actif à sauvegarder');
        return;
    }
    
    try {
        // Vérifier si la fonction saveProjectChanges existe
        if (typeof saveProjectChanges === 'function') {
            // Sauvegarder directement le projet (les modifications sont déjà appliquées via les refs)
            saveProjectChanges(project);
            console.log('Projet sauvegardé avec succès');
        } else {
            // Implémentation de sauvegarde alternative si saveProjectChanges n'est pas disponible
            console.log('Implémentation de saveProjectChanges non trouvée, utilisation de la méthode alternative');
            // Récupérer les projets existants
            let projects = [];
            try {
                projects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
            } catch (e) {
                console.error('Erreur lors de la lecture des projets:', e);
                projects = [];
            }
            
            // Trouver et mettre à jour le projet
            const index = projects.findIndex(p => p.id === project.id);
            if (index >= 0) {
                projects[index] = project;
                localStorage.setItem('savedProjects', JSON.stringify(projects));
                console.log('Projet sauvegardé avec méthode alternative');
                
                // Afficher une notification de confirmation
                if (typeof showNotification === 'function') {
                    showNotification('Projet sauvegardé', 'success');
                }
            } else {
                console.error('Projet non trouvé dans la liste des projets sauvegardés');
            }
        }
    } catch (error) {
        console.error('Erreur lors de la sauvegarde du projet:', error);
        if (typeof showNotification === 'function') {
            showNotification('Erreur lors de la sauvegarde', 'error');
        }
    }
}

// Mise à jour de la fonction createCategoryElement pour rendre les champs éditables
function createEditableCategoryElement(category) {
    const categoryElement = document.createElement('div');
    categoryElement.className = 'expense-category';
    
    // Créer l'en-tête de la catégorie
    const categoryHeader = document.createElement('div');
    categoryHeader.className = 'category-header';
    
    // Nom de la catégorie (éditable)
    const categoryName = document.createElement('input');
    categoryName.type = 'text';
    categoryName.className = 'category-name editable';
    categoryName.value = category.name;
    categoryName.addEventListener('change', function() {
        category.name = this.value;
        collectAndSaveProjectData();
    });
    
    // Montant de la catégorie (calculé automatiquement)
    const categoryAmount = document.createElement('span');
    categoryAmount.className = 'category-amount';
    categoryAmount.textContent = category.amount;
    
    // Assembler l'en-tête de la catégorie
    categoryHeader.appendChild(categoryName);
    categoryHeader.appendChild(categoryAmount);
    
    // Bouton pour supprimer la catégorie
    const deleteCategoryBtn = document.createElement('button');
    deleteCategoryBtn.className = 'btn-delete-category';
    deleteCategoryBtn.innerHTML = '<i class="fas fa-trash"></i>';
    deleteCategoryBtn.addEventListener('click', function() {
        if (confirm('Voulez-vous vraiment supprimer cette catégorie et toutes ses sous-catégories ?')) {
            categoryElement.remove();
            recalculateProjectAmounts();
            collectAndSaveProjectData();
        }
    });
    
    // Ajouter le bouton de suppression à l'en-tête
    categoryHeader.appendChild(deleteCategoryBtn);
    
    // Conteneur pour les sous-catégories
    const subcategoriesContainer = document.createElement('div');
    subcategoriesContainer.className = 'subcategories-container';
    
    // Ajouter les sous-catégories
    if (category.subcategories && Array.isArray(category.subcategories)) {
        category.subcategories.forEach(subcategory => {
            const subcategoryElement = createEditableSubcategoryElement(subcategory);
            subcategoriesContainer.appendChild(subcategoryElement);
        });
    }
    
    // Bouton pour ajouter une sous-catégorie
    const addSubcategoryBtn = document.createElement('button');
    addSubcategoryBtn.className = 'btn-add-subcategory';
    addSubcategoryBtn.innerHTML = '<i class="fas fa-plus"></i> Ajouter une sous-catégorie';
    addSubcategoryBtn.addEventListener('click', function() {
        const subcategoryName = prompt('Nom de la nouvelle sous-catégorie:');
        if (subcategoryName && subcategoryName.trim() !== '') {
            const newSubcategory = {
                name: subcategoryName,
                amount: formatCurrency(0),
                lines: []
            };
            
            // Ajouter la sous-catégorie à l'objet category
            if (!category.subcategories) {
                category.subcategories = [];
            }
            category.subcategories.push(newSubcategory);
            
            // Créer l'élément dans le DOM
            const subcategoryElement = createEditableSubcategoryElement(newSubcategory);
            subcategoriesContainer.appendChild(subcategoryElement);
            
            // Recalculer les totaux et sauvegarder
            recalculateProjectAmounts();
            collectAndSaveProjectData();
        }
    });
    
    // Assembler la catégorie
    categoryElement.appendChild(categoryHeader);
    categoryElement.appendChild(subcategoriesContainer);
    categoryElement.appendChild(addSubcategoryBtn);
    
    return categoryElement;
}

// Fonction pour créer un élément de sous-catégorie éditable
function createEditableSubcategoryElement(subcategory) {
    const subcategoryElement = document.createElement('div');
    subcategoryElement.className = 'expense-subcategory';
    
    // Créer l'en-tête de la sous-catégorie
    const subcategoryHeader = document.createElement('div');
    subcategoryHeader.className = 'subcategory-header';
    
    // Nom de la sous-catégorie (éditable)
    const subcategoryName = document.createElement('input');
    subcategoryName.type = 'text';
    subcategoryName.className = 'subcategory-name editable';
    subcategoryName.value = subcategory.name;
    subcategoryName.addEventListener('change', function() {
        subcategory.name = this.value;
        collectAndSaveProjectData();
    });
    
    // Montant de la sous-catégorie (calculé automatiquement)
    const subcategoryAmount = document.createElement('span');
    subcategoryAmount.className = 'subcategory-amount';
    subcategoryAmount.textContent = subcategory.amount;
    
    // Assembler l'en-tête de la sous-catégorie
    subcategoryHeader.appendChild(subcategoryName);
    subcategoryHeader.appendChild(subcategoryAmount);
    
    // Bouton pour supprimer la sous-catégorie
    const deleteSubcategoryBtn = document.createElement('button');
    deleteSubcategoryBtn.className = 'btn-delete-subcategory';
    deleteSubcategoryBtn.innerHTML = '<i class="fas fa-trash"></i>';
    deleteSubcategoryBtn.addEventListener('click', function() {
        if (confirm('Voulez-vous vraiment supprimer cette sous-catégorie et toutes ses lignes ?')) {
            subcategoryElement.remove();
            recalculateProjectAmounts();
            collectAndSaveProjectData();
        }
    });
    
    // Ajouter le bouton de suppression à l'en-tête
    subcategoryHeader.appendChild(deleteSubcategoryBtn);
    
    // Conteneur pour les lignes de dépenses
    const expenseLinesContainer = document.createElement('div');
    expenseLinesContainer.className = 'expense-lines-container';
    
    // Ajouter les lignes de dépenses
    if (subcategory.lines && Array.isArray(subcategory.lines)) {
        subcategory.lines.forEach(line => {
            const lineElement = createEditableExpenseLineElement(line);
            expenseLinesContainer.appendChild(lineElement);
        });
    }
    
    // Bouton pour ajouter une ligne de dépense
    const addLineBtn = document.createElement('button');
    addLineBtn.className = 'btn-add-expense-line';
    addLineBtn.innerHTML = '<i class="fas fa-plus"></i> Ajouter une ligne';
    addLineBtn.addEventListener('click', function() {
        const lineName = prompt('Nom de la nouvelle ligne de dépense:');
        if (lineName && lineName.trim() !== '') {
            const newLine = {
                name: lineName,
                amount: 0
            };
            
            // Ajouter la ligne à l'objet subcategory
            if (!subcategory.lines) {
                subcategory.lines = [];
            }
            subcategory.lines.push(newLine);
            
            // Créer l'élément dans le DOM
            const lineElement = createEditableExpenseLineElement(newLine);
            expenseLinesContainer.appendChild(lineElement);
            
            // Recalculer les totaux et sauvegarder
            recalculateProjectAmounts();
            collectAndSaveProjectData();
        }
    });
    
    // Assembler la sous-catégorie
    subcategoryElement.appendChild(subcategoryHeader);
    subcategoryElement.appendChild(expenseLinesContainer);
    subcategoryElement.appendChild(addLineBtn);
    
    return subcategoryElement;
}

// Fonction pour créer un élément de ligne de dépense éditable
function createEditableExpenseLineElement(line) {
    const lineElement = document.createElement('div');
    lineElement.className = 'expense-line';
    
    // Nom de la ligne (champ éditable)
    const lineName = document.createElement('input');
    lineName.type = 'text';
    lineName.className = 'expense-line-name editable';
    lineName.value = line.name;
    lineName.addEventListener('change', function() {
        // Mettre à jour le nom de la ligne
        line.name = this.value;
        
        // Sauvegarder les modifications
        collectAndSaveProjectData();
    });
    
    // Montant de la ligne (champ éditable)
    const lineAmount = document.createElement('input');
    lineAmount.type = 'text';
    lineAmount.className = 'expense-line-amount editable';
    lineAmount.value = typeof line.amount === 'string' ? 
        line.amount.toString().replace(/[^\d.,]/g, '') : 
        (line.amount || 0).toString();
    
    // Formater le montant à la perte de focus
    lineAmount.addEventListener('blur', function() {
        // Convertir le montant en nombre
        const amount = parseFloat(this.value.replace(/,/g, '.')) || 0;
        
        // Formater et mettre à jour le champ
        this.value = amount.toFixed(2);
        
        // Mettre à jour le montant de la ligne
        line.amount = amount;
        
        // Recalculer les totaux
        recalculateProjectAmounts();
        
        // Sauvegarder les modifications
        collectAndSaveProjectData();
    });
    
    // Validation des entrées pour n'accepter que des nombres
    lineAmount.addEventListener('input', function() {
        this.value = this.value.replace(/[^\d.,]/g, '');
    });
    
    // Recalculer quand on quitte le champ avec la touche Entrée
    lineAmount.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            this.blur(); // Déclenche l'événement blur
        }
    });
    
    // Bouton pour supprimer la ligne
    const deleteLineBtn = document.createElement('button');
    deleteLineBtn.className = 'btn-delete-expense-line';
    deleteLineBtn.innerHTML = '<i class="fas fa-times"></i>';
    deleteLineBtn.addEventListener('click', function() {
        if (confirm('Voulez-vous vraiment supprimer cette ligne de dépense ?')) {
            lineElement.remove();
            
            // Mettre à jour les totaux
            recalculateProjectAmounts();
            
            // Sauvegarder les modifications
            collectAndSaveProjectData();
        }
    });
    
    // Assembler la ligne
    lineElement.appendChild(lineName);
    lineElement.appendChild(lineAmount);
    lineElement.appendChild(deleteLineBtn);
    
    return lineElement;
}

// Fonction pour remplacer la fonction loadCategories d'origine par notre version éditable
function initializeEditableCategories() {
    console.log('Initialisation des catégories éditables...');
    
    // Remplacer la fonction loadCategories pour utiliser notre version éditable
    window.loadCategories = function(project) {
        if (!project || !project.categories || !Array.isArray(project.categories)) {
            console.error('Données de catégories invalides');
            return;
        }
        
        console.log('Chargement des catégories éditables:', project.categories.length);
        
        // Récupérer le conteneur des catégories (essayer les deux IDs possibles)
        let categoriesContainer = document.getElementById('categoriesContainer');
        if (!categoriesContainer) {
            // Essayer l'autre ID possible
            categoriesContainer = document.getElementById('categoryList');
            if (!categoriesContainer) {
                console.error('Conteneur de catégories non trouvé');
                return;
            }
        }
        
        // Vider le conteneur
        categoriesContainer.innerHTML = '';
        
        // Pas de catégories
        if (project.categories.length === 0) {
            categoriesContainer.innerHTML = '<div class="empty-message">Aucune catégorie n\'a été définie pour ce projet.</div>';
            return;
        }
        
        // Ajouter chaque catégorie avec notre fonction éditable
        project.categories.forEach(category => {
            const categoryElement = createEditableCategoryElement(category);
            categoriesContainer.appendChild(categoryElement);
        });
        
        // Ajouter un bouton pour ajouter une nouvelle catégorie
        const addCategoryBtn = document.createElement('button');
        addCategoryBtn.className = 'btn btn-primary btn-add-category';
        addCategoryBtn.innerHTML = '<i class="fas fa-plus"></i> Ajouter une catégorie';
        addCategoryBtn.addEventListener('click', function() {
            const categoryName = prompt('Nom de la nouvelle catégorie:');
            if (categoryName && categoryName.trim() !== '') {
                const newCategory = {
                    name: categoryName,
                    amount: formatCurrency(0),
                    subcategories: []
                };
                
                // Ajouter la catégorie au projet
                project.categories.push(newCategory);
                
                // Créer l'élément dans le DOM
                const categoryElement = createEditableCategoryElement(newCategory);
                categoriesContainer.appendChild(categoryElement);
                
                // Recalculer les totaux et sauvegarder
                recalculateProjectAmounts();
                collectAndSaveProjectData();
            }
        });
        
        categoriesContainer.appendChild(addCategoryBtn);
    };
    
    // Si un projet est déjà chargé, refaire le rendu avec notre nouvelle version
    if (window.currentProject) {
        window.loadCategories(window.currentProject);
    }
}

// Fonction pour ajouter un bouton permettant de basculer entre le mode édition et le mode vue
function addToggleEditButton() {
    console.log('Ajout du bouton pour basculer en mode édition...');
    
    // Rechercher un endroit approprié pour ajouter le bouton
    const projectHeader = document.querySelector('.project-header');
    const actionsContainer = document.querySelector('.project-actions');
    
    if (!projectHeader && !actionsContainer) {
        console.error('Impossible de trouver un conteneur pour le bouton d\'édition');
        return;
    }
    
    // Créer le bouton
    const toggleEditButton = document.createElement('button');
    toggleEditButton.id = 'toggleEditMode';
    toggleEditButton.className = 'btn btn-primary edit-mode-toggle';
    toggleEditButton.innerHTML = '<i class="fas fa-edit"></i> Mode édition';
    
    // Style du bouton
    toggleEditButton.style.marginLeft = '10px';
    
    // Ajouter l'événement de basculement
    toggleEditButton.addEventListener('click', function() {
        const isEditMode = this.classList.contains('active');
        
        if (isEditMode) {
            // Désactiver le mode édition
            this.classList.remove('active');
            this.innerHTML = '<i class="fas fa-edit"></i> Mode édition';
            document.body.classList.remove('edit-mode');
            
            // Recalculer et sauvegarder avant de quitter le mode édition
            recalculateProjectAmounts();
            collectAndSaveProjectData();
        } else {
            // Activer le mode édition
            this.classList.add('active');
            this.innerHTML = '<i class="fas fa-check"></i> Terminer l\'édition';
            document.body.classList.add('edit-mode');
            
            // Rendre les éléments éditables
            makeElementsEditable();
        }
    });
    
    // Ajouter le bouton à l'interface
    if (actionsContainer) {
        actionsContainer.appendChild(toggleEditButton);
    } else if (projectHeader) {
        projectHeader.appendChild(toggleEditButton);
    }
}

// Fonction simplifiée pour rendre une catégorie existante éditable
function makeElementsEditable() {
    console.log('Rendant les éléments éditables...');
    
    // S'assurer que nous avons un projet
    if (!window.currentProject) {
        console.warn('Aucun projet actif');
        return false;
    }
    
    // 1. Ajouter des styles CSS pour les champs éditables
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .editable {
            border: 1px solid #ddd;
            padding: 5px;
            border-radius: 4px;
            background-color: #f9f9f9;
            font-size: inherit;
            font-family: inherit;
            min-width: 80px;
        }
        .editable:focus {
            border-color: #007bff;
            outline: none;
            box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
        }
        .expense-line {
            display: flex;
            align-items: center;
            margin-bottom: 5px;
        }
        .expense-line-name {
            flex: 2;
            margin-right: 10px;
        }
        .expense-line-amount {
            flex: 1;
            text-align: right;
            margin-right: 10px;
        }
        .btn-delete-expense-line {
            background: none;
            border: none;
            color: #dc3545;
            cursor: pointer;
            padding: 2px 5px;
        }
        .btn-add-expense-line {
            background: none;
            border: 1px solid #28a745;
            color: #28a745;
            cursor: pointer;
            padding: 3px 10px;
            margin-top: 5px;
            border-radius: 4px;
            font-size: 0.8em;
        }
    `;
    document.head.appendChild(styleElement);
    
    // 2. Trouver toutes les lignes de dépenses et les rendre éditables
    const expenseLines = document.querySelectorAll('.expense-line');
    expenseLines.forEach(line => {
        // Remplacer le nom de la ligne par un champ éditable
        const nameSpan = line.querySelector('.expense-line-name');
        if (nameSpan) {
            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.className = 'expense-line-name editable';
            nameInput.value = nameSpan.textContent;
            
            // Ajouter l'événement de mise à jour
            nameInput.addEventListener('change', function() {
                // Trouver la référence dans le modèle de données et mettre à jour
                const categoryName = line.closest('.expense-category').querySelector('.category-name').textContent;
                const subcategoryName = line.closest('.expense-subcategory').querySelector('.subcategory-name').textContent;
                const oldLineName = nameSpan.textContent;
                
                // Mettre à jour dans le modèle
                const category = window.currentProject.categories.find(c => c.name === categoryName);
                if (category) {
                    const subcategory = category.subcategories.find(s => s.name === subcategoryName);
                    if (subcategory) {
                        const expenseLine = subcategory.lines.find(l => l.name === oldLineName);
                        if (expenseLine) {
                            expenseLine.name = this.value;
                            
                            // Sauvegarder les changements
                            saveProjectChanges(window.currentProject);
                        }
                    }
                }
            });
            
            // Remplacer l'élément
            nameSpan.parentNode.replaceChild(nameInput, nameSpan);
        }
        
        // Remplacer le montant de la ligne par un champ éditable
        const amountSpan = line.querySelector('.expense-line-amount');
        if (amountSpan) {
            const amountInput = document.createElement('input');
            amountInput.type = 'text';
            amountInput.className = 'expense-line-amount editable';
            amountInput.value = amountSpan.textContent.replace(/[^\d.,]/g, '');
            
            // Ajouter l'événement de mise à jour
            amountInput.addEventListener('blur', function() {
                // Convertir en nombre
                const amount = parseFloat(this.value.replace(/,/g, '.')) || 0;
                this.value = amount.toFixed(2);
                
                // Trouver la référence dans le modèle de données et mettre à jour
                const categoryName = line.closest('.expense-category').querySelector('.category-name').textContent;
                const subcategoryName = line.closest('.expense-subcategory').querySelector('.subcategory-name').textContent;
                const lineName = line.querySelector('.expense-line-name').value;
                
                // Mettre à jour dans le modèle
                const category = window.currentProject.categories.find(c => c.name === categoryName);
                if (category) {
                    const subcategory = category.subcategories.find(s => s.name === subcategoryName);
                    if (subcategory) {
                        const expenseLine = subcategory.lines.find(l => l.name === lineName);
                        if (expenseLine) {
                            expenseLine.amount = amount;
                            
                            // Recalculer tous les montants
                            recalculateAmounts();
                            
                            // Sauvegarder les changements
                            saveProjectChanges(window.currentProject);
                        }
                    }
                }
            });
            
            // Validation pour n'accepter que des nombres
            amountInput.addEventListener('input', function() {
                this.value = this.value.replace(/[^\d.,]/g, '');
            });
            
            // Récalculer à l'entrée
            amountInput.addEventListener('keyup', function(e) {
                if (e.key === 'Enter') {
                    this.blur();
                }
            });
            
            // Remplacer l'élément
            amountSpan.parentNode.replaceChild(amountInput, amountSpan);
        }
    });
    
    // 3. Ajouter la possibilité d'ajouter de nouvelles lignes
    const subcategories = document.querySelectorAll('.expense-subcategory');
    subcategories.forEach(subcategory => {
        const expenseLinesContainer = subcategory.querySelector('.expense-lines-container');
        if (!expenseLinesContainer) return;
        
        // Bouton d'ajout de ligne
        if (!subcategory.querySelector('.btn-add-expense-line')) {
            const addLineBtn = document.createElement('button');
            addLineBtn.className = 'btn-add-expense-line';
            addLineBtn.innerHTML = '<i class="fas fa-plus"></i> Ajouter une ligne';
            addLineBtn.addEventListener('click', function() {
                // Trouver la référence dans le modèle
                const categoryName = subcategory.closest('.expense-category').querySelector('.category-name').textContent;
                const subcategoryName = subcategory.querySelector('.subcategory-name').textContent;
                
                // Demander le nom de la nouvelle ligne
                const lineName = prompt('Nom de la nouvelle ligne de dépense:');
                if (!lineName || lineName.trim() === '') return;
                
                // Créer une nouvelle ligne dans l'interface
                const newLine = document.createElement('div');
                newLine.className = 'expense-line';
                
                // Nom de la ligne
                const nameInput = document.createElement('input');
                nameInput.type = 'text';
                nameInput.className = 'expense-line-name editable';
                nameInput.value = lineName;
                
                // Montant de la ligne
                const amountInput = document.createElement('input');
                amountInput.type = 'text';
                amountInput.className = 'expense-line-amount editable';
                amountInput.value = '0.00';
                
                // Bouton de suppression
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'btn-delete-expense-line';
                deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
                
                // Assembler la ligne
                newLine.appendChild(nameInput);
                newLine.appendChild(amountInput);
                newLine.appendChild(deleteBtn);
                
                // Ajouter au conteneur
                expenseLinesContainer.appendChild(newLine);
                
                // Ajouter dans le modèle de données
                const category = window.currentProject.categories.find(c => c.name === categoryName);
                if (category) {
                    const subcat = category.subcategories.find(s => s.name === subcategoryName);
                    if (subcat) {
                        if (!subcat.lines) subcat.lines = [];
                        subcat.lines.push({ name: lineName, amount: 0 });
                        
                        // Recalculer les montants et sauvegarder
                        recalculateAmounts();
                        saveProjectChanges(window.currentProject);
                    }
                }
                
                // Configurer les événements de la nouvelle ligne
                configureLineEvents(newLine);
            });
            
            subcategory.appendChild(addLineBtn);
        }
    });
    
    // 4. Configurer la suppression de lignes existantes
    const deleteButtons = document.querySelectorAll('.btn-delete-expense-line');
    deleteButtons.forEach(btn => {
        // S'assurer de ne pas dupliquer les événements
        btn.replaceWith(btn.cloneNode(true));
        const newBtn = btn.parentNode.querySelector('.btn-delete-expense-line');
        
        newBtn.addEventListener('click', function() {
            if (!confirm('Voulez-vous vraiment supprimer cette ligne de dépense ?')) return;
            
            const line = this.closest('.expense-line');
            const lineName = line.querySelector('.expense-line-name').value;
            const categoryName = line.closest('.expense-category').querySelector('.category-name').textContent;
            const subcategoryName = line.closest('.expense-subcategory').querySelector('.subcategory-name').textContent;
            
            // Supprimer du DOM
            line.remove();
            
            // Supprimer du modèle
            const category = window.currentProject.categories.find(c => c.name === categoryName);
            if (category) {
                const subcategory = category.subcategories.find(s => s.name === subcategoryName);
                if (subcategory && subcategory.lines) {
                    const lineIndex = subcategory.lines.findIndex(l => l.name === lineName);
                    if (lineIndex >= 0) {
                        subcategory.lines.splice(lineIndex, 1);
                        
                        // Recalculer les montants et sauvegarder
                        recalculateAmounts();
                        saveProjectChanges(window.currentProject);
                    }
                }
            }
        });
    });
    

    
    console.log('Éléments rendus éditables');
    return true;
}

// Fonction pour configurer les événements d'une ligne de dépense
function configureLineEvents(line) {
    if (!line) {
        console.error('Ligne invalide pour la configuration des événements');
        return;
    }
    
    console.log('Configuration des événements pour une ligne:', line);
    
    const nameInput = line.querySelector('.expense-line-name');
    const amountInput = line.querySelector('.expense-line-amount');
    const deleteBtn = line.querySelector('.btn-delete-expense-line');
    
    if (nameInput) {
        // S'assurer que nous n'ajoutons pas de gestionnaires d'événements en double
        const newNameInput = nameInput.cloneNode(true);
        nameInput.parentNode.replaceChild(newNameInput, nameInput);
        
        newNameInput.addEventListener('change', function() {
            console.log('Modification du nom de la ligne:', this.value);
            // Trouver la référence dans le modèle de données
            const categoryElement = line.closest('.expense-category');
            const subcategoryElement = line.closest('.expense-subcategory');
            
            if (!categoryElement || !subcategoryElement) {
                console.error('Impossible de trouver les éléments parents');
                return;
            }
            
            const categoryNameElement = categoryElement.querySelector('.category-name');
            const subcategoryNameElement = subcategoryElement.querySelector('.subcategory-name');
            
            if (!categoryNameElement || !subcategoryNameElement) {
                console.error('Éléments de nom de catégorie/sous-catégorie non trouvés');
                return;
            }
            
            const categoryName = categoryNameElement.value || categoryNameElement.textContent;
            const subcategoryName = subcategoryNameElement.value || subcategoryNameElement.textContent;
            const oldLineName = line.dataset.oldName || '';
            
            console.log('Catégorie:', categoryName, 'Sous-catégorie:', subcategoryName, 'Ancien nom:', oldLineName);
            
            // Stocker le nouveau nom pour les futures références
            line.dataset.oldName = this.value;
            
            // Mise à jour du modèle
            if (!window.currentProject) {
                console.error('Projet actuel non disponible');
                return;
            }
            
            const category = window.currentProject.categories.find(c => 
                c.name === categoryName || (typeof c.name === 'object' && c.name.value === categoryName));
                
            if (category) {
                const subcategory = category.subcategories.find(s => 
                    s.name === subcategoryName || (typeof s.name === 'object' && s.name.value === subcategoryName));
                    
                if (subcategory) {
                    // Trouver la ligne par son ancien nom
                    const lineIndex = subcategory.lines.findIndex(l => 
                        l.name === oldLineName || (oldLineName === '' && l.name === this.value));
                        
                    if (lineIndex >= 0) {
                        console.log('Ligne trouvée, mise à jour du nom:', this.value);
                        subcategory.lines[lineIndex].name = this.value;
                        
                        // Sauvegarder les modifications
                        collectAndSaveProjectData();
                    } else {
                        console.warn('Ligne non trouvée dans le modèle avec le nom:', oldLineName);
                    }
                } else {
                    console.warn('Sous-catégorie non trouvée:', subcategoryName);
                }
            } else {
                console.warn('Catégorie non trouvée:', categoryName);
            }
        });
    }
    
    if (amountInput) {
        // S'assurer que nous n'ajoutons pas de gestionnaires d'événements en double
        const newAmountInput = amountInput.cloneNode(true);
        amountInput.parentNode.replaceChild(newAmountInput, amountInput);
        
        // Valider l'entrée pour n'accepter que des nombres
        newAmountInput.addEventListener('input', function() {
            this.value = this.value.replace(/[^\d.,]/g, '');
        });
        
        // Mise à jour lors de la perte de focus
        newAmountInput.addEventListener('blur', function() {
            console.log('Modification du montant de la ligne:', this.value);
            
            // Convertir le montant en nombre
            const amount = parseFloat(this.value.replace(/,/g, '.')) || 0;
            this.value = amount.toFixed(2);
            
            // Trouver la référence dans le modèle
            const categoryElement = line.closest('.expense-category');
            const subcategoryElement = line.closest('.expense-subcategory');
            const lineNameElement = line.querySelector('.expense-line-name');
            
            if (!categoryElement || !subcategoryElement || !lineNameElement) {
                console.error('Impossible de trouver les éléments de référence');
                return;
            }
            
            const categoryNameElement = categoryElement.querySelector('.category-name');
            const subcategoryNameElement = subcategoryElement.querySelector('.subcategory-name');
            
            if (!categoryNameElement || !subcategoryNameElement) {
                console.error('Éléments de nom de catégorie/sous-catégorie non trouvés');
                return;
            }
            
            const categoryName = categoryNameElement.value || categoryNameElement.textContent;
            const subcategoryName = subcategoryNameElement.value || subcategoryNameElement.textContent;
            const lineName = lineNameElement.value || lineNameElement.textContent;
            
            console.log('Catégorie:', categoryName, 'Sous-catégorie:', subcategoryName, 'Ligne:', lineName);
            
            // Mise à jour du modèle
            if (!window.currentProject) {
                console.error('Projet actuel non disponible');
                return;
            }
            
            const category = window.currentProject.categories.find(c => 
                c.name === categoryName || (typeof c.name === 'object' && c.name.value === categoryName));
                
            if (category) {
                const subcategory = category.subcategories.find(s => 
                    s.name === subcategoryName || (typeof s.name === 'object' && s.name.value === subcategoryName));
                    
                if (subcategory) {
                    const expenseLine = subcategory.lines.find(l => 
                        l.name === lineName || (typeof l.name === 'object' && l.name.value === lineName));
                        
                    if (expenseLine) {
                        console.log('Ligne trouvée, mise à jour du montant:', amount);
                        expenseLine.amount = amount;
                        
                        // Recalculer les montants
                        recalculateAmounts();
                        
                        // Sauvegarder les modifications
                        collectAndSaveProjectData();
                    } else {
                        console.warn('Ligne non trouvée dans le modèle avec le nom:', lineName);
                    }
                }
            }
        });
        
        // Traiter la touche Entrée
        newAmountInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                this.blur(); // Déclenche l'événement blur
            }
        });
    }
    
    if (deleteBtn) {
        // S'assurer que nous n'ajoutons pas de gestionnaires d'événements en double
        const newDeleteBtn = deleteBtn.cloneNode(true);
        deleteBtn.parentNode.replaceChild(newDeleteBtn, deleteBtn);
        
        newDeleteBtn.addEventListener('click', function() {
            if (!confirm('Voulez-vous vraiment supprimer cette ligne de dépense ?')) return;
            
            // Trouver les références dans le modèle
            const categoryElement = line.closest('.expense-category');
            const subcategoryElement = line.closest('.expense-subcategory');
            const lineNameElement = line.querySelector('.expense-line-name');
            
            if (!categoryElement || !subcategoryElement || !lineNameElement) {
                console.error('Impossible de trouver les éléments de référence');
                return;
            }
            
            const categoryNameElement = categoryElement.querySelector('.category-name');
            const subcategoryNameElement = subcategoryElement.querySelector('.subcategory-name');
            
            if (!categoryNameElement || !subcategoryNameElement) {
                console.error('Éléments de nom de catégorie/sous-catégorie non trouvés');
                return;
            }
            
            const categoryName = categoryNameElement.value || categoryNameElement.textContent;
            const subcategoryName = subcategoryNameElement.value || subcategoryNameElement.textContent;
            const lineName = lineNameElement.value || lineNameElement.textContent;
            
            // Supprimer du DOM
            line.remove();
            
            // Supprimer du modèle
            const category = window.currentProject.categories.find(c => 
                c.name === categoryName || (typeof c.name === 'object' && c.name.value === categoryName));
                
            if (category) {
                const subcategory = category.subcategories.find(s => 
                    s.name === subcategoryName || (typeof s.name === 'object' && s.name.value === subcategoryName));
                    
                if (subcategory && subcategory.lines) {
                    const lineIndex = subcategory.lines.findIndex(l => 
                        l.name === lineName || (typeof l.name === 'object' && l.name.value === lineName));
                        
                    if (lineIndex >= 0) {
                        subcategory.lines.splice(lineIndex, 1);
                        
                        // Recalculer les montants
                        recalculateAmounts();
                        
                        // Sauvegarder les modifications
                        collectAndSaveProjectData();
                    }
                }
            }
        });
    }
}

// Fonction pour recalculer tous les montants
function recalculateAmounts() {
    // Si nous n'avons pas accès à la fonction existante, implémenter notre logique
    if (typeof recalculateProjectAmounts === 'function') {
        recalculateProjectAmounts();
    } else {
        console.log('Recalcul des montants...');
        // Implémenter notre propre logique de recalcul
        const project = window.currentProject;
        if (!project || !project.categories) return;
        
        // Pour chaque catégorie
        project.categories.forEach(category => {
            let categoryTotal = 0;
            
            // Pour chaque sous-catégorie
            if (category.subcategories) {
                category.subcategories.forEach(subcategory => {
                    let subcategoryTotal = 0;
                    
                    // Pour chaque ligne
                    if (subcategory.lines) {
                        subcategory.lines.forEach(line => {
                            // S'assurer que le montant est un nombre
                            const lineAmount = typeof line.amount === 'number' ? line.amount : 
                                parseFloat(String(line.amount).replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
                            
                            subcategoryTotal += lineAmount;
                        });
                    }
                    
                    // Mettre à jour le montant total de la sous-catégorie
                    subcategory.amount = subcategoryTotal;
                    categoryTotal += subcategoryTotal;
                });
            }
            
            // Mettre à jour le montant total de la catégorie
            category.amount = categoryTotal;
        });
        
        // Mettre à jour le budget total du projet
        let totalBudget = 0;
        project.categories.forEach(category => {
            totalBudget += (typeof category.amount === 'number' ? category.amount : 
                parseFloat(String(category.amount).replace(/[^\d.,]/g, '').replace(',', '.')) || 0);
        });
        
        project.totalBudget = totalBudget;
        
        // Mettre à jour l'affichage des montants
        updateProjectUI(project);
    }
}

// Initialiser dès que le document est prêt
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initialisation de l\'édition directe...');
    
    // Attendre un peu que le projet soit chargé
    setTimeout(function() {
        if (!makeElementsEditable()) {
            // Réessayer après un délai supplémentaire
            setTimeout(makeElementsEditable, 1000);
        }
    }, 500);
});