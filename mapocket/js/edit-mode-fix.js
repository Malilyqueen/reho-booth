// Version simplifiée pour améliorer le mode d'édition sans perturber l'existant
document.addEventListener('DOMContentLoaded', function() {
    console.log("Initialisation des améliorations du mode d'édition...");
    
    // CORRECTION CRITIQUE: Empêcher les soumissions de formulaire involontaires
    // qui causent des redirections non voulues
    preventUnwantedSubmissions();
    
    // Vérifier si la page est en mode édition
    const urlParams = new URLSearchParams(window.location.search);
    const editMode = urlParams.get('edit') === 'true';
    const projectId = urlParams.get('id');
    
    if (editMode && projectId) {
        console.log("Mode édition détecté pour le projet:", projectId);
        
        // Mettre en évidence le mode édition pour l'utilisateur
        highlightEditMode();
        
        // S'assurer que le bouton de sauvegarde est présent et fonctionnel
        enhanceSaveButton(projectId);
    }
});

// Fonction pour empêcher les soumissions de formulaire non désirées
function preventUnwantedSubmissions() {
    // 1. Intercepter tous les formulaires pour empêcher leur soumission automatique
    document.querySelectorAll('form').forEach(form => {
        // Désactiver la soumission automatique par Enter
        form.addEventListener('submit', function(event) {
            // Bloquer toutes les soumissions de formulaire
            event.preventDefault();
            event.stopPropagation();
            console.log("Soumission de formulaire bloquée - utilisez les boutons dédiés");
            return false;
        }, true);
        
        // Arrêter la propagation des touches Enter dans les champs de saisie
        form.querySelectorAll('input, textarea, [contenteditable]').forEach(input => {
            input.addEventListener('keydown', function(event) {
                // Bloquer la touche Entrée dans les champs
                if (event.key === 'Enter' || event.keyCode === 13) {
                    event.preventDefault();
                    event.stopPropagation();
                    // Optionnel : se déplacer au champ suivant
                    // const nextInput = getNextInput(this);
                    // if (nextInput) nextInput.focus();
                    return false;
                }
            }, true);
        });
    });
    
    // 2. Empêcher les clics non intentionnels
    document.addEventListener('dblclick', function(event) {
        // Bloquer les doubles clics sur les champs modifiables
        if (event.target.classList && (
            event.target.classList.contains('editable-field') ||
            event.target.classList.contains('expense-line-name') ||
            event.target.classList.contains('expense-line-amount') ||
            event.target.classList.contains('subcategory-name') ||
            event.target.classList.contains('subcategory-amount') ||
            event.target.classList.contains('category-name') ||
            event.target.classList.contains('category-amount')
        )) {
            event.preventDefault();
            event.stopPropagation();
            console.log("Double-clic bloqué sur élément:", event.target);
            return false;
        }
    }, true);
    
    // 3. Sécuriser les liens qui pourraient causer une navigation involontaire
    document.querySelectorAll('a').forEach(link => {
        // Pour les liens dans le formulaire d'édition
        if (link.closest('form') || link.closest('.project-form-container')) {
            link.addEventListener('click', function(event) {
                // Vérifier si c'est un lien interne ou de navigation
                const href = link.getAttribute('href');
                if (href && (href.startsWith('#') || href === 'javascript:void(0)')) {
                    // Ok pour ces liens contrôlés
                    return true;
                }
                
                // Demander confirmation pour les autres liens
                if (!confirm('Vous êtes sur le point de quitter le formulaire. Les modifications non sauvegardées seront perdues. Continuer ?')) {
                    event.preventDefault();
                    event.stopPropagation();
                    return false;
                }
            });
        }
    });
}

