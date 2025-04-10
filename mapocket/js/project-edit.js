// Fonctions spécifiques à l'édition de projet

// Fonction utilitaire pour obtenir le symbole de devise actuel
function getProjectCurrencySymbol() {
    let currencySymbol = '€';
    try {
        if (typeof getCurrencySymbol === 'function') {
            // Utiliser la fonction du helper si disponible
            currencySymbol = getCurrencySymbol();
        } else {
            // Fallback si le helper n'est pas chargé
            const preferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
            if (preferences.currency && typeof AVAILABLE_CURRENCIES !== 'undefined') {
                const currency = AVAILABLE_CURRENCIES.find(c => c.code === preferences.currency);
                if (currency) {
                    currencySymbol = currency.symbol;
                }
            }
        }
    } catch (error) {
        console.error('Erreur lors de la récupération du symbole de devise:', error);
    }
    return currencySymbol;
}

document.addEventListener('DOMContentLoaded', function() {
    // Vérifier si nous sommes en mode édition
    const urlParams = new URLSearchParams(window.location.search);
    const editMode = urlParams.get('edit') === 'true';
    
    // Obtenir l'ID du projet soit depuis l'URL, soit depuis localStorage
    let projectId = urlParams.get('id');
    
    if (!projectId && editMode) {
        // Si on est en mode édition mais sans ID dans l'URL, vérifier si on a un projet en cours d'édition
        const currentProject = localStorage.getItem('currentProject');
        if (currentProject) {
            try {
                const projectData = JSON.parse(currentProject);
                if (projectData && projectData.id) {
                    projectId = projectData.id;
                    console.log("ID de projet récupéré depuis localStorage:", projectId);
                }
            } catch (error) {
                console.error("Erreur lors de la récupération du projet en cours:", error);
            }
        }
    }
    
    console.log("Mode édition:", editMode, "Project ID:", projectId);

    if (editMode) {
        if (projectId) {
            // Activer le mode édition avec l'ID du projet
            enableEditMode(projectId);
        } else {
            // Si nous sommes en mode édition mais sans ID, afficher un message d'erreur
            alert("Erreur: Aucun projet sélectionné pour l'édition");
            window.location.href = 'index.html';
        }
    } else {
        // Si nous ne sommes pas en mode édition, on est en mode création de projet
        // Rien de spécial à faire ici, le formulaire standard sera affiché
        console.log("Mode création de projet");
        
        // S'assurer que le titre de la page est bien "NOUVEAU PROJET"
        const pageTitle = document.querySelector('.page-title');
        if (pageTitle) {
            pageTitle.textContent = 'NOUVEAU PROJET';
        }
    }
    
    // Toujours configurer les boutons d'interaction
    setupAddLineButtons();
    setupAddSubcategoryButtons();
    setupAddCategoryButton();
});

// Fonction pour activer le mode édition de projet
function enableEditMode(projectId) {
    console.log("Activation du mode édition pour le projet:", projectId);
    
    // Charger le projet existant depuis localStorage
    let savedProjects = [];
    try {
        savedProjects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
    } catch (error) {
        console.error('Erreur lors du chargement des projets sauvegardés:', error);
        return;
    }
    
    // Trouver le projet avec l'ID correspondant
    const projectToEdit = savedProjects.find(project => project.id === projectId);
    if (!projectToEdit) {
        console.error('Projet non trouvé avec ID:', projectId);
        console.log('Projets disponibles:', savedProjects);
        return;
    }
    
    console.log('Projet à modifier:', projectToEdit);
    
    // Changer le titre de la page
    const pageTitle = document.querySelector('.page-title');
    if (pageTitle) {
        console.log("Changement du titre de la page en 'MODIFIER PROJET'");
        pageTitle.textContent = 'MODIFIER PROJET';
        pageTitle.style.color = '#2979ff'; // Mettre en bleu pour renforcer la visibilité
    }
    
    // Changer le type de projet si défini
    const projectType = document.querySelector('.project-type');
    if (projectType && projectToEdit.template) {
        projectType.textContent = projectToEdit.template;
        
        // Sélectionner également le bon modèle dans l'accordéon
        const templateOption = document.querySelector(`.template-option[data-template="${projectToEdit.template}"]`);
        if (templateOption) {
            // Désélectionner tout autre option précédemment sélectionnée
            document.querySelectorAll('.template-option.selected').forEach(option => {
                option.classList.remove('selected');
            });
            
            // Sélectionner cette option
            templateOption.classList.add('selected');
            
            // Ouvrir l'accordéon parent
            const accordionContent = templateOption.closest('.accordion-content');
            if (accordionContent) {
                accordionContent.style.display = 'block';
                const accordionHeader = accordionContent.previousElementSibling;
                if (accordionHeader) {
                    accordionHeader.classList.add('active');
                    accordionHeader.querySelector('i').classList.replace('fa-chevron-down', 'fa-chevron-up');
                }
            }
        }
    }
    
    // Charger les données du projet dans le formulaire
    const projectNameInput = document.getElementById('projectName');
    if (projectNameInput && projectToEdit.projectName) {
        projectNameInput.value = projectToEdit.projectName;
    }
    
    const projectDateInput = document.getElementById('projectDate');
    if (projectDateInput && projectToEdit.projectDate) {
        projectDateInput.value = projectToEdit.projectDate;
    }
    
    const totalBudgetInput = document.getElementById('totalBudget');
    if (totalBudgetInput && projectToEdit.totalBudget) {
        totalBudgetInput.value = projectToEdit.totalBudget;
    }
    
    // Mettre à jour les champs supplémentaires s'ils existent
    const projectEndDateInput = document.getElementById('projectEndDate');
    if (projectEndDateInput && projectToEdit.projectEndDate) {
        projectEndDateInput.value = projectToEdit.projectEndDate;
    }
    
    const projectStatusSelect = document.getElementById('projectStatus');
    if (projectStatusSelect && projectToEdit.status) {
        projectStatusSelect.value = projectToEdit.status;
    }
    
    const linkToWalletCheckbox = document.getElementById('linkToWallet');
    if (linkToWalletCheckbox && projectToEdit.linkToWallet !== undefined) {
        linkToWalletCheckbox.checked = projectToEdit.linkToWallet;
    }
    
    // Modifier l'apparence du formulaire pour le mode édition
    const formContainer = document.querySelector('.project-form-container');
    if (formContainer) {
        formContainer.classList.add('edit-mode');
    }
    
    // Ajouter un message indiquant qu'on est en mode édition
    const formHeader = document.querySelector('.form-header');
    if (formHeader) {
        // Vérifier si la notice existe déjà
        let editModeNotice = formHeader.querySelector('.edit-mode-notice');
        if (!editModeNotice) {
            editModeNotice = document.createElement('div');
            editModeNotice.className = 'edit-mode-notice';
            editModeNotice.innerHTML = '<i class="fas fa-pencil-alt"></i> Mode Édition';
            formHeader.appendChild(editModeNotice);
        }
    }
    
    // Préparer les boutons de l'interface en mode édition
    setupEditModeButtons(projectId, projectToEdit);
    
    // Charger les catégories et sous-catégories du projet
    if (projectToEdit.categories && projectToEdit.categories.length > 0) {
        loadProjectCategories(projectToEdit.categories);
    }
}

