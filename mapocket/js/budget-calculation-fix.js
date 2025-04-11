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
        const subcategoryName = subcategory.querySelector('.subcategory-name')?.textContent || '';
        
        // Si nous n'avons pas de champ de montant de sous-catégorie, sortir
        if (!subcategoryAmount) return;
        
        // Si c'est une saisie directe et qu'il n'y a pas de lignes, préserver la valeur manuelle
        if (lines.length === 0) {
            console.log(`Sous-catégorie "${subcategoryName}" - pas de lignes, préservation du montant manuel`);
            return;
        }
        
        // Sinon, calculer le total des lignes
        let total = 0;
        let hasValues = false;
        
        lines.forEach(function(line) {
            const lineAmount = line.querySelector('.line-amount');
            if (lineAmount) {
                const value = extractNumericValue(lineAmount.textContent);
                if (value > 0) {
                    hasValues = true;
                    total += value;
                }
            }
        });
        
        // Si le montant manuel existait avant les lignes, le conserver
        const existingValue = extractNumericValue(subcategoryAmount.textContent);
        if (existingValue > 0 && !hasValues) {
            total = existingValue;
            console.log(`Sous-catégorie "${subcategoryName}" - préservation du montant existant: ${existingValue}`);
        } else if (existingValue > 0 && hasValues) {
            // Si nous avons des lignes avec valeurs, mais aussi un montant manuel, additionner les deux
            console.log(`Sous-catégorie "${subcategoryName}" - addition: ${existingValue} + ${total}`);
            total += existingValue;
        }
        
        // Mettre à jour le montant de la sous-catégorie
        subcategoryAmount.textContent = formatCurrency(total);
        subcategoryAmount.dataset.value = total;
        console.log(`Sous-catégorie "${subcategoryName}" mise à jour, total final: ${total}`);
    }
    
    // Recalculer le total d'une catégorie
    function recalculateCategoryTotal(category) {
        const subcategories = category.querySelectorAll('.subcategory');
        const categoryAmount = category.querySelector('.category-amount');
        const categoryName = category.querySelector('.category-name')?.textContent || '';
        
        // Si nous n'avons pas de champ de montant de catégorie, sortir
        if (!categoryAmount) return;
        
        // Si c'est une saisie directe et qu'il n'y a pas de sous-catégories, préserver la valeur manuelle
        if (subcategories.length === 0) {
            console.log(`Catégorie "${categoryName}" - pas de sous-catégories, préservation du montant manuel`);
            return;
        }
        
        // Sinon, calculer le total des sous-catégories
        let total = 0;
        let hasValues = false;
        
        subcategories.forEach(function(subcategory) {
            const subcategoryAmount = subcategory.querySelector('.subcategory-amount');
            if (subcategoryAmount) {
                const value = extractNumericValue(subcategoryAmount.textContent);
                if (value > 0) {
                    hasValues = true;
                    total += value;
                }
            }
        });
        
        // Si le montant manuel existait avant les sous-catégories, l'ajouter au total
        const existingValue = extractNumericValue(categoryAmount.textContent);
        if (existingValue > 0 && !hasValues) {
            total = existingValue;
            console.log(`Catégorie "${categoryName}" - préservation du montant existant: ${existingValue}`);
        } else if (existingValue > 0 && hasValues) {
            // Si nous avons des sous-catégories avec valeurs, mais aussi un montant manuel, additionner les deux
            console.log(`Catégorie "${categoryName}" - addition: ${existingValue} + ${total}`);
            total += existingValue;
        }
        
        // Mettre à jour le montant de la catégorie avec le nouveau total
        categoryAmount.textContent = formatCurrency(total);
        categoryAmount.dataset.value = total;
        console.log(`Catégorie "${categoryName}" mise à jour, total final: ${total}`);
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
        // Capturer le symbole actuel depuis le budget total pour assurer la cohérence
        const totalBudgetElement = document.getElementById('totalBudget');
        if (totalBudgetElement) {
            const totalBudgetText = totalBudgetElement.textContent || '';
            // Extraire le symbole de devise du texte du budget total
            const currencySymbolMatch = totalBudgetText.match(/^([^\d]+)/);
            if (currencySymbolMatch && currencySymbolMatch[1]) {
                const symbol = currencySymbolMatch[1].trim();
                return `${symbol} ${amount.toFixed(2).replace('.', ',')}`;
            }
        }
        
        // Si la fonction getCurrencySymbol est disponible, l'utiliser comme seconde option
        if (typeof getCurrencySymbol === 'function') {
            const symbol = getCurrencySymbol();
            return `${symbol} ${amount.toFixed(2).replace('.', ',')}`;
        }
        
        // Tenter de trouver le symbole AED dans les montants existants
        const anyAmount = document.querySelector('.category-amount, .subcategory-amount, .line-amount');
        if (anyAmount) {
            const anyAmountText = anyAmount.textContent || '';
            const anySymbolMatch = anyAmountText.match(/^([^\d]+)/);
            if (anySymbolMatch && anySymbolMatch[1]) {
                const symbol = anySymbolMatch[1].trim();
                return `${symbol} ${amount.toFixed(2).replace('.', ',')}`;
            }
        }
        
        // Si tout échoue, préserver "AED" qui est la devise dans vos données
        return `AED ${amount.toFixed(2).replace('.', ',')}`;
    }
});