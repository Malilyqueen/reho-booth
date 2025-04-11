/**
 * Modern Project Renderer - Script pour le rendu modernisé d'un projet avec Tailwind CSS
 * Le rendu est basé sur le système de templates et utilise les classes Tailwind
 */

document.addEventListener('DOMContentLoaded', function() {
    // Vérifie que nous sommes sur la page de visualisation de projet
    if (!document.getElementById('categoryList')) return;
    
    // Initialisation
    initModernProjectView();
});

/**
 * Initialise la vue moderne du projet
 */
function initModernProjectView() {
    console.log('Initialisation de la vue moderne du projet...');
    
    // Récupérer l'ID du projet à visualiser
    const projectId = localStorage.getItem('viewProjectId');
    if (!projectId) {
        console.error('Aucun ID de projet trouvé dans le localStorage');
        return;
    }
    
    // Charger tous les projets
    const projects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
    const project = projects.find(p => p.id === projectId);
    
    if (!project) {
        console.error('Projet non trouvé:', projectId);
        return;
    }
    
    // Afficher les informations du projet
    renderProjectInfo(project);
    
    // Rendre les catégories
    renderCategories(project.categories);
}

/**
 * Affiche les informations générales du projet
 */
function renderProjectInfo(project) {
    document.getElementById('projectTitle').textContent = project.projectName || 'Projet sans nom';
    document.getElementById('projectType').textContent = project.template || 'Non défini';
    document.getElementById('projectDate').textContent = project.projectDate || '--/--/----';
    
    // Budget initial (peut être stocké sous différentes formes)
    const initialBudget = getInitialBudget(project);
    document.getElementById('initialBudget').textContent = formatCurrency(initialBudget);
    
    // Calculer le budget utilisé en additionnant tous les montants des catégories
    const usedBudget = calculateUsedBudget(project.categories);
    document.getElementById('usedBudget').textContent = formatCurrency(usedBudget);
    
    // Calculer l'écart budgétaire
    const budgetGap = initialBudget - usedBudget;
    const gapElement = document.getElementById('budgetGap');
    gapElement.textContent = formatCurrency(Math.abs(budgetGap));
    
    // Appliquer la couleur selon que l'écart est positif ou négatif
    if (budgetGap >= 0) {
        gapElement.classList.add('text-green-600');
        gapElement.classList.remove('text-red-600');
    } else {
        gapElement.classList.add('text-red-600');
        gapElement.classList.remove('text-green-600');
    }
    
    // Calculer le pourcentage d'utilisation
    let percentage = initialBudget > 0 ? Math.min(Math.round((usedBudget / initialBudget) * 100), 100) : 0;
    document.getElementById('budgetPercentage').textContent = percentage + '%';
    
    // Mettre à jour la barre de progression
    const progressBar = document.getElementById('progressBar');
    progressBar.style.width = percentage + '%';
    
    // Changer la couleur de la barre selon le pourcentage
    if (percentage > 90) {
        progressBar.classList.remove('bg-green-500', 'bg-yellow-500');
        progressBar.classList.add('bg-red-500'); // Rouge si > 90%
    } else if (percentage > 75) {
        progressBar.classList.remove('bg-green-500', 'bg-red-500');
        progressBar.classList.add('bg-yellow-500'); // Jaune si > 75%
    } else {
        progressBar.classList.remove('bg-yellow-500', 'bg-red-500');
        progressBar.classList.add('bg-green-500'); // Vert sinon
    }
    
    // Statut du projet
    const statusEl = document.getElementById('projectStatus');
    const status = project.projectStatus || 'progress';
    
    if (status === 'completed') {
        statusEl.textContent = 'Terminé';
        statusEl.className = 'px-2 py-1 text-xs rounded-full bg-green-100 text-green-800';
    } else if (status === 'archived') {
        statusEl.textContent = 'Archivé';
        statusEl.className = 'px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800';
    } else {
        statusEl.textContent = 'En cours';
        statusEl.className = 'px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800';
    }
}

/**
 * Affiche les catégories et leurs sous-catégories
 */