// Fonction pour configurer les boutons en mode édition
function setupEditModeButtons(projectId, projectToEdit) {
    // Trouver le conteneur des boutons
    const formActions = document.querySelector('.form-actions');
    if (!formActions) return;
    
    // Vider le conteneur des boutons existants
    formActions.innerHTML = '';
    
    // Ajouter le bouton de sauvegarde des modifications
    const saveButton = document.createElement('button');
    saveButton.type = 'button';
    saveButton.id = 'saveChangesBtn';
    saveButton.className = 'btn btn-primary';
    saveButton.innerHTML = '<i class="fas fa-save"></i> Enregistrer les modifications';
    formActions.appendChild(saveButton);
    
    // Ajouter le bouton pour enregistrer et quitter
    const saveExitButton = document.createElement('button');
    saveExitButton.type = 'button';
    saveExitButton.id = 'saveExitBtn';
    saveExitButton.className = 'btn btn-success';
    saveExitButton.innerHTML = '<i class="fas fa-check"></i> Enregistrer et terminer';
    formActions.appendChild(saveExitButton);
    
    // Ajouter le bouton pour annuler les modifications
    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.id = 'cancelEditBtn';
    cancelButton.className = 'btn btn-outline-secondary';
    cancelButton.innerHTML = '<i class="fas fa-times"></i> Annuler';
    formActions.appendChild(cancelButton);
    
    // Ajouter les gestionnaires d'événements
    saveButton.addEventListener('click', function() {
        // Collecter les données du formulaire
        const formData = getProjectData();
        // Conserver l'ID et la date de création du projet original
        formData.id = projectId;
        formData.createdAt = projectToEdit.createdAt;
        
        // Mise à jour du projet sans redirection
        updateExistingProject(formData, projectToEdit, projectId, false);
    });
    
    saveExitButton.addEventListener('click', function() {
        // Collecter les données du formulaire
        const formData = getProjectData();
        // Conserver l'ID et la date de création du projet original
        formData.id = projectId;
        formData.createdAt = projectToEdit.createdAt;
        
        // Mise à jour du projet avec redirection vers l'accueil
        updateExistingProject(formData, projectToEdit, projectId, true);
    });
    
    cancelButton.addEventListener('click', function() {
        if (confirm('Voulez-vous vraiment annuler les modifications ? Les changements non sauvegardés seront perdus.')) {
            // Effacer les données d'édition
            localStorage.removeItem('projectInEditing');
            localStorage.removeItem('currentProject');
            
            // Rediriger vers la page d'accueil
            window.location.href = 'index.html';
        }
    });
}

// Fonction pour charger les catégories du projet
function loadProjectCategories(categories) {
    // Vider le conteneur existant
    const categoriesContainer = document.getElementById('expenseCategories');
    if (!categoriesContainer) return;
    
    categoriesContainer.innerHTML = '';
    
    // Ajouter chaque catégorie
    categories.forEach(category => {
        // Créer l'élément de catégorie
        const categoryElement = document.createElement('div');
        categoryElement.className = 'expense-category';
        
        // En-tête de la catégorie
        const categoryHeader = document.createElement('div');
        categoryHeader.className = 'category-header';
        
        const categoryTitle = document.createElement('h3');
        categoryTitle.className = 'category-name';
        categoryTitle.textContent = category.name;
        
        const categoryAmount = document.createElement('span');
        categoryAmount.className = 'category-amount';
        categoryAmount.textContent = category.amount;
        
        categoryHeader.appendChild(categoryTitle);
        categoryHeader.appendChild(categoryAmount);
        
        // Actions de la catégorie
        const categoryActions = document.createElement('div');
        categoryActions.className = 'category-actions';
        
        const addSubcategoryBtn = document.createElement('button');
        addSubcategoryBtn.type = 'button';
        addSubcategoryBtn.className = 'add-subcategory-btn';
        addSubcategoryBtn.innerHTML = '<i class="fas fa-plus"></i> Ajouter sous-catégorie';
        
        const deleteCategoryBtn = document.createElement('button');
        deleteCategoryBtn.type = 'button';
        deleteCategoryBtn.className = 'delete-category-btn';
        deleteCategoryBtn.innerHTML = '<i class="fas fa-trash"></i>';
        
        categoryActions.appendChild(addSubcategoryBtn);
        categoryActions.appendChild(deleteCategoryBtn);
        
        // Conteneur des sous-catégories
        const subcategoriesContainer = document.createElement('div');
        subcategoriesContainer.className = 'subcategories';
        
        // Ajouter chaque sous-catégorie
        if (category.subcategories && category.subcategories.length > 0) {
            category.subcategories.forEach(subcategory => {
                const subcategoryElement = createSubcategoryElement(subcategory);
                subcategoriesContainer.appendChild(subcategoryElement);
            });
        }
        
        // Assembler la catégorie
        categoryElement.appendChild(categoryHeader);
        categoryElement.appendChild(categoryActions);
        categoryElement.appendChild(subcategoriesContainer);
        
        // Ajouter au conteneur principal
        categoriesContainer.appendChild(categoryElement);
    });
    
    // Initialiser les fonctionnalités interactives
    console.log('Initialisation des interactions de sous-catégories');
    
    // Ajouter les gestionnaires d'événements pour les boutons d'ajout de catégorie
    const addCategoryBtn = document.querySelector('.add-category-btn');
    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', function() {
            const categoryName = prompt('Nom de la nouvelle catégorie:');
            if (categoryName) {
                addNewCategory(categoryName);
            }
        });
    }
    
    // Ajouter les gestionnaires d'événements pour les boutons d'ajout de sous-catégorie
    const addSubcategoryBtns = document.querySelectorAll('.add-subcategory-btn');
    addSubcategoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const categoryElement = this.closest('.expense-category');
            const subcategoryName = prompt('Nom de la nouvelle sous-catégorie:');
            if (subcategoryName && subcategoryName.trim() !== '' && categoryElement) {
                addNewSubcategory(categoryElement, subcategoryName);
                
                // Notification visuelle
                showNotification('Sous-catégorie ajoutée avec succès', 'success');
            } else if (subcategoryName && subcategoryName.trim() === '') {
                showNotification('Le nom de la sous-catégorie ne peut pas être vide', 'error');
            }
        });
    });
    
    // Ajouter les gestionnaires d'événements pour les boutons d'ajout de ligne
    const addLineBtns = document.querySelectorAll('.add-expense-line-btn');
    addLineBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const subcategoryElement = this.closest('.subcategory');
            const expenseLinesContainer = subcategoryElement.querySelector('.expense-lines');
            if (expenseLinesContainer) {
                addNewExpenseLine(expenseLinesContainer);
                
                // Notification visuelle
                showNotification('Ligne de dépense ajoutée', 'success');
            }
        });
    });
    
    // Ajouter les gestionnaires d'événements pour les boutons de suppression
    const deleteCategoryBtns = document.querySelectorAll('.delete-category-btn');
    deleteCategoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            if (confirm('Voulez-vous vraiment supprimer cette catégorie et toutes ses sous-catégories ?')) {
                const categoryElement = this.closest('.expense-category');
                categoryElement.remove();
            }
        });
    });
    
    const deleteSubcategoryBtns = document.querySelectorAll('.delete-subcategory-btn');
    deleteSubcategoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            if (confirm('Voulez-vous vraiment supprimer cette sous-catégorie et toutes ses lignes ?')) {
                const subcategoryElement = this.closest('.subcategory');
                subcategoryElement.remove();
            }
        });
    });
    
    const deleteLineBtns = document.querySelectorAll('.delete-line-btn');
    deleteLineBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const lineElement = this.closest('.expense-line');
            lineElement.remove();
        });
    });
    
    // Initialiser le calcul du budget
    initializeBudgetCalculation();
}

