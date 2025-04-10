// Fonctions spécifiques à l'édition de projet
document.addEventListener('DOMContentLoaded', function() {
    // Vérifier si nous sommes en mode édition
    const urlParams = new URLSearchParams(window.location.search);
    const editMode = urlParams.get('edit') === 'true';
    const projectId = urlParams.get('id');
    
    console.log("Mode édition:", editMode, "Project ID:", projectId);

    if (editMode && projectId) {
        // Activer le mode édition
        enableEditMode(projectId);
    }
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
    // Nous n'avons pas besoin d'appeler ces fonctions car elles sont déjà dans project.js
    // Si on les appelle elles seront définies dans ce contexte aussi
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