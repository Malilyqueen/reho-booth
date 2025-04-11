/**
 * Configuration des devises pour MaPocket
 * Ce fichier contient la liste des devises disponibles et les taux de conversion
 */

// Liste des devises disponibles
const AVAILABLE_CURRENCIES = [
    {
        code: "EUR",
        name: "Euro",
        symbol: "AED",
        countries: "Union Européenne",
        default: true
    },
    {
        code: "USD",
        name: "Dollar américain",
        symbol: "$",
        countries: "États-Unis"
    },
    {
        code: "DZD",
        name: "Dinar algérien",
        symbol: "DA",
        countries: "Algérie"
    },
    {
        code: "MAD",
        name: "Dirham marocain",
        symbol: "DH",
        countries: "Maroc"
    },
    {
        code: "XOF",
        name: "Franc CFA BCEAO",
        symbol: "CFA",
        countries: "Bénin, Burkina Faso, Côte d'Ivoire, Guinée-Bissau, Mali, Niger, Sénégal, Togo"
    },
    {
        code: "XAF",
        name: "Franc CFA BEAC",
        symbol: "FCFA",
        countries: "Cameroun, République centrafricaine, République du Congo, Gabon, Guinée équatoriale, Tchad"
    },
    {
        code: "AED",
        name: "Dirham émirati",
        symbol: "د.إ",
        countries: "Émirats arabes unis"
    },
    {
        code: "MYR",
        name: "Ringgit malaisien",
        symbol: "RM",
        countries: "Malaisie"
    },
    {
        code: "KES",
        name: "Shilling kényan",
        symbol: "KSh",
        countries: "Kenya"
    },
    {
        code: "GBP",
        name: "Livre sterling",
        symbol: "£",
        countries: "Royaume-Uni"
    },
    {
        code: "CNY",
        name: "Yuan chinois",
        symbol: "¥",
        countries: "Chine"
    },
    {
        code: "MGA",
        name: "Ariary malgache",
        symbol: "Ar",
        countries: "Madagascar"
    },
    {
        code: "JPY",
        name: "Yen japonais",
        symbol: "¥",
        countries: "Japon"
    },
    {
        code: "KRW",
        name: "Won sud-coréen",
        symbol: "₩",
        countries: "Corée du Sud"
    },
    {
        code: "AUD",
        name: "Dollar australien",
        symbol: "A$",
        countries: "Australie"
    },
    {
        code: "MUR",
        name: "Roupie mauricienne",
        symbol: "Rs",
        countries: "Maurice"
    },
    {
        code: "THB",
        name: "Baht thaïlandais",
        symbol: "฿",
        countries: "Thaïlande"
    },
    {
        code: "SGD",
        name: "Dollar de Singapour",
        symbol: "S$",
        countries: "Singapour"
    },
    {
        code: "CAD",
        name: "Dollar canadien",
        symbol: "C$",
        countries: "Canada"
    },
    {
        code: "CHF",
        name: "Franc suisse",
        symbol: "Fr.",
        countries: "Suisse"
    },
    {
        code: "INR",
        name: "Roupie indienne",
        symbol: "₹",
        countries: "Inde"
    },
    {
        code: "RUB",
        name: "Rouble russe",
        symbol: "₽",
        countries: "Russie"
    },
    {
        code: "BRL",
        name: "Real brésilien",
        symbol: "R$",
        countries: "Brésil"
    },
    {
        code: "PHP",
        name: "Peso philippin",
        symbol: "₱",
        countries: "Philippines"
    },
    {
        code: "ILS",
        name: "Shekel israélien",
        symbol: "₪",
        countries: "Israël"
    },
    {
        code: "TND",
        name: "Dinar tunisien",
        symbol: "DT",
        countries: "Tunisie"
    }
];

/**
 * Taux de conversion entre les devises (simulés)
 * Base: 1 EUR
 * 
 * Dans une application réelle, ces taux seraient récupérés via une API de taux de change
 * comme Open Exchange Rates, Fixer.io ou European Central Bank
 */
const EXCHANGE_RATES = {
    "EUR": 1.0,
    "USD": 1.09,
    "DZD": 144.48,
    "MAD": 11.02,
    "XOF": 655.96,
    "XAF": 655.96,
    "AED": 4.00,
    "MYR": 5.03,
    "KES": 143.14,
    "GBP": 0.85,
    "CNY": 7.94,
    "MGA": 4800.50,
    "JPY": 167.37,
    "KRW": 1479.76,
    "AUD": 1.66,
    "MUR": 49.35,
    "THB": 38.75,
    "SGD": 1.46,
    "CAD": 1.48,
    "CHF": 0.97,
    "INR": 91.15,
    "RUB": 100.21,
    "BRL": 5.48,
    "PHP": 61.93,
    "ILS": 4.01,
    "TND": 3.39
};

