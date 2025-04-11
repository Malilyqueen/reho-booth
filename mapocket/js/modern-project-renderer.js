/**
 * Fichier JavaScript pour le rendu des projets dans l'interface moderne
 * Ce fichier contient les fonctions nécessaires pour afficher les données
 * d'un projet dans l'interface moderne basée sur Tailwind CSS.
 */

// Variables globales
let currentProject = null;
let currencySymbol = '€';
let isEditMode = false;

/**
 * Initialise le rendu du projet
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log("Chargement de l'interface moderne...");
    initializeInterface();
});

/**
 * Initialise l'interface et charge les données du projet
 */
function initializeInterface() {
    try {
        // Récupérer l'ID du projet depuis l'URL
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get('id');

        if (!projectId) {
            showNotification("Aucun ID de projet spécifié", "error");
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            return;
        }

        // Récupérer les données du projet
        loadProjectData(projectId);

        // Initialiser les écouteurs d'événements
        initializeEventListeners();
    } catch (error) {
        console.error("Erreur lors de l'initialisation de l'interface:", error);
        showNotification("Erreur lors du chargement de l'interface: " + error.message, "error");
    }
}

/**
 * Charge les données du projet depuis localStorage
 * @param {string} projectId - ID du projet à charger
 */
function loadProjectData(projectId) {
    try {
        // Récupérer les projets sauvegardés
        const savedProjects = JSON.parse(localStorage.getItem('savedProjects') || '{}');
        
        // Récupérer le projet spécifique
        currentProject = savedProjects[projectId];
        
        if (!currentProject) {
            showNotification("Projet non trouvé", "error");
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            return;
        }
        
        // Récupérer le symbole de devise
        currencySymbol = currentProject.currencySymbol || '€';
        
        // Afficher les données du projet
        renderProjectData();
        
        console.log("Projet chargé avec succès:", currentProject.projectName);
        showNotification("Projet chargé avec succès", "success");
    } catch (error) {
        console.error("Erreur lors du chargement des données du projet:", error);
        showNotification("Erreur lors du chargement du projet: " + error.message, "error");
    }
}

/**
 * Initialise les écouteurs d'événements pour les boutons et autres éléments interactifs
 */
function initializeEventListeners() {
    // Bouton d'édition du projet
    document.querySelector('.btn-edit-project').addEventListener('click', toggleEditMode);
    
    // Bouton pour marquer le projet comme terminé
    document.getElementById('completeProjectBtn').addEventListener('click', completeProject);
    
    // Bouton pour archiver le projet
    document.getElementById('archiveProjectBtn').addEventListener('click', archiveProject);
    
    // Bouton pour changer d'interface
    document.getElementById('switchInterfaceBtn').addEventListener('click', function() {
        if (isEditMode) {
            disableEditMode();
            saveProjectChanges();
        }
        localStorage.setItem('useClassicInterface', 'true');
        window.location.href = 'projet-vue.html?id=' + currentProject.id;
    });
}

/**
 * Affiche les données du projet dans l'interface
 */
function renderProjectData() {
    if (!currentProject) return;
    
    // Informations générales du projet
    document.getElementById('projectTitle').textContent = currentProject.projectName || "Projet sans nom";
    document.getElementById('projectType').textContent = currentProject.template || "Projet";
    document.getElementById('initialBudget').textContent = formatCurrency(currentProject.totalBudget || 0);
    document.getElementById('initialBudgetCard').textContent = formatCurrency(currentProject.totalBudget || 0);
    document.getElementById('projectDate').textContent = currentProject.projectDate || "--/--/----";
    
    // Statut du projet
    updateProjectStatus();
    
    // Calculer et afficher le budget utilisé
    const usedBudget = calculateTotalUsedBudget();
    document.getElementById('usedBudget').textContent = formatCurrency(usedBudget);
    
    // Calculer et afficher l'écart budgétaire
    const budgetGap = (parseFloat(currentProject.totalBudget) || 0) - usedBudget;
    const budgetGapElement = document.getElementById('budgetGap');
    budgetGapElement.textContent = formatCurrency(budgetGap);
    
    // Changer la couleur selon si positif ou négatif
    if (budgetGap < 0) {
        budgetGapElement.classList.remove('text-green-600');
        budgetGapElement.classList.add('text-red-600');
    } else {
        budgetGapElement.classList.remove('text-red-600');
        budgetGapElement.classList.add('text-green-600');
    }
    
    // Mettre à jour la barre de progression
    updateProgressBar(usedBudget);
    
    // Afficher les catégories et sous-catégories
    renderCategories();
}

