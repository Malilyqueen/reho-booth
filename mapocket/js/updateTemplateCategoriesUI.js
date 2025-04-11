/**
 * Fonction pour mettre à jour l'interface utilisateur des catégories basées sur le template sélectionné
 * Cette fonction est temporaire et sera remplacée par le nouveau système modulaire
 */
function updateTemplateCategoriesUI(template) {
    console.log("Initialisation du gestionnaire de template UI");
    
    // Nettoyer le conteneur des catégories de dépenses existantes
    const categoriesContainer = document.getElementById('expenseCategories');
    if (!categoriesContainer) {
        console.error("Conteneur de catégories non trouvé");
        return;
    }
    
    categoriesContainer.innerHTML = '';
    
    // Obtenir les catégories basées sur le template sélectionné
    let templateCategories = getTemplateCategories(template);
    
    // Ajouter chaque catégorie au conteneur
    templateCategories.forEach(function(category) {
        const categoryElement = createCategoryElement(category);
        categoriesContainer.appendChild(categoryElement);
    });
    
    // Mettre à jour le total du budget
    setTimeout(recalculateAllAmounts, 100);
    
    // Attacher les écouteurs d'événements pour les éléments interactifs
    attachInteractiveEvents();
}

// Fonction pour créer un élément de catégorie avec ses sous-catégories et lignes
function createCategoryElement(category) {
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'expense-category';
    categoryDiv.setAttribute('data-category', category.name);
    
    const categoryHeader = document.createElement('div');
    categoryHeader.className = 'category-header';
    
    const categoryIcon = document.createElement('span');
    categoryIcon.className = 'category-icon';
    categoryIcon.textContent = category.icon || '📊';
    
    const categoryName = document.createElement('span');
    categoryName.className = 'category-name';
    categoryName.textContent = category.name;
    categoryName.contentEditable = 'true';
    
    const categoryAmount = document.createElement('span');
    categoryAmount.className = 'category-amount';
    categoryAmount.textContent = formatCurrency(category.amount || 0);
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-category-btn';
    deleteBtn.innerHTML = '🗑️';
    deleteBtn.setAttribute('title', 'Supprimer cette catégorie');
    
    categoryHeader.appendChild(categoryIcon);
    categoryHeader.appendChild(categoryName);
    categoryHeader.appendChild(categoryAmount);
    categoryHeader.appendChild(deleteBtn);
    
    categoryDiv.appendChild(categoryHeader);
    
    // Ajouter les sous-catégories
    const subcategoriesContainer = document.createElement('div');
    subcategoriesContainer.className = 'subcategories-container';
    
    if (category.subcategories && category.subcategories.length > 0) {
        category.subcategories.forEach(function(subcategory) {
            const subcategoryElement = createSubcategoryElement(subcategory);
            subcategoriesContainer.appendChild(subcategoryElement);
        });
    }
    
    // Bouton pour ajouter une nouvelle sous-catégorie
    const addSubcategoryBtn = document.createElement('button');
    addSubcategoryBtn.className = 'add-subcategory-btn';
    addSubcategoryBtn.textContent = '+ Ajouter une sous-catégorie';
    
    categoryDiv.appendChild(subcategoriesContainer);
    categoryDiv.appendChild(addSubcategoryBtn);
    
    return categoryDiv;
}

// Fonction pour créer un élément de sous-catégorie avec ses lignes de dépense
function createSubcategoryElement(subcategory) {
    const subcategoryDiv = document.createElement('div');
    subcategoryDiv.className = 'subcategory';
    
    const subcategoryHeader = document.createElement('div');
    subcategoryHeader.className = 'subcategory-header';
    
    const subcategoryName = document.createElement('span');
    subcategoryName.className = 'subcategory-name';
    subcategoryName.textContent = subcategory.name;
    subcategoryName.contentEditable = 'true';
    
    const subcategoryAmount = document.createElement('span');
    subcategoryAmount.className = 'subcategory-amount';
    subcategoryAmount.textContent = formatCurrency(subcategory.amount || 0);
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-subcategory-btn';
    deleteBtn.innerHTML = '🗑️';
    deleteBtn.setAttribute('title', 'Supprimer cette sous-catégorie');
    
    subcategoryHeader.appendChild(subcategoryName);
    subcategoryHeader.appendChild(subcategoryAmount);
    subcategoryHeader.appendChild(deleteBtn);
    
    subcategoryDiv.appendChild(subcategoryHeader);
    
    // Ajouter les lignes de dépense
    const expenseLinesContainer = document.createElement('div');
    expenseLinesContainer.className = 'expense-lines-container';
    
    if (subcategory.lines && subcategory.lines.length > 0) {
        subcategory.lines.forEach(function(line) {
            const lineElement = createExpenseLineElement(line);
            expenseLinesContainer.appendChild(lineElement);
        });
    }
    
    // Bouton pour ajouter une nouvelle ligne
    const addLineBtn = document.createElement('button');
    addLineBtn.className = 'add-line-btn';
    addLineBtn.textContent = '+ Ajouter une ligne';
    
    subcategoryDiv.appendChild(expenseLinesContainer);
    subcategoryDiv.appendChild(addLineBtn);
    
    return subcategoryDiv;
}

