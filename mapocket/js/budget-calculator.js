/**
 * Gestionnaire avancé de budget avec logique en cascade
 * 
 * Permet de gérer la logique suivante:
 * - Les lignes sont toujours entrées manuellement
 * - Les sous-catégories sont manuelles si pas de lignes, auto-calculées sinon
 * - Les catégories sont manuelles si pas de sous-catégories, auto-calculées sinon
 * - Le total du projet est toujours calculé à partir des catégories
 * 
 * Cette version offre une flexibilité complète, où tout niveau est:
 * - Modifiable
 * - Supprimable
 * - Calculé automatiquement lorsque pertinent
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Initialisation du calculateur de budget...');
    
    // Configuration initiale
    setupBudgetCalculator();
    
    // Observer les changements dans le DOM pour les nouveaux éléments
    setupBudgetObserver();
});

/**
 * Configure le calculateur de budget
 */
function setupBudgetCalculator() {
    // Attacher les écouteurs d'événements pour les montants
    attachBudgetAmountListeners();
    
    // Configurer les boutons d'ajout
    setupAddButtons();
    
    // Effectuer un calcul initial des totaux
    updateTotals();
}

/**
 * Attache les écouteurs d'événements aux montants
 */
function attachBudgetAmountListeners() {
    // Montants des lignes
    document.querySelectorAll('.line-amount').forEach(el => {
        el.addEventListener('blur', handleAmountChange);
        el.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                e.target.blur();
            }
        });
    });
    
    // Montants des sous-catégories
    document.querySelectorAll('.subcategory-amount').forEach(el => {
        el.addEventListener('blur', handleAmountChange);
        el.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                e.target.blur();
            }
        });
    });
    
    // Montants des catégories
    document.querySelectorAll('.category-amount').forEach(el => {
        el.addEventListener('blur', handleAmountChange);
        el.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                e.target.blur();
            }
        });
    });
}

/**
 * Gère le changement d'un montant
 */
function handleAmountChange(e) {
    const element = e.target;
    
    // Formatage du montant
    let value = element.textContent.trim();
    if (value) {
        // Extraire uniquement les chiffres et le point/virgule
        let numericValue = value.replace(/[^0-9.,]/g, '');
        // Remplacer la virgule par un point pour le calcul
        numericValue = numericValue.replace(',', '.');
        // Convertir en nombre
        const numValue = parseFloat(numericValue);
        
        if (!isNaN(numValue)) {
            // Formatter avec 2 décimales et symbole de devise
            const currencySymbol = getCurrencySymbol() || '€';
            element.textContent = `${currencySymbol} ${numValue.toFixed(2).replace('.', ',')}`;
        }
    }
    
    // Mise à jour des totaux
    updateTotals();
}

/**
 * Obtient le symbole de devise actuel
 */
function getCurrencySymbol() {
    // Récupérer depuis les préférences utilisateur si disponible
    if (typeof getUserPreference === 'function') {
        const currencySymbol = getUserPreference('currencySymbol');
        if (currencySymbol) return currencySymbol;
    }
    
    // Chercher dans le DOM si un élément contient cette information
    const symbolElement = document.querySelector('[data-currency-symbol]');
    if (symbolElement) {
        return symbolElement.getAttribute('data-currency-symbol');
    }
    
    // Valeur par défaut
    return '€';
}

/**
 * Met à jour tous les totaux selon la logique en cascade
 */
function updateTotals() {
    console.log('Mise à jour des totaux selon la logique en cascade...');
    
    // 1. Mise à jour des sous-catégories à partir des lignes
    updateSubcategoryTotals();
    
    // 2. Mise à jour des catégories à partir des sous-catégories
    updateCategoryTotals();
    
    // 3. Mise à jour du total du projet
    updateProjectTotal();
}

/**
 * Met à jour les totaux des sous-catégories à partir des lignes
 */
