// IMPORTANT: Ce script désactive complètement tous les templates prédéfinis
document.addEventListener('DOMContentLoaded', function() {
    console.log('Désactivation complète des templates prédéfinis et système de restauration en cours d\'application...');
    
    // Réinitialiser les données du projet stockées en session 
    try {
        if (sessionStorage.getItem('restoredProjectData')) {
            console.log('Désactivation de la restauration des données précédentes');
            sessionStorage.removeItem('restoredProjectData');
        }
    } catch (e) {
        console.error('Erreur lors du nettoyage de la session:', e);
    }
    
    // Fonction qui sera utilisée pour remplacer updateTemplateCategories
    function emptyTemplateCreator(templateType) {
        console.log('⚠️ TEMPLATE VIDE: Création d\'un projet entièrement vide quel que soit le type:', templateType);
        
        // Obtenir le symbole de la devise
        let currencySymbol = '€';
        if (typeof getProjectCurrencySymbol === 'function') {
            currencySymbol = getProjectCurrencySymbol();
        }
        
        // Créer un projet vide avec une seule catégorie vide
        const emptyCategories = [
            {
                name: "Nouvelle catégorie",
                subcategories: []
            }
        ];
        
        // Utiliser la fonction d'UI existante avec le projet vide
        if (typeof updateCategoriesUI === 'function') {
            updateCategoriesUI(emptyCategories, currencySymbol);
        } else {
            console.error('⚠️ Impossible de trouver la fonction updateCategoriesUI');
        }
    }
    
    // Attendre que la page soit complètement chargée pour s'assurer que tous les scripts sont disponibles
    setTimeout(function() {
        // Vérifier si nous sommes sur la page de création/édition de projet
        if (document.getElementById('expenseCategories')) {
            console.log('✅ Page de projet détectée - application du correctif pour les templates');
            
            // Remplacer la fonction existante par notre version qui crée toujours un projet vide
            if (typeof window.updateTemplateCategories === 'function') {
                console.log('🔄 Remplacement de la fonction updateTemplateCategories');
                window.updateTemplateCategories = emptyTemplateCreator;
                
                // Rechercher les éléments de sélection de template
                const templateOptions = document.querySelectorAll('.template-option');
                console.log(`Trouvé ${templateOptions.length} options de template à mettre à jour`);
                
                // Mettre à jour les gestionnaires d'événements pour chaque option de template
                templateOptions.forEach(option => {
                    option.removeEventListener('click', option.onclick);
                    option.addEventListener('click', function() {
                        console.log('Sélection du template:', this.dataset.template);
                        // Désélectionner tous les templates
                        document.querySelectorAll('.template-option.selected').forEach(opt => {
                            opt.classList.remove('selected');
                        });
                        // Sélectionner celui-ci
                        this.classList.add('selected');
                        // Mettre à jour le projet avec un template VIDE
                        emptyTemplateCreator(this.dataset.template);
                    });
                });
                
                // Exécuter immédiatement pour s'assurer que le projet est vide dès le début
                emptyTemplateCreator('default');
                
                console.log('✅ Correctif pour les templates appliqué avec succès');
            } else {
                console.error('⚠️ La fonction updateTemplateCategories n\'a pas été trouvée');
            }
        } else {
            console.log('⚠️ Page de projet non détectée, le correctif ne sera pas appliqué');
        }
    }, 500); // Attendre 500ms pour s'assurer que tous les scripts sont chargés
});