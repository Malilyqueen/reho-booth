/**
 * Edit Project Fix
 * 
 * Ce script corrige le problème critique de perte de données lors de l'édition d'un projet existant.
 * Il assure que les données existantes sont préservées et que le formulaire est pré-rempli correctement.
 */

// Exécuter immédiatement sans attendre le DOM pour intercepter les premières initialisations
(function() {
    console.log('Initialisation du correctif d\'édition de projet...');
    
    // Vérifier si nous sommes en mode édition
    const urlParams = new URLSearchParams(window.location.search);
    const isEditMode = urlParams.get('edit') === 'true';
    const projectId = urlParams.get('id');
    
    if (isEditMode && projectId) {
        console.log('Mode édition détecté pour le projet ID:', projectId);
        
        // Charger le projet avant tout autre script
        const originalProject = loadProjectFromStorage(projectId);
        if (originalProject) {
            console.log('Projet chargé avec succès:', originalProject);
            
            // Stocker le projet pour y accéder plus tard
            window._editProjectOriginal = originalProject;
            
            // Redéfinir la fonction updateTemplateCategoriesUI pour qu'elle préserve les données
            monkeyPatchTemplateFunction();
        }
    }
})();

// Attendre que le DOM soit chargé pour le reste des opérations
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const isEditMode = urlParams.get('edit') === 'true';
    const projectId = urlParams.get('id');
    
    if (isEditMode && projectId) {
        // Attendre un court instant que tous les scripts soient initialisés
        setTimeout(function() {
            setupEditFixes(projectId);
        }, 500);
    }
});

/**
 * Charge un projet depuis le stockage local
 */
function loadProjectFromStorage(projectId) {
    try {
        // Chercher d'abord dans le localStorage
        const storedData = localStorage.getItem('mapocket_projects');
        if (storedData) {
            const projects = JSON.parse(storedData);
            const project = projects.find(p => p.id === projectId);
            if (project) {
                return project;
            }
        }
        
        // Si on n'a pas trouvé dans le localStorage, chercher dans sessionStorage
        const sessionData = sessionStorage.getItem('current_project');
        if (sessionData) {
            const currentProject = JSON.parse(sessionData);
            if (currentProject.id === projectId) {
                return currentProject;
            }
        }
        
        console.warn('Projet non trouvé dans le stockage local ni dans la session');
        return null;
    } catch (error) {
        console.error('Erreur lors du chargement du projet:', error);
        return null;
    }
}

/**
 * Modifie la fonction de mise à jour du template pour préserver les données
 */
function monkeyPatchTemplateFunction() {
    // Sauvegarder la fonction originale si elle existe déjà
    const originalUpdateFunction = window.updateTemplateCategoriesUI;
    
    // Redéfinir la fonction
    window.updateTemplateCategoriesUI = function(templateName) {
        console.log('Fonction mise à jour interceptée pour le template:', templateName);
        
        // Si nous avons le projet original, nous allons préserver ses données
        if (window._editProjectOriginal) {
            // IMPORTANT: Ne pas appliquer le template, utiliser les catégories existantes
            loadExistingCategories(window._editProjectOriginal);
            
            // Mettre à jour uniquement le nom du template
            const origProject = window._editProjectOriginal;
            origProject.template = templateName;
            
            return;
        }
        
        // Si aucun projet original, appeler la fonction originale
        if (originalUpdateFunction) {
            originalUpdateFunction(templateName);
        }
    };
}

/**
 * Configure les correctifs pour l'édition de projet
 */
function setupEditFixes(projectId) {
    console.log('Installation des correctifs d\'édition...');
    
    // Récupérer le projet original
    const originalProject = window._editProjectOriginal || loadProjectFromStorage(projectId);
    if (!originalProject) {
        console.error('Impossible de charger le projet pour les correctifs');
        return;
    }
    
    // Remplir le formulaire avec les données du projet
    populateFormWithProjectData(originalProject);
    
    // Charger les catégories existantes
    loadExistingCategories(originalProject);
    
    // Intercepter la soumission du formulaire
    interceptFormSubmission(originalProject);
    
    // Ajouter un indicateur visuel de mode édition
    addEditModeIndicator();
}

