/**
 * Project Reinitializer
 * 
 * Ce script améliore l'expérience utilisateur en garantissant que les modifications
 * de projet sont correctement appliquées sans nécessiter de rechargement de page
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Initialisation du réinitialisateur de projet...');
    
    // Installer le réinitialisateur après que tous les scripts soient chargés
    setTimeout(function() {
        setupProjectReinitializer();
    }, 1000);
});

/**
 * Configure le système de réinitialisation du projet
 */
function setupProjectReinitializer() {
    // Ajouter un bouton de réinitialisation si on est sur une page de projet
    addResetButton();
    
    // Intercepter les changements de catégories/modèles
    interceptTemplateChanges();
    
    // Observer les changements de formulaire pour les synchroniser avec le DOM
    setupFormSynchronizer();
}

/**
 * Ajoute un bouton de réinitialisation au projet
 */
function addResetButton() {
    // Vérifier si nous sommes sur une page appropriée
    const projectForm = document.querySelector('.project-form');
    if (!projectForm) return;
    
    // Créer le bouton
    const resetButton = document.createElement('button');
    resetButton.type = 'button'; // Important: ne pas soumettre le formulaire
    resetButton.id = 'resetProjectFormBtn';
    resetButton.className = 'btn btn-sm btn-outline-secondary';
    resetButton.innerHTML = '<i class="fas fa-sync-alt"></i> Réinitialiser l\'interface';
    resetButton.style.marginLeft = '10px';
    resetButton.style.backgroundColor = '#f8f9fa';
    resetButton.style.border = '1px solid #ddd';
    resetButton.style.color = '#495057';
    
    // Ajouter le bouton après le bouton de soumission
    const submitButton = projectForm.querySelector('button[type="submit"]');
    if (submitButton && submitButton.parentNode) {
        submitButton.parentNode.appendChild(resetButton);
    }
    
    // Ajouter l'événement de clic
    resetButton.addEventListener('click', function(e) {
        e.preventDefault();
        reinitializeProjectForm();
    });
}

/**
 * Réinitialise complètement le formulaire de projet
 */
function reinitializeProjectForm() {
    console.log('Réinitialisation complète du formulaire...');
    
    // 1. Capturer l'état actuel du formulaire
    const formData = captureFormState();
    
    // 2. Réinitialiser le DOM pour les catégories
    resetCategoriesDOM();
    
    // 3. Restaurer les données du formulaire
    restoreFormState(formData);
    
    // 4. Réinitialiser tous les écouteurs d'événements
    reinitializeEventListeners();
    
    // 5. Afficher une notification
    showResetNotification();
}

/**
 * Capture l'état actuel du formulaire
 */
function captureFormState() {
    const formData = {
        projectName: document.getElementById('projectName')?.value || '',
        projectDate: document.getElementById('projectDate')?.value || '',
        projectEndDate: document.getElementById('projectEndDate')?.value || '',
        totalBudget: document.getElementById('totalBudget')?.value || '',
        projectStatus: document.getElementById('projectStatus')?.value || 'inProgress',
        template: ''
    };
    
    // Capturer le template sélectionné
    const selectedTemplate = document.querySelector('.template-option.selected');
    if (selectedTemplate) {
        formData.template = selectedTemplate.getAttribute('data-template') || '';
    }
    
    return formData;
}

/**
 * Réinitialise le DOM pour les catégories
 */
function resetCategoriesDOM() {
    const categoriesContainer = document.querySelector('#categoriesContainer');
    if (!categoriesContainer) return;
    
    // Vider le conteneur
    categoriesContainer.innerHTML = '';
    
    // Optionnel: ajouter un indicateur de chargement
    const loadingPlaceholder = document.createElement('div');
    loadingPlaceholder.className = 'loading-placeholder';
    loadingPlaceholder.textContent = 'Actualisation des catégories...';
    categoriesContainer.appendChild(loadingPlaceholder);
}

/**
 * Restaure l'état du formulaire depuis les données capturées
 */
function restoreFormState(formData) {
    // Restaurer les valeurs de base du formulaire
    if (document.getElementById('projectName')) document.getElementById('projectName').value = formData.projectName;
    if (document.getElementById('projectDate')) document.getElementById('projectDate').value = formData.projectDate;
    if (document.getElementById('projectEndDate')) document.getElementById('projectEndDate').value = formData.projectEndDate;
    if (document.getElementById('totalBudget')) document.getElementById('totalBudget').value = formData.totalBudget;
    if (document.getElementById('projectStatus')) document.getElementById('projectStatus').value = formData.projectStatus;
    
    // Réappliquer le template si disponible
    if (formData.template && typeof updateTemplateCategoriesUI === 'function') {
        // Sélectionner visuellement le template
        document.querySelectorAll('.template-option').forEach(option => {
            if (option.getAttribute('data-template') === formData.template) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        });
        
        // Appliquer le template
        updateTemplateCategoriesUI(formData.template);
    }
}

