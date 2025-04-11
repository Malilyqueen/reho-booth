// Script pour améliorer la gestion de la suppression des sous-catégories
// Cette correction permet à l'utilisateur de supprimer une sous-catégorie
// et que le montant de la catégorie parente redevienne modifiable

document.addEventListener('DOMContentLoaded', function() {
    console.log('Initialisation du système de suppression de sous-catégories...');
    
    // Attendre un court instant pour s'assurer que tous les autres scripts sont chargés
    setTimeout(function() {
        // S'assurer que les boutons de suppression fonctionnent bien
        initCategoryDeletionButtons();
        
        // Surveiller les changements dans le DOM pour les nouveaux boutons
        setupCategoryDeletionObserver();
        
        // Rendre toutes les sous-catégories éditables par défaut s'il n'y a pas de lignes
        makeSubcategoriesEditableByDefault();
    }, 500);
});

// Initialisation des boutons de suppression existants
function initCategoryDeletionButtons() {
    // Gérer les boutons de suppression de sous-catégorie
    document.querySelectorAll('.delete-subcategory-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const subcategory = this.closest('.subcategory');
            if (subcategory) {
                enhancedDeleteSubcategory(subcategory);
            }
        });
    });
    
    // Gérer les boutons de suppression de ligne
    document.querySelectorAll('.delete-line-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const line = this.closest('.expense-line');
            if (line) {
                const subcategory = line.closest('.subcategory');
                enhancedDeleteLine(line, subcategory);
            }
        });
    });
}

// Configurer un observateur pour surveiller les nouveaux boutons de suppression
function setupCategoryDeletionObserver() {
    // Observer les changements dans le DOM pour les nouveaux boutons
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // Examiner les nouveaux nœuds pour voir s'ils contiennent des boutons de suppression
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Élément
                        const deleteSubcatBtns = node.querySelectorAll('.delete-subcategory-btn');
                        const deleteLineBtns = node.querySelectorAll('.delete-line-btn');
                        
                        if (deleteSubcatBtns.length > 0 || deleteLineBtns.length > 0) {
                            // Attendre un peu que le DOM soit complètement mis à jour
                            setTimeout(function() {
                                initCategoryDeletionButtons();
                            }, 50);
                        }
                    }
                });
            }
        });
    });
    
    // Observer le corps du document pour les changements
    observer.observe(document.body, { childList: true, subtree: true });
}

// Suppression améliorée d'une sous-catégorie
function enhancedDeleteSubcategory(subcategoryElement) {
    if (!subcategoryElement) return;
    
    // Trouver la catégorie parente
    const categoryElement = subcategoryElement.closest('.expense-category');
    
    // Supprimer la sous-catégorie
    subcategoryElement.remove();
    
    // Vérifier s'il reste des sous-catégories
    if (categoryElement) {
        const remainingSubcategories = categoryElement.querySelectorAll('.subcategory');
        const categoryAmountEl = categoryElement.querySelector('.category-amount');
        
        // S'il ne reste plus de sous-catégories, rendre le montant de la catégorie modifiable
        if (remainingSubcategories.length === 0 && categoryAmountEl) {
            makeElementEditable(categoryAmountEl);
        }
        
        // Mettre à jour les totaux
        if (typeof updateTotals === 'function') {
            setTimeout(updateTotals, 100);
        }
    }
}

// Suppression améliorée d'une ligne de dépense
function enhancedDeleteLine(lineElement, subcategoryElement) {
    if (!lineElement) return;
    
    // Supprimer la ligne
    lineElement.remove();
    
    // Vérifier s'il reste des lignes dans la sous-catégorie
    if (subcategoryElement) {
        const remainingLines = subcategoryElement.querySelectorAll('.expense-line');
        const subcategoryAmountEl = subcategoryElement.querySelector('.subcategory-amount');
        
        // S'il ne reste plus de lignes, rendre le montant de la sous-catégorie modifiable
        if (remainingLines.length === 0 && subcategoryAmountEl) {
            makeElementEditable(subcategoryAmountEl);
        }
        
        // Mettre à jour les totaux
        if (typeof updateTotals === 'function') {
            setTimeout(updateTotals, 100);
        }
    }
}

// Fonction pour rendre toutes les sous-catégories éditables par défaut si elles n'ont pas de lignes
function makeSubcategoriesEditableByDefault() {
    document.querySelectorAll('.subcategory').forEach(subcategory => {
        const lines = subcategory.querySelectorAll('.expense-line');
        const subcategoryAmountEl = subcategory.querySelector('.subcategory-amount');
        
        if (lines.length === 0 && subcategoryAmountEl) {
            makeElementEditable(subcategoryAmountEl);
            
            // S'assurer que les boutons de suppression sont fonctionnels
            const deleteBtn = subcategory.querySelector('.delete-subcategory-btn');
            if (deleteBtn) {
                deleteBtn.style.opacity = '1';
                deleteBtn.style.pointerEvents = 'auto';
            }
        }
    });
    
    // Vérifier aussi les catégories
    document.querySelectorAll('.expense-category').forEach(category => {
        const subcategories = category.querySelectorAll('.subcategory');
        const categoryAmountEl = category.querySelector('.category-amount');
        
        if (subcategories.length === 0 && categoryAmountEl) {
            makeElementEditable(categoryAmountEl);
        }
    });
}

// Fonction utilitaire pour rendre un élément modifiable
function makeElementEditable(element) {
    if (!element) return;
    
    // Nettoyer les attributs
    element.removeAttribute('data-has-lines');
    element.removeAttribute('data-has-subcategories');
    element.removeAttribute('data-calculated');
    
    // Rendre modifiable
    element.contentEditable = 'true';
    
    // Appliquer des styles clairs pour indiquer que c'est modifiable
    element.style.backgroundColor = '';
    element.style.fontStyle = 'normal';
    element.style.cursor = 'text';
    element.style.border = '1px dashed #ccc';
    element.style.pointerEvents = 'auto';
    
    // Supprimer l'indicateur automatique s'il existe
    if (element.textContent.includes('🔄')) {
        element.textContent = element.textContent.replace(' 🔄', '');
    }
    
    // Supprimer l'indicateur automatique s'il existe en tant qu'élément
    const indicator = element.querySelector('.auto-indicator');
    if (indicator) {
        indicator.remove();
    }
    
    // Mettre à jour l'info-bulle
    element.setAttribute('title', 'Montant modifiable directement');
}