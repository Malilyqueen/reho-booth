/**
 * editable-project.js
 * Fonctions permettant de rendre les projets modifiables directement dans la fiche de résumé
 * Élimine le besoin d'un écran séparé de modification
 */

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
    if (!project) return;
    
    try {
        // Sauvegarder directement le projet (les modifications sont déjà appliquées via les refs)
        saveProjectChanges(project);
        console.log('Projet sauvegardé avec succès');
    } catch (error) {
        console.error('Erreur lors de la sauvegarde du projet:', error);
        showNotification('Erreur lors de la sauvegarde', 'error');
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

// Initialiser dès que le document est prêt
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initialisation de l\'édition directe...');
    
    // Surveiller les changements de l'interface et s'adapter
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length > 0) {
                // Si un conteneur de catégories est ajouté au DOM
                const categoriesContainer = document.getElementById('categoriesContainer') || document.getElementById('categoryList');
                if (categoriesContainer && categoriesContainer.children.length > 0) {
                    // Initialiser les catégories éditables après un court délai
                    setTimeout(initializeEditableCategories, 100);
                    
                    // Déconnecter l'observateur pour éviter des appels multiples
                    observer.disconnect();
                }
            }
        });
    });
    
    // Observer le document entier pour détecter quand les catégories sont chargées
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Aussi essayer d'initialiser directement (au cas où les catégories sont déjà chargées)
    setTimeout(initializeEditableCategories, 500);
    
    console.log('Édition directe initialisée');
});