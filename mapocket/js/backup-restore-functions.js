/**
 * Initialise les fonctionnalités de sauvegarde et de restauration
 * Configure les boutons pour exporter et importer les données
 */
function initializeBackupRestore() {
    try {
        console.log('Initialisation des fonctionnalités de sauvegarde/restauration');
        
        // Vérifier si les éléments nécessaires existent
        const exportBtn = document.getElementById('exportDataBtn');
        const importBtn = document.getElementById('importDataBtn');
        const importFileInput = document.getElementById('importDataFile');
        
        if (!exportBtn || !importBtn || !importFileInput) {
            console.warn('Certains éléments de sauvegarde/restauration sont manquants dans la page');
            return;
        }
        
        // Vérifier si le module backupManager est disponible
        if (!window.backupManager) {
            console.error('Module de sauvegarde/restauration non chargé');
            return;
        }
        
        // Configurer le bouton d'exportation
        exportBtn.addEventListener('click', function() {
            console.log('Exportation des données demandée');
            
            try {
                if (window.backupManager.exportBackup()) {
                    showNotification('Sauvegarde exportée avec succès !');
                }
            } catch (error) {
                console.error('Erreur lors de l\'exportation des données:', error);
                showNotification('Erreur lors de l\'exportation des données');
            }
        });
        
        // Configurer le bouton d'importation
        importBtn.addEventListener('click', function() {
            console.log('Importation des données demandée');
            importFileInput.click();
        });
        
        // Configurer l'input file pour l'importation
        importFileInput.addEventListener('change', function(event) {
            if (event.target.files.length > 0) {
                const file = event.target.files[0];
                console.log('Fichier sélectionné pour importation:', file.name);
                
                window.backupManager.importBackup(file)
                    .then(success => {
                        if (success) {
                            showNotification('Données importées avec succès !');
                            // Recharger la page après un court délai
                            setTimeout(() => {
                                window.location.reload();
                            }, 1500);
                        }
                    })
                    .catch(error => {
                        console.error('Erreur lors de l\'importation des données:', error);
                        showNotification('Erreur lors de l\'importation des données');
                    });
                
                // Réinitialiser l'input file pour permettre de sélectionner le même fichier à nouveau
                event.target.value = '';
            }
        });
        
        console.log('Fonctionnalités de sauvegarde/restauration initialisées avec succès');
    } catch (error) {
        console.error('Erreur lors de l\'initialisation des fonctionnalités de sauvegarde/restauration:', error);
    }
}