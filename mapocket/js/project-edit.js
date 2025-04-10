// Fonctions spécifiques à l'édition de projet

// Fonction pour obtenir le symbole de la devise actuelle du projet
function getProjectCurrencySymbol() {
    let currencySymbol = '€';
    try {
        if (typeof getCurrencySymbol === 'function') {
            // Utiliser la fonction du helper si disponible
            currencySymbol = getCurrencySymbol();
        } else {
            // Fallback si le helper n'est pas chargé
            const preferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
            if (preferences.currency && typeof AVAILABLE_CURRENCIES !== 'undefined') {
                const currency = AVAILABLE_CURRENCIES.find(c => c.code === preferences.currency);
                if (currency) {
                    currencySymbol = currency.symbol;
                }
            }
        }
    } catch (error) {
        console.error('Erreur lors de la récupération du symbole de devise:', error);
    }
    return currencySymbol;
}

// Fonction pour obtenir le code de la devise actuelle
function getProjectCurrencyCode() {
    let currencyCode = 'EUR';
    try {
        if (typeof getCurrencyCode === 'function') {
            // Utiliser la fonction du helper si disponible
            currencyCode = getCurrencyCode();
        } else {
            // Fallback si le helper n'est pas chargé
            const preferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
            if (preferences.currency) {
                currencyCode = preferences.currency;
            }
        }
    } catch (error) {
        console.error('Erreur lors de la récupération du code de devise:', error);
    }
    return currencyCode;
}

// Fonction pour convertir une valeur monétaire en nombre
function parseMonetaryValue(monetaryString) {
    if (!monetaryString) return 0;
    
    // Supprimer le symbole de devise et les espaces
    const cleanedString = monetaryString.toString().replace(/[^0-9.,]/g, '');
    
    // Remplacer la virgule par un point si nécessaire (format français)
    const normalizedString = cleanedString.replace(',', '.');
    
    // Convertir en nombre
    const value = parseFloat(normalizedString);
    
    // Retourner 0 si la valeur n'est pas un nombre
    return isNaN(value) ? 0 : value;
}

// Fonction pour mettre à jour les calculs de budget total
function updateBudgetCalculation() {
    // Obtenir toutes les catégories
    const categories = document.querySelectorAll('.expense-category');
    const currencySymbol = getProjectCurrencySymbol();
    
    // Pour chaque catégorie
    categories.forEach(category => {
        let categoryTotal = 0;
        
        // Obtenir toutes les sous-catégories de cette catégorie
        const subcategories = category.querySelectorAll('.subcategory');
        
        // Pour chaque sous-catégorie
        subcategories.forEach(subcategory => {
            let subcategoryTotal = 0;
            
            // Obtenir toutes les lignes de dépense de cette sous-catégorie
            const expenseLines = subcategory.querySelectorAll('.expense-line');
            
            // Pour chaque ligne de dépense
            expenseLines.forEach(line => {
                // Obtenir le montant
                const amountElement = line.querySelector('.expense-line-amount');
                if (amountElement) {
                    const amount = parseMonetaryValue(amountElement.textContent);
                    subcategoryTotal += amount;
                }
            });
            
            // Mettre à jour le montant total de la sous-catégorie
            const subcategoryAmount = subcategory.querySelector('.subcategory-amount');
            if (subcategoryAmount) {
                subcategoryAmount.textContent = `${currencySymbol} ${subcategoryTotal.toFixed(2)}`;
            }
            
            // Ajouter au total de la catégorie
            categoryTotal += subcategoryTotal;
        });
        
        // Mettre à jour le montant total de la catégorie
        const categoryAmount = category.querySelector('.category-amount');
        if (categoryAmount) {
            categoryAmount.textContent = `${currencySymbol} ${categoryTotal.toFixed(2)}`;
        }
    });
    
    // Calculer le budget total
    let totalBudget = 0;
    categories.forEach(category => {
        const categoryAmount = category.querySelector('.category-amount');
        if (categoryAmount) {
            const amount = parseMonetaryValue(categoryAmount.textContent);
            totalBudget += amount;
        }
    });
    
    // Mettre à jour le budget total
    const totalBudgetElement = document.getElementById('totalBudget');
    if (totalBudgetElement) {
        totalBudgetElement.value = `${currencySymbol} ${totalBudget.toFixed(2)}`;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Vérifier si nous sommes en mode édition
    const urlParams = new URLSearchParams(window.location.search);
    const editMode = urlParams.get('edit') === 'true';
    
    // Obtenir l'ID du projet soit depuis l'URL, soit depuis localStorage
    let projectId = urlParams.get('id');
    
    // Détection du mode et de l'ID du projet
    console.log("Mode détecté:", editMode ? "Édition" : "Création", "Projet ID:", projectId);
    
    if (!projectId && editMode) {
        // Si on est en mode édition mais sans ID dans l'URL, vérifier si on a un projet en cours d'édition
        const currentProject = localStorage.getItem('currentProject');
        if (currentProject) {
            try {
                const projectData = JSON.parse(currentProject);
                if (projectData && projectData.id) {
                    projectId = projectData.id;
                    console.log("ID de projet récupéré depuis localStorage:", projectId);
                }
            } catch (error) {
                console.error("Erreur lors de la récupération du projet en cours:", error);
            }
        }
    }
    
    // Configurer les interactions de base communes à la création et à l'édition
    setupTemplateSelectionEvents();
    setupBudgetCalculation();
    
    // Configurer les dates (par défaut et validation)
    setupDateFields();
    
    if (editMode) {
        if (projectId) {
            // Activer le mode édition avec l'ID du projet
            enableEditMode(projectId);
        } else {
            // Si nous sommes en mode édition mais sans ID, afficher un message d'erreur
            console.error("L'ID du projet est manquant pour le mode édition");
            alert("Erreur: Aucun projet sélectionné pour l'édition");
            window.location.href = 'index.html';
        }
    } else {
        // Si nous ne sommes pas en mode édition, on est en mode création de projet
        console.log("Mode création de projet");
        
        // S'assurer que le titre de la page est bien "NOUVEAU PROJET"
        const pageTitle = document.querySelector('.page-title');
        if (pageTitle) {
            pageTitle.textContent = 'NOUVEAU PROJET';
        }
        
        // Mise à jour du budget total avec la devise actuelle
        const totalBudgetInput = document.getElementById('totalBudget');
        if (totalBudgetInput) {
            const currencySymbol = getProjectCurrencySymbol();
            console.log("Mise à jour du budget total avec la devise:", getProjectCurrencyCode(), currencySymbol);
            totalBudgetInput.value = `${currencySymbol} 0.00`;
        }
    }
    
    // Configurer les boutons d'interaction pour l'édition des éléments
    setupAddLineButtons();
    setupAddSubcategoryButtons();
    setupAddCategoryButton();
});

// Fonction pour configurer les événements de sélection de template
function setupTemplateSelectionEvents() {
    // Sélectionner tous les éléments de sélection de modèle
    const templateOptions = document.querySelectorAll('.template-option');
    
    templateOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Désélectionner toutes les options
            templateOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Sélectionner cette option
            this.classList.add('selected');
            
            // Mettre à jour le type de projet
            const templateType = this.getAttribute('data-template');
            const projectTypeElement = document.querySelector('.project-type');
            if (projectTypeElement) {
                projectTypeElement.textContent = templateType;
            }
            
            // Mettre à jour les catégories selon le template
            updateTemplateCategories(templateType);
        });
    });
}

