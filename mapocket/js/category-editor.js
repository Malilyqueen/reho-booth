// Script pour la gestion des catégories de dépenses dans la page de détail du projet
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initialisation de l\'éditeur de catégories');
    
    // On attend que le projet soit chargé pour initialiser l'édition des catégories
    const categoriesContainer = document.getElementById('categoriesContainer');
    if (categoriesContainer) {
        // Observer les changements dans le conteneur des catégories
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // Attendre que les éléments soient complètement ajoutés au DOM
                    setTimeout(function() {
                        initCategoryEditing();
                    }, 100);
                }
            });
        });
        
        // Configuration de l'observateur : observer l'ajout de nœuds enfants
        observer.observe(categoriesContainer, { childList: true });
    }
});

// Fonction pour initialiser l'édition des catégories
function initCategoryEditing() {
    console.log('Initialisation de l\'édition des catégories');
    
    // Rendre les noms de catégories éditables
    document.querySelectorAll('.category-name:not(.editable-initialized)').forEach(element => {
        element.classList.add('editable-field', 'editable-initialized');
        
        // Ajouter l'écouteur d'événement pour le clic
        element.addEventListener('click', function() {
            makeFieldEditable(this, 'text');
        });
    });
    
    // Rendre les montants de catégories éditables
    document.querySelectorAll('.category-amount:not(.editable-initialized)').forEach(element => {
        element.classList.add('editable-field', 'editable-initialized');
        
        // Ajouter l'écouteur d'événement pour le clic
        element.addEventListener('click', function() {
            makeFieldEditable(this, 'number');
        });
    });
    
    // Rendre les noms de sous-catégories éditables
    document.querySelectorAll('.subcategory-name:not(.editable-initialized)').forEach(element => {
        element.classList.add('editable-field', 'editable-initialized');
        
        // Ajouter l'écouteur d'événement pour le clic
        element.addEventListener('click', function() {
            makeFieldEditable(this, 'text');
        });
    });
    
    // Rendre les montants de sous-catégories éditables
    document.querySelectorAll('.subcategory-amount:not(.editable-initialized)').forEach(element => {
        element.classList.add('editable-field', 'editable-initialized');
        
        // Ajouter l'écouteur d'événement pour le clic
        element.addEventListener('click', function() {
            makeFieldEditable(this, 'number');
        });
    });
    
    // Rendre les noms de lignes de dépenses éditables
    document.querySelectorAll('.expense-line-name:not(.editable-initialized)').forEach(element => {
        element.classList.add('editable-field', 'editable-initialized');
        
        // Ajouter l'écouteur d'événement pour le clic
        element.addEventListener('click', function() {
            makeFieldEditable(this, 'text');
        });
    });
    
    // Rendre les montants de lignes de dépenses éditables
    document.querySelectorAll('.expense-line-amount:not(.editable-initialized)').forEach(element => {
        element.classList.add('editable-field', 'editable-initialized');
        
        // Ajouter l'écouteur d'événement pour le clic
        element.addEventListener('click', function() {
            makeFieldEditable(this, 'number');
        });
    });
    
    console.log('L\'édition des catégories a été initialisée');
}

// Fonction pour sauvegarder les modifications d'un projet
function saveProjectChanges() {
    if (!window.currentProject) {
        console.error('Aucun projet actif');
        return;
    }
    
    // Récupérer les données mises à jour des catégories
    const updatedCategories = extractCategoriesFromDOM();
    
    // Mettre à jour les catégories du projet
    window.currentProject.categories = updatedCategories;
    
    // Récupérer tous les projets
    let projects = [];
    try {
        projects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
    } catch (error) {
        console.error('Erreur lors du chargement des projets:', error);
        showNotification('Erreur lors du chargement des projets', 'error');
        return;
    }
    
    // Trouver et mettre à jour le projet
    const index = projects.findIndex(p => p.id === window.currentProject.id);
    if (index !== -1) {
        projects[index] = window.currentProject;
        
        // Sauvegarder les projets
        localStorage.setItem('savedProjects', JSON.stringify(projects));
        
        showNotification('Projet mis à jour avec succès', 'success');
        console.log('Projet sauvegardé:', window.currentProject.projectName);
    } else {
        showNotification('Projet non trouvé', 'error');
    }
}

