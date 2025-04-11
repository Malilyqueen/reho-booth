/**
 * Système de notifications pour MaPocket
 * Ce fichier fournit des fonctions pour afficher des notifications
 * dans différentes interfaces (simple, classique, moderne)
 */

/**
 * Affiche une notification dans l'interface
 * @param {string} message - Le message à afficher
 * @param {string} type - Le type de notification ('success', 'error', 'warning', 'info')
 */
function showNotification(message, type = 'success') {
    try {
        // Vérifier si un élément de notification existe déjà
        let notificationEl = document.getElementById('notification');
        
        // Si non, le créer
        if (!notificationEl) {
            notificationEl = document.createElement('div');
            notificationEl.id = 'notification';
            
            // Appliquer des styles différents selon l'interface
            if (document.body.classList.contains('modern-interface')) {
                // Style pour l'interface moderne
                notificationEl.className = 'fixed bottom-4 right-4 px-4 py-2 rounded-xl shadow-lg opacity-0 transition-opacity duration-300 text-white';
            } else {
                // Style pour les interfaces classique et simple
                notificationEl.className = 'notification';
            }
            
            document.body.appendChild(notificationEl);
        }
        
        // Déterminer si nous sommes dans l'interface moderne ou non
        const isModernInterface = document.body.classList.contains('modern-interface');
        
        if (isModernInterface) {
            // Supprimer toutes les classes de couleur précédentes pour l'interface moderne
            notificationEl.classList.remove('bg-green-500', 'bg-red-500', 'bg-yellow-500', 'bg-blue-500');
            
            // Appliquer la classe de couleur selon le type pour l'interface moderne
            switch (type) {
                case 'error':
                    notificationEl.classList.add('bg-red-500');
                    break;
                case 'warning':
                    notificationEl.classList.add('bg-yellow-500');
                    break;
                case 'info':
                    notificationEl.classList.add('bg-blue-500');
                    break;
                case 'success':
                default:
                    notificationEl.classList.add('bg-green-500');
                    break;
            }
        } else {
            // Supprimer toutes les classes de type pour l'interface classique/simple
            notificationEl.classList.remove('success', 'error', 'warning', 'info');
            
            // Ajouter la classe de type pour l'interface classique/simple
            notificationEl.classList.add(type);
            
            // Créer ou mettre à jour l'icône
            let iconElement = notificationEl.querySelector('.notification-icon');
            if (!iconElement) {
                iconElement = document.createElement('i');
                iconElement.className = 'notification-icon fas';
                notificationEl.appendChild(iconElement);
            }
            
            // Mettre à jour la classe de l'icône selon le type
            iconElement.className = 'notification-icon fas';
            switch (type) {
                case 'error':
                    iconElement.classList.add('fa-times-circle');
                    break;
                case 'warning':
                    iconElement.classList.add('fa-exclamation-triangle');
                    break;
                case 'info':
                    iconElement.classList.add('fa-info-circle');
                    break;
                case 'success':
                default:
                    iconElement.classList.add('fa-check-circle');
                    break;
            }
            
            // Créer ou mettre à jour le texte
            let textElement = notificationEl.querySelector('.notification-text');
            if (!textElement) {
                textElement = document.createElement('span');
                textElement.className = 'notification-text';
                notificationEl.appendChild(textElement);
            }
            
            // Mettre à jour le texte
            textElement.textContent = message;
            
            // Ajouter la classe show pour l'animation
            notificationEl.classList.add('show');
            
            // Masquer la notification après quelques secondes
            setTimeout(function() {
                notificationEl.classList.remove('show');
            }, 3000);
            
            return;
        }
        
        // Pour l'interface moderne, mettre à jour le message directement
        notificationEl.textContent = message;
        notificationEl.classList.remove('opacity-0');
        notificationEl.classList.add('opacity-100');
        
        // Masquer la notification après quelques secondes
        setTimeout(function() {
            notificationEl.classList.remove('opacity-100');
            notificationEl.classList.add('opacity-0');
        }, 3000);
    } catch (error) {
        console.error('Erreur lors de l\'affichage de la notification:', error);
    }
}

// Exporter la fonction si nous sommes dans un environnement de modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { showNotification };
}