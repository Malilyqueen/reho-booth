// Solution pour le problème de conservation des données lors de l'édition de projet
document.addEventListener('DOMContentLoaded', function() {
    // Vérifier si nous sommes en mode édition
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('edit') === 'true' && urlParams.get('id')) {
        const projectId = urlParams.get('id');
        console.log("Mode édition détecté pour le projet:", projectId);
        
        // Différer le chargement des données pour s'assurer que tout est initialisé
        setTimeout(() => {
            loadProjectDataForEditing(projectId);
        }, 500);
    }
});

// Fonction pour charger les données du projet en mode édition
function loadProjectDataForEditing(projectId) {
    console.log("Chargement des données du projet pour édition:", projectId);
    
    try {
        // Récupérer tous les projets sauvegardés
        const savedProjects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
        
        // Trouver le projet spécifique
        const projectToEdit = savedProjects.find(p => p.id === projectId);
        if (!projectToEdit) {
            console.error("Projet non trouvé:", projectId);
            showNotification("Projet non trouvé. Veuillez réessayer.", "error");
            return;
        }
        
        // Stocker une copie du projet pour référence
        localStorage.setItem('currentEditingProject', JSON.stringify(projectToEdit));
        console.log("Projet à modifier:", projectToEdit);
        
        // Mise à jour visuelle - titre et apparence
        updateUIForEditMode();
        
        // Remplir tous les champs du formulaire avec les données du projet
        fillFormWithProjectData(projectToEdit);
        
        // Configuration des boutons spécifiques au mode édition
        setupEditModeButtons(projectId, projectToEdit);
        
        // Afficher un message de succès
        showNotification("Projet chargé avec succès pour modification", "success");
    } catch (error) {
        console.error("Erreur lors du chargement des données pour édition:", error);
        showNotification("Erreur lors du chargement du projet. Veuillez réessayer.", "error");
    }
}

// Fonction pour mettre à jour l'interface utilisateur en mode édition
function updateUIForEditMode() {
    // Changer le titre de la page
    const pageTitle = document.querySelector('.page-title');
    if (pageTitle) {
        pageTitle.textContent = 'MODIFIER PROJET';
        pageTitle.style.color = '#2979ff';
        pageTitle.style.fontWeight = 'bold';
    }
    
    // Ajouter une classe pour le mode édition
    const formContainer = document.querySelector('.project-form-container');
    if (formContainer) {
        formContainer.classList.add('edit-mode');
    }
    
    // Ajouter un message indiquant qu'on est en mode édition
    const formHeader = document.querySelector('.form-header');
    if (formHeader) {
        // Supprimer toute notice précédente
        const oldNotice = formHeader.querySelector('.edit-mode-notice');
        if (oldNotice) {
            oldNotice.remove();
        }
        
        // Ajouter la nouvelle notice
        const editModeNotice = document.createElement('div');
        editModeNotice.className = 'edit-mode-notice';
        editModeNotice.innerHTML = '<i class="fas fa-pencil-alt"></i> Mode Édition';
        editModeNotice.style.backgroundColor = '#2979ff';
        editModeNotice.style.color = 'white';
        editModeNotice.style.padding = '5px 10px';
        editModeNotice.style.borderRadius = '5px';
        editModeNotice.style.marginBottom = '10px';
        editModeNotice.style.display = 'inline-block';
        formHeader.appendChild(editModeNotice);
    }
}

// Fonction pour remplir le formulaire avec les données du projet
function fillFormWithProjectData(project) {
    // Informations de base du projet
    setInputValue('projectName', project.projectName);
    setInputValue('projectDate', project.projectDate);
    setInputValue('totalBudget', project.totalBudget);
    
    // Détails supplémentaires
    if (project.projectEndDate) {
        setInputValue('projectEndDate', project.projectEndDate);
    }
    
    // Statut du projet
    if (project.projectStatus) {
        setSelectValue('projectStatus', project.projectStatus);
    } else if (project.status) {
        setSelectValue('projectStatus', project.status);
    }
    
    // Options
    setCheckboxValue('linkToWallet', project.linkToWallet);
    setCheckboxValue('createWishlist', project.createWishlist);
    
    // Sélectionner le modèle
    if (project.template) {
        selectTemplateOption(project.template);
    }
    
    // Charger les catégories de dépenses
    if (project.categories && project.categories.length > 0) {
        loadCategories(project.categories);
    }
    
    // Réinitialiser les datepickers
    setTimeout(() => {
        if (typeof resetDatePicker === 'function') {
            resetDatePicker('projectDate', project.projectDate);
            if (project.projectEndDate) {
                resetDatePicker('projectEndDate', project.projectEndDate);
            }
        }
    }, 600);
}

