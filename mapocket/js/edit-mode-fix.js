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

// Fonction pour créer un élément de catégorie
function createCategoryElement(category) {
    // Cette fonction réutilise la logique existante dans le fichier project-edit.js
    // Elle crée une structure DOM pour représenter une catégorie de dépenses
    // avec ses sous-catégories et lignes de dépenses
    
    // Note: Comme il s'agit d'une fonction complexe, nous nous référons à la fonction
    // existante dans project-edit.js. Assurez-vous que cette fonction est correctement
    // mise en œuvre dans ce fichier.
    
    // Si vous avez besoin de surcharger cette fonction, implémentez-la ici.
    
    if (typeof window.customCreateCategoryElement === 'function') {
        return window.customCreateCategoryElement(category);
    } else if (typeof createCategoryFromData === 'function') {
        return createCategoryFromData(category);
    } else {
        console.error("Fonction de création de catégorie non trouvée");
        // Élément de secours simple
        const div = document.createElement('div');
        div.className = 'expense-category error';
        div.textContent = `Erreur lors du chargement de la catégorie ${category.name}`;
        return div;
    }
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