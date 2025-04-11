/**
 * Protection spécifique pour le problème du calendrier qui réinitialise le budget total
 * Ce script intervient au niveau du DOM pour intercepter les changements sur les champs de date
 * et s'assurer que le budget total n'est jamais remis à zéro à cause de ces interactions.
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Chargement de la protection contre la réinitialisation du budget...');
    
    // Variable pour stocker le budget d'origine
    let storedBudget = '';
    
    // Fonction pour sauvegarder l'état actuel du budget
    function saveBudgetState() {
        const budgetField = document.getElementById('totalBudget');
        if (budgetField && budgetField.value && 
            budgetField.value !== '0' && 
            budgetField.value !== '€ 0,00' && 
            budgetField.value !== '0,00') {
            
            storedBudget = budgetField.value;
            console.log('Budget sauvegardé avant interaction avec le calendrier:', storedBudget);
        }
    }
    
    // Fonction pour restaurer le budget
    function restoreBudget() {
        const budgetField = document.getElementById('totalBudget');
        if (budgetField && storedBudget) {
            // Vérifier si le budget a été réinitialisé
            if (!budgetField.value || budgetField.value === '0' || 
                budgetField.value === '€ 0,00' || budgetField.value === '0,00') {
                
                budgetField.value = storedBudget;
                console.log('Budget restauré après interaction avec le calendrier:', storedBudget);
            }
        }
    }
    
    // Protection par MutationObserver - très efficace pour détecter l'interaction avec le widget de date
    const budgetObserver = new MutationObserver(function(mutations) {
        // À chaque mutation, vérifier si le budget a été réinitialisé
        const budgetField = document.getElementById('totalBudget');
        if (budgetField && storedBudget) {
            if (!budgetField.value || budgetField.value === '0' || 
                budgetField.value === '€ 0,00' || budgetField.value === '0,00') {
                
                // Restaurer immédiatement
                budgetField.value = storedBudget;
                console.log('Budget restauré (détection MutationObserver):', storedBudget);
            }
        }
    });
    
    // Observer les changements sur le corps du document
    budgetObserver.observe(document.body, { 
        attributes: true, 
        childList: true, 
        subtree: true 
    });
    
    // Attendre que la page soit complètement chargée
    window.addEventListener('load', function() {
        // Protéger spécifiquement les interactions avec les champs de date
        const dateFields = document.querySelectorAll('#projectDate, #projectEndDate');
        
        dateFields.forEach(function(dateField) {
            // Capturer le focus pour sauvegarder l'état avant modification
            dateField.addEventListener('focus', function() {
                saveBudgetState();
            });
            
            // Capturer la perte de focus pour restaurer le budget si nécessaire
            dateField.addEventListener('blur', function() {
                setTimeout(restoreBudget, 100);  // Léger délai pour s'assurer que les autres événements sont traités
            });
            
            // Capturer le changement direct
            dateField.addEventListener('change', function() {
                // D'abord attendre pour voir s'il y a eu modification du budget
                setTimeout(function() {
                    restoreBudget();
                    // Double vérification après un délai plus long
                    setTimeout(restoreBudget, 300);
                }, 100);
            });
            
            // Protection additionnelle pour les widgets de calendrier qui pourraient être injectés
            dateField.addEventListener('click', function() {
                saveBudgetState();
                // Surveiller les clics qui pourraient suivre (sélection de date)
                const clickHandler = function() {
                    setTimeout(restoreBudget, 100);
                    setTimeout(restoreBudget, 300);
                    // Nettoyer après un certain temps
                    setTimeout(function() {
                        document.removeEventListener('click', clickHandler);
                    }, 1000);
                };
                document.addEventListener('click', clickHandler);
            });
        });
        
        // Capturer la première valeur de budget dès que possible
        saveBudgetState();
        console.log('Protection contre la réinitialisation du budget activée');
    });
});