// Fonction pour définir la valeur d'un champ de saisie
function setInputValue(id, value) {
    const input = document.getElementById(id);
    if (input) {
        input.value = value;
        console.log(`Champ ${id} défini sur ${value}`);
    } else {
        console.warn(`Champ ${id} non trouvé`);
    }
}

// Fonction pour définir la valeur d'un menu déroulant
function setSelectValue(id, value) {
    const select = document.getElementById(id);
    if (select) {
        select.value = value;
        console.log(`Sélection ${id} définie sur ${value}`);
    } else {
        console.warn(`Sélection ${id} non trouvée`);
    }
}

// Fonction pour définir l'état d'une case à cocher
function setCheckboxValue(id, checked) {
    const checkbox = document.getElementById(id);
    if (checkbox) {
        checkbox.checked = checked;
        console.log(`Case à cocher ${id} définie sur ${checked}`);
    } else {
        console.warn(`Case à cocher ${id} non trouvée`);
    }
}

// Fonction pour sélectionner une option de modèle
function selectTemplateOption(template) {
    // Désélectionner toutes les options
    const allOptions = document.querySelectorAll('.template-option');
    allOptions.forEach(option => option.classList.remove('selected'));
    
    // Sélectionner l'option correspondante
    const targetOption = document.querySelector(`.template-option[data-template="${template}"]`);
    if (targetOption) {
        targetOption.classList.add('selected');
        
        // Ouvrir l'accordéon parent
        const accordionContent = targetOption.closest('.accordion-content');
        if (accordionContent) {
            // Fermer tous les autres panneaux d'accordéon
            document.querySelectorAll('.accordion-content').forEach(content => {
                if (content !== accordionContent) {
                    content.style.display = 'none';
                    const header = content.previousElementSibling;
                    if (header) {
                        header.classList.remove('active');
                        const icon = header.querySelector('i');
                        if (icon) icon.className = 'fas fa-chevron-down';
                    }
                }
            });
            
            // Ouvrir ce panneau
            accordionContent.style.display = 'block';
            const accordionHeader = accordionContent.previousElementSibling;
            if (accordionHeader) {
                accordionHeader.classList.add('active');
                const icon = accordionHeader.querySelector('i');
                if (icon) icon.className = 'fas fa-chevron-up';
            }
        }
        
        console.log(`Option de modèle ${template} sélectionnée`);
    } else {
        console.warn(`Option de modèle ${template} non trouvée`);
    }
}

// Fonction pour charger les catégories
function loadCategories(categories) {
    const categoriesContainer = document.getElementById('expenseCategories');
    if (!categoriesContainer) {
        console.error("Conteneur de catégories non trouvé");
        return;
    }
    
    // Vider le conteneur existant
    categoriesContainer.innerHTML = '';
    
    // Ajouter chaque catégorie
    categories.forEach(category => {
        // Créer l'élément de catégorie avec son contenu
        const categoryElement = createCategoryElement(category);
        
        // Ajouter au conteneur principal
        categoriesContainer.appendChild(categoryElement);
    });
    
    // Initialiser les interactions
    initializeCategoryInteractions();
    
    console.log(`${categories.length} catégories chargées avec succès`);
}

