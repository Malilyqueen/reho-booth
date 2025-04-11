/**
 * Project Edit Preserver
 * 
 * Ce script résout le problème critique de perte de données lors de la modification d'un projet.
 * Il garantit que les données existantes sont conservées et que seules les nouvelles modifications
 * sont ajoutées au projet, sans remplacer ce qui existe déjà.
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Initialisation du préservateur de données de projet...');
    
    // Vérifier si nous sommes en mode édition
    const urlParams = new URLSearchParams(window.location.search);
    const isEditMode = urlParams.get('edit') === 'true';
    const projectId = urlParams.get('id');
    
    if (isEditMode && projectId) {
        console.log('Mode édition détecté pour le projet ID:', projectId);
        
        // Attendre que tous les scripts soient chargés pour éviter les conflits
        setTimeout(function() {
            setupEditPreserver(projectId);
        }, 1000);
    } else {
        console.log('Mode création de nouveau projet détecté');
    }
});

/**
 * Configure le préservateur pour un projet en édition
 */
function setupEditPreserver(projectId) {
    // 1. Sauvegarder les données originales du projet
    const originalProject = captureProjectData();
    
    if (!originalProject) {
        console.error('Impossible de capturer les données originales du projet');
        return;
    }
    
    // 2. Surveiller les changements de template
    monitorTemplateChanges(originalProject);
    
    // 3. Surveiller les actions de sauvegarde
    interceptSaveActions(originalProject);
    
    // 4. Ajouter un bouton de restauration des données originales
    addRestoreButton(originalProject);
    
    // 5. S'assurer que les catégories sont correctement chargées
    ensureCategoriesAreLoaded(originalProject);
}

/**
 * Capture les données complètes du projet actuel
 */
function captureProjectData() {
    try {
        // Récupérer les données depuis le stockage local si elles existent
        const storedProjects = localStorage.getItem('mapocket_projects');
        if (!storedProjects) {
            console.error('Aucun projet trouvé dans le stockage local');
            return null;
        }
        
        const projects = JSON.parse(storedProjects);
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get('id');
        
        // Trouver le projet correspondant à l'ID
        const projectData = projects.find(project => project.id === projectId);
        if (!projectData) {
            console.error('Projet non trouvé dans le stockage local:', projectId);
            return null;
        }
        
        // Sauvegarder une copie profonde pour éviter les références
        const projectCopy = JSON.parse(JSON.stringify(projectData));
        console.log('Données originales du projet capturées:', projectCopy);
        
        // Stocker temporairement pour y accéder facilement
        window._originalProjectData = projectCopy;
        
        return projectCopy;
    } catch (error) {
        console.error('Erreur lors de la capture des données du projet:', error);
        return null;
    }
}

/**
 * Surveille les changements de template pour préserver les données originales
 */
function monitorTemplateChanges(originalProject) {
    // Intercepter les clics sur les options de template
    document.querySelectorAll('.template-option').forEach(option => {
        // Créer une copie du gestionnaire d'événements
        const originalClick = option.onclick;
        
        // Remplacer par notre version qui préserve les données
        option.onclick = function(e) {
            // Empêcher les gestionnaires par défaut
            e.preventDefault();
            e.stopPropagation();
            
            const templateName = this.getAttribute('data-template');
            console.log('Changement de template intercepté:', templateName);
            
            // Demander confirmation avant de changer de template
            if (confirm('Attention : Changer de modèle remplacera toutes vos catégories actuelles. Êtes-vous sûr de vouloir continuer ?')) {
                // Appliquer le template mais conserver les autres données du projet
                applyTemplateWhilePreservingData(templateName, originalProject);
            }
        };
    });
}

/**
 * Applique un template tout en préservant les autres données du projet
 */
function applyTemplateWhilePreservingData(templateName, originalProject) {
    // 1. Mettre à jour visuellement le template sélectionné
    document.querySelectorAll('.template-option').forEach(opt => {
        opt.classList.remove('selected');
        if (opt.getAttribute('data-template') === templateName) {
            opt.classList.add('selected');
        }
    });
    
    // 2. Mettre à jour le titre du projet s'il est basé sur le template
    const projectTitle = document.querySelector('.project-type');
    if (projectTitle) {
        projectTitle.textContent = templateName;
    }
    
    // 3. Appliquer le nouveau template pour les catégories
    if (typeof updateTemplateCategoriesUI === 'function') {
        updateTemplateCategoriesUI(templateName);
    }
    
    // 4. Restaurer les autres données du projet
    if (document.getElementById('projectName')) {
        document.getElementById('projectName').value = originalProject.projectName || '';
    }
    
    if (document.getElementById('projectDate')) {
        document.getElementById('projectDate').value = originalProject.projectDate || '';
    }
    
    if (document.getElementById('projectEndDate')) {
        document.getElementById('projectEndDate').value = originalProject.projectEndDate || '';
    }
    
    if (document.getElementById('totalBudget')) {
        document.getElementById('totalBudget').value = originalProject.totalBudget || '';
    }
    
    if (document.getElementById('projectStatus')) {
        document.getElementById('projectStatus').value = originalProject.projectStatus || 'inProgress';
    }
    
    // 5. Réinitialiser les écouteurs d'événements et comportements
    setTimeout(function() {
        if (typeof reinitializeEventListeners === 'function') {
            reinitializeEventListeners();
        } else {
            // Fallback si la fonction n'existe pas
            if (typeof attachBudgetAmountListeners === 'function') {
                attachBudgetAmountListeners();
            }
            
            if (typeof makeSubcategoriesEditableByDefault === 'function') {
                makeSubcategoriesEditableByDefault();
            }
            
            if (typeof fixAllEditableElements === 'function') {
                fixAllEditableElements();
            }
        }
    }, 300);
}

/**
 * Intercepte les actions de sauvegarde pour s'assurer que les données ne sont pas perdues
 */
function interceptSaveActions(originalProject) {
    // Intercepter la soumission du formulaire
    const projectForm = document.querySelector('.project-form');
    if (projectForm) {
        const originalSubmit = projectForm.onsubmit;
        
        projectForm.onsubmit = function(e) {
            e.preventDefault();
            
            console.log('Soumission du formulaire interceptée pour préserver les données');
            
            // Collecter les données actuelles du formulaire
            const formData = new FormData(projectForm);
            
            // Récupérer les catégories actuellement dans le DOM
            const categoriesData = collectCurrentCategories();
            
            // Construire un objet projet complet
            const updatedProject = {
                ...originalProject,
                projectName: formData.get('projectName') || originalProject.projectName,
                projectDate: formData.get('projectDate') || originalProject.projectDate,
                projectEndDate: formData.get('projectEndDate') || originalProject.projectEndDate,
                totalBudget: formData.get('totalBudget') || originalProject.totalBudget,
                projectStatus: formData.get('projectStatus') || originalProject.projectStatus,
                template: document.querySelector('.template-option.selected')?.getAttribute('data-template') || originalProject.template,
                categories: categoriesData
            };
            
            // Appeler la fonction de sauvegarde originale si elle existe
            if (typeof saveProject === 'function') {
                // Sauvegarder avec nos données préservées
                saveProject(updatedProject);
            } else {
                console.error('Fonction de sauvegarde non trouvée');
                alert('Erreur lors de la sauvegarde. Veuillez réessayer.');
            }
            
            return false; // Empêcher la soumission standard
        };
    }
}

/**
 * Collecte toutes les catégories actuellement dans le DOM
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
 * Ajoute un bouton de restauration des données originales
 */
function addRestoreButton(originalProject) {
    // Créer le bouton
    const restoreButton = document.createElement('button');
    restoreButton.type = 'button';
    restoreButton.id = 'restoreOriginalBtn';
    restoreButton.className = 'btn btn-sm btn-outline-warning';
    restoreButton.innerHTML = '<i class="fas fa-history"></i> Restaurer les données originales';
    restoreButton.style.marginLeft = '10px';
    restoreButton.style.backgroundColor = '#fff3cd';
    restoreButton.style.border = '1px solid #ffeeba';
    restoreButton.style.color = '#856404';
    
    // Ajouter le bouton dans la zone d'actions
    const actionsArea = document.querySelector('.form-actions');
    if (actionsArea) {
        actionsArea.appendChild(restoreButton);
    }
    
    // Ajouter l'événement de clic
    restoreButton.addEventListener('click', function(e) {
        e.preventDefault();
        
        if (confirm('Voulez-vous vraiment restaurer le projet à son état original ? Toutes vos modifications seront perdues.')) {
            restoreOriginalProject(originalProject);
        }
    });
}

/**
 * Restaure le projet à son état original
 */
function restoreOriginalProject(originalProject) {
    console.log('Restauration du projet à son état original:', originalProject);
    
    // 1. Restaurer les champs de base
    if (document.getElementById('projectName')) {
        document.getElementById('projectName').value = originalProject.projectName || '';
    }
    
    if (document.getElementById('projectDate')) {
        document.getElementById('projectDate').value = originalProject.projectDate || '';
    }
    
    if (document.getElementById('projectEndDate')) {
        document.getElementById('projectEndDate').value = originalProject.projectEndDate || '';
    }
    
    if (document.getElementById('totalBudget')) {
        document.getElementById('totalBudget').value = originalProject.totalBudget || '';
    }
    
    if (document.getElementById('projectStatus')) {
        document.getElementById('projectStatus').value = originalProject.projectStatus || 'inProgress';
    }
    
    // 2. Restaurer le template
    document.querySelectorAll('.template-option').forEach(opt => {
        opt.classList.remove('selected');
        if (opt.getAttribute('data-template') === originalProject.template) {
            opt.classList.add('selected');
        }
    });
    
    // 3. Restaurer les catégories
    restoreCategoriesFromOriginal(originalProject.categories);
    
    // 4. Réinitialiser les écouteurs d'événements
    setTimeout(function() {
        if (typeof reinitializeEventListeners === 'function') {
            reinitializeEventListeners();
        }
    }, 500);
    
    // 5. Afficher une notification
    showRestoreNotification();
}

/**
 * Restaure les catégories depuis les données originales
 */
function restoreCategoriesFromOriginal(originalCategories) {
    const categoriesContainer = document.querySelector('#categoriesContainer');
    if (!categoriesContainer) return;
    
    // Vider le conteneur
    categoriesContainer.innerHTML = '';
    
    // Recréer les catégories à partir des données originales
    originalCategories.forEach(category => {
        const categoryEl = createCategoryElement(category);
        categoriesContainer.appendChild(categoryEl);
        
        // Ajouter les sous-catégories
        const subcategoriesContainer = categoryEl.querySelector('.subcategories-container');
        
        category.subcategories.forEach(subcategory => {
            const subcategoryEl = createSubcategoryElement(subcategory);
            subcategoriesContainer.appendChild(subcategoryEl);
            
            // Ajouter les lignes
            const linesContainer = subcategoryEl.querySelector('.expense-lines');
            
            subcategory.lines.forEach(line => {
                const lineEl = createLineElement(line);
                linesContainer.appendChild(lineEl);
            });
        });
    });
}

/**
 * Crée un élément de catégorie
 */
function createCategoryElement(category) {
    const categoryEl = document.createElement('div');
    categoryEl.className = 'expense-category';
    categoryEl.innerHTML = `
        <div class="category-header">
            <div class="category-name" contenteditable="true">${category.name}</div>
            <div class="category-amount" contenteditable="true">${category.amount}</div>
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
            <div class="subcategory-name" contenteditable="true">${subcategory.name}</div>
            <div class="subcategory-amount" contenteditable="true">${subcategory.amount}</div>
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
        <div class="line-name" contenteditable="true">${line.name}</div>
        <div class="line-amount" contenteditable="true">${line.amount}</div>
        <div class="line-actions">
            <button class="btn-sm delete-line-btn">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    return lineEl;
}

/**
 * S'assure que les catégories sont correctement chargées depuis le projet original
 */
function ensureCategoriesAreLoaded(originalProject) {
    // Vérifier si les catégories sont déjà chargées
    const categoriesContainer = document.querySelector('#categoriesContainer');
    if (!categoriesContainer) return;
    
    const loadingPlaceholder = categoriesContainer.querySelector('.loading-placeholder');
    const existingCategories = categoriesContainer.querySelectorAll('.expense-category');
    
    // Si nous n'avons pas de catégories ou si nous avons toujours le placeholder de chargement
    if (existingCategories.length === 0 || loadingPlaceholder) {
        console.log('Aucune catégorie trouvée, restauration depuis les données originales');
        
        // Vider d'abord le conteneur
        categoriesContainer.innerHTML = '';
        
        // Restaurer les catégories
        restoreCategoriesFromOriginal(originalProject.categories);
        
        // Réinitialiser les écouteurs d'événements
        setTimeout(function() {
            if (typeof reinitializeEventListeners === 'function') {
                reinitializeEventListeners();
            } else {
                // Fallback
                if (typeof attachBudgetAmountListeners === 'function') {
                    attachBudgetAmountListeners();
                }
                
                if (typeof makeSubcategoriesEditableByDefault === 'function') {
                    makeSubcategoriesEditableByDefault();
                }
                
                if (typeof fixAllEditableElements === 'function') {
                    fixAllEditableElements();
                }
            }
        }, 300);
    }
}

/**
 * Affiche une notification de restauration
 */
function showRestoreNotification() {
    // Créer la notification
    const notification = document.createElement('div');
    notification.className = 'restore-notification';
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '15px 20px';
    notification.style.backgroundColor = '#d4edda';
    notification.style.color = '#155724';
    notification.style.borderRadius = '5px';
    notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    notification.style.zIndex = '9999';
    notification.style.maxWidth = '300px';
    
    notification.innerHTML = '<i class="fas fa-check-circle" style="margin-right: 10px;"></i> Données originales restaurées avec succès';
    
    // Ajouter au corps du document
    document.body.appendChild(notification);
    
    // Supprimer après quelques secondes
    setTimeout(function() {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}