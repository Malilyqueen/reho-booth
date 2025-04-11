/**
 * Gestionnaire de formulaire de projet pour MaPocket
 * Ce module s'occupe de la collecte des données du formulaire et de leur transformation en objet projet
 */

/**
 * Collecte toutes les données du formulaire et génère un objet projet
 * @returns {Object} - L'objet projet avec toutes les données
 */
function collectProjectData() {
    console.log("Collecte des données du projet...");
    
    // Récupérer les informations de base du projet
    const projectData = {
        projectName: document.getElementById('projectName').value.trim() || "Projet sans nom",
        projectDate: document.getElementById('projectDate').value.trim() || new Date().toLocaleDateString('fr-FR'),
        projectEndDate: document.getElementById('projectEndDate').value.trim() || "",
        totalBudget: parseAmount(document.getElementById('totalBudget').value),
        projectStatus: document.getElementById('projectStatus').value || "inProgress",
        template: currentTemplate || document.querySelector('.template-option.selected')?.getAttribute('data-template') || "custom",
        linkToWallet: document.getElementById('linkToWallet')?.checked || false,
        currency: window.userPreferences?.currency || "EUR",
        currencySymbol: window.currencySymbol || "€",
        categories: []
    };
    
    // Gestion des options de wishlist
    const linkToWishlistCheckbox = document.getElementById('linkToWishlist');
    if (linkToWishlistCheckbox && linkToWishlistCheckbox.checked) {
        projectData.linkToWishlist = true;
        
        // Vérifier si on utilise une liste existante ou si on en crée une nouvelle
        const wishlistSelect = document.getElementById('wishlistSelect');
        const newWishlistName = document.getElementById('newWishlistName');
        
        if (wishlistSelect && wishlistSelect.value) {
            projectData.linkedWishlistId = wishlistSelect.value;
            projectData.createWishlist = false;
        } else if (newWishlistName && newWishlistName.value.trim()) {
            projectData.createWishlist = true;
            projectData.wishlistData = {
                name: newWishlistName.value.trim(),
                description: `Liste de souhaits pour ${projectData.projectName}`,
                createdAt: new Date().toISOString()
            };
        } else {
            projectData.linkToWishlist = false;
        }
    } else {
        projectData.linkToWishlist = false;
    }
    
    // Collecter les catégories, sous-catégories et lignes de dépense
    const categories = document.querySelectorAll('.category');
    categories.forEach(categoryElement => {
        const categoryName = categoryElement.querySelector('.category-name').value.trim();
        if (!categoryName) return; // Ignorer les catégories sans nom
        
        const category = {
            name: categoryName,
            amount: parseAmount(categoryElement.querySelector('.category-amount').textContent),
            subcategories: []
        };
        
        // Collecter les sous-catégories
        const subcategories = categoryElement.querySelectorAll('.subcategory');
        subcategories.forEach(subcategoryElement => {
            const subcategoryName = subcategoryElement.querySelector('.subcategory-name').value.trim();
            if (!subcategoryName) return; // Ignorer les sous-catégories sans nom
            
            const subcategory = {
                name: subcategoryName,
                amount: parseAmount(subcategoryElement.querySelector('.subcategory-amount').textContent),
                lines: []
            };
            
            // Collecter les lignes de dépense
            const lines = subcategoryElement.querySelectorAll('.expense-line');
            lines.forEach(lineElement => {
                const lineName = lineElement.querySelector('.expense-line-name').value.trim();
                if (!lineName) return; // Ignorer les lignes sans nom
                
                const lineAmount = parseAmount(lineElement.querySelector('.expense-line-amount').value);
                
                subcategory.lines.push({
                    name: lineName,
                    amount: lineAmount
                });
            });
            
            category.subcategories.push(subcategory);
        });
        
        projectData.categories.push(category);
    });
    
    // Ajouter des informations de suivi budgétaire
    projectData.budgetTracking = {
        totalBudget: projectData.totalBudget,
        totalSpent: calculateTotalUsedBudget(projectData),
        totalWishlistPurchased: 0,
        percentageUsed: calculatePercentageUsed(projectData)
    };
    
    // Générer un ID unique pour le projet s'il n'en a pas déjà un
    if (!projectData.id) {
        projectData.id = Date.now().toString();
        projectData.createdAt = new Date().toISOString();
    }
    
    console.log("Données du projet collectées:", projectData);
    
    return projectData;
}

/**
 * Calcule le total des dépenses d'un projet
 * @param {Object} projectData - Les données du projet
 * @returns {number} - Le montant total des dépenses
 */
function calculateTotalUsedBudget(projectData) {
    let total = 0;
    
    if (projectData.categories) {
        projectData.categories.forEach(category => {
            if (category.subcategories) {
                category.subcategories.forEach(subcategory => {
                    if (subcategory.lines) {
                        subcategory.lines.forEach(line => {
                            total += parseFloat(line.amount) || 0;
                        });
                    }
                });
            }
        });
    }
    
    return total;
}