// Fonction pour configurer les champs de date
function setupDateFields() {
    // Date du projet
    const projectDateInput = document.getElementById('projectDate');
    if (projectDateInput) {
        // Formater la date selon les préférences utilisateur
        const userPreferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
        const dateFormat = userPreferences.dateFormat || 'DD/MM/YYYY';
        
        // Si la date n'est pas déjà définie, définir la date actuelle
        if (!projectDateInput.value) {
            const today = new Date();
            const day = String(today.getDate()).padStart(2, '0');
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const year = today.getFullYear();
            
            if (dateFormat === 'DD/MM/YYYY') {
                projectDateInput.value = `${day}/${month}/${year}`;
            } else if (dateFormat === 'MM/DD/YYYY') {
                projectDateInput.value = `${month}/${day}/${year}`;
            } else {
                projectDateInput.value = `${year}-${month}-${day}`;
            }
        }
    }
    
    // Idem pour la date de fin si elle existe
    const projectEndDateInput = document.getElementById('projectEndDate');
    if (projectEndDateInput && !projectEndDateInput.value) {
        // Ajouter 30 jours à la date actuelle
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 30);
        
        const day = String(futureDate.getDate()).padStart(2, '0');
        const month = String(futureDate.getMonth() + 1).padStart(2, '0');
        const year = futureDate.getFullYear();
        
        const userPreferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
        const dateFormat = userPreferences.dateFormat || 'DD/MM/YYYY';
        
        if (dateFormat === 'DD/MM/YYYY') {
            projectEndDateInput.value = `${day}/${month}/${year}`;
        } else if (dateFormat === 'MM/DD/YYYY') {
            projectEndDateInput.value = `${month}/${day}/${year}`;
        } else {
            projectEndDateInput.value = `${year}-${month}-${day}`;
        }
    }
}

// Fonction pour configurer le calcul de budget
function setupBudgetCalculation() {
    // Mettre à jour les calculs lorsque les champs sont modifiés
    document.addEventListener('change', function(event) {
        if (event.target.classList.contains('expense-line-amount')) {
            updateBudgetCalculation();
        }
    });
}

// Fonction pour mettre à jour les catégories selon le template choisi
function updateTemplateCategories(templateType) {
    console.log('Mise à jour des catégories pour le template:', templateType);
    
    // Récupérer les préférences utilisateur pour obtenir la devise
    let userPreferences = {
        currency: 'EUR', // Devise par défaut
    };
    
    try {
        const savedPrefs = localStorage.getItem('userPreferences');
        if (savedPrefs) {
            userPreferences = JSON.parse(savedPrefs);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des préférences utilisateur:', error);
    }
    
    // Obtenir le symbole de la devise
    let currencySymbol = getProjectCurrencySymbol();
    let currencyCode = getProjectCurrencyCode();
    
    console.log('Mise à jour des catégories avec la devise:', currencyCode, currencySymbol);
    
    // Fonction utilitaire pour remplacer les symboles € dans les données de template
    const replaceEuroSymbol = (obj) => {
        if (obj && typeof obj === 'object') {
            Object.keys(obj).forEach(key => {
                if (key === 'amount' && typeof obj[key] === 'string') {
                    // Remplacer le symbole € par le symbole de la devise active
                    obj[key] = obj[key].replace(/€/g, currencySymbol);
                } else if (typeof obj[key] === 'object') {
                    // Récursion pour les objets imbriqués
                    replaceEuroSymbol(obj[key]);
                } else if (Array.isArray(obj[key])) {
                    // Récursion pour les tableaux
                    obj[key].forEach(item => replaceEuroSymbol(item));
                }
            });
        }
    };
    
    // Utiliser les données de template par défaut si elles existent
    if (typeof defaultBudgets !== 'undefined' && defaultBudgets[templateType]) {
        console.log('Données template trouvées pour:', templateType);
        
        // Copie profonde pour ne pas modifier l'original
        const categoriesData = JSON.parse(JSON.stringify(defaultBudgets[templateType].categories));
        
        // Remplacer les symboles € par le symbole de devise choisi
        categoriesData.forEach(category => {
            replaceEuroSymbol(category);
        });
        
        // Mise à jour de l'interface utilisateur avec les nouvelles catégories
        updateCategoriesUI(categoriesData, currencySymbol);
        return;
    }
    
    // Si le fichier defaultBudgets n'est pas chargé, utiliser les templates intégrés ici
    let categoriesData = [];
    
    // Définir les catégories et sous-catégories en fonction du modèle choisi
    switch(templateType) {
        case 'Mariage':
            categoriesData = [
                {
                    name: 'Lieu',
                    subcategories: [
                        {
                            name: 'Location de salle',
                            lines: [
                                { name: 'Réservation', amount: `${currencySymbol} 3000.00` },
                                { name: 'Décoration', amount: `${currencySymbol} 800.00` }
                            ]
                        },
                        {
                            name: 'Cérémonie',
                            lines: [
                                { name: 'Forfait cérémonie', amount: `${currencySymbol} 500.00` },
                                { name: 'Fleurs', amount: `${currencySymbol} 400.00` }
                            ]
                        }
                    ]
                },
                {
                    name: 'Restauration',
                    subcategories: [
                        {
                            name: 'Traiteur',
                            lines: [
                                { name: 'Menu principal', amount: `${currencySymbol} 4000.00` },
                                { name: 'Pièce montée', amount: `${currencySymbol} 600.00` }
                            ]
                        },
                        {
                            name: 'Boissons',
                            lines: [
                                { name: 'Vin', amount: `${currencySymbol} 800.00` },
                                { name: 'Champagne', amount: `${currencySymbol} 1000.00` },
                                { name: 'Autres boissons', amount: `${currencySymbol} 300.00` }
                            ]
                        }
                    ]
                },
                {
                    name: 'Prestataires',
                    subcategories: [
                        {
                            name: 'Musique',
                            lines: [
                                { name: 'DJ', amount: `${currencySymbol} 800.00` },
                                { name: 'Musiciens cérémonie', amount: `${currencySymbol} 500.00` }
                            ]
                        },
                        {
                            name: 'Photo/Vidéo',
                            lines: [
                                { name: 'Photographe', amount: `${currencySymbol} 1200.00` },
                                { name: 'Vidéaste', amount: `${currencySymbol} 1000.00` }
                            ]
                        }
                    ]
                }
            ];
            break;
            
        case 'Anniversaire':
            categoriesData = [
                {
                    name: 'Restauration',
                    subcategories: [
                        {
                            name: 'Traiteur',
                            lines: [
                                { name: 'Menu principal', amount: `${currencySymbol} 300.00` },
                                { name: 'Desserts', amount: `${currencySymbol} 100.00` }
                            ]
                        },
                        {
                            name: 'Boissons',
                            lines: [
                                { name: 'Soft drinks', amount: `${currencySymbol} 100.00` },
                                { name: 'Alcool', amount: `${currencySymbol} 100.00` }
                            ]
                        }
                    ]
                },
                {
                    name: 'Animation',
                    subcategories: [
                        {
                            name: 'DJ',
                            lines: [
                                { name: 'DJ forfait soirée', amount: `${currencySymbol} 300.00` }
                            ]
                        },
                        {
                            name: 'Jeux',
                            lines: [
                                { name: 'Matériel de jeux', amount: `${currencySymbol} 100.00` }
                            ]
                        }
                    ]
                }
            ];
            break;
            
        // Ajoutez d'autres modèles ici selon vos besoins
        default:
            // Modèle générique si aucun modèle spécifique n'est trouvé
            categoriesData = [
                {
                    name: 'Catégorie 1',
                    subcategories: [
                        {
                            name: 'Sous-catégorie 1',
                            lines: [
                                { name: 'Ligne de dépense 1', amount: `${currencySymbol} 100.00` },
                                { name: 'Ligne de dépense 2', amount: `${currencySymbol} 200.00` }
                            ]
                        }
                    ]
                },
                {
                    name: 'Catégorie 2',
                    subcategories: [
                        {
                            name: 'Sous-catégorie 1',
                            lines: [
                                { name: 'Ligne de dépense 1', amount: `${currencySymbol} 150.00` },
                                { name: 'Ligne de dépense 2', amount: `${currencySymbol} 250.00` }
                            ]
                        }
                    ]
                }
            ];
    }
    
    // Mise à jour de l'interface utilisateur avec les nouvelles catégories
    updateCategoriesUI(categoriesData, currencySymbol);
}

// Fonction pour mettre à jour l'interface utilisateur avec les catégories du template
function updateCategoriesUI(categoriesData, currencySymbol) {
    // Vider le conteneur existant
    const categoriesContainer = document.getElementById('expenseCategories');
    if (!categoriesContainer) return;
    
    categoriesContainer.innerHTML = '';
    
    // Créer les nouvelles catégories et sous-catégories
    categoriesData.forEach(categoryData => {
        // Créer la catégorie principale
        const category = document.createElement('div');
        category.className = 'expense-category';
        
        // Préparer le HTML de l'en-tête de catégorie
        let categoryHTML = `
            <div class="category-header">
                <h4 class="category-name editable-field">${categoryData.name}</h4>
                <span class="category-amount">${currencySymbol} 0.00</span>
                <div class="category-controls">
                    <button type="button" class="category-toggle open">
                        <i class="fas fa-chevron-up"></i>
                    </button>
                    <button type="button" class="delete-category-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="subcategories-container open">
        `;
        
        // Ajouter les sous-catégories
        if (categoryData.subcategories && categoryData.subcategories.length > 0) {
            categoryData.subcategories.forEach(subcategoryData => {
                // Ajouter l'HTML de la sous-catégorie
                categoryHTML += `
                    <div class="subcategory">
                        <div class="subcategory-header">
                            <h5 class="subcategory-name editable-field">${subcategoryData.name}</h5>
                            <span class="subcategory-amount editable-field">${currencySymbol} 0.00</span>
                        </div>
                        <div class="subcategory-actions">
                            <button type="button" class="add-expense-line-btn">
                                <i class="fas fa-plus"></i> Ajouter ligne
                            </button>
                            <button type="button" class="delete-subcategory-btn">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                        <div class="expense-lines">
                `;
                
                // Ajouter les lignes de dépenses
                if (subcategoryData.lines && subcategoryData.lines.length > 0) {
                    subcategoryData.lines.forEach(line => {
                        categoryHTML += `
                            <div class="expense-line">
                                <span class="expense-line-name editable-field">${line.name}</span>
                                <span class="expense-line-amount editable-field">${line.amount}</span>
                                <button type="button" class="delete-line-btn">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        `;
                    });
                }
                
                categoryHTML += `
                        </div>
                    </div>
                `;
            });
        }
        
        // Ajouter le footer pour pouvoir ajouter des sous-catégories
        categoryHTML += `
            <div class="subcategory-footer">
                <button type="button" class="add-subcategory-btn">
                    <i class="fas fa-plus"></i> Ajouter une sous-catégorie
                </button>
            </div>
        </div>
        `;
        
        // Définir le HTML de la catégorie
        category.innerHTML = categoryHTML;
        
        // Ajouter la catégorie au conteneur
        categoriesContainer.appendChild(category);
    });
    
    // Ajouter le conteneur pour le bouton d'ajout de catégorie principale
    const addCategoryContainer = document.createElement('div');
    addCategoryContainer.className = 'add-category-container';
    
    const addCategoryBtn = document.createElement('button');
    addCategoryBtn.type = 'button';
    addCategoryBtn.id = 'addMainCategoryBtn';
    addCategoryBtn.className = 'add-category-btn';
    addCategoryBtn.innerHTML = '<i class="fas fa-plus"></i> Ajouter une catégorie';
    
    addCategoryContainer.appendChild(addCategoryBtn);
    categoriesContainer.appendChild(addCategoryContainer);
    
    // Configuration des événements d'édition
    setupEditableFields();
    setupAddLineButtons();
    setupAddSubcategoryButtons();
    setupAddCategoryButton();
    
    // Mise à jour des calculs de budget
    updateBudgetCalculation();
}

// Fonction pour configurer les champs éditables
function setupEditableFields() {
    // Rendre les noms de catégories éditables
    document.querySelectorAll('.category-name.editable-field').forEach(field => {
        field.setAttribute('data-original-value', field.textContent);
        field.addEventListener('click', function() {
            makeFieldEditable(this, 'text');
        });
    });
    
    // Rendre les noms de sous-catégories éditables
    document.querySelectorAll('.subcategory-name.editable-field').forEach(field => {
        field.setAttribute('data-original-value', field.textContent);
        field.addEventListener('click', function() {
            makeFieldEditable(this, 'text');
        });
    });
    
    // Rendre les montants de sous-catégories éditables
    document.querySelectorAll('.subcategory-amount.editable-field').forEach(field => {
        field.setAttribute('data-original-value', field.textContent);
        field.addEventListener('click', function() {
            makeFieldEditable(this, 'number');
        });
    });
    
    // Rendre les noms de lignes éditables
    document.querySelectorAll('.expense-line-name.editable-field').forEach(field => {
        field.setAttribute('data-original-value', field.textContent);
        field.addEventListener('click', function() {
            makeFieldEditable(this, 'text');
        });
    });
    
    // Rendre les montants de lignes éditables
    document.querySelectorAll('.expense-line-amount.editable-field').forEach(field => {
        field.setAttribute('data-original-value', field.textContent);
        field.addEventListener('click', function() {
            makeFieldEditable(this, 'number');
        });
    });
    
    // Configurer les boutons de suppression de lignes
    document.querySelectorAll('.delete-line-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const lineElement = this.closest('.expense-line');
            if (lineElement) {
                lineElement.remove();
                updateBudgetCalculation();
            }
        });
    });
    
    // Configurer les boutons de suppression de sous-catégories
    document.querySelectorAll('.delete-subcategory-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const subcategoryElement = this.closest('.subcategory');
            if (subcategoryElement && confirm('Voulez-vous vraiment supprimer cette sous-catégorie et toutes ses lignes ?')) {
                subcategoryElement.remove();
                updateBudgetCalculation();
            }
        });
    });
    
    // Configurer les boutons de suppression de catégories
    document.querySelectorAll('.delete-category-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const categoryElement = this.closest('.expense-category');
            if (categoryElement && confirm('Voulez-vous vraiment supprimer cette catégorie et toutes ses sous-catégories ?')) {
                categoryElement.remove();
                updateBudgetCalculation();
            }
        });
    });
    
    // Configurer les boutons d'ouverture/fermeture de catégories
    document.querySelectorAll('.category-toggle').forEach(btn => {
        btn.addEventListener('click', function() {
            this.classList.toggle('open');
            const categoryElement = this.closest('.expense-category');
            const subcategoriesContainer = categoryElement.querySelector('.subcategories-container');
            if (subcategoriesContainer) {
                subcategoriesContainer.classList.toggle('open');
            }
            
            // Mettre à jour l'icône
            const icon = this.querySelector('i');
            if (icon) {
                if (this.classList.contains('open')) {
                    icon.className = 'fas fa-chevron-up';
                } else {
                    icon.className = 'fas fa-chevron-down';
                }
            }
        });
    });
}