// Fonction pour créer un élément de sous-catégorie
function createSubcategoryElement(subcategory) {
    const subcategoryElement = document.createElement('div');
    subcategoryElement.className = 'subcategory';
    
    // En-tête de la sous-catégorie
    const subcategoryHeader = document.createElement('div');
    subcategoryHeader.className = 'subcategory-header';
    
    const subcategoryName = document.createElement('h4');
    subcategoryName.className = 'subcategory-name';
    subcategoryName.textContent = subcategory.name;
    
    const subcategoryAmount = document.createElement('span');
    subcategoryAmount.className = 'subcategory-amount';
    subcategoryAmount.textContent = subcategory.amount;
    
    subcategoryHeader.appendChild(subcategoryName);
    subcategoryHeader.appendChild(subcategoryAmount);
    
    // Actions de la sous-catégorie
    const subcategoryActions = document.createElement('div');
    subcategoryActions.className = 'subcategory-actions';
    
    const addLineBtn = document.createElement('button');
    addLineBtn.type = 'button';
    addLineBtn.className = 'add-expense-line-btn';
    addLineBtn.innerHTML = '<i class="fas fa-plus"></i> Ajouter ligne';
    
    const deleteSubcategoryBtn = document.createElement('button');
    deleteSubcategoryBtn.type = 'button';
    deleteSubcategoryBtn.className = 'delete-subcategory-btn';
    deleteSubcategoryBtn.innerHTML = '<i class="fas fa-trash"></i>';
    
    subcategoryActions.appendChild(addLineBtn);
    subcategoryActions.appendChild(deleteSubcategoryBtn);
    
    // Conteneur des lignes de dépenses
    const expenseLinesContainer = document.createElement('div');
    expenseLinesContainer.className = 'expense-lines';
    
    // Ajouter chaque ligne de dépense
    if (subcategory.lines && subcategory.lines.length > 0) {
        subcategory.lines.forEach(line => {
            const lineElement = createExpenseLineElement(line);
            expenseLinesContainer.appendChild(lineElement);
        });
    }
    
    // Assembler la sous-catégorie
    subcategoryElement.appendChild(subcategoryHeader);
    subcategoryElement.appendChild(subcategoryActions);
    subcategoryElement.appendChild(expenseLinesContainer);
    
    return subcategoryElement;
}

// Fonction pour créer un élément de ligne de dépense
function createExpenseLineElement(line) {
    const lineElement = document.createElement('div');
    lineElement.className = 'expense-line';
    
    const lineNameInput = document.createElement('input');
    lineNameInput.type = 'text';
    lineNameInput.className = 'expense-line-name';
    lineNameInput.value = line.name;
    lineNameInput.placeholder = 'Nom de la dépense';
    
    const lineAmountInput = document.createElement('input');
    lineAmountInput.type = 'text';
    lineAmountInput.className = 'expense-line-amount';
    lineAmountInput.value = line.amount;
    lineAmountInput.placeholder = '0.00';
    
    const deleteLineBtn = document.createElement('button');
    deleteLineBtn.type = 'button';
    deleteLineBtn.className = 'delete-line-btn';
    deleteLineBtn.innerHTML = '<i class="fas fa-times"></i>';
    
    lineElement.appendChild(lineNameInput);
    lineElement.appendChild(lineAmountInput);
    lineElement.appendChild(deleteLineBtn);
    
    return lineElement;
}

