// JavaScript for the New Project page

document.addEventListener('DOMContentLoaded', function() {
    console.log('New Project page initialized');
    
    // Initialiser le formulaire de nouveau projet
    initializeProjectForm();
    
    // Initialiser l'accordéon des catégories de modèles
    initializeTemplateAccordion();
    
    // Initialiser les options de modèles
    initializeTemplateOptions();
    
    // Initialiser les interactions avec les catégories et sous-catégories de dépenses
    initializeExpenseCategories();
    
    // Initialiser le bouton d'ajout de catégorie principale
    const addMainCategoryBtn = document.getElementById('addMainCategoryBtn');
    if (addMainCategoryBtn) {
        addMainCategoryBtn.addEventListener('click', addMainCategory);
    }
    
    // Initialiser les fonctionnalités de sous-catégories
    initializeSubcategories();
    
    // Initialize budget calculation
    initializeBudgetCalculation();
});

function initializeProjectForm() {
    // Date picker initialization (in a full implementation, this would use a date picker library)
    const dateInput = document.getElementById('projectDate');
    if (dateInput) {
        dateInput.addEventListener('click', function() {
            console.log('Date picker clicked');
            // In a full implementation, this would open a date picker
        });
    }

    // Handle form submission
    const projectForm = document.getElementById('newProjectForm');
    if (projectForm) {
        projectForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Collect form data
            const formData = {
                projectName: document.getElementById('projectName').value,
                projectDate: document.getElementById('projectDate').value,
                totalBudget: document.getElementById('totalBudget').value,
                template: document.querySelector('.template-option.selected') ? 
                    document.querySelector('.template-option.selected').getAttribute('data-template') : 'Personnalisé',
                categories: []
            };
            
            // Collect categories and their subcategories
            const expenseCategories = document.querySelectorAll('.expense-category');
            expenseCategories.forEach(category => {
                const categoryName = category.querySelector('.category-name').textContent;
                const categoryAmount = category.querySelector('.category-amount').textContent;
                
                const subcategories = [];
                const subcategoryElements = category.querySelectorAll('.subcategory');
                subcategoryElements.forEach(subcategory => {
                    const subcategoryName = subcategory.querySelector('.subcategory-name').textContent;
                    const subcategoryAmount = subcategory.querySelector('.subcategory-amount').textContent;
                    
                    const lines = [];
                    const expenseLines = subcategory.querySelectorAll('.expense-line');
                    expenseLines.forEach(line => {
                        const lineName = line.querySelector('.expense-line-name').value;
                        const lineAmount = line.querySelector('.expense-line-amount').value;
                        
                        if (lineName && lineAmount) {
                            lines.push({
                                name: lineName,
                                amount: lineAmount
                            });
                        }
                    });
                    
                    subcategories.push({
                        name: subcategoryName,
                        amount: subcategoryAmount,
                        lines: lines
                    });
                });
                
                formData.categories.push({
                    name: categoryName,
                    amount: categoryAmount,
                    subcategories: subcategories
                });
            });
            
            console.log('Form submitted:', formData);
            
            // In a real application, this would save the data and redirect to the dashboard
            alert('Projet créé avec succès!');
            // Then redirect to dashboard
            window.location.href = 'index.html';
        });
    }
}

function initializeTemplateAccordion() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            // Toggle active class on header
            this.classList.toggle('active');
            
            // Toggle corresponding content
            const content = this.nextElementSibling;
            content.classList.toggle('active');
            
            // Update chevron icon
            const icon = this.querySelector('i');
            if (icon) {
                if (content.classList.contains('active')) {
                    icon.className = 'fas fa-chevron-up';
                } else {
                    icon.className = 'fas fa-chevron-down';
                }
            }
        });
    });
}

function initializeTemplateOptions() {
    const templateOptions = document.querySelectorAll('.template-option');
    
    templateOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove selected class from all options
            document.querySelectorAll('.template-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            
            // Add selected class to clicked option
            this.classList.add('selected');
            
            // Get the template type
            const templateType = this.getAttribute('data-template');
            
            // Update the project type title
            const projectTypeTitle = document.querySelector('.project-type');
            if (projectTypeTitle) {
                projectTypeTitle.textContent = templateType;
            }
            
            // Mise à jour des catégories et sous-catégories
            console.log('Template selected:', templateType);
            updateTemplateCategories(templateType);
            
            // Mise à jour du conseil IA
            updateAIAdvice(templateType);
        });
    });
}

function initializeExpenseCategories() {
    // Gérer les toggles de catégories principales
    const categoryToggles = document.querySelectorAll('.category-toggle');
    categoryToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Trouver le conteneur parent et le conteneur de sous-catégories
            const categoryHeader = this.closest('.category-header');
            const subcategoriesContainer = categoryHeader.nextElementSibling;
            
            // Toggle la classe open
            this.classList.toggle('open');
            subcategoriesContainer.classList.toggle('open');
            
            // Mettre à jour l'icône
            if (this.classList.contains('open')) {
                this.innerHTML = '<i class="fas fa-chevron-up"></i>';
            } else {
                this.innerHTML = '<i class="fas fa-chevron-down"></i>';
            }
        });
    });
    
    // Initialiser les boutons d'ajout de ligne
    const addLineButtons = document.querySelectorAll('.add-line-btn');
    addLineButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Trouver le conteneur de lignes parent
            const expenseLines = this.closest('.expense-lines');
            
            // Créer une nouvelle ligne
            const newLine = document.createElement('div');
            newLine.className = 'expense-line';
            newLine.innerHTML = `
                <input type="text" class="form-control expense-line-name" value="Nouvelle ligne">
                <input type="text" class="form-control expense-line-amount" value="€ 0">
                <div class="expense-line-actions">
                    <button type="button" class="btn-sm btn-delete-line">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            
            // Insérer la nouvelle ligne avant le bouton d'ajout
            expenseLines.insertBefore(newLine, this);
            
            // Initialiser le bouton de suppression de la nouvelle ligne
            initializeDeleteLineButton(newLine.querySelector('.btn-delete-line'));
            
            // Mettre à jour les totaux
            updateSubcategoryTotal(expenseLines.closest('.subcategory'));
        });
    });
    
    // Initialiser les boutons de suppression de ligne
    const deleteLineButtons = document.querySelectorAll('.btn-delete-line');
    deleteLineButtons.forEach(button => {
        initializeDeleteLineButton(button);
    });
}

function initializeDeleteLineButton(button) {
    button.addEventListener('click', function() {
        // Trouver la ligne parent
        const expenseLine = this.closest('.expense-line');
        // Trouver la sous-catégorie parente
        const subcategory = expenseLine.closest('.subcategory');
        
        // Supprimer la ligne
        expenseLine.remove();
        
        // Mettre à jour le total de la sous-catégorie
        updateSubcategoryTotal(subcategory);
    });
}

function initializeSubcategories() {
    // Gérer les toggles de sous-catégories
    const subcategoryToggles = document.querySelectorAll('.subcategory-toggle');
    subcategoryToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Trouver le conteneur parent et le conteneur de lignes
            const subcategoryHeader = this.closest('.subcategory-header');
            const expenseLines = subcategoryHeader.nextElementSibling;
            
            // Toggle la classe open
            this.classList.toggle('open');
            expenseLines.classList.toggle('open');
            
            // Mettre à jour l'icône
            if (this.classList.contains('open')) {
                this.innerHTML = '<i class="fas fa-chevron-up"></i>';
            } else {
                this.innerHTML = '<i class="fas fa-chevron-down"></i>';
            }
        });
    });
    
    // Initialiser les boutons d'ajout de sous-catégorie
    const addSubcategoryButtons = document.querySelectorAll('.add-subcategory-btn');
    addSubcategoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Trouver le conteneur de sous-catégories parent
            const subcategoriesContainer = this.closest('.subcategories-container');
            const subcategoryFooter = this.closest('.subcategory-footer');
            
            // Créer une nouvelle sous-catégorie
            const newSubcategory = document.createElement('div');
            newSubcategory.className = 'subcategory';
            newSubcategory.innerHTML = `
                <div class="subcategory-header">
                    <h5 class="subcategory-name">Nouvelle sous-catégorie</h5>
                    <span class="subcategory-amount">€ 0</span>
                    <button type="button" class="subcategory-toggle open">
                        <i class="fas fa-chevron-up"></i>
                    </button>
                </div>
                <div class="expense-lines open">
                    <div class="expense-line">
                        <input type="text" class="form-control expense-line-name" value="Nouvelle ligne">
                        <input type="text" class="form-control expense-line-amount" value="€ 0">
                        <div class="expense-line-actions">
                            <button type="button" class="btn-sm btn-delete-line">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    <button type="button" class="add-line-btn">
                        <i class="fas fa-plus"></i> Ajouter une ligne
                    </button>
                </div>
            `;
            
            // Insérer la nouvelle sous-catégorie avant le footer
            subcategoriesContainer.insertBefore(newSubcategory, subcategoryFooter);
            
            // Initialiser les interactions pour cette nouvelle sous-catégorie
            const newToggle = newSubcategory.querySelector('.subcategory-toggle');
            newToggle.addEventListener('click', function(e) {
                e.stopPropagation();
                
                // Trouver le conteneur de lignes
                const expenseLines = this.closest('.subcategory-header').nextElementSibling;
                
                // Toggle la classe open
                this.classList.toggle('open');
                expenseLines.classList.toggle('open');
                
                // Mettre à jour l'icône
                if (this.classList.contains('open')) {
                    this.innerHTML = '<i class="fas fa-chevron-up"></i>';
                } else {
                    this.innerHTML = '<i class="fas fa-chevron-down"></i>';
                }
            });
            
            // Initialiser le bouton d'ajout de ligne
            const newAddLineBtn = newSubcategory.querySelector('.add-line-btn');
            newAddLineBtn.addEventListener('click', function() {
                // Trouver le conteneur de lignes
                const expenseLines = this.closest('.expense-lines');
                
                // Créer une nouvelle ligne
                const newLine = document.createElement('div');
                newLine.className = 'expense-line';
                newLine.innerHTML = `
                    <input type="text" class="form-control expense-line-name" value="Nouvelle ligne">
                    <input type="text" class="form-control expense-line-amount" value="€ 0">
                    <div class="expense-line-actions">
                        <button type="button" class="btn-sm btn-delete-line">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
                
                // Insérer la nouvelle ligne avant le bouton d'ajout
                expenseLines.insertBefore(newLine, this);
                
                // Initialiser le bouton de suppression de la nouvelle ligne
                initializeDeleteLineButton(newLine.querySelector('.btn-delete-line'));
                
                // Mettre à jour les totaux
                updateSubcategoryTotal(newSubcategory);
            });
            
            // Initialiser les boutons de suppression de ligne
            const newDeleteLineButtons = newSubcategory.querySelectorAll('.btn-delete-line');
            newDeleteLineButtons.forEach(btn => {
                initializeDeleteLineButton(btn);
            });
            
            // Mettre à jour les totaux de la catégorie parent
            const parentCategory = subcategoriesContainer.closest('.expense-category');
            updateCategoryTotal(parentCategory);
        });
    });
    
    // Ajouter des écouteurs d'événements pour la mise à jour automatique des totaux
    document.addEventListener('input', function(e) {
        if (e.target && e.target.classList.contains('expense-line-amount')) {
            // Trouver la sous-catégorie parente
            const subcategory = e.target.closest('.subcategory');
            if (subcategory) {
                updateSubcategoryTotal(subcategory);
            }
        }
    });
}