/**
 * Remplit le formulaire avec les données du projet
 */
function populateFormWithProjectData(project) {
    // Nom du projet
    const projectNameInput = document.getElementById('projectName');
    if (projectNameInput) {
        projectNameInput.value = project.projectName || '';
    }
    
    // Date du projet
    const projectDateInput = document.getElementById('projectDate');
    if (projectDateInput) {
        projectDateInput.value = project.projectDate || '';
    }
    
    // Date de fin (optionnelle)
    const projectEndDateInput = document.getElementById('projectEndDate');
    if (projectEndDateInput) {
        projectEndDateInput.value = project.projectEndDate || '';
    }
    
    // Budget total
    const totalBudgetInput = document.getElementById('totalBudget');
    if (totalBudgetInput) {
        totalBudgetInput.value = project.totalBudget || '';
    }
    
    // Statut du projet
    const projectStatusInput = document.getElementById('projectStatus');
    if (projectStatusInput) {
        projectStatusInput.value = project.projectStatus || 'inProgress';
    }
    
    // Sélectionner le template correspondant
    const templateName = project.template;
    if (templateName) {
        document.querySelectorAll('.template-option').forEach(option => {
            const optionTemplate = option.getAttribute('data-template');
            if (optionTemplate === templateName) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        });
        
        // Mettre à jour le titre du projet si nécessaire
        const projectTitle = document.querySelector('.project-type');
        if (projectTitle) {
            projectTitle.textContent = templateName;
        }
    }
    
    // Autres champs spécifiques (lien vers portefeuille, etc.)
    if (project.linkToWallet !== undefined) {
        const linkToWallet = document.getElementById('linkToWallet');
        if (linkToWallet) {
            linkToWallet.checked = project.linkToWallet;
        }
    }
    
    // Champs liés à la liste de souhaits
    if (project.createWishlist !== undefined) {
        const createWishlist = document.getElementById('createWishlist');
        if (createWishlist) {
            createWishlist.checked = project.createWishlist;
            
            // Si la liste de souhaits est activée, afficher les options
            const wishlistOptions = document.getElementById('wishlistOptions');
            if (wishlistOptions) {
                wishlistOptions.style.display = project.createWishlist ? 'block' : 'none';
            }
            
            // Remplir les détails de la liste de souhaits si disponibles
            if (project.wishlistData) {
                const recipientType = document.getElementById('wishlistRecipientType');
                if (recipientType) {
                    recipientType.value = project.wishlistData.recipientType || 'myself';
                }
                
                const recipientName = document.getElementById('wishlistRecipientName');
                if (recipientName) {
                    recipientName.value = project.wishlistData.recipientName || '';
                }
                
                // Afficher le champ de nom du destinataire si nécessaire
                const recipientNameContainer = document.getElementById('recipientNameContainer');
                if (recipientNameContainer) {
                    recipientNameContainer.style.display = 
                        (project.wishlistData.recipientType === 'other') ? 'block' : 'none';
                }
            }
        }
    }
}

/**
 * Charge les catégories existantes du projet
 */