// Fonction pour obtenir les données du formulaire
function getProjectData() {
    // Récupération des valeurs du formulaire
    const projectName = document.getElementById('projectName').value;
    const projectDate = document.getElementById('projectDate').value;
    const totalBudget = document.getElementById('totalBudget').value;
    
    // Récupération du modèle sélectionné
    const selectedTemplate = document.querySelector('.template-option.selected');
    const template = selectedTemplate ? selectedTemplate.getAttribute('data-template') : 'Personnalisé';
    
    // Récupération des catégories
    const categories = [];
    const categoryElements = document.querySelectorAll('.expense-category');
    
    categoryElements.forEach(categoryEl => {
        const categoryNameEl = categoryEl.querySelector('.category-name');
        const categoryAmountEl = categoryEl.querySelector('.category-amount');
        
        if (categoryNameEl && categoryAmountEl) {
            const categoryName = categoryNameEl.textContent;
            const categoryAmount = categoryAmountEl.textContent;
            
            const subcategories = [];
            const subcategoryElements = categoryEl.querySelectorAll('.subcategory');
            
            subcategoryElements.forEach(subcategoryEl => {
                const subcategoryNameEl = subcategoryEl.querySelector('.subcategory-name');
                const subcategoryAmountEl = subcategoryEl.querySelector('.subcategory-amount');
                
                if (subcategoryNameEl && subcategoryAmountEl) {
                    const subcategoryName = subcategoryNameEl.textContent;
                    const subcategoryAmount = subcategoryAmountEl.textContent;
                    
                    const lines = [];
                    const lineElements = subcategoryEl.querySelectorAll('.expense-line');
                    
                    lineElements.forEach(lineEl => {
                        const lineNameEl = lineEl.querySelector('.expense-line-name');
                        const lineAmountEl = lineEl.querySelector('.expense-line-amount');
                        
                        if (lineNameEl && lineAmountEl) {
                            lines.push({
                                name: lineNameEl.value,
                                amount: lineAmountEl.value
                            });
                        }
                    });
                    
                    subcategories.push({
                        name: subcategoryName,
                        amount: subcategoryAmount,
                        lines: lines
                    });
                }
            });
            
            categories.push({
                name: categoryName,
                amount: categoryAmount,
                subcategories: subcategories
            });
        }
    });
    
    // Création de l'objet de projet
    const projectData = {
        projectName: projectName,
        projectDate: projectDate,
        totalBudget: totalBudget,
        template: template,
        categories: categories,
        linkToWallet: document.getElementById('linkToWallet') ? document.getElementById('linkToWallet').checked : false
    };
    
    return projectData;
}

// Fonction pour ajouter une nouvelle catégorie
function addNewCategory(categoryName) {
    const categoriesContainer = document.getElementById('expenseCategories');
    if (!categoriesContainer) return;
    
    // Obtenir le symbole de la devise actuelle
    let currencySymbol = '€';
    try {
        const preferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
        if (preferences.currency) {
            if (typeof AVAILABLE_CURRENCIES !== 'undefined') {
                const currency = AVAILABLE_CURRENCIES.find(c => c.code === preferences.currency);
                if (currency) {
                    currencySymbol = currency.symbol;
                }
            }
        }
    } catch (error) {
        console.error('Erreur lors de la récupération de la devise:', error);
    }
    
    // Créer l'élément de catégorie
    const categoryElement = document.createElement('div');
    categoryElement.className = 'expense-category';
    
    // En-tête de la catégorie
    const categoryHeader = document.createElement('div');
    categoryHeader.className = 'category-header';
    
    const categoryTitle = document.createElement('h3');
    categoryTitle.className = 'category-name';
    categoryTitle.textContent = categoryName;
    
    const categoryAmount = document.createElement('span');
    categoryAmount.className = 'category-amount';
    categoryAmount.textContent = `${currencySymbol} 0.00`;
    
    categoryHeader.appendChild(categoryTitle);
    categoryHeader.appendChild(categoryAmount);
    
    // Actions de la catégorie
    const categoryActions = document.createElement('div');
    categoryActions.className = 'category-actions';
    
    const addSubcategoryBtn = document.createElement('button');
    addSubcategoryBtn.type = 'button';
    addSubcategoryBtn.className = 'add-subcategory-btn';
    addSubcategoryBtn.innerHTML = '<i class="fas fa-plus"></i> Ajouter sous-catégorie';
    
    const deleteCategoryBtn = document.createElement('button');
    deleteCategoryBtn.type = 'button';
    deleteCategoryBtn.className = 'delete-category-btn';
    deleteCategoryBtn.innerHTML = '<i class="fas fa-trash"></i>';
    
    categoryActions.appendChild(addSubcategoryBtn);
    categoryActions.appendChild(deleteCategoryBtn);
    
    // Conteneur des sous-catégories
    const subcategoriesContainer = document.createElement('div');
    subcategoriesContainer.className = 'subcategories';
    
    // Assembler la catégorie
    categoryElement.appendChild(categoryHeader);
    categoryElement.appendChild(categoryActions);
    categoryElement.appendChild(subcategoriesContainer);
    
    // Ajouter au conteneur principal
    categoriesContainer.appendChild(categoryElement);
    
    // Ajouter les gestionnaires d'événements pour le bouton d'ajout de sous-catégorie
    addSubcategoryBtn.addEventListener('click', function() {
        const subcategoryName = prompt('Nom de la nouvelle sous-catégorie:');
        if (subcategoryName) {
            addNewSubcategory(categoryElement, subcategoryName);
        }
    });
    
    // Ajouter les gestionnaires d'événements pour le bouton de suppression
    deleteCategoryBtn.addEventListener('click', function() {
        if (confirm('Voulez-vous vraiment supprimer cette catégorie et toutes ses sous-catégories ?')) {
            categoryElement.remove();
        }
    });
}

// Fonction pour ajouter une nouvelle sous-catégorie
function addNewSubcategory(categoryElement, subcategoryName) {
    const subcategoriesContainer = categoryElement.querySelector('.subcategories');
    if (!subcategoriesContainer) return;
    
    // Obtenir le symbole de la devise actuelle
    let currencySymbol = '€';
    try {
        const preferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
        if (preferences.currency) {
            if (typeof AVAILABLE_CURRENCIES !== 'undefined') {
                const currency = AVAILABLE_CURRENCIES.find(c => c.code === preferences.currency);
                if (currency) {
                    currencySymbol = currency.symbol;
                }
            }
        }
    } catch (error) {
        console.error('Erreur lors de la récupération de la devise:', error);
    }
    
    // Créer l'élément de sous-catégorie
    const subcategoryElement = document.createElement('div');
    subcategoryElement.className = 'subcategory';
    
    // En-tête de la sous-catégorie
    const subcategoryHeader = document.createElement('div');
    subcategoryHeader.className = 'subcategory-header';
    
    const subcategoryTitle = document.createElement('h4');
    subcategoryTitle.className = 'subcategory-name';
    subcategoryTitle.textContent = subcategoryName;
    
    const subcategoryAmount = document.createElement('span');
    subcategoryAmount.className = 'subcategory-amount';
    subcategoryAmount.textContent = `${currencySymbol} 0.00`;
    
    subcategoryHeader.appendChild(subcategoryTitle);
    subcategoryHeader.appendChild(subcategoryAmount);
    
    // Actions de la sous-catégorie
    const subcategoryActions = document.createElement('div');
    subcategoryActions.className = 'subcategory-actions';
    
    const addLineBtn = document.createElement('button');
    addLineBtn.type = 'button';
    addLineBtn.className = 'add-expense-line-btn';
    addLineBtn.innerHTML = '<i class="fas fa-plus"></i> Ajouter ligne';
    
    const deleteSubcategoryBtn = document.createElement('button');
    deleteSubcategoryBtn.type = 'button';
    deleteSubcategoryBtn.className = 'delete-subcategory-btn';
    deleteSubcategoryBtn.innerHTML = '<i class="fas fa-trash"></i>';
    
    subcategoryActions.appendChild(addLineBtn);
    subcategoryActions.appendChild(deleteSubcategoryBtn);
    
    // Conteneur des lignes de dépenses
    const expenseLinesContainer = document.createElement('div');
    expenseLinesContainer.className = 'expense-lines';
    
    // Assembler la sous-catégorie
    subcategoryElement.appendChild(subcategoryHeader);
    subcategoryElement.appendChild(subcategoryActions);
    subcategoryElement.appendChild(expenseLinesContainer);
    
    // Ajouter à la catégorie
    subcategoriesContainer.appendChild(subcategoryElement);
    
    // Ajouter les gestionnaires d'événements pour le bouton d'ajout de ligne
    addLineBtn.addEventListener('click', function() {
        addNewExpenseLine(expenseLinesContainer);
    });
    
    // Ajouter les gestionnaires d'événements pour le bouton de suppression
    deleteSubcategoryBtn.addEventListener('click', function() {
        if (confirm('Voulez-vous vraiment supprimer cette sous-catégorie et toutes ses lignes ?')) {
            subcategoryElement.remove();
        }
    });
}