/**
 * Réinitialise tous les écouteurs d'événements
 */
function reinitializeEventListeners() {
    // Reinitialiser les écouteurs de montants
    if (typeof attachBudgetAmountListeners === 'function') {
        setTimeout(attachBudgetAmountListeners, 300);
    }
    
    // Reinitialiser les boutons de suppression
    if (typeof initCategoryDeletionButtons === 'function') {
        setTimeout(initCategoryDeletionButtons, 300);
    }
    
    // Rendre tous les champs éditables
    if (typeof makeSubcategoriesEditableByDefault === 'function') {
        setTimeout(makeSubcategoriesEditableByDefault, 300);
    }
    
    // Forcer l'édition de tous les éléments si disponible
    if (typeof fixAllEditableElements === 'function') {
        setTimeout(fixAllEditableElements, 400);
    }
    
    // Mettre à jour les totaux
    if (typeof updateTotals === 'function') {
        setTimeout(updateTotals, 500);
    }
}

/**
 * Intercepte les changements de template pour assurer une réinitialisation complète
 */
function interceptTemplateChanges() {
    // Intercepter les clics sur les options de template
    document.querySelectorAll('.template-option').forEach(option => {
        option.addEventListener('click', function(e) {
            // Attendre que le template soit appliqué, puis réinitialiser les écouteurs
            setTimeout(reinitializeEventListeners, 500);
        }, true); // Utilisation de la capture pour interception précoce
    });
    
    // Observer les modifications du DOM pour détecter les changements de structure
    const observer = new MutationObserver(function(mutations) {
        let needsReinit = false;
        
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && 
                (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0)) {
                // Vérifier si des éléments de catégorie ont été ajoutés ou supprimés
                needsReinit = true;
            }
        });
        
        if (needsReinit) {
            setTimeout(reinitializeEventListeners, 300);
        }
    });
    
    // Observer le conteneur de catégories s'il existe
    const categoriesContainer = document.querySelector('#categoriesContainer');
    if (categoriesContainer) {
        observer.observe(categoriesContainer, { 
            childList: true, 
            subtree: true 
        });
    }
}

/**
 * Configure un synchroniseur pour s'assurer que les changements de formulaire sont réfléchis dans le DOM
 */
function setupFormSynchronizer() {
    // Observer les modifications du formulaire de projet
    const projectForm = document.querySelector('.project-form');
    if (!projectForm) return;
    
    // Ajouter un écouteur pour la soumission du formulaire
    projectForm.addEventListener('submit', function(e) {
        // Capturer l'événement de soumission pour pouvoir réinitialiser après la sauvegarde
        setTimeout(reinitializeEventListeners, 1000);
    });
    
    // Observer les changements sur certains champs spécifiques
    const fields = ['projectName', 'projectDate', 'projectEndDate', 'totalBudget', 'projectStatus'];
    
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('change', function() {
                // Synchroniser le changement avec le DOM si nécessaire
                console.log(`Champ ${fieldId} modifié, synchronisation en cours...`);
                
                // Pour le budget total, mettre à jour le montant total
                if (fieldId === 'totalBudget' && typeof updateTotals === 'function') {
                    setTimeout(updateTotals, 200);
                }
            });
        }
    });
}

/**
 * Affiche une notification de réinitialisation
 */
function showResetNotification() {
    // Créer la notification
    const notification = document.createElement('div');
    notification.className = 'reset-notification';
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '15px 20px';
    notification.style.backgroundColor = '#17a2b8';
    notification.style.color = 'white';
    notification.style.borderRadius = '5px';
    notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    notification.style.zIndex = '9999';
    notification.style.maxWidth = '300px';
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.3s ease-in-out';
    
    notification.innerHTML = '<i class="fas fa-sync-alt" style="margin-right: 10px;"></i> Interface réinitialisée avec succès';
    
    // Ajouter au corps du document
    document.body.appendChild(notification);
    
    // Afficher avec transition
    setTimeout(function() {
        notification.style.opacity = '1';
    }, 10);
    
    // Supprimer après quelques secondes
    setTimeout(function() {
        notification.style.opacity = '0';
        
        setTimeout(function() {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}