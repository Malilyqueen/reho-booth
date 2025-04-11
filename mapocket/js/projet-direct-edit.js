/**
 * Gestion directe de l'édition de projet
 * 
 * Ce script est une solution complètement indépendante pour l'édition de projet,
 * conçue pour éviter tous les problèmes de réinitialisation des données.
 */

// Exécuter immédiatement, sans attendre le DOM
(function() {
    console.log('Initialisation de la page d\'édition directe de projet');
    
    // Variables globales
    let projectData = null; // Stockera les données du projet
    let categoriesData = []; // Stockera les catégories du projet
    
    // Quand le DOM est chargé, initialiser la page
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM chargé, initialisation de l\'édition directe');
        
        // Récupérer l'ID du projet depuis l'URL
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get('id');
        
        if (!projectId) {
            console.error('Pas d\'ID de projet spécifié');
            alert('Erreur: Aucun projet spécifié pour l\'édition.');
            window.location.href = 'index.html';
            return;
        }
        
        // Charger le projet depuis le localStorage
        loadProject(projectId);
        
        // Initialiser les écouteurs d'événements
        setupEventListeners();
        
        // Initialiser les datepickers
        initializeDatePickers();
    });
    
    /**
     * Charge les données du projet depuis le localStorage
     */
    function loadProject(projectId) {
        try {
            // Charger les projets depuis le localStorage
            const storedProjects = localStorage.getItem('savedProjects');
            if (!storedProjects) {
                console.error('Aucun projet trouvé dans le localStorage');
                alert('Erreur: Aucun projet trouvé.');
                window.location.href = 'index.html';
                return;
            }
            
            // Convertir en objet JavaScript
            const projects = JSON.parse(storedProjects);
            
            // Trouver le projet par son ID
            projectData = projects.find(project => project.id === projectId);
            
            if (!projectData) {
                console.error('Projet non trouvé:', projectId);
                alert('Erreur: Projet non trouvé.');
                window.location.href = 'index.html';
                return;
            }
            
            console.log('Projet chargé:', projectData);
            
            // Conserver une copie des catégories
            categoriesData = projectData.categories || [];
            
            // Remplir le formulaire avec les données du projet
            populateForm();
        } catch (error) {
            console.error('Erreur lors du chargement du projet:', error);
            alert('Erreur lors du chargement du projet. Veuillez réessayer.');
        }
    }
    
    /**
     * Remplit le formulaire avec les données du projet
     */
    function populateForm() {
        if (!projectData) return;
        
        // Données de base
        document.getElementById('projectName').value = projectData.projectName || '';
        document.getElementById('projectDate').value = projectData.projectDate || '';
        document.getElementById('projectEndDate').value = projectData.projectEndDate || '';
        document.getElementById('totalBudget').value = projectData.totalBudget || '';
        
        // Statut du projet
        if (projectData.projectStatus) {
            document.getElementById('projectStatus').value = projectData.projectStatus;
        }
        
        // Lien vers portefeuille
        document.getElementById('linkToWallet').checked = projectData.linkToWallet || false;
        
        // Type de projet / Template
        if (projectData.template) {
            // Mettre à jour le titre du template
            document.getElementById('templateType').textContent = projectData.template;
            
            // Sélectionner le template correspondant
            const templateOptions = document.querySelectorAll('.template-option');
            templateOptions.forEach(option => {
                option.classList.remove('selected');
                if (option.getAttribute('data-template') === projectData.template) {
                    option.classList.add('selected');
                    
                    // Si nécessaire, ouvrir le panneau d'accordéon parent
                    const accordionContent = option.closest('.accordion-content');
                    if (accordionContent) {
                        // Fermer tous les autres panneaux d'accordéon d'abord
                        document.querySelectorAll('.accordion-content').forEach(content => {
                            const header = content.previousElementSibling;
                            content.style.display = 'none';
                            if (header) header.classList.remove('active');
                        });
                        
                        // Ouvrir ce panneau
                        accordionContent.style.display = 'block';
                        const accordionHeader = accordionContent.previousElementSibling;
                        if (accordionHeader) {
                            accordionHeader.classList.add('active');
                            const icon = accordionHeader.querySelector('i');
                            if (icon) icon.className = 'fas fa-chevron-up';
                        }
                    }
                }
            });
        }
        
        // Wishlist
        if (typeof projectData.createWishlist !== 'undefined') {
            document.getElementById('createWishlist').checked = projectData.createWishlist;
            
            // Afficher/masquer les options de wishlist
            const wishlistOptions = document.getElementById('wishlistOptions');
            if (wishlistOptions) {
                wishlistOptions.style.display = projectData.createWishlist ? 'block' : 'none';
                wishlistOptions.classList.toggle('hidden', !projectData.createWishlist);
            }
            
            // Remplir les détails de la wishlist
            if (projectData.wishlistData) {
                const recipientType = document.getElementById('wishlistRecipientType');
                if (recipientType) {
                    recipientType.value = projectData.wishlistData.recipientType || 'myself';
                }
                
                const recipientName = document.getElementById('wishlistRecipientName');
                if (recipientName) {
                    recipientName.value = projectData.wishlistData.recipientName || '';
                }
                
                // Afficher/masquer le champ de nom du destinataire
                const recipientNameContainer = document.getElementById('recipientNameContainer');
                if (recipientNameContainer) {
                    recipientNameContainer.style.display = 
                        (projectData.wishlistData.recipientType === 'other') ? 'block' : 'none';
                    recipientNameContainer.classList.toggle('hidden', 
                        projectData.wishlistData.recipientType !== 'other');
                }
            }
        }
        
        // Charger les catégories
        loadCategories();
    }
    
    /**
     * Initialise les écouteurs d'événements pour les interactions utilisateur
     */
    function setupEventListeners() {
        // Soumission du formulaire
        const form = document.getElementById('projectForm');
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                saveProject();
            });
        }
        
        // Sélection de template
        const templateOptions = document.querySelectorAll('.template-option');
        templateOptions.forEach(option => {
            option.addEventListener('click', function() {
                // Désélectionner tous les templates
                templateOptions.forEach(opt => opt.classList.remove('selected'));
                
                // Sélectionner celui-ci
                this.classList.add('selected');
                
                // Mettre à jour le titre du template
                const templateName = this.getAttribute('data-template');
                const templateType = document.getElementById('templateType');
                if (templateType) {
                    templateType.textContent = templateName;
                }
            });
        });
        
        // Accordéon des templates
        const accordionHeaders = document.querySelectorAll('.accordion-header');
        accordionHeaders.forEach(header => {
            header.addEventListener('click', function() {
                // Récupérer le contenu associé à cet en-tête
                const content = this.nextElementSibling;
                
                // Fermer tous les panneaux
                document.querySelectorAll('.accordion-content').forEach(panel => {
                    if (panel !== content) {
                        panel.style.display = 'none';
                        const panelHeader = panel.previousElementSibling;
                        if (panelHeader) {
                            panelHeader.classList.remove('active');
                            const icon = panelHeader.querySelector('i');
                            if (icon) icon.className = 'fas fa-chevron-down';
                        }
                    }
                });
                
                // Ouvrir/fermer le panneau actuel
                const isOpen = content.style.display === 'block';
                content.style.display = isOpen ? 'none' : 'block';
                this.classList.toggle('active', !isOpen);
                
                // Mettre à jour l'icône
                const icon = this.querySelector('i');
                if (icon) {
                    icon.className = isOpen ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
                }
            });
        });
        
        // Options de wishlist
        const createWishlist = document.getElementById('createWishlist');
        if (createWishlist) {
            createWishlist.addEventListener('change', function() {
                const wishlistOptions = document.getElementById('wishlistOptions');
                if (wishlistOptions) {
                    wishlistOptions.style.display = this.checked ? 'block' : 'none';
                    wishlistOptions.classList.toggle('hidden', !this.checked);
                }
            });
        }
        
        // Type de destinataire de wishlist
        const recipientType = document.getElementById('wishlistRecipientType');
        if (recipientType) {
            recipientType.addEventListener('change', function() {
                const recipientNameContainer = document.getElementById('recipientNameContainer');
                if (recipientNameContainer) {
                    recipientNameContainer.style.display = 
                        (this.value === 'other') ? 'block' : 'none';
                    recipientNameContainer.classList.toggle('hidden', 
                        this.value !== 'other');
                }
            });
        }
        
        // Bouton d'ajout de catégorie
        const addCategoryBtn = document.getElementById('addCategoryBtn');
        if (addCategoryBtn) {
            addCategoryBtn.addEventListener('click', function() {
                addCategory();
            });
        }
    }
    
    /**
     * Initialise les sélecteurs de date
     */
    function initializeDatePickers() {
        // Configuration des datepickers
        const dateConfig = {
            dateFormat: 'd/m/Y',
            locale: 'fr'
        };
        
        // Date de début
        const projectDate = document.getElementById('projectDate');
        if (projectDate && typeof flatpickr === 'function') {
            flatpickr(projectDate, dateConfig);
        }
        
        // Date de fin
        const projectEndDate = document.getElementById('projectEndDate');
        if (projectEndDate && typeof flatpickr === 'function') {
            flatpickr(projectEndDate, dateConfig);
        }
    }
    
    /**
     * Charge les catégories dans le formulaire
     */
    function loadCategories() {
        // Récupérer le conteneur des catégories
        const categoriesContainer = document.getElementById('categoriesContainer');
        if (!categoriesContainer) return;
        
        // Supprimer toutes les catégories existantes
        categoriesContainer.innerHTML = '';
        
        // Aucune catégorie à afficher
        if (!categoriesData || categoriesData.length === 0) {
            return;
        }
        
        // Ajouter chaque catégorie
        categoriesData.forEach((category, categoryIndex) => {
            // Créer l'élément de catégorie
            const categoryElement = document.createElement('div');
            categoryElement.className = 'expense-category';
            categoryElement.dataset.index = categoryIndex;
            
            categoryElement.innerHTML = `
                <div class="category-header">
                    <div class="category-name" contenteditable="true">${category.name || ''}</div>
                    <div class="category-amount" contenteditable="true">${category.amount || ''}</div>
                    <div class="category-actions">
                        <button type="button" class="btn-sm delete-category-btn">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="subcategories-container"></div>
                <div class="category-footer">
                    <button type="button" class="btn-sm add-subcategory-btn">
                        <i class="fas fa-plus"></i> Ajouter une sous-catégorie
                    </button>
                </div>
            `;
            
            // Ajouter au conteneur
            categoriesContainer.appendChild(categoryElement);
            
            // Ajouter les sous-catégories
            const subcategoriesContainer = categoryElement.querySelector('.subcategories-container');
            
            if (category.subcategories && category.subcategories.length > 0) {
                category.subcategories.forEach((subcategory, subcategoryIndex) => {
                    // Créer l'élément de sous-catégorie
                    const subcategoryElement = document.createElement('div');
                    subcategoryElement.className = 'subcategory';
                    subcategoryElement.dataset.index = subcategoryIndex;
                    
                    subcategoryElement.innerHTML = `
                        <div class="subcategory-header">
                            <div class="subcategory-name" contenteditable="true">${subcategory.name || ''}</div>
                            <div class="subcategory-amount" contenteditable="true">${subcategory.amount || ''}</div>
                            <div class="subcategory-actions">
                                <button type="button" class="btn-sm delete-subcategory-btn">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                        <div class="expense-lines"></div>
                        <div class="subcategory-footer">
                            <button type="button" class="btn-sm add-line-btn">
                                <i class="fas fa-plus"></i> Ajouter une ligne
                            </button>
                        </div>
                    `;
                    
                    // Ajouter au conteneur
                    subcategoriesContainer.appendChild(subcategoryElement);
                    
                    // Ajouter les lignes
                    const linesContainer = subcategoryElement.querySelector('.expense-lines');
                    
                    if (subcategory.lines && subcategory.lines.length > 0) {
                        subcategory.lines.forEach((line, lineIndex) => {
                            // Créer l'élément de ligne
                            const lineElement = document.createElement('div');
                            lineElement.className = 'expense-line';
                            lineElement.dataset.index = lineIndex;
                            
                            lineElement.innerHTML = `
                                <div class="line-name" contenteditable="true">${line.name || ''}</div>
                                <div class="line-amount" contenteditable="true">${line.amount || ''}</div>
                                <div class="line-actions">
                                    <button type="button" class="btn-sm delete-line-btn">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            `;
                            
                            // Ajouter au conteneur
                            linesContainer.appendChild(lineElement);
                        });
                    }
                    
                    // Ajouter l'écouteur d'événement au bouton d'ajout de ligne
                    const addLineBtn = subcategoryElement.querySelector('.add-line-btn');
                    if (addLineBtn) {
                        addLineBtn.addEventListener('click', function() {
                            addLine(subcategoryElement);
                        });
                    }
                    
                    // Ajouter l'écouteur d'événement au bouton de suppression
                    const deleteSubcategoryBtn = subcategoryElement.querySelector('.delete-subcategory-btn');
                    if (deleteSubcategoryBtn) {
                        deleteSubcategoryBtn.addEventListener('click', function() {
                            deleteSubcategory(subcategoryElement);
                        });
                    }
                });
            }
            
            // Ajouter l'écouteur d'événement au bouton d'ajout de sous-catégorie
            const addSubcategoryBtn = categoryElement.querySelector('.add-subcategory-btn');
            if (addSubcategoryBtn) {
                addSubcategoryBtn.addEventListener('click', function() {
                    addSubcategory(categoryElement);
                });
            }
            
            // Ajouter l'écouteur d'événement au bouton de suppression
            const deleteCategoryBtn = categoryElement.querySelector('.delete-category-btn');
            if (deleteCategoryBtn) {
                deleteCategoryBtn.addEventListener('click', function() {
                    deleteCategory(categoryElement);
                });
            }
        });
        
        // Ajouter des écouteurs pour tous les champs contenteditable
        setupContentEditableListeners();
    }
    
    /**
     * Ajoute une nouvelle catégorie
     */
    function addCategory() {
        // Récupérer le conteneur des catégories
        const categoriesContainer = document.getElementById('categoriesContainer');
        if (!categoriesContainer) return;
        
        // Créer l'élément de catégorie
        const categoryElement = document.createElement('div');
        categoryElement.className = 'expense-category';
        
        categoryElement.innerHTML = `
            <div class="category-header">
                <div class="category-name" contenteditable="true">Nouvelle catégorie</div>
                <div class="category-amount" contenteditable="true">0</div>
                <div class="category-actions">
                    <button type="button" class="btn-sm delete-category-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="subcategories-container"></div>
            <div class="category-footer">
                <button type="button" class="btn-sm add-subcategory-btn">
                    <i class="fas fa-plus"></i> Ajouter une sous-catégorie
                </button>
            </div>
        `;
        
        // Ajouter au conteneur
        categoriesContainer.appendChild(categoryElement);
        
        // Ajouter l'écouteur d'événement au bouton d'ajout de sous-catégorie
        const addSubcategoryBtn = categoryElement.querySelector('.add-subcategory-btn');
        if (addSubcategoryBtn) {
            addSubcategoryBtn.addEventListener('click', function() {
                addSubcategory(categoryElement);
            });
        }
        
        // Ajouter l'écouteur d'événement au bouton de suppression
        const deleteCategoryBtn = categoryElement.querySelector('.delete-category-btn');
        if (deleteCategoryBtn) {
            deleteCategoryBtn.addEventListener('click', function() {
                deleteCategory(categoryElement);
            });
        }
        
        // Ajouter des écouteurs pour les champs contenteditable
        setupContentEditableListeners();
    }
    
    /**
     * Ajoute une nouvelle sous-catégorie à une catégorie
     */
    function addSubcategory(categoryElement) {
        // Récupérer le conteneur des sous-catégories
        const subcategoriesContainer = categoryElement.querySelector('.subcategories-container');
        if (!subcategoriesContainer) return;
        
        // Créer l'élément de sous-catégorie
        const subcategoryElement = document.createElement('div');
        subcategoryElement.className = 'subcategory';
        
        subcategoryElement.innerHTML = `
            <div class="subcategory-header">
                <div class="subcategory-name" contenteditable="true">Nouvelle sous-catégorie</div>
                <div class="subcategory-amount" contenteditable="true">0</div>
                <div class="subcategory-actions">
                    <button type="button" class="btn-sm delete-subcategory-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="expense-lines"></div>
            <div class="subcategory-footer">
                <button type="button" class="btn-sm add-line-btn">
                    <i class="fas fa-plus"></i> Ajouter une ligne
                </button>
            </div>
        `;
        
        // Ajouter au conteneur
        subcategoriesContainer.appendChild(subcategoryElement);
        
        // Ajouter l'écouteur d'événement au bouton d'ajout de ligne
        const addLineBtn = subcategoryElement.querySelector('.add-line-btn');
        if (addLineBtn) {
            addLineBtn.addEventListener('click', function() {
                addLine(subcategoryElement);
            });
        }
        
        // Ajouter l'écouteur d'événement au bouton de suppression
        const deleteSubcategoryBtn = subcategoryElement.querySelector('.delete-subcategory-btn');
        if (deleteSubcategoryBtn) {
            deleteSubcategoryBtn.addEventListener('click', function() {
                deleteSubcategory(subcategoryElement);
            });
        }
        
        // Ajouter des écouteurs pour les champs contenteditable
        setupContentEditableListeners();
    }
    
    /**
     * Ajoute une nouvelle ligne à une sous-catégorie
     */
    function addLine(subcategoryElement) {
        // Récupérer le conteneur des lignes
        const linesContainer = subcategoryElement.querySelector('.expense-lines');
        if (!linesContainer) return;
        
        // Créer l'élément de ligne
        const lineElement = document.createElement('div');
        lineElement.className = 'expense-line';
        
        lineElement.innerHTML = `
            <div class="line-name" contenteditable="true">Nouvelle ligne</div>
            <div class="line-amount" contenteditable="true">0</div>
            <div class="line-actions">
                <button type="button" class="btn-sm delete-line-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Ajouter au conteneur
        linesContainer.appendChild(lineElement);
        
        // Ajouter l'écouteur d'événement au bouton de suppression
        const deleteLineBtn = lineElement.querySelector('.delete-line-btn');
        if (deleteLineBtn) {
            deleteLineBtn.addEventListener('click', function() {
                deleteLine(lineElement);
            });
        }
        
        // Ajouter des écouteurs pour les champs contenteditable
        setupContentEditableListeners();
    }
    
    /**
     * Supprime une catégorie
     */
    function deleteCategory(categoryElement) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
            categoryElement.remove();
        }
    }
    
    /**
     * Supprime une sous-catégorie
     */
    function deleteSubcategory(subcategoryElement) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette sous-catégorie ?')) {
            subcategoryElement.remove();
        }
    }
    
    /**
     * Supprime une ligne
     */
    function deleteLine(lineElement) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette ligne ?')) {
            lineElement.remove();
        }
    }
    
    /**
     * Configure les écouteurs d'événements pour tous les champs contenteditable
     */
    function setupContentEditableListeners() {
        // Tous les champs contenteditable
        const editableFields = document.querySelectorAll('[contenteditable="true"]');
        
        editableFields.forEach(field => {
            // Retirer les anciens écouteurs
            field.removeEventListener('input', updateAmounts);
            field.removeEventListener('blur', updateAmounts);
            
            // Ajouter de nouveaux écouteurs
            field.addEventListener('input', updateAmounts);
            field.addEventListener('blur', updateAmounts);
        });
    }
    
    /**
     * Met à jour les montants des catégories et sous-catégories
     */
    function updateAmounts() {
        // Récupérer toutes les catégories
        const categories = document.querySelectorAll('.expense-category');
        
        categories.forEach(category => {
            // Récupérer toutes les sous-catégories de cette catégorie
            const subcategories = category.querySelectorAll('.subcategory');
            
            // Pour chaque sous-catégorie, calculer la somme des lignes
            subcategories.forEach(subcategory => {
                const lines = subcategory.querySelectorAll('.expense-line');
                
                // Si la sous-catégorie a des lignes, calculer le montant total
                if (lines.length > 0) {
                    let subcategoryTotal = 0;
                    
                    lines.forEach(line => {
                        const lineAmount = line.querySelector('.line-amount');
                        if (lineAmount) {
                            // Extraire la valeur numérique (ignorer les symboles de devise, etc.)
                            const amountStr = lineAmount.textContent.trim();
                            const numericValue = extractNumericValue(amountStr);
                            subcategoryTotal += numericValue;
                        }
                    });
                    
                    // Mettre à jour le montant de la sous-catégorie avec le format approprié
                    const subcategoryAmount = subcategory.querySelector('.subcategory-amount');
                    if (subcategoryAmount) {
                        subcategoryAmount.textContent = formatCurrency(subcategoryTotal);
                        subcategoryAmount.classList.add('calculated-amount');
                    }
                }
            });
            
            // Calculer le montant total de la catégorie en additionnant les sous-catégories
            if (subcategories.length > 0) {
                let categoryTotal = 0;
                
                subcategories.forEach(subcategory => {
                    const subcategoryAmount = subcategory.querySelector('.subcategory-amount');
                    if (subcategoryAmount) {
                        const amountStr = subcategoryAmount.textContent.trim();
                        const numericValue = extractNumericValue(amountStr);
                        categoryTotal += numericValue;
                    }
                });
                
                // Mettre à jour le montant de la catégorie
                const categoryAmount = category.querySelector('.category-amount');
                if (categoryAmount) {
                    categoryAmount.textContent = formatCurrency(categoryTotal);
                    categoryAmount.classList.add('calculated-amount');
                }
            }
        });
    }
    
    /**
     * Extrait la valeur numérique d'une chaîne de caractères contenant un montant
     */
    function extractNumericValue(amountStr) {
        // Si vide, retourner 0
        if (!amountStr) return 0;
        
        // Remplacer les virgules par des points
        const normalized = amountStr.replace(/,/g, '.');
        
        // Extraire uniquement les chiffres et le point décimal
        const matches = normalized.match(/[0-9.]+/g);
        
        if (matches && matches.length > 0) {
            return parseFloat(matches.join('')) || 0;
        }
        
        return 0;
    }
    
    /**
     * Formate un nombre en devise
     */
    function formatCurrency(amount) {
        // Si des fonctions de formatage de devise existent dans l'application, les utiliser
        if (typeof getCurrencySymbol === 'function') {
            const currencySymbol = getCurrencySymbol();
            return `${currencySymbol} ${amount.toFixed(2).replace('.', ',')}`;
        }
        
        // Par défaut, utiliser l'euro
        return `€ ${amount.toFixed(2).replace('.', ',')}`;
    }
    
    /**
     * Sauvegarde le projet
     */
    function saveProject() {
        // Collecter les données du formulaire
        const formData = collectFormData();
        
        try {
            // Charger tous les projets
            const storedProjects = localStorage.getItem('savedProjects');
            let projects = [];
            
            if (storedProjects) {
                projects = JSON.parse(storedProjects);
            }
            
            // Trouver l'index du projet à mettre à jour
            const index = projects.findIndex(p => p.id === projectData.id);
            
            if (index !== -1) {
                // Mettre à jour le projet existant
                projects[index] = {...projectData, ...formData};
                
                // Sauvegarder les projets
                localStorage.setItem('savedProjects', JSON.stringify(projects));
                
                // Afficher une notification
                showNotification('Projet mis à jour avec succès');
                
                // Rediriger vers la page du projet
                setTimeout(function() {
                    window.location.href = 'projet.html?id=' + projectData.id;
                }, 1500);
            } else {
                console.error('Projet non trouvé dans le localStorage');
                alert('Erreur lors de la sauvegarde du projet.');
            }
        } catch (error) {
            console.error('Erreur lors de la sauvegarde du projet:', error);
            alert('Erreur lors de la sauvegarde du projet.');
        }
    }
    
    /**
     * Collecte les données du formulaire
     */
    function collectFormData() {
        // Données de base
        const formData = {
            projectName: document.getElementById('projectName').value,
            projectDate: document.getElementById('projectDate').value,
            projectEndDate: document.getElementById('projectEndDate').value,
            totalBudget: document.getElementById('totalBudget').value,
            projectStatus: document.getElementById('projectStatus').value,
            linkToWallet: document.getElementById('linkToWallet').checked
        };
        
        // Template sélectionné
        const selectedTemplate = document.querySelector('.template-option.selected');
        if (selectedTemplate) {
            formData.template = selectedTemplate.getAttribute('data-template');
        }
        
        // Wishlist
        formData.createWishlist = document.getElementById('createWishlist').checked;
        
        if (formData.createWishlist) {
            formData.wishlistData = {
                recipientType: document.getElementById('wishlistRecipientType').value
            };
            
            if (formData.wishlistData.recipientType === 'other') {
                formData.wishlistData.recipientName = document.getElementById('wishlistRecipientName').value;
            }
        }
        
        // Catégories
        formData.categories = collectCategories();
        
        return formData;
    }
    
    /**
     * Collecte les catégories du formulaire
     */
    function collectCategories() {
        const categories = [];
        
        // Récupérer toutes les catégories
        const categoryElements = document.querySelectorAll('.expense-category');
        
        categoryElements.forEach(categoryEl => {
            const categoryName = categoryEl.querySelector('.category-name')?.textContent.trim() || '';
            const categoryAmount = categoryEl.querySelector('.category-amount')?.textContent.trim() || '';
            
            const subcategories = [];
            const subcategoryElements = categoryEl.querySelectorAll('.subcategory');
            
            subcategoryElements.forEach(subcategoryEl => {
                const subcategoryName = subcategoryEl.querySelector('.subcategory-name')?.textContent.trim() || '';
                const subcategoryAmount = subcategoryEl.querySelector('.subcategory-amount')?.textContent.trim() || '';
                
                const lines = [];
                const lineElements = subcategoryEl.querySelectorAll('.expense-line');
                
                lineElements.forEach(lineEl => {
                    const lineName = lineEl.querySelector('.line-name')?.textContent.trim() || '';
                    const lineAmount = lineEl.querySelector('.line-amount')?.textContent.trim() || '';
                    
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
     * Affiche une notification
     */
    function showNotification(message) {
        // Créer l'élément de notification
        const notification = document.createElement('div');
        notification.className = 'notification success';
        notification.textContent = message;
        
        // Styles
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        notification.style.backgroundColor = '#4CAF50';
        notification.style.color = 'white';
        notification.style.padding = '15px 20px';
        notification.style.borderRadius = '5px';
        notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        notification.style.zIndex = '9999';
        
        // Ajouter au corps du document
        document.body.appendChild(notification);
        
        // Supprimer après quelques secondes
        setTimeout(function() {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
})();