function updateSubcategoryTotal(subcategory) {
    let total = 0;
    
    // Calculer le total à partir de toutes les lignes de dépenses
    const amountInputs = subcategory.querySelectorAll('.expense-line-amount');
    amountInputs.forEach(input => {
        // Extraire le montant (supprimer le symbole € et convertir en nombre)
        const value = input.value.trim();
        const amount = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
        total += amount;
    });
    
    // Mettre à jour l'affichage du total de la sous-catégorie
    const subcategoryAmount = subcategory.querySelector('.subcategory-amount');
    if (subcategoryAmount) {
        subcategoryAmount.textContent = `€ ${total}`;
    }
    
    // Mettre à jour le total de la catégorie parente
    const parentCategory = subcategory.closest('.expense-category');
    if (parentCategory) {
        updateCategoryTotal(parentCategory);
    }
}

function updateCategoryTotal(category) {
    let total = 0;
    
    // Calculer le total à partir de toutes les sous-catégories
    const subcategoryAmounts = category.querySelectorAll('.subcategory-amount');
    subcategoryAmounts.forEach(amountElem => {
        // Extraire le montant (supprimer le symbole € et convertir en nombre)
        const value = amountElem.textContent.trim();
        const amount = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
        total += amount;
    });
    
    // Mettre à jour l'affichage du total de la catégorie
    const categoryAmount = category.querySelector('.category-amount');
    if (categoryAmount) {
        categoryAmount.textContent = `€ ${total}`;
    }
    
    // Mettre à jour le total général du budget
    updateTotalBudget();
}

