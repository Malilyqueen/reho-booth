// Solution pour le calcul et l'affichage corrects du budget total
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser l'observation des changements de montant
    initializeBudgetTracking();
});

// Fonction pour initialiser le suivi du budget
function initializeBudgetTracking() {
    // Observer les changements dans le budget total
    const totalBudgetInput = document.getElementById('totalBudget');
    if (totalBudgetInput) {
        totalBudgetInput.addEventListener('change', calculateAndDisplayTotalBudget);
        totalBudgetInput.addEventListener('input', calculateAndDisplayTotalBudget);
        totalBudgetInput.addEventListener('blur', calculateAndDisplayTotalBudget);
    }
    
    // Observer les clics sur le document pour capturer les modifications de catégories
    document.addEventListener('click', function(event) {
        // Si nous cliquons sur un élément de montant ou un bouton d'ajout/suppression
        if (event.target.classList.contains('expense-line-amount') ||
            event.target.classList.contains('subcategory-amount') ||
            event.target.classList.contains('category-amount') ||
            event.target.classList.contains('add-subcategory-btn') ||
            event.target.classList.contains('add-expense-line-btn') ||
            event.target.classList.contains('delete-category-btn') ||
            event.target.classList.contains('delete-subcategory-btn') ||
            event.target.classList.contains('delete-line-btn')) {
            
            // Recalculer après un court délai
            setTimeout(calculateAndDisplayTotalBudget, 300);
        }
    });
    
    // Calculer le total initial
    setTimeout(calculateAndDisplayTotalBudget, 500);
}

// Fonction pour calculer et afficher le budget total
function calculateAndDisplayTotalBudget() {
    console.log("Calcul et affichage du budget total");
    
    try {
        // Trouver l'élément qui affiche le total du budget
        const totalBudgetDisplay = document.querySelector('.total-budget-amount');
        if (!totalBudgetDisplay) {
            console.warn("Élément d'affichage du total du budget non trouvé");
            return;
        }
        
        // Obtenir le symbole de devise actuel
        let currencySymbol = getCurrencySymbol();
        
        // Calculer le total à partir des catégories
        let total = 0;
        const categoryAmounts = document.querySelectorAll('.category-amount');
        categoryAmounts.forEach(element => {
            const amountText = element.textContent;
            if (amountText) {
                // Extraire la partie numérique
                const match = amountText.match(/[\d.,]+/);
                if (match) {
                    // Remplacer les virgules par des points pour la conversion
                    const amountValue = parseFloat(match[0].replace(',', '.')) || 0;
                    total += amountValue;
                }
            }
        });
        
        // Mettre à jour l'affichage du total
        totalBudgetDisplay.textContent = `${currencySymbol} ${total.toFixed(2).replace('.', ',')}`;
        
        // Mettre à jour également le champ d'entrée du budget total si présent
        const totalBudgetInput = document.getElementById('totalBudget');
        if (totalBudgetInput) {
            totalBudgetInput.value = `${currencySymbol} ${total.toFixed(2).replace('.', ',')}`;
        }
        
        console.log("Budget total calculé:", total);
    } catch (error) {
        console.error("Erreur lors du calcul du budget total:", error);
    }
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
        
        // Sinon, essayer de récupérer depuis les préférences utilisateur
        const preferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
        if (preferences.currency) {
            if (typeof AVAILABLE_CURRENCIES !== 'undefined') {
                const currency = AVAILABLE_CURRENCIES.find(c => c.code === preferences.currency);
                if (currency) {
                    return currency.symbol;
                }
            }
            
            // Correspondances de base pour les devises courantes
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