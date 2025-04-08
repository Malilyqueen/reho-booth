/**
 * Module pour l'exportation et l'importation des données de MaPocket
 * Permet aux utilisateurs de sauvegarder leurs projets et de les restaurer ultérieurement
 */

// Configuration
const BACKUP_VERSION = "1.0.0";
const BACKUP_PREFIX = "mapocket_backup_";

/**
 * Crée une sauvegarde de toutes les données utilisateur
 * @returns {Object} Objet contenant toutes les données sauvegardées
 */
function createBackup() {
    try {
        // Récupérer tous les projets
        const projects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
        
        // Récupérer les données du portefeuille
        const walletData = JSON.parse(localStorage.getItem('walletData') || '{}');
        const wallets = JSON.parse(localStorage.getItem('mapocket_wallets') || '[]');
        
        // Récupérer les préférences utilisateur
        const userPreferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
        
        // Récupérer les événements de la timeline
        const timelineEvents = JSON.parse(localStorage.getItem('timelineEvents') || '[]');
        
        // Récupérer les objectifs et défis
        const goals = JSON.parse(localStorage.getItem('goals') || '[]');
        const challenges = JSON.parse(localStorage.getItem('challenges') || '[]');
        
        // Récupérer les données de trésorerie
        const cashFlowPlans = JSON.parse(localStorage.getItem('cashFlowPlans') || '[]');
        
        // Récupérer les données Pro
        const quotes = JSON.parse(localStorage.getItem('mapocket_quotes') || '[]');
        const invoices = JSON.parse(localStorage.getItem('mapocket_invoices') || '[]');
        
        // Créer un objet de sauvegarde complet
        const backupData = {
            version: BACKUP_VERSION,
            timestamp: new Date().toISOString(),
            data: {
                projects,
                walletData,
                wallets,
                userPreferences,
                timelineEvents,
                goals,
                challenges,
                cashFlowPlans,
                quotes,
                invoices
            }
        };
        
        return backupData;
    } catch (error) {
        console.error("Erreur lors de la création de la sauvegarde:", error);
        throw new Error("Impossible de créer la sauvegarde. Erreur: " + error.message);
    }
}

/**
 * Exporte la sauvegarde sous forme de fichier JSON à télécharger
 */
function exportBackup() {
    try {
        const backupData = createBackup();
        
        // Convertir les données en chaîne JSON
        const backupString = JSON.stringify(backupData, null, 2);
        
        // Créer un blob avec les données
        const blob = new Blob([backupString], { type: 'application/json' });
        
        // Créer un URL pour le blob
        const url = URL.createObjectURL(blob);
        
        // Créer un élément a pour le téléchargement
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        
        // Générer un nom de fichier avec la date
        const date = new Date();
        const dateString = date.toISOString().split('T')[0]; // Format YYYY-MM-DD
        downloadLink.download = `${BACKUP_PREFIX}${dateString}.json`;
        
        // Ajouter le lien au document, cliquer dessus et le supprimer
        document.body.appendChild(downloadLink);
        downloadLink.click();
        
        // Nettoyer après le téléchargement
        setTimeout(() => {
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(url);
        }, 100);
        
        return true;
    } catch (error) {
        console.error("Erreur lors de l'exportation de la sauvegarde:", error);
        showBackupNotification("Erreur lors de l'exportation de la sauvegarde: " + error.message, "error");
        return false;
    }
}

/**
 * Importe les données à partir d'un fichier de sauvegarde
 * @param {File} file Fichier de sauvegarde à importer
 * @returns {Promise<boolean>} Promise qui se résout à true si l'importation a réussi
 */
function importBackup(file) {
    return new Promise((resolve, reject) => {
        try {
            if (!file) {
                throw new Error("Aucun fichier sélectionné");
            }
            
            // Vérifier le type de fichier
            if (!file.name.endsWith('.json')) {
                throw new Error("Le fichier doit être au format JSON");
            }
            
            const reader = new FileReader();
            
            reader.onload = function(event) {
                try {
                    // Parser le contenu du fichier
                    const backupData = JSON.parse(event.target.result);
                    
                    // Vérifier la validité du fichier de sauvegarde
                    if (!backupData.version || !backupData.timestamp || !backupData.data) {
                        throw new Error("Format de fichier de sauvegarde invalide");
                    }
                    
                    // Confirmer la restauration
                    const confirmMessage = 
                        "Attention: La restauration remplacera toutes vos données actuelles. " +
                        "Voulez-vous continuer ? \n\n" +
                        "Sauvegarde créée le: " + new Date(backupData.timestamp).toLocaleString();
                    
                    if (confirm(confirmMessage)) {
                        // Restaurer les données
                        restoreData(backupData.data);
                        
                        showBackupNotification("Données restaurées avec succès !", "success");
                        resolve(true);
                        
                        // Recharger la page pour appliquer les changements
                        setTimeout(() => {
                            window.location.reload();
                        }, 1500);
                    } else {
                        resolve(false);
                    }
                } catch (parseError) {
                    console.error("Erreur lors de l'analyse du fichier de sauvegarde:", parseError);
                    showBackupNotification("Fichier de sauvegarde invalide. Erreur: " + parseError.message, "error");
                    reject(parseError);
                }
            };
            
            reader.onerror = function(error) {
                console.error("Erreur lors de la lecture du fichier:", error);
                showBackupNotification("Erreur lors de la lecture du fichier", "error");
                reject(error);
            };
            
            // Lire le fichier
            reader.readAsText(file);
            
        } catch (error) {
            console.error("Erreur lors de l'importation de la sauvegarde:", error);
            showBackupNotification("Erreur lors de l'importation: " + error.message, "error");
            reject(error);
        }
    });
}