/**
 * Calcule le pourcentage de budget utilisé
 * @param {Object} projectData - Les données du projet
 * @returns {number} - Le pourcentage de budget utilisé (0-100)
 */
function calculatePercentageUsed(projectData) {
    const totalBudget = parseFloat(projectData.totalBudget) || 0;
    const totalSpent = calculateTotalUsedBudget(projectData);
    
    if (totalBudget === 0) return 0;
    
    return Math.min(Math.round((totalSpent / totalBudget) * 100), 100);
}

/**
 * Sauvegarde le projet dans localStorage
 * @param {Object} projectData - Les données du projet à sauvegarder
 * @returns {boolean} - True si la sauvegarde a réussi, false sinon
 */
function saveProject(projectData) {
    try {
        // Récupérer les projets existants
        let savedProjects = JSON.parse(localStorage.getItem('savedProjects')) || [];
        
        // Vérifier si le projet existe déjà (pour une mise à jour)
        const existingIndex = savedProjects.findIndex(p => p.id === projectData.id);
        
        if (existingIndex >= 0) {
            // Mettre à jour le projet existant
            savedProjects[existingIndex] = projectData;
        } else {
            // Ajouter le nouveau projet
            savedProjects.push(projectData);
        }
        
        // Sauvegarder la liste mise à jour
        localStorage.setItem('savedProjects', JSON.stringify(savedProjects));
        
        console.log("Projet sauvegardé avec succès:", projectData.projectName);
        return true;
    } catch (error) {
        console.error("Erreur lors de la sauvegarde du projet:", error);
        return false;
    }
}

/**
 * Gère la soumission du formulaire de projet
 * @param {Event} event - L'événement de soumission du formulaire
 */
function handleProjectFormSubmit(event) {
    event.preventDefault();
    
    console.log("Soumission du formulaire de projet...");
    
    // Collecter les données du projet
    const projectData = collectProjectData();
    
    // Sauvegarder le projet
    if (saveProject(projectData)) {
        showNotification("Projet sauvegardé avec succès", "success");
        
        // Créer une liste de souhaits si nécessaire
        if (projectData.linkToWishlist && projectData.createWishlist) {
            createWishlistForProject(projectData);
        }
        
        // Rediriger vers la page du projet
        setTimeout(() => {
            window.location.href = `projet-vue.html?id=${projectData.id}`;
        }, 1000);
    } else {
        showNotification("Erreur lors de la sauvegarde du projet", "error");
    }
}

/**
 * Crée une liste de souhaits pour un projet
 * @param {Object} projectData - Les données du projet
 */
function createWishlistForProject(projectData) {
    if (!projectData.wishlistData) return;
    
    try {
        // Créer une nouvelle liste de souhaits
        const wishlistId = Date.now().toString();
        const wishlist = {
            id: wishlistId,
            ...projectData.wishlistData,
            items: [],
            linkedProjectId: projectData.id
        };
        
        // Récupérer les listes existantes
        let savedWishlists = JSON.parse(localStorage.getItem('wishlists')) || [];
        
        // Ajouter la nouvelle liste
        savedWishlists.push(wishlist);
        
        // Sauvegarder la liste mise à jour
        localStorage.setItem('wishlists', JSON.stringify(savedWishlists));
        
        // Mettre à jour le projet avec l'ID de la liste
        projectData.linkedWishlistId = wishlistId;
        saveProject(projectData);
        
        console.log("Liste de souhaits créée avec succès:", wishlist.name);
    } catch (error) {
        console.error("Erreur lors de la création de la liste de souhaits:", error);
    }
}

/**
 * Parse un montant depuis une chaîne de caractères
 * @param {string} amountStr - La chaîne à parser
 * @returns {number} - Le montant en nombre
 */
function parseAmount(amountStr) {
    if (!amountStr) return 0;
    
    // Supprimer tout ce qui n'est pas un chiffre, un point ou une virgule
    const cleanedStr = amountStr.toString().replace(/[^0-9.,]/g, '');
    
    // Remplacer la virgule par un point pour la conversion
    const normalized = cleanedStr.replace(',', '.');
    
    // Convertir en nombre
    const amount = parseFloat(normalized);
    
    return isNaN(amount) ? 0 : amount;
}

// Initialiser le gestionnaire de formulaire au chargement du document
document.addEventListener('DOMContentLoaded', function() {
    // Ajouter un écouteur sur le formulaire
    const projectForm = document.getElementById('newProjectForm');
    if (projectForm) {
        projectForm.addEventListener('submit', handleProjectFormSubmit);
        
        // Ajouter également un écouteur sur le bouton de sauvegarde principal
        const saveButton = document.getElementById('saveProjectBtn');
        if (saveButton) {
            saveButton.addEventListener('click', function(event) {
                // Déclencher la soumission du formulaire
                projectForm.dispatchEvent(new Event('submit'));
            });
        }
    }
    
    console.log("Gestionnaire de formulaire de projet initialisé");
});