function renderCategories(categories) {
    const categoryList = document.getElementById('categoryList');
    const categoryTemplate = document.getElementById('category-template');
    const subcategoryTemplate = document.getElementById('subcategory-template');
    const expenseLineTemplate = document.getElementById('expense-line-template');
    
    // Effacer le contenu existant
    categoryList.innerHTML = '';
    
    // Si pas de catégories, afficher un message
    if (!categories || categories.length === 0) {
        categoryList.innerHTML = '<p class="text-center py-8 text-gray-500">Aucune catégorie définie</p>';
        return;
    }
    
    // Parcourir toutes les catégories
    categories.forEach(category => {
        // Cloner le template de catégorie
        const categoryNode = categoryTemplate.content.cloneNode(true);
        const categoryDiv = categoryNode.querySelector('.category');
        
        // Définir l'ID unique pour la catégorie
        categoryDiv.dataset.id = category.id || generateUniqueId();
        
        // Remplir les informations de la catégorie
        const categoryName = categoryNode.querySelector('.category-name');
        const categoryAmount = categoryNode.querySelector('.category-amount');
        const categoryEmoji = categoryNode.querySelector('.category-emoji');
        
        categoryName.textContent = category.name;
        categoryAmount.textContent = formatAmount(category.amount);
        
        // Extraire et afficher l'emoji s'il existe dans le nom
        const emojiMatch = category.name.match(/^(\p{Emoji})\s+(.+)$/u);
        if (emojiMatch) {
            categoryEmoji.textContent = emojiMatch[1];
        } else {
            // Emoji par défaut selon le type de catégorie
            categoryEmoji.textContent = getCategoryEmoji(category.name);
        }
        
        // Conteneur pour les sous-catégories
        const subcategoriesContainer = categoryNode.querySelector('.subcategories-container');
        
        // Si la catégorie a des sous-catégories
        if (category.subcategories && category.subcategories.length > 0) {
            category.subcategories.forEach(subcategory => {
                // Cloner le template de sous-catégorie
                const subcategoryNode = subcategoryTemplate.content.cloneNode(true);
                const subcategoryDiv = subcategoryNode.querySelector('.subcategory');
                
                // Définir l'ID unique pour la sous-catégorie
                subcategoryDiv.dataset.id = subcategory.id || generateUniqueId();
                
                // Remplir les informations de la sous-catégorie
                const subcategoryName = subcategoryNode.querySelector('.subcategory-name');
                const subcategoryAmount = subcategoryNode.querySelector('.subcategory-amount');
                const subcategoryEmoji = subcategoryNode.querySelector('.subcategory-emoji');
                
                subcategoryName.textContent = subcategory.name;
                subcategoryAmount.textContent = formatAmount(subcategory.amount);
                
                // Extraire et afficher l'emoji s'il existe dans le nom
                const emojiMatch = subcategory.name.match(/^(\p{Emoji})\s+(.+)$/u);
                if (emojiMatch) {
                    subcategoryEmoji.textContent = emojiMatch[1];
                } else {
                    // Emoji par défaut selon le type de sous-catégorie
                    subcategoryEmoji.textContent = getSubcategoryEmoji(subcategory.name);
                }
                
                // Conteneur pour les lignes de dépenses
                const expenseLines = subcategoryNode.querySelector('.expense-lines');
                
                // Si la sous-catégorie a des lignes de dépenses
                if (subcategory.lines && subcategory.lines.length > 0) {
                    subcategory.lines.forEach(line => {
                        // Cloner le template de ligne de dépense
                        const lineNode = expenseLineTemplate.content.cloneNode(true);
                        const lineItem = lineNode.querySelector('.expense-line');
                        
                        // Définir l'ID unique pour la ligne
                        lineItem.dataset.id = line.id || generateUniqueId();
                        
                        // Remplir les informations de la ligne
                        const lineName = lineNode.querySelector('.expense-name');
                        const lineAmount = lineNode.querySelector('.expense-amount');
                        
                        lineName.textContent = line.name;
                        lineAmount.textContent = formatAmount(line.amount);
                        
                        // Ajouter la ligne de dépense à la sous-catégorie
                        expenseLines.appendChild(lineNode);
                    });
                } else {
                    // Sous-catégorie sans ligne
                    expenseLines.innerHTML = '<li class="text-gray-400">Aucune dépense</li>';
                }
                
                // Ajouter la sous-catégorie à la catégorie
                subcategoriesContainer.appendChild(subcategoryNode);
            });
        } else {
            // Catégorie sans sous-catégorie
            subcategoriesContainer.innerHTML = '<p class="text-gray-400 ml-2">Aucune sous-catégorie</p>';
        }
        
        // Ajouter la catégorie à la liste
        categoryList.appendChild(categoryNode);
    });
}

/**
 * Calcule le budget utilisé à partir des catégories
 */