// Fonction pour créer un élément de sous-catégorie
function createSubcategoryElement(subcategory) {
    console.log("Création d'un élément de sous-catégorie:", subcategory);
    
    const subcategoryElement = document.createElement('div');
    subcategoryElement.className = 'subcategory';
    
    // En-tête de la sous-catégorie
    const subcategoryHeader = document.createElement('div');
    subcategoryHeader.className = 'subcategory-header';
    
    const subcategoryName = document.createElement('h4');
    subcategoryName.className = 'subcategory-name editable-field';
    
    // Si le nom de sous-catégorie est vide, ajouter un titre par défaut modifiable
    if (!subcategory.name || subcategory.name.trim() === '') {
        subcategoryName.textContent = 'Nouvelle sous-catégorie';
        subcategoryName.classList.add('default-title');
    } else {
        subcategoryName.textContent = subcategory.name;
    }
    
    subcategoryName.setAttribute('data-original-value', subcategory.name);
    
    // Ajouter le gestionnaire d'événement pour l'édition
    subcategoryName.addEventListener('click', function() {
        if (typeof makeFieldEditable === 'function') {
            makeFieldEditable(this, 'text');
        } else {
            this.contentEditable = true;
            this.focus();
        }
    });
    
    const subcategoryAmount = document.createElement('span');
    subcategoryAmount.className = 'subcategory-amount editable-field';
    subcategoryAmount.textContent = subcategory.amount;
    subcategoryAmount.setAttribute('data-original-value', subcategory.amount);
    
    // Ajouter le gestionnaire d'événement pour l'édition
    subcategoryAmount.addEventListener('click', function() {
        if (typeof makeFieldEditable === 'function') {
            makeFieldEditable(this, 'number');
        } else {
            this.contentEditable = true;
            this.focus();
        }
    });
    
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
    
    // Ajouter les gestionnaires d'événements pour le bouton d'ajout de ligne
    addLineBtn.addEventListener('click', function() {
        addNewExpenseLine(expenseLinesContainer);
    });
    
    // Ajouter les gestionnaires d'événements pour le bouton de suppression
    deleteSubcategoryBtn.addEventListener('click', function() {
        if (confirm('Voulez-vous vraiment supprimer cette sous-catégorie et toutes ses lignes ?')) {
            subcategoryElement.remove();
            
            // Recalculer le budget total après suppression
            setTimeout(function() {
                if (typeof calculateAndDisplayTotalBudget === 'function') {
                    calculateAndDisplayTotalBudget();
                }
            }, 300);
        }
    });
    
    return subcategoryElement;
}

// Fonction pour créer un élément de ligne de dépense
function createExpenseLineElement(line) {
    console.log("Création d'un élément de ligne de dépense:", line);
    
    const lineElement = document.createElement('div');
    lineElement.className = 'expense-line';
    
    const lineNameInput = document.createElement('input');
    lineNameInput.type = 'text';
    lineNameInput.className = 'expense-line-name';
    lineNameInput.value = line.name || '';
    lineNameInput.placeholder = 'Nom de la dépense';
    
    const lineAmountInput = document.createElement('input');
    lineAmountInput.type = 'text';
    lineAmountInput.className = 'expense-line-amount';
    lineAmountInput.value = line.amount || '';
    lineAmountInput.placeholder = '0.00';
    
    const deleteLineBtn = document.createElement('button');
    deleteLineBtn.type = 'button';
    deleteLineBtn.className = 'delete-line-btn';
    deleteLineBtn.innerHTML = '<i class="fas fa-times"></i>';
    
    lineElement.appendChild(lineNameInput);
    lineElement.appendChild(lineAmountInput);
    lineElement.appendChild(deleteLineBtn);
    
    // Ajouter le gestionnaire d'événement pour la suppression
    deleteLineBtn.addEventListener('click', function() {
        lineElement.remove();
        
        // Recalculer le budget total après suppression
        setTimeout(function() {
            if (typeof calculateAndDisplayTotalBudget === 'function') {
                calculateAndDisplayTotalBudget();
            }
        }, 300);
    });
    
    // Ajouter les gestionnaires d'événement pour le calcul du budget
    lineAmountInput.addEventListener('input', function() {
        setTimeout(function() {
            if (typeof calculateAndDisplayTotalBudget === 'function') {
                calculateAndDisplayTotalBudget();
            }
        }, 300);
    });
    
    lineAmountInput.addEventListener('change', function() {
        setTimeout(function() {
            if (typeof calculateAndDisplayTotalBudget === 'function') {
                calculateAndDisplayTotalBudget();
            }
        }, 300);
    });
    
    return lineElement;
}

// Fonction pour ajouter une nouvelle ligne de dépense
function addNewExpenseLine(expenseLinesContainer) {
    console.log("Ajout d'une nouvelle ligne de dépense");
    
    // Obtenir le symbole de devise actuel
    let currencySymbol = getCurrencySymbol();
    
    // Créer une nouvelle ligne vide
    const line = {
        name: '',
        amount: `${currencySymbol} 0.00`
    };
    
    // Créer l'élément de ligne
    const lineElement = createExpenseLineElement(line);
    
    // Ajouter au conteneur
    expenseLinesContainer.appendChild(lineElement);
    
    // Focus sur le nom pour commencer à saisir
    const nameInput = lineElement.querySelector('.expense-line-name');
    if (nameInput) {
        nameInput.focus();
    }
}