/**
 * Restaure les données à partir d'une sauvegarde
 * @param {Object} data Données à restaurer
 */
function restoreData(data) {
    try {
        // Sauvegarder les projets
        if (data.projects && Array.isArray(data.projects)) {
            localStorage.setItem('savedProjects', JSON.stringify(data.projects));
        }
        
        // Sauvegarder les données du portefeuille
        if (data.walletData) {
            localStorage.setItem('walletData', JSON.stringify(data.walletData));
        }
        
        if (data.wallets && Array.isArray(data.wallets)) {
            localStorage.setItem('mapocket_wallets', JSON.stringify(data.wallets));
        }
        
        // Sauvegarder les préférences utilisateur
        if (data.userPreferences) {
            localStorage.setItem('userPreferences', JSON.stringify(data.userPreferences));
        }
        
        // Sauvegarder les événements de la timeline
        if (data.timelineEvents && Array.isArray(data.timelineEvents)) {
            localStorage.setItem('timelineEvents', JSON.stringify(data.timelineEvents));
        }
        
        // Sauvegarder les objectifs et défis
        if (data.goals && Array.isArray(data.goals)) {
            localStorage.setItem('goals', JSON.stringify(data.goals));
        }
        
        if (data.challenges && Array.isArray(data.challenges)) {
            localStorage.setItem('challenges', JSON.stringify(data.challenges));
        }
        
        // Sauvegarder les données de trésorerie
        if (data.cashFlowPlans && Array.isArray(data.cashFlowPlans)) {
            localStorage.setItem('cashFlowPlans', JSON.stringify(data.cashFlowPlans));
        }
        
        // Sauvegarder les données Pro
        if (data.quotes && Array.isArray(data.quotes)) {
            localStorage.setItem('mapocket_quotes', JSON.stringify(data.quotes));
        }
        
        if (data.invoices && Array.isArray(data.invoices)) {
            localStorage.setItem('mapocket_invoices', JSON.stringify(data.invoices));
        }
        
        console.log("Restauration des données terminée avec succès");
        return true;
    } catch (error) {
        console.error("Erreur lors de la restauration des données:", error);
        throw new Error("Impossible de restaurer les données. Erreur: " + error.message);
    }
}

/**
 * Affiche une notification pour les actions de sauvegarde/restauration
 * @param {string} message Message à afficher
 * @param {string} type Type de notification (success, error, info)
 */
function showBackupNotification(message, type = 'info') {
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
    } else {
        alert(message);
    }
}

/**
 * Initialise l'interface pour la sauvegarde et la restauration
 * @param {string} exportButtonId ID du bouton d'exportation
 * @param {string} importButtonId ID du bouton d'importation
 * @param {string} fileInputId ID de l'input file pour l'importation
 */
function initBackupUI(exportButtonId, importButtonId, fileInputId) {
    // Bouton d'exportation
    const exportButton = document.getElementById(exportButtonId);
    if (exportButton) {
        exportButton.addEventListener('click', () => {
            if (exportBackup()) {
                showBackupNotification("Sauvegarde exportée avec succès !", "success");
            }
        });
    }
    
    // Bouton d'importation et input file
    const importButton = document.getElementById(importButtonId);
    const fileInput = document.getElementById(fileInputId);
    
    if (importButton && fileInput) {
        importButton.addEventListener('click', () => {
            fileInput.click();
        });
        
        fileInput.addEventListener('change', (event) => {
            if (event.target.files.length > 0) {
                const file = event.target.files[0];
                importBackup(file)
                    .catch(error => console.error("Erreur d'importation non gérée:", error));
                
                // Réinitialiser l'input file pour permettre de sélectionner le même fichier à nouveau
                event.target.value = '';
            }
        });
    }
}

// Exporter les fonctions pour l'utilisation externe
window.backupManager = {
    exportBackup,
    importBackup,
    initBackupUI
};