// Mettre en évidence le mode édition pour une meilleure compréhension utilisateur
function highlightEditMode() {
    // Changer le titre de la page
    const pageTitle = document.querySelector('.page-title');
    if (pageTitle) {
        pageTitle.textContent = 'MODIFIER PROJET';
        pageTitle.style.color = '#2979ff';
    }
    
    // Ajouter une notification subtile
    const formContainer = document.querySelector('.project-form-container');
    if (formContainer && !document.querySelector('.edit-mode-indicator')) {
        const editIndicator = document.createElement('div');
        editIndicator.className = 'edit-mode-indicator';
        editIndicator.innerHTML = '<i class="fas fa-pencil-alt"></i> Mode Édition';
        editIndicator.style.backgroundColor = '#e3f2fd';
        editIndicator.style.color = '#1565c0';
        editIndicator.style.padding = '8px 12px';
        editIndicator.style.borderRadius = '4px';
        editIndicator.style.margin = '0 0 15px 0';
        editIndicator.style.display = 'inline-block';
        editIndicator.style.fontSize = '14px';
        
        // Ajouter au début du conteneur
        if (formContainer.firstChild) {
            formContainer.insertBefore(editIndicator, formContainer.firstChild);
        } else {
            formContainer.appendChild(editIndicator);
        }
    }
}

// Améliorer le bouton de sauvegarde
function enhanceSaveButton(projectId) {
    // Le bouton peut déjà exister, chercher dans différents conteneurs possibles
    let saveButton = document.getElementById('saveChangesBtn') || 
                     document.querySelector('button[type="submit"]') ||
                     document.querySelector('.btn-save');
                     
    const formActions = document.querySelector('.form-actions') || 
                         document.querySelector('.project-form-footer');
    
    if (!saveButton && formActions) {
        // Créer un nouveau bouton de sauvegarde si aucun n'existe
        saveButton = document.createElement('button');
        saveButton.type = 'button';
        saveButton.id = 'saveChangesBtn';
        saveButton.className = 'btn btn-primary';
        saveButton.innerHTML = '<i class="fas fa-save"></i> Enregistrer les modifications';
        saveButton.style.backgroundColor = '#4caf50';
        saveButton.style.marginRight = '10px';
        
        // Ajouter au conteneur
        formActions.appendChild(saveButton);
    }
    
    if (saveButton) {
        // S'assurer que le bouton a un gestionnaire d'événements pour sauvegarder
        saveButton.addEventListener('click', function() {
            saveProjectChanges(projectId);
        });
    }
}

// Fonction pour sauvegarder les modifications du projet
function saveProjectChanges(projectId) {
    try {
        console.log("Sauvegarde des modifications du projet:", projectId);
        
        // 1. Obtenir toutes les données du formulaire
        const projectData = collectProjectData();
        
        // 2. S'assurer que l'ID est conservé
        projectData.id = projectId;
        
        // 3. Mettre à jour le projet dans localStorage
        updateSavedProject(projectId, projectData);
        
        // 4. Afficher une notification de succès
        showSaveConfirmation();
        
        // 5. Rediriger UNIQUEMENT si le bouton de sauvegarde a été cliqué explicitement
        // La redirection est désactivée pour éviter les problèmes de navigation intempestive
        // Si le bouton "Enregistrer" est cliqué, l'utilisateur sera informé mais restera sur la page
    } catch (error) {
        console.error("Erreur lors de la sauvegarde:", error);
        showErrorNotification();
    }
}

// Collecter toutes les données du projet
function collectProjectData() {
    const projectData = {};
    
    // Informations de base
    projectData.projectName = document.getElementById('projectName').value;
    projectData.projectDate = document.getElementById('projectDate').value;
    projectData.projectEndDate = document.getElementById('projectEndDate')?.value || '';
    projectData.totalBudget = document.getElementById('totalBudget').value;
    
    // Statut et options
    const statusSelect = document.getElementById('projectStatus');
    if (statusSelect) {
        projectData.projectStatus = statusSelect.value;
    }
    
    const linkWallet = document.getElementById('linkToWallet');
    if (linkWallet) {
        projectData.linkToWallet = linkWallet.checked;
    }
    
    const createWishlist = document.getElementById('createWishlist');
    if (createWishlist) {
        projectData.createWishlist = createWishlist.checked;
    }
    
    // Récupérer le modèle sélectionné
    const selectedTemplate = document.querySelector('.template-option.selected');
    if (selectedTemplate) {
        projectData.template = selectedTemplate.getAttribute('data-template');
    }
    
    // Catégories et détails (utiliser la fonction existante si disponible)
    if (typeof getProjectCategories === 'function') {
        projectData.categories = getProjectCategories();
    } else {
        projectData.categories = collectCategoriesData();
    }
    
    return projectData;
}

