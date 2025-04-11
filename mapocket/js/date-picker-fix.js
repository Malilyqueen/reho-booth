// Solution robuste pour les problèmes de datepicker dans tous les navigateurs
document.addEventListener('DOMContentLoaded', function() {
    // S'assurer que flatpickr est chargé
    if (typeof flatpickr === 'undefined') {
        console.error("Flatpickr n'est pas chargé, chargement dynamique...");
        
        // Créer un lien pour charger le CSS de flatpickr
        const flatpickrCss = document.createElement('link');
        flatpickrCss.rel = 'stylesheet';
        flatpickrCss.href = 'https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css';
        document.head.appendChild(flatpickrCss);
        
        // Créer un script pour charger flatpickr
        const flatpickrScript = document.createElement('script');
        flatpickrScript.src = 'https://cdn.jsdelivr.net/npm/flatpickr';
        flatpickrScript.onload = initializeDatePickers;
        document.head.appendChild(flatpickrScript);
        
        // Créer un script pour charger la localisation française
        const flatpickrLocaleScript = document.createElement('script');
        flatpickrLocaleScript.src = 'https://npmcdn.com/flatpickr/dist/l10n/fr.js';
        document.head.appendChild(flatpickrLocaleScript);
    } else {
        // Initialiser les datepickers
        setTimeout(initializeDatePickers, 500);
    }
});

// Fonction pour initialiser les datepickers
function initializeDatePickers() {
    console.log("Initialisation des pickers de date...");
    
    // Configuration simple pour les datepickers
    const config = {
        dateFormat: "d/m/Y",
        altInput: true,
        altFormat: "d/m/Y",
        allowInput: true,
        locale: "fr",
        disableMobile: true,
        monthSelectorType: "static"
    };
    
    // Sélectionner tous les champs de date et leur appliquer flatpickr
    const dateInputs = document.querySelectorAll('input[type="text"][id$="Date"]');
    dateInputs.forEach(input => {
        if (input && !input._flatpickr) {
            try {
                const instance = flatpickr(input, config);
                console.log(`Date picker initialisé pour ${input.id}`);
                
                // S'assurer que le champ a une valeur par défaut si vide
                if (!input.value || input.value.trim() === '') {
                    const today = new Date();
                    instance.setDate(today);
                }
            } catch (error) {
                console.error(`Erreur lors de l'initialisation du date picker pour ${input.id}:`, error);
            }
        }
    });
}

// Fonction pour réinitialiser un datepicker spécifique
function resetDatePicker(inputId, date) {
    const input = document.getElementById(inputId);
    if (input && input._flatpickr) {
        input._flatpickr.setDate(date);
    } else if (input) {
        input.value = date;
    }
}