function calculateUsedBudget(categories) {
    if (!categories || categories.length === 0) return 0;
    
    let total = 0;
    categories.forEach(category => {
        // Essayer de convertir le montant en nombre
        const amount = parseFloat(String(category.amount).replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
        total += amount;
    });
    
    return total;
}

/**
 * Récupère le budget initial du projet
 */
function getInitialBudget(project) {
    // Le budget peut être stocké sous différentes formes selon l'évolution de l'application
    if (project.initialBudget !== undefined) {
        return parseFloat(String(project.initialBudget).replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
    }
    
    if (project.budgetAmount !== undefined) {
        return parseFloat(String(project.budgetAmount).replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
    }
    
    if (project.budget !== undefined) {
        return parseFloat(String(project.budget).replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
    }
    
    return 0;
}

/**
 * Formate un montant pour l'affichage
 */
function formatAmount(amount) {
    // Si c'est une chaîne avec symbole de devise, extraire la valeur numérique
    if (typeof amount === 'string') {
        amount = parseFloat(amount.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
    }
    
    // Obtenir le symbole de devise actuel
    const currencySymbol = getUserCurrencySymbol();
    
    // Formater avec 2 décimales et le symbole de devise
    return `${currencySymbol} ${amount.toFixed(2).replace('.', ',')}`;
}

/**
 * Formate un montant pour l'affichage avec le symbole de devise
 */
function formatCurrency(amount) {
    return formatAmount(amount);
}

/**
 * Récupère le symbole de devise utilisateur
 */
function getUserCurrencySymbol() {
    // Par défaut
    let symbol = '€';
    
    try {
        // Essayer de récupérer depuis les préférences utilisateur
        const userPreferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
        if (userPreferences.currency) {
            // Si AVAILABLE_CURRENCIES est défini globalement (depuis currencies.js)
            if (typeof AVAILABLE_CURRENCIES !== 'undefined') {
                const currency = AVAILABLE_CURRENCIES.find(c => c.code === userPreferences.currency);
                if (currency) {
                    symbol = currency.symbol;
                }
            }
        }
    } catch (error) {
        console.error('Erreur lors de la récupération du symbole de devise:', error);
    }
    
    return symbol;
}

/**
 * Génère un ID unique
 */
function generateUniqueId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 5);
}

/**
 * Obtient un emoji associé à une catégorie
 */
function getCategoryEmoji(categoryName) {
    const name = categoryName.toLowerCase();
    
    // Correspondance d'emojis selon le type de catégorie
    if (name.includes('restauration') || name.includes('nourriture') || name.includes('food'))
        return '🍽️';
    if (name.includes('boisson') || name.includes('drink'))
        return '🥤';
    if (name.includes('décoration') || name.includes('decoration'))
        return '🎨';
    if (name.includes('venue') || name.includes('lieu') || name.includes('location'))
        return '🏰';
    if (name.includes('transport') || name.includes('voiture') || name.includes('car'))
        return '🚗';
    if (name.includes('musique') || name.includes('music'))
        return '🎵';
    if (name.includes('photo') || name.includes('video'))
        return '📸';
    if (name.includes('cadeau') || name.includes('gift'))
        return '🎁';
    if (name.includes('vêtement') || name.includes('vetement') || name.includes('clothing'))
        return '👗';
    if (name.includes('invité') || name.includes('invite') || name.includes('guest'))
        return '👪';
    if (name.includes('divers') || name.includes('misc') || name.includes('other'))
        return '📦';
    
    // Emoji par défaut
    return '📋';
}

/**
 * Obtient un emoji associé à une sous-catégorie
 */
function getSubcategoryEmoji(subcategoryName) {
    const name = subcategoryName.toLowerCase();
    
    // Correspondance d'emojis selon le type de sous-catégorie
    if (name.includes('traiteur') || name.includes('catering'))
        return '🥗';
    if (name.includes('dessert') || name.includes('gateau') || name.includes('cake'))
        return '🍰';
    if (name.includes('alcool') || name.includes('vin') || name.includes('wine'))
        return '🍷';
    if (name.includes('boisson') || name.includes('soft') || name.includes('drink'))
        return '🥤';
    if (name.includes('dj') || name.includes('musique') || name.includes('music'))
        return '🎧';
    if (name.includes('fleur') || name.includes('flower'))
        return '💐';
    if (name.includes('invitation') || name.includes('carte') || name.includes('card'))
        return '📨';
    
    // Emoji par défaut
    return '📝';
}