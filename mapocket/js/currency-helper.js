/**
 * Fichier helper pour gérer les devises et les convertir de manière cohérente
 * Ceci permettra d'éviter les doublons de code et les problèmes de définition multiple
 */

// Fonction pour obtenir le symbole de la devise actuelle
function getCurrencySymbol() {
    let currencySymbol = 'AED';
    try {
        const preferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
        if (preferences.currency) {
            if (typeof AVAILABLE_CURRENCIES !== 'undefined') {
                const currency = AVAILABLE_CURRENCIES.find(c => c.code === preferences.currency);
                if (currency) {
                    currencySymbol = currency.symbol;
                }
            }
        }
    } catch (error) {
        console.error('Erreur lors de la récupération de la devise:', error);
    }
    return currencySymbol;
}

// Fonction pour obtenir le code de la devise actuelle
function getCurrencyCode() {
    let currencyCode = 'EUR';
    try {
        const preferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
        if (preferences.currency) {
            currencyCode = preferences.currency;
        }
    } catch (error) {
        console.error('Erreur lors de la récupération du code de devise:', error);
    }
    return currencyCode;
}

// Fonction pour formater un montant avec la devise actuelle
function formatAmount(amount) {
    const symbol = getCurrencySymbol();
    if (typeof amount === 'number') {
        return `${symbol} ${amount.toFixed(2).replace('.', ',')}`;
    } else if (typeof amount === 'string') {
        // Nettoyer la chaîne de caractères pour extraire uniquement le nombre
        const numericValue = parseFloat(amount.replace(/[^\d.,]/g, '').replace(',', '.'));
        if (!isNaN(numericValue)) {
            return `${symbol} ${numericValue.toFixed(2).replace('.', ',')}`;
        }
    }
    return `${symbol} 0,00`;
}

// Fonction pour convertir un montant formaté en nombre
function parseAmount(formattedAmount) {
    if (!formattedAmount) return 0;
    
    // Supprimer tous les caractères non numériques (à l'exception de la virgule et du point)
    const cleanedAmount = formattedAmount.replace(/[^\d.,]/g, '');
    
    // Convertir les virgules en points pour le parsing
    const numericValue = parseFloat(cleanedAmount.replace(',', '.'));
    
    return isNaN(numericValue) ? 0 : numericValue;
}