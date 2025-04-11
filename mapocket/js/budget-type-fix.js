/**
 * Correctif global pour harmoniser la manipulation du budget total
 * Ce script modifie le prototype de l'objet pour assurer que totalBudget
 * est toujours géré de manière cohérente, qu'il soit stocké comme chaîne ou comme nombre.
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Initialisation du correctif de type de budget...');
    
    // Installer un correctif global pour tous les projets chargés
    installGlobalBudgetFix();
    
    // Observer les changements de localStorage pour appliquer le correctif aux nouveaux projets
    observeLocalStorageChanges();
    
    console.log('✅ Correctif de type de budget installé');
});

/**
 * Installe un correctif global qui intercepte les accès aux propriétés des projets
 * pour garantir un comportement cohérent
 */
function installGlobalBudgetFix() {
    // Correctif pour les accès à totalBudget dans tout le code
    // Cette fonction est appelée au chargement de la page pour s'assurer que 
    // toutes les manipulations du budget total sont cohérentes

    // Ajouter la fonction getSafeBudget sur l'objet global Window
    window.getSafeBudget = function(project) {
        if (!project) return '0';
        
        // Si totalBudget est déjà une chaîne, le retourner tel quel
        if (typeof project.totalBudget === 'string') {
            return project.totalBudget;
        }
        
        // Si c'est un nombre, le convertir en chaîne
        if (typeof project.totalBudget === 'number') {
            return project.totalBudget.toString();
        }
        
        // Valeur par défaut
        return '0';
    };
    
    // Ajouter la fonction getBudgetNumericValue sur l'objet global Window
    window.getBudgetNumericValue = function(project) {
        if (!project) return 0;
        
        // Si totalBudget est un nombre, le retourner tel quel
        if (typeof project.totalBudget === 'number') {
            return project.totalBudget;
        }
        
        // Si c'est une chaîne, la convertir en nombre
        if (typeof project.totalBudget === 'string') {
            return parseFloat(project.totalBudget.replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;
        }
        
        // Valeur par défaut
        return 0;
    };
    
    // Normaliser tous les projets existants dans le localStorage
    try {
        const savedProjects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
        if (Array.isArray(savedProjects)) {
            savedProjects.forEach(project => {
                if (project && project.totalBudget !== undefined) {
                    // S'assurer que totalBudget est une chaîne
                    if (typeof project.totalBudget !== 'string') {
                        project.totalBudget = project.totalBudget.toString();
                    }
                }
            });
            
            // Sauvegarder les projets normalisés
            localStorage.setItem('savedProjects', JSON.stringify(savedProjects));
            console.log('✅ Projets existants normalisés');
        }
    } catch (error) {
        console.error('❌ Erreur lors de la normalisation des projets:', error);
    }
}

/**
 * Observe les changements du localStorage pour appliquer le correctif
 * aux nouveaux projets ajoutés
 */
function observeLocalStorageChanges() {
    window.addEventListener('storage', function(e) {
        if (e.key === 'savedProjects') {
            try {
                const projects = JSON.parse(e.newValue || '[]');
                if (Array.isArray(projects)) {
                    projects.forEach(project => {
                        if (project && project.totalBudget !== undefined) {
                            // S'assurer que totalBudget est une chaîne
                            if (typeof project.totalBudget !== 'string') {
                                project.totalBudget = project.totalBudget.toString();
                            }
                        }
                    });
                    
                    // Sauvegarder les projets normalisés (seulement si nécessaire)
                    const stringified = JSON.stringify(projects);
                    if (stringified !== e.newValue) {
                        localStorage.setItem('savedProjects', stringified);
                        console.log('✅ Nouveaux projets normalisés');
                    }
                }
            } catch (error) {
                console.error('❌ Erreur lors de la normalisation des nouveaux projets:', error);
            }
        }
    });
}