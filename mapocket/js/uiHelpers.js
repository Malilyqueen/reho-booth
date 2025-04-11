/**
 * MODULE: uiHelpers.js
 * 
 * Ce module fournit des fonctions utilitaires pour manipuler l'interface utilisateur.
 * Il centralise les opérations courantes comme le formatage des montants,
 * l'activation/désactivation d'éléments, et les effets visuels.
 * 
 * Fonctionnalités principales:
 * - Formatage des montants en devise
 * - Manipulation d'éléments UI (activer, désactiver, masquer, etc.)
 * - Animation d'éléments
 * - Affichage de messages et notifications
 * - Gestion des modalités et popups
 */

const UIHelpers = (function() {
    /**
     * Initialise les helpers d'interface utilisateur
     */
    function initialize() {
        console.log('Initialisation des helpers d\'interface utilisateur...');
        
        // Définir les préférences par défaut si nécessaire
        if (!window.PreferencesManager) {
            console.warn('⚠️ PreferencesManager non disponible, utilisation des valeurs par défaut');
        }
        
        console.log('✅ Helpers d\'interface utilisateur initialisés avec succès');
        return {
            success: true,
            message: 'Helpers d\'interface utilisateur initialisés avec succès'
        };
    }
    
    /**
     * Formate un montant selon les préférences de devise de l'utilisateur
     * @param {number|string} amount Le montant à formater
     * @param {Object} options Options de formatage
     * @returns {string} Le montant formaté
     */
    function formatCurrency(amount, options = {}) {
        // Valeurs par défaut
        const defaults = {
            decimals: 2,
            groupSeparator: ' ',
            decimalSeparator: ',',
            symbol: '€',
            symbolPosition: 'before' // 'before' ou 'after'
        };
        
        // Fusionner avec les options
        const config = {
            ...defaults,
            ...options
        };
        
        // Utiliser la devise préférée de l'utilisateur si disponible et non spécifiée dans les options
        if (!options.symbol && window.PreferencesManager && PreferencesManager.getCurrentCurrencySymbol) {
            config.symbol = PreferencesManager.getCurrentCurrencySymbol();
        }
        
        // Convertir en nombre si c'est une chaîne
        let numAmount = amount;
        if (typeof amount === 'string') {
            // Nettoyer la chaîne
            const cleanStr = amount.replace(/[^\d.,\-]/g, '')
                                  .replace(',', '.');
            numAmount = parseFloat(cleanStr) || 0;
        }
        
        // Formater le nombre
        let formattedNumber = numAmount.toFixed(config.decimals);
        
        // Remplacer le point par le séparateur décimal
        formattedNumber = formattedNumber.replace('.', config.decimalSeparator);
        
        // Ajouter le séparateur de groupe pour les milliers
        if (config.groupSeparator) {
            const parts = formattedNumber.split(config.decimalSeparator);
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, config.groupSeparator);
            formattedNumber = parts.join(config.decimalSeparator);
        }
        
        // Ajouter le symbole de devise
        if (config.symbolPosition === 'before') {
            return `${config.symbol} ${formattedNumber}`;
        } else {
            return `${formattedNumber} ${config.symbol}`;
        }
    }
    
    /**
     * Extrait une valeur numérique d'une chaîne formatée
     * @param {string} formattedValue Valeur formatée
     * @returns {number} Valeur numérique
     */
    function extractNumericValue(formattedValue) {
        if (!formattedValue) return 0;
        
        // Supprimer tous les caractères non numériques sauf le point, la virgule et le signe moins
        const cleanStr = formattedValue.replace(/[^\d.,\-]/g, '')
                                      .replace(',', '.');
        
        return parseFloat(cleanStr) || 0;
    }
    
    /**
     * Active ou désactive un élément
     * @param {string|HTMLElement} elementOrSelector Élément ou sélecteur
     * @param {boolean} enable True pour activer, false pour désactiver
     */
    function toggleElementEnabled(elementOrSelector, enable) {
        const element = typeof elementOrSelector === 'string' ? 
            document.querySelector(elementOrSelector) : elementOrSelector;
            
        if (!element) {
            console.warn(`⚠️ Élément non trouvé: ${elementOrSelector}`);
            return;
        }
        
        if (enable) {
            element.removeAttribute('disabled');
            element.classList.remove('disabled');
        } else {
            element.setAttribute('disabled', 'disabled');
            element.classList.add('disabled');
        }
    }
    
    /**
     * Change la visibilité d'un élément
     * @param {string|HTMLElement} elementOrSelector Élément ou sélecteur
     * @param {boolean} visible True pour afficher, false pour masquer
     * @param {string} displayMode Mode d'affichage CSS (default: 'block')
     */
    function toggleElementVisibility(elementOrSelector, visible, displayMode = 'block') {
        const element = typeof elementOrSelector === 'string' ? 
            document.querySelector(elementOrSelector) : elementOrSelector;
            
        if (!element) {
            console.warn(`⚠️ Élément non trouvé: ${elementOrSelector}`);
            return;
        }
        
        element.style.display = visible ? displayMode : 'none';
    }
    
    /**
     * Ajoute une classe temporairement puis la retire
     * Utile pour les animations et effets visuels
     * @param {string|HTMLElement} elementOrSelector Élément ou sélecteur
     * @param {string} className Nom de la classe à ajouter/retirer
     * @param {number} duration Durée en ms
     */
    function flashClass(elementOrSelector, className, duration = 1000) {
        const element = typeof elementOrSelector === 'string' ? 
            document.querySelector(elementOrSelector) : elementOrSelector;
            
        if (!element) {
            console.warn(`⚠️ Élément non trouvé: ${elementOrSelector}`);
            return;
        }
        
        element.classList.add(className);
        
        setTimeout(() => {
            element.classList.remove(className);
        }, duration);
    }
    
    /**
     * Crée un élément avec des attributs et un contenu
     * @param {string} tag Nom de la balise
     * @param {Object} attributes Attributs de l'élément
     * @param {string|HTMLElement|Array} content Contenu de l'élément
     * @returns {HTMLElement} L'élément créé
     */
    function createElement(tag, attributes = {}, content = null) {
        const element = document.createElement(tag);
        
        // Ajouter les attributs
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'class' || key === 'className') {
                // Gérer les classes CSS
                if (Array.isArray(value)) {
                    element.classList.add(...value);
                } else {
                    element.className = value;
                }
            } else if (key === 'style' && typeof value === 'object') {
                // Gérer les styles CSS
                Object.entries(value).forEach(([styleKey, styleValue]) => {
                    element.style[styleKey] = styleValue;
                });
            } else {
                // Autres attributs
                element.setAttribute(key, value);
            }
        });
        
        // Ajouter le contenu
        if (content !== null) {
            if (Array.isArray(content)) {
                content.forEach(item => {
                    if (typeof item === 'string') {
                        element.appendChild(document.createTextNode(item));
                    } else if (item instanceof HTMLElement) {
                        element.appendChild(item);
                    }
                });
            } else if (typeof content === 'string') {
                element.textContent = content;
            } else if (content instanceof HTMLElement) {
                element.appendChild(content);
            }
        }
        
        return element;
    }
    
    /**
     * Affiche une notification
     * @param {string} message Message de la notification
     * @param {string} type Type de notification (info, success, warning, error)
     * @param {number} duration Durée d'affichage en ms
     */
    function showNotification(message, type = 'info', duration = 3000) {
        // Vérifier si le gestionnaire de notifications existe
        if (window.Notifications && typeof Notifications.show === 'function') {
            Notifications.show(message, type, duration);
            return;
        }
        
        // Fallback: créer une notification simple
        const notificationContainer = document.querySelector('.notifications-container') 
            || _createNotificationContainer();
        
        const notification = createElement('div', {
            class: ['notification', `notification-${type}`]
        }, message);
        
        notificationContainer.appendChild(notification);
        
        // Afficher avec animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Masquer et supprimer après la durée spécifiée
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300); // Durée de l'animation de fade-out
        }, duration);
    }
    
    /**
     * Affiche une boîte de dialogue modale
     * @param {Object} options Options de la modale
     * @returns {Promise} Promesse résolue avec le résultat
     */
    function showModal(options = {}) {
        return new Promise((resolve, reject) => {
            // Valeurs par défaut
            const defaults = {
                title: 'Information',
                content: '',
                okText: 'OK',
                cancelText: 'Annuler',
                showCancel: true,
                size: 'medium', // small, medium, large
                closeOnClickOutside: true
            };
            
            // Fusionner avec les options
            const config = {
                ...defaults,
                ...options
            };
            
            // Créer le fond de la modale
            const modalOverlay = createElement('div', {
                class: 'modal-overlay'
            });
            
            // Créer la modale
            const modalContainer = createElement('div', {
                class: ['modal-container', `modal-${config.size}`]
            });
            
            // Créer l'en-tête
            const modalHeader = createElement('div', {
                class: 'modal-header'
            }, [
                createElement('h3', {
                    class: 'modal-title'
                }, config.title),
                createElement('button', {
                    class: 'modal-close',
                    title: 'Fermer'
                }, '×')
            ]);
            
            // Créer le corps
            const modalBody = createElement('div', {
                class: 'modal-body'
            });
            
            // Ajouter le contenu
            if (typeof config.content === 'string') {
                modalBody.innerHTML = config.content;
            } else if (config.content instanceof HTMLElement) {
                modalBody.appendChild(config.content);
            }
            
            // Créer le pied
            const modalFooter = createElement('div', {
                class: 'modal-footer'
            });
            
            // Ajouter les boutons
            if (config.showCancel) {
                const cancelButton = createElement('button', {
                    class: 'btn btn-cancel'
                }, config.cancelText);
                
                cancelButton.addEventListener('click', () => {
                    closeModal();
                    resolve(false);
                });
                
                modalFooter.appendChild(cancelButton);
            }
            
            const okButton = createElement('button', {
                class: 'btn btn-primary'
            }, config.okText);
            
            okButton.addEventListener('click', () => {
                closeModal();
                resolve(true);
            });
            
            modalFooter.appendChild(okButton);
            
            // Assembler la modale
            modalContainer.appendChild(modalHeader);
            modalContainer.appendChild(modalBody);
            modalContainer.appendChild(modalFooter);
            modalOverlay.appendChild(modalContainer);
            
            // Ajouter au document
            document.body.appendChild(modalOverlay);
            
            // Afficher avec animation
            setTimeout(() => {
                modalOverlay.classList.add('show');
                modalContainer.classList.add('show');
            }, 10);
            
            // Gérer la fermeture
            const closeModal = () => {
                modalOverlay.classList.remove('show');
                modalContainer.classList.remove('show');
                
                setTimeout(() => {
                    modalOverlay.remove();
                }, 300); // Durée de l'animation de fade-out
            };
            
            // Écouteurs d'événements
            const closeButton = modalHeader.querySelector('.modal-close');
            closeButton.addEventListener('click', () => {
                closeModal();
                resolve(false);
            });
            
            if (config.closeOnClickOutside) {
                modalOverlay.addEventListener('click', (event) => {
                    if (event.target === modalOverlay) {
                        closeModal();
                        resolve(false);
                    }
                });
            }
        });
    }
    
    /**
     * Crée un conteneur pour les notifications s'il n'existe pas
     * @private
     * @returns {HTMLElement} Le conteneur de notifications
     */
    function _createNotificationContainer() {
        const container = createElement('div', {
            class: 'notifications-container'
        });
        
        document.body.appendChild(container);
        
        return container;
    }
    
    /**
     * Formate une date selon les préférences de l'utilisateur
     * @param {Date|string} date Date à formater
     * @param {string} format Format de sortie
     * @returns {string} Date formatée
     */
    function formatDate(date, format = null) {
        // Utiliser le format préféré de l'utilisateur si disponible et non spécifié
        if (!format && window.PreferencesManager && PreferencesManager.getDateFormat) {
            format = PreferencesManager.getDateFormat();
        }
        
        // Format par défaut
        format = format || 'DD/MM/YYYY';
        
        // Convertir en objet Date si nécessaire
        let dateObj;
        if (typeof date === 'string') {
            dateObj = new Date(date);
        } else if (date instanceof Date) {
            dateObj = date;
        } else {
            dateObj = new Date();
        }
        
        // Formatage simple
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();
        
        // Remplacement des motifs
        let result = format
            .replace('DD', day)
            .replace('MM', month)
            .replace('YYYY', year);
            
        return result;
    }
    
    /**
     * Tronque un texte et ajoute des points de suspension si nécessaire
     * @param {string} text Texte à tronquer
     * @param {number} maxLength Longueur maximale
     * @param {string} ellipsis Caractères à ajouter à la fin
     * @returns {string} Texte tronqué
     */
    function truncateText(text, maxLength, ellipsis = '...') {
        if (!text || text.length <= maxLength) {
            return text;
        }
        
        return text.substring(0, maxLength - ellipsis.length) + ellipsis;
    }
    
    /**
     * Convertit une valeur monétaire d'une devise à une autre
     * @param {number} amount Montant à convertir
     * @param {string} fromCurrency Devise source
     * @param {string} toCurrency Devise cible
     * @returns {number} Montant converti
     */
    function convertCurrency(amount, fromCurrency, toCurrency) {
        // Utiliser le service de conversion si disponible
        if (window.CurrencyConverter && typeof CurrencyConverter.convert === 'function') {
            return CurrencyConverter.convert(amount, fromCurrency, toCurrency);
        }
        
        // Fallback: taux de change statiques (à éviter en production)
        const rates = {
            EUR: 1,
            USD: 1.1,
            GBP: 0.85,
            JPY: 130,
            CHF: 1.05,
            CAD: 1.45,
            AUD: 1.6,
            CNY: 7.8,
            MAD: 11.05,
            DZD: 147.8
        };
        
        if (!rates[fromCurrency] || !rates[toCurrency]) {
            console.warn(`⚠️ Taux de change non disponible pour ${fromCurrency} → ${toCurrency}`);
            return amount;
        }
        
        // Convertir via EUR comme devise pivot
        const amountInEur = amount / rates[fromCurrency];
        return amountInEur * rates[toCurrency];
    }
    
    /**
     * Déplace un élément vers une nouvelle position (animation)
     * @param {HTMLElement} element Élément à déplacer
     * @param {HTMLElement} targetContainer Conteneur cible
     * @param {Object} options Options d'animation
     */
    function moveElement(element, targetContainer, options = {}) {
        // Valeurs par défaut
        const defaults = {
            duration: 300,
            easing: 'ease-out',
            onComplete: null
        };
        
        // Fusionner avec les options
        const config = {
            ...defaults,
            ...options
        };
        
        if (!element || !targetContainer) {
            console.warn('⚠️ Élément ou conteneur cible non fourni');
            return;
        }
        
        // Position de départ
        const startRect = element.getBoundingClientRect();
        
        // Déplacer l'élément
        targetContainer.appendChild(element);
        
        // Position finale
        const endRect = element.getBoundingClientRect();
        
        // Calculer le déplacement
        const deltaX = startRect.left - endRect.left;
        const deltaY = startRect.top - endRect.top;
        
        // Animer
        element.style.transition = 'none';
        element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        
        // Forcer le recalcul du style
        void element.offsetWidth;
        
        element.style.transition = `transform ${config.duration}ms ${config.easing}`;
        element.style.transform = 'translate(0, 0)';
        
        // Événement de fin d'animation
        element.addEventListener('transitionend', function onTransitionEnd() {
            element.style.transition = '';
            element.style.transform = '';
            element.removeEventListener('transitionend', onTransitionEnd);
            
            if (typeof config.onComplete === 'function') {
                config.onComplete();
            }
        });
    }
    
    // Exposer l'API publique
    return {
        initialize,
        formatCurrency,
        extractNumericValue,
        toggleElementEnabled,
        toggleElementVisibility,
        flashClass,
        createElement,
        showNotification,
        showModal,
        formatDate,
        truncateText,
        convertCurrency,
        moveElement
    };
})();

// Auto-initialisation du module
document.addEventListener('DOMContentLoaded', function() {
    UIHelpers.initialize();
});