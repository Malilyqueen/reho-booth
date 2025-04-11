// Utilitaire pour calculer les totaux de budget
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser seulement si nous sommes sur une page avec un budget
    if (document.getElementById('totalBudget') || document.querySelector('.expense-category')) {
        console.log("Page de budget détectée, initialisation du calcul...");
        setupBudgetCalculations();
    }
});

// Fonction pour configurer les calculs de budget en préservant l'édition
function setupBudgetCalculations() {
    // Mise en place des écouteurs d'événements pour les champs de montant
    document.addEventListener('change', function(event) {
        if (isAmountField(event.target) || 
            event.target.classList.contains('expense-line-name') ||
            event.target.classList.contains('subcategory-name') ||
            event.target.classList.contains('category-name')) {
            
            // Déclencher un recalcul après modification d'une valeur
            setTimeout(recalculateAllAmounts, 300);
        }
    });
    
    // Observer les modifications directement sur les champs modifiables
    document.addEventListener('input', function(event) {
        if (isAmountField(event.target)) {
            // Mettre à jour les montants pendant la saisie
            setTimeout(recalculateAllAmounts, 500);
        }
    });
    
    // Écouter les événements de clic sur les boutons d'ajout/suppression
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('add-subcategory-btn') ||
            event.target.classList.contains('add-expense-line-btn') ||
            event.target.classList.contains('add-category-btn') ||
            event.target.classList.contains('delete-category-btn') ||
            event.target.classList.contains('delete-subcategory-btn') ||
            event.target.classList.contains('delete-line-btn')) {
            
            // Petit délai pour laisser le DOM se mettre à jour
            setTimeout(recalculateAllAmounts, 300);
        }
    });
    
    // Calculer les totaux au chargement de la page
    setTimeout(recalculateAllAmounts, 800);
}

// Vérifier si un élément est un champ de montant
function isAmountField(element) {
    return element && (
        element.classList.contains('expense-line-amount') ||
        element.classList.contains('subcategory-amount') ||
        element.classList.contains('category-amount') ||
        element.id === 'totalBudget'
    );
}

// Fonction principale pour recalculer tous les montants
function recalculateAllAmounts() {
    console.log("Recalcul des montants...");
    
    // Récupérer le symbole de devise
    const currencySymbol = getCurrencySymbol();
    
    // 1. Recalculer les montants de sous-catégories à partir des lignes
    document.querySelectorAll('.subcategory').forEach(subcategory => {
        const lines = subcategory.querySelectorAll('.expense-line');
        let subcategoryTotal = 0;
        
        lines.forEach(line => {
            const amountInput = line.querySelector('.expense-line-amount');
            if (amountInput) {
                const amount = parseMonetaryValue(amountInput.value);
                subcategoryTotal += amount;
            }
        });
        
        // Mettre à jour le montant de la sous-catégorie (sans écraser la valeur si en cours d'édition)
        const subcategoryAmount = subcategory.querySelector('.subcategory-amount');
        if (subcategoryAmount && !subcategoryAmount.matches(':focus')) {
            subcategoryAmount.textContent = formatMoney(subcategoryTotal, currencySymbol);
        }
    });
    
    // 2. Recalculer les montants de catégories à partir des sous-catégories
    document.querySelectorAll('.expense-category').forEach(category => {
        const subcategories = category.querySelectorAll('.subcategory');
        let categoryTotal = 0;
        
        subcategories.forEach(subcategory => {
            const amountElement = subcategory.querySelector('.subcategory-amount');
            if (amountElement) {
                const amount = parseMonetaryValue(amountElement.textContent);
                categoryTotal += amount;
            }
        });
        
        // Mettre à jour le montant de la catégorie (sans écraser la valeur si en cours d'édition)
        const categoryAmount = category.querySelector('.category-amount');
        if (categoryAmount && !categoryAmount.matches(':focus')) {
            categoryAmount.textContent = formatMoney(categoryTotal, currencySymbol);
        }
    });
    
    // 3. Recalculer le budget total à partir des catégories
    calculateAndDisplayTotalBudget();
}

// Fonction pour calculer et afficher le budget total
function calculateAndDisplayTotalBudget() {
    try {
        // Obtenir le symbole de devise
        const currencySymbol = getCurrencySymbol();
        
        // Calculer le total à partir des catégories
        let total = 0;
        const categoryAmounts = document.querySelectorAll('.category-amount');
        categoryAmounts.forEach(element => {
            const amount = parseMonetaryValue(element.textContent);
            total += amount;
        });
        
        // Mettre à jour l'affichage du total si présent
        const totalBudgetDisplay = document.querySelector('.total-budget-amount');
        if (totalBudgetDisplay) {
            totalBudgetDisplay.textContent = formatMoney(total, currencySymbol);
        }
        
        // Mettre à jour le champ de saisie s'il n'est pas en cours d'édition
        const totalBudgetInput = document.getElementById('totalBudget');
        if (totalBudgetInput && !totalBudgetInput.matches(':focus')) {
            // Préserver la valeur que l'utilisateur est en train de saisir
            totalBudgetInput.value = formatMoney(total, currencySymbol);
        }
        
        console.log("Budget total calculé:", total);
    } catch (error) {
        console.error("Erreur lors du calcul du budget total:", error);
    }
}

// Fonction pour analyser une valeur monétaire
function parseMonetaryValue(value) {
    if (!value) return 0;
    
    try {
        // Extraire uniquement les chiffres et le séparateur décimal
        const numericValue = value.toString().replace(/[^0-9,\.]/g, '');
        
        // Gérer les formats européens (virgule comme séparateur décimal)
        const normalizedValue = numericValue.replace(',', '.');
        
        return parseFloat(normalizedValue) || 0;
    } catch (error) {
        console.error("Erreur lors de l'analyse de la valeur monétaire:", value, error);
        return 0;
    }
}

// Fonction pour formater un montant monétaire
function formatMoney(amount, currencySymbol = '€') {
    return `${currencySymbol} ${amount.toFixed(2).replace('.', ',')}`;
}

// Fonction pour obtenir le symbole de devise actuel
function getCurrencySymbol() {
    try {
        // Vérifier d'abord si la devise est stockée dans le formulaire
        const totalBudgetInput = document.getElementById('totalBudget');
        if (totalBudgetInput && totalBudgetInput.value) {
            const match = totalBudgetInput.value.match(/^([^\d]+)/);
            if (match && match[1]) {
                return match[1].trim();
            }
        }
        
        // Vérifier si des champs de montant existent déjà avec un symbole
        const amountElements = document.querySelectorAll('.category-amount, .subcategory-amount');
        for (let i = 0; i < amountElements.length; i++) {
            const text = amountElements[i].textContent;
            if (text) {
                const match = text.match(/^([^\d]+)/);
                if (match && match[1]) {
                    return match[1].trim();
                }
            }
        }
        
        // Sinon, récupérer depuis les préférences utilisateur
        const preferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
        if (preferences.currency) {
            if (typeof AVAILABLE_CURRENCIES !== 'undefined') {
                const currency = AVAILABLE_CURRENCIES.find(c => c.code === preferences.currency);
                if (currency) {
                    return currency.symbol;
                }
            }
            
            // Correspondances pour les devises courantes
            const symbols = {
                'EUR': '€',
                'USD': '$',
                'GBP': '£',
                'JPY': '¥',
                'MAD': 'DH',
                'AED': 'AED'
            };
            
            return symbols[preferences.currency] || preferences.currency;
        }
        
        // Valeur par défaut
        return '€';
    } catch (error) {
        console.error('Erreur lors de la récupération du symbole de devise:', error);
        return '€';
    }
}