// Fonction pour obtenir le symbole de devise
function getCurrencySymbol() {
    try {
        // Vérifier d'abord si la devise est stockée dans le formulaire
        const totalBudgetInput = document.getElementById('totalBudget');
        if (totalBudgetInput && totalBudgetInput.value) {
            const match = totalBudgetInput.value.match(/^([^\d]+)/);
            if (match && match[1]) {
                return match[1].trim();
            }
        }
        
        // Sinon, essayer de récupérer depuis les préférences utilisateur
        const preferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
        if (preferences.currency) {
            if (typeof AVAILABLE_CURRENCIES !== 'undefined') {
                const currency = AVAILABLE_CURRENCIES.find(c => c.code === preferences.currency);
                if (currency) {
                    return currency.symbol;
                }
            }
            
            // Correspondances de base pour les devises courantes
            const symbols = {
                'EUR': '€',
                'USD': '$',
                'GBP': '£',
                'JPY': '¥',
                'MAD': 'DH',
                'AED': 'AED'
            };
            
            return symbols[preferences.currency] || preferences.currency;
        }
        
        // Valeur par défaut
        return '€';
    } catch (error) {
        console.error('Erreur lors de la récupération du symbole de devise:', error);
        return '€';
    }
}

// Fonction pour créer un élément de catégorie
function createCategoryElement(category) {
    console.log("Création d'un élément de catégorie:", category);
    
    // Créer l'élément de catégorie
    const categoryElement = document.createElement('div');
    categoryElement.className = 'expense-category';
    
    // En-tête de la catégorie
    const categoryHeader = document.createElement('div');
    categoryHeader.className = 'category-header';
    
    const categoryTitle = document.createElement('h3');
    categoryTitle.className = 'category-name editable-field';
    categoryTitle.textContent = category.name;
    categoryTitle.setAttribute('data-original-value', category.name);
    
    // Ajouter le gestionnaire d'événement pour l'édition
    categoryTitle.addEventListener('click', function() {
        if (typeof makeFieldEditable === 'function') {
            makeFieldEditable(this, 'text');
        } else {
            this.contentEditable = true;
            this.focus();
        }
    });
    
    const categoryAmount = document.createElement('span');
    categoryAmount.className = 'category-amount editable-field';
    categoryAmount.textContent = category.amount;
    categoryAmount.setAttribute('data-original-value', category.amount);
    
    // Ajouter le gestionnaire d'événement pour l'édition
    categoryAmount.addEventListener('click', function() {
        if (typeof makeFieldEditable === 'function') {
            makeFieldEditable(this, 'number');
        } else {
            this.contentEditable = true;
            this.focus();
        }
    });
    
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
            // Recalculer le budget total après suppression
            setTimeout(function() {
                if (typeof calculateAndDisplayTotalBudget === 'function') {
                    calculateAndDisplayTotalBudget();
                }
            }, 300);
        }
    });
    
    return categoryElement;
}

// Fonction pour initialiser les interactions de catégories
function initializeCategoryInteractions() {
    // Cette fonction réutilise la logique existante dans le fichier project-edit.js
    // Elle initialise tous les gestionnaires d'événements pour les boutons d'ajout,
    // de suppression, etc. dans les catégories et sous-catégories
    
    if (typeof setupAddCategoryButton === 'function') {
        setupAddCategoryButton();
    }
    
    if (typeof setupAddSubcategoryButtons === 'function') {
        setupAddSubcategoryButtons();
    }
    
    if (typeof setupAddLineButtons === 'function') {
        setupAddLineButtons();
    }
    
    if (typeof initializeBudgetCalculation === 'function') {
        initializeBudgetCalculation();
    }
    
    console.log("Interactions de catégories initialisées");
}