function addMainCategory() {
    // Trouver le conteneur des catégories de dépenses
    const expenseCategories = document.querySelector('.expense-categories');
    const addCategoryContainer = document.querySelector('.add-category-container');
    
    // Créer une nouvelle catégorie principale
    const newCategory = document.createElement('div');
    newCategory.className = 'expense-category';
    newCategory.innerHTML = `
        <div class="category-header">
            <h4 class="category-name">Nouvelle catégorie</h4>
            <span class="category-amount">€ 0</span>
            <div class="category-controls">
                <button type="button" class="category-toggle open">
                    <i class="fas fa-chevron-up"></i>
                </button>
            </div>
        </div>
        <div class="subcategories-container open">
            <!-- Sous-catégorie par défaut -->
            <div class="subcategory">
                <div class="subcategory-header">
                    <h5 class="subcategory-name">Nouvelle sous-catégorie</h5>
                    <span class="subcategory-amount">€ 0</span>
                    <button type="button" class="subcategory-toggle open">
                        <i class="fas fa-chevron-up"></i>
                    </button>
                </div>
                <div class="expense-lines open">
                    <div class="expense-line">
                        <input type="text" class="form-control expense-line-name" value="Nouvelle ligne">
                        <input type="text" class="form-control expense-line-amount" value="€ 0">
                        <div class="expense-line-actions">
                            <button type="button" class="btn-sm btn-delete-line">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    <button type="button" class="add-line-btn">
                        <i class="fas fa-plus"></i> Ajouter une ligne
                    </button>
                </div>
            </div>
            
            <div class="subcategory-footer">
                <button type="button" class="add-subcategory-btn">
                    <i class="fas fa-plus"></i> Ajouter une sous-catégorie
                </button>
            </div>
        </div>
    `;
    
    // Insérer la nouvelle catégorie avant le conteneur du bouton d'ajout
    expenseCategories.insertBefore(newCategory, addCategoryContainer);
    
    // Initialiser toutes les interactions pour cette nouvelle catégorie
    const newToggle = newCategory.querySelector('.category-toggle');
    newToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        
        // Trouver le conteneur de sous-catégories
        const subcategoriesContainer = this.closest('.category-header').nextElementSibling;
        
        // Toggle la classe open
        this.classList.toggle('open');
        subcategoriesContainer.classList.toggle('open');
        
        // Mettre à jour l'icône
        if (this.classList.contains('open')) {
            this.innerHTML = '<i class="fas fa-chevron-up"></i>';
        } else {
            this.innerHTML = '<i class="fas fa-chevron-down"></i>';
        }
    });
    
    // Initialiser la sous-catégorie par défaut
    const defaultSubcategory = newCategory.querySelector('.subcategory');
    const subcategoryToggle = defaultSubcategory.querySelector('.subcategory-toggle');
    subcategoryToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        
        // Trouver le conteneur de lignes
        const expenseLines = this.closest('.subcategory-header').nextElementSibling;
        
        // Toggle la classe open
        this.classList.toggle('open');
        expenseLines.classList.toggle('open');
        
        // Mettre à jour l'icône
        if (this.classList.contains('open')) {
            this.innerHTML = '<i class="fas fa-chevron-up"></i>';
        } else {
            this.innerHTML = '<i class="fas fa-chevron-down"></i>';
        }
    });
    
    // Initialiser le bouton d'ajout de ligne
    const addLineBtn = newCategory.querySelector('.add-line-btn');
    addLineBtn.addEventListener('click', function() {
        // Trouver le conteneur de lignes
        const expenseLines = this.closest('.expense-lines');
        
        // Créer une nouvelle ligne
        const newLine = document.createElement('div');
        newLine.className = 'expense-line';
        newLine.innerHTML = `
            <input type="text" class="form-control expense-line-name" value="Nouvelle ligne">
            <input type="text" class="form-control expense-line-amount" value="€ 0">
            <div class="expense-line-actions">
                <button type="button" class="btn-sm btn-delete-line">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        // Insérer la nouvelle ligne avant le bouton d'ajout
        expenseLines.insertBefore(newLine, this);
        
        // Initialiser le bouton de suppression de la nouvelle ligne
        initializeDeleteLineButton(newLine.querySelector('.btn-delete-line'));
        
        // Mettre à jour les totaux
        updateSubcategoryTotal(defaultSubcategory);
    });
    
    // Initialiser les boutons de suppression de ligne
    const deleteLineButtons = newCategory.querySelectorAll('.btn-delete-line');
    deleteLineButtons.forEach(button => {
        initializeDeleteLineButton(button);
    });
    
    // Initialiser le bouton d'ajout de sous-catégorie
    const addSubcategoryBtn = newCategory.querySelector('.add-subcategory-btn');
    addSubcategoryBtn.addEventListener('click', function() {
        // Trouver le conteneur de sous-catégories
        const subcategoriesContainer = this.closest('.subcategories-container');
        const subcategoryFooter = this.closest('.subcategory-footer');
        
        // Créer une nouvelle sous-catégorie
        const newSubcategory = document.createElement('div');
        newSubcategory.className = 'subcategory';
        newSubcategory.innerHTML = `
            <div class="subcategory-header">
                <h5 class="subcategory-name">Nouvelle sous-catégorie</h5>
                <span class="subcategory-amount">€ 0</span>
                <button type="button" class="subcategory-toggle open">
                    <i class="fas fa-chevron-up"></i>
                </button>
            </div>
            <div class="expense-lines open">
                <div class="expense-line">
                    <input type="text" class="form-control expense-line-name" value="Nouvelle ligne">
                    <input type="text" class="form-control expense-line-amount" value="€ 0">
                    <div class="expense-line-actions">
                        <button type="button" class="btn-sm btn-delete-line">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                <button type="button" class="add-line-btn">
                    <i class="fas fa-plus"></i> Ajouter une ligne
                </button>
            </div>
        `;
        
        // Insérer la nouvelle sous-catégorie avant le footer
        subcategoriesContainer.insertBefore(newSubcategory, subcategoryFooter);
        
        // Initialiser toutes les interactions pour cette nouvelle sous-catégorie
        const newSubcategoryToggle = newSubcategory.querySelector('.subcategory-toggle');
        newSubcategoryToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Trouver le conteneur de lignes
            const expenseLines = this.closest('.subcategory-header').nextElementSibling;
            
            // Toggle la classe open
            this.classList.toggle('open');
            expenseLines.classList.toggle('open');
            
            // Mettre à jour l'icône
            if (this.classList.contains('open')) {
                this.innerHTML = '<i class="fas fa-chevron-up"></i>';
            } else {
                this.innerHTML = '<i class="fas fa-chevron-down"></i>';
            }
        });
        
        // Initialiser le bouton d'ajout de ligne
        const newAddLineBtn = newSubcategory.querySelector('.add-line-btn');
        newAddLineBtn.addEventListener('click', function() {
            // Trouver le conteneur de lignes
            const expenseLines = this.closest('.expense-lines');
            
            // Créer une nouvelle ligne
            const newLine = document.createElement('div');
            newLine.className = 'expense-line';
            newLine.innerHTML = `
                <input type="text" class="form-control expense-line-name" value="Nouvelle ligne">
                <input type="text" class="form-control expense-line-amount" value="€ 0">
                <div class="expense-line-actions">
                    <button type="button" class="btn-sm btn-delete-line">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            
            // Insérer la nouvelle ligne avant le bouton d'ajout
            expenseLines.insertBefore(newLine, this);
            
            // Initialiser le bouton de suppression de la nouvelle ligne
            initializeDeleteLineButton(newLine.querySelector('.btn-delete-line'));
            
            // Mettre à jour les totaux
            updateSubcategoryTotal(newSubcategory);
        });
        
        // Initialiser les boutons de suppression de ligne
        const newDeleteLineButtons = newSubcategory.querySelectorAll('.btn-delete-line');
        newDeleteLineButtons.forEach(btn => {
            initializeDeleteLineButton(btn);
        });
        
        // Mettre à jour les totaux
        updateCategoryTotal(newCategory);
    });
    
    // Mettre à jour le total général
    updateTotalBudget();
}

function updateTotalBudget() {
    let total = 0;
    
    // Calculer le total à partir de toutes les catégories principales
    const categoryAmounts = document.querySelectorAll('.category-amount');
    categoryAmounts.forEach(amountElem => {
        // Extraire le montant (supprimer le symbole € et convertir en nombre)
        const value = amountElem.textContent.trim();
        const amount = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
        total += amount;
    });
    
    // Mettre à jour l'affichage du total du budget
    const totalBudgetAmount = document.querySelector('.total-budget-amount');
    if (totalBudgetAmount) {
        totalBudgetAmount.textContent = `€ ${total}`;
    }
    
    // Mettre à jour le champ de budget total (pour le formulaire)
    const totalBudgetInput = document.getElementById('totalBudget');
    if (totalBudgetInput) {
        totalBudgetInput.value = `€ ${total}`;
    }
}

function initializeBudgetCalculation() {
    // This function is called on page load to initialize budget calculation
    // and will update the total whenever amounts are changed
    
    // Mettre à jour le total à l'initialisation
    updateTotalBudget();
    
    // Écouter les changements sur tous les champs de montant
    document.addEventListener('input', function(e) {
        if (e.target && e.target.classList.contains('expense-line-amount')) {
            // Si un montant change, mettre à jour le total
            const subcategory = e.target.closest('.subcategory');
            if (subcategory) {
                updateSubcategoryTotal(subcategory);
            }
        }
    });
}

