/**
 * Module Connector
 * Ce module gère la communication entre les différents composants de MaPocket
 * Il permet aux modules de s'échanger des données et notifications de manière standardisée
 */

// Espace de noms principal pour le connecteur
const ModuleConnector = (function() {
    // Canaux de communication
    const channels = {
        BUDGET: 'budget',
        WISHLIST: 'wishlist',
        WALLET: 'wallet',
        PROJECT: 'project',
        NOTIFICATIONS: 'notifications'
    };
    
    // Stockage des abonnements (souscriptions) par canal
    const subscriptions = {
        [channels.BUDGET]: [],
        [channels.WISHLIST]: [],
        [channels.WALLET]: [],
        [channels.PROJECT]: [],
        [channels.NOTIFICATIONS]: []
    };
    
    // Journal des derniers messages par canal (pour les nouveaux abonnés)
    const messageHistory = {
        [channels.BUDGET]: [],
        [channels.WISHLIST]: [],
        [channels.WALLET]: [],
        [channels.PROJECT]: [],
        [channels.NOTIFICATIONS]: []
    };
    
    // Nombre maximum d'éléments dans l'historique
    const MAX_HISTORY_SIZE = 10;
    
    /**
     * S'abonner à un canal de communication
     * @param {string} channel - Le canal auquel s'abonner
     * @param {function} callback - La fonction à appeler quand un message est reçu
     * @param {boolean} receiveHistory - Si true, reçoit immédiatement les derniers messages
     * @returns {string} ID de l'abonnement pour se désabonner plus tard
     */
    function subscribe(channel, callback, receiveHistory = false) {
        if (!Object.values(channels).includes(channel)) {
            console.error(`Canal invalide: ${channel}`);
            return null;
        }
        
        if (typeof callback !== 'function') {
            console.error('Le callback doit être une fonction');
            return null;
        }
        
        const subscriptionId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        
        subscriptions[channel].push({
            id: subscriptionId,
            callback: callback
        });
        
        console.log(`Nouvel abonnement (${subscriptionId}) au canal: ${channel}`);
        
        // Envoyer l'historique des messages si demandé
        if (receiveHistory && messageHistory[channel].length > 0) {
            console.log(`Envoi de ${messageHistory[channel].length} messages d'historique au nouvel abonné`);
            
            setTimeout(() => {
                messageHistory[channel].forEach(msg => {
                    try {
                        callback({
                            ...msg,
                            fromHistory: true
                        });
                    } catch (err) {
                        console.error('Erreur lors de l\'envoi de l\'historique:', err);
                    }
                });
            }, 0);
        }
        
        return subscriptionId;
    }
    
    /**
     * Se désabonner d'un canal
     * @param {string} channel - Le canal duquel se désabonner
     * @param {string} subscriptionId - L'ID de l'abonnement à supprimer
     * @returns {boolean} Succès de l'opération
     */
    function unsubscribe(channel, subscriptionId) {
        if (!Object.values(channels).includes(channel)) {
            console.error(`Canal invalide: ${channel}`);
            return false;
        }
        
        const initialLength = subscriptions[channel].length;
        subscriptions[channel] = subscriptions[channel].filter(sub => sub.id !== subscriptionId);
        
        const success = subscriptions[channel].length < initialLength;
        if (success) {
            console.log(`Désabonnement réussi du canal: ${channel}`);
        } else {
            console.warn(`Abonnement non trouvé pour désabonnement: ${subscriptionId}`);
        }
        
        return success;
    }
    
    /**
     * Publier un message sur un canal
     * @param {string} channel - Le canal sur lequel publier
     * @param {string} action - L'action effectuée
     * @param {Object} data - Les données associées au message
     * @param {Object} metadata - Métadonnées supplémentaires du message
     * @returns {boolean} Succès de l'opération
     */
    function publish(channel, action, data = {}, metadata = {}) {
        if (!Object.values(channels).includes(channel)) {
            console.error(`Canal invalide: ${channel}`);
            return false;
        }
        
        const message = {
            channel,
            action,
            data,
            metadata: {
                timestamp: Date.now(),
                ...metadata
            }
        };
        
        // Ajouter le message à l'historique
        messageHistory[channel].unshift(message);
        
        // Limiter la taille de l'historique
        if (messageHistory[channel].length > MAX_HISTORY_SIZE) {
            messageHistory[channel] = messageHistory[channel].slice(0, MAX_HISTORY_SIZE);
        }
        
        // Notifier tous les abonnés
        let notifiedCount = 0;
        
        subscriptions[channel].forEach(sub => {
            try {
                sub.callback(message);
                notifiedCount++;
            } catch (err) {
                console.error(`Erreur lors de la notification d'un abonné: ${err}`);
            }
        });
        
        console.log(`Message publié sur le canal ${channel}: ${action} (${notifiedCount} abonnés notifiés)`);
        return true;
    }
    
    /**
     * Obtenir les derniers messages d'un canal
     * @param {string} channel - Le canal dont on veut l'historique
     * @param {number} limit - Nombre maximum de messages à retourner
     * @returns {Array} Messages récents du canal
     */
    function getHistory(channel, limit = MAX_HISTORY_SIZE) {
        if (!Object.values(channels).includes(channel)) {
            console.error(`Canal invalide: ${channel}`);
            return [];
        }
        
        return messageHistory[channel].slice(0, limit);
    }
    
    // API publique
    return {
        channels,
        subscribe,
        unsubscribe,
        publish,
        getHistory,
        
        // Actions standardisées par module
        actions: {
            budget: {
                ITEM_ADDED: 'budget:item_added',
                ITEM_REMOVED: 'budget:item_removed',
                BUDGET_UPDATED: 'budget:updated',
                CATEGORY_ADDED: 'budget:category_added',
                SUBCATEGORY_ADDED: 'budget:subcategory_added'
            },
            wishlist: {
                ITEM_ADDED: 'wishlist:item_added',
                ITEM_REMOVED: 'wishlist:item_removed',
                ITEMS_IMPORTED: 'wishlist:items_imported',
                ADDED_TO_BUDGET: 'wishlist:added_to_budget'
            },
            wallet: {
                TRANSACTION_ADDED: 'wallet:transaction_added',
                BALANCE_UPDATED: 'wallet:balance_updated',
                LINKED_TO_PROJECT: 'wallet:linked_to_project'
            },
            project: {
                CREATED: 'project:created',
                UPDATED: 'project:updated',
                DELETED: 'project:deleted'
            }
        }
    };
})();