/**
 * Obtient le taux de conversion entre deux devises
 * @param {string} fromCurrency - Code ISO de la devise source
 * @param {string} toCurrency - Code ISO de la devise cible
 * @returns {number} Taux de conversion
 */
function getExchangeRate(fromCurrency, toCurrency) {
    // Si les devises sont identiques, le taux est 1
    if (fromCurrency === toCurrency) {
        return 1;
    }
    
    // Calculer le taux de conversion via l'EUR comme devise pivot
    const fromRateToEUR = 1 / EXCHANGE_RATES[fromCurrency];
    const eurToTargetRate = EXCHANGE_RATES[toCurrency];
    
    return fromRateToEUR * eurToTargetRate;
}

/**
 * Convertit un montant d'une devise à une autre
 * @param {number} amount - Montant à convertir
 * @param {string} fromCurrency - Code ISO de la devise source
 * @param {string} toCurrency - Code ISO de la devise cible
 * @returns {number} Montant converti
 */
function convertCurrency(amount, fromCurrency, toCurrency) {
    return amount * getExchangeRate(fromCurrency, toCurrency);
}

/**
 * Formate un montant selon la devise spécifiée
 * @param {number} amount - Montant à formater
 * @param {string} currencyCode - Code ISO de la devise
 * @param {boolean} showCode - Afficher le code de la devise
 * @returns {string} Montant formaté
 */
function formatCurrency(amount, currencyCode, showCode = false) {
    const currency = AVAILABLE_CURRENCIES.find(c => c.code === currencyCode);
    
    if (!currency) {
        console.error(`Devise non trouvée: ${currencyCode}`);
        return amount.toString();
    }
    
    // Formater le montant selon la devise
    const options = {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    };
    
    // Pour certaines devises comme le JPY, pas de décimales
    if (currencyCode === 'JPY' || currencyCode === 'KRW') {
        options.minimumFractionDigits = 0;
        options.maximumFractionDigits = 0;
    }
    
    try {
        const formatted = new Intl.NumberFormat('fr-FR', options).format(amount);
        return showCode ? `${formatted} (${currencyCode})` : formatted;
    } catch (error) {
        console.error(`Erreur lors du formatage de la devise: ${error}`);
        return `${amount} ${currency.symbol}`;
    }
}

/**
 * Génère une liste déroulante de devises
 * @param {string} selectId - ID de l'élément select
 * @param {string} selectedCurrency - Code ISO de la devise sélectionnée
 * @returns {string} HTML de la liste déroulante
 */
function generateCurrencyDropdown(selectId, selectedCurrency = 'EUR') {
    let html = `<select id="${selectId}" class="currency-select">`;
    
    AVAILABLE_CURRENCIES.forEach(currency => {
        const selected = currency.code === selectedCurrency ? 'selected' : '';
        html += `<option value="${currency.code}" ${selected}>${currency.name} (${currency.symbol})</option>`;
    });
    
    html += '</select>';
    return html;
}

/**
 * Formate un montant avec équivalence dans une autre devise
 * @param {number} amount - Montant à formater
 * @param {string} primaryCurrency - Code ISO de la devise principale
 * @param {string} secondaryCurrency - Code ISO de la devise secondaire pour l'équivalence
 * @returns {string} Montant formaté avec équivalence
 */
function formatCurrencyWithEquivalent(amount, primaryCurrency, secondaryCurrency) {
    if (primaryCurrency === secondaryCurrency) {
        return formatCurrency(amount, primaryCurrency, true);
    }
    
    const mainFormatted = formatCurrency(amount, primaryCurrency, false);
    const convertedAmount = convertCurrency(amount, primaryCurrency, secondaryCurrency);
    const equivalentFormatted = formatCurrency(convertedAmount, secondaryCurrency, false);
    
    return `${mainFormatted} ≈ ${equivalentFormatted}`;
}

/**
 * Obtient la devise par défaut
 * @returns {object} Objet de devise par défaut
 */
function getDefaultCurrency() {
    const defaultCurrency = AVAILABLE_CURRENCIES.find(c => c.default === true);
    return defaultCurrency || AVAILABLE_CURRENCIES[0];
}

/**
 * Obtient le symbole d'une devise
 * @param {string} currencyCode - Code ISO de la devise
 * @returns {string} Symbole de la devise
 */
function getCurrencySymbol(currencyCode) {
    const currency = AVAILABLE_CURRENCIES.find(c => c.code === currencyCode);
    return currency ? currency.symbol : '';
}