/**
 * Calcule le budget total utilisé
 * @returns {number} - Total du budget utilisé
 */
function calculateTotalUsedBudget() {
    let total = 0;
    
    if (currentProject && currentProject.categories) {
        currentProject.categories.forEach(category => {
            if (category.subcategories) {
                category.subcategories.forEach(subcategory => {
                    if (subcategory.lines) {
                        subcategory.lines.forEach(line => {
                            const amount = parseFloat(line.amount.toString().replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
                            total += amount;
                        });
                    }
                });
            }
        });
    }
    
    return total;
}

/**
 * Met à jour la barre de progression du budget
 * @param {number} usedBudget - Budget utilisé
 */
function updateProgressBar(usedBudget) {
    const initialBudget = parseFloat(currentProject.totalBudget) || 0;
    let percentage = 0;
    
    if (initialBudget > 0) {
        percentage = Math.min(Math.round((usedBudget / initialBudget) * 100), 100);
    }
    
    document.getElementById('budgetPercentage').textContent = percentage + '%';
    document.getElementById('progressBar').style.width = percentage + '%';
    
    // Changer la couleur selon le pourcentage
    const progressBar = document.getElementById('progressBar');
    if (percentage > 90) {
        progressBar.className = 'bg-red-500 rounded-full h-2';
    } else if (percentage > 75) {
        progressBar.className = 'bg-yellow-500 rounded-full h-2';
    } else {
        progressBar.className = 'bg-green-500 rounded-full h-2';
    }
}

/**
 * Met à jour l'affichage du statut du projet
 */
function updateProjectStatus() {
    const statusElement = document.getElementById('projectStatus');
    switch(currentProject.projectStatus) {
        case 'completed':
            statusElement.textContent = 'Terminé';
            statusElement.className = 'px-2 py-1 text-xs rounded-full bg-green-100 text-green-800';
            break;
        case 'archived':
            statusElement.textContent = 'Archivé';
            statusElement.className = 'px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800';
            break;
        case 'inProgress':
        default:
            statusElement.textContent = 'En cours';
            statusElement.className = 'px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800';
            break;
    }
}

/**
 * Affiche les catégories et sous-catégories du projet
 */
function renderCategories() {
    const categoryListElement = document.getElementById('categoryList');
    categoryListElement.innerHTML = ''; // Vider le conteneur
    
    if (!currentProject || !currentProject.categories || currentProject.categories.length === 0) {
        categoryListElement.innerHTML = '<p class="text-center py-8 text-gray-500">Aucune catégorie trouvée</p>';
        return;
    }
    
    // Récupérer le template de catégorie
    const categoryTemplate = document.getElementById('category-template');
    const subcategoryTemplate = document.getElementById('subcategory-template');
    const expenseLineTemplate = document.getElementById('expense-line-template');
    
    // Pour chaque catégorie
    currentProject.categories.forEach(category => {
        if (!category.name) return; // Ignorer les catégories sans nom
        
        // Cloner le template
        const categoryElement = categoryTemplate.content.cloneNode(true);
        
        // Remplir les données de la catégorie
        const categoryName = categoryElement.querySelector('.category-name');
        const categoryAmount = categoryElement.querySelector('.category-amount');
        const categoryEmoji = categoryElement.querySelector('.category-emoji');
        
        categoryName.textContent = category.name;
        categoryAmount.textContent = formatCurrency(parseAmount(category.amount));
        
        // Ajouter un emoji par défaut si aucun n'est défini
        const emoji = getEmoji(category.name);
        categoryEmoji.textContent = emoji;
        
        // Pour chaque sous-catégorie
        const subcategoriesContainer = categoryElement.querySelector('.subcategories-container');
        
        if (category.subcategories && category.subcategories.length > 0) {
            category.subcategories.forEach(subcategory => {
                if (!subcategory.name) return; // Ignorer les sous-catégories sans nom
                
                // Cloner le template de sous-catégorie
                const subcategoryElement = subcategoryTemplate.content.cloneNode(true);
                
                // Remplir les données de la sous-catégorie
                const subcategoryName = subcategoryElement.querySelector('.subcategory-name');
                const subcategoryAmount = subcategoryElement.querySelector('.subcategory-amount');
                const subcategoryEmoji = subcategoryElement.querySelector('.subcategory-emoji');
                
                subcategoryName.textContent = subcategory.name;
                subcategoryAmount.textContent = formatCurrency(parseAmount(subcategory.amount));
                
                // Ajouter un emoji par défaut si aucun n'est défini
                const subEmoji = getEmoji(subcategory.name);
                subcategoryEmoji.textContent = subEmoji;
                
                // Pour chaque ligne de dépense
                const expenseLines = subcategoryElement.querySelector('.expense-lines');
                
                if (subcategory.lines && subcategory.lines.length > 0) {
                    subcategory.lines.forEach(line => {
                        if (!line.name) return; // Ignorer les lignes sans nom
                        
                        // Cloner le template de ligne
                        const lineElement = expenseLineTemplate.content.cloneNode(true);
                        
                        // Remplir les données de la ligne
                        const lineName = lineElement.querySelector('.expense-name');
                        const lineAmount = lineElement.querySelector('.expense-amount');
                        
                        lineName.textContent = line.name;
                        lineAmount.textContent = formatCurrency(parseAmount(line.amount));
                        
                        // Ajouter la ligne au DOM
                        expenseLines.appendChild(lineElement);
                    });
                } else {
                    // Aucune ligne
                    expenseLines.innerHTML = '<li class="text-gray-400 italic">Aucune dépense</li>';
                }
                
                // Ajouter la sous-catégorie au DOM
                subcategoriesContainer.appendChild(subcategoryElement);
            });
        } else {
            // Aucune sous-catégorie
            subcategoriesContainer.innerHTML = '<p class="text-gray-400 italic">Aucune sous-catégorie</p>';
        }
        
        // Ajouter la catégorie au DOM
        categoryListElement.appendChild(categoryElement);
    });
}

/**
 * Fonction pour basculer le mode édition
 */
function toggleEditMode() {
    isEditMode = !isEditMode;
    
    const editButton = document.querySelector('.btn-edit-project');
    
    if (isEditMode) {
        editButton.textContent = "💾 Enregistrer";
        editButton.classList.remove('bg-blue-600', 'hover:bg-blue-700');
        editButton.classList.add('bg-green-600', 'hover:bg-green-700');
        
        // Activer les champs d'édition
        enableEditMode();
    } else {
        editButton.textContent = "✏️ Modifier";
        editButton.classList.remove('bg-green-600', 'hover:bg-green-700');
        editButton.classList.add('bg-blue-600', 'hover:bg-blue-700');
        
        // Désactiver les champs d'édition et sauvegarder
        disableEditMode();
        saveProjectChanges();
    }
}

/**
 * Active le mode édition
 */
function enableEditMode() {
    // À implémenter
    showNotification("Mode édition activé", "info");
}

/**
 * Désactive le mode édition
 */
function disableEditMode() {
    // À implémenter
    showNotification("Mode édition désactivé", "info");
}

/**
 * Enregistre les modifications du projet
 */
function saveProjectChanges() {
    try {
        if (!currentProject || !currentProject.id) {
            showNotification("Erreur: Aucun projet actif à sauvegarder", "error");
            return;
        }
        
        // Récupérer tous les projets
        const savedProjects = JSON.parse(localStorage.getItem('savedProjects') || '{}');
        
        // Mettre à jour le projet courant
        savedProjects[currentProject.id] = currentProject;
        
        // Sauvegarder les projets mis à jour
        localStorage.setItem('savedProjects', JSON.stringify(savedProjects));
        
        console.log("Projet sauvegardé:", currentProject.projectName);
        showNotification("Modifications enregistrées avec succès", "success");
    } catch (error) {
        console.error("Erreur lors de la sauvegarde:", error);
        showNotification('Erreur lors de la sauvegarde: ' + error.message, 'error');
    }
}

// La fonction showNotification est maintenant dans le fichier notifications.js

/**
 * Fonction debounce pour limiter la fréquence d'appel d'une fonction
 */
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}

