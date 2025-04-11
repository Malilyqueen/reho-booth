/**
 * Template Switcher - Gestion dynamique du changement de catégories
 * 
 * Ce script améliore l'expérience utilisateur lors du changement de modèle/template
 * en s'assurant que tous les composants sont correctement réinitialisés
 * sans nécessiter d'actualisation de la page.
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Initialisation du gestionnaire de changement de templates...');
    
    // Attendre que tous les scripts soient chargés
    setTimeout(function() {
        initializeTemplateSwitching();
    }, 800);
});

/**
 * Initialise le système de changement de template
 */
function initializeTemplateSwitching() {
    // Capturer les événements de changement de template
    const templateOptions = document.querySelectorAll('.template-option');
    if (templateOptions.length > 0) {
        templateOptions.forEach(option => {
            // Remplacer les gestionnaires d'événements existants
            const clone = option.cloneNode(true);
            option.parentNode.replaceChild(clone, option);
            
            // Ajouter le nouvel écouteur d'événements
            clone.addEventListener('click', function(e) {
                const templateName = this.getAttribute('data-template');
                console.log('Changement de template vers:', templateName);
                
                // Highlight ce template et désélectionner les autres
                document.querySelectorAll('.template-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                this.classList.add('selected');
                
                // Attendre un court instant avant d'appliquer le template
                setTimeout(function() {
                    applyTemplateWithReset(templateName);
                }, 100);
            });
        });
    }
    
    // Observer les changements dans les catégories
    monitorCategoryChanges();
}

/**
 * Applique un template avec réinitialisation complète
 */
function applyTemplateWithReset(templateName) {
    // 1. Capturer l'état actuel du formulaire
    const projectName = document.getElementById('projectName')?.value || '';
    const projectDate = document.getElementById('projectDate')?.value || '';
    const projectEndDate = document.getElementById('projectEndDate')?.value || '';
    const totalBudget = document.getElementById('totalBudget')?.value || '';
    const projectStatus = document.getElementById('projectStatus')?.value || 'inProgress';
    
    // 2. Réinitialiser complètement le conteneur de catégories
    const categoriesContainer = document.querySelector('#categoriesContainer');
    if (categoriesContainer) {
        // Sauvegarder une référence au parent
        const parentContainer = categoriesContainer.parentNode;
        
        // Supprimer l'ancien conteneur
        categoriesContainer.remove();
        
        // Créer un nouveau conteneur
        const newCategoriesContainer = document.createElement('div');
        newCategoriesContainer.id = 'categoriesContainer';
        newCategoriesContainer.className = 'categories-container';
        
        // Ajouter le nouveau conteneur
        parentContainer.appendChild(newCategoriesContainer);
    }
    
    // 3. Forcer l'application du template
    if (typeof updateTemplateCategoriesUI === 'function') {
        // Simuler un événement de sélection de template
        const event = new CustomEvent('templateSelected', {
            detail: { template: templateName }
        });
        document.dispatchEvent(event);
        
        // Appeler directement la fonction de mise à jour
        updateTemplateCategoriesUI(templateName);
    } else {
        console.error('La fonction updateTemplateCategoriesUI n\'est pas disponible');
    }
    
    // 4. Restaurer les valeurs du formulaire
    if (document.getElementById('projectName')) document.getElementById('projectName').value = projectName;
    if (document.getElementById('projectDate')) document.getElementById('projectDate').value = projectDate;
    if (document.getElementById('projectEndDate')) document.getElementById('projectEndDate').value = projectEndDate;
    if (document.getElementById('totalBudget')) document.getElementById('totalBudget').value = totalBudget;
    if (document.getElementById('projectStatus')) document.getElementById('projectStatus').value = projectStatus;
    
    // 5. Réinitialiser tous les écouteurs d'événements et comportements
    setTimeout(function() {
        reinitializeAllEventListeners();
    }, 300);
}

/**
 * Réinitialise tous les écouteurs d'événements après un changement
 */
function reinitializeAllEventListeners() {
    // Reinitialiser les écouteurs de montants
    if (typeof attachBudgetAmountListeners === 'function') {
        attachBudgetAmountListeners();
    }
    
    // Reinitialiser les boutons de suppression
    if (typeof initCategoryDeletionButtons === 'function') {
        initCategoryDeletionButtons();
    }
    
    // Rendre tous les champs éditables
    if (typeof makeSubcategoriesEditableByDefault === 'function') {
        makeSubcategoriesEditableByDefault();
    }
    
    // Forcer l'édition de tous les éléments si disponible
    if (typeof fixAllEditableElements === 'function') {
        fixAllEditableElements();
    }
    
    // Mettre à jour les totaux
    if (typeof updateTotals === 'function') {
        updateTotals();
    }
    
    // Notification pour l'utilisateur
    showTemplateChangedNotification();
}

/**
 * Observe les changements dans les catégories pour s'assurer que tout reste modifiable
 */
function monitorCategoryChanges() {
    // Observer les changements dans le DOM pour les catégories
    const observer = new MutationObserver(function(mutations) {
        let categoryChangesDetected = false;
        
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Élément
                        // Vérifier si c'est une catégorie ou sous-catégorie
                        if (node.classList && 
                            (node.classList.contains('expense-category') || 
                             node.classList.contains('subcategory'))) {
                            categoryChangesDetected = true;
                        }
                    }
                });
            }
        });
        
        if (categoryChangesDetected) {
            console.log('Changements de catégories détectés, réinitialisation des écouteurs...');
            setTimeout(function() {
                reinitializeAllEventListeners();
            }, 200);
        }
    });
    
    // Observer le conteneur de catégories s'il existe
    const categoriesContainer = document.querySelector('#categoriesContainer');
    if (categoriesContainer) {
        observer.observe(categoriesContainer, { 
            childList: true, 
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'style']
        });
    }
}

/**
 * Affiche une notification lors du changement de template
 */
function showTemplateChangedNotification() {
    // Créer la notification
    const notification = document.createElement('div');
    notification.className = 'template-change-notification';
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.padding = '15px 20px';
    notification.style.backgroundColor = '#28a745';
    notification.style.color = 'white';
    notification.style.borderRadius = '5px';
    notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    notification.style.zIndex = '9999';
    notification.style.maxWidth = '300px';
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.3s ease-in-out';
    
    notification.innerHTML = '<i class="fas fa-check-circle" style="margin-right: 10px;"></i> Modèle appliqué avec succès';
    
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