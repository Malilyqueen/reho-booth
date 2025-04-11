// Solution légère pour améliorer les sélecteurs de date sans interférer avec l'existant
document.addEventListener('DOMContentLoaded', function() {
    // Vérifier que le document est prêt et que flatpickr est disponible
    if (typeof flatpickr !== 'undefined') {
        console.log("Flatpickr disponible, initialisation des calendriers...");
        initializeDatePickers();
    } else {
        console.log("Flatpickr sera initialisé lors de son chargement");
        // Surveiller le chargement de flatpickr
        let checkCounter = 0;
        const checkInterval = setInterval(function() {
            if (typeof flatpickr !== 'undefined') {
                clearInterval(checkInterval);
                initializeDatePickers();
            } else if (checkCounter > 10) {
                clearInterval(checkInterval);
                console.warn("Flatpickr n'a pas pu être chargé, utilisation du sélecteur de date natif");
            }
            checkCounter++;
        }, 500);
    }
});

// Fonction pour initialiser les sélecteurs de date de manière non intrusive
function initializeDatePickers() {
    console.log("Initialisation des sélecteurs de date...");
    
    // Configuration minimale pour les sélecteurs de date
    const config = {
        dateFormat: "d/m/Y",
        allowInput: true,
        locale: "fr",
        time_24hr: true,
        disableMobile: false // Permettre le sélecteur natif sur mobile
    };
    
    // N'initialiser que les champs de date qui n'ont pas déjà un calendar natif fonctionnel
    // Ceci est une solution de secours uniquement pour les navigateurs problématiques
    if (navigator.userAgent.indexOf("Chrome") > -1) {
        console.log("Chrome détecté, vérification des calendriers natifs...");
        
        const dateInputs = document.querySelectorAll('input[type="date"], input[type="text"][id$="Date"]');
        dateInputs.forEach(input => {
            // Ne pas réinitialiser les dates déjà définies
            if (input && !input._flatpickr && input.type !== "date") {
                try {
                    // Transformation minimale pour ne pas perturber l'existant
                    flatpickr(input, config);
                    console.log(`Calendrier amélioré initialisé pour ${input.id || 'champ sans id'}`);
                } catch (error) {
                    console.warn(`Le calendrier natif sera utilisé pour ${input.id || 'champ sans id'}`);
                }
            }
        });
    } else {
        console.log("Navigateur non-Chrome, calendriers natifs conservés");
    }
}

// Fonction pour définir une date spécifique dans un sélecteur
function resetDatePicker(inputId, date) {
    if (!inputId || !date) return;
    
    const input = document.getElementById(inputId);
    if (!input) return;
    
    if (input._flatpickr) {
        try {
            input._flatpickr.setDate(date);
        } catch (error) {
            input.value = date;
        }
    } else {
        input.value = date;
    }
}