// Fonction pour mettre à jour les catégories de dépenses en fonction du modèle sélectionné
// Données de budgets par défaut pour chaque modèle
const defaultBudgets = {
    // 🎉 Événementiels
    "Anniversaire": {
        "categories": [
            {
                "name": "Restauration",
                "subcategories": [
                    {
                        "name": "Traiteur",
                        "lines": [
                            { "name": "Menu principal", "amount": "€ 150" },
                            { "name": "Desserts", "amount": "€ 50" }
                        ]
                    },
                    {
                        "name": "Boissons",
                        "lines": [
                            { "name": "Soft drinks", "amount": "€ 50" },
                            { "name": "Alcool", "amount": "€ 50" }
                        ]
                    }
                ]
            },
            {
                "name": "Animation",
                "subcategories": [
                    {
                        "name": "DJ",
                        "lines": [
                            { "name": "DJ forfait soirée", "amount": "€ 150" }
                        ]
                    },
                    {
                        "name": "Jeux",
                        "lines": [
                            { "name": "Matériel de jeux enfants", "amount": "€ 50" }
                        ]
                    }
                ]
            },
            {
                "name": "Décoration",
                "subcategories": [
                    {
                        "name": "Salle",
                        "lines": [
                            { "name": "Ballons", "amount": "€ 30" },
                            { "name": "Banderoles", "amount": "€ 20" }
                        ]
                    }
                ]
            }
        ]
    },
    "Mariage": {
        "categories": [
            {
                "name": "Lieu",
                "subcategories": [
                    {
                        "name": "Location",
                        "lines": [
                            { "name": "Location salle", "amount": "€ 800" }
                        ]
                    }
                ]
            },
            {
                "name": "Restauration",
                "subcategories": [
                    {
                        "name": "Repas",
                        "lines": [
                            { "name": "Cocktail", "amount": "€ 600" },
                            { "name": "Dîner", "amount": "€ 1200" }
                        ]
                    },
                    {
                        "name": "Dessert",
                        "lines": [
                            { "name": "Gâteau", "amount": "€ 200" }
                        ]
                    }
                ]
            },
            {
                "name": "Animation",
                "subcategories": [
                    {
                        "name": "Musique",
                        "lines": [
                            { "name": "DJ", "amount": "€ 500" },
                            { "name": "Groupe", "amount": "€ 300" }
                        ]
                    }
                ]
            },
            {
                "name": "Tenues",
                "subcategories": [
                    {
                        "name": "Vêtements",
                        "lines": [
                            { "name": "Robe", "amount": "€ 1000" },
                            { "name": "Costume", "amount": "€ 600" }
                        ]
                    }
                ]
            }
        ]
    },
    "Baby shower": {
        "categories": [
            {
                "name": "Restauration",
                "subcategories": [
                    {
                        "name": "Buffet",
                        "lines": [
                            { "name": "Amuse-bouches", "amount": "€ 80" },
                            { "name": "Desserts thématiques", "amount": "€ 60" }
                        ]
                    },
                    {
                        "name": "Boissons",
                        "lines": [
                            { "name": "Jus et sodas", "amount": "€ 40" },
                            { "name": "Champagne sans alcool", "amount": "€ 30" }
                        ]
                    }
                ]
            },
            {
                "name": "Décoration",
                "subcategories": [
                    {
                        "name": "Salle",
                        "lines": [
                            { "name": "Ballons", "amount": "€ 25" },
                            { "name": "Banderoles", "amount": "€ 15" },
                            { "name": "Accessoires thématiques", "amount": "€ 35" }
                        ]
                    }
                ]
            },
            {
                "name": "Animation",
                "subcategories": [
                    {
                        "name": "Jeux",
                        "lines": [
                            { "name": "Matériel pour jeux", "amount": "€ 40" },
                            { "name": "Petits cadeaux", "amount": "€ 50" }
                        ]
                    }
                ]
            }
        ]
    },
    "Fête d'entreprise": {
        "categories": [
            {
                "name": "Lieu",
                "subcategories": [
                    {
                        "name": "Location",
                        "lines": [
                            { "name": "Salle réception", "amount": "€ 1200" },
                            { "name": "Équipement audiovisuel", "amount": "€ 300" }
                        ]
                    }
                ]
            },
            {
                "name": "Restauration",
                "subcategories": [
                    {
                        "name": "Service traiteur",
                        "lines": [
                            { "name": "Cocktail dînatoire", "amount": "€ 2000" },
                            { "name": "Boissons", "amount": "€ 800" },
                            { "name": "Personnel de service", "amount": "€ 500" }
                        ]
                    }
                ]
            },
            {
                "name": "Animation",
                "subcategories": [
                    {
                        "name": "Divertissement",
                        "lines": [
                            { "name": "DJ/Musique", "amount": "€ 600" },
                            { "name": "Animations thématiques", "amount": "€ 800" }
                        ]
                    }
                ]
            },
            {
                "name": "Communication",
                "subcategories": [
                    {
                        "name": "Promotion",
                        "lines": [
                            { "name": "Invitations", "amount": "€ 150" },
                            { "name": "Signalétique", "amount": "€ 200" }
                        ]
                    }
                ]
            }
        ]
    },
    "Célébration religieuse": {
        "categories": [
            {
                "name": "Lieu de culte",
                "subcategories": [
                    {
                        "name": "Cérémonie",
                        "lines": [
                            { "name": "Don/Location", "amount": "€ 300" },
                            { "name": "Décoration", "amount": "€ 150" }
                        ]
                    }
                ]
            },
            {
                "name": "Réception",
                "subcategories": [
                    {
                        "name": "Salle",
                        "lines": [
                            { "name": "Location espace", "amount": "€ 600" }
                        ]
                    },
                    {
                        "name": "Traiteur",
                        "lines": [
                            { "name": "Repas", "amount": "€ 1000" },
                            { "name": "Boissons", "amount": "€ 300" }
                        ]
                    }
                ]
            },
            {
                "name": "Tenues",
                "subcategories": [
                    {
                        "name": "Vêtements cérémonie",
                        "lines": [
                            { "name": "Tenue principale", "amount": "€ 350" },
                            { "name": "Accessoires", "amount": "€ 100" }
                        ]
                    }
                ]
            },
            {
                "name": "Souvenirs",
                "subcategories": [
                    {
                        "name": "Cadeaux",
                        "lines": [
                            { "name": "Livrets/Images", "amount": "€ 200" },
                            { "name": "Petits présents", "amount": "€ 250" }
                        ]
                    }
                ]
            }
        ]
    },
    
    // 🏠 Vie personnelle
    "Budget mensuel": {
        "categories": [
            {
                "name": "Logement",
                "subcategories": [
                    {
                        "name": "Charges fixes",
                        "lines": [
                            { "name": "Loyer/Crédit", "amount": "€ 850" },
                            { "name": "Charges", "amount": "€ 120" }
                        ]
                    },
                    {
                        "name": "Factures",
                        "lines": [
                            { "name": "Électricité", "amount": "€ 75" },
                            { "name": "Internet", "amount": "€ 35" },
                            { "name": "Eau", "amount": "€ 40" }
                        ]
                    }
                ]
            },
            {
                "name": "Alimentation",
                "subcategories": [
                    {
                        "name": "Courses",
                        "lines": [
                            { "name": "Supermarché", "amount": "€ 300" },
                            { "name": "Marché", "amount": "€ 100" }
                        ]
                    },
                    {
                        "name": "Restaurants",
                        "lines": [
                            { "name": "Sorties", "amount": "€ 120" }
                        ]
                    }
                ]
            },
            {
                "name": "Transport",
                "subcategories": [
                    {
                        "name": "Véhicule",
                        "lines": [
                            { "name": "Carburant", "amount": "€ 120" },
                            { "name": "Assurance", "amount": "€ 50" }
                        ]
                    },
                    {
                        "name": "Transports publics",
                        "lines": [
                            { "name": "Abonnement", "amount": "€ 60" }
                        ]
                    }
                ]
            },
            {
                "name": "Loisirs",
                "subcategories": [
                    {
                        "name": "Divertissement",
                        "lines": [
                            { "name": "Sorties", "amount": "€ 80" },
                            { "name": "Abonnements", "amount": "€ 30" }
                        ]
                    }
                ]
            }
        ]
    },
    "Ménage familial": {
        "categories": [
            {
                "name": "Ménage",
                "subcategories": [
                    {
                        "name": "Courses alimentaires",
                        "lines": [
                            { "name": "Courses semaine 1", "amount": "€ 120" },
                            { "name": "Courses semaine 2", "amount": "€ 100" }
                        ]
                    },
                    {
                        "name": "Factures",
                        "lines": [
                            { "name": "Électricité", "amount": "€ 85" },
                            { "name": "Internet", "amount": "€ 45" }
                        ]
                    },
                    {
                        "name": "Entretien",
                        "lines": [
                            { "name": "Produits ménagers", "amount": "€ 30" },
                            { "name": "Réparations", "amount": "€ 50" }
                        ]
                    }
                ]
            },
            {
                "name": "Enfants",
                "subcategories": [
                    {
                        "name": "École",
                        "lines": [
                            { "name": "Fournitures", "amount": "€ 40" },
                            { "name": "Cantine", "amount": "€ 85" }
                        ]
                    },
                    {
                        "name": "Loisirs",
                        "lines": [
                            { "name": "Activités sportives", "amount": "€ 60" },
                            { "name": "Sorties", "amount": "€ 40" }
                        ]
                    }
                ]
            }
        ]
    },
    "Maison": {
        "categories": [
            {
                "name": "Loyer & Charges",
                "subcategories": [
                    {
                        "name": "Mensualités",
                        "lines": [
                            { "name": "Loyer/Crédit", "amount": "€ 850" },
                            { "name": "Charges", "amount": "€ 120" }
                        ]
                    },
                    {
                        "name": "Factures",
                        "lines": [
                            { "name": "Électricité", "amount": "€ 75" },
                            { "name": "Eau", "amount": "€ 45" },
                            { "name": "Internet/TV", "amount": "€ 40" }
                        ]
                    }
                ]
            },
            {
                "name": "Entretien",
                "subcategories": [
                    {
                        "name": "Réparations",
                        "lines": [
                            { "name": "Petits travaux", "amount": "€ 100" },
                            { "name": "Matériel", "amount": "€ 75" }
                        ]
                    },
                    {
                        "name": "Jardinage",
                        "lines": [
                            { "name": "Plantes", "amount": "€ 40" },
                            { "name": "Outils", "amount": "€ 50" }
                        ]
                    }
                ]
            }
        ]
    },
    "Famille": {
        "categories": [
            {
                "name": "Alimentation",
                "subcategories": [
                    {
                        "name": "Courses hebdomadaires",
                        "lines": [
                            { "name": "Supermarché", "amount": "€ 150" },
                            { "name": "Marché", "amount": "€ 50" }
                        ]
                    },
                    {
                        "name": "Extras",
                        "lines": [
                            { "name": "Repas restaurant", "amount": "€ 80" },
                            { "name": "Livraisons", "amount": "€ 40" }
                        ]
                    }
                ]
            },
            {
                "name": "Éducation",
                "subcategories": [
                    {
                        "name": "Scolarité",
                        "lines": [
                            { "name": "Frais scolaires", "amount": "€ 100" },
                            { "name": "Fournitures", "amount": "€ 70" }
                        ]
                    },
                    {
                        "name": "Activités extrascolaires",
                        "lines": [
                            { "name": "Sport", "amount": "€ 120" },
                            { "name": "Musique", "amount": "€ 90" }
                        ]
                    }
                ]
            },
            {
                "name": "Santé",
                "subcategories": [
                    {
                        "name": "Consultations",
                        "lines": [
                            { "name": "Médecin", "amount": "€ 50" },
                            { "name": "Spécialistes", "amount": "€ 100" }
                        ]
                    },
                    {
                        "name": "Pharmacie",
                        "lines": [
                            { "name": "Médicaments", "amount": "€ 60" },
                            { "name": "Produits santé", "amount": "€ 40" }
                        ]
                    }
                ]
            }
        ]
    },
    "Déménagement": {
        "categories": [
            {
                "name": "Transport",
                "subcategories": [
                    {
                        "name": "Déménageurs",
                        "lines": [
                            { "name": "Entreprise", "amount": "€ 800" },
                            { "name": "Pourboires", "amount": "€ 50" }
                        ]
                    },
                    {
                        "name": "Location",
                        "lines": [
                            { "name": "Camion", "amount": "€ 150" },
                            { "name": "Carburant", "amount": "€ 60" }
                        ]
                    }
                ]
            },
            {
                "name": "Emballage",
                "subcategories": [
                    {
                        "name": "Matériel",
                        "lines": [
                            { "name": "Cartons", "amount": "€ 80" },
                            { "name": "Protections", "amount": "€ 40" },
                            { "name": "Scotch/étiquettes", "amount": "€ 30" }
                        ]
                    }
                ]
            },
            {
                "name": "Logement",
                "subcategories": [
                    {
                        "name": "Ancien logement",
                        "lines": [
                            { "name": "Nettoyage", "amount": "€ 150" },
                            { "name": "Réparations", "amount": "€ 100" }
                        ]
                    },
                    {
                        "name": "Nouveau logement",
                        "lines": [
                            { "name": "Caution", "amount": "€ 1000" },
                            { "name": "Frais d'agence", "amount": "€ 500" },
                            { "name": "Premier loyer", "amount": "€ 800" }
                        ]
                    }
                ]
            }
        ]
    },
    "Rentrée scolaire": {
        "categories": [
            {
                "name": "Fournitures",
                "subcategories": [
                    {
                        "name": "Matériel scolaire",
                        "lines": [
                            { "name": "Cahiers/classeurs", "amount": "€ 40" },
                            { "name": "Stylos/crayons", "amount": "€ 25" },
                            { "name": "Autres fournitures", "amount": "€ 35" }
                        ]
                    },
                    {
                        "name": "Manuels",
                        "lines": [
                            { "name": "Livres", "amount": "€ 80" },
                            { "name": "Cahiers d'exercices", "amount": "€ 30" }
                        ]
                    }
                ]
            },
            {
                "name": "Vêtements",
                "subcategories": [
                    {
                        "name": "Tenues",
                        "lines": [
                            { "name": "Vêtements quotidiens", "amount": "€ 150" },
                            { "name": "Chaussures", "amount": "€ 70" }
                        ]
                    },
                    {
                        "name": "Sport",
                        "lines": [
                            { "name": "Tenue de sport", "amount": "€ 50" },
                            { "name": "Chaussures de sport", "amount": "€ 60" }
                        ]
                    }
                ]
            },
            {
                "name": "Équipement",
                "subcategories": [
                    {
                        "name": "Informatique",
                        "lines": [
                            { "name": "Calculatrice", "amount": "€ 60" },
                            { "name": "Accessoires", "amount": "€ 40" }
                        ]
                    }
                ]
            }
        ]
    },
    "Fêtes de fin d'année": {
        "categories": [
            {
                "name": "Cadeaux",
                "subcategories": [
                    {
                        "name": "Famille",
                        "lines": [
                            { "name": "Parents", "amount": "€ 150" },
                            { "name": "Enfants", "amount": "€ 200" },
                            { "name": "Autres membres", "amount": "€ 150" }
                        ]
                    },
                    {
                        "name": "Amis",
                        "lines": [
                            { "name": "Amis proches", "amount": "€ 120" },
                            { "name": "Collègues", "amount": "€ 50" }
                        ]
                    }
                ]
            },
            {
                "name": "Repas",
                "subcategories": [
                    {
                        "name": "Dîner",
                        "lines": [
                            { "name": "Nourriture", "amount": "€ 150" },
                            { "name": "Boissons", "amount": "€ 70" },
                            { "name": "Desserts", "amount": "€ 40" }
                        ]
                    }
                ]
            },
            {
                "name": "Décoration",
                "subcategories": [
                    {
                        "name": "Maison",
                        "lines": [
                            { "name": "Sapin/Ornements", "amount": "€ 80" },
                            { "name": "Lumières", "amount": "€ 40" },
                            { "name": "Table", "amount": "€ 30" }
                        ]
                    }
                ]
            }
        ]
    },
    "Vacances": {
        "categories": [
            {
                "name": "Transport",
                "subcategories": [
                    {
                        "name": "Aller-retour",
                        "lines": [
                            { "name": "Avion/Train", "amount": "€ 400" },
                            { "name": "Transferts locaux", "amount": "€ 60" }
                        ]
                    },
                    {
                        "name": "Sur place",
                        "lines": [
                            { "name": "Location véhicule", "amount": "€ 200" },
                            { "name": "Transport public", "amount": "€ 50" }
                        ]
                    }
                ]
            },
            {
                "name": "Hébergement",
                "subcategories": [
                    {
                        "name": "Logement",
                        "lines": [
                            { "name": "Hôtel/Airbnb", "amount": "€ 600" }
                        ]
                    }
                ]
            },
            {
                "name": "Restauration",
                "subcategories": [
                    {
                        "name": "Repas",
                        "lines": [
                            { "name": "Restaurants", "amount": "€ 400" },
                            { "name": "Courses", "amount": "€ 150" }
                        ]
                    }
                ]
            },
            {
                "name": "Activités",
                "subcategories": [
                    {
                        "name": "Loisirs",
                        "lines": [
                            { "name": "Visites", "amount": "€ 200" },
                            { "name": "Excursions", "amount": "€ 150" },
                            { "name": "Souvenirs", "amount": "€ 100" }
                        ]
                    }
                ]
            }
        ]
    },
    
    // 💼 Projets professionnels
    "Lancement de produit": {
        "categories": [
            {
                "name": "Communication",
                "subcategories": [
                    {
                        "name": "Marketing",
                        "lines": [
                            { "name": "Visuels", "amount": "€ 150" },
                            { "name": "Réseaux sociaux", "amount": "€ 100" },
                            { "name": "Flyers", "amount": "€ 50" }
                        ]
                    }
                ]
            },
            {
                "name": "Développement produit",
                "subcategories": [
                    {
                        "name": "Production",
                        "lines": [
                            { "name": "Prototype", "amount": "€ 800" },
                            { "name": "Packaging", "amount": "€ 400" }
                        ]
                    }
                ]
            },
            {
                "name": "Événement lancement",
                "subcategories": [
                    {
                        "name": "Organisation",
                        "lines": [
                            { "name": "Lieu", "amount": "€ 500" },
                            { "name": "Traiteur", "amount": "€ 300" },
                            { "name": "Communication", "amount": "€ 200" }
                        ]
                    }
                ]
            }
        ]
    },
    "Création de site web": {
        "categories": [
            {
                "name": "Conception",
                "subcategories": [
                    {
                        "name": "Design",
                        "lines": [
                            { "name": "Maquettes", "amount": "€ 500" },
                            { "name": "UX/UI", "amount": "€ 700" }
                        ]
                    }
                ]
            },
            {
                "name": "Développement",
                "subcategories": [
                    {
                        "name": "Front-end",
                        "lines": [
                            { "name": "Intégration", "amount": "€ 800" },
                            { "name": "Responsive", "amount": "€ 400" }
                        ]
                    },
                    {
                        "name": "Back-end",
                        "lines": [
                            { "name": "Base de données", "amount": "€ 600" },
                            { "name": "Fonctionnalités", "amount": "€ 1000" }
                        ]
                    }
                ]
            },
            {
                "name": "Contenu",
                "subcategories": [
                    {
                        "name": "Médias",
                        "lines": [
                            { "name": "Photos", "amount": "€ 300" },
                            { "name": "Vidéos", "amount": "€ 400" }
                        ]
                    },
                    {
                        "name": "Textes",
                        "lines": [
                            { "name": "Rédaction", "amount": "€ 500" },
                            { "name": "Traduction", "amount": "€ 300" }
                        ]
                    }
                ]
            },
            {
                "name": "Hébergement",
                "subcategories": [
                    {
                        "name": "Services",
                        "lines": [
                            { "name": "Nom de domaine", "amount": "€ 15" },
                            { "name": "Hébergement annuel", "amount": "€ 120" },
                            { "name": "SSL", "amount": "€ 50" }
                        ]
                    }
                ]
            }
        ]
    },
    "Campagne marketing": {
        "categories": [
            {
                "name": "Publicité",
                "subcategories": [
                    {
                        "name": "Digitale",
                        "lines": [
                            { "name": "Google Ads", "amount": "€ 500" },
                            { "name": "Facebook/Instagram", "amount": "€ 400" },
                            { "name": "LinkedIn", "amount": "€ 300" }
                        ]
                    },
                    {
                        "name": "Traditionnelle",
                        "lines": [
                            { "name": "Presse", "amount": "€ 600" },
                            { "name": "Affichage", "amount": "€ 1000" }
                        ]
                    }
                ]
            },
            {
                "name": "Contenu",
                "subcategories": [
                    {
                        "name": "Création",
                        "lines": [
                            { "name": "Design", "amount": "€ 700" },
                            { "name": "Vidéo", "amount": "€ 900" },
                            { "name": "Rédaction", "amount": "€ 500" }
                        ]
                    }
                ]
            },
            {
                "name": "Événementiel",
                "subcategories": [
                    {
                        "name": "Présence",
                        "lines": [
                            { "name": "Stand salon", "amount": "€ 1500" },
                            { "name": "Matériel promotionnel", "amount": "€ 300" }
                        ]
                    }
                ]
            },
            {
                "name": "Analyse",
                "subcategories": [
                    {
                        "name": "Mesure",
                        "lines": [
                            { "name": "Outils analytics", "amount": "€ 200" },
                            { "name": "Études d'impact", "amount": "€ 600" }
                        ]
                    }
                ]
            }
        ]
    },
    "Formation professionnelle": {
        "categories": [
            {
                "name": "Frais pédagogiques",
                "subcategories": [
                    {
                        "name": "Organisme",
                        "lines": [
                            { "name": "Inscription", "amount": "€ 1200" },
                            { "name": "Certification", "amount": "€ 300" }
                        ]
                    },
                    {
                        "name": "Matériel",
                        "lines": [
                            { "name": "Supports", "amount": "€ 100" },
                            { "name": "Logiciels", "amount": "€ 200" }
                        ]
                    }
                ]
            },
            {
                "name": "Déplacement",
                "subcategories": [
                    {
                        "name": "Transport",
                        "lines": [
                            { "name": "Train/Avion", "amount": "€ 250" },
                            { "name": "Local", "amount": "€ 100" }
                        ]
                    },
                    {
                        "name": "Hébergement",
                        "lines": [
                            { "name": "Hôtel", "amount": "€ 400" },
                            { "name": "Repas", "amount": "€ 200" }
                        ]
                    }
                ]
            }
        ]
    },
    "Lancement d'entreprise": {
        "categories": [
            {
                "name": "Formalités",
                "subcategories": [
                    {
                        "name": "Création",
                        "lines": [
                            { "name": "Frais juridiques", "amount": "€ 800" },
                            { "name": "Immatriculation", "amount": "€ 200" }
                        ]
                    },
                    {
                        "name": "Assurances",
                        "lines": [
                            { "name": "RC Pro", "amount": "€ 500" },
                            { "name": "Multirisque", "amount": "€ 400" }
                        ]
                    }
                ]
            },
            {
                "name": "Équipement",
                "subcategories": [
                    {
                        "name": "Matériel",
                        "lines": [
                            { "name": "Informatique", "amount": "€ 2000" },
                            { "name": "Mobilier", "amount": "€ 1500" }
                        ]
                    },
                    {
                        "name": "Local",
                        "lines": [
                            { "name": "Dépôt garantie", "amount": "€ 2000" },
                            { "name": "Loyer", "amount": "€ 1000" },
                            { "name": "Aménagement", "amount": "€ 3000" }
                        ]
                    }
                ]
            },
            {
                "name": "Marketing",
                "subcategories": [
                    {
                        "name": "Communication",
                        "lines": [
                            { "name": "Site web", "amount": "€ 1500" },
                            { "name": "Identité visuelle", "amount": "€ 800" },
                            { "name": "PLV", "amount": "€ 500" }
                        ]
                    }
                ]
            },
            {
                "name": "Trésorerie",
                "subcategories": [
                    {
                        "name": "Fond de roulement",
                        "lines": [
                            { "name": "Stock initial", "amount": "€ 5000" },
                            { "name": "Charges courantes", "amount": "€ 3000" }
                        ]
                    }
                ]
            }
        ]
    },
    
    // 💰 Objectifs financiers
    "Épargne mensuelle": {
        "categories": [
            {
                "name": "Épargne courte",
                "subcategories": [
                    {
                        "name": "Sécurité",
                        "lines": [
                            { "name": "Épargne de précaution", "amount": "€ 200" },
                            { "name": "Projets < 2 ans", "amount": "€ 100" }
                        ]
                    }
                ]
            },
            {
                "name": "Épargne moyenne",
                "subcategories": [
                    {
                        "name": "Projets",
                        "lines": [
                            { "name": "Achat immobilier", "amount": "€ 300" },
                            { "name": "Autres projets", "amount": "€ 100" }
                        ]
                    }
                ]
            },
            {
                "name": "Épargne longue",
                "subcategories": [
                    {
                        "name": "Retraite",
                        "lines": [
                            { "name": "PER", "amount": "€ 150" },
                            { "name": "Assurance-vie", "amount": "€ 100" }
                        ]
                    }
                ]
            }
        ]
    },
    "Remboursement de dettes": {
        "categories": [
            {
                "name": "Dettes prioritaires",
                "subcategories": [
                    {
                        "name": "Crédits à taux élevé",
                        "lines": [
                            { "name": "Crédit à la consommation", "amount": "€ 300" },
                            { "name": "Découvert", "amount": "€ 150" }
                        ]
                    }
                ]
            },
            {
                "name": "Crédits immobiliers",
                "subcategories": [
                    {
                        "name": "Hypothèques",
                        "lines": [
                            { "name": "Prêt principal", "amount": "€ 800" },
                            { "name": "Prêt secondaire", "amount": "€ 200" }
                        ]
                    }
                ]
            },
            {
                "name": "Autres dettes",
                "subcategories": [
                    {
                        "name": "Prêts personnels",
                        "lines": [
                            { "name": "Famille/Amis", "amount": "€ 100" },
                            { "name": "Autres", "amount": "€ 50" }
                        ]
                    }
                ]
            }
        ]
    },
    "Projet \"Gros achat\"": {
        "categories": [
            {
                "name": "Budget d'achat",
                "subcategories": [
                    {
                        "name": "Principal",
                        "lines": [
                            { "name": "Achat bien", "amount": "€ 5000" },
                            { "name": "Accessoires", "amount": "€ 500" }
                        ]
                    }
                ]
            },
            {
                "name": "Frais annexes",
                "subcategories": [
                    {
                        "name": "Taxes & Assurances",
                        "lines": [
                            { "name": "TVA/Taxes", "amount": "€ 1000" },
                            { "name": "Assurance", "amount": "€ 300" }
                        ]
                    },
                    {
                        "name": "Installation",
                        "lines": [
                            { "name": "Livraison", "amount": "€ 200" },
                            { "name": "Mise en service", "amount": "€ 150" }
                        ]
                    }
                ]
            }
        ]
    },
    
    // 🤝 Collectifs & communautaires
    "Cagnotte / tontine": {
        "categories": [
            {
                "name": "Contributions",
                "subcategories": [
                    {
                        "name": "Membres",
                        "lines": [
                            { "name": "Apports mensuels", "amount": "€ 1000" },
                            { "name": "Apports exceptionnels", "amount": "€ 500" }
                        ]
                    }
                ]
            },
            {
                "name": "Gestion",
                "subcategories": [
                    {
                        "name": "Frais",
                        "lines": [
                            { "name": "Frais bancaires", "amount": "€ 50" },
                            { "name": "Administration", "amount": "€ 30" }
                        ]
                    }
                ]
            },
            {
                "name": "Distribution",
                "subcategories": [
                    {
                        "name": "Versements",
                        "lines": [
                            { "name": "Distributions prévues", "amount": "€ 1200" }
                        ]
                    }
                ]
            }
        ]
    },
    "Association caritative": {
        "categories": [
            {
                "name": "Collecte",
                "subcategories": [
                    {
                        "name": "Dons",
                        "lines": [
                            { "name": "Dons particuliers", "amount": "€ 3000" },
                            { "name": "Dons entreprises", "amount": "€ 2000" }
                        ]
                    },
                    {
                        "name": "Événements",
                        "lines": [
                            { "name": "Gala annuel", "amount": "€ 5000" },
                            { "name": "Ventes caritatives", "amount": "€ 1500" }
                        ]
                    }
                ]
            },
            {
                "name": "Fonctionnement",
                "subcategories": [
                    {
                        "name": "Administration",
                        "lines": [
                            { "name": "Salaires", "amount": "€ 2000" },
                            { "name": "Loyer/Charges", "amount": "€ 800" },
                            { "name": "Matériel", "amount": "€ 300" }
                        ]
                    }
                ]
            },
            {
                "name": "Actions",
                "subcategories": [
                    {
                        "name": "Missions",
                        "lines": [
                            { "name": "Projet principal", "amount": "€ 6000" },
                            { "name": "Actions secondaires", "amount": "€ 2000" }
                        ]
                    }
                ]
            }
        ]
    },
    "Budget réunion / AG": {
        "categories": [
            {
                "name": "Logistique",
                "subcategories": [
                    {
                        "name": "Lieu",
                        "lines": [
                            { "name": "Location salle", "amount": "€ 600" },
                            { "name": "Équipement", "amount": "€ 200" }
                        ]
                    }
                ]
            },
            {
                "name": "Participants",
                "subcategories": [
                    {
                        "name": "Accueil",
                        "lines": [
                            { "name": "Restauration", "amount": "€ 500" },
                            { "name": "Documentation", "amount": "€ 150" }
                        ]
                    },
                    {
                        "name": "Déplacements",
                        "lines": [
                            { "name": "Remboursements", "amount": "€ 400" }
                        ]
                    }
                ]
            },
            {
                "name": "Communication",
                "subcategories": [
                    {
                        "name": "Supports",
                        "lines": [
                            { "name": "Présentations", "amount": "€ 100" },
                            { "name": "Compte-rendu", "amount": "€ 50" }
                        ]
                    }
                ]
            }
        ]
    },
    "Fonds commun": {
        "categories": [
            {
                "name": "Apports",
                "subcategories": [
                    {
                        "name": "Participations",
                        "lines": [
                            { "name": "Cotisations régulières", "amount": "€ 1200" },
                            { "name": "Apports exceptionnels", "amount": "€ 500" }
                        ]
                    }
                ]
            },
            {
                "name": "Dépenses",
                "subcategories": [
                    {
                        "name": "Achats communs",
                        "lines": [
                            { "name": "Équipement", "amount": "€ 800" },
                            { "name": "Consommables", "amount": "€ 400" }
                        ]
                    },
                    {
                        "name": "Services",
                        "lines": [
                            { "name": "Abonnements", "amount": "€ 150" },
                            { "name": "Maintenance", "amount": "€ 200" }
                        ]
                    }
                ]
            }
        ]
    }
}
};

