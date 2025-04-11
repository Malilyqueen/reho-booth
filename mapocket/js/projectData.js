/**
 * MODULE: projectData.js
 * 
 * Ce module gère la structure, le stockage et la lecture des données de projet.
 * Il sert de source unique de vérité pour les données des projets dans l'application.
 * 
 * Fonctionnalités principales:
 * - Gestion des créations/modifications/suppressions de projets
 * - Sauvegarde dans le localStorage
 * - Schéma de données structuré et validé
 * - Migration des données depuis d'anciennes versions
 */

const ProjectData = (function() {
    // Constantes pour le stockage
    const STORAGE_KEY = 'mapocket_projects';
    const LEGACY_STORAGE_KEY = 'savedProjects';
    
    // Structure par défaut d'un projet
    const DEFAULT_PROJECT = {
        id: null,
        projectName: '',
        projectDate: '',
        projectEndDate: '',
        totalBudget: 0,
        template: 'Personnalisé',
        categories: [],
        projectStatus: 'inProgress', // inProgress, completed, archived
        createdAt: null,
        updatedAt: null,
        linkToWallet: false,
        linkToWishlist: false,
        linkedWishlistId: null
    };
    
    /**
     * Initialise le module de données
     * Vérifie la présence de données et migre si nécessaire
     */
    function initialize() {
        console.log('Initialisation du module ProjectData...');
        
        // Vérifier si des données existent déjà
        let projects = getProjects();
        
        // Si aucun projet n'est trouvé, vérifier l'ancien format et migrer si nécessaire
        if (!projects || projects.length === 0) {
            const legacyProjects = _getLegacyProjects();
            if (legacyProjects && legacyProjects.length > 0) {
                console.log(`🔄 Migration de ${legacyProjects.length} projets depuis l'ancien format...`);
                projects = _migrateLegacyProjects(legacyProjects);
                saveProjects(projects);
                console.log('✅ Migration terminée avec succès');
            } else {
                // Initialiser avec un tableau vide
                saveProjects([]);
            }
        }
        
        return {
            success: true,
            message: 'Module ProjectData initialisé avec succès',
            projectCount: getProjects().length
        };
    }
    
    /**
     * Récupère tous les projets stockés
     * @returns {Array} Tableau de projets
     */
    function getProjects() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Erreur lors de la récupération des projets:', error);
            return [];
        }
    }
    
    /**
     * Récupère un projet spécifique par son ID
     * @param {string} projectId ID du projet à récupérer
     * @returns {Object|null} Le projet trouvé ou null
     */
    function getProjectById(projectId) {
        if (!projectId) {
            console.error('ID de projet non fourni');
            return null;
        }
        
        try {
            const projects = getProjects();
            
            // Chercher dans la source principale
            const project = projects.find(p => p.id === projectId);
            if (project) {
                console.log(`✅ Projet ${projectId} trouvé dans la source principale`);
                return project;
            }
            
            // Si non trouvé, chercher dans l'ancienne source
            const legacyProjects = _getLegacyProjects();
            const legacyProject = legacyProjects.find(p => p.id === projectId);
            
            if (legacyProject) {
                console.log(`🔎 Projet ${projectId} trouvé dans une source alternative: ${LEGACY_STORAGE_KEY}`);
                // Migrer ce projet spécifique vers la nouvelle source
                const migratedProject = _migrateLegacyProject(legacyProject);
                console.log('✅ Projet migré vers la source principale');
                
                // Ajouter le projet migré à la liste principale et sauvegarder
                projects.push(migratedProject);
                saveProjects(projects);
                
                return migratedProject;
            }
            
            console.error(`❌ Projet ${projectId} non trouvé dans aucune source`);
            return null;
        } catch (error) {
            console.error('Erreur lors de la récupération du projet:', error);
            return null;
        }
    }
    
    /**
     * Sauvegarde tous les projets
     * @param {Array} projects Liste des projets à sauvegarder
     */
    function saveProjects(projects) {
        if (!Array.isArray(projects)) {
            console.error('Format invalide pour la sauvegarde des projets. Un tableau est attendu.');
            return false;
        }
        
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
            return true;
        } catch (error) {
            console.error('Erreur lors de la sauvegarde des projets:', error);
            return false;
        }
    }
    
    /**
     * Crée un nouveau projet
     * @param {Object} projectData Données du projet à créer
     * @returns {Object} Le projet créé
     */
    function createProject(projectData) {
        try {
            const projects = getProjects();
            
            // Créer un nouvel objet projet en fusionnant avec les valeurs par défaut
            const newProject = {
                ...DEFAULT_PROJECT,
                ...projectData,
                id: projectData.id || Date.now().toString(),
                createdAt: projectData.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            // Ajouter le projet à la liste
            projects.push(newProject);
            
            // Sauvegarder
            saveProjects(projects);
            
            console.log(`✅ Projet "${newProject.projectName}" créé avec l'ID: ${newProject.id}`);
            return newProject;
        } catch (error) {
            console.error('Erreur lors de la création du projet:', error);
            return null;
        }
    }
    
    /**
     * Met à jour un projet existant
     * @param {string} projectId ID du projet à mettre à jour
     * @param {Object} updatedData Nouvelles données du projet
     * @returns {Object|null} Le projet mis à jour ou null
     */
    function updateProject(projectId, updatedData) {
        try {
            const projects = getProjects();
            const projectIndex = projects.findIndex(p => p.id === projectId);
            
            if (projectIndex === -1) {
                console.error(`❌ Projet ${projectId} non trouvé pour la mise à jour`);
                return null;
            }
            
            // Mettre à jour le projet avec les nouvelles données
            const updatedProject = {
                ...projects[projectIndex],
                ...updatedData,
                updatedAt: new Date().toISOString()
            };
            
            // Remplacer le projet dans la liste
            projects[projectIndex] = updatedProject;
            
            // Sauvegarder
            saveProjects(projects);
            
            console.log(`✅ Projet "${updatedProject.projectName}" mis à jour`);
            return updatedProject;
        } catch (error) {
            console.error('Erreur lors de la mise à jour du projet:', error);
            return null;
        }
    }
    
    /**
     * Supprime un projet
     * @param {string} projectId ID du projet à supprimer
     * @returns {boolean} true si la suppression a réussi
     */
    function deleteProject(projectId) {
        try {
            const projects = getProjects();
            const initialCount = projects.length;
            
            // Filtrer pour retirer le projet
            const updatedProjects = projects.filter(p => p.id !== projectId);
            
            if (updatedProjects.length === initialCount) {
                console.error(`❌ Projet ${projectId} non trouvé pour la suppression`);
                return false;
            }
            
            // Sauvegarder
            saveProjects(updatedProjects);
            
            console.log(`✅ Projet ${projectId} supprimé avec succès`);
            return true;
        } catch (error) {
            console.error('Erreur lors de la suppression du projet:', error);
            return false;
        }
    }
    
    /**
     * Récupère les projets depuis l'ancien format
     * @private
     * @returns {Array} Projets dans l'ancien format
     */
    function _getLegacyProjects() {
        try {
            const data = localStorage.getItem(LEGACY_STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Erreur lors de la récupération des anciens projets:', error);
            return [];
        }
    }
    
    /**
     * Migre un projet depuis l'ancien format
     * @private
     * @param {Object} legacyProject Projet dans l'ancien format
     * @returns {Object} Projet au nouveau format
     */
    function _migrateLegacyProject(legacyProject) {
        // Assurer la structure complète du projet
        return {
            ...DEFAULT_PROJECT,
            ...legacyProject,
            // S'assurer que ces champs existent
            id: legacyProject.id || Date.now().toString(),
            createdAt: legacyProject.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            projectStatus: legacyProject.projectStatus || 'inProgress',
        };
    }
    
    /**
     * Migre tous les projets depuis l'ancien format
     * @private
     * @param {Array} legacyProjects Liste des projets dans l'ancien format
     * @returns {Array} Projets au nouveau format
     */
    function _migrateLegacyProjects(legacyProjects) {
        return legacyProjects.map(project => _migrateLegacyProject(project));
    }
    
    /**
     * Valide la structure d'un projet
     * @param {Object} project Projet à valider
     * @returns {boolean} true si le projet est valide
     */
    function validateProject(project) {
        // Vérifier les champs obligatoires
        if (!project.projectName || !project.id) {
            return false;
        }
        
        // Vérifier que les catégories sont un tableau
        if (!Array.isArray(project.categories)) {
            return false;
        }
        
        // Autres vérifications peuvent être ajoutées ici
        
        return true;
    }
    
    // Exposer l'API publique
    return {
        initialize,
        getProjects,
        getProjectById,
        createProject,
        updateProject,
        deleteProject,
        validateProject
    };
})();

// Auto-initialisation du module
document.addEventListener('DOMContentLoaded', function() {
    const result = ProjectData.initialize();
    console.log('✅ Module ProjectData initialisé avec succès - Version modulaire', result);
    
    // Remplacer les fonctions globales par les méthodes du module
    // pour maintenir la compatibilité avec le code existant
    window.getProjects = function() {
        console.log('🔄 Appel à getProjects redirigé vers ProjectData');
        return ProjectData.getProjects();
    };
    
    window.getProjectById = function(projectId) {
        console.log('🔄 Appel à getProjectById redirigé vers ProjectData');
        return ProjectData.getProjectById(projectId);
    };
    
    window.saveProject = function(projectData) {
        console.log('🔄 Appel à saveProject redirigé vers ProjectData');
        
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get('id');
        
        if (projectId) {
            // Mise à jour d'un projet existant
            return ProjectData.updateProject(projectId, projectData);
        } else {
            // Création d'un nouveau projet
            return ProjectData.createProject(projectData);
        }
    };
});