// Collecter les données des catégories manuellement
function collectCategoriesData() {
    const categories = [];
    const categoryElements = document.querySelectorAll('.expense-category');
    
    categoryElements.forEach(categoryEl => {
        const categoryNameEl = categoryEl.querySelector('.category-name');
        const categoryAmountEl = categoryEl.querySelector('.category-amount');
        
        if (categoryNameEl && categoryAmountEl) {
            const category = {
                name: categoryNameEl.textContent.trim(),
                amount: categoryAmountEl.textContent.trim(),
                subcategories: []
            };
            
            // Collecter les sous-catégories
            const subcategoryElements = categoryEl.querySelectorAll('.subcategory');
            subcategoryElements.forEach(subcatEl => {
                const subcategoryNameEl = subcatEl.querySelector('.subcategory-name');
                const subcategoryAmountEl = subcatEl.querySelector('.subcategory-amount');
                
                if (subcategoryNameEl && subcategoryAmountEl) {
                    const subcategory = {
                        name: subcategoryNameEl.textContent.trim(),
                        amount: subcategoryAmountEl.textContent.trim(),
                        lines: []
                    };
                    
                    // Collecter les lignes de dépenses
                    const lineElements = subcatEl.querySelectorAll('.expense-line');
                    lineElements.forEach(lineEl => {
                        const lineNameEl = lineEl.querySelector('.expense-line-name');
                        const lineAmountEl = lineEl.querySelector('.expense-line-amount');
                        
                        if (lineNameEl && lineAmountEl) {
                            subcategory.lines.push({
                                name: lineNameEl.value || lineNameEl.textContent.trim(),
                                amount: lineAmountEl.value || lineAmountEl.textContent.trim()
                            });
                        }
                    });
                    
                    category.subcategories.push(subcategory);
                }
            });
            
            categories.push(category);
        }
    });
    
    return categories;
}

// Mettre à jour le projet sauvegardé
function updateSavedProject(projectId, projectData) {
    // Récupérer tous les projets
    let savedProjects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
    
    // Trouver l'index du projet à mettre à jour
    const projectIndex = savedProjects.findIndex(project => project.id === projectId);
    
    if (projectIndex !== -1) {
        // Préserver certaines propriétés qui ne doivent pas être écrasées
        const originalProject = savedProjects[projectIndex];
        projectData.createdAt = originalProject.createdAt || new Date().toISOString();
        
        // Mettre à jour le projet
        savedProjects[projectIndex] = projectData;
    } else {
        // Si le projet n'existe pas (cas improbable), l'ajouter
        projectData.createdAt = new Date().toISOString();
        savedProjects.push(projectData);
    }
    
    // Sauvegarder la liste mise à jour
    localStorage.setItem('savedProjects', JSON.stringify(savedProjects));
    console.log("Projet sauvegardé avec succès");
}

// Afficher une notification de succès
function showSaveConfirmation() {
    // Vérifier si la fonction de notification existante est disponible
    if (typeof showNotification === 'function') {
        showNotification('✅ Modifications enregistrées avec succès', 'success');
        return;
    }
    
    // Si non, créer notre propre notification
    const notification = document.createElement('div');
    notification.className = 'save-notification';
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = '#4caf50';
    notification.style.color = 'white';
    notification.style.padding = '12px 20px';
    notification.style.borderRadius = '4px';
    notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    notification.style.zIndex = '9999';
    notification.innerHTML = '✅ Modifications enregistrées avec succès';
    
    document.body.appendChild(notification);
    
    // Animer la notification
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s ease';
        
        // Supprimer après l'animation
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 3000);
}

// Afficher une notification d'erreur
function showErrorNotification() {
    // Vérifier si la fonction de notification existante est disponible
    if (typeof showNotification === 'function') {
        showNotification('❌ Erreur lors de la sauvegarde. Veuillez réessayer.', 'error');
        return;
    }
    
    // Si non, créer notre propre notification
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = '#f44336';
    notification.style.color = 'white';
    notification.style.padding = '12px 20px';
    notification.style.borderRadius = '4px';
    notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    notification.style.zIndex = '9999';
    notification.innerHTML = '❌ Erreur lors de la sauvegarde. Veuillez réessayer.';
    
    document.body.appendChild(notification);
    
    // Animer la notification
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s ease';
        
        // Supprimer après l'animation
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 5000);
}