// Fonction pour créer un élément de ligne de dépense
function createExpenseLineElement(line) {
    const lineDiv = document.createElement('div');
    lineDiv.className = 'expense-line';
    
    const lineName = document.createElement('input');
    lineName.type = 'text';
    lineName.className = 'line-name';
    lineName.value = line.name || '';
    
    const lineAmount = document.createElement('input');
    lineAmount.type = 'number';
    lineAmount.className = 'line-amount';
    lineAmount.value = parseFloat(line.amount) || 0;
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-line';
    deleteBtn.innerHTML = '🗑️';
    deleteBtn.setAttribute('title', 'Supprimer cette ligne');
    
    lineDiv.appendChild(lineName);
    lineDiv.appendChild(lineAmount);
    lineDiv.appendChild(deleteBtn);
    
    return lineDiv;
}

// Fonction pour attacher les écouteurs d'événements aux éléments interactifs
function attachInteractiveEvents() {
    // Écouteurs pour les boutons d'ajout de sous-catégorie
    document.querySelectorAll('.add-subcategory-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const categoryDiv = btn.closest('.expense-category');
            const subcategoriesContainer = categoryDiv.querySelector('.subcategories-container');
            
            const newSubcategory = {
                name: 'Nouvelle sous-catégorie',
                amount: 0,
                lines: []
            };
            
            const subcategoryElement = createSubcategoryElement(newSubcategory);
            subcategoriesContainer.appendChild(subcategoryElement);
            
            // Réattacher les écouteurs d'événements pour le nouvel élément
            attachInteractiveEvents();
            
            // Recalculer les montants
            setTimeout(recalculateAllAmounts, 100);
        });
    });
    
    // Écouteurs pour les boutons d'ajout de ligne
    document.querySelectorAll('.add-line-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const subcategoryDiv = btn.closest('.subcategory');
            const linesContainer = subcategoryDiv.querySelector('.expense-lines-container');
            
            const newLine = {
                name: 'Nouvelle ligne',
                amount: 0
            };
            
            const lineElement = createExpenseLineElement(newLine);
            linesContainer.appendChild(lineElement);
            
            // Réattacher les écouteurs d'événements pour le nouvel élément
            attachInteractiveEvents();
            
            // Recalculer les montants
            setTimeout(recalculateAllAmounts, 100);
        });
    });
    
    // Écouteurs pour les boutons de suppression de catégorie
    document.querySelectorAll('.delete-category-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const categoryDiv = btn.closest('.expense-category');
            categoryDiv.remove();
            
            // Recalculer les montants
            setTimeout(recalculateAllAmounts, 100);
        });
    });
    
    // Écouteurs pour les boutons de suppression de sous-catégorie
    document.querySelectorAll('.delete-subcategory-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const subcategoryDiv = btn.closest('.subcategory');
            subcategoryDiv.remove();
            
            // Recalculer les montants
            setTimeout(recalculateAllAmounts, 100);
        });
    });
    
    // Écouteurs pour les boutons de suppression de ligne
    document.querySelectorAll('.delete-line').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const lineDiv = btn.closest('.expense-line');
            lineDiv.remove();
            
            // Recalculer les montants
            setTimeout(recalculateAllAmounts, 100);
        });
    });
    
    // Écouteurs pour les changements de montant dans les lignes
    document.querySelectorAll('.line-amount').forEach(function(input) {
        input.addEventListener('input', function() {
            setTimeout(recalculateAllAmounts, 0);
        });
        
        input.addEventListener('blur', function() {
            setTimeout(recalculateAllAmounts, 0);
        });
    });
}