// Fonction pour configurer les boutons spécifiques au mode édition
function setupEditModeButtons(projectId, projectToEdit) {
    // Cette fonction réutilise la logique existante dans le fichier project-edit.js
    // Elle configure les boutons spécifiques au mode édition (Enregistrer, Annuler, etc.)
    
    if (typeof window.setupEditModeButtonsOriginal === 'function') {
        window.setupEditModeButtonsOriginal(projectId, projectToEdit);
        return;
    }
    
    // Configuration de secours
    const formActions = document.querySelector('.form-actions');
    if (!formActions) {
        console.error("Conteneur d'actions non trouvé");
        return;
    }
    
    // Vider le conteneur des boutons existants
    formActions.innerHTML = '';
    
    // Créer et ajouter le bouton pour enregistrer les modifications
    const saveButton = document.createElement('button');
    saveButton.type = 'button';
    saveButton.id = 'saveChangesBtn';
    saveButton.className = 'btn btn-primary';
    saveButton.innerHTML = '<i class="fas fa-save"></i> Enregistrer les modifications';
    formActions.appendChild(saveButton);
    
    // Ajouter le gestionnaire d'événements
    saveButton.addEventListener('click', function() {
        // Collecter les données du formulaire
        const formData = {};
        
        // Récupérer les champs de base
        formData.projectName = document.getElementById('projectName').value;
        formData.projectDate = document.getElementById('projectDate').value;
        formData.totalBudget = document.getElementById('totalBudget').value;
        
        // Conserver l'ID et la date de création
        formData.id = projectId;
        formData.createdAt = projectToEdit.createdAt;
        
        // Mise à jour du projet
        updateProject(formData, projectToEdit);
        
        // Notification visuelle
        showNotification('Modifications enregistrées avec succès', 'success');
    });
    
    console.log("Boutons du mode édition configurés");
}

// Fonction pour mettre à jour un projet
function updateProject(formData, originalProject) {
    // Récupérer tous les projets
    let savedProjects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
    
    // Mettre à jour le projet spécifique
    const updatedProjects = savedProjects.map(project => {
        if (project.id === formData.id) {
            // Préserver certaines propriétés de l'original
            const updatedProject = {
                ...originalProject,  // Conserver les propriétés originales
                ...formData,         // Écraser avec les nouvelles valeurs
            };
            
            console.log('Projet mis à jour:', updatedProject);
            return updatedProject;
        }
        return project;
    });
    
    // Sauvegarder la liste mise à jour
    localStorage.setItem('savedProjects', JSON.stringify(updatedProjects));
    console.log('Projets sauvegardés avec succès');
}

// Fonction pour afficher une notification
function showNotification(message, type = 'info') {
    if (typeof window.showToast === 'function') {
        window.showToast(message, type);
        return;
    }
    
    // Création d'une notification custom
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.padding = '12px 20px';
    notification.style.borderRadius = '6px';
    notification.style.zIndex = '9999';
    notification.style.backgroundColor = type === 'success' ? '#28a745' : 
                                         type === 'error' ? '#dc3545' : '#17a2b8';
    notification.style.color = 'white';
    notification.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.15)';
    notification.style.maxWidth = '350px';
    
    notification.innerHTML = message;
    
    document.body.appendChild(notification);
    
    // Animer l'entrée
    notification.animate([
        { transform: 'translateY(20px)', opacity: 0 },
        { transform: 'translateY(0)', opacity: 1 }
    ], {
        duration: 300,
        easing: 'ease-out',
        fill: 'forwards'
    });
    
    // Supprimer après un délai
    setTimeout(() => {
        notification.animate([
            { opacity: 1 },
            { opacity: 0 }
        ], {
            duration: 500,
            easing: 'ease-out',
            fill: 'forwards'
        }).onfinish = () => notification.remove();
    }, 3000);
}

// Fonction pour ajouter une nouvelle sous-catégorie
function addNewSubcategory(categoryElement, subcategoryName) {
    console.log("Ajout d'une nouvelle sous-catégorie:", subcategoryName);
    
    const subcategoriesContainer = categoryElement.querySelector('.subcategories');
    if (!subcategoriesContainer) {
        console.error("Conteneur de sous-catégories non trouvé");
        return;
    }
    
    // Obtenir le symbole de devise actuel
    let currencySymbol = getCurrencySymbol();
    
    // Créer une nouvelle sous-catégorie vide
    const subcategory = {
        name: subcategoryName,
        amount: `${currencySymbol} 0.00`,
        lines: []
    };
    
    // Créer l'élément de sous-catégorie
    const subcategoryElement = createSubcategoryElement(subcategory);
    
    // Ajouter au conteneur
    subcategoriesContainer.appendChild(subcategoryElement);
    
    // Recalculer le budget total après ajout
    setTimeout(function() {
        if (typeof calculateAndDisplayTotalBudget === 'function') {
            calculateAndDisplayTotalBudget();
        }
    }, 300);
}