function loadExistingCategories(project) {
    const categoriesContainer = document.getElementById('categoriesContainer');
    if (!categoriesContainer) {
        console.error('Conteneur de catégories non trouvé');
        return;
    }
    
    // Vider le conteneur de catégories
    categoriesContainer.innerHTML = '';
    
    // Créer les éléments pour chaque catégorie
    if (project.categories && project.categories.length > 0) {
        project.categories.forEach(category => {
            const categoryElement = createCategoryElement(category);
            categoriesContainer.appendChild(categoryElement);
            
            // Ajouter les sous-catégories
            if (category.subcategories && category.subcategories.length > 0) {
                const subcategoriesContainer = categoryElement.querySelector('.subcategories-container');
                
                category.subcategories.forEach(subcategory => {
                    const subcategoryElement = createSubcategoryElement(subcategory);
                    subcategoriesContainer.appendChild(subcategoryElement);
                    
                    // Ajouter les lignes
                    if (subcategory.lines && subcategory.lines.length > 0) {
                        const linesContainer = subcategoryElement.querySelector('.expense-lines');
                        
                        subcategory.lines.forEach(line => {
                            const lineElement = createLineElement(line);
                            linesContainer.appendChild(lineElement);
                        });
                    }
                });
            }
        });
    }
    
    // Réinitialiser les écouteurs d'événements
    setTimeout(function() {
        console.log('Réinitialisation des écouteurs après chargement des catégories');
        
        if (typeof attachBudgetAmountListeners === 'function') {
            attachBudgetAmountListeners();
        }
        
        if (typeof initCategoryDeletionButtons === 'function') {
            initCategoryDeletionButtons();
        }
        
        if (typeof makeSubcategoriesEditableByDefault === 'function') {
            makeSubcategoriesEditableByDefault();
        }
        
        if (typeof fixAllEditableElements === 'function') {
            fixAllEditableElements();
        }
        
        if (typeof updateTotals === 'function') {
            updateTotals();
        }
    }, 200);
}

/**
 * Crée un élément de catégorie
 */
function createCategoryElement(category) {
    const categoryEl = document.createElement('div');
    categoryEl.className = 'expense-category';
    categoryEl.innerHTML = `
        <div class="category-header">
            <div class="category-name" contenteditable="true">${category.name || ''}</div>
            <div class="category-amount" contenteditable="true">${category.amount || ''}</div>
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
    return categoryEl;
}

/**
 * Crée un élément de sous-catégorie
 */
function createSubcategoryElement(subcategory) {
    const subcategoryEl = document.createElement('div');
    subcategoryEl.className = 'subcategory';
    subcategoryEl.innerHTML = `
        <div class="subcategory-header">
            <div class="subcategory-name" contenteditable="true">${subcategory.name || ''}</div>
            <div class="subcategory-amount" contenteditable="true">${subcategory.amount || ''}</div>
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
    return subcategoryEl;
}

/**
 * Crée un élément de ligne
 */
function createLineElement(line) {
    const lineEl = document.createElement('div');
    lineEl.className = 'expense-line';
    lineEl.innerHTML = `
        <div class="line-name" contenteditable="true">${line.name || ''}</div>
        <div class="line-amount" contenteditable="true">${line.amount || ''}</div>
        <div class="line-actions">
            <button class="btn-sm delete-line-btn">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    return lineEl;
}

/**
 * Intercepte la soumission du formulaire
 */
function interceptFormSubmission(originalProject) {
    const form = document.querySelector('.project-form');
    if (!form) return;
    
    // Sauvegarder la fonction onsubmit originale
    const originalSubmit = form.onsubmit;
    
    // Redéfinir la fonction onsubmit
    form.onsubmit = function(e) {
        e.preventDefault();
        
        console.log('Soumission du formulaire interceptée');
        
        // Construire le projet mis à jour
        const updatedProject = collectUpdatedProjectData(originalProject);
        
        // Sauvegarder le projet mis à jour
        saveUpdatedProject(updatedProject);
        
        return false;
    };
}

/**
 * Collecte les données mises à jour du projet
 */
function collectUpdatedProjectData(originalProject) {
    // Copier le projet original
    const updatedProject = JSON.parse(JSON.stringify(originalProject));
    
    // Mettre à jour les champs de base
    updatedProject.projectName = document.getElementById('projectName')?.value || updatedProject.projectName;
    updatedProject.projectDate = document.getElementById('projectDate')?.value || updatedProject.projectDate;
    updatedProject.projectEndDate = document.getElementById('projectEndDate')?.value || updatedProject.projectEndDate;
    updatedProject.totalBudget = document.getElementById('totalBudget')?.value || updatedProject.totalBudget;
    updatedProject.projectStatus = document.getElementById('projectStatus')?.value || updatedProject.projectStatus;
    updatedProject.template = document.querySelector('.template-option.selected')?.getAttribute('data-template') || updatedProject.template;
    
    // Champs spécifiques
    if (document.getElementById('linkToWallet')) {
        updatedProject.linkToWallet = document.getElementById('linkToWallet').checked;
    }
    
    if (document.getElementById('createWishlist')) {
        updatedProject.createWishlist = document.getElementById('createWishlist').checked;
        
        if (updatedProject.createWishlist) {
            updatedProject.wishlistData = updatedProject.wishlistData || {};
            updatedProject.wishlistData.recipientType = document.getElementById('wishlistRecipientType')?.value || 'myself';
            
            if (updatedProject.wishlistData.recipientType === 'other') {
                updatedProject.wishlistData.recipientName = document.getElementById('wishlistRecipientName')?.value || '';
            }
        }
    }
    
    // Récupérer les catégories actuelles
    updatedProject.categories = collectCurrentCategories();
    
    return updatedProject;
}

/**
 * Collecte les catégories actuelles du DOM
 */
function collectCurrentCategories() {
    const categories = [];
    const categoryElements = document.querySelectorAll('.expense-category');
    
    categoryElements.forEach(categoryEl => {
        const categoryName = categoryEl.querySelector('.category-name')?.textContent.trim() || '';
        const categoryAmount = categoryEl.querySelector('.category-amount')?.textContent.trim() || '';
        
        const subcategories = [];
        const subcategoryElements = categoryEl.querySelectorAll('.subcategory');
        
        subcategoryElements.forEach(subcategoryEl => {
            const subcategoryName = subcategoryEl.querySelector('.subcategory-name')?.textContent.trim() || '';
            const subcategoryAmount = subcategoryEl.querySelector('.subcategory-amount')?.textContent.trim() || '';
            
            const lines = [];
            const lineElements = subcategoryEl.querySelectorAll('.expense-line');
            
            lineElements.forEach(lineEl => {
                const lineName = lineEl.querySelector('.line-name')?.textContent.trim() || '';
                const lineAmount = lineEl.querySelector('.line-amount')?.textContent.trim() || '';
                
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

/**
 * Sauvegarde le projet mis à jour
 */
function saveUpdatedProject(project) {
    // On essaie d'abord d'utiliser la fonction saveProject si elle existe
    if (typeof saveProject === 'function') {
        saveProject(project);
        return;
    }
    
    // Sinon, on essaie de sauvegarder directement dans le localStorage
    try {
        // Récupérer tous les projets
        const storedData = localStorage.getItem('mapocket_projects');
        if (storedData) {
            const projects = JSON.parse(storedData);
            
            // Trouver et mettre à jour le projet correspondant
            const index = projects.findIndex(p => p.id === project.id);
            if (index !== -1) {
                projects[index] = project;
                
                // Sauvegarder tous les projets
                localStorage.setItem('mapocket_projects', JSON.stringify(projects));
                
                // Rediriger vers la page de détails du projet
                window.location.href = 'projet.html?id=' + project.id;
                return;
            }
        }
        
        console.error('Impossible de trouver le projet à mettre à jour dans le localStorage');
        alert('Erreur lors de la sauvegarde du projet. Veuillez réessayer.');
    } catch (error) {
        console.error('Erreur lors de la sauvegarde du projet:', error);
        alert('Erreur lors de la sauvegarde du projet. Veuillez réessayer.');
    }
}

/**
 * Ajoute un indicateur visuel de mode édition
 */
function addEditModeIndicator() {
    const pageTitle = document.querySelector('.page-title');
    if (pageTitle) {
        pageTitle.innerHTML = '<i class="fas fa-edit"></i> MODIFICATION DE PROJET';
        pageTitle.style.color = '#007bff';
    }
    
    const submitButton = document.querySelector('.project-form button[type="submit"]');
    if (submitButton) {
        submitButton.textContent = 'Enregistrer les modifications';
        submitButton.classList.add('btn-success');
    }
}