// Fonction pour activer le mode édition de projet
function enableEditMode(projectId) {
    console.log("Activation du mode édition pour le projet:", projectId);
    
    // Charger le projet existant depuis localStorage
    let savedProjects = [];
    try {
        savedProjects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
    } catch (error) {
        console.error('Erreur lors du chargement des projets sauvegardés:', error);
        return;
    }
    
    // Trouver le projet avec l'ID correspondant
    const projectToEdit = savedProjects.find(project => project.id === projectId);
    if (!projectToEdit) {
        console.error('Projet non trouvé avec ID:', projectId);
        return;
    }
    
    console.log('Projet à modifier:', projectToEdit);
    
    // Changer le titre de la page
    const pageTitle = document.querySelector('.page-title');
    if (pageTitle) {
        pageTitle.textContent = 'MODIFIER PROJET';
        pageTitle.style.color = '#2979ff'; // Mettre en bleu pour renforcer la visibilité
    }
    
    // Changer le type de projet si défini
    const projectType = document.querySelector('.project-type');
    if (projectType && projectToEdit.template) {
        projectType.textContent = projectToEdit.template;
        
        // Sélectionner également le bon modèle dans l'accordéon
        const templateOption = document.querySelector(`.template-option[data-template="${projectToEdit.template}"]`);
        if (templateOption) {
            // Désélectionner tout autre option précédemment sélectionnée
            document.querySelectorAll('.template-option.selected').forEach(option => {
                option.classList.remove('selected');
            });
            
            // Sélectionner cette option
            templateOption.classList.add('selected');
            
            // Ouvrir l'accordéon parent
            const accordionContent = templateOption.closest('.accordion-content');
            if (accordionContent) {
                accordionContent.style.display = 'block';
                const accordionHeader = accordionContent.previousElementSibling;
                if (accordionHeader) {
                    accordionHeader.classList.add('active');
                    accordionHeader.querySelector('i').classList.replace('fa-chevron-down', 'fa-chevron-up');
                }
            }
        }
    }
    
    // Charger les données du projet dans le formulaire
    const projectNameInput = document.getElementById('projectName');
    if (projectNameInput && projectToEdit.projectName) {
        projectNameInput.value = projectToEdit.projectName;
        // Rendre le champ éditable avec style visuel
        projectNameInput.classList.add('editable-field');
    }
    
    const projectDateInput = document.getElementById('projectDate');
    if (projectDateInput && projectToEdit.projectDate) {
        projectDateInput.value = projectToEdit.projectDate;
        // Rendre le champ éditable avec style visuel
        projectDateInput.classList.add('editable-field');
    }
    
    const totalBudgetInput = document.getElementById('totalBudget');
    if (totalBudgetInput && projectToEdit.totalBudget) {
        totalBudgetInput.value = projectToEdit.totalBudget;
        // Rendre le champ éditable avec style visuel
        totalBudgetInput.classList.add('editable-field');
    }
    
    // Mettre à jour les champs supplémentaires s'ils existent
    const projectEndDateInput = document.getElementById('projectEndDate');
    if (projectEndDateInput && projectToEdit.projectEndDate) {
        projectEndDateInput.value = projectToEdit.projectEndDate;
        // Rendre le champ éditable avec style visuel
        projectEndDateInput.classList.add('editable-field');
    }
    
    const projectStatusSelect = document.getElementById('projectStatus');
    if (projectStatusSelect && projectToEdit.status) {
        projectStatusSelect.value = projectToEdit.status;
    }
    
    const linkToWalletCheckbox = document.getElementById('linkToWallet');
    if (linkToWalletCheckbox && projectToEdit.linkToWallet !== undefined) {
        linkToWalletCheckbox.checked = projectToEdit.linkToWallet;
    }
    
    // Modifier l'apparence du formulaire pour le mode édition
    const formContainer = document.querySelector('.project-form-container');
    if (formContainer) {
        formContainer.classList.add('edit-mode');
    }
    
    // Ajouter un message indiquant qu'on est en mode édition
    const formHeader = document.querySelector('.form-header');
    if (formHeader) {
        // Vérifier si la notice existe déjà
        let editModeNotice = formHeader.querySelector('.edit-mode-notice');
        if (!editModeNotice) {
            editModeNotice = document.createElement('div');
            editModeNotice.className = 'edit-mode-notice';
            editModeNotice.innerHTML = '<i class="fas fa-pencil-alt"></i> Mode Édition';
            formHeader.appendChild(editModeNotice);
        }
    }
    
    // Préparer les boutons de l'interface en mode édition
    setupEditModeButtons(projectId, projectToEdit);
    
    // Charger les catégories et sous-catégories du projet
    if (projectToEdit.categories && projectToEdit.categories.length > 0) {
        loadProjectCategories(projectToEdit.categories);
    }
}

