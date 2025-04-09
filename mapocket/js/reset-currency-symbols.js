/**
 * Script temporaire pour réinitialiser les symboles de devise
 * Ce script sera exécuté une seule fois pour forcer la mise à jour des symboles
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Réinitialisation des symboles de devise...');
    
    // Vérifier si la réinitialisation a déjà été effectuée
    if (!localStorage.getItem('currencySymbolsReset')) {
        // Sauvegarder la devise actuelle
        let currentCurrency = 'EUR';
        try {
            const userPrefs = JSON.parse(localStorage.getItem('userPreferences') || '{}');
            currentCurrency = userPrefs.currency || 'EUR';
        } catch (e) {
            console.error('Erreur lors de la récupération des préférences:', e);
        }
        
        // Effacer les préférences concernant les devises
        localStorage.removeItem('availableCurrencies');
        
        // Ajouter un flag pour ne pas réexécuter ce script
        localStorage.setItem('currencySymbolsReset', 'true');
        console.log('Symboles de devise réinitialisés avec succès');
        
        // Forcer le rafraîchissement de la page pour appliquer les modifications
        setTimeout(() => {
            location.reload();
        }, 1000);
    } else {
        console.log('Les symboles de devise ont déjà été réinitialisés');
    }
});