/**
 * Modern Project Renderer - Script pour le rendu modernisé d'un projet avec Tailwind CSS
 * Le rendu est basé sur le système de templates et utilise les classes Tailwind
 */

// Variables globales
let currentProject = null;
let isEditMode = false;

document.addEventListener('DOMContentLoaded', function() {
    // Vérifie que nous sommes sur la page de visualisation de projet
    if (!document.getElementById('categoryList')) return;
    
    // Initialisation
    initModernProjectView();
    
    // Ajouter l'écouteur d'événement pour le bouton d'édition
    const editButton = document.querySelector('.btn-edit-project');
    if (editButton) {
        editButton.addEventListener('click', toggleEditMode);
    }
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

/**
 * Bascule entre le mode lecture et le mode édition
 */
function toggleEditMode() {
    isEditMode = !isEditMode;
    
    // Récupérer le bouton d'édition
    const editButton = document.querySelector('.btn-edit-project');
    
    // Modifier l'apparence du bouton et ajouter/supprimer le bouton de sauvegarde
    if (isEditMode) {
        // Changer l'apparence du bouton d'édition
        editButton.innerHTML = '<i class="fas fa-times mr-2"></i>Annuler';
        editButton.classList.remove('bg-blue-500', 'hover:bg-blue-600');
        editButton.classList.add('bg-gray-500', 'hover:bg-gray-600');
        
        // Ajouter le bouton "Sauvegarder les modifications"
        if (!document.getElementById('saveChangesBtn')) {
            const saveBtn = document.createElement('button');
            saveBtn.id = 'saveChangesBtn';
            saveBtn.className = 'bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 transition-colors ml-2';
            saveBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Sauvegarder';
            saveBtn.addEventListener('click', saveProjectChanges);
            
            // Insérer après le bouton d'édition
            editButton.parentNode.insertBefore(saveBtn, editButton.nextSibling);
        }
        
        // Activer le mode édition
        activateEditMode();
    } else {
        // Restaurer l'apparence du bouton d'édition
        editButton.innerHTML = '<i class="fas fa-edit mr-2"></i>Modifier';
        editButton.classList.remove('bg-gray-500', 'hover:bg-gray-600');
        editButton.classList.add('bg-blue-500', 'hover:bg-blue-600');
        
        // Supprimer le bouton de sauvegarde
        const saveBtn = document.getElementById('saveChangesBtn');
        if (saveBtn) {
            saveBtn.remove();
        }
        
        // Désactiver le mode édition
        deactivateEditMode();
    }
}

/**
 * Active le mode édition sur toutes les catégories, sous-catégories et lignes
 */
function activateEditMode() {
    document.body.classList.add('edit-mode');
    
    // Ajouter les boutons "Ajouter une catégorie"
    const categoryListContainer = document.getElementById('categoryList');
    if (!document.getElementById('addCategoryBtn')) {
        const addCatBtn = document.createElement('button');
        addCatBtn.id = 'addCategoryBtn';
        addCatBtn.className = 'bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition-colors mt-4 w-full';
        addCatBtn.innerHTML = '<i class="fas fa-plus mr-2"></i>Ajouter une catégorie';
        addCatBtn.addEventListener('click', addNewCategory);
        categoryListContainer.parentNode.appendChild(addCatBtn);
    }
    
    // Rendre éditables les noms et montants des catégories et sous-catégories
    document.querySelectorAll('.category').forEach(categoryEl => {
        // Ajouter le bouton "Ajouter une sous-catégorie" à la catégorie
        if (!categoryEl.querySelector('.add-subcategory-btn')) {
            const addSubcatBtn = document.createElement('button');
            addSubcatBtn.className = 'add-subcategory-btn text-blue-500 hover:text-blue-700 text-sm ml-4 mt-2';
            addSubcatBtn.innerHTML = '<i class="fas fa-plus mr-1"></i>Ajouter une sous-catégorie';
            addSubcatBtn.addEventListener('click', function() {
                addNewSubcategory(categoryEl);
            });
            categoryEl.appendChild(addSubcatBtn);
        }
        
        // Rendre le nom de catégorie éditable
        const catName = categoryEl.querySelector('.category-name');
        if (catName && catName.tagName !== 'INPUT') {
            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.className = 'category-name bg-gray-50 border-b border-blue-300 px-1 focus:outline-none focus:border-blue-500';
            nameInput.value = catName.textContent.trim();
            catName.parentNode.replaceChild(nameInput, catName);
        }
    });
    
    // Rendre éditables les noms et montants des sous-catégories
    document.querySelectorAll('.subcategory').forEach(subcatEl => {
        // Ajouter le bouton "Ajouter une dépense" à la sous-catégorie
        if (!subcatEl.querySelector('.add-expense-btn')) {
            const addExpenseBtn = document.createElement('button');
            addExpenseBtn.className = 'add-expense-btn text-green-500 hover:text-green-700 text-sm ml-8 mt-1 mb-2';
            addExpenseBtn.innerHTML = '<i class="fas fa-plus mr-1"></i>Ajouter une dépense';
            addExpenseBtn.addEventListener('click', function() {
                addNewExpenseLine(subcatEl);
            });
            subcatEl.appendChild(addExpenseBtn);
        }
        
        // Rendre le nom de sous-catégorie éditable
        const subcatName = subcatEl.querySelector('.subcategory-name');
        if (subcatName && subcatName.tagName !== 'INPUT') {
            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.className = 'subcategory-name bg-gray-50 border-b border-blue-300 px-1 focus:outline-none focus:border-blue-500';
            nameInput.value = subcatName.textContent.trim();
            subcatName.parentNode.replaceChild(nameInput, subcatName);
        }
    });
    
    // Rendre éditables les noms et montants des lignes de dépenses
    document.querySelectorAll('.expense-line').forEach(lineEl => {
        // Rendre le nom de ligne éditable
        const lineName = lineEl.querySelector('.expense-name');
        if (lineName && lineName.tagName !== 'INPUT') {
            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.className = 'expense-name bg-gray-50 border-b border-blue-300 px-1 focus:outline-none focus:border-blue-500';
            nameInput.value = lineName.textContent.trim();
            lineName.parentNode.replaceChild(nameInput, lineName);
        }
        
        // Rendre le montant éditable
        const lineAmount = lineEl.querySelector('.expense-amount');
        if (lineAmount && lineAmount.tagName !== 'INPUT') {
            const amount = parseFloat(lineAmount.textContent.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
            const amountInput = document.createElement('input');
            amountInput.type = 'number';
            amountInput.className = 'expense-amount bg-gray-50 border-b border-blue-300 px-1 focus:outline-none focus:border-blue-500';
            amountInput.min = '0';
            amountInput.step = '0.01';
            amountInput.value = amount.toFixed(2);
            amountInput.style.width = '80px';
            lineAmount.parentNode.replaceChild(amountInput, lineAmount);
            
            // Recalculer les montants lors de la modification
            amountInput.addEventListener('input', debounce(recalculateAllAmounts, 300));
        }
        
        // Ajouter un bouton de suppression si non existant
        if (!lineEl.querySelector('.delete-line-btn')) {
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-line-btn text-red-500 hover:text-red-700 ml-2';
            deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
            deleteBtn.addEventListener('click', function() {
                if (confirm('Voulez-vous vraiment supprimer cette ligne?')) {
                    lineEl.remove();
                    recalculateAllAmounts();
                }
            });
            lineEl.appendChild(deleteBtn);
        }
    });
}

/**
 * Désactive le mode édition et rétablit les affichages en mode lecture
 */
function deactivateEditMode() {
    document.body.classList.remove('edit-mode');
    
    // Supprimer le bouton "Ajouter une catégorie"
    const addCatBtn = document.getElementById('addCategoryBtn');
    if (addCatBtn) {
        addCatBtn.remove();
    }
    
    // Supprimer tous les boutons d'ajout et de suppression
    document.querySelectorAll('.add-subcategory-btn, .add-expense-btn, .delete-line-btn').forEach(btn => {
        btn.remove();
    });
    
    // Convertir les inputs des catégories en texte
    document.querySelectorAll('.category-name').forEach(input => {
        if (input.tagName === 'INPUT') {
            const span = document.createElement('span');
            span.className = 'category-name';
            span.textContent = input.value;
            input.parentNode.replaceChild(span, input);
        }
    });
    
    // Convertir les inputs des sous-catégories en texte
    document.querySelectorAll('.subcategory-name').forEach(input => {
        if (input.tagName === 'INPUT') {
            const span = document.createElement('span');
            span.className = 'subcategory-name';
            span.textContent = input.value;
            input.parentNode.replaceChild(span, input);
        }
    });
    
    // Convertir les inputs des lignes en texte
    document.querySelectorAll('.expense-name').forEach(input => {
        if (input.tagName === 'INPUT') {
            const span = document.createElement('span');
            span.className = 'expense-name';
            span.textContent = input.value;
            input.parentNode.replaceChild(span, input);
        }
    });
    
    document.querySelectorAll('.expense-amount').forEach(input => {
        if (input.tagName === 'INPUT') {
            const span = document.createElement('span');
            span.className = 'expense-amount ml-4 text-gray-600';
            span.textContent = formatAmount(input.value);
            input.parentNode.replaceChild(span, input);
        }
    });
}

/**
 * Ajoute une nouvelle catégorie
 */
function addNewCategory() {
    const catName = prompt('Nom de la nouvelle catégorie:');
    if (!catName || catName.trim() === '') return;
    
    const categoryList = document.getElementById('categoryList');
    const categoryTemplate = document.getElementById('category-template');
    
    // Cloner le template
    const categoryNode = categoryTemplate.content.cloneNode(true);
    const categoryDiv = categoryNode.querySelector('.category');
    
    // Générer un ID unique
    const categoryId = generateUniqueId();
    categoryDiv.dataset.id = categoryId;
    
    // Mettre à jour le nom de la catégorie
    const categoryName = categoryNode.querySelector('.category-name');
    const categoryAmount = categoryNode.querySelector('.category-amount');
    const categoryEmoji = categoryNode.querySelector('.category-emoji');
    
    // Créer un input au lieu d'un span en mode édition
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'category-name bg-gray-50 border-b border-blue-300 px-1 focus:outline-none focus:border-blue-500';
    nameInput.value = catName;
    categoryName.parentNode.replaceChild(nameInput, categoryName);
    
    // Définir les autres attributs
    categoryAmount.textContent = formatAmount(0);
    categoryEmoji.textContent = getCategoryEmoji(catName);
    
    // Ajouter le bouton pour ajouter des sous-catégories
    const addSubcatBtn = document.createElement('button');
    addSubcatBtn.className = 'add-subcategory-btn text-blue-500 hover:text-blue-700 text-sm ml-4 mt-2';
    addSubcatBtn.innerHTML = '<i class="fas fa-plus mr-1"></i>Ajouter une sous-catégorie';
    addSubcatBtn.addEventListener('click', function() {
        addNewSubcategory(categoryDiv);
    });
    categoryDiv.appendChild(addSubcatBtn);
    
    // Ajouter la catégorie à la liste
    categoryList.appendChild(categoryNode);
    
    // Créer la première sous-catégorie automatiquement
    addNewSubcategory(categoryDiv, 'Nouvelle sous-catégorie');
    
    // Recalculer les montants
    recalculateAllAmounts();
    
    return categoryDiv;
}

/**
 * Ajoute une nouvelle sous-catégorie à une catégorie
 */
function addNewSubcategory(categoryEl, defaultName = null) {
    const subcatName = defaultName || prompt('Nom de la nouvelle sous-catégorie:');
    if (!subcatName || subcatName.trim() === '') return;
    
    const subcategoryTemplate = document.getElementById('subcategory-template');
    
    // Cloner le template
    const subcategoryNode = subcategoryTemplate.content.cloneNode(true);
    const subcategoryDiv = subcategoryNode.querySelector('.subcategory');
    
    // Générer un ID unique
    const subcategoryId = generateUniqueId();
    subcategoryDiv.dataset.id = subcategoryId;
    
    // Mettre à jour le nom de la sous-catégorie
    const subcategoryName = subcategoryNode.querySelector('.subcategory-name');
    const subcategoryAmount = subcategoryNode.querySelector('.subcategory-amount');
    const subcategoryEmoji = subcategoryNode.querySelector('.subcategory-emoji');
    
    // Créer un input au lieu d'un span en mode édition
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'subcategory-name bg-gray-50 border-b border-blue-300 px-1 focus:outline-none focus:border-blue-500';
    nameInput.value = subcatName;
    subcategoryName.parentNode.replaceChild(nameInput, subcategoryName);
    
    // Définir les autres attributs
    subcategoryAmount.textContent = formatAmount(0);
    subcategoryEmoji.textContent = getSubcategoryEmoji(subcatName);
    
    // Ajouter le bouton pour ajouter des dépenses
    const addExpenseBtn = document.createElement('button');
    addExpenseBtn.className = 'add-expense-btn text-green-500 hover:text-green-700 text-sm ml-8 mt-1 mb-2';
    addExpenseBtn.innerHTML = '<i class="fas fa-plus mr-1"></i>Ajouter une dépense';
    addExpenseBtn.addEventListener('click', function() {
        addNewExpenseLine(subcategoryDiv);
    });
    subcategoryDiv.appendChild(addExpenseBtn);
    
    // Ajouter la sous-catégorie à la catégorie
    const subcategoriesContainer = categoryEl.querySelector('.subcategories-container');
    subcategoriesContainer.appendChild(subcategoryNode);
    
    // Vider le message "Aucune sous-catégorie" s'il existe
    const emptyMessage = subcategoriesContainer.querySelector('p.text-gray-400');
    if (emptyMessage) {
        emptyMessage.remove();
    }
    
    // Créer la première ligne de dépense automatiquement
    addNewExpenseLine(subcategoryDiv, 'Nouvelle dépense', 0);
    
    // Recalculer les montants
    recalculateAllAmounts();
    
    return subcategoryDiv;
}

/**
 * Ajoute une nouvelle ligne de dépense à une sous-catégorie
 */
function addNewExpenseLine(subcategoryEl, defaultName = null, defaultAmount = null) {
    const expenseLineTemplate = document.getElementById('expense-line-template');
    
    // Cloner le template
    const lineNode = expenseLineTemplate.content.cloneNode(true);
    const lineItem = lineNode.querySelector('.expense-line');
    
    // Générer un ID unique
    const lineId = generateUniqueId();
    lineItem.dataset.id = lineId;
    
    // Mettre à jour le nom et le montant de la ligne de dépense
    const lineName = lineNode.querySelector('.expense-name');
    const lineAmount = lineNode.querySelector('.expense-amount');
    
    // Créer un input au lieu d'un span en mode édition
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'expense-name bg-gray-50 border-b border-blue-300 px-1 focus:outline-none focus:border-blue-500';
    nameInput.value = defaultName || 'Nouvelle dépense';
    lineName.parentNode.replaceChild(nameInput, lineName);
    
    // Créer un input au lieu d'un span en mode édition pour le montant
    const amountInput = document.createElement('input');
    amountInput.type = 'number';
    amountInput.className = 'expense-amount bg-gray-50 border-b border-blue-300 px-1 focus:outline-none focus:border-blue-500';
    amountInput.min = '0';
    amountInput.step = '0.01';
    amountInput.value = (defaultAmount !== null) ? defaultAmount.toFixed(2) : '0.00';
    amountInput.style.width = '80px';
    lineAmount.parentNode.replaceChild(amountInput, lineAmount);
    
    // Recalculer les montants lors de la modification
    amountInput.addEventListener('input', debounce(recalculateAllAmounts, 300));
    
    // Ajouter un bouton de suppression
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-line-btn text-red-500 hover:text-red-700 ml-2';
    deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
    deleteBtn.addEventListener('click', function() {
        if (confirm('Voulez-vous vraiment supprimer cette ligne?')) {
            lineItem.remove();
            recalculateAllAmounts();
        }
    });
    lineItem.appendChild(deleteBtn);
    
    // Ajouter la ligne de dépense à la sous-catégorie
    const expenseLines = subcategoryEl.querySelector('.expense-lines');
    
    // Vider le message "Aucune dépense" s'il existe
    if (expenseLines.querySelector('li.text-gray-400')) {
        expenseLines.innerHTML = '';
    }
    
    expenseLines.appendChild(lineNode);
    
    // Recalculer les montants
    recalculateAllAmounts();
    
    // Donner le focus au champ de nom
    nameInput.focus();
    
    return lineItem;
}

/**
 * Recalcule tous les montants (ligne -> sous-catégorie -> catégorie -> total)
 * Cette fonction est appelée après chaque modification
 */
function recalculateAllAmounts() {
    console.log("🔄 Recalcul en cascade lancé");
    
    let projectTotal = 0;
    
    // Pour chaque catégorie
    document.querySelectorAll('.category').forEach(categoryEl => {
        let categoryTotal = 0;
        
        // Pour chaque sous-catégorie dans cette catégorie
        categoryEl.querySelectorAll('.subcategory').forEach(subEl => {
            let subTotal = 0;
            
            // Pour chaque ligne de dépense dans cette sous-catégorie
            subEl.querySelectorAll('.expense-line').forEach(lineEl => {
                // Récupérer le montant (peut être un input ou un span selon le mode)
                const amountEl = lineEl.querySelector('.expense-amount');
                let amount = 0;
                
                if (amountEl) {
                    if (amountEl.tagName === 'INPUT') {
                        // Mode édition - lire la valeur du champ input
                        amount = parseFloat(amountEl.value) || 0;
                    } else {
                        // Mode lecture - extraire la valeur numérique du texte
                        amount = parseFloat(amountEl.textContent.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
                    }
                    subTotal += amount;
                }
            });
            
            // Mettre à jour le montant de la sous-catégorie
            const subAmountEl = subEl.querySelector('.subcategory-amount');
            if (subAmountEl) {
                subAmountEl.textContent = formatAmount(subTotal);
            }
            
            categoryTotal += subTotal;
        });
        
        // Mettre à jour le montant de la catégorie
        const catAmountEl = categoryEl.querySelector('.category-amount');
        if (catAmountEl) {
            catAmountEl.textContent = formatAmount(categoryTotal);
        }
        
        projectTotal += categoryTotal;
    });
    
    // Mettre à jour le budget total du projet
    const usedBudgetEl = document.getElementById('usedBudget');
    if (usedBudgetEl) {
        usedBudgetEl.textContent = formatAmount(projectTotal);
    }
    
    // Mettre à jour l'écart budgétaire
    const initialBudgetEl = document.getElementById('initialBudget');
    const budgetGapEl = document.getElementById('budgetGap');
    
    if (initialBudgetEl && budgetGapEl) {
        const initialBudget = parseFloat(initialBudgetEl.textContent.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
        const budgetGap = initialBudget - projectTotal;
        
        budgetGapEl.textContent = formatAmount(Math.abs(budgetGap));
        
        // Appliquer la couleur selon que l'écart est positif ou négatif
        if (budgetGap >= 0) {
            budgetGapEl.classList.add('text-green-600');
            budgetGapEl.classList.remove('text-red-600');
        } else {
            budgetGapEl.classList.add('text-red-600');
            budgetGapEl.classList.remove('text-green-600');
        }
    }
    
    // Mettre à jour la barre de progression
    const initialBudget = parseFloat(document.getElementById('initialBudget').textContent.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
    const percentage = initialBudget > 0 ? Math.min(Math.round((projectTotal / initialBudget) * 100), 100) : 0;
    
    document.getElementById('budgetPercentage').textContent = percentage + '%';
    document.getElementById('progressBar').style.width = percentage + '%';
    
    // Changer la couleur de la barre selon le pourcentage
    const progressBar = document.getElementById('progressBar');
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
    
    console.log(`✅ Recalcul terminé : total = ${projectTotal}`);
    
    return projectTotal;
}

/**
 * Sauvegarde les modifications apportées au projet
 */
function saveProjectChanges() {
    // Récupérer l'ID du projet en cours d'édition
    const projectId = localStorage.getItem('viewProjectId');
    if (!projectId) {
        console.error('Aucun ID de projet trouvé dans le localStorage');
        return;
    }
    
    // Charger tous les projets
    const projects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
    const projectIndex = projects.findIndex(p => p.id === projectId);
    
    if (projectIndex === -1) {
        console.error('Projet non trouvé:', projectId);
        return;
    }
    
    // Récupérer le projet existant
    const project = projects[projectIndex];
    
    // Mettre à jour le nom du projet (si modifiable)
    const projectTitleEl = document.getElementById('projectTitle');
    if (projectTitleEl) {
        project.projectName = projectTitleEl.textContent || project.projectName;
    }
    
    // Collecter toutes les catégories avec leurs sous-catégories et lignes de dépenses
    const newCategories = [];
    
    document.querySelectorAll('.category').forEach(categoryEl => {
        const categoryId = categoryEl.dataset.id;
        const categoryName = categoryEl.querySelector('.category-name');
        const categoryNameText = categoryName.tagName === 'INPUT' ? categoryName.value : categoryName.textContent;
        
        // Obtenir le montant depuis le texte affiché (il a déjà été recalculé)
        const categoryAmountEl = categoryEl.querySelector('.category-amount');
        const categoryAmountText = categoryAmountEl.textContent;
        
        // Créer la nouvelle catégorie
        const newCategory = {
            id: categoryId,
            name: categoryNameText,
            amount: categoryAmountText,
            subcategories: []
        };
        
        // Collecter les sous-catégories
        categoryEl.querySelectorAll('.subcategory').forEach(subcatEl => {
            const subcatId = subcatEl.dataset.id;
            const subcatName = subcatEl.querySelector('.subcategory-name');
            const subcatNameText = subcatName.tagName === 'INPUT' ? subcatName.value : subcatName.textContent;
            
            // Obtenir le montant depuis le texte affiché
            const subcatAmountEl = subcatEl.querySelector('.subcategory-amount');
            const subcatAmountText = subcatAmountEl.textContent;
            
            // Créer la nouvelle sous-catégorie
            const newSubcategory = {
                id: subcatId,
                name: subcatNameText,
                amount: subcatAmountText,
                lines: []
            };
            
            // Collecter les lignes de dépenses
            subcatEl.querySelectorAll('.expense-line').forEach(lineEl => {
                const lineId = lineEl.dataset.id;
                const lineName = lineEl.querySelector('.expense-name');
                const lineNameText = lineName.tagName === 'INPUT' ? lineName.value : lineName.textContent;
                
                // Obtenir le montant depuis l'input ou le texte affiché
                const lineAmountEl = lineEl.querySelector('.expense-amount');
                let lineAmountValue;
                
                if (lineAmountEl.tagName === 'INPUT') {
                    lineAmountValue = formatAmount(parseFloat(lineAmountEl.value) || 0);
                } else {
                    lineAmountValue = lineAmountEl.textContent;
                }
                
                // Ajouter la ligne à la sous-catégorie
                newSubcategory.lines.push({
                    id: lineId,
                    name: lineNameText,
                    amount: lineAmountValue
                });
            });
            
            // Ajouter la sous-catégorie à la catégorie
            newCategory.subcategories.push(newSubcategory);
        });
        
        // Ajouter la catégorie à la liste
        newCategories.push(newCategory);
    });
    
    // Mettre à jour le projet avec les nouvelles catégories
    project.categories = newCategories;
    
    // Mettre à jour le budget total du projet
    const usedBudgetEl = document.getElementById('usedBudget');
    if (usedBudgetEl) {
        project.totalBudget = usedBudgetEl.textContent;
    }
    
    // Sauvegarder le projet mis à jour
    projects[projectIndex] = project;
    localStorage.setItem('savedProjects', JSON.stringify(projects));
    
    // Sortir du mode édition
    toggleEditMode();
    
    // Afficher une notification de succès
    showNotification('Projet sauvegardé avec succès');
    
    console.log('Projet sauvegardé:', project);
}

/**
 * Affiche une notification
 */
function showNotification(message) {
    // Vérifier si un élément de notification existe déjà
    let notificationEl = document.getElementById('notification');
    
    // Si non, le créer
    if (!notificationEl) {
        notificationEl = document.createElement('div');
        notificationEl.id = 'notification';
        notificationEl.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-xl shadow-lg opacity-0 transition-opacity duration-300';
        document.body.appendChild(notificationEl);
    }
    
    // Mettre à jour le message et afficher la notification
    notificationEl.textContent = message;
    notificationEl.classList.remove('opacity-0');
    notificationEl.classList.add('opacity-100');
    
    // Masquer la notification après quelques secondes
    setTimeout(() => {
        notificationEl.classList.remove('opacity-100');
        notificationEl.classList.add('opacity-0');
    }, 3000);
}

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