// Fonction pour obtenir les catégories basées sur le template
function getTemplateCategories(template) {
    // Définition des templates disponibles
    const templates = {
        'Anniversaire': [
            {
                name: 'Restauration',
                icon: '🍽️',
                amount: 0,
                subcategories: [
                    {
                        name: 'Traiteur',
                        amount: 0,
                        lines: [
                            { name: 'Menu principal', amount: 0 },
                            { name: 'Desserts', amount: 0 }
                        ]
                    },
                    {
                        name: 'Boissons',
                        amount: 0,
                        lines: [
                            { name: 'Soft drinks', amount: 0 },
                            { name: 'Alcool', amount: 0 }
                        ]
                    }
                ]
            },
            {
                name: 'Animation',
                icon: '🎵',
                amount: 0,
                subcategories: [
                    {
                        name: 'DJ',
                        amount: 0,
                        lines: [
                            { name: 'DJ forfait soirée', amount: 0 }
                        ]
                    },
                    {
                        name: 'Jeux',
                        amount: 0,
                        lines: [
                            { name: 'Matériel de jeux', amount: 0 }
                        ]
                    }
                ]
            }
        ],
        'Mariage': [
            {
                name: 'Cérémonie',
                icon: '💍',
                amount: 0,
                subcategories: [
                    {
                        name: 'Lieu',
                        amount: 0,
                        lines: [
                            { name: 'Location', amount: 0 },
                            { name: 'Décoration', amount: 0 }
                        ]
                    },
                    {
                        name: 'Officiant',
                        amount: 0,
                        lines: [
                            { name: 'Honoraires', amount: 0 }
                        ]
                    }
                ]
            },
            {
                name: 'Réception',
                icon: '🎉',
                amount: 0,
                subcategories: [
                    {
                        name: 'Salle',
                        amount: 0,
                        lines: [
                            { name: 'Location', amount: 0 },
                            { name: 'Décoration', amount: 0 }
                        ]
                    },
                    {
                        name: 'Traiteur',
                        amount: 0,
                        lines: [
                            { name: 'Repas', amount: 0 },
                            { name: 'Gâteau', amount: 0 },
                            { name: 'Boissons', amount: 0 }
                        ]
                    },
                    {
                        name: 'Animation',
                        amount: 0,
                        lines: [
                            { name: 'DJ', amount: 0 },
                            { name: 'Groupe', amount: 0 }
                        ]
                    }
                ]
            },
            {
                name: 'Tenues',
                icon: '👰',
                amount: 0,
                subcategories: [
                    {
                        name: 'Mariée',
                        amount: 0,
                        lines: [
                            { name: 'Robe', amount: 0 },
                            { name: 'Accessoires', amount: 0 }
                        ]
                    },
                    {
                        name: 'Marié',
                        amount: 0,
                        lines: [
                            { name: 'Costume', amount: 0 },
                            { name: 'Accessoires', amount: 0 }
                        ]
                    }
                ]
            }
        ],
        'Voyage': [
            {
                name: 'Transport',
                icon: '✈️',
                amount: 0,
                subcategories: [
                    {
                        name: 'Aller',
                        amount: 0,
                        lines: [
                            { name: 'Billets', amount: 0 }
                        ]
                    },
                    {
                        name: 'Retour',
                        amount: 0,
                        lines: [
                            { name: 'Billets', amount: 0 }
                        ]
                    },
                    {
                        name: 'Sur place',
                        amount: 0,
                        lines: [
                            { name: 'Transports locaux', amount: 0 },
                            { name: 'Location de véhicule', amount: 0 }
                        ]
                    }
                ]
            },
            {
                name: 'Hébergement',
                icon: '🏨',
                amount: 0,
                subcategories: [
                    {
                        name: 'Hôtels',
                        amount: 0,
                        lines: [
                            { name: 'Chambres', amount: 0 }
                        ]
                    },
                    {
                        name: 'Locations',
                        amount: 0,
                        lines: [
                            { name: 'Appartements', amount: 0 }
                        ]
                    }
                ]
            },
            {
                name: 'Activités',
                icon: '🏄‍♂️',
                amount: 0,
                subcategories: [
                    {
                        name: 'Excursions',
                        amount: 0,
                        lines: [
                            { name: 'Visites guidées', amount: 0 }
                        ]
                    },
                    {
                        name: 'Loisirs',
                        amount: 0,
                        lines: [
                            { name: 'Sports', amount: 0 },
                            { name: 'Attractions', amount: 0 }
                        ]
                    }
                ]
            },
            {
                name: 'Restauration',
                icon: '🍴',
                amount: 0,
                subcategories: [
                    {
                        name: 'Restaurants',
                        amount: 0,
                        lines: [
                            { name: 'Repas', amount: 0 }
                        ]
                    },
                    {
                        name: 'Divers',
                        amount: 0,
                        lines: [
                            { name: 'Snacks', amount: 0 },
                            { name: 'Boissons', amount: 0 }
                        ]
                    }
                ]
            }
        ],
        'Personnalisé': [
            {
                name: 'Catégorie 1',
                icon: '📊',
                amount: 0,
                subcategories: [
                    {
                        name: 'Sous-catégorie 1',
                        amount: 0,
                        lines: [
                            { name: 'Ligne 1', amount: 0 }
                        ]
                    }
                ]
            }
        ],
        'Empty': []
    };
    
    return templates[template] || templates['Empty'];
}

// Utilitaire pour formater les montants en devise
function formatCurrency(amount) {
    if (typeof amount === 'string') {
        // Tenter d'extraire la valeur numérique si c'est une chaîne
        amount = parseFloat(amount.replace(/[^\d.-]/g, '')) || 0;
    }
    
    // Utiliser la devise préférée de l'utilisateur si disponible
    let symbol = '€';
    
    if (window.PreferencesManager && window.PreferencesManager.getCurrentCurrencySymbol) {
        symbol = PreferencesManager.getCurrentCurrencySymbol();
    }
    
    // Format: symbole suivi du montant avec 2 décimales
    return `${symbol} ${amount.toFixed(2).replace(".", ",")}`;
}