function updateSubcategoryTotals() {
    document.querySelectorAll('.subcategory').forEach(subcategory => {
        const lines = subcategory.querySelectorAll('.expense-line');
        const subcategoryAmountEl = subcategory.querySelector('.subcategory-amount');
        
        if (lines.length > 0) {
            // Il y a des lignes, calcul automatique
            let total = 0;
            let hasValidLines = false;
            
            lines.forEach(line => {
                const lineAmountEl = line.querySelector('.line-amount');
                if (lineAmountEl) {
                    const amount = extractAmount(lineAmountEl.textContent);
                    if (!isNaN(amount)) {
                        total += amount;
                        hasValidLines = true;
                    }
                }
            });
            
            if (hasValidLines && subcategoryAmountEl) {
                // Marquer comme calculé et mettre à jour
                setElementAsCalculated(subcategoryAmountEl);
                const currencySymbol = getCurrencySymbol();
                subcategoryAmountEl.textContent = `${currencySymbol} ${total.toFixed(2).replace('.', ',')}`;
            } else if (subcategoryAmountEl) {
                // Pas de lignes valides, rendre éditable
                setElementAsEditable(subcategoryAmountEl);
            }
        } else if (subcategoryAmountEl) {
            // Pas de lignes, le montant est éditable directement
            setElementAsEditable(subcategoryAmountEl);
        }
    });
}

/**
 * Met à jour les totaux des catégories à partir des sous-catégories
 */
function updateCategoryTotals() {
    document.querySelectorAll('.expense-category').forEach(category => {
        const subcategories = category.querySelectorAll('.subcategory');
        const categoryAmountEl = category.querySelector('.category-amount');
        
        if (subcategories.length > 0) {
            // Il y a des sous-catégories, vérifier si elles ont toutes des montants valides
            let total = 0;
            let hasValidSubcategories = false;
            
            subcategories.forEach(subcategory => {
                const subcategoryAmountEl = subcategory.querySelector('.subcategory-amount');
                if (subcategoryAmountEl && subcategoryAmountEl.textContent.trim()) {
                    const amount = extractAmount(subcategoryAmountEl.textContent);
                    if (!isNaN(amount)) {
                        total += amount;
                        hasValidSubcategories = true;
                    }
                }
            });
            
            if (hasValidSubcategories && categoryAmountEl) {
                // Marquer comme calculé et mettre à jour
                setElementAsCalculated(categoryAmountEl);
                const currencySymbol = getCurrencySymbol();
                categoryAmountEl.textContent = `${currencySymbol} ${total.toFixed(2).replace('.', ',')}`;
            } else if (categoryAmountEl) {
                // Pas de sous-catégories valides, rendre éditable
                setElementAsEditable(categoryAmountEl);
            }
        } else if (categoryAmountEl) {
            // Pas de sous-catégories, le montant est éditable directement
            setElementAsEditable(categoryAmountEl);
        }
    });
}

/**
 * Met à jour le total du projet à partir des catégories
 */
function updateProjectTotal() {
    const totalBudgetEl = document.getElementById('totalBudget');
    if (!totalBudgetEl) return;
    
    let total = 0;
    let hasValidCategories = false;
    
    document.querySelectorAll('.category-amount').forEach(categoryAmountEl => {
        const amount = extractAmount(categoryAmountEl.textContent);
        if (!isNaN(amount)) {
            total += amount;
            hasValidCategories = true;
        }
    });
    
    if (hasValidCategories) {
        const currencySymbol = getCurrencySymbol();
        totalBudgetEl.textContent = `${currencySymbol} ${total.toFixed(2).replace('.', ',')}`;
        
        // Mettre à jour également l'input caché s'il existe
        const totalBudgetInput = document.querySelector('input[name="totalBudget"]');
        if (totalBudgetInput) {
            totalBudgetInput.value = `${currencySymbol} ${total.toFixed(2).replace('.', ',')}`;
        }
    }
}

/**
 * Extrait le montant numérique d'une chaîne de caractères
 */
function extractAmount(text) {
    if (!text) return NaN;
    
    // Extraire uniquement les chiffres et le point/virgule
    let numericValue = text.replace(/[^0-9.,]/g, '');
    // Remplacer la virgule par un point pour le calcul
    numericValue = numericValue.replace(',', '.');
    // Convertir en nombre
    return parseFloat(numericValue);
}

