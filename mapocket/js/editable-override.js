/**
 * Ce script corrige les problèmes d'édition des sous-catégories et catégories
 * Il s'assure que tous les montants sont réellement modifiables
 * et que les boutons de suppression fonctionnent correctement.
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Initialisation du correctif d\'édition globale');
    
    // Appliquer immédiatement les correctifs
    setTimeout(function() {
        fixAllEditableElements();
        addEditModeToggleButton();
    }, 800);
});

/**
 * Corrige tous les éléments éditables
 */
function fixAllEditableElements() {
    // Rendre tous les montants éditables
    document.querySelectorAll('.subcategory-amount, .category-amount, .line-amount').forEach(element => {
        element.contentEditable = 'true';
        element.style.cursor = 'text';
        element.style.pointerEvents = 'auto';
        
        // S'assurer que l'élément est cliquable
        element.addEventListener('click', function(e) {
            this.focus();
        });
    });
    
    // Rendre tous les boutons de suppression fonctionnels
    document.querySelectorAll('.delete-subcategory-btn, .delete-line-btn, .delete-category-btn').forEach(button => {
        button.style.opacity = '1';
        button.style.pointerEvents = 'auto';
        
        // Supprimer et recréer pour éviter les écouteurs d'événements multiples
        const parent = button.parentNode;
        const clone = button.cloneNode(true);
        parent.replaceChild(clone, button);
        
        // Ajouter un nouvel écouteur d'événements
        clone.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (this.classList.contains('delete-subcategory-btn')) {
                const subcategory = this.closest('.subcategory');
                if (subcategory) subcategory.remove();
            } else if (this.classList.contains('delete-line-btn')) {
                const line = this.closest('.expense-line');
                if (line) line.remove();
            } else if (this.classList.contains('delete-category-btn')) {
                const category = this.closest('.expense-category');
                if (category) category.remove();
            }
            
            // Mettre à jour les totaux si la fonction existe
            if (typeof updateTotals === 'function') {
                setTimeout(updateTotals, 100);
            }
        });
    });
}

/**
 * Ajoute un bouton de bascule du mode édition
 */
function addEditModeToggleButton() {
    // Vérifier si nous sommes sur une page de projet
    const categoriesContainer = document.querySelector('.categories-container');
    if (!categoriesContainer) return;
    
    // Créer le bouton
    const toggleButton = document.createElement('button');
    toggleButton.textContent = 'Activer Mode Édition Complète';
    toggleButton.className = 'btn btn-sm btn-edit-mode-toggle';
    toggleButton.style.marginLeft = '10px';
    toggleButton.style.backgroundColor = '#6f802b';
    toggleButton.style.color = 'white';
    
    // Ajouter après les boutons existants
    const actionsArea = document.querySelector('.categories-header');
    if (actionsArea) {
        actionsArea.appendChild(toggleButton);
    }
    
    // Gérer les clics
    toggleButton.addEventListener('click', function() {
        const isEnabled = this.classList.toggle('active');
        if (isEnabled) {
            this.textContent = 'Désactiver Mode Édition';
            this.style.backgroundColor = '#dc3545';
            enableFullEditMode();
        } else {
            this.textContent = 'Activer Mode Édition Complète';
            this.style.backgroundColor = '#6f802b';
            disableFullEditMode();
        }
    });
}

/**
 * Active le mode d'édition complète
 */
function enableFullEditMode() {
    // Ajouter une classe au conteneur principal
    const container = document.querySelector('.categories-container');
    if (container) {
        container.classList.add('full-edit-mode');
    }
    
    // Rendre tous les éléments modifiables
    document.querySelectorAll('.subcategory-amount, .category-amount, .line-amount').forEach(element => {
        element.contentEditable = 'true';
        element.style.cursor = 'text';
        element.style.border = '1px dashed #6f802b';
        element.style.backgroundColor = 'rgba(111, 128, 43, 0.05)';
        element.style.pointerEvents = 'auto';
        
        // Supprimer les attributs et classes qui pourraient bloquer l'édition
        element.removeAttribute('data-calculated');
        element.removeAttribute('data-has-lines');
        element.removeAttribute('data-has-subcategories');
        
        // Supprimer l'indicateur automatique s'il existe
        if (element.textContent.includes('🔄')) {
            element.textContent = element.textContent.replace(' 🔄', '');
        }
    });
    
    // Activer tous les boutons de suppression
    document.querySelectorAll('.delete-subcategory-btn, .delete-line-btn, .delete-category-btn').forEach(button => {
        button.style.opacity = '1';
        button.style.pointerEvents = 'auto';
    });
    
    // Afficher une notification
    showEditModeNotification(true);
}

/**
 * Désactive le mode d'édition complète
 */
function disableFullEditMode() {
    // Retirer la classe du conteneur principal
    const container = document.querySelector('.categories-container');
    if (container) {
        container.classList.remove('full-edit-mode');
    }
    
    // Réappliquer la logique de calcul automatique
    if (typeof updateTotals === 'function') {
        updateTotals();
    }
    
    // Afficher une notification
    showEditModeNotification(false);
}

/**
 * Affiche une notification temporaire
 */
function showEditModeNotification(isEnabled) {
    // Créer la notification
    const notification = document.createElement('div');
    notification.className = 'edit-mode-notification';
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '15px 20px';
    notification.style.borderRadius = '5px';
    notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    notification.style.zIndex = '9999';
    notification.style.maxWidth = '300px';
    
    if (isEnabled) {
        notification.style.backgroundColor = '#6f802b';
        notification.style.color = 'white';
        notification.innerHTML = '<strong>Mode édition complète activé</strong><p>Tous les montants sont maintenant modifiables directement.</p>';
    } else {
        notification.style.backgroundColor = '#17a2b8';
        notification.style.color = 'white';
        notification.innerHTML = '<strong>Mode édition standard activé</strong><p>Le calcul automatique est réactivé.</p>';
    }
    
    // Ajouter au corps du document
    document.body.appendChild(notification);
    
    // Supprimer après quelques secondes
    setTimeout(function() {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s ease-out';
        
        setTimeout(function() {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 500);
    }, 3000);
}