// Fonction pour configurer les boutons en mode édition
function setupEditModeButtons(projectId, projectToEdit) {
    // Trouver le conteneur des boutons
    const formActions = document.querySelector('.form-actions');
    if (!formActions) return;
    
    // Vider le conteneur des boutons existants
    formActions.innerHTML = '';
    
    // Ajouter le bouton de sauvegarde des modifications
    const saveButton = document.createElement('button');
    saveButton.type = 'button';
    saveButton.id = 'saveChangesBtn';
    saveButton.className = 'btn btn-primary';
    saveButton.innerHTML = '<i class="fas fa-save"></i> Enregistrer les modifications';
    formActions.appendChild(saveButton);
    
    // Ajouter le bouton pour enregistrer et quitter
    const saveExitButton = document.createElement('button');
    saveExitButton.type = 'button';
    saveExitButton.id = 'saveExitBtn';
    saveExitButton.className = 'btn btn-success';
    saveExitButton.innerHTML = '<i class="fas fa-check"></i> Enregistrer et terminer';
    formActions.appendChild(saveExitButton);
    
    // Ajouter le bouton pour annuler les modifications
    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.id = 'cancelEditBtn';
    cancelButton.className = 'btn btn-outline-secondary';
    cancelButton.innerHTML = '<i class="fas fa-times"></i> Annuler';
    formActions.appendChild(cancelButton);
    
    // Ajouter les gestionnaires d'événements
    saveButton.addEventListener('click', function() {
        // Collecter les données du formulaire
        const formData = getProjectData();
        // Conserver l'ID et la date de création du projet original
        formData.id = projectId;
        formData.createdAt = projectToEdit.createdAt;
        
        // Mise à jour du projet sans redirection
        updateExistingProject(formData, projectToEdit, projectId, false);
    });
    
    saveExitButton.addEventListener('click', function() {
        // Collecter les données du formulaire
        const formData = getProjectData();
        // Conserver l'ID et la date de création du projet original
        formData.id = projectId;
        formData.createdAt = projectToEdit.createdAt;
        
        // Mise à jour du projet avec redirection vers l'accueil
        updateExistingProject(formData, projectToEdit, projectId, true);
    });
    
    cancelButton.addEventListener('click', function() {
        if (confirm('Voulez-vous vraiment annuler les modifications ? Les changements non sauvegardés seront perdus.')) {
            // Effacer les données d'édition
            localStorage.removeItem('projectInEditing');
            localStorage.removeItem('currentProject');
            
            // Rediriger vers la page d'accueil
            window.location.href = 'index.html';
        }
    });
}

// Fonction pour charger les catégories du projet
function loadProjectCategories(categories) {
    // Vider le conteneur existant
    const categoriesContainer = document.getElementById('expenseCategories');
    if (!categoriesContainer) return;
    
    categoriesContainer.innerHTML = '';
    
    // Ajouter chaque catégorie
    categories.forEach(category => {
        // Créer l'élément de catégorie
        const categoryElement = document.createElement('div');
        categoryElement.className = 'expense-category';
        
        // En-tête de la catégorie
        const categoryHeader = document.createElement('div');
        categoryHeader.className = 'category-header';
        
        const categoryTitle = document.createElement('h3');
        categoryTitle.className = 'category-name editable-field';
        categoryTitle.textContent = category.name;
        categoryTitle.setAttribute('data-original-value', category.name);
        
        // Ajouter la possibilité de modifier le nom de la catégorie en cliquant dessus
        categoryTitle.addEventListener('click', function() {
            makeFieldEditable(this, 'text');
        });
        
        const categoryAmount = document.createElement('span');
        categoryAmount.className = 'category-amount';
        categoryAmount.textContent = category.amount;
        
        categoryHeader.appendChild(categoryTitle);
        categoryHeader.appendChild(categoryAmount);
        
        // Contrôles de la catégorie (toggle expand/collapse)
        const categoryControls = document.createElement('div');
        categoryControls.className = 'category-controls';
        
        const categoryToggle = document.createElement('button');
        categoryToggle.type = 'button';
        categoryToggle.className = 'category-toggle open';
        categoryToggle.innerHTML = '<i class="fas fa-chevron-up"></i>';
        
        categoryControls.appendChild(categoryToggle);
        categoryHeader.appendChild(categoryControls);
        
        // Conteneur des sous-catégories
        const subcategoriesContainer = document.createElement('div');
        subcategoriesContainer.className = 'subcategories-container open';
        
        // Ajouter chaque sous-catégorie
        if (category.subcategories && category.subcategories.length > 0) {
            category.subcategories.forEach(subcategory => {
                const subcategoryElement = createSubcategoryElement(subcategory);
                subcategoriesContainer.appendChild(subcategoryElement);
            });
        }
        
        // Pied de page de catégorie pour ajouter des sous-catégories
        const subcategoryFooter = document.createElement('div');
        subcategoryFooter.className = 'subcategory-footer';
        
        const addSubcategoryBtn = document.createElement('button');
        addSubcategoryBtn.type = 'button';
        addSubcategoryBtn.className = 'add-subcategory-btn';
        addSubcategoryBtn.innerHTML = '<i class="fas fa-plus"></i> Ajouter une sous-catégorie';
        
        subcategoryFooter.appendChild(addSubcategoryBtn);
        subcategoriesContainer.appendChild(subcategoryFooter);
        
        // Assembler la catégorie
        categoryElement.appendChild(categoryHeader);
        categoryElement.appendChild(subcategoriesContainer);
        
        // Actions supplémentaires pour la catégorie (bouton de suppression)
        const deleteCategoryBtn = document.createElement('button');
        deleteCategoryBtn.type = 'button';
        deleteCategoryBtn.className = 'delete-category-btn';
        deleteCategoryBtn.innerHTML = '<i class="fas fa-trash"></i>';
        
        deleteCategoryBtn.addEventListener('click', function() {
            if (confirm('Voulez-vous vraiment supprimer cette catégorie et toutes ses sous-catégories ?')) {
                categoryElement.remove();
                updateBudgetCalculation();
            }
        });
        
        categoryControls.appendChild(deleteCategoryBtn);
        
        // Ajouter au conteneur principal
        categoriesContainer.appendChild(categoryElement);
        
        // Initialiser les fonctionnalités de la catégorie
        categoryToggle.addEventListener('click', function() {
            this.classList.toggle('open');
            subcategoriesContainer.classList.toggle('open');
            
            // Changer l'icône
            const icon = this.querySelector('i');
            if (icon) {
                if (this.classList.contains('open')) {
                    icon.className = 'fas fa-chevron-up';
                } else {
                    icon.className = 'fas fa-chevron-down';
                }
            }
        });
    });
    
    // Ajouter le conteneur pour le bouton d'ajout de catégorie principale
    const addCategoryContainer = document.createElement('div');
    addCategoryContainer.className = 'add-category-container';
    
    const addCategoryBtn = document.createElement('button');
    addCategoryBtn.type = 'button';
    addCategoryBtn.id = 'addMainCategoryBtn';
    addCategoryBtn.className = 'add-category-btn';
    addCategoryBtn.innerHTML = '<i class="fas fa-plus"></i> Ajouter une catégorie';
    
    addCategoryContainer.appendChild(addCategoryBtn);
    categoriesContainer.appendChild(addCategoryContainer);
}