function updateTemplateCategories(templateType) {
    console.log('Updating template categories for:', templateType);
    
    // Vérifier si nous avons un modèle prédéfini pour ce type
    if (defaultBudgets[templateType]) {
        console.log('Found template data for:', templateType);
        const categoriesData = defaultBudgets[templateType].categories;
        // Mettre à jour l'interface avec les nouvelles catégories
        updateCategoriesUI(categoriesData);
        return;
    }
    
    // Si aucun modèle prédéfini n'existe, utiliser le comportement par défaut
    let categoriesData = [];
    
    // Définir les catégories et sous-catégories en fonction du modèle choisi
    switch(templateType) {
        case 'Ménage familial':
            categoriesData = [
                {
                    name: 'Ménage',
                    subcategories: [
                        {
                            name: 'Courses alimentaires',
                            lines: [
                                { name: 'Courses semaine 1', amount: '€ 52' },
                                { name: 'Courses semaine 2', amount: '€ 47' }
                            ]
                        },
                        {
                            name: 'Factures',
                            lines: [
                                { name: 'EDF', amount: '€ 78' },
                                { name: 'Internet', amount: '€ 30' }
                            ]
                        },
                        {
                            name: 'Entretien',
                            lines: [
                                { name: 'Produits ménagers', amount: '€ 25' },
                                { name: 'Réparations', amount: '€ 40' }
                            ]
                        }
                    ]
                },
                {
                    name: 'Enfants',
                    subcategories: [
                        {
                            name: 'École',
                            lines: [
                                { name: 'Fournitures', amount: '€ 30' },
                                { name: 'Cantine', amount: '€ 85' }
                            ]
                        },
                        {
                            name: 'Loisirs',
                            lines: [
                                { name: 'Activités sportives', amount: '€ 45' },
                                { name: 'Sorties', amount: '€ 35' }
                            ]
                        }
                    ]
                }
            ];
            break;
        
        case 'Maison':
            categoriesData = [
                {
                    name: 'Loyer & Charges',
                    subcategories: [
                        {
                            name: 'Mensualités',
                            lines: [
                                { name: 'Loyer/Crédit', amount: '€ 850' },
                                { name: 'Charges', amount: '€ 120' }
                            ]
                        },
                        {
                            name: 'Factures',
                            lines: [
                                { name: 'Électricité', amount: '€ 75' },
                                { name: 'Eau', amount: '€ 45' },
                                { name: 'Internet/TV', amount: '€ 40' }
                            ]
                        }
                    ]
                },
                {
                    name: 'Entretien',
                    subcategories: [
                        {
                            name: 'Réparations',
                            lines: [
                                { name: 'Petits travaux', amount: '€ 100' },
                                { name: 'Matériel', amount: '€ 75' }
                            ]
                        },
                        {
                            name: 'Jardinage',
                            lines: [
                                { name: 'Plantes', amount: '€ 40' },
                                { name: 'Outils', amount: '€ 50' }
                            ]
                        }
                    ]
                }
            ];
            break;
        
        case 'Famille':
            categoriesData = [
                {
                    name: 'Alimentation',
                    subcategories: [
                        {
                            name: 'Courses hebdomadaires',
                            lines: [
                                { name: 'Supermarché', amount: '€ 150' },
                                { name: 'Marché', amount: '€ 50' }
                            ]
                        },
                        {
                            name: 'Extras',
                            lines: [
                                { name: 'Repas restaurant', amount: '€ 80' },
                                { name: 'Livraisons', amount: '€ 40' }
                            ]
                        }
                    ]
                },
                {
                    name: 'Éducation',
                    subcategories: [
                        {
                            name: 'Scolarité',
                            lines: [
                                { name: 'Frais scolaires', amount: '€ 100' },
                                { name: 'Fournitures', amount: '€ 70' }
                            ]
                        },
                        {
                            name: 'Activités extrascolaires',
                            lines: [
                                { name: 'Sport', amount: '€ 120' },
                                { name: 'Musique', amount: '€ 90' }
                            ]
                        }
                    ]
                },
                {
                    name: 'Santé',
                    subcategories: [
                        {
                            name: 'Consultations',
                            lines: [
                                { name: 'Médecin', amount: '€ 50' },
                                { name: 'Spécialistes', amount: '€ 100' }
                            ]
                        },
                        {
                            name: 'Pharmacie',
                            lines: [
                                { name: 'Médicaments', amount: '€ 60' },
                                { name: 'Produits santé', amount: '€ 40' }
                            ]
                        }
                    ]
                }
            ];
            break;
        
        // Pour le template Anniversaire existant    
        case 'Anniversaire':
            categoriesData = [
                {
                    name: 'Restauration',
                    subcategories: [
                        {
                            name: 'Traiteur',
                            lines: [
                                { name: 'Menu principal', amount: '€ 150' },
                                { name: 'Desserts', amount: '€ 50' }
                            ]
                        },
                        {
                            name: 'Boissons',
                            lines: [
                                { name: 'Soft drinks', amount: '€ 50' },
                                { name: 'Alcool', amount: '€ 50' }
                            ]
                        }
                    ]
                },
                {
                    name: 'Animation',
                    subcategories: [
                        {
                            name: 'DJ',
                            lines: [
                                { name: 'DJ forfait soirée', amount: '€ 150' }
                            ]
                        },
                        {
                            name: 'Jeux',
                            lines: [
                                { name: 'Matériel de jeux', amount: '€ 50' }
                            ]
                        }
                    ]
                },
                {
                    name: 'Décoration',
                    subcategories: [
                        {
                            name: 'Salle',
                            lines: [
                                { name: 'Ballons/Guirlandes', amount: '€ 60' },
                                { name: 'Centre de table', amount: '€ 40' }
                            ]
                        }
                    ]
                }
            ];
            break;
        
        // Par défaut, conserver les catégories actuelles (ne rien faire)
        default:
            return;
    }
    
    // Mettre à jour l'interface avec les nouvelles catégories
    if (categoriesData.length > 0) {
        updateCategoriesUI(categoriesData);
    }
}

