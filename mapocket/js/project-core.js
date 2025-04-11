/**
 * PROJECT CORE - Module central pour la gestion des projets
 * 
 * Ce module centralise toutes les opérations relatives aux projets :
 * - Lecture/écriture dans le localStorage
 * - Création de projets
 * - Modification de projets
 * - Vérification de l'intégrité des données
 * 
 * Il sert de point d'entrée unique pour toutes les opérations de données,
 * garantissant ainsi cohérence et stabilité.
 */

// Namespace pour le module
const ProjectCore = (function() {
    // Constantes
    const STORAGE_KEY = 'mapocket_projects'; // Utiliser la même clé partout dans l'application
    const DEFAULT_PROJECT_STATUS = 'inProgress';
    
    /**
     * Initialise le système de projets
     * Vérifie et crée les structures de stockage nécessaires si elles n'existent pas
     */
    function initialize() {
        console.log('Initialisation du système de projets...');
        
        // === RÉCUPÉRATION DES DONNÉES DE L'ANCIENNE CLÉ ===
        // Vérifier si nous devons migrer des données depuis l'ancienne clé
        const OLD_STORAGE_KEY = 'savedProjects';
        let oldProjects = [];
        try {
            const oldProjectsJson = localStorage.getItem(OLD_STORAGE_KEY);
            if (oldProjectsJson) {
                oldProjects = JSON.parse(oldProjectsJson);
                console.log(`🔄 Anciens projets trouvés (${oldProjects.length}) sous la clé '${OLD_STORAGE_KEY}'`);
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des anciens projets:', error);
        }
        
        // Vérifier si la nouvelle structure de stockage existe
        let needsMigration = false;
        if (!localStorage.getItem(STORAGE_KEY)) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
            console.log('Structure de stockage des projets créée');
            needsMigration = oldProjects.length > 0;
        }
        
        // Si on a des anciens projets à migrer et que la nouvelle clé est vide
        if (needsMigration) {
            console.log(`🔄 Migration de ${oldProjects.length} projets depuis '${OLD_STORAGE_KEY}' vers '${STORAGE_KEY}'`);
            localStorage.setItem(STORAGE_KEY, localStorage.getItem(OLD_STORAGE_KEY));
            
            // On peut garder une copie de sauvegarde dans l'ancienne clé
            // mais renommer pour éviter toute confusion
            localStorage.setItem(OLD_STORAGE_KEY + '_backup', localStorage.getItem(OLD_STORAGE_KEY));
            console.log(`✅ Migration terminée - Sauvegarde créée sous '${OLD_STORAGE_KEY}_backup'`);
        }
        
        // Vérifier l'intégrité des projets existants
        const projects = getAllProjects();
        console.log(`📋 Projets chargés: ${projects.length}`);
        
        let hasInvalidProjects = false;
        
        projects.forEach((project, index) => {
            if (!validateProjectStructure(project)) {
                console.warn(`Projet ${index} (${project.projectName || 'Sans nom'}) invalide, structure corrigée`);
                projects[index] = fixProjectStructure(project);
                hasInvalidProjects = true;
            }
        });
        
        // Si des projets ont été corrigés, les sauvegarder
        if (hasInvalidProjects) {
            saveAllProjects(projects);
            console.log('Projets corrigés et sauvegardés');
        }
        
        console.log('Système de projets initialisé avec succès');
        return true;
    }
    
    /**
     * Récupère tous les projets depuis le localStorage
     * @returns {Array} Tableau de tous les projets
     */
    function getAllProjects() {
        try {
            const projectsJson = localStorage.getItem(STORAGE_KEY);
            return projectsJson ? JSON.parse(projectsJson) : [];
        } catch (error) {
            console.error('Erreur lors de la récupération des projets:', error);
            return [];
        }
    }
    
    /**
     * Sauvegarde tous les projets dans le localStorage
     * @param {Array} projects Tableau de tous les projets
     * @returns {boolean} true si la sauvegarde a réussi, false sinon
     */
    function saveAllProjects(projects) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
            return true;
        } catch (error) {
            console.error('Erreur lors de la sauvegarde des projets:', error);
            return false;
        }
    }
    
    /**
     * Récupère un projet par son ID
     * @param {string} projectId ID du projet à récupérer
     * @returns {Object|null} Le projet ou null s'il n'existe pas
     */
    function getProjectById(projectId) {
        if (!projectId) return null;
        
        // D'abord, essayons de trouver le projet dans la source principale
        const projects = getAllProjects();
        const project = projects.find(project => project.id === projectId);
        
        if (project) {
            return project;
        }
        
        // Si le projet n'est pas trouvé, tentons de chercher dans d'autres sources possibles
        const alternativeSources = [
            'savedProjects',
            'mapocket_projects_backup'
        ];
        
        for (const source of alternativeSources) {
            try {
                const sourceData = localStorage.getItem(source);
                if (sourceData) {
                    const sourceProjects = JSON.parse(sourceData);
                    const foundProject = sourceProjects.find(p => p.id === projectId);
                    
                    if (foundProject) {
                        console.log(`🔎 Projet ${projectId} trouvé dans une source alternative: ${source}`);
                        
                        // Optionnel: sauvegarder ce projet dans la source principale pour les prochaines fois
                        const mainProjects = getAllProjects();
                        mainProjects.push(foundProject);
                        saveAllProjects(mainProjects);
                        console.log(`✅ Projet migré vers la source principale`);
                        
                        return foundProject;
                    }
                }
            } catch (error) {
                console.error(`Erreur lors de la recherche dans ${source}:`, error);
            }
        }
        
        // Projet introuvable
        console.error(`❌ Projet non trouvé: ${projectId}`);
        return null;
    }
    
    /**
     * Crée un nouveau projet
     * @param {Object} projectData Données du projet à créer
     * @returns {Object} Le projet créé avec son ID généré
     */
    function createProject(projectData) {
        // Vérifier les données du projet
        if (!projectData || typeof projectData !== 'object') {
            console.error('Données de projet invalides');
            return null;
        }
        
        // Générer un ID unique et ajouter la date de création
        const newProject = {
            ...projectData,
            id: projectData.id || generateUniqueId(),
            createdAt: projectData.createdAt || new Date().toISOString()
        };
        
        // Valider et corriger la structure si nécessaire
        if (!validateProjectStructure(newProject)) {
            newProject = fixProjectStructure(newProject);
        }
        
        // Récupérer les projets existants
        const projects = getAllProjects();
        
        // Ajouter le nouveau projet
        projects.push(newProject);
        
        // Sauvegarder tous les projets
        if (saveAllProjects(projects)) {
            console.log('Nouveau projet créé avec succès:', newProject.projectName);
            return newProject;
        } else {
            console.error('Erreur lors de la création du projet');
            return null;
        }
    }
    
    /**
     * Met à jour un projet existant
     * @param {string} projectId ID du projet à mettre à jour
     * @param {Object} updatedData Nouvelles données du projet
     * @returns {Object|null} Le projet mis à jour ou null en cas d'erreur
     */
    function updateProject(projectId, updatedData) {
        console.log('🔄 MISE À JOUR DU PROJET', projectId);
        console.log('Données reçues:', updatedData);
        
        if (!projectId || !updatedData) {
            console.error('⚠️ ID ou données du projet manquants');
            return null;
        }
        
        try {
            // Récupérer tous les projets
            const projects = getAllProjects();
            console.log('Projets existants trouvés:', projects.length);
            
            // Trouver l'index du projet à mettre à jour
            const projectIndex = projects.findIndex(project => project.id === projectId);
            console.log('Index du projet à mettre à jour:', projectIndex);
            
            if (projectIndex === -1) {
                console.error('⚠️ Projet non trouvé:', projectId);
                return null;
            }
            
            // Récupérer l'ancien projet
            const oldProject = projects[projectIndex];
            console.log('Projet original:', oldProject.projectName);
            
            // IMPORTANT: On utilise les données d'origine comme base et on les met à jour
            // au lieu de partir des nouvelles données et de rajouter l'ID et createdAt
            const updatedProject = {
                ...oldProject,           // D'abord toutes les données existantes
                projectName: updatedData.projectName || oldProject.projectName,
                projectDate: updatedData.projectDate || oldProject.projectDate,
                projectEndDate: updatedData.projectEndDate || oldProject.projectEndDate,
                totalBudget: updatedData.totalBudget || oldProject.totalBudget,
                template: updatedData.template || oldProject.template,
                projectStatus: updatedData.projectStatus || oldProject.projectStatus,
                categories: updatedData.categories || oldProject.categories,
                // Pas besoin de forcer l'ID et createdAt puisqu'ils sont déjà dans oldProject
            };
            
            console.log('⭐ Projet après mise à jour:', updatedProject.projectName);
            
            // Mettre à jour la liste des projets avec ce projet spécifique
            projects[projectIndex] = updatedProject;
            
            // Sauvegarder les projets avec un message indiquant que c'est une mise à jour
            console.log('Mise à jour du projet existant avec ID:', projectId);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
            console.log('Projet sauvegardé avec succès. Total projets:', projects.length);
            
            // Retourner le projet mis à jour
            return updatedProject;
        } catch (error) {
            console.error('❌ Erreur lors de la mise à jour du projet:', error);
            return null;
        }
    }
    
    /**
     * Supprime un projet
     * @param {string} projectId ID du projet à supprimer
     * @returns {boolean} true si la suppression a réussi, false sinon
     */
    function deleteProject(projectId) {
        if (!projectId) {
            console.error('ID de projet manquant');
            return false;
        }
        
        // Récupérer tous les projets
        const projects = getAllProjects();
        
        // Filtrer pour exclure le projet à supprimer
        const filteredProjects = projects.filter(project => project.id !== projectId);
        
        // Vérifier si un projet a été supprimé
        if (filteredProjects.length === projects.length) {
            console.warn('Aucun projet trouvé avec cet ID:', projectId);
            return false;
        }
        
        // Sauvegarder les projets filtrés
        if (saveAllProjects(filteredProjects)) {
            console.log('Projet supprimé avec succès:', projectId);
            return true;
        } else {
            console.error('Erreur lors de la suppression du projet');
            return false;
        }
    }
    
    /**
     * Valide la structure d'un projet
     * @param {Object} project Projet à valider
     * @returns {boolean} true si le projet est valide, false sinon
     */
    function validateProjectStructure(project) {
        if (!project || typeof project !== 'object') return false;
        
        // Vérifier les champs obligatoires
        if (!project.id || !project.projectName) {
            return false;
        }
        
        // Vérifier les catégories
        if (!Array.isArray(project.categories)) {
            return false;
        }
        
        // Vérifier chaque catégorie
        for (const category of project.categories) {
            if (typeof category !== 'object') return false;
            
            // Vérifier les sous-catégories
            if (category.subcategories && !Array.isArray(category.subcategories)) {
                return false;
            }
            
            // Vérifier chaque sous-catégorie
            if (category.subcategories) {
                for (const subcategory of category.subcategories) {
                    if (typeof subcategory !== 'object') return false;
                    
                    // Vérifier les lignes
                    if (subcategory.lines && !Array.isArray(subcategory.lines)) {
                        return false;
                    }
                }
            }
        }
        
        return true;
    }
    
    /**
     * Corrige la structure d'un projet invalide
     * @param {Object} project Projet à corriger
     * @returns {Object} Projet corrigé
     */
    function fixProjectStructure(project) {
        // Créer une copie du projet
        const fixedProject = { ...project };
        
        // Ajouter les champs obligatoires manquants
        if (!fixedProject.id) fixedProject.id = generateUniqueId();
        if (!fixedProject.projectName) fixedProject.projectName = 'Projet sans nom';
        if (!fixedProject.projectDate) fixedProject.projectDate = '';
        if (!fixedProject.totalBudget) fixedProject.totalBudget = '0';
        if (!fixedProject.template) fixedProject.template = 'Autre';
        if (!fixedProject.projectStatus) fixedProject.projectStatus = DEFAULT_PROJECT_STATUS;
        if (typeof fixedProject.linkToWallet !== 'boolean') fixedProject.linkToWallet = false;
        
        // S'assurer que les catégories existent et sont un tableau
        if (!fixedProject.categories || !Array.isArray(fixedProject.categories)) {
            fixedProject.categories = [];
        }
        
        // Vérifier chaque catégorie
        fixedProject.categories = fixedProject.categories.map(category => {
            // Créer une copie de la catégorie
            const fixedCategory = { ...category };
            
            // Ajouter les champs manquants
            if (!fixedCategory.name) fixedCategory.name = 'Catégorie sans nom';
            if (!fixedCategory.amount) fixedCategory.amount = '0';
            
            // S'assurer que les sous-catégories existent et sont un tableau
            if (!fixedCategory.subcategories || !Array.isArray(fixedCategory.subcategories)) {
                fixedCategory.subcategories = [];
            }
            
            // Vérifier chaque sous-catégorie
            fixedCategory.subcategories = fixedCategory.subcategories.map(subcategory => {
                // Créer une copie de la sous-catégorie
                const fixedSubcategory = { ...subcategory };
                
                // Ajouter les champs manquants
                if (!fixedSubcategory.name) fixedSubcategory.name = 'Sous-catégorie sans nom';
                if (!fixedSubcategory.amount) fixedSubcategory.amount = '0';
                
                // S'assurer que les lignes existent et sont un tableau
                if (!fixedSubcategory.lines || !Array.isArray(fixedSubcategory.lines)) {
                    fixedSubcategory.lines = [];
                }
                
                // Vérifier chaque ligne
                fixedSubcategory.lines = fixedSubcategory.lines.map(line => {
                    // Créer une copie de la ligne
                    const fixedLine = { ...line };
                    
                    // Ajouter les champs manquants
                    if (!fixedLine.name) fixedLine.name = 'Ligne sans nom';
                    if (!fixedLine.amount) fixedLine.amount = '0';
                    
                    return fixedLine;
                });
                
                return fixedSubcategory;
            });
            
            return fixedCategory;
        });
        
        return fixedProject;
    }
    
    /**
     * Génère un ID unique basé sur le timestamp
     * @returns {string} ID unique
     */
    function generateUniqueId() {
        return Date.now().toString();
    }
    
    /**
     * Collecte les données d'un formulaire de projet
     * @param {HTMLFormElement} form Formulaire à collecter
     * @returns {Object} Données du projet
     */
    function collectFormData(form) {
        if (!form) {
            console.error('Formulaire non trouvé');
            return null;
        }
        
        // Données de base
        const formData = {
            projectName: document.getElementById('projectName')?.value || '',
            projectDate: document.getElementById('projectDate')?.value || '',
            projectEndDate: document.getElementById('projectEndDate')?.value || '',
            totalBudget: document.getElementById('totalBudget')?.value || '',
            projectStatus: document.getElementById('projectStatus')?.value || DEFAULT_PROJECT_STATUS,
            linkToWallet: document.getElementById('linkToWallet')?.checked || false,
            categories: [] // Sera rempli par collectCategories()
        };
        
        // Récupérer le template sélectionné
        const selectedTemplate = document.querySelector('.template-option.selected');
        if (selectedTemplate) {
            formData.template = selectedTemplate.getAttribute('data-template') || 'Autre';
        } else {
            formData.template = 'Autre';
        }
        
        // Collecter les catégories
        formData.categories = collectCategories();
        
        // Vérifier si des données de liste de souhaits sont présentes
        const createWishlist = document.getElementById('createWishlist')?.checked || false;
        if (createWishlist) {
            formData.createWishlist = true;
            formData.wishlistData = {
                recipientType: document.getElementById('wishlistRecipientType')?.value || 'myself'
            };
            
            if (formData.wishlistData.recipientType === 'other') {
                formData.wishlistData.recipientName = document.getElementById('wishlistRecipientName')?.value || '';
            }
        }
        
        return formData;
    }
    
    /**
     * Collecte les catégories du formulaire
     * @returns {Array} Tableau des catégories
     */
    function collectCategories() {
        const categories = [];
        
        // Récupérer toutes les catégories
        const categoryElements = document.querySelectorAll('.expense-category');
        
        categoryElements.forEach(categoryElement => {
            const categoryName = categoryElement.querySelector('.category-name')?.textContent.trim() || '';
            const categoryAmount = categoryElement.querySelector('.category-amount')?.textContent.trim() || '';
            
            const subcategories = [];
            
            // Récupérer toutes les sous-catégories
            const subcategoryElements = categoryElement.querySelectorAll('.subcategory');
            
            subcategoryElements.forEach(subcategoryElement => {
                const subcategoryName = subcategoryElement.querySelector('.subcategory-name')?.textContent.trim() || '';
                const subcategoryAmount = subcategoryElement.querySelector('.subcategory-amount')?.textContent.trim() || '';
                
                const lines = [];
                
                // Récupérer toutes les lignes
                const lineElements = subcategoryElement.querySelectorAll('.expense-line');
                
                lineElements.forEach(lineElement => {
                    const lineName = lineElement.querySelector('.line-name')?.textContent.trim() || '';
                    const lineAmount = lineElement.querySelector('.line-amount')?.textContent.trim() || '';
                    
                    if (lineName || lineAmount) {
                        lines.push({
                            name: lineName,
                            amount: lineAmount
                        });
                    }
                });
                
                if (subcategoryName || subcategoryAmount || lines.length > 0) {
                    subcategories.push({
                        name: subcategoryName,
                        amount: subcategoryAmount,
                        lines: lines
                    });
                }
            });
            
            if (categoryName || categoryAmount || subcategories.length > 0) {
                categories.push({
                    name: categoryName,
                    amount: categoryAmount,
                    subcategories: subcategories
                });
            }
        });
        
        return categories;
    }
    
    /**
     * Remplit un formulaire avec les données d'un projet
     * @param {Object} project Projet à utiliser pour remplir le formulaire
     * @returns {boolean} true si le remplissage a réussi, false sinon
     */
    function fillFormWithProject(project) {
        if (!project) {
            console.error('Projet non trouvé');
            return false;
        }
        
        console.log('Remplissage du formulaire avec les données du projet:', project.projectName);
        
        // Sauvegarder le budget total pour s'assurer qu'il ne sera pas perdu
        const originalTotalBudget = project.totalBudget || '';
        console.log("Budget total original:", originalTotalBudget);
        
        // Champs de base - Remplir d'abord le totalBudget pour éviter qu'il soit remplacé par des calculs
        if (document.getElementById('totalBudget')) {
            document.getElementById('totalBudget').value = originalTotalBudget;
            console.log("Budget total défini immédiatement:", originalTotalBudget);
        }
        
        // Remplir les autres champs de base
        if (document.getElementById('projectName')) {
            document.getElementById('projectName').value = project.projectName || '';
        }
        
        if (document.getElementById('projectDate')) {
            document.getElementById('projectDate').value = project.projectDate || '';
        }
        
        if (document.getElementById('projectEndDate')) {
            document.getElementById('projectEndDate').value = project.projectEndDate || '';
        }
        
        if (document.getElementById('projectStatus')) {
            document.getElementById('projectStatus').value = project.projectStatus || DEFAULT_PROJECT_STATUS;
        }
        
        // Lien vers portefeuille
        if (document.getElementById('linkToWallet')) {
            document.getElementById('linkToWallet').checked = project.linkToWallet || false;
        }
        
        // Sélectionner le template
        if (project.template) {
            selectTemplate(project.template);
        }
        
        // Remplir les catégories
        if (project.categories && project.categories.length > 0) {
            clearCategoriesContainer();
            fillCategories(project.categories);
        }
        
        // Remplir les données de liste de souhaits si présentes
        if (project.createWishlist) {
            fillWishlistData(project);
        }
        
        // Fonction pour forcer la mise à jour des totaux
        const forceUpdate = () => {
            console.log("Initialisation forcée des calculs avec les données existantes...");
            
            // Extraire la valeur numérique de toutes les lignes
            document.querySelectorAll('.line-amount').forEach(element => {
                if (element.textContent) {
                    const numericValue = extractNumericValue(element.textContent);
                    element.dataset.value = numericValue;
                    console.log(`Montant de ligne extrait: ${element.textContent} -> ${numericValue}`);
                }
            });
            
            // Force le calcul de tous les totaux
            updateAllTotals(true);
            
            // TRÈS IMPORTANT: S'assurer que le budget total n'est pas perdu après les calculs
            const totalBudget = document.getElementById('totalBudget');
            if (totalBudget) {
                // Vérifier si le budget total a été remis à zéro ou vidé par les calculs
                if (!totalBudget.value || totalBudget.value === '0' || totalBudget.value === '€ 0,00' || totalBudget.value === '0,00') {
                    // Si oui, restaurer le budget original
                    totalBudget.value = originalTotalBudget;
                    console.log("Budget total restauré:", originalTotalBudget);
                }
            }
        };
        
        // Force la mise à jour deux fois pour s'assurer que tout est bien calculé
        // Et que le budget total original est préservé
        setTimeout(forceUpdate, 500);
        setTimeout(forceUpdate, 1000);
        setTimeout(() => {
            // Troisième vérification pour s'assurer que le budget total est correct
            const totalBudget = document.getElementById('totalBudget');
            if (totalBudget && (!totalBudget.value || totalBudget.value === '0' || 
                totalBudget.value === '€ 0,00' || totalBudget.value === '0,00')) {
                totalBudget.value = originalTotalBudget;
                console.log("Budget total restauré (vérification finale):", originalTotalBudget);
            }
        }, 1500);
        
        return true;
    }
    
    /**
     * Sélectionne un template dans le formulaire
     * @param {string} templateName Nom du template à sélectionner
     */
    function selectTemplate(templateName) {
        if (!templateName) return;
        
        console.log('Sélection du template:', templateName);
        
        const templateElements = document.querySelectorAll('.template-option');
        templateElements.forEach(el => {
            el.classList.remove('selected');
            
            if (el.getAttribute('data-template') === templateName) {
                el.classList.add('selected');
                
                // Activer son accordéon parent si nécessaire
                const accordionContent = el.closest('.accordion-content');
                if (accordionContent) {
                    // Fermer tous les autres accordéons d'abord
                    document.querySelectorAll('.accordion-content').forEach(content => {
                        content.style.display = 'none';
                        const header = content.previousElementSibling;
                        if (header) {
                            header.classList.remove('active');
                            const icon = header.querySelector('i');
                            if (icon) icon.className = 'fas fa-chevron-down';
                        }
                    });
                    
                    // Ouvrir cet accordéon
                    accordionContent.style.display = 'block';
                    const header = accordionContent.previousElementSibling;
                    if (header) {
                        header.classList.add('active');
                        const icon = header.querySelector('i');
                        if (icon) icon.className = 'fas fa-chevron-up';
                    }
                }
                
                // Mettre à jour le titre du type de projet
                const projectTypeElement = document.querySelector('.project-type');
                if (projectTypeElement) {
                    projectTypeElement.textContent = templateName;
                }
            }
        });
    }
    
    /**
     * Efface le conteneur des catégories
     */
    function clearCategoriesContainer() {
        const container = document.getElementById('categoriesContainer');
        if (container) {
            container.innerHTML = '';
        }
    }
    
    /**
     * Remplit le formulaire avec les catégories d'un projet
     * @param {Array} categories Catégories à ajouter
     */
    function fillCategories(categories) {
        if (!categories || !Array.isArray(categories)) return;
        
        const container = document.getElementById('categoriesContainer');
        if (!container) {
            console.error('Conteneur de catégories non trouvé');
            return;
        }
        
        // Ajouter chaque catégorie
        categories.forEach(category => {
            // Créer l'élément de catégorie
            const categoryElement = document.createElement('div');
            categoryElement.className = 'expense-category';
            categoryElement.innerHTML = `
                <div class="category-header">
                    <div class="category-name" contenteditable="true">${category.name || ''}</div>
                    <div class="category-amount" contenteditable="true">${category.amount || '0'}</div>
                    <div class="category-actions">
                        <button class="btn-sm delete-category-btn">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="subcategories-container"></div>
                <div class="category-footer">
                    <button class="btn-sm add-subcategory-btn">
                        <i class="fas fa-plus"></i> Ajouter une sous-catégorie
                    </button>
                </div>
            `;
            
            // Ajouter au conteneur
            container.appendChild(categoryElement);
            
            // Récupérer le conteneur de sous-catégories
            const subcategoriesContainer = categoryElement.querySelector('.subcategories-container');
            
            // Ajouter les sous-catégories
            if (category.subcategories && category.subcategories.length > 0) {
                category.subcategories.forEach(subcategory => {
                    // Créer l'élément de sous-catégorie
                    const subcategoryElement = document.createElement('div');
                    subcategoryElement.className = 'subcategory';
                    subcategoryElement.innerHTML = `
                        <div class="subcategory-header">
                            <div class="subcategory-name" contenteditable="true">${subcategory.name || ''}</div>
                            <div class="subcategory-amount" contenteditable="true">${subcategory.amount || '0'}</div>
                            <div class="subcategory-actions">
                                <button class="btn-sm delete-subcategory-btn">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                        <div class="expense-lines"></div>
                        <div class="subcategory-footer">
                            <button class="btn-sm add-line-btn">
                                <i class="fas fa-plus"></i> Ajouter une ligne
                            </button>
                        </div>
                    `;
                    
                    // Ajouter au conteneur
                    subcategoriesContainer.appendChild(subcategoryElement);
                    
                    // Récupérer le conteneur de lignes
                    const linesContainer = subcategoryElement.querySelector('.expense-lines');
                    
                    // Ajouter les lignes
                    if (subcategory.lines && subcategory.lines.length > 0) {
                        subcategory.lines.forEach(line => {
                            // Créer l'élément de ligne
                            const lineElement = document.createElement('div');
                            lineElement.className = 'expense-line';
                            lineElement.innerHTML = `
                                <div class="line-name" contenteditable="true">${line.name || ''}</div>
                                <div class="line-amount" contenteditable="true">${line.amount || '0'}</div>
                                <div class="line-actions">
                                    <button class="btn-sm delete-line-btn">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            `;
                            
                            // Ajouter au conteneur
                            linesContainer.appendChild(lineElement);
                        });
                    }
                });
            }
        });
        
        // Réinitialiser les écouteurs d'événements
        reinitializeEventListeners();
    }
    
    /**
     * Réinitialise les écouteurs d'événements pour les actions
     */
    function reinitializeEventListeners() {
        // Liste des fonctions d'initialisation à appeler
        const initializerFunctions = [
            'attachCategoryEventListeners',
            'attachBudgetAmountListeners',
            'makeSubcategoriesEditableByDefault',
            'fixAllEditableElements',
            'initCategoryDeletionButtons',
            'setupLineEventListeners'
        ];
        
        // Appeler chaque fonction si elle existe
        initializerFunctions.forEach(funcName => {
            if (typeof window[funcName] === 'function') {
                try {
                    window[funcName]();
                } catch (error) {
                    console.warn(`Erreur lors de l'initialisation de ${funcName}:`, error);
                }
            }
        });
        
        // S'assurer que tous les éléments sont éditables
        makeAllElementsEditable();
        
        // Attacher les écouteurs pour le calcul automatique
        attachAutoCalculationListeners();
        
        // Déclencher un calcul initial
        updateAllTotals();
    }
    
    /**
     * Rend tous les éléments éditables
     */
    function makeAllElementsEditable() {
        // Rendre tous les noms de catégories et montants éditables
        document.querySelectorAll('.category-name, .subcategory-name, .line-name, .category-amount, .subcategory-amount, .line-amount').forEach(element => {
            element.setAttribute('contenteditable', 'true');
            
            // S'assurer que le contenu ne sera pas tronqué
            element.style.overflow = 'visible';
            element.style.whiteSpace = 'normal';
            element.style.wordBreak = 'break-word';
            element.style.minWidth = '100px';
            
            // Ajouter un style de focus pour montrer que l'élément est éditable
            element.addEventListener('focus', function() {
                this.style.background = '#f0f9ff';
                this.style.boxShadow = '0 0 0 2px #007bff';
            });
            
            element.addEventListener('blur', function() {
                this.style.background = '';
                this.style.boxShadow = '';
            });
        });
    }
    
    /**
     * Attache des écouteurs pour le calcul automatique
     */
    function attachAutoCalculationListeners() {
        // Écouteurs pour tous les montants
        document.querySelectorAll('.line-amount, .subcategory-amount, .category-amount').forEach(element => {
            // Supprimer les anciens écouteurs pour éviter les doublons
            element.removeEventListener('input', updateAllTotals);
            element.removeEventListener('blur', updateAllTotals);
            
            // Ajouter les écouteurs
            element.addEventListener('input', updateAllTotals);
            element.addEventListener('blur', updateAllTotals);
        });
    }
    
    /**
     * Met à jour tous les totaux
     * @param {boolean} forceUpdate Si true, force la mise à jour même pour les éléments déjà calculés
     */
    function updateAllTotals(forceUpdate = false) {
        console.log('Mise à jour de tous les totaux...');
        
        // Convertir les montants existants au format numérique (important pour l'initialisation)
        if (forceUpdate) {
            console.log('Conversion des montants existants...');
            // Convertir tous les montants de ligne
            document.querySelectorAll('.line-amount').forEach(element => {
                const currentValue = element.textContent.trim();
                if (currentValue && currentValue !== '0') {
                    // Extraire la valeur numérique
                    const numericValue = extractNumericValue(currentValue);
                    // La reformater pour s'assurer qu'elle est correctement affichée
                    if (numericValue > 0) {
                        element.textContent = currentValue; // Garder le format original
                        element.dataset.value = numericValue; // Stocker la valeur numérique
                        console.log(`Montant de ligne converti: ${currentValue} (${numericValue})`);
                    }
                }
            });
        }
        
        // Mise à jour des montants des sous-catégories
        document.querySelectorAll('.subcategory').forEach(subcategory => {
            updateSubcategoryTotal(subcategory, forceUpdate);
        });
        
        // Mise à jour des montants des catégories
        document.querySelectorAll('.expense-category').forEach(category => {
            updateCategoryTotal(category, forceUpdate);
        });
        
        // Mise à jour du montant total du projet
        updateProjectTotal(forceUpdate);
    }
    
    /**
     * Met à jour le montant total d'une sous-catégorie
     * @param {HTMLElement} subcategory Élément sous-catégorie à mettre à jour
     * @param {boolean} forceUpdate Force la mise à jour même si déjà calculé
     */
    function updateSubcategoryTotal(subcategory, forceUpdate = false) {
        const lines = subcategory.querySelectorAll('.expense-line');
        let total = 0;
        
        // Si aucune ligne et pas de forceUpdate, conserver la valeur actuelle
        if (lines.length === 0 && !forceUpdate) {
            // Récupérer la valeur actuelle si elle existe
            const subcategoryAmount = subcategory.querySelector('.subcategory-amount');
            if (subcategoryAmount) {
                const currentValue = extractNumericValue(subcategoryAmount.textContent);
                if (currentValue > 0) {
                    return; // Conserver la valeur existante
                }
            }
        }
        
        // Calculer le total des lignes
        lines.forEach(line => {
            const amountElement = line.querySelector('.line-amount');
            if (amountElement) {
                // Utiliser la valeur numérique stockée si disponible
                if (amountElement.dataset.value) {
                    total += parseFloat(amountElement.dataset.value);
                } else {
                    const value = extractNumericValue(amountElement.textContent);
                    amountElement.dataset.value = value; // Stocker pour utilisation future
                    total += value;
                }
            }
        });
        
        // Mettre à jour le montant de la sous-catégorie
        const subcategoryAmount = subcategory.querySelector('.subcategory-amount');
        if (subcategoryAmount) {
            // Si forceUpdate ou si des lignes existent ou si le montant est vide
            if (forceUpdate || lines.length > 0 || !subcategoryAmount.textContent.trim()) {
                subcategoryAmount.textContent = formatCurrency(total);
                subcategoryAmount.dataset.value = total;
                subcategoryAmount.classList.add('calculated-amount');
            }
        }
    }
    
    /**
     * Met à jour le montant total d'une catégorie
     * @param {HTMLElement} category Élément catégorie à mettre à jour
     * @param {boolean} forceUpdate Force la mise à jour même si déjà calculé
     */
    function updateCategoryTotal(category, forceUpdate = false) {
        const subcategories = category.querySelectorAll('.subcategory');
        let total = 0;
        
        // Si aucune sous-catégorie et pas de forceUpdate, conserver la valeur actuelle
        if (subcategories.length === 0 && !forceUpdate) {
            // Récupérer la valeur actuelle si elle existe
            const categoryAmount = category.querySelector('.category-amount');
            if (categoryAmount) {
                const currentValue = extractNumericValue(categoryAmount.textContent);
                if (currentValue > 0) {
                    return; // Conserver la valeur existante
                }
            }
        }
        
        // Calculer le total des sous-catégories
        subcategories.forEach(subcategory => {
            const amountElement = subcategory.querySelector('.subcategory-amount');
            if (amountElement) {
                // Utiliser la valeur numérique stockée si disponible
                if (amountElement.dataset.value) {
                    total += parseFloat(amountElement.dataset.value);
                } else {
                    const value = extractNumericValue(amountElement.textContent);
                    amountElement.dataset.value = value; // Stocker pour utilisation future
                    total += value;
                }
            }
        });
        
        // Mettre à jour le montant de la catégorie
        const categoryAmount = category.querySelector('.category-amount');
        if (categoryAmount) {
            // Si forceUpdate ou si des sous-catégories existent ou si le montant est vide
            if (forceUpdate || subcategories.length > 0 || !categoryAmount.textContent.trim()) {
                categoryAmount.textContent = formatCurrency(total);
                categoryAmount.dataset.value = total;
                categoryAmount.classList.add('calculated-amount');
            }
        }
    }
    
    /**
     * Met à jour le montant total du projet
     * @param {boolean} forceUpdate Force la mise à jour même si déjà calculé
     */
    function updateProjectTotal(forceUpdate = false) {
        const categories = document.querySelectorAll('.expense-category');
        let total = 0;
        
        // Calculer le total des catégories
        categories.forEach(category => {
            const amountElement = category.querySelector('.category-amount');
            if (amountElement) {
                // Utiliser la valeur numérique stockée si disponible
                if (amountElement.dataset.value) {
                    total += parseFloat(amountElement.dataset.value);
                } else {
                    const value = extractNumericValue(amountElement.textContent);
                    amountElement.dataset.value = value; // Stocker pour utilisation future
                    total += value;
                }
            }
        });
        
        // Mettre à jour le montant total du projet
        const totalBudgetInput = document.getElementById('totalBudget');
        if (totalBudgetInput) {
            // Si forceUpdate ou si le total est positif ou si le montant est vide
            if (forceUpdate || total > 0 || !totalBudgetInput.value.trim()) {
                totalBudgetInput.value = formatCurrency(total);
                console.log('Budget total mis à jour:', formatCurrency(total));
            }
        }
    }
    
    /**
     * Extrait la valeur numérique d'une chaîne
     */
    function extractNumericValue(amountStr) {
        if (!amountStr) return 0;
        
        // Nettoyer la chaîne
        const cleaned = amountStr.replace(/[^\d.,]/g, '')  // Supprimer tout sauf les chiffres, les points et les virgules
                                .replace(',', '.');         // Remplacer les virgules par des points
        
        // Convertir en nombre
        const value = parseFloat(cleaned);
        
        // Retourner le nombre ou 0 si invalide
        return isNaN(value) ? 0 : value;
    }
    
    /**
     * Formate un nombre en devise
     */
    function formatCurrency(amount) {
        // Vérifier si des fonctions de formatage de devise sont disponibles
        if (typeof getCurrencySymbol === 'function') {
            const symbol = getCurrencySymbol();
            return `${symbol} ${amount.toFixed(2).replace('.', ',')}`;
        }
        
        // Par défaut, utiliser l'euro
        return `AED ${amount.toFixed(2).replace('.', ',')}`;
    }
    
    /**
     * Remplit les champs de liste de souhaits
     * @param {Object} project Projet contenant les données de liste de souhaits
     */
    function fillWishlistData(project) {
        if (!project.createWishlist) return;
        
        // Activer la case à cocher
        const createWishlistCheckbox = document.getElementById('createWishlist');
        if (createWishlistCheckbox) {
            createWishlistCheckbox.checked = true;
            
            // Afficher les options
            const wishlistOptions = document.getElementById('wishlistOptions');
            if (wishlistOptions) {
                wishlistOptions.style.display = 'block';
                wishlistOptions.classList.remove('hidden');
            }
        }
        
        // Remplir les données
        if (project.wishlistData) {
            // Type de destinataire
            const recipientType = document.getElementById('wishlistRecipientType');
            if (recipientType) {
                recipientType.value = project.wishlistData.recipientType || 'myself';
                
                // Afficher/masquer le champ de nom du destinataire
                const isOtherRecipient = project.wishlistData.recipientType === 'other';
                const recipientNameContainer = document.getElementById('recipientNameContainer');
                if (recipientNameContainer) {
                    recipientNameContainer.style.display = isOtherRecipient ? 'block' : 'none';
                    recipientNameContainer.classList.toggle('hidden', !isOtherRecipient);
                }
                
                // Nom du destinataire
                if (isOtherRecipient) {
                    const recipientName = document.getElementById('wishlistRecipientName');
                    if (recipientName) {
                        recipientName.value = project.wishlistData.recipientName || '';
                    }
                }
            }
        }
    }
    
    /**
     * Configure le formulaire pour la création d'un nouveau projet
     */
    function setupNewProjectForm() {
        console.log('Configuration du formulaire pour un nouveau projet');
        
        // Changer le titre de la page
        const pageTitle = document.querySelector('.page-title');
        if (pageTitle) {
            pageTitle.innerHTML = 'NOUVEAU PROJET';
            pageTitle.style.color = '';
        }
        
        // Changer le bouton de soumission
        const submitButton = document.querySelector('.project-form button[type="submit"]');
        if (submitButton) {
            submitButton.textContent = 'Créer le projet';
            submitButton.classList.remove('btn-success');
            submitButton.classList.add('btn-action-primary');
        }
        
        // Intercepter la soumission du formulaire
        const form = document.querySelector('form.project-form');
        if (form) {
            form.onsubmit = function(e) {
                e.preventDefault();
                
                // Collecter les données du formulaire
                const formData = collectFormData();
                
                // Créer le projet
                const newProject = createProject(formData);
                
                if (newProject) {
                    // Afficher une notification
                    showNotification('Projet créé avec succès');
                    
                    // Rediriger vers la page du projet
                    setTimeout(function() {
                        window.location.href = 'projet.html?id=' + newProject.id;
                    }, 1500);
                } else {
                    alert('Erreur lors de la création du projet. Veuillez réessayer.');
                }
                
                return false;
            };
        }
    }
    
    /**
     * Configure le formulaire pour l'édition d'un projet existant
     * @param {string} projectId ID du projet à éditer
     */
    function setupEditProjectForm(projectId) {
        console.log('Configuration du formulaire pour l\'édition du projet:', projectId);
        
        if (!projectId) {
            console.error('ID de projet manquant');
            return false;
        }
        
        // Récupérer le projet
        const project = getProjectById(projectId);
        
        if (!project) {
            console.error('Projet non trouvé:', projectId);
            return false;
        }
        
        // Changer le titre de la page
        const pageTitle = document.querySelector('.page-title');
        if (pageTitle) {
            pageTitle.innerHTML = '<i class="fas fa-edit"></i> MODIFIER PROJET';
            pageTitle.style.color = '#007bff';
        }
        
        // Changer le bouton de soumission
        const submitButton = document.querySelector('.project-form button[type="submit"]');
        if (submitButton) {
            submitButton.textContent = 'Enregistrer les modifications';
            submitButton.classList.add('btn-success');
            submitButton.classList.add('btn-action-primary');
            submitButton.classList.add('btn-edit-action');
        }
        
        // Remplir le formulaire
        fillFormWithProject(project);
        
        // Intercepter la soumission du formulaire
        const form = document.querySelector('form.project-form');
        if (form) {
            form.onsubmit = function(e) {
                e.preventDefault();
                
                // Collecter les données du formulaire
                const formData = collectFormData();
                console.log('🔍 DONNÉES FORMULAIRE COLLECTÉES:', formData);
                console.log('🔄 ID DU PROJET À METTRE À JOUR:', projectId);
                
                // Mettre à jour le projet en fournissant l'ID du projet existant
                const updatedProject = updateProject(projectId, formData);
                
                if (updatedProject) {
                    // Afficher une notification
                    showNotification('Projet mis à jour avec succès');
                    
                    // Rediriger vers la page du projet
                    setTimeout(function() {
                        window.location.href = 'projet.html?id=' + projectId;
                    }, 1500);
                } else {
                    alert('Erreur lors de la mise à jour du projet. Veuillez réessayer.');
                }
                
                return false;
            };
        }
        
        return true;
    }
    
    /**
     * Affiche une notification
     * @param {string} message Message à afficher
     * @param {string} type Type de notification (success, error, info)
     */
    function showNotification(message, type = 'success') {
        // Créer l'élément de notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Styles CSS
        const styles = {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '5px',
            zIndex: '9999',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
        };
        
        // Ajouter des styles spécifiques au type
        if (type === 'success') {
            styles.backgroundColor = '#d4edda';
            styles.color = '#155724';
        } else if (type === 'error') {
            styles.backgroundColor = '#f8d7da';
            styles.color = '#721c24';
        } else if (type === 'info') {
            styles.backgroundColor = '#d1ecf1';
            styles.color = '#0c5460';
        }
        
        // Appliquer les styles
        Object.assign(notification.style, styles);
        
        // Ajouter au corps du document
        document.body.appendChild(notification);
        
        // Supprimer après quelques secondes
        setTimeout(function() {
            notification.remove();
        }, 3000);
    }
    
    // Exposer les méthodes publiques
    return {
        initialize,
        getAllProjects,
        getProjectById,
        createProject,
        updateProject,
        deleteProject,
        validateProjectStructure,
        collectFormData,
        fillFormWithProject,
        setupNewProjectForm,
        setupEditProjectForm,
        showNotification
    };
})();

// Auto-initialisation quand le DOM est chargé
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser le système de projets
    ProjectCore.initialize();
    
    // Déterminer si nous sommes en mode édition ou création
    const urlParams = new URLSearchParams(window.location.search);
    const isEditMode = urlParams.get('edit') === 'true';
    const projectId = urlParams.get('id');
    
    if (isEditMode && projectId) {
        // Mode édition
        console.log('Mode édition détecté, ID:', projectId);
        ProjectCore.setupEditProjectForm(projectId);
    } else {
        // Mode création
        console.log('Mode création détecté');
        ProjectCore.setupNewProjectForm();
    }
});