/**
 * Marque le projet comme terminé
 */
function completeProject() {
    if (!currentProject) return;
    
    if (confirm("Êtes-vous sûr de vouloir marquer ce projet comme terminé ?")) {
        currentProject.projectStatus = 'completed';
        saveProjectChanges();
        updateProjectStatus();
        showNotification("Projet marqué comme terminé", "success");
    }
}

/**
 * Archive le projet
 */
function archiveProject() {
    if (!currentProject) return;
    
    if (confirm("Êtes-vous sûr de vouloir archiver ce projet ?")) {
        currentProject.projectStatus = 'archived';
        saveProjectChanges();
        updateProjectStatus();
        showNotification("Projet archivé", "success");
    }
}

/**
 * Formate un montant avec le symbole de devise
 * @param {number|string} amount - Montant à formater
 * @returns {string} - Montant formaté avec symbole de devise
 */
function formatCurrency(amount) {
    return formatAmount(amount) + ' ' + currencySymbol;
}

/**
 * Formate un montant avec séparateur de milliers et décimales
 * @param {number|string} amount - Montant à formater
 * @returns {string} - Montant formaté
 */
function formatAmount(amount) {
    const parsedAmount = parseAmount(amount);
    return parsedAmount.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/**
 * Analyse un montant à partir d'une chaîne ou d'un nombre
 * @param {number|string} amount - Montant à analyser
 * @returns {number} - Montant sous forme de nombre
 */
function parseAmount(amount) {
    if (typeof amount === 'number') return amount;
    
    if (typeof amount === 'string') {
        // Supprimer tout caractère non numérique sauf le point et la virgule
        const cleaned = amount.replace(/[^\d.,]/g, '');
        // Remplacer la virgule par un point
        const normalized = cleaned.replace(',', '.');
        // Convertir en nombre
        return parseFloat(normalized) || 0;
    }
    
    return 0;
}

/**
 * Retourne un emoji correspondant au nom de la catégorie ou sous-catégorie
 * @param {string} name - Nom de la catégorie ou sous-catégorie
 * @returns {string} - Emoji correspondant
 */
function getEmoji(name) {
    if (!name) return '📋';
    
    name = name.toLowerCase();
    
    // Mapping des noms de catégories vers des emojis
    const emojiMap = {
        'restauration': '🍽️',
        'nourriture': '🍲',
        'repas': '🍽️',
        'traiteur': '🥗',
        'buffet': '🍱',
        'boisson': '🥤',
        'alcool': '🍷',
        'animation': '🎭',
        'musique': '🎵',
        'dj': '🎧',
        'jeux': '🎮',
        'décoration': '🎨',
        'lieu': '🏰',
        'salle': '🏢',
        'transport': '🚗',
        'hébergement': '🏨',
        'invitation': '✉️',
        'cadeau': '🎁',
        'cadeaux': '🎁',
        'photo': '📸',
        'photographe': '📸',
        'vidéo': '🎥',
        'souvenir': '📝',
        'vêtement': '👔',
        'tenue': '👗',
        'mariée': '👰',
        'marié': '🤵',
        'beauté': '💄',
        'coiffure': '💇',
        'maquillage': '💋',
        'bijoux': '💍',
        'fleurs': '💐',
        'imprévus': '⚠️',
        'divers': '📌'
    };
    
    // Parcourir le mapping pour trouver une correspondance
    for (const key in emojiMap) {
        if (name.includes(key)) {
            return emojiMap[key];
        }
    }
    
    // Émoji par défaut si aucune correspondance n'est trouvée
    return '📋';
}