// Fonction pour ajouter une nouvelle ligne de dépense
function addNewExpenseLine(expenseLinesContainer) {
    // Obtenir le symbole de la devise actuelle
    let currencySymbol = getProjectCurrencySymbol();
    
    // Créer l'élément de ligne de dépense dans le style exact de l'image de référence
    const lineElement = document.createElement('div');
    lineElement.className = 'expense-line';
    
    // Créer le nom de la dépense (à gauche)
    const lineNameSpan = document.createElement('span');
    lineNameSpan.className = 'expense-line-name editable-field';
    lineNameSpan.textContent = 'Nouvelle dépense';
    lineNameSpan.addEventListener('click', function() {
        makeFieldEditable(this, 'text');
    });
    
    // Créer le montant (à droite)
    const lineAmountSpan = document.createElement('span');
    lineAmountSpan.className = 'expense-line-amount editable-field';
    lineAmountSpan.textContent = `${currencySymbol} 0`;
    lineAmountSpan.addEventListener('click', function() {
        makeFieldEditable(this, 'number');
    });
    
    // Créer le bouton de suppression (à l'extrême droite)
    const deleteLineBtn = document.createElement('button');
    deleteLineBtn.type = 'button';
    deleteLineBtn.className = 'delete-line-btn';
    deleteLineBtn.innerHTML = '<i class="fas fa-times"></i>';
    
    // Assembler la ligne
    lineElement.appendChild(lineNameSpan);
    lineElement.appendChild(lineAmountSpan);
    lineElement.appendChild(deleteLineBtn);
    
    // Ajouter à la sous-catégorie
    expenseLinesContainer.appendChild(lineElement);
    
    // Ajouter l'événement de suppression
    deleteLineBtn.addEventListener('click', function() {
        lineElement.remove();
        updateBudgetCalculation();
    });
    
    // Mise à jour des calculs de budget
    updateBudgetCalculation();
    
    return lineElement;
}

// Fonction pour configurer les boutons d'ajout de ligne
function setupAddLineButtons() {
    // Sélectionner tous les boutons d'ajout de ligne existants (comme ceux du HTML d'origine)
    const addLineBtns = document.querySelectorAll('.add-line-btn, .add-expense-line-btn');
    addLineBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const subcategoryElement = this.closest('.subcategory');
            const expenseLinesContainer = subcategoryElement.querySelector('.expense-lines');
            if (expenseLinesContainer) {
                // Utiliser la nouvelle fonction d'ajout de ligne
                addNewExpenseLine(expenseLinesContainer);
                
                // Notification visuelle
                showNotification('Ligne de dépense ajoutée', 'success');
            }
        });
    });
}

// Fonction pour configurer les boutons d'ajout de sous-catégorie
// Fonction pour créer une sous-catégorie dans un conteneur spécifié
function createSubcategoryInContainer(container, subcategoryName) {
    // Obtenir le symbole de la devise actuelle
    let currencySymbol = getProjectCurrencySymbol();
    
    // Créer l'élément de sous-catégorie
    const subcategoryElement = document.createElement('div');
    subcategoryElement.className = 'subcategory';
    
    // En-tête de la sous-catégorie
    const subcategoryHeader = document.createElement('div');
    subcategoryHeader.className = 'subcategory-header';
    
    const subcategoryTitle = document.createElement('h5');
    subcategoryTitle.className = 'subcategory-name editable-field';
    subcategoryTitle.textContent = subcategoryName;
    subcategoryTitle.setAttribute('data-original-value', subcategoryName);
    
    const subcategoryAmount = document.createElement('span');
    subcategoryAmount.className = 'subcategory-amount editable-field';
    subcategoryAmount.textContent = `${currencySymbol} 0.00`;
    
    // Ajouter la possibilité de modifier le nom de la sous-catégorie en cliquant dessus
    subcategoryTitle.addEventListener('click', function() {
        makeFieldEditable(this, 'text');
    });
    
    // Ajouter la possibilité de modifier le montant de la sous-catégorie en cliquant dessus
    subcategoryAmount.addEventListener('click', function() {
        makeFieldEditable(this, 'number');
    });
    
    subcategoryHeader.appendChild(subcategoryTitle);
    subcategoryHeader.appendChild(subcategoryAmount);
    
    // Actions de la sous-catégorie
    const subcategoryActions = document.createElement('div');
    subcategoryActions.className = 'subcategory-actions';
    
    const addLineBtn = document.createElement('button');
    addLineBtn.type = 'button';
    addLineBtn.className = 'add-expense-line-btn';
    addLineBtn.innerHTML = '<i class="fas fa-plus"></i> Ajouter ligne';
    
    const deleteSubcategoryBtn = document.createElement('button');
    deleteSubcategoryBtn.type = 'button';
    deleteSubcategoryBtn.className = 'delete-subcategory-btn';
    deleteSubcategoryBtn.innerHTML = '<i class="fas fa-trash"></i>';
    
    subcategoryActions.appendChild(addLineBtn);
    subcategoryActions.appendChild(deleteSubcategoryBtn);
    
    // Conteneur des lignes de dépenses
    const linesContainer = document.createElement('div');
    linesContainer.className = 'expense-lines';
    
    // Assembler la sous-catégorie
    subcategoryElement.appendChild(subcategoryHeader);
    subcategoryElement.appendChild(subcategoryActions);
    subcategoryElement.appendChild(linesContainer);
    
    // Ajouter au conteneur spécifié (avant le footer s'il existe)
    const subcategoryFooter = container.querySelector('.subcategory-footer');
    if (subcategoryFooter) {
        container.insertBefore(subcategoryElement, subcategoryFooter);
    } else {
        container.appendChild(subcategoryElement);
    }
    
    // Ajouter les gestionnaires d'événements
    deleteSubcategoryBtn.addEventListener('click', function() {
        if (confirm('Voulez-vous vraiment supprimer cette sous-catégorie et toutes ses lignes ?')) {
            subcategoryElement.remove();
        }
    });
    
    // Ajouter le gestionnaire pour ajouter des lignes de dépense
    addLineBtn.addEventListener('click', function() {
        showAddExpenseLineForm(linesContainer);
    });
    
    return subcategoryElement;
}