// Exporter le connecteur pour utilisation globale
window.ModuleConnector = ModuleConnector;

console.log("Module Connector chargé");

/**
 * Fonctions d'aide pour l'intégration standard des données entre modules
 */
const ModuleStandardizer = (function() {
    /**
     * Convertit un élément de wishlist en élément de budget
     * @param {Object} wishlistItem - Élément de wishlist à convertir
     * @returns {Object} Élément formaté pour le budget
     */
    function wishlistItemToBudgetItem(wishlistItem) {
        return {
            name: wishlistItem.name || 'Élément sans nom',
            amount: parseFloat(wishlistItem.price || 0).toFixed(2),
            type: 'expense',
            source: 'wishlist',
            sourceId: wishlistItem.id,
            createdAt: new Date().toISOString()
        };
    }
    
    /**
     * Convertit plusieurs éléments de wishlist en éléments de budget
     * @param {Array} wishlistItems - Éléments de wishlist à convertir
     * @returns {Array} Éléments formatés pour le budget
     */
    function wishlistItemsToBudgetItems(wishlistItems) {
        if (!Array.isArray(wishlistItems)) {
            console.error('Les éléments de wishlist doivent être un tableau');
            return [];
        }
        
        return wishlistItems.map(wishlistItemToBudgetItem);
    }
    
    /**
     * Génère un ID unique pour un nouvel élément
     * @param {string} prefix - Préfixe pour l'ID
     * @returns {string} ID unique généré
     */
    function generateUniqueId(prefix = '') {
        return `${prefix}${Date.now().toString()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Formate un montant en fonction de la devise actuelle
     * @param {number} amount - Montant à formater
     * @returns {string} Montant formaté
     */
    function formatCurrency(amount) {
        const currencySymbol = typeof getProjectCurrencySymbol === 'function' 
            ? getProjectCurrencySymbol() 
            : 'AED';
            
        return `${currencySymbol} ${parseFloat(amount).toFixed(2)}`;
    }
    
    /**
     * Standardise un montant monétaire en nombre
     * @param {string|number} amount - Montant à standardiser
     * @returns {number} Montant standardisé
     */
    function standardizeAmount(amount) {
        if (typeof amount === 'number') return amount;
        
        if (typeof amount === 'string') {
            // Enlever la devise et tous les caractères non numériques sauf le point et la virgule
            const cleaned = amount.replace(/[^\d.,]/g, '');
            
            // Remplacer la virgule par un point pour la conversion
            const normalized = cleaned.replace(',', '.');
            
            // Convertir en nombre
            return parseFloat(normalized) || 0;
        }
        
        return 0;
    }
    
    // API publique
    return {
        wishlistItemToBudgetItem,
        wishlistItemsToBudgetItems,
        generateUniqueId,
        formatCurrency,
        standardizeAmount
    };
})();

// Exporter le standardiseur pour utilisation globale
window.ModuleStandardizer = ModuleStandardizer;

// Ajouter un écouteur pour les connexions automatiques au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    console.log("Initialisation des connexions entre modules");
    
    // Établir les connexions entre modules si elles existent sur la page
    if (document.querySelector('.wishlist-integration') && document.querySelector('.budget-section')) {
        console.log("Détection de l'intégration wishlist-budget, mise en place des connexions");
        
        // S'abonner aux événements de wishlist pour mise à jour automatique du budget
        ModuleConnector.subscribe(ModuleConnector.channels.WISHLIST, function(message) {
            if (message.action === ModuleConnector.actions.wishlist.ADDED_TO_BUDGET) {
                console.log("Notification reçue: élément(s) de wishlist ajouté(s) au budget");
                
                // Mettre à jour les calculs du budget
                if (typeof updateBudgetCalculation === 'function') {
                    setTimeout(updateBudgetCalculation, 300);
                }
            }
        });
    }
});