// Fonction pour créer un élément de sous-catégorie
function createSubcategoryElement(subcategory) {
    const subcategoryElement = document.createElement('div');
    subcategoryElement.className = 'subcategory';
    
    // En-tête de la sous-catégorie
    const subcategoryHeader = document.createElement('div');
    subcategoryHeader.className = 'subcategory-header';
    
    const subcategoryTitle = document.createElement('h5');
    subcategoryTitle.className = 'subcategory-name editable-field';
    subcategoryTitle.textContent = subcategory.name;
    subcategoryTitle.setAttribute('data-original-value', subcategory.name);
    
    // Ajouter la possibilité de modifier le nom de la sous-catégorie en cliquant dessus
    subcategoryTitle.addEventListener('click', function() {
        makeFieldEditable(this, 'text');
    });
    
    const subcategoryAmount = document.createElement('span');
    subcategoryAmount.className = 'subcategory-amount editable-field';
    subcategoryAmount.textContent = subcategory.amount;
    subcategoryAmount.setAttribute('data-original-value', subcategory.amount);
    
    // Ajouter la possibilité de modifier le montant de la sous-catégorie en cliquant dessus
    subcategoryAmount.addEventListener('click', function() {
        makeFieldEditable(this, 'number');
    });
    
    subcategoryHeader.appendChild(subcategoryTitle);
    subcategoryHeader.appendChild(subcategoryAmount);
    
    // Actions de la sous-catégorie
    const subcategoryActions = document.createElement('div');
    subcategoryActions.className = 'subcategory-actions';
    
    const addLineBtn = document.createElement('button');
    addLineBtn.type = 'button';
    addLineBtn.className = 'add-expense-line-btn';
    addLineBtn.innerHTML = '<i class="fas fa-plus"></i> Ajouter ligne';
    
    const deleteSubcategoryBtn = document.createElement('button');
    deleteSubcategoryBtn.type = 'button';
    deleteSubcategoryBtn.className = 'delete-subcategory-btn';
    deleteSubcategoryBtn.innerHTML = '<i class="fas fa-trash"></i>';
    
    subcategoryActions.appendChild(addLineBtn);
    subcategoryActions.appendChild(deleteSubcategoryBtn);
    
    // Conteneur des lignes de dépenses
    const linesContainer = document.createElement('div');
    linesContainer.className = 'expense-lines';
    
    // Ajouter chaque ligne de dépense
    if (subcategory.lines && subcategory.lines.length > 0) {
        subcategory.lines.forEach(line => {
            const lineElement = createExpenseLineElement(line);
            linesContainer.appendChild(lineElement);
        });
    }
    
    // Assembler la sous-catégorie
    subcategoryElement.appendChild(subcategoryHeader);
    subcategoryElement.appendChild(subcategoryActions);
    subcategoryElement.appendChild(linesContainer);
    
    // Ajouter les gestionnaires d'événements
    deleteSubcategoryBtn.addEventListener('click', function() {
        if (confirm('Voulez-vous vraiment supprimer cette sous-catégorie et toutes ses lignes ?')) {
            subcategoryElement.remove();
            updateBudgetCalculation();
        }
    });
    
    // Ajouter le gestionnaire pour ajouter des lignes de dépense
    addLineBtn.addEventListener('click', function() {
        showAddExpenseLineForm(linesContainer);
    });
    
    return subcategoryElement;
}

// Fonction pour créer un élément de ligne de dépense
function createExpenseLineElement(line) {
    // Créer l'élément de ligne
    const lineElement = document.createElement('div');
    lineElement.className = 'expense-line';
    
    // Nom de la ligne
    const lineName = document.createElement('span');
    lineName.className = 'expense-line-name editable-field';
    lineName.textContent = line.name;
    lineName.setAttribute('data-original-value', line.name);
    
    // Montant de la ligne
    const lineAmount = document.createElement('span');
    lineAmount.className = 'expense-line-amount editable-field';
    lineAmount.textContent = line.amount;
    lineAmount.setAttribute('data-original-value', line.amount);
    
    // Bouton de suppression
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'delete-line-btn';
    deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
    
    // Ajouter les éléments à la ligne
    lineElement.appendChild(lineName);
    lineElement.appendChild(lineAmount);
    lineElement.appendChild(deleteBtn);
    
    // Ajouter la possibilité de modifier les champs
    lineName.addEventListener('click', function() {
        makeFieldEditable(this, 'text');
    });
    
    lineAmount.addEventListener('click', function() {
        makeFieldEditable(this, 'number');
    });
    
    // Ajouter le gestionnaire d'événement pour la suppression
    deleteBtn.addEventListener('click', function() {
        lineElement.remove();
        updateBudgetCalculation();
    });
    
    return lineElement;
}

// Fonction pour configurer les boutons d'ajout de ligne
function setupAddLineButtons() {
    // Sélectionner tous les boutons d'ajout de ligne existants
    const addLineBtns = document.querySelectorAll('.add-expense-line-btn');
    addLineBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const subcategoryElement = this.closest('.subcategory');
            const expenseLinesContainer = subcategoryElement.querySelector('.expense-lines');
            if (expenseLinesContainer) {
                showAddExpenseLineForm(expenseLinesContainer);
            }
        });
    });
}