// Fonction pour extraire les catégories du DOM
function extractCategoriesFromDOM() {
    const categories = [];
    const categoryElements = document.querySelectorAll('.expense-category');
    
    categoryElements.forEach(categoryElement => {
        const categoryName = categoryElement.querySelector('.category-name').textContent;
        const categoryAmount = categoryElement.querySelector('.category-amount').textContent;
        
        const subcategories = [];
        const subcategoryElements = categoryElement.querySelectorAll('.expense-subcategory');
        
        subcategoryElements.forEach(subcategoryElement => {
            const subcategoryName = subcategoryElement.querySelector('.subcategory-name').textContent;
            const subcategoryAmount = subcategoryElement.querySelector('.subcategory-amount').textContent;
            
            const lines = [];
            const lineElements = subcategoryElement.querySelectorAll('.expense-line');
            
            lineElements.forEach(lineElement => {
                const lineName = lineElement.querySelector('.expense-line-name').textContent;
                const lineAmount = lineElement.querySelector('.expense-line-amount').textContent;
                
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

// Fonction pour mettre à jour les totaux des catégories et sous-catégories
function updateCategoryTotals() {
    // Mettre à jour les totaux des sous-catégories
    document.querySelectorAll('.expense-subcategory').forEach(subcategoryElement => {
        let total = 0;
        const lineElements = subcategoryElement.querySelectorAll('.expense-line');
        
        lineElements.forEach(lineElement => {
            const amountElement = lineElement.querySelector('.expense-line-amount');
            const amount = parseMonetaryValue(amountElement.textContent);
            total += amount;
        });
        
        const subcategoryAmountElement = subcategoryElement.querySelector('.subcategory-amount');
        if (subcategoryAmountElement) {
            let currencySymbol = getProjectCurrencySymbol();
            subcategoryAmountElement.textContent = `${currencySymbol} ${total.toFixed(2)}`;
        }
    });
    
    // Mettre à jour les totaux des catégories
    document.querySelectorAll('.expense-category').forEach(categoryElement => {
        let total = 0;
        const subcategoryElements = categoryElement.querySelectorAll('.expense-subcategory');
        
        subcategoryElements.forEach(subcategoryElement => {
            const amountElement = subcategoryElement.querySelector('.subcategory-amount');
            const amount = parseMonetaryValue(amountElement.textContent);
            total += amount;
        });
        
        const categoryAmountElement = categoryElement.querySelector('.category-amount');
        if (categoryAmountElement) {
            let currencySymbol = getProjectCurrencySymbol();
            categoryAmountElement.textContent = `${currencySymbol} ${total.toFixed(2)}`;
        }
    });
    
    // Mettre à jour le budget total du projet
    let totalBudget = 0;
    document.querySelectorAll('.expense-category').forEach(categoryElement => {
        const amountElement = categoryElement.querySelector('.category-amount');
        const amount = parseMonetaryValue(amountElement.textContent);
        totalBudget += amount;
    });
    
    const initialBudgetElement = document.getElementById('initialBudget');
    if (initialBudgetElement) {
        let currencySymbol = getProjectCurrencySymbol();
        initialBudgetElement.textContent = `${currencySymbol} ${totalBudget.toFixed(2)}`;
        
        // Mettre à jour le budget total dans l'objet projet
        if (window.currentProject) {
            window.currentProject.totalBudget = `${currencySymbol} ${totalBudget.toFixed(2)}`;
        }
    }
    
    // Sauvegarder les modifications
    saveProjectChanges();
}

// Fonction pour obtenir le symbole de devise du projet
function getProjectCurrencySymbol() {
    // Essayer d'obtenir le symbole à partir du projet actuel
    if (window.currentProject && window.currentProject.currencySymbol) {
        return window.currentProject.currencySymbol;
    }
    
    // Sinon, essayer d'obtenir à partir des préférences utilisateur
    try {
        const preferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
        if (preferences.currency === 'EUR') return '€';
        else if (preferences.currency === 'USD') return '$';
        else if (preferences.currency === 'GBP') return '£';
        else if (preferences.currency === 'MAD') return 'DH';
    } catch (error) {
        console.error('Erreur lors de la récupération des préférences utilisateur:', error);
    }
    
    // Valeur par défaut
    return '€';
}