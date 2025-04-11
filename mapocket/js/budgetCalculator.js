/**
 * MODULE: budgetCalculator.js
 * 
 * Ce module gère tous les calculs des budgets dans l'application.
 * Il s'occupe de la mise à jour des montants en cascade, depuis les lignes
 * jusqu'au budget total, en garantissant la cohérence des données.
 * 
 * Fonctionnalités principales:
 * - Calcul automatique des montants des sous-catégories
 * - Calcul automatique des montants des catégories
 * - Mise à jour du budget total
 * - Formatage des montants selon les préférences utilisateur
 */

const BudgetCalculator = (function() {
    // Références aux sélecteurs DOM
    const DOM_SELECTORS = {
        expenseCategories: '#expenseCategories',
        categoriesContainer: '#categoriesContainer',
        totalBudgetDisplay: '.total-budget-amount',
        totalBudgetInput: '#totalBudget'
    };
    
    // Configuration des classes CSS pour cibler les éléments
    const CSS_CLASSES = {
        expenseCategory: 'expense-category',
        categoryAmount: 'category-amount',
        subcategory: 'subcategory',
        subcategoryAmount: 'subcategory-amount',
        expenseLine: 'expense-line',
        lineAmount: 'line-amount'
    };
    
    /**
     * Initialise le calculateur de budget
     */
    function initialize() {
        console.log('Initialisation du calculateur de budget...');
        
        // Observer les changements dans les champs de montants
        _attachAmountChangeListeners();
        
        // Configurer un observateur de mutation pour surveiller les nouveaux éléments
        _setupMutationObserver();
        
        return {
            success: true,
            message: 'Calculateur de budget initialisé avec succès'
        };
    }
    
    /**
     * Recalcule tous les montants du projet
     * Cascade: Lignes → Sous-catégories → Catégories → Total
     */
    function recalculateAllAmounts() {
        console.log('🔄 Recalcul de tous les montants...');
        
        try {
            // 1. Trouver le conteneur principal
            const container = document.querySelector(DOM_SELECTORS.expenseCategories) || 
                             document.querySelector(DOM_SELECTORS.categoriesContainer);
            
            if (!container) {
                console.error('❌ Conteneur de budget non trouvé');
                return false;
            }
            
            // 2. Recalculer pour chaque catégorie
            const categories = container.querySelectorAll('.' + CSS_CLASSES.expenseCategory);
            let projectTotal = 0;
            
            categories.forEach(categoryElement => {
                const categoryTotal = _recalculateCategoryAmount(categoryElement);
                projectTotal += categoryTotal;
            });
            
            // 3. Mettre à jour le total du projet
            _updateProjectTotal(projectTotal);
            
            console.log('✅ Recalcul terminé avec succès. Total du projet:', projectTotal);
            return true;
        } catch (error) {
            console.error('❌ Erreur lors du recalcul des montants:', error);
            return false;
        }
    }
    
    /**
     * Recalcule le montant d'une catégorie spécifique
     * @param {HTMLElement} categoryElement Élément DOM de la catégorie
     * @returns {number} Le montant total de la catégorie
     */
    function recalculateCategoryAmount(categoryElement) {
        if (!categoryElement) {
            console.error('❌ Élément de catégorie non fourni');
            return 0;
        }
        
        return _recalculateCategoryAmount(categoryElement);
    }
    
    /**
     * Recalcule le montant d'une sous-catégorie spécifique
     * @param {HTMLElement} subcategoryElement Élément DOM de la sous-catégorie
     * @returns {number} Le montant total de la sous-catégorie
     */
    function recalculateSubcategoryAmount(subcategoryElement) {
        if (!subcategoryElement) {
            console.error('❌ Élément de sous-catégorie non fourni');
            return 0;
        }
        
        return _recalculateSubcategoryAmount(subcategoryElement);
    }
    
    /**
     * Formate un montant selon les préférences de l'utilisateur
     * @param {number|string} amount Le montant à formater
     * @returns {string} Le montant formaté
     */
    function formatAmount(amount) {
        // Convertir en nombre si c'est une chaîne
        if (typeof amount === 'string') {
            amount = parseFloat(amount.replace(/[^\d.-]/g, '')) || 0;
        }
        
        // Utiliser la devise préférée de l'utilisateur si disponible
        let symbol = '€';
        
        if (window.PreferencesManager && window.PreferencesManager.getCurrentCurrencySymbol) {
            symbol = PreferencesManager.getCurrentCurrencySymbol();
        }
        
        // Format: symbole suivi du montant avec 2 décimales
        return `${symbol} ${amount.toFixed(2).replace(".", ",")}`;
    }
    
    /**
     * Méthode privée pour recalculer le montant d'une catégorie
     * @private
     * @param {HTMLElement} categoryElement Élément DOM de la catégorie
     * @returns {number} Le montant total de la catégorie
     */
    function _recalculateCategoryAmount(categoryElement) {
        // Trouver toutes les sous-catégories
        const subcategories = categoryElement.querySelectorAll('.' + CSS_CLASSES.subcategory);
        let categoryTotal = 0;
        
        // Calculer le total de chaque sous-catégorie
        subcategories.forEach(subcategoryElement => {
            const subcategoryTotal = _recalculateSubcategoryAmount(subcategoryElement);
            categoryTotal += subcategoryTotal;
        });
        
        // Mettre à jour l'affichage du montant de la catégorie
        const categoryAmountElement = categoryElement.querySelector('.' + CSS_CLASSES.categoryAmount);
        if (categoryAmountElement) {
            categoryAmountElement.textContent = formatAmount(categoryTotal);
        }
        
        return categoryTotal;
    }
    
    /**
     * Méthode privée pour recalculer le montant d'une sous-catégorie
     * @private
     * @param {HTMLElement} subcategoryElement Élément DOM de la sous-catégorie
     * @returns {number} Le montant total de la sous-catégorie
     */
    function _recalculateSubcategoryAmount(subcategoryElement) {
        // Trouver toutes les lignes de dépense
        const expenseLines = subcategoryElement.querySelectorAll('.' + CSS_CLASSES.expenseLine);
        let subcategoryTotal = 0;
        
        // Calculer le total de chaque ligne
        expenseLines.forEach(lineElement => {
            const lineAmountElement = lineElement.querySelector('.' + CSS_CLASSES.lineAmount);
            
            if (lineAmountElement) {
                let lineAmount = 0;
                
                // Si c'est un input, prendre sa valeur
                if (lineAmountElement.tagName === 'INPUT') {
                    lineAmount = parseFloat(lineAmountElement.value) || 0;
                } else {
                    // Sinon, extraire le montant du texte
                    lineAmount = _extractAmountFromText(lineAmountElement.textContent);
                }
                
                subcategoryTotal += lineAmount;
            }
        });
        
        // Mettre à jour l'affichage du montant de la sous-catégorie
        const subcategoryAmountElement = subcategoryElement.querySelector('.' + CSS_CLASSES.subcategoryAmount);
        if (subcategoryAmountElement) {
            subcategoryAmountElement.textContent = formatAmount(subcategoryTotal);
        }
        
        return subcategoryTotal;
    }
    
    /**
     * Méthode privée pour mettre à jour le total du projet
     * @private
     * @param {number} total Le montant total
     */
    function _updateProjectTotal(total) {
        // Mettre à jour l'affichage du total
        const totalDisplay = document.querySelector(DOM_SELECTORS.totalBudgetDisplay);
        if (totalDisplay) {
            totalDisplay.textContent = formatAmount(total);
        }
        
        // Mettre à jour le champ de saisie du total (s'il existe)
        const totalInput = document.querySelector(DOM_SELECTORS.totalBudgetInput);
        if (totalInput) {
            totalInput.value = total;
        }
    }
    
    /**
     * Méthode privée pour attacher les écouteurs d'événements aux champs de montants
     * @private
     */
    function _attachAmountChangeListeners() {
        // Attacher des écouteurs aux champs de montants existants
        document.querySelectorAll('input.' + CSS_CLASSES.lineAmount).forEach(input => {
            _attachInputListeners(input);
        });
    }
    
    /**
     * Méthode privée pour configurer un observateur de mutation
     * pour détecter les nouveaux éléments ajoutés au DOM
     * @private
     */
    function _setupMutationObserver() {
        const observer = new MutationObserver(mutations => {
            let shouldRecalculate = false;
            
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // Parcourir les nouveaux nœuds pour trouver des champs de montant
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Si le nœud lui-même est un input de montant
                            if (node.classList && node.classList.contains(CSS_CLASSES.lineAmount)) {
                                _attachInputListeners(node);
                                shouldRecalculate = true;
                            }
                            
                            // Ou s'il contient des inputs de montant
                            const inputs = node.querySelectorAll('input.' + CSS_CLASSES.lineAmount);
                            if (inputs.length > 0) {
                                inputs.forEach(input => _attachInputListeners(input));
                                shouldRecalculate = true;
                            }
                        }
                    });
                }
            });
            
            // Recalculer si nécessaire
            if (shouldRecalculate) {
                setTimeout(recalculateAllAmounts, 0);
            }
        });
        
        // Observer le corps du document
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    /**
     * Méthode privée pour attacher des écouteurs d'événements à un input
     * @private
     * @param {HTMLInputElement} input Élément input à observer
     */
    function _attachInputListeners(input) {
        // Éviter d'attacher plusieurs fois les mêmes écouteurs
        if (input.dataset.calculatorAttached === 'true') {
            return;
        }
        
        // Écouter les événements d'entrée
        input.addEventListener('input', () => setTimeout(recalculateAllAmounts, 0));
        input.addEventListener('change', () => setTimeout(recalculateAllAmounts, 0));
        input.addEventListener('blur', () => setTimeout(recalculateAllAmounts, 0));
        
        // Marquer l'input comme ayant déjà été attaché
        input.dataset.calculatorAttached = 'true';
    }
    
    /**
     * Méthode privée pour extraire un montant d'une chaîne de texte
     * @private
     * @param {string} text Texte contenant un montant
     * @returns {number} Le montant extrait
     */
    function _extractAmountFromText(text) {
        if (!text) return 0;
        
        // Supprimer tous les caractères non numériques sauf point et virgule
        const numericStr = text.replace(/[^\d.,]/g, '').replace(',', '.');
        return parseFloat(numericStr) || 0;
    }
    
    // Exposer l'API publique
    return {
        initialize,
        recalculateAllAmounts,
        recalculateCategoryAmount,
        recalculateSubcategoryAmount,
        formatAmount
    };
})();

// Auto-initialisation du module
document.addEventListener('DOMContentLoaded', function() {
    BudgetCalculator.initialize();
    console.log('✅ Module BudgetCalculator initialisé avec succès - Version modulaire');
    
    // Remplacer la fonction globale recalculateAllAmounts par la méthode du module
    // pour maintenir la compatibilité avec le code existant
    window.recalculateAllAmounts = function() {
        console.log('🔄 Appel à recalculateAllAmounts redirigé vers BudgetCalculator');
        return BudgetCalculator.recalculateAllAmounts();
    };
});