// Fonction pour ajouter une nouvelle catégorie
function addNewCategory(categoryName) {
    // Obtenir le symbole de la devise actuelle
    let currencySymbol = getProjectCurrencySymbol();
    
    // Créer l'élément de catégorie
    const categoryElement = document.createElement('div');
    categoryElement.className = 'expense-category';
    
    // En-tête de la catégorie
    const categoryHeader = document.createElement('div');
    categoryHeader.className = 'category-header';
    
    const categoryTitle = document.createElement('h4');
    categoryTitle.className = 'category-name editable-field';
    categoryTitle.textContent = categoryName;
    categoryTitle.setAttribute('data-original-value', categoryName);
    
    // Ajouter la possibilité de modifier le nom de la catégorie en cliquant dessus
    categoryTitle.addEventListener('click', function() {
        makeFieldEditable(this, 'text');
    });
    
    const categoryAmount = document.createElement('span');
    categoryAmount.className = 'category-amount';
    categoryAmount.id = `cat${Date.now()}-amount`; // ID unique
    categoryAmount.textContent = `${currencySymbol} 0.00`;
    
    const categoryControls = document.createElement('div');
    categoryControls.className = 'category-controls';
    
    const categoryToggle = document.createElement('button');
    categoryToggle.type = 'button';
    categoryToggle.className = 'category-toggle open';
    categoryToggle.innerHTML = '<i class="fas fa-chevron-up"></i>';
    
    const deleteCategoryBtn = document.createElement('button');
    deleteCategoryBtn.type = 'button';
    deleteCategoryBtn.className = 'delete-category-btn';
    deleteCategoryBtn.innerHTML = '<i class="fas fa-trash"></i>';
    
    categoryControls.appendChild(categoryToggle);
    categoryControls.appendChild(deleteCategoryBtn);
    
    categoryHeader.appendChild(categoryTitle);
    categoryHeader.appendChild(categoryAmount);
    categoryHeader.appendChild(categoryControls);
    
    // Conteneur des sous-catégories
    const subcategoriesContainer = document.createElement('div');
    subcategoriesContainer.className = 'subcategories-container open';
    
    // Pied de page de catégorie pour ajouter des sous-catégories
    const subcategoryFooter = document.createElement('div');
    subcategoryFooter.className = 'subcategory-footer';
    
    const addSubcategoryBtn = document.createElement('button');
    addSubcategoryBtn.type = 'button';
    addSubcategoryBtn.className = 'add-subcategory-btn';
    addSubcategoryBtn.innerHTML = '<i class="fas fa-plus"></i> Ajouter une sous-catégorie';
    
    subcategoryFooter.appendChild(addSubcategoryBtn);
    subcategoriesContainer.appendChild(subcategoryFooter);
    
    // Assembler la catégorie
    categoryElement.appendChild(categoryHeader);
    categoryElement.appendChild(subcategoriesContainer);
    
    // Ajouter au conteneur principal des catégories
    const categoriesContainer = document.getElementById('expenseCategories');
    
    // Trouver le point d'insertion (avant le bouton d'ajout de catégorie principale)
    const addCategoryContainer = document.querySelector('.add-category-container');
    if (categoriesContainer && addCategoryContainer) {
        categoriesContainer.insertBefore(categoryElement, addCategoryContainer);
    } else if (categoriesContainer) {
        categoriesContainer.appendChild(categoryElement);
    }
    
    // Initialiser les fonctionnalités de la catégorie
    categoryToggle.addEventListener('click', function() {
        this.classList.toggle('open');
        subcategoriesContainer.classList.toggle('open');
        
        // Changer l'icône
        const icon = this.querySelector('i');
        if (icon) {
            if (this.classList.contains('open')) {
                icon.className = 'fas fa-chevron-up';
            } else {
                icon.className = 'fas fa-chevron-down';
            }
        }
    });
    
    // Ajouter le gestionnaire pour la suppression de catégorie
    deleteCategoryBtn.addEventListener('click', function() {
        if (confirm('Voulez-vous vraiment supprimer cette catégorie et toutes ses sous-catégories ?')) {
            categoryElement.remove();
            updateBudgetCalculation();
        }
    });
    
    // Initialiser l'événement d'ajout de sous-catégorie
    addSubcategoryBtn.addEventListener('click', function() {
        // Vérifier si un formulaire d'ajout de sous-catégorie existe déjà dans cette catégorie
        if (subcategoriesContainer.querySelector('.subcategory-form')) {
            return; // Éviter les doublons
        }
        
        // Créer le formulaire d'ajout de sous-catégorie
        const subcategoryForm = document.createElement('div');
        subcategoryForm.className = 'subcategory-form';
        subcategoryForm.innerHTML = `
            <h4>Ajouter une sous-catégorie</h4>
            <div class="form-group">
                <label for="newSubcategoryName">Nom de la sous-catégorie</label>
                <input type="text" id="newSubcategoryName" class="form-control" placeholder="Ex: Traiteur">
            </div>
            <div class="form-action-buttons">
                <button type="button" class="btn-cancel-subcategory">Annuler</button>
                <button type="button" class="btn-add-subcategory">Ajouter</button>
            </div>
        `;
        
        // Insérer le formulaire avant le footer
        subcategoriesContainer.insertBefore(subcategoryForm, subcategoryFooter);
        
        // Focus sur le champ de nom
        setTimeout(() => {
            subcategoryForm.querySelector('#newSubcategoryName').focus();
        }, 100);
        
        // Gestionnaire pour le bouton d'annulation
        subcategoryForm.querySelector('.btn-cancel-subcategory').addEventListener('click', function() {
            subcategoryForm.remove();
        });
        
        // Gestionnaire pour le bouton d'ajout
        subcategoryForm.querySelector('.btn-add-subcategory').addEventListener('click', function() {
            const subcategoryName = subcategoryForm.querySelector('#newSubcategoryName').value.trim();
            if (!subcategoryName) {
                alert('Veuillez saisir un nom de sous-catégorie');
                return;
            }
            
            // Créer la sous-catégorie
            createSubcategoryInContainer(subcategoriesContainer, subcategoryName);
            
            // Supprimer le formulaire
            subcategoryForm.remove();
        });
    });
}

// Fonction pour ajouter une nouvelle sous-catégorie
function addNewSubcategory(categoryElement, subcategoryName) {
    const subcategoriesContainer = categoryElement.querySelector('.subcategories-container');
    if (!subcategoriesContainer) return;
    
    createSubcategoryInContainer(subcategoriesContainer, subcategoryName);
}

// Fonction pour créer une sous-catégorie dans un conteneur spécifié
function createSubcategoryInContainer(container, subcategoryName) {
    // Obtenir le symbole de la devise actuelle
    let currencySymbol = getProjectCurrencySymbol();
    
    // Créer l'élément de sous-catégorie
    const subcategoryElement = document.createElement('div');
    subcategoryElement.className = 'subcategory';
    
    // En-tête de la sous-catégorie
    const subcategoryHeader = document.createElement('div');
    subcategoryHeader.className = 'subcategory-header';
    
    const subcategoryTitle = document.createElement('h5');
    subcategoryTitle.className = 'subcategory-name editable-field';
    subcategoryTitle.textContent = subcategoryName;
    subcategoryTitle.setAttribute('data-original-value', subcategoryName);
    
    const subcategoryAmount = document.createElement('span');
    subcategoryAmount.className = 'subcategory-amount editable-field';
    subcategoryAmount.textContent = `${currencySymbol} 0.00`;
    
    // Ajouter la possibilité de modifier le nom de la sous-catégorie en cliquant dessus
    subcategoryTitle.addEventListener('click', function() {
        makeFieldEditable(this, 'text');
    });
    
    // Ajouter la possibilité de modifier le montant de la sous-catégorie en cliquant dessus
    subcategoryAmount.addEventListener('click', function() {
        makeFieldEditable(this, 'number');
    });
    
    subcategoryHeader.appendChild(subcategoryTitle);
    subcategoryHeader.appendChild(subcategoryAmount);
    
    // Actions de la sous-catégorie
    const subcategoryActions = document.createElement('div');
    subcategoryActions.className = 'subcategory-actions';
    
    const addLineBtn = document.createElement('button');
    addLineBtn.type = 'button';
    addLineBtn.className = 'add-expense-line-btn';
    addLineBtn.innerHTML = '<i class="fas fa-plus"></i> Ajouter ligne';
    
    const deleteSubcategoryBtn = document.createElement('button');
    deleteSubcategoryBtn.type = 'button';
    deleteSubcategoryBtn.className = 'delete-subcategory-btn';
    deleteSubcategoryBtn.innerHTML = '<i class="fas fa-trash"></i>';
    
    subcategoryActions.appendChild(addLineBtn);
    subcategoryActions.appendChild(deleteSubcategoryBtn);
    
    // Conteneur des lignes de dépenses
    const linesContainer = document.createElement('div');
    linesContainer.className = 'expense-lines';
    
    // Assembler la sous-catégorie
    subcategoryElement.appendChild(subcategoryHeader);
    subcategoryElement.appendChild(subcategoryActions);
    subcategoryElement.appendChild(linesContainer);
    
    // Ajouter au conteneur spécifié (avant le footer s'il existe)
    const subcategoryFooter = container.querySelector('.subcategory-footer');
    if (subcategoryFooter) {
        container.insertBefore(subcategoryElement, subcategoryFooter);
    } else {
        container.appendChild(subcategoryElement);
    }
    
    // Ajouter les gestionnaires d'événements
    deleteSubcategoryBtn.addEventListener('click', function() {
        if (confirm('Voulez-vous vraiment supprimer cette sous-catégorie et toutes ses lignes ?')) {
            subcategoryElement.remove();
            updateBudgetCalculation();
        }
    });
    
    // Ajouter le gestionnaire pour ajouter des lignes de dépense
    addLineBtn.addEventListener('click', function() {
        showAddExpenseLineForm(linesContainer);
    });
    
    return subcategoryElement;
}