// Fonction pour mettre à jour l'UI avec les nouvelles catégories
function updateCategoriesUI(categoriesData) {
    console.log('Updating categories UI with data:', categoriesData);
    // Trouver le conteneur des catégories
    const expenseCategories = document.querySelector('.expense-categories');
    console.log('Found expense categories container:', expenseCategories);
    const addCategoryContainer = document.querySelector('.add-category-container');
    console.log('Found add category container:', addCategoryContainer);
    const totalBudgetElement = document.querySelector('.total-budget');
    
    // Supprimer les catégories existantes (sauf le bouton d'ajout et le total)
    const existingCategories = document.querySelectorAll('.expense-category');
    existingCategories.forEach(category => {
        category.remove();
    });
    
    // Créer les nouvelles catégories et sous-catégories
    categoriesData.forEach(categoryData => {
        // Créer la catégorie principale
        const category = document.createElement('div');
        category.className = 'expense-category';
        
        // Préparer le HTML de l'en-tête de catégorie
        let categoryHTML = `
            <div class="category-header">
                <h4 class="category-name">${categoryData.name}</h4>
                <span class="category-amount">€ 0</span>
                <div class="category-controls">
                    <button type="button" class="category-toggle open">
                        <i class="fas fa-chevron-up"></i>
                    </button>
                </div>
            </div>
            <div class="subcategories-container open">
        `;
        
        // Ajouter les sous-catégories
        if (categoryData.subcategories && categoryData.subcategories.length > 0) {
            categoryData.subcategories.forEach(subcategoryData => {
                // Ajouter l'HTML de la sous-catégorie
                categoryHTML += `
                    <div class="subcategory">
                        <div class="subcategory-header">
                            <h5 class="subcategory-name">${subcategoryData.name}</h5>
                            <span class="subcategory-amount">€ 0</span>
                            <button type="button" class="subcategory-toggle open">
                                <i class="fas fa-chevron-up"></i>
                            </button>
                        </div>
                        <div class="expense-lines open">
                `;
                
                // Ajouter les lignes de dépenses
                if (subcategoryData.lines && subcategoryData.lines.length > 0) {
                    subcategoryData.lines.forEach(line => {
                        categoryHTML += `
                            <div class="expense-line">
                                <input type="text" class="form-control expense-line-name" value="${line.name}">
                                <input type="text" class="form-control expense-line-amount" value="${line.amount}">
                                <div class="expense-line-actions">
                                    <button type="button" class="btn-sm btn-delete-line">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>
                        `;
                    });
                }
                
                // Ajouter le bouton pour ajouter une ligne
                categoryHTML += `
                            <button type="button" class="add-line-btn">
                                <i class="fas fa-plus"></i> Ajouter une ligne
                            </button>
                        </div>
                    </div>
                `;
            });
        }
        
        // Ajouter le footer avec le bouton pour ajouter une sous-catégorie
        categoryHTML += `
                <div class="subcategory-footer">
                    <button type="button" class="add-subcategory-btn">
                        <i class="fas fa-plus"></i> Ajouter une sous-catégorie
                    </button>
                </div>
            </div>
        `;
        
        // Définir le HTML complet de la catégorie
        category.innerHTML = categoryHTML;
        
        // Insérer la catégorie avant le bouton d'ajout
        expenseCategories.insertBefore(category, addCategoryContainer);
    });
    
    // Réinitialiser les interactions
    initializeExpenseCategories();
    initializeSubcategories();
    
    // Mettre à jour tous les totaux
    const subcategories = document.querySelectorAll('.subcategory');
    subcategories.forEach(subcategory => {
        updateSubcategoryTotal(subcategory);
    });
}