/**
 * Configure un élément pour être calculé automatiquement
 */
function setElementAsCalculated(element) {
    element.setAttribute('data-calculated', 'true');
    element.contentEditable = 'false';
    element.style.backgroundColor = '#f0f8ff';
    element.style.fontStyle = 'italic';
    element.style.cursor = 'default';
    element.style.border = 'none';
    
    // Ajouter l'indicateur automatique s'il n'existe pas déjà
    if (!element.querySelector('.auto-indicator') && !element.textContent.includes('🔄')) {
        const currencyPart = element.textContent;
        element.textContent = currencyPart + ' 🔄';
    }
    
    // Mettre à jour l'info-bulle
    element.setAttribute('title', 'Montant calculé automatiquement');
}

/**
 * Configure un élément pour être éditable manuellement
 */
function setElementAsEditable(element) {
    element.removeAttribute('data-calculated');
    element.contentEditable = 'true';
    element.style.backgroundColor = '';
    element.style.fontStyle = 'normal';
    element.style.cursor = 'text';
    element.style.border = '1px dashed #ccc';
    
    // Supprimer l'indicateur automatique s'il existe
    if (element.textContent.includes('🔄')) {
        element.textContent = element.textContent.replace(' 🔄', '');
    }
    
    // Mettre à jour l'info-bulle
    element.setAttribute('title', 'Montant modifiable directement');
}

/**
 * Configure les boutons d'ajout
 */
function setupAddButtons() {
    // Ajout de catégorie
    const addCategoryBtn = document.querySelector('.add-category-btn');
    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', function() {
            // Attendre que le DOM soit mis à jour
            setTimeout(function() {
                attachBudgetAmountListeners();
                updateTotals();
            }, 100);
        });
    }
    
    // Ajout de sous-catégorie
    document.querySelectorAll('.add-subcategory-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Attendre que le DOM soit mis à jour
            setTimeout(function() {
                attachBudgetAmountListeners();
                updateTotals();
            }, 100);
        });
    });
    
    // Ajout de ligne
    document.querySelectorAll('.add-line-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Attendre que le DOM soit mis à jour
            setTimeout(function() {
                attachBudgetAmountListeners();
                updateTotals();
            }, 100);
        });
    });
}

/**
 * Configure un observateur pour les changements dans le DOM
 */
function setupBudgetObserver() {
    const observer = new MutationObserver(function(mutations) {
        let shouldAttachListeners = false;
        let shouldUpdateTotals = false;
        
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // Vérifier si des éléments de budget ont été ajoutés
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Élément
                        if (node.classList && 
                            (node.classList.contains('expense-category') || 
                             node.classList.contains('subcategory') || 
                             node.classList.contains('expense-line'))) {
                            shouldAttachListeners = true;
                            shouldUpdateTotals = true;
                        } else if (node.querySelector) {
                            const hasRelevantElements = node.querySelector('.expense-category, .subcategory, .expense-line, .category-amount, .subcategory-amount, .line-amount');
                            if (hasRelevantElements) {
                                shouldAttachListeners = true;
                                shouldUpdateTotals = true;
                            }
                        }
                    }
                });
            } else if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
                // Si des éléments ont été supprimés, mettre à jour les totaux
                shouldUpdateTotals = true;
            }
        });
        
        // Appliquer les changements si nécessaire
        if (shouldAttachListeners) {
            attachBudgetAmountListeners();
        }
        
        if (shouldUpdateTotals) {
            // Petit délai pour s'assurer que le DOM est stable
            setTimeout(updateTotals, 50);
        }
    });
    
    // Observer le corps du document pour les changements
    observer.observe(document.body, { childList: true, subtree: true });
}

// Exporter les fonctions pour une utilisation externe
window.updateTotals = updateTotals;
window.setElementAsEditable = setElementAsEditable;
window.setElementAsCalculated = setElementAsCalculated;