// Fonction pour ajouter une nouvelle ligne de dépense
function addNewExpenseLine(expenseLinesContainer) {
    showAddExpenseLineForm(expenseLinesContainer);
}

// Fonction pour rendre un champ modifiable
function makeFieldEditable(element, type = 'text') {
    // Vérifier si le champ est déjà en mode édition
    if (element.querySelector('input')) return;
    
    // Sauvegarder la valeur actuelle
    const currentValue = element.textContent.trim();
    const originalValue = element.getAttribute('data-original-value') || currentValue;
    
    // Créer un formulaire inline
    const form = document.createElement('div');
    form.className = 'inline-form';
    
    // Créer l'input avec la valeur actuelle
    const input = document.createElement('input');
    input.type = type === 'number' ? 'number' : 'text';
    input.value = type === 'number' ? parseMonetaryValue(currentValue) : currentValue;
    input.className = 'form-control';
    if (type === 'number') {
        input.min = '0';
        input.step = '0.01';
    }
    
    // Créer les boutons de sauvegarde et d'annulation
    const saveBtn = document.createElement('button');
    saveBtn.innerHTML = '<i class="fas fa-check"></i>';
    saveBtn.type = 'button';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.innerHTML = '<i class="fas fa-times"></i>';
    cancelBtn.type = 'button';
    cancelBtn.className = 'cancel';
    
    // Ajouter les éléments au formulaire
    form.appendChild(input);
    form.appendChild(saveBtn);
    form.appendChild(cancelBtn);
    
    // Vider l'élément et ajouter le formulaire
    element.textContent = '';
    element.appendChild(form);
    
    // Focus sur l'input
    input.focus();
    
    // Gestionnaire pour le bouton de sauvegarde
    saveBtn.addEventListener('click', function() {
        let newValue = input.value.trim();
        if (type === 'number') {
            // Formater avec le symbole de devise
            const currencySymbol = getProjectCurrencySymbol();
            newValue = `${currencySymbol} ${parseFloat(newValue).toFixed(2)}`;
        }
        
        // Mettre à jour le contenu de l'élément
        element.textContent = newValue;
        
        // Mettre à jour les calculs si nécessaire
        updateBudgetCalculation();
    });
    
    // Gestionnaire pour le bouton d'annulation
    cancelBtn.addEventListener('click', function() {
        element.textContent = currentValue;
    });
    
    // Gestionnaire pour la touche Enter et Escape
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            saveBtn.click();
        } else if (e.key === 'Escape') {
            cancelBtn.click();
        }
    });
}

// Fonction pour afficher le formulaire d'ajout de ligne de dépense
function showAddExpenseLineForm(container) {
    // Vérifier si un formulaire d'ajout de ligne existe déjà
    if (container.querySelector('.expense-line-form')) {
        return; // Éviter les doublons
    }
    
    // Créer le formulaire d'ajout de ligne
    const lineForm = document.createElement('div');
    lineForm.className = 'expense-line-form';
    lineForm.innerHTML = `
        <h4>Ajouter une ligne de dépense</h4>
        <div class="form-group">
            <label for="newLineName">Description</label>
            <input type="text" id="newLineName" class="form-control" placeholder="Ex: Menu principal">
        </div>
        <div class="form-group">
            <label for="newLineAmount">Montant</label>
            <input type="number" id="newLineAmount" class="form-control" min="0" step="0.01" placeholder="0.00">
        </div>
        <div class="form-action-buttons">
            <button type="button" class="btn-cancel-line">Annuler</button>
            <button type="button" class="btn-add-line">Ajouter</button>
        </div>
    `;
    
    // Ajouter le formulaire au conteneur
    container.appendChild(lineForm);
    
    // Focus sur le champ de nom
    setTimeout(() => {
        lineForm.querySelector('#newLineName').focus();
    }, 100);
    
    // Gestionnaire pour le bouton d'annulation
    lineForm.querySelector('.btn-cancel-line').addEventListener('click', function() {
        lineForm.remove();
    });
    
    // Gestionnaire pour le bouton d'ajout
    lineForm.querySelector('.btn-add-line').addEventListener('click', function() {
        const lineName = lineForm.querySelector('#newLineName').value.trim();
        const lineAmount = lineForm.querySelector('#newLineAmount').value;
        
        if (!lineName) {
            alert('Veuillez saisir une description pour la ligne');
            return;
        }
        
        // Créer la ligne de dépense
        createExpenseLine(container, lineName, lineAmount);
        
        // Supprimer le formulaire
        lineForm.remove();
        
        // Mettre à jour les calculs
        updateBudgetCalculation();
    });
}

// Fonction pour créer une ligne de dépense
function createExpenseLine(container, name, amount) {
    // Obtenir le symbole de la devise actuelle
    let currencySymbol = getProjectCurrencySymbol();
    
    // Créer l'élément de ligne
    const lineElement = document.createElement('div');
    lineElement.className = 'expense-line';
    
    // Nom de la ligne
    const lineName = document.createElement('span');
    lineName.className = 'expense-line-name editable-field';
    lineName.textContent = name;
    lineName.setAttribute('data-original-value', name);
    
    // Montant de la ligne
    const lineAmount = document.createElement('span');
    lineAmount.className = 'expense-line-amount editable-field';
    lineAmount.textContent = `${currencySymbol} ${parseFloat(amount || 0).toFixed(2)}`;
    
    // Bouton de suppression
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'delete-line-btn';
    deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
    
    // Ajouter les éléments à la ligne
    lineElement.appendChild(lineName);
    lineElement.appendChild(lineAmount);
    lineElement.appendChild(deleteBtn);
    
    // Ajouter au conteneur
    container.appendChild(lineElement);
    
    // Ajouter la possibilité de modifier les champs
    lineName.addEventListener('click', function() {
        makeFieldEditable(this, 'text');
    });
    
    lineAmount.addEventListener('click', function() {
        makeFieldEditable(this, 'number');
    });
    
    // Ajouter le gestionnaire d'événement pour la suppression
    deleteBtn.addEventListener('click', function() {
        lineElement.remove();
        updateBudgetCalculation();
    });
    
    return lineElement;
}

// Fonction pour configurer les boutons d'ajout de sous-catégorie
function setupAddSubcategoryButtons() {
    // Sélectionner tous les boutons d'ajout de sous-catégorie existants
    const addSubcategoryBtns = document.querySelectorAll('.add-subcategory-btn');
    addSubcategoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const categoryElement = this.closest('.expense-category');
            const subcategoriesContainer = categoryElement.querySelector('.subcategories-container');
            
            if (!subcategoriesContainer) return;
            
            // Vérifier si un formulaire d'ajout de sous-catégorie existe déjà
            if (subcategoriesContainer.querySelector('.subcategory-form')) {
                return; // Éviter les doublons
            }
            
            // Créer le formulaire d'ajout de sous-catégorie
            const subcategoryForm = document.createElement('div');
            subcategoryForm.className = 'subcategory-form';
            subcategoryForm.innerHTML = `
                <h4>Ajouter une sous-catégorie</h4>
                <div class="form-group">
                    <label for="newSubcategoryName">Nom de la sous-catégorie</label>
                    <input type="text" id="newSubcategoryName" class="form-control" placeholder="Ex: Traiteur">
                </div>
                <div class="form-action-buttons">
                    <button type="button" class="btn-cancel-subcategory">Annuler</button>
                    <button type="button" class="btn-add-subcategory">Ajouter</button>
                </div>
            `;
            
            // Insérer le formulaire dans le conteneur
            const subcategoryFooter = subcategoriesContainer.querySelector('.subcategory-footer');
            if (subcategoryFooter) {
                subcategoriesContainer.insertBefore(subcategoryForm, subcategoryFooter);
            } else {
                subcategoriesContainer.appendChild(subcategoryForm);
            }
            
            // Focus sur le champ de nom
            setTimeout(() => {
                subcategoryForm.querySelector('#newSubcategoryName').focus();
            }, 100);
            
            // Gestionnaire pour le bouton d'annulation
            subcategoryForm.querySelector('.btn-cancel-subcategory').addEventListener('click', function() {
                subcategoryForm.remove();
            });
            
            // Gestionnaire pour le bouton d'ajout
            subcategoryForm.querySelector('.btn-add-subcategory').addEventListener('click', function() {
                const subcategoryName = subcategoryForm.querySelector('#newSubcategoryName').value.trim();
                if (!subcategoryName) {
                    alert('Veuillez saisir un nom de sous-catégorie');
                    return;
                }
                
                // Créer la sous-catégorie
                createSubcategoryInContainer(subcategoriesContainer, subcategoryName);
                
                // Supprimer le formulaire
                subcategoryForm.remove();
            });
        });
    });
}