function updateAIAdvice(templateType) {
    let advice = '';
    
    // Define advice based on template type
    switch (templateType) {
        // 🎉 Événementiels
        case 'Anniversaire':
            advice = 'Pensez à réserver l\'animation au moins deux semaines à l\'avance.';
            break;
        case 'Mariage':
            advice = 'Prévoyez 5-10% de budget supplémentaire pour les imprévus de dernière minute.';
            break;
        case 'Baby shower':
            advice = 'Pensez à des animations adaptées pour tous les invités, pas uniquement centrées sur bébé.';
            break;
        case 'Fête d\'entreprise':
            advice = 'Vérifiez les restrictions alimentaires de vos invités avant de finaliser le menu.';
            break;
        case 'Célébration religieuse':
            advice = 'Confirmez les exigences spécifiques du lieu de culte bien à l\'avance.';
            break;
            
        // 🏠 Vie personnelle
        case 'Budget mensuel':
            advice = 'Réservez 10% de votre budget pour les dépenses imprévues.';
            break;
        case 'Ménage familial':
            advice = 'Créez un calendrier pour répartir les dépenses importantes sur plusieurs mois.';
            break;
        case 'Maison':
            advice = 'Prévoyez un budget d\'entretien annuel d\'environ 1% de la valeur de votre logement.';
            break;
        case 'Famille':
            advice = 'Pensez à mettre en place un système d\'épargne pour les projets futurs des enfants.';
            break;
        case 'Déménagement':
            advice = 'Demandez plusieurs devis pour la société de déménagement pour comparer les prix.';
            break;
        case 'Rentrée scolaire':
            advice = 'Établissez une liste précise avant les achats pour éviter les dépenses superflues.';
            break;
        case 'Fêtes de fin d\'année':
            advice = 'Commencez vos achats de cadeaux tôt pour éviter le stress et les ruptures de stock.';
            break;
        case 'Vacances':
            advice = 'Réservez transport et hébergement en avance pour bénéficier des meilleurs tarifs.';
            break;
            
        // 💼 Projets professionnels
        case 'Lancement de produit':
            advice = 'Prévoyez un budget de contingence d\'au moins 15% pour les imprévus.';
            break;
        case 'Création de site web':
            advice = 'N\'oubliez pas d\'inclure les coûts de maintenance annuels dans votre budget.';
            break;
        case 'Campagne marketing':
            advice = 'Testez votre campagne sur un petit segment avant le déploiement complet.';
            break;
        case 'Formation professionnelle':
            advice = 'Vérifiez les possibilités de prise en charge par votre entreprise ou un organisme.';
            break;
        case 'Lancement d\'entreprise':
            advice = 'Prévoyez suffisamment de trésorerie pour couvrir 6 mois de fonctionnement sans revenus.';
            break;
            
        // 💰 Objectifs financiers
        case 'Épargne mensuelle':
            advice = 'Automatisez vos virements d\'épargne dès réception de votre salaire.';
            break;
        case 'Remboursement de dettes':
            advice = 'Commencez par rembourser les dettes aux taux d\'intérêt les plus élevés.';
            break;
        case 'Projet "Gros achat"':
            advice = 'Comparez plusieurs modèles et vendeurs pour obtenir le meilleur rapport qualité-prix.';
            break;
            
        // 🤝 Collectifs & communautaires
        case 'Cagnotte / tontine':
            advice = 'Établissez des règles claires dès le départ pour éviter les malentendus.';
            break;
        case 'Association caritative':
            advice = 'Recherchez des partenariats pour réduire vos coûts opérationnels.';
            break;
        case 'Budget réunion / AG':
            advice = 'Pensez à des alternatives numériques pour réduire les coûts de documentation.';
            break;
        case 'Fonds commun':
            advice = 'Utilisez une application de partage de dépenses pour faciliter la gestion.';
            break;
            
        // Personnalisé
        case 'Personnalisé':
            advice = 'Établissez un calendrier détaillé pour gérer efficacement vos dépenses.';
            break;
        default:
            advice = 'Établissez clairement vos priorités et allouez votre budget en conséquence.';
    }
    
    // Update the advice text
    const adviceElement = document.querySelector('.ai-advice p');
    if (adviceElement) {
        adviceElement.textContent = advice;
    }
}