/**
 * Script pour corriger le problème d'affichage des symboles monétaires
 * Ce script sera chargé après main.js et remplacera les symboles des devises par le sac d'argent
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Correction des symboles monétaires en cours...');
    
    // Remplacer les symboles des devises pour les rendre plus visibles et cohérents
    function fixCurrencySymbols() {
        // Forcer l'utilisation du sac d'argent comme symbole pour toutes les devises
        if (typeof AVAILABLE_CURRENCIES !== 'undefined') {
            // Parcourir toutes les devises et forcer le symbole
            AVAILABLE_CURRENCIES.forEach(currency => {
                currency.symbol = '💰';
            });
            
            console.log('Symboles monétaires remplacés par des sacs d\'argent');
            
            // Forcer la mise à jour de l'affichage après le changement
            if (typeof updateCurrencyDisplays === 'function') {
                updateCurrencyDisplays();
                console.log('updateCurrencyDisplays exécuté');
            }
            
            if (typeof updateAllAmountsWithCurrency === 'function') {
                updateAllAmountsWithCurrency();
                console.log('updateAllAmountsWithCurrency exécuté');
            }
            
            if (typeof updateMobileStatsDisplay === 'function') {
                updateMobileStatsDisplay();
                console.log('updateMobileStatsDisplay exécuté');
            }
            
            if (typeof updateDashboardStats === 'function') {
                updateDashboardStats();
                console.log('updateDashboardStats exécuté');
            }
        }
        
        // Rechercher tous les éléments avec des symboles monétaires classiques et les remplacer
        const moneyRegex = /[€$¥£₹₽₨₪]/g;
        const textNodes = [];
        
        // Fonction récursive pour trouver tous les nœuds de texte
        function findTextNodes(node) {
            if (node.nodeType === 3) { // Node.TEXT_NODE
                if (moneyRegex.test(node.nodeValue)) {
                    textNodes.push(node);
                }
            } else if (node.nodeType === 1) { // Node.ELEMENT_NODE
                for (let i = 0; i < node.childNodes.length; i++) {
                    findTextNodes(node.childNodes[i]);
                }
            }
        }
        
        // Trouver tous les nœuds de texte dans le document
        findTextNodes(document.body);
        
        // Remplacer les symboles monétaires par le sac d'argent
        textNodes.forEach(node => {
            node.nodeValue = node.nodeValue.replace(moneyRegex, '💰');
        });
        
        console.log(`${textNodes.length} nœuds de texte mis à jour avec le symbole du sac d'argent`);
    }
    
    // Exécuter la correction après un court délai pour s'assurer que tous les scripts sont chargés
    setTimeout(fixCurrencySymbols, 500);
    
    // Exécuter à nouveau après un autre délai pour les éléments dynamiques
    setTimeout(fixCurrencySymbols, 2000);
});