// Fonction pour configurer le bouton d'ajout de catégorie
function setupAddCategoryButton() {
    const addCategoryBtn = document.getElementById('addMainCategoryBtn');
    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', function() {
            // Vérifier si un formulaire d'ajout de catégorie existe déjà
            if (document.querySelector('.category-form')) {
                return; // Éviter les doublons
            }
            
            // Récupérer le conteneur des catégories
            const categoriesContainer = document.getElementById('expenseCategories');
            if (!categoriesContainer) return;
            
            // Créer le formulaire d'ajout de catégorie
            const categoryForm = document.createElement('div');
            categoryForm.className = 'category-form';
            categoryForm.innerHTML = `
                <h4>Ajouter une nouvelle catégorie</h4>
                <div class="form-group">
                    <label for="newCategoryName">Nom de la catégorie</label>
                    <input type="text" id="newCategoryName" class="form-control" placeholder="Ex: Restauration">
                </div>
                <div class="form-action-buttons">
                    <button type="button" class="btn-cancel-category">Annuler</button>
                    <button type="button" class="btn-add-category">Ajouter</button>
                </div>
            `;
            
            // Insérer le formulaire avant le bouton d'ajout
            categoriesContainer.insertBefore(categoryForm, addCategoryBtn.parentNode);
            
            // Focus sur le champ de nom
            setTimeout(() => {
                document.getElementById('newCategoryName').focus();
            }, 100);
            
            // Gestionnaire pour le bouton d'annulation
            categoryForm.querySelector('.btn-cancel-category').addEventListener('click', function() {
                categoryForm.remove();
            });
            
            // Gestionnaire pour le bouton d'ajout
            categoryForm.querySelector('.btn-add-category').addEventListener('click', function() {
                const categoryName = document.getElementById('newCategoryName').value.trim();
                if (!categoryName) {
                    alert('Veuillez saisir un nom de catégorie');
                    return;
                }
                
                // Ajouter la nouvelle catégorie
                addNewCategory(categoryName);
                
                // Supprimer le formulaire
                categoryForm.remove();
            });
        });
    }
}

// Fonction pour récupérer les données actuelles du projet
function getProjectData() {
    const projectName = document.getElementById('projectName').value.trim();
    const projectDate = document.getElementById('projectDate').value;
    const totalBudget = document.getElementById('totalBudget').value;
    
    // Récupérer le type de projet (template) sélectionné
    let template = '';
    const selectedTemplateOption = document.querySelector('.template-option.selected');
    if (selectedTemplateOption) {
        template = selectedTemplateOption.getAttribute('data-template');
    }
    
    // Récupérer les catégories et sous-catégories
    const categories = [];
    const categoryElements = document.querySelectorAll('.expense-category');
    categoryElements.forEach(categoryElement => {
        const categoryName = categoryElement.querySelector('.category-name').textContent.trim();
        const categoryAmount = categoryElement.querySelector('.category-amount').textContent.trim();
        
        const category = {
            name: categoryName,
            amount: categoryAmount,
            subcategories: []
        };
        
        // Récupérer les sous-catégories
        const subcategoryElements = categoryElement.querySelectorAll('.subcategory');
        subcategoryElements.forEach(subcategoryElement => {
            const subcategoryName = subcategoryElement.querySelector('.subcategory-name').textContent.trim();
            const subcategoryAmount = subcategoryElement.querySelector('.subcategory-amount').textContent.trim();
            
            const subcategory = {
                name: subcategoryName,
                amount: subcategoryAmount,
                lines: []
            };
            
            // Récupérer les lignes de dépense
            const lineElements = subcategoryElement.querySelectorAll('.expense-line');
            lineElements.forEach(lineElement => {
                const lineName = lineElement.querySelector('.expense-line-name').textContent.trim();
                const lineAmount = lineElement.querySelector('.expense-line-amount').textContent.trim();
                
                subcategory.lines.push({
                    name: lineName,
                    amount: lineAmount
                });
            });
            
            category.subcategories.push(subcategory);
        });
        
        categories.push(category);
    });
    
    // Récupérer les autres champs s'ils existent
    const projectEndDate = document.getElementById('projectEndDate')?.value || '';
    const projectStatus = document.getElementById('projectStatus')?.value || 'inProgress';
    const linkToWallet = document.getElementById('linkToWallet')?.checked || false;
    
    // Construire l'objet de données du projet
    const projectData = {
        projectName,
        projectDate,
        totalBudget,
        template,
        categories,
        // Si un ID existe déjà, il sera ajouté séparément
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        linkToWallet,
        projectEndDate,
        projectStatus
    };
    
    return projectData;
}

// Fonction pour mettre à jour un projet existant
function updateExistingProject(formData, originalProject, projectId, shouldRedirect) {
    // Charger les projets existants
    let savedProjects = [];
    try {
        savedProjects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
        if (!Array.isArray(savedProjects)) {
            console.error('savedProjects n\'est pas un tableau:', savedProjects);
            savedProjects = [];
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des projets sauvegardés:', error);
        savedProjects = [];
    }
    
    // Remplacer le projet existant par le projet mis à jour
    const updatedProjects = savedProjects.map(project => {
        if (project.id === projectId) {
            console.log('Mise à jour du projet:', formData);
            return formData;
        }
        return project;
    });
    
    try {
        // Sauvegarder la liste mise à jour
        localStorage.setItem('savedProjects', JSON.stringify(updatedProjects));
        console.log('Projet mis à jour avec succès. Total projets:', updatedProjects.length);
        
        // Afficher une notification de succès
        if (window.showNotification) {
            if (shouldRedirect) {
                window.showNotification('Projet mis à jour avec succès!', 'success');
            } else {
                window.showNotification('Modifications enregistrées!', 'success');
            }
        } else {
            if (shouldRedirect) {
                alert('Projet mis à jour avec succès!');
            } else {
                alert('Modifications enregistrées!');
            }
        }
        
        // Si l'option de liaison au portefeuille a changé, mettre à jour les projets liés
        if (formData.linkToWallet !== originalProject.linkToWallet) {
            let walletData = JSON.parse(localStorage.getItem('walletData') || '{"linkedProjects":[]}');
            
            if (formData.linkToWallet) {
                // Ajouter à la liste des projets liés s'il n'y est pas déjà
                if (!walletData.linkedProjects.includes(projectId)) {
                    walletData.linkedProjects.push(projectId);
                }
            } else {
                // Retirer de la liste des projets liés
                walletData.linkedProjects = walletData.linkedProjects.filter(id => id !== projectId);
            }
            
            localStorage.setItem('walletData', JSON.stringify(walletData));
        }
        
        // Si on doit rediriger, nettoyer et aller à l'accueil
        if (shouldRedirect) {
            // Effacer le projet en cours d'édition
            localStorage.removeItem('projectInEditing');
            localStorage.removeItem('currentProject');
            
            // Rediriger vers la page d'accueil
            window.location.href = 'index.html';
        }
        
    } catch (error) {
        console.error('Erreur lors de la mise à jour du projet:', error);
        alert('Erreur lors de la mise à jour du projet. Veuillez réessayer.');
    }
}