// Fonction pour rendre un champ modifiable
function makeFieldEditable(element, type = 'text') {
    // Vérifier si le champ est déjà en mode édition
    if (element.querySelector('input')) return;
    
    // Sauvegarder la valeur actuelle
    const currentValue = element.textContent.trim();
    const originalValue = element.getAttribute('data-original-value') || currentValue;
    
    // Créer un formulaire inline
    const form = document.createElement('div');
    form.className = 'inline-form';
    
    // Créer l'input avec la valeur actuelle
    const input = document.createElement('input');
    input.type = type === 'number' ? 'number' : 'text';
    input.value = type === 'number' ? parseMonetaryValue(currentValue) : currentValue;
    input.className = 'form-control';
    if (type === 'number') {
        input.min = '0';
        input.step = '0.01';
    }
    
    // Créer les boutons de sauvegarde et d'annulation
    const saveBtn = document.createElement('button');
    saveBtn.innerHTML = '<i class="fas fa-check"></i>';
    saveBtn.type = 'button';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.innerHTML = '<i class="fas fa-times"></i>';
    cancelBtn.type = 'button';
    cancelBtn.className = 'cancel';
    
    // Ajouter les éléments au formulaire
    form.appendChild(input);
    form.appendChild(saveBtn);
    form.appendChild(cancelBtn);
    
    // Vider l'élément et ajouter le formulaire
    element.textContent = '';
    element.appendChild(form);
    
    // Focus sur l'input
    input.focus();
    
    // Gestionnaire pour le bouton de sauvegarde
    saveBtn.addEventListener('click', function() {
        let newValue = input.value.trim();
        if (type === 'number') {
            // Formater avec le symbole de devise
            const currencySymbol = getProjectCurrencySymbol();
            newValue = `${currencySymbol} ${parseFloat(newValue).toFixed(2)}`;
        }
        
        // Mettre à jour le contenu de l'élément
        element.textContent = newValue;
        
        // Mettre à jour les calculs si nécessaire
        updateBudgetCalculation();
    });
    
    // Gestionnaire pour le bouton d'annulation
    cancelBtn.addEventListener('click', function() {
        element.textContent = currentValue;
    });
    
    // Gestionnaire pour la touche Enter et Escape
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            saveBtn.click();
        } else if (e.key === 'Escape') {
            cancelBtn.click();
        }
    });
}

// Fonction pour afficher le formulaire d'ajout de ligne de dépense
function showAddExpenseLineForm(container) {
    // Vérifier si un formulaire d'ajout de ligne existe déjà
    if (container.querySelector('.expense-line-form')) {
        return; // Éviter les doublons
    }
    
    // Créer le formulaire d'ajout de ligne
    const lineForm = document.createElement('div');
    lineForm.className = 'expense-line-form';
    lineForm.innerHTML = `
        <h4>Ajouter une ligne de dépense</h4>
        <div class="form-group">
            <label for="newLineName">Description</label>
            <input type="text" id="newLineName" class="form-control" placeholder="Ex: Menu principal">
        </div>
        <div class="form-group">
            <label for="newLineAmount">Montant</label>
            <input type="number" id="newLineAmount" class="form-control" min="0" step="0.01" placeholder="0.00">
        </div>
        <div class="form-action-buttons">
            <button type="button" class="btn-cancel-line">Annuler</button>
            <button type="button" class="btn-add-line">Ajouter</button>
        </div>
    `;
    
    // Ajouter le formulaire au conteneur
    container.appendChild(lineForm);
    
    // Focus sur le champ de nom
    setTimeout(() => {
        lineForm.querySelector('#newLineName').focus();
    }, 100);
    
    // Gestionnaire pour le bouton d'annulation
    lineForm.querySelector('.btn-cancel-line').addEventListener('click', function() {
        lineForm.remove();
    });
    
    // Gestionnaire pour le bouton d'ajout
    lineForm.querySelector('.btn-add-line').addEventListener('click', function() {
        const lineName = lineForm.querySelector('#newLineName').value.trim();
        const lineAmount = lineForm.querySelector('#newLineAmount').value;
        
        if (!lineName) {
            alert('Veuillez saisir une description pour la ligne');
            return;
        }
        
        // Créer la ligne de dépense
        createExpenseLine(container, lineName, lineAmount);
        
        // Supprimer le formulaire
        lineForm.remove();
        
        // Mettre à jour les calculs
        updateBudgetCalculation();
    });
}

// Fonction pour créer une ligne de dépense
function createExpenseLine(container, name, amount) {
    // Obtenir le symbole de la devise actuelle
    let currencySymbol = getProjectCurrencySymbol();
    
    // Créer l'élément de ligne
    const lineElement = document.createElement('div');
    lineElement.className = 'expense-line';
    
    // Nom de la ligne
    const lineName = document.createElement('span');
    lineName.className = 'expense-line-name editable-field';
    lineName.textContent = name;
    lineName.setAttribute('data-original-value', name);
    
    // Montant de la ligne
    const lineAmount = document.createElement('span');
    lineAmount.className = 'expense-line-amount editable-field';
    lineAmount.textContent = `${currencySymbol} ${parseFloat(amount || 0).toFixed(2)}`;
    
    // Bouton de suppression
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'delete-line-btn';
    deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
    
    // Ajouter les éléments à la ligne
    lineElement.appendChild(lineName);
    lineElement.appendChild(lineAmount);
    lineElement.appendChild(deleteBtn);
    
    // Ajouter au conteneur
    container.appendChild(lineElement);
    
    // Ajouter la possibilité de modifier les champs
    lineName.addEventListener('click', function() {
        makeFieldEditable(this, 'text');
    });
    
    lineAmount.addEventListener('click', function() {
        makeFieldEditable(this, 'number');
    });
    
    // Ajouter le gestionnaire d'événement pour la suppression
    deleteBtn.addEventListener('click', function() {
        lineElement.remove();
        updateBudgetCalculation();
    });
    
    return lineElement;
}

