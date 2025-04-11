/**
 * Correctif spécifique pour le problème de totalisation des catégories et sous-catégories
 * Ce script renforce les calculs pour s'assurer que les montants sont correctement agrégés
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Initialisation du correctif de calcul des budgets...');
    
    // Attendre que le DOM soit complètement chargé
    window.addEventListener('load', function() {
        // Attendre un peu que les autres scripts aient le temps de s'initialiser
        setTimeout(initializeBudgetCalculationFix, 500);
    });
    
    // Fonction principale d'initialisation du correctif
    function initializeBudgetCalculationFix() {
        console.log('Application du correctif de calcul des budgets...');
        
        // Vérifier si nous sommes sur une page avec un formulaire de projet
        const projectForm = document.getElementById('newProjectForm');
        if (!projectForm) {
            console.log('Pas de formulaire de projet détecté, le correctif n\'est pas nécessaire');
            return;
        }
        
        // Ajout d'événements sur les catégories et sous-catégories pour recalculer les totaux
        attachBudgetListenersToAllItems();
        
        // Premier calcul forcé
        recalculateAllSubcategories();
        recalculateAllCategories();
        
        // Observer les changements dans le DOM pour surveiller l'ajout de nouvelles catégories/sous-catégories
        const categoriesContainer = document.getElementById('categoriesContainer');
        if (categoriesContainer) {
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        // Attacher les écouteurs aux nouveaux éléments
                        setTimeout(function() {
                            attachBudgetListenersToAllItems();
                            recalculateAllSubcategories();
                            recalculateAllCategories();
                        }, 100);
                    }
                });
            });
            
            observer.observe(categoriesContainer, { childList: true, subtree: true });
        }
    }
    
    // Attacher des écouteurs d'événements à tous les éléments du budget
    function attachBudgetListenersToAllItems() {
        // Écouteurs pour les montants des lignes
        document.querySelectorAll('.line-amount').forEach(function(lineAmount) {
            // Supprimer les écouteurs existants pour éviter les doublons
            lineAmount.removeEventListener('input', handleLineChange);
            lineAmount.removeEventListener('blur', handleLineChange);
            
            // Ajouter les nouveaux écouteurs
            lineAmount.addEventListener('input', handleLineChange);
            lineAmount.addEventListener('blur', handleLineChange);
        });
        
        // Écouteurs pour les montants des sous-catégories
        document.querySelectorAll('.subcategory-amount').forEach(function(subcategoryAmount) {
            // Supprimer les écouteurs existants pour éviter les doublons
            subcategoryAmount.removeEventListener('input', handleSubcategoryChange);
            subcategoryAmount.removeEventListener('blur', handleSubcategoryChange);
            
            // Ajouter les nouveaux écouteurs
            subcategoryAmount.addEventListener('input', handleSubcategoryChange);
            subcategoryAmount.addEventListener('blur', handleSubcategoryChange);
        });
        
        // Écouteurs pour les montants des catégories
        document.querySelectorAll('.category-amount').forEach(function(categoryAmount) {
            // Supprimer les écouteurs existants pour éviter les doublons
            categoryAmount.removeEventListener('input', handleCategoryChange);
            categoryAmount.removeEventListener('blur', handleCategoryChange);
            
            // Ajouter les nouveaux écouteurs
            categoryAmount.addEventListener('input', handleCategoryChange);
            categoryAmount.addEventListener('blur', handleCategoryChange);
        });
        
        console.log('Écouteurs de budget attachés à tous les éléments');
    }
    
    // Gestionnaires d'événements
    function handleLineChange(event) {
        const lineAmount = event.target;
        const subcategory = lineAmount.closest('.subcategory');
        if (subcategory) {
            recalculateSubcategoryTotal(subcategory);
            
            // Remonter à la catégorie parente
            const category = subcategory.closest('.expense-category');
            if (category) {
                recalculateCategoryTotal(category);
            }
        }
    }
    
    function handleSubcategoryChange(event) {
        const subcategoryAmount = event.target;
        const subcategory = subcategoryAmount.closest('.subcategory');
        
        // Si la sous-catégorie a des lignes, recalculer son total n'a pas de sens
        // car il sera écrasé par les lignes
        const hasLines = subcategory.querySelectorAll('.expense-line').length > 0;
        if (!hasLines) {
            // Si nous n'avons pas de lignes, nous acceptons la valeur manuelle
            const category = subcategory.closest('.expense-category');
            if (category) {
                recalculateCategoryTotal(category);
            }
        } else {
            // Sinon, forcer le recalcul à partir des lignes
            recalculateSubcategoryTotal(subcategory);
            
            // Et remonter à la catégorie
            const category = subcategory.closest('.expense-category');
            if (category) {
                recalculateCategoryTotal(category);
            }
        }
    }
    
    function handleCategoryChange(event) {
        // Si la catégorie a des sous-catégories, recalculer son total n'a pas de sens
        // car il sera écrasé par les sous-catégories
        const categoryAmount = event.target;
        const category = categoryAmount.closest('.expense-category');
        
        const hasSubcategories = category.querySelectorAll('.subcategory').length > 0;
        if (!hasSubcategories) {
            // Si nous n'avons pas de sous-catégories, nous acceptons la valeur manuelle
            // Rien à faire ici
        } else {
            // Sinon, forcer le recalcul à partir des sous-catégories
            recalculateCategoryTotal(category);
        }
    }
    
    // Recalculer tous les totaux des sous-catégories
    function recalculateAllSubcategories() {
        document.querySelectorAll('.subcategory').forEach(function(subcategory) {
            recalculateSubcategoryTotal(subcategory);
        });
    }
    
    // Recalculer tous les totaux des catégories
    function recalculateAllCategories() {
        document.querySelectorAll('.expense-category').forEach(function(category) {
            recalculateCategoryTotal(category);
        });
    }
    
    // Recalculer le total d'une sous-catégorie
    function recalculateSubcategoryTotal(subcategory) {
        const lines = subcategory.querySelectorAll('.expense-line');
        const subcategoryAmount = subcategory.querySelector('.subcategory-amount');
        
        // Si nous n'avons pas de lignes ou pas de champ de montant de sous-catégorie, sortir
        if (lines.length === 0 || !subcategoryAmount) return;
        
        // Calculer le total des lignes
        let total = 0;
        lines.forEach(function(line) {
            const lineAmount = line.querySelector('.line-amount');
            if (lineAmount) {
                const value = extractNumericValue(lineAmount.textContent);
                total += value;
            }
        });
        
        // Mettre à jour le montant de la sous-catégorie
        subcategoryAmount.textContent = formatCurrency(total);
        subcategoryAmount.dataset.value = total;
        console.log(`Sous-catégorie "${subcategory.querySelector('.subcategory-name')?.textContent}" mise à jour, total: ${total}`);
    }
    
    // Recalculer le total d'une catégorie
    function recalculateCategoryTotal(category) {
        const subcategories = category.querySelectorAll('.subcategory');
        const categoryAmount = category.querySelector('.category-amount');
        
        // Si nous n'avons pas de sous-catégories ou pas de champ de montant de catégorie, sortir
        if (subcategories.length === 0 || !categoryAmount) return;
        
        // Calculer le total des sous-catégories
        let total = 0;
        subcategories.forEach(function(subcategory) {
            const subcategoryAmount = subcategory.querySelector('.subcategory-amount');
            if (subcategoryAmount) {
                const value = extractNumericValue(subcategoryAmount.textContent);
                total += value;
            }
        });
        
        // Mettre à jour le montant de la catégorie
        categoryAmount.textContent = formatCurrency(total);
        categoryAmount.dataset.value = total;
        console.log(`Catégorie "${category.querySelector('.category-name')?.textContent}" mise à jour, total: ${total}`);
    }
    
    // Extraire la valeur numérique d'une chaîne
    function extractNumericValue(str) {
        if (!str) return 0;
        
        // Nettoyer la chaîne
        const cleaned = str.replace(/[^\d.,]/g, '').replace(',', '.');
        
        // Convertir en nombre
        const value = parseFloat(cleaned);
        return isNaN(value) ? 0 : value;
    }
    
    // Formater un nombre en devise
    function formatCurrency(amount) {
        // Vérifier si la fonction getCurrencySymbol est disponible
        if (typeof getCurrencySymbol === 'function') {
            const symbol = getCurrencySymbol();
            return `${symbol} ${amount.toFixed(2).replace('.', ',')}`;
        }
        
        // Par défaut, utiliser l'euro
        return `€ ${amount.toFixed(2).replace('.', ',')}`;
    }
});