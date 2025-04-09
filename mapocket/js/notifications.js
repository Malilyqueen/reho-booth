/**
 * MaPocket - Système de notifications
 * Permet d'afficher des notifications visuelles pour donner un feedback à l'utilisateur
 */

// Configuration du système de notifications
const notificationConfig = {
    duration: 3000,         // Durée d'affichage en millisecondes
    position: 'top-right',  // Position de la notification
    animations: true,       // Activer/désactiver les animations
    maxNotifications: 3     // Nombre maximum de notifications simultanées
};

// Compteur pour générer des IDs uniques
let notificationCounter = 0;

// Classe pour gérer les notifications
const NotificationManager = {
    /**
     * Affiche une notification de succès
     * @param {string} message - Message à afficher
     */
    success: function(message) {
        this.show(message, 'success');
    },

    /**
     * Affiche une notification d'information
     * @param {string} message - Message à afficher
     */
    info: function(message) {
        this.show(message, 'info');
    },

    /**
     * Affiche une notification d'avertissement
     * @param {string} message - Message à afficher
     */
    warning: function(message) {
        this.show(message, 'warning');
    },

    /**
     * Affiche une notification d'erreur
     * @param {string} message - Message à afficher
     */
    error: function(message) {
        this.show(message, 'error');
    },

    /**
     * Affiche une notification
     * @param {string} message - Message à afficher
     * @param {string} type - Type de notification (success, info, warning, error)
     */
    show: function(message, type = 'info') {
        // Créer un conteneur de notifications s'il n'existe pas
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.className = `notification-container ${notificationConfig.position}`;
            document.body.appendChild(container);
        }

        // Limiter le nombre de notifications
        const existingNotifications = container.querySelectorAll('.notification');
        if (existingNotifications.length >= notificationConfig.maxNotifications) {
            // Supprimer la plus ancienne notification
            container.removeChild(existingNotifications[0]);
        }

        // Créer la notification
        const notificationId = `notification-${notificationCounter++}`;
        const notification = document.createElement('div');
        notification.id = notificationId;
        notification.className = `notification notification-${type}`;
        
        // Ajouter l'icône en fonction du type
        let icon = '';
        switch(type) {
            case 'success':
                icon = '<i class="fas fa-check-circle"></i>';
                break;
            case 'warning':
                icon = '<i class="fas fa-exclamation-triangle"></i>';
                break;
            case 'error':
                icon = '<i class="fas fa-times-circle"></i>';
                break;
            case 'info':
            default:
                icon = '<i class="fas fa-info-circle"></i>';
                break;
        }

        // Construire le HTML de la notification
        notification.innerHTML = `
            <div class="notification-icon">${icon}</div>
            <div class="notification-content">${message}</div>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;

        // Ajouter la notification au conteneur
        container.appendChild(notification);

        // Ajouter la classe pour l'animation d'entrée
        if (notificationConfig.animations) {
            setTimeout(() => {
                notification.classList.add('show');
            }, 10);
        } else {
            notification.classList.add('show');
        }

        // Ajouter l'événement de fermeture
        const closeButton = notification.querySelector('.notification-close');
        closeButton.addEventListener('click', () => {
            this.dismiss(notificationId);
        });

        // Fermer automatiquement après la durée configurée
        setTimeout(() => {
            this.dismiss(notificationId);
        }, notificationConfig.duration);

        return notificationId;
    },

    /**
     * Ferme une notification spécifique
     * @param {string} id - ID de la notification à fermer
     */
    dismiss: function(id) {
        const notification = document.getElementById(id);
        if (!notification) return;

        // Animation de sortie
        notification.classList.remove('show');
        notification.classList.add('hide');

        // Supprimer la notification après l'animation
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    },

    /**
     * Ferme toutes les notifications
     */
    dismissAll: function() {
        const container = document.getElementById('notification-container');
        if (!container) return;

        const notifications = container.querySelectorAll('.notification');
        notifications.forEach(notification => {
            this.dismiss(notification.id);
        });
    }
};

// Exporter le gestionnaire de notifications
window.NotificationManager = NotificationManager;

// CSS pour les notifications (ajouté dynamiquement)
function addNotificationStyles() {
    const styleId = 'notification-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        .notification-container {
            position: fixed;
            z-index: 9999;
            pointer-events: none;
        }
        
        .notification-container.top-right {
            top: 20px;
            right: 20px;
        }
        
        .notification-container.top-left {
            top: 20px;
            left: 20px;
        }
        
        .notification-container.bottom-right {
            bottom: 20px;
            right: 20px;
        }
        
        .notification-container.bottom-left {
            bottom: 20px;
            left: 20px;
        }
        
        .notification {
            display: flex;
            align-items: center;
            background-color: white;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            border-radius: 8px;
            margin-bottom: 10px;
            padding: 12px 16px;
            width: 300px;
            max-width: 100%;
            pointer-events: auto;
            transform: translateX(110%);
            opacity: 0;
            transition: transform 0.3s ease, opacity 0.3s ease;
        }
        
        .notification.show {
            transform: translateX(0);
            opacity: 1;
        }
        
        .notification.hide {
            transform: translateX(110%);
            opacity: 0;
        }
        
        .notification-icon {
            margin-right: 12px;
            font-size: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .notification-success .notification-icon {
            color: #28a745;
        }
        
        .notification-warning .notification-icon {
            color: #ffc107;
        }
        
        .notification-error .notification-icon {
            color: #dc3545;
        }
        
        .notification-info .notification-icon {
            color: #17a2b8;
        }
        
        .notification-content {
            flex: 1;
            font-size: 14px;
            line-height: 1.4;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: #aaa;
            cursor: pointer;
            font-size: 14px;
            height: 20px;
            width: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: color 0.2s ease;
            padding: 0;
            margin-left: 10px;
        }
        
        .notification-close:hover {
            color: #666;
        }
        
        @media (max-width: 576px) {
            .notification-container {
                left: 10px;
                right: 10px;
                width: auto;
            }
            
            .notification {
                width: 100%;
                max-width: 100%;
            }
        }
    `;
    document.head.appendChild(style);
}

// Ajouter le CSS au chargement du document
document.addEventListener('DOMContentLoaded', function() {
    addNotificationStyles();
});