function setupAddSubcategoryButtons() {
    // Sélectionner tous les boutons d'ajout de sous-catégorie existants
    const addSubcategoryBtns = document.querySelectorAll('.add-subcategory-btn');
    addSubcategoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const categoryElement = this.closest('.expense-category');
            const subcategoriesContainer = categoryElement.querySelector('.subcategories-container');
            
            if (!subcategoriesContainer) return;
            
            // Vérifier si un formulaire d'ajout de sous-catégorie existe déjà
            if (subcategoriesContainer.querySelector('.subcategory-form')) {
                return; // Éviter les doublons
            }
            
            // Créer le formulaire d'ajout de sous-catégorie
            const subcategoryForm = document.createElement('div');
            subcategoryForm.className = 'subcategory-form';
            subcategoryForm.innerHTML = `
                <h4>Ajouter une sous-catégorie</h4>
                <div class="form-group">
                    <label for="newSubcategoryName">Nom de la sous-catégorie</label>
                    <input type="text" id="newSubcategoryName" class="form-control" placeholder="Ex: Traiteur">
                </div>
                <div class="form-action-buttons">
                    <button type="button" class="btn-cancel-subcategory">Annuler</button>
                    <button type="button" class="btn-add-subcategory">Ajouter</button>
                </div>
            `;
            
            // Insérer le formulaire dans le conteneur
            const subcategoryFooter = subcategoriesContainer.querySelector('.subcategory-footer');
            if (subcategoryFooter) {
                subcategoriesContainer.insertBefore(subcategoryForm, subcategoryFooter);
            } else {
                subcategoriesContainer.appendChild(subcategoryForm);
            }
            
            // Focus sur le champ de nom
            setTimeout(() => {
                subcategoryForm.querySelector('#newSubcategoryName').focus();
            }, 100);
            
            // Gestionnaire pour le bouton d'annulation
            subcategoryForm.querySelector('.btn-cancel-subcategory').addEventListener('click', function() {
                subcategoryForm.remove();
            });
            
            // Gestionnaire pour le bouton d'ajout
            subcategoryForm.querySelector('.btn-add-subcategory').addEventListener('click', function() {
                const subcategoryName = subcategoryForm.querySelector('#newSubcategoryName').value.trim();
                if (!subcategoryName) {
                    alert('Veuillez saisir un nom de sous-catégorie');
                    return;
                }
                
                // Créer la sous-catégorie
                createSubcategoryInContainer(subcategoriesContainer, subcategoryName);
                
                // Supprimer le formulaire
                subcategoryForm.remove();
            });
        });
    });
}

// Fonction pour configurer le bouton d'ajout de catégorie
function setupAddCategoryButton() {
    const addCategoryBtn = document.getElementById('addMainCategoryBtn');
    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', function() {
            // Vérifier si un formulaire d'ajout de catégorie existe déjà
            if (document.querySelector('.category-form')) {
                return; // Éviter les doublons
            }
            
            // Récupérer le conteneur des catégories
            const categoriesContainer = document.getElementById('expenseCategories');
            if (!categoriesContainer) return;
            
            // Créer le formulaire d'ajout de catégorie
            const categoryForm = document.createElement('div');
            categoryForm.className = 'category-form';
            categoryForm.innerHTML = `
                <h4>Ajouter une nouvelle catégorie</h4>
                <div class="form-group">
                    <label for="newCategoryName">Nom de la catégorie</label>
                    <input type="text" id="newCategoryName" class="form-control" placeholder="Ex: Restauration">
                </div>
                <div class="form-action-buttons">
                    <button type="button" class="btn-cancel-category">Annuler</button>
                    <button type="button" class="btn-add-category">Ajouter</button>
                </div>
            `;
            
            // Insérer le formulaire avant le bouton d'ajout
            categoriesContainer.insertBefore(categoryForm, addCategoryBtn.parentNode);
            
            // Focus sur le champ de nom
            setTimeout(() => {
                document.getElementById('newCategoryName').focus();
            }, 100);
            
            // Gestionnaire pour le bouton d'annulation
            categoryForm.querySelector('.btn-cancel-category').addEventListener('click', function() {
                categoryForm.remove();
            });
            
            // Gestionnaire pour le bouton d'ajout
            categoryForm.querySelector('.btn-add-category').addEventListener('click', function() {
                const categoryName = document.getElementById('newCategoryName').value.trim();
                if (!categoryName) {
                    alert('Veuillez saisir un nom de catégorie');
                    return;
                }
                
                // Obtenir le symbole de la devise actuelle
                let currencySymbol = getProjectCurrencySymbol();
                
                // Supprimer le formulaire
                categoryForm.remove();
            
            // Créer l'élément de catégorie
            const categoryElement = document.createElement('div');
            categoryElement.className = 'expense-category';
            
            // En-tête de la catégorie
            const categoryHeader = document.createElement('div');
            categoryHeader.className = 'category-header';
            
            const categoryTitle = document.createElement('h4');
            categoryTitle.className = 'category-name';
            categoryTitle.textContent = categoryName;
            
            const categoryAmount = document.createElement('span');
            categoryAmount.className = 'category-amount';
            categoryAmount.id = `cat${Date.now()}-amount`; // ID unique
            categoryAmount.textContent = `${currencySymbol} 0`;
            
            const categoryControls = document.createElement('div');
            categoryControls.className = 'category-controls';
            
            const categoryToggle = document.createElement('button');
            categoryToggle.type = 'button';
            categoryToggle.className = 'category-toggle open';
            categoryToggle.innerHTML = '<i class="fas fa-chevron-up"></i>';
            
            categoryControls.appendChild(categoryToggle);
            
            categoryHeader.appendChild(categoryTitle);
            categoryHeader.appendChild(categoryAmount);
            categoryHeader.appendChild(categoryControls);
            
            // Conteneur des sous-catégories
            const subcategoriesContainer = document.createElement('div');
            subcategoriesContainer.className = 'subcategories-container open';
            
            // Pied de page de catégorie pour ajouter des sous-catégories
            const subcategoryFooter = document.createElement('div');
            subcategoryFooter.className = 'subcategory-footer';
            
            const addSubcategoryBtn = document.createElement('button');
            addSubcategoryBtn.type = 'button';
            addSubcategoryBtn.className = 'add-subcategory-btn';
            addSubcategoryBtn.innerHTML = '<i class="fas fa-plus"></i> Ajouter une sous-catégorie';
            
            subcategoryFooter.appendChild(addSubcategoryBtn);
            subcategoriesContainer.appendChild(subcategoryFooter);
            
            // Assembler la catégorie
            categoryElement.appendChild(categoryHeader);
            categoryElement.appendChild(subcategoriesContainer);
            
            // Ajouter au conteneur principal des catégories
            const categoriesContainer = document.getElementById('expenseCategories');
            
            // Trouver le point d'insertion (avant le bouton d'ajout de catégorie principale)
            const addCategoryContainer = document.querySelector('.add-category-container');
            if (categoriesContainer && addCategoryContainer) {
                categoriesContainer.insertBefore(categoryElement, addCategoryContainer);
            } else if (categoriesContainer) {
                categoriesContainer.appendChild(categoryElement);
            }
            
            // Initialiser les fonctionnalités de la catégorie
            categoryToggle.addEventListener('click', function() {
                this.classList.toggle('open');
                subcategoriesContainer.classList.toggle('open');
                
                // Changer l'icône
                const icon = this.querySelector('i');
                if (icon) {
                    if (this.classList.contains('open')) {
                        icon.className = 'fas fa-chevron-up';
                    } else {
                        icon.className = 'fas fa-chevron-down';
                    }
                }
            });
            
            // Initialiser l'événement d'ajout de sous-catégorie
            addSubcategoryBtn.addEventListener('click', function() {
                // Vérifier si un formulaire d'ajout de sous-catégorie existe déjà dans cette catégorie
                if (subcategoriesContainer.querySelector('.subcategory-form')) {
                    return; // Éviter les doublons
                }
                
                // Créer le formulaire d'ajout de sous-catégorie
                const subcategoryForm = document.createElement('div');
                subcategoryForm.className = 'subcategory-form';
                subcategoryForm.innerHTML = `
                    <h4>Ajouter une sous-catégorie</h4>
                    <div class="form-group">
                        <label for="newSubcategoryName">Nom de la sous-catégorie</label>
                        <input type="text" id="newSubcategoryName" class="form-control" placeholder="Ex: Traiteur">
                    </div>
                    <div class="form-action-buttons">
                        <button type="button" class="btn-cancel-subcategory">Annuler</button>
                        <button type="button" class="btn-add-subcategory">Ajouter</button>
                    </div>
                `;
                
                // Insérer le formulaire avant le footer
                subcategoriesContainer.insertBefore(subcategoryForm, subcategoryFooter);
                
                // Focus sur le champ de nom
                setTimeout(() => {
                    subcategoryForm.querySelector('#newSubcategoryName').focus();
                }, 100);
                
                // Gestionnaire pour le bouton d'annulation
                subcategoryForm.querySelector('.btn-cancel-subcategory').addEventListener('click', function() {
                    subcategoryForm.remove();
                });
                
                // Gestionnaire pour le bouton d'ajout
                subcategoryForm.querySelector('.btn-add-subcategory').addEventListener('click', function() {
                    const subcategoryName = subcategoryForm.querySelector('#newSubcategoryName').value.trim();
                    if (!subcategoryName) {
                        alert('Veuillez saisir un nom de sous-catégorie');
                        return;
                    }
                    
                    // Créer la sous-catégorie avec la fonction existante
                    createSubcategoryInContainer(subcategoriesContainer, subcategoryName);
                    
                    // Supprimer le formulaire
                    subcategoryForm.remove();
                });
            });
        });
    }
}

// Fonction pour mettre à jour un projet existant
function updateExistingProject(formData, originalProject, projectId, shouldRedirect) {
    // Charger les projets existants
    let savedProjects = [];
    try {
        savedProjects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
        if (!Array.isArray(savedProjects)) {
            console.error('savedProjects n\'est pas un tableau:', savedProjects);
            savedProjects = [];
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des projets sauvegardés:', error);
        savedProjects = [];
    }
    
    // Remplacer le projet existant par le projet mis à jour
    const updatedProjects = savedProjects.map(project => {
        if (project.id === projectId) {
            console.log('Mise à jour du projet:', formData);
            return formData;
        }
        return project;
    });
    
    try {
        // Sauvegarder la liste mise à jour
        localStorage.setItem('savedProjects', JSON.stringify(updatedProjects));
        console.log('Projet mis à jour avec succès. Total projets:', updatedProjects.length);
        
        // Afficher une notification de succès
        if (window.showNotification) {
            if (shouldRedirect) {
                window.showNotification('Projet mis à jour avec succès!', 'success');
            } else {
                window.showNotification('Modifications enregistrées!', 'success');
            }
        } else {
            if (shouldRedirect) {
                alert('Projet mis à jour avec succès!');
            } else {
                alert('Modifications enregistrées!');
            }
        }
        
        // Si l'option de liaison au portefeuille a changé, mettre à jour les projets liés
        if (formData.linkToWallet !== originalProject.linkToWallet) {
            let walletData = JSON.parse(localStorage.getItem('walletData') || '{"linkedProjects":[]}');
            
            if (formData.linkToWallet) {
                // Ajouter à la liste des projets liés s'il n'y est pas déjà
                if (!walletData.linkedProjects.includes(projectId)) {
                    walletData.linkedProjects.push(projectId);
                }
            } else {
                // Retirer de la liste des projets liés
                walletData.linkedProjects = walletData.linkedProjects.filter(id => id !== projectId);
            }
            
            localStorage.setItem('walletData', JSON.stringify(walletData));
        }
        
        // Si on doit rediriger, nettoyer et aller à l'accueil
        if (shouldRedirect) {
            // Effacer le projet en cours d'édition
            localStorage.removeItem('projectInEditing');
            localStorage.removeItem('currentProject');
            
            // Rediriger vers la page d'accueil
            window.location.href = 'index.html';
        }
        
    } catch (error) {
        console.error('Erreur lors de la mise à jour du projet:', error);
        alert('Erreur lors de la mise à jour du projet. Veuillez réessayer.');
    }
}