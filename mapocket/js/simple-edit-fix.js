/**
 * Correctif simple pour l'édition de projet
 * 
 * Ce script corrige de façon directe le problème de perte de données lors de la modification d'un projet.
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Initialisation du correctif simple pour l\'édition de projet');
    
    // Vérifier si nous sommes en mode édition
    const urlParams = new URLSearchParams(window.location.search);
    const isEditMode = urlParams.get('edit') === 'true';
    const projectId = urlParams.get('id');
    
    if (isEditMode && projectId) {
        console.log('Mode édition détecté, ID du projet:', projectId);
        
        // Charger le projet depuis le localStorage
        const projects = JSON.parse(localStorage.getItem('mapocket_projects') || '[]');
        const project = projects.find(p => p.id === projectId);
        
        if (project) {
            console.log('Projet trouvé, préparation du formulaire avec les données existantes');
            
            // Observer le chargement des templates et catégories
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'childList' && 
                        (mutation.target.id === 'categoriesContainer' || 
                         document.getElementById('categoriesContainer').contains(mutation.target))) {
                        
                        console.log('Changement détecté dans les catégories, vérification de l\'état');
                        
                        // Vérifier si les catégories sont vides ou par défaut
                        const categories = document.querySelectorAll('.expense-category');
                        if (categories.length === 0 || shouldRestoreCategories()) {
                            console.log('Restauration des catégories depuis le projet original');
                            restoreProjectData(project);
                        }
                    }
                });
            });
            
            // Observer les changements dans le conteneur de catégories
            observer.observe(document.body, { 
                childList: true, 
                subtree: true,
                characterData: true
            });
            
            // Remplir le formulaire avec les données du projet
            setTimeout(function() {
                fillFormWithProjectData(project);
            }, 500);
            
            // Intercepter le changement de template
            interceptTemplateSelection(project);
            
            // Intercepter la soumission du formulaire
            interceptFormSubmission(project);
            
            // Ajouter un indicateur de mode édition
            addEditModeIndicator();
        } else {
            console.error('Projet non trouvé dans le localStorage:', projectId);
        }
    }
});

/**
 * Vérifie si les catégories doivent être restaurées
 */
function shouldRestoreCategories() {
    const categories = document.querySelectorAll('.expense-category');
    
    // Vérifier si toutes les catégories ont un montant de 0
    let allZeros = true;
    categories.forEach(category => {
        const amountEl = category.querySelector('.category-amount');
        if (amountEl) {
            const amount = amountEl.textContent.trim();
            if (amount && !amount.includes('0,00') && !amount.includes('0.00')) {
                allZeros = false;
            }
        }
    });
    
    return allZeros;
}

/**
 * Remplit le formulaire avec les données du projet
 */
function fillFormWithProjectData(project) {
    console.log('Remplissage du formulaire avec les données du projet');
    
    // Nom du projet
    if (document.getElementById('projectName')) {
        document.getElementById('projectName').value = project.projectName || '';
    }
    
    // Date du projet
    if (document.getElementById('projectDate')) {
        document.getElementById('projectDate').value = project.projectDate || '';
    }
    
    // Date de fin (si présente)
    if (document.getElementById('projectEndDate')) {
        document.getElementById('projectEndDate').value = project.projectEndDate || '';
    }
    
    // Budget total
    if (document.getElementById('totalBudget')) {
        document.getElementById('totalBudget').value = project.totalBudget || '';
    }
    
    // Statut du projet
    if (document.getElementById('projectStatus')) {
        document.getElementById('projectStatus').value = project.projectStatus || 'inProgress';
    }
    
    // Sélectionner le template correspondant
    selectTemplate(project.template);
    
    // Lien vers portefeuille
    if (document.getElementById('linkToWallet')) {
        document.getElementById('linkToWallet').checked = project.linkToWallet || false;
    }
    
    // Wishlist
    if (document.getElementById('createWishlist')) {
        document.getElementById('createWishlist').checked = project.createWishlist || false;
        
        if (project.createWishlist && project.wishlistData) {
            // Afficher les options de wishlist
            const wishlistOptions = document.getElementById('wishlistOptions');
            if (wishlistOptions) {
                wishlistOptions.style.display = 'block';
            }
            
            // Type de destinataire
            if (document.getElementById('wishlistRecipientType')) {
                document.getElementById('wishlistRecipientType').value = 
                    project.wishlistData.recipientType || 'myself';
            }
            
            // Nom du destinataire
            if (document.getElementById('wishlistRecipientName')) {
                document.getElementById('wishlistRecipientName').value = 
                    project.wishlistData.recipientName || '';
            }
            
            // Afficher le champ de nom si nécessaire
            if (document.getElementById('recipientNameContainer')) {
                document.getElementById('recipientNameContainer').style.display = 
                    (project.wishlistData.recipientType === 'other') ? 'block' : 'none';
            }
        }
    }
    
    // Appeler la restauration des catégories après avoir défini le template
    setTimeout(function() {
        restoreProjectData(project);
    }, 300);
}

/**
 * Sélectionne le template approprié
 */
function selectTemplate(templateName) {
    if (!templateName) return;
    
    console.log('Sélection du template:', templateName);
    
    // Trouver et sélectionner l'option de template correspondante
    document.querySelectorAll('.template-option').forEach(option => {
        if (option.getAttribute('data-template') === templateName) {
            option.classList.add('selected');
        } else {
            option.classList.remove('selected');
        }
    });
    
    // Mettre à jour le titre du projet si nécessaire
    const projectTypeElement = document.querySelector('.project-type');
    if (projectTypeElement) {
        projectTypeElement.textContent = templateName;
    }
}

/**
 * Restaure les données du projet (catégories, sous-catégories, lignes)
 */
function restoreProjectData(project) {
    if (!project.categories || project.categories.length === 0) {
        console.log('Aucune catégorie à restaurer');
        return;
    }
    
    console.log('Restauration des catégories depuis le projet');
    
    const categoriesContainer = document.getElementById('categoriesContainer');
    if (!categoriesContainer) {
        console.error('Conteneur de catégories non trouvé');
        return;
    }
    
    // Vider le conteneur de catégories
    categoriesContainer.innerHTML = '';
    
    // Créer les éléments pour chaque catégorie
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
    
    // Réinitialiser les écouteurs d'événements
    setTimeout(function() {
        console.log('Réinitialisation des écouteurs après restauration des catégories');
        
        if (typeof attachBudgetAmountListeners === 'function') {
            attachBudgetAmountListeners();
        }
        
        if (typeof makeSubcategoriesEditableByDefault === 'function') {
            makeSubcategoriesEditableByDefault();
        }
        
        if (typeof fixAllEditableElements === 'function') {
            fixAllEditableElements();
        }
        
        if (typeof initCategoryDeletionButtons === 'function') {
            initCategoryDeletionButtons();
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
 * Intercepte la sélection de template
 */
function interceptTemplateSelection(project) {
    console.log('Interception des sélections de template');
    
    document.querySelectorAll('.template-option').forEach(option => {
        // Sauvegarder le gestionnaire d'événements original
        const originalClickHandler = option.onclick;
        
        // Définir notre propre gestionnaire
        option.onclick = function(e) {
            // Toujours prévenir l'événement par défaut
            e.preventDefault();
            
            const templateName = this.getAttribute('data-template');
            console.log('Template sélectionné:', templateName);
            
            // Demander confirmation avant de changer de template
            if (templateName !== project.template) {
                if (confirm('Attention : Changer de modèle remplacera les catégories existantes. Voulez-vous continuer ?')) {
                    // Sélectionner visuellement le template
                    document.querySelectorAll('.template-option').forEach(opt => {
                        opt.classList.remove('selected');
                    });
                    this.classList.add('selected');
                    
                    // Mise à jour du titre du projet si nécessaire
                    const projectTypeElement = document.querySelector('.project-type');
                    if (projectTypeElement) {
                        projectTypeElement.textContent = templateName;
                    }
                    
                    // Appeler le gestionnaire original si disponible
                    if (originalClickHandler) {
                        originalClickHandler.call(this, e);
                    }
                    
                    // Utiliser notre propre fonction pour mettre à jour l'affichage des catégories si disponible
                    if (typeof updateTemplateCategoriesUI === 'function') {
                        updateTemplateCategoriesUI(templateName);
                    }
                }
            } else {
                // Si c'est le même template, on le sélectionne simplement sans confirmation
                document.querySelectorAll('.template-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                this.classList.add('selected');
            }
        };
    });
}

/**
 * Intercepte la soumission du formulaire
 */
function interceptFormSubmission(project) {
    console.log('Interception de la soumission du formulaire');
    
    const form = document.querySelector('.project-form');
    if (!form) return;
    
    // Sauvegarder la fonction onsubmit originale
    const originalSubmit = form.onsubmit;
    
    // Redéfinir la fonction onsubmit
    form.onsubmit = function(e) {
        e.preventDefault();
        
        console.log('Soumission du formulaire interceptée');
        
        // Collecter les données du formulaire
        const updatedProject = collectFormData(project);
        
        // Sauvegarder le projet
        saveProject(updatedProject);
        
        return false;
    };
}

/**
 * Collecte les données du formulaire
 */
function collectFormData(originalProject) {
    console.log('Collecte des données du formulaire');
    
    // Créer une copie du projet original
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
    updatedProject.categories = collectCategories();
    
    return updatedProject;
}

/**
 * Collecte les catégories depuis le DOM
 */
function collectCategories() {
    console.log('Collecte des catégories depuis le DOM');
    
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
 * Sauvegarde le projet
 */
function saveProject(project) {
    console.log('Sauvegarde du projet:', project);
    
    try {
        // Récupérer tous les projets existants
        const storedData = localStorage.getItem('mapocket_projects');
        let projects = [];
        
        if (storedData) {
            projects = JSON.parse(storedData);
        }
        
        // Trouver et mettre à jour le projet existant
        const index = projects.findIndex(p => p.id === project.id);
        if (index !== -1) {
            projects[index] = project;
            console.log('Projet mis à jour dans la liste');
        } else {
            // Si le projet n'existe pas, l'ajouter (devrait être rare)
            projects.push(project);
            console.log('Projet ajouté à la liste');
        }
        
        // Sauvegarder les projets mis à jour
        localStorage.setItem('mapocket_projects', JSON.stringify(projects));
        
        // Afficher une notification de succès
        showSaveSuccessNotification();
        
        // Rediriger vers la page du projet
        setTimeout(function() {
            window.location.href = 'projet.html?id=' + project.id;
        }, 1000);
    } catch (error) {
        console.error('Erreur lors de la sauvegarde du projet:', error);
        alert('Une erreur est survenue lors de la sauvegarde du projet. Veuillez réessayer.');
    }
}

/**
 * Ajoute un indicateur de mode édition
 */
function addEditModeIndicator() {
    console.log('Ajout de l\'indicateur de mode édition');
    
    // Modifier le titre de la page
    const pageTitle = document.querySelector('.page-title');
    if (pageTitle) {
        pageTitle.innerHTML = '<i class="fas fa-edit"></i> MODIFICATION DE PROJET';
        pageTitle.style.color = '#007bff';
    }
    
    // Modifier le bouton de soumission
    const submitButton = document.querySelector('.project-form button[type="submit"]');
    if (submitButton) {
        submitButton.textContent = 'Enregistrer les modifications';
        submitButton.classList.add('btn-success');
    }
}

/**
 * Affiche une notification de succès après la sauvegarde
 */
function showSaveSuccessNotification() {
    // Créer la notification
    const notification = document.createElement('div');
    notification.className = 'save-notification';
    notification.innerHTML = '<i class="fas fa-check-circle"></i> Modifications enregistrées avec succès';
    
    // Styles
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = '#d4edda';
    notification.style.color = '#155724';
    notification.style.padding = '15px 20px';
    notification.style.borderRadius = '5px';
    notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    notification.style.zIndex = '9999';
    
    // Ajouter au corps du document
    document.body.appendChild(notification);
    
    // Supprimer après 3 secondes
    setTimeout(function() {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}