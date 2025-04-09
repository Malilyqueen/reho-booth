/**
 * MaPocket - Produits Partenaires
 * Gestion des produits partenaires et de leur intégration avec les wishlists
 */

// Structure des catégories
const PRODUCT_CATEGORIES = [
    { id: 'gifts', name: 'Cadeaux', icon: '🎁' },
    { id: 'wedding', name: 'Mariage', icon: '💍' },
    { id: 'baby', name: 'Bébé & Enfant', icon: '👶' },
    { id: 'beauty', name: 'Beauté & Skincare', icon: '💄' },
    { id: 'wellness', name: 'Bien-être & lifestyle', icon: '🧘‍♀️' },
    { id: 'home', name: 'Maison & déco', icon: '🏠' },
    { id: 'business', name: 'Business & organisation', icon: '💼' },
    { id: 'travel', name: 'Voyage & mobilité', icon: '✈️' },
    { id: 'art', name: 'Art, hobbies, loisirs', icon: '🎨' },
    { id: 'giftcards', name: 'Cartes cadeaux & bons plans', icon: '💳' }
];

// Données initiales des produits (à remplacer par un chargement depuis une API externe)
const SAMPLE_PRODUCTS = [
    {
        id: 'p001',
        name: 'Enceinte Bluetooth portable',
        price: 59.99,
        category: 'gifts',
        image: 'images/products/enceinte-bluetooth.jpg',
        link: 'https://www.amazon.fr/dp/B01N5BZCCD',
        description: 'Enceinte portable avec une autonomie de 20h et résistante à l\'eau.'
    },
    {
        id: 'p002',
        name: 'Livre de développement personnel',
        price: 19.99,
        category: 'wellness',
        image: 'images/products/livre-dev-perso.jpg',
        link: 'https://www.amazon.fr/dp/B0864KHBZ5',
        description: 'Bestseller sur les habitudes gagnantes et la productivité.'
    },
    {
        id: 'p003',
        name: 'Carte cadeau Amazon 50€',
        price: 50.00,
        category: 'giftcards',
        image: 'images/products/carte-cadeau-amazon.jpg',
        link: 'https://www.amazon.fr/dp/B01FIS88SY',
        description: 'Carte cadeau Amazon d\'une valeur de 50€, valable 10 ans.'
    },
    {
        id: 'p004',
        name: 'Set de décoration pour mariage',
        price: 34.99,
        category: 'wedding',
        image: 'images/products/deco-mariage.jpg',
        link: 'https://www.amazon.fr/dp/B07RZKSS7K',
        description: 'Kit complet de décoration élégante pour mariage.'
    },
    {
        id: 'p005',
        name: 'Mobile musical pour bébé',
        price: 29.99,
        category: 'baby',
        image: 'images/products/mobile-bebe.jpg',
        link: 'https://www.amazon.fr/dp/B07FZ8JZ6Q',
        description: 'Mobile musical apaisant avec projection d\'étoiles.'
    }
];

// Variable pour stocker les produits chargés
let partnerProducts = [];
// Produits actuellement filtrés par catégorie
let filteredProducts = [];
// Produits dans la wishlist
let wishlistProducts = [];

/**
 * Initialisation du module produits partenaires
 */
document.addEventListener('DOMContentLoaded', function() {
    // S'assurer que les préférences sont appliquées avant d'initialiser la page
    if (window.preferencesManager) {
        window.preferencesManager.applyAllPreferences();
    }
    
    // Vérifier si nous sommes sur la page des produits partenaires
    const partnerProductsContainer = document.getElementById('partner-products-container');
    if (!partnerProductsContainer) return;
    
    console.log('Initialisation du module de produits partenaires');
    
    // Charger les produits
    loadPartnerProducts();
    
    // Initialiser les catégories
    initializeCategories();
    
    // Charger les produits de la wishlist
    loadWishlistProducts();
    
    // Initialiser les écouteurs d'événements
    initEventListeners();
});

/**
 * Charge les produits partenaires (à terme depuis une API ou un fichier JSON)
 */
function loadPartnerProducts() {
    // Pour le prototype, utiliser les données d'exemple
    partnerProducts = SAMPLE_PRODUCTS;
    
    // Dans une implémentation réelle, on utiliserait fetch pour charger les données :
    /*
    fetch('api/partner-products.json')
        .then(response => response.json())
        .then(data => {
            partnerProducts = data;
            renderProducts();
        })
        .catch(error => {
            console.error('Erreur lors du chargement des produits:', error);
            // Utiliser les données d'exemple en fallback
            partnerProducts = SAMPLE_PRODUCTS;
            renderProducts();
        });
    */
    
    // Afficher tous les produits initialement
    filteredProducts = partnerProducts;
    renderProducts();
}

/**
 * Initialise les catégories dans l'interface
 */
function initializeCategories() {
    const categoriesContainer = document.getElementById('product-categories');
    if (!categoriesContainer) return;
    
    // Ajouter la catégorie "Tous"
    let categoriesHTML = `
        <div class="category-item active" data-category="all">
            <span class="category-icon">🔍</span>
            <span class="category-name">Tous</span>
        </div>
    `;
    
    // Ajouter les autres catégories
    PRODUCT_CATEGORIES.forEach(category => {
        categoriesHTML += `
            <div class="category-item" data-category="${category.id}">
                <span class="category-icon">${category.icon}</span>
                <span class="category-name">${category.name}</span>
            </div>
        `;
    });
    
    categoriesContainer.innerHTML = categoriesHTML;
    
    // Ajouter les écouteurs d'événements pour les catégories
    const categoryItems = document.querySelectorAll('.category-item');
    categoryItems.forEach(item => {
        item.addEventListener('click', function() {
            // Supprimer la classe active de toutes les catégories
            categoryItems.forEach(cat => cat.classList.remove('active'));
            
            // Ajouter la classe active à cette catégorie
            this.classList.add('active');
            
            // Filtrer les produits par catégorie
            const category = this.getAttribute('data-category');
            filterProductsByCategory(category);
        });
    });
}

/**
 * Filtre les produits par catégorie
 */
function filterProductsByCategory(category) {
    if (category === 'all') {
        filteredProducts = partnerProducts;
    } else {
        filteredProducts = partnerProducts.filter(product => product.category === category);
    }
    
    renderProducts();
}

/**
 * Affiche les produits dans l'interface
 */
function renderProducts() {
    const productsContainer = document.getElementById('products-grid');
    if (!productsContainer) return;
    
    if (filteredProducts.length === 0) {
        productsContainer.innerHTML = `
            <div class="no-products-message">
                <p>Aucun produit trouvé dans cette catégorie.</p>
            </div>
        `;
        return;
    }
    
    let productsHTML = '';
    
    filteredProducts.forEach(product => {
        // Vérifier si le produit est déjà dans la wishlist
        const isInWishlist = wishlistProducts.some(item => item.productId === product.id);
        const buttonText = isInWishlist ? 'Dans ma wishlist' : 'Ajouter à ma wishlist';
        const buttonClass = isInWishlist ? 'btn-success' : 'btn-primary';
        
        productsHTML += `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" onerror="this.src='images/product-placeholder.jpg'">
                </div>
                <div class="product-details">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-price">${formatCurrency(product.price)}</p>
                    <p class="product-description">${product.description}</p>
                    <div class="product-actions">
                        <a href="${product.link}" target="_blank" class="btn btn-outline-primary">Voir le produit</a>
                        <button class="btn ${buttonClass} add-to-wishlist" ${isInWishlist ? 'disabled' : ''}>
                            ${buttonText}
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    productsContainer.innerHTML = productsHTML;
    
    // Ajouter les écouteurs d'événements pour les boutons d'ajout à la wishlist
    const addToWishlistButtons = document.querySelectorAll('.add-to-wishlist');
    addToWishlistButtons.forEach(button => {
        if (button.disabled) return;
        
        button.addEventListener('click', function() {
            const productCard = this.closest('.product-card');
            const productId = productCard.getAttribute('data-product-id');
            addProductToWishlist(productId);
        });
    });
}

/**
 * Charge les produits de la wishlist depuis le localStorage
 */
function loadWishlistProducts() {
    try {
        const savedWishlistProducts = localStorage.getItem('partner_wishlist_products');
        wishlistProducts = savedWishlistProducts ? JSON.parse(savedWishlistProducts) : [];
    } catch (error) {
        console.error('Erreur lors du chargement des produits de la wishlist:', error);
        wishlistProducts = [];
    }
}

/**
 * Sauvegarde les produits de la wishlist dans le localStorage
 */
function saveWishlistProducts() {
    try {
        localStorage.setItem('partner_wishlist_products', JSON.stringify(wishlistProducts));
    } catch (error) {
        console.error('Erreur lors de la sauvegarde des produits de la wishlist:', error);
        showNotification('Erreur lors de la sauvegarde de votre wishlist', 'error');
    }
}

/**
 * Ajoute un produit partenaire à la wishlist
 */
function addProductToWishlist(productId) {
    // Trouver le produit dans la liste des produits
    const product = partnerProducts.find(p => p.id === productId);
    if (!product) {
        console.error('Produit non trouvé:', productId);
        return;
    }
    
    // Vérifier si le produit est déjà dans la wishlist
    if (wishlistProducts.some(item => item.productId === productId)) {
        showNotification('Ce produit est déjà dans votre wishlist', 'info');
        return;
    }
    
    // Ajouter à la wishlist
    const wishlistItem = {
        id: Date.now().toString(),
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        link: product.link,
        description: product.description,
        addedAt: new Date().toISOString(),
        purchased: false,
        reminded: false,
        lastReminder: null
    };
    
    wishlistProducts.push(wishlistItem);
    saveWishlistProducts();
    
    // Mettre à jour l'interface
    renderProducts();
    
    // Afficher une notification
    showNotification('Produit ajouté à votre wishlist !', 'success');
    
    // Mettre à jour le nombre d'éléments dans la wishlist dans le menu
    updateWishlistCounter();
}

/**
 * Affiche la wishlist dans l'interface
 */
function renderWishlist() {
    const wishlistContainer = document.getElementById('wishlist-products');
    if (!wishlistContainer) return;
    
    if (wishlistProducts.length === 0) {
        wishlistContainer.innerHTML = `
            <div class="empty-wishlist">
                <p>Votre wishlist est vide.</p>
                <button class="btn btn-primary" id="browse-products-btn">Parcourir les produits</button>
            </div>
        `;
        
        const browseBtn = document.getElementById('browse-products-btn');
        if (browseBtn) {
            browseBtn.addEventListener('click', function() {
                // Basculer vers l'onglet des produits
                const productsTab = document.querySelector('[data-tab="products-tab"]');
                if (productsTab) productsTab.click();
            });
        }
        
        return;
    }
    
    let wishlistHTML = '';
    
    wishlistProducts.forEach(item => {
        wishlistHTML += `
            <div class="wishlist-item" data-item-id="${item.id}">
                <div class="wishlist-item-image">
                    <img src="${item.image}" alt="${item.name}" onerror="this.src='images/product-placeholder.jpg'">
                </div>
                <div class="wishlist-item-details">
                    <h3 class="wishlist-item-name">${item.name}</h3>
                    <p class="wishlist-item-price">${formatCurrency(item.price)}</p>
                    <p class="wishlist-item-description">${item.description}</p>
                    <div class="wishlist-item-actions">
                        <a href="${item.link}" target="_blank" class="btn btn-primary">Acheter ce produit</a>
                        <button class="btn btn-outline-danger remove-from-wishlist">Retirer de la wishlist</button>
                        ${item.purchased ? 
                            `<span class="badge badge-success">Acheté</span>` : 
                            `<button class="btn btn-outline-success mark-as-purchased">Marquer comme acheté</button>`
                        }
                    </div>
                </div>
            </div>
        `;
    });
    
    wishlistContainer.innerHTML = wishlistHTML;
    
    // Ajouter les écouteurs d'événements
    const removeButtons = document.querySelectorAll('.remove-from-wishlist');
    removeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const wishlistItem = this.closest('.wishlist-item');
            const itemId = wishlistItem.getAttribute('data-item-id');
            removeFromWishlist(itemId);
        });
    });
    
    const purchaseButtons = document.querySelectorAll('.mark-as-purchased');
    purchaseButtons.forEach(button => {
        button.addEventListener('click', function() {
            const wishlistItem = this.closest('.wishlist-item');
            const itemId = wishlistItem.getAttribute('data-item-id');
            markAsPurchased(itemId);
        });
    });
}

/**
 * Supprime un produit de la wishlist
 */
function removeFromWishlist(itemId) {
    wishlistProducts = wishlistProducts.filter(item => item.id !== itemId);
    saveWishlistProducts();
    renderWishlist();
    updateWishlistCounter();
    showNotification('Produit retiré de votre wishlist', 'info');
}

/**
 * Marque un produit comme acheté
 */
function markAsPurchased(itemId) {
    const itemIndex = wishlistProducts.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return;
    
    wishlistProducts[itemIndex].purchased = true;
    wishlistProducts[itemIndex].purchasedAt = new Date().toISOString();
    
    saveWishlistProducts();
    renderWishlist();
    
    // Demander à l'utilisateur s'il souhaite ajouter cet achat à un projet
    showAddToBudgetModal(wishlistProducts[itemIndex]);
}

/**
 * Affiche une modale pour ajouter un achat à un projet
 */
function showAddToBudgetModal(item) {
    // Créer la modale
    const modal = document.createElement('div');
    modal.className = 'modal add-to-budget-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Ajouter à un projet</h2>
                <span class="close-modal">&times;</span>
            </div>
            <div class="modal-body">
                <p>Vous avez acheté "${item.name}" pour ${formatCurrency(item.price)}.</p>
                <p>Souhaitez-vous ajouter cette dépense à l'un de vos projets ?</p>
                
                <div class="form-group">
                    <label for="projectSelect">Choisir un projet :</label>
                    <select id="projectSelect" class="form-control">
                        <option value="">-- Sélectionner un projet --</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="categorySelect">Catégorie de dépense :</label>
                    <select id="categorySelect" class="form-control" disabled>
                        <option value="">-- Sélectionner une catégorie --</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="expenseName">Nom de la dépense :</label>
                    <input type="text" id="expenseName" class="form-control" value="${item.name}">
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="cancelAddToBudget">Ignorer</button>
                <button class="btn btn-primary" id="confirmAddToBudget" disabled>Ajouter au projet</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    
    // Charger les projets de l'utilisateur
    loadProjectsForSelect();
    
    // Gérer les événements
    const closeBtn = modal.querySelector('.close-modal');
    const cancelBtn = document.getElementById('cancelAddToBudget');
    const confirmBtn = document.getElementById('confirmAddToBudget');
    const projectSelect = document.getElementById('projectSelect');
    
    closeBtn.addEventListener('click', () => {
        modal.remove();
    });
    
    cancelBtn.addEventListener('click', () => {
        modal.remove();
    });
    
    projectSelect.addEventListener('change', function() {
        const categorySelect = document.getElementById('categorySelect');
        if (this.value) {
            categorySelect.disabled = false;
            loadCategoriesForProject(this.value);
            confirmBtn.disabled = false;
        } else {
            categorySelect.disabled = true;
            categorySelect.innerHTML = '<option value="">-- Sélectionner une catégorie --</option>';
            confirmBtn.disabled = true;
        }
    });
    
    confirmBtn.addEventListener('click', () => {
        const projectId = projectSelect.value;
        const categoryId = document.getElementById('categorySelect').value;
        const expenseName = document.getElementById('expenseName').value;
        
        addExpenseToProject(projectId, categoryId, expenseName, item.price);
        modal.remove();
    });
}

/**
 * Charge les projets pour le sélecteur
 */
function loadProjectsForSelect() {
    const projectSelect = document.getElementById('projectSelect');
    if (!projectSelect) return;
    
    // Récupérer les projets depuis le localStorage
    try {
        const savedProjects = localStorage.getItem('savedProjects');
        const projects = savedProjects ? JSON.parse(savedProjects) : [];
        
        if (projects.length === 0) {
            projectSelect.innerHTML = '<option value="">Aucun projet disponible</option>';
            return;
        }
        
        let options = '<option value="">-- Sélectionner un projet --</option>';
        projects.forEach(project => {
            options += `<option value="${project.id}">${project.projectName}</option>`;
        });
        
        projectSelect.innerHTML = options;
    } catch (error) {
        console.error('Erreur lors du chargement des projets:', error);
        projectSelect.innerHTML = '<option value="">Erreur de chargement</option>';
    }
}

/**
 * Charge les catégories pour un projet
 */
function loadCategoriesForProject(projectId) {
    const categorySelect = document.getElementById('categorySelect');
    if (!categorySelect) return;
    
    // Récupérer le projet
    try {
        const savedProjects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
        const project = savedProjects.find(p => p.id === projectId);
        
        if (!project || !project.categories || project.categories.length === 0) {
            categorySelect.innerHTML = '<option value="">Aucune catégorie disponible</option>';
            return;
        }
        
        let options = '<option value="">-- Sélectionner une catégorie --</option>';
        project.categories.forEach((category, index) => {
            options += `<option value="${index}">${category.name}</option>`;
        });
        
        categorySelect.innerHTML = options;
    } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
        categorySelect.innerHTML = '<option value="">Erreur de chargement</option>';
    }
}

/**
 * Ajoute une dépense à un projet
 */
function addExpenseToProject(projectId, categoryIndex, expenseName, amount) {
    try {
        const savedProjects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
        const projectIndex = savedProjects.findIndex(p => p.id === projectId);
        
        if (projectIndex === -1) {
            showNotification('Projet introuvable', 'error');
            return;
        }
        
        const project = savedProjects[projectIndex];
        
        // Si aucune catégorie n'est sélectionnée, ajouter à Divers ou créer une nouvelle catégorie
        if (!categoryIndex || categoryIndex === '') {
            let diversCategory = project.categories.find(c => c.name === 'Divers');
            
            if (!diversCategory) {
                // Créer une nouvelle catégorie Divers
                project.categories.push({
                    name: 'Divers',
                    amount: formatCurrency(amount),
                    subcategories: [{
                        name: 'Autres dépenses',
                        amount: formatCurrency(amount),
                        lines: [{
                            name: expenseName,
                            amount: formatCurrency(amount)
                        }]
                    }]
                });
            } else {
                // Trouver ou créer une sous-catégorie Autres dépenses
                let diversSubcategory = diversCategory.subcategories.find(s => s.name === 'Autres dépenses');
                
                if (!diversSubcategory) {
                    diversCategory.subcategories.push({
                        name: 'Autres dépenses',
                        amount: formatCurrency(amount),
                        lines: [{
                            name: expenseName,
                            amount: formatCurrency(amount)
                        }]
                    });
                } else {
                    // Ajouter la ligne à la sous-catégorie existante
                    diversSubcategory.lines.push({
                        name: expenseName,
                        amount: formatCurrency(amount)
                    });
                    
                    // Mettre à jour le montant de la sous-catégorie
                    const subcategoryTotal = diversSubcategory.lines.reduce((total, line) => {
                        const lineAmount = parseFloat(line.amount.replace(/[^0-9.,]/g, '').replace(',', '.'));
                        return total + (isNaN(lineAmount) ? 0 : lineAmount);
                    }, 0);
                    
                    diversSubcategory.amount = formatCurrency(subcategoryTotal);
                }
                
                // Mettre à jour le montant de la catégorie
                const categoryTotal = diversCategory.subcategories.reduce((total, subcategory) => {
                    const subcategoryAmount = parseFloat(subcategory.amount.replace(/[^0-9.,]/g, '').replace(',', '.'));
                    return total + (isNaN(subcategoryAmount) ? 0 : subcategoryAmount);
                }, 0);
                
                diversCategory.amount = formatCurrency(categoryTotal);
            }
        } else {
            // Ajouter à la catégorie sélectionnée
            const category = project.categories[categoryIndex];
            
            if (!category) {
                showNotification('Catégorie introuvable', 'error');
                return;
            }
            
            // Ajouter à la première sous-catégorie ou en créer une si nécessaire
            if (!category.subcategories || category.subcategories.length === 0) {
                category.subcategories = [{
                    name: 'Dépenses générales',
                    amount: formatCurrency(amount),
                    lines: [{
                        name: expenseName,
                        amount: formatCurrency(amount)
                    }]
                }];
            } else {
                const subcategory = category.subcategories[0];
                subcategory.lines.push({
                    name: expenseName,
                    amount: formatCurrency(amount)
                });
                
                // Mettre à jour le montant de la sous-catégorie
                const subcategoryTotal = subcategory.lines.reduce((total, line) => {
                    const lineAmount = parseFloat(line.amount.replace(/[^0-9.,]/g, '').replace(',', '.'));
                    return total + (isNaN(lineAmount) ? 0 : lineAmount);
                }, 0);
                
                subcategory.amount = formatCurrency(subcategoryTotal);
            }
            
            // Mettre à jour le montant de la catégorie
            const categoryTotal = category.subcategories.reduce((total, subcategory) => {
                const subcategoryAmount = parseFloat(subcategory.amount.replace(/[^0-9.,]/g, '').replace(',', '.'));
                return total + (isNaN(subcategoryAmount) ? 0 : subcategoryAmount);
            }, 0);
            
            category.amount = formatCurrency(categoryTotal);
        }
        
        // Mettre à jour le budget total du projet
        const projectTotal = project.categories.reduce((total, category) => {
            const categoryAmount = parseFloat(category.amount.replace(/[^0-9.,]/g, '').replace(',', '.'));
            return total + (isNaN(categoryAmount) ? 0 : categoryAmount);
        }, 0);
        
        project.totalBudget = formatCurrency(projectTotal);
        
        // Mettre à jour les dépenses réelles du projet
        if (!project.realExpenses) {
            project.realExpenses = [];
        }
        
        project.realExpenses.push({
            name: expenseName,
            amount: formatCurrency(amount),
            date: new Date().toISOString(),
            category: project.categories[categoryIndex]?.name || 'Divers',
            source: 'wishlist'
        });
        
        // Sauvegarder les projets mis à jour
        localStorage.setItem('savedProjects', JSON.stringify(savedProjects));
        
        showNotification('Dépense ajoutée au projet avec succès !', 'success');
    } catch (error) {
        console.error('Erreur lors de l\'ajout de la dépense au projet:', error);
        showNotification('Erreur lors de l\'ajout de la dépense', 'error');
    }
}

/**
 * Met à jour le compteur de produits dans la wishlist
 */
function updateWishlistCounter() {
    const counter = document.getElementById('wishlist-counter');
    if (!counter) return;
    
    const count = wishlistProducts.filter(item => !item.purchased).length;
    
    if (count > 0) {
        counter.textContent = count;
        counter.style.display = 'block';
    } else {
        counter.style.display = 'none';
    }
}

/**
 * Configure le système de rappel pour les produits non achetés
 */
function setupReminderSystem() {
    // Vérifier s'il y a des produits qui n'ont pas été rappelés récemment
    const now = new Date();
    const reminderThreshold = 7 * 24 * 60 * 60 * 1000; // 7 jours en millisecondes
    
    wishlistProducts.forEach(item => {
        if (item.purchased) return;
        
        const lastReminder = item.lastReminder ? new Date(item.lastReminder) : null;
        const timeSinceAdded = now - new Date(item.addedAt);
        
        // Si le produit a été ajouté il y a plus de 7 jours et n'a jamais été rappelé
        // Ou si le dernier rappel date de plus de 7 jours
        if ((!lastReminder && timeSinceAdded > reminderThreshold) || 
            (lastReminder && (now - lastReminder) > reminderThreshold)) {
            
            showPurchaseReminder(item);
        }
    });
}

/**
 * Affiche un rappel pour un produit non acheté
 */
function showPurchaseReminder(item) {
    const reminderModal = document.createElement('div');
    reminderModal.className = 'modal reminder-modal';
    reminderModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Rappel d'achat</h2>
                <span class="close-modal">&times;</span>
            </div>
            <div class="modal-body">
                <p>Vous avez ajouté "${item.name}" à votre wishlist ${formatTimeAgo(item.addedAt)}.</p>
                <p>Avez-vous acheté ce produit ?</p>
                
                <div class="product-reminder-card">
                    <img src="${item.image}" alt="${item.name}" onerror="this.src='images/product-placeholder.jpg'">
                    <div class="product-reminder-details">
                        <h3>${item.name}</h3>
                        <p class="price">${formatCurrency(item.price)}</p>
                        <a href="${item.link}" target="_blank" class="btn btn-sm btn-outline-primary">Voir le produit</a>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="remindLater">Me rappeler plus tard</button>
                <button class="btn btn-success" id="markPurchased">Oui, je l'ai acheté</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(reminderModal);
    reminderModal.style.display = 'block';
    
    // Gérer les événements
    const closeBtn = reminderModal.querySelector('.close-modal');
    const remindLaterBtn = document.getElementById('remindLater');
    const markPurchasedBtn = document.getElementById('markPurchased');
    
    closeBtn.addEventListener('click', () => {
        updateItemReminder(item.id);
        reminderModal.remove();
    });
    
    remindLaterBtn.addEventListener('click', () => {
        updateItemReminder(item.id);
        reminderModal.remove();
    });
    
    markPurchasedBtn.addEventListener('click', () => {
        markAsPurchased(item.id);
        reminderModal.remove();
    });
}

/**
 * Met à jour la date du dernier rappel pour un produit
 */
function updateItemReminder(itemId) {
    const itemIndex = wishlistProducts.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return;
    
    wishlistProducts[itemIndex].lastReminder = new Date().toISOString();
    wishlistProducts[itemIndex].reminded = true;
    
    saveWishlistProducts();
}

/**
 * Formate la date en "il y a X jours/heures"
 */
function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        if (diffHours === 0) {
            const diffMinutes = Math.floor(diffTime / (1000 * 60));
            return `il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
        }
        return `il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    } else if (diffDays === 1) {
        return 'hier';
    } else if (diffDays < 7) {
        return `il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else if (diffDays < 30) {
        const diffWeeks = Math.floor(diffDays / 7);
        return `il y a ${diffWeeks} semaine${diffWeeks > 1 ? 's' : ''}`;
    } else {
        const diffMonths = Math.floor(diffDays / 30);
        return `il y a ${diffMonths} mois`;
    }
}

/**
 * Initialise les écouteurs d'événements
 */
function initEventListeners() {
    // Gestionnaire pour les onglets (produits / wishlist)
    const tabButtons = document.querySelectorAll('.partner-tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    // Recherche de produits
    const searchInput = document.getElementById('product-search');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function() {
            searchProducts(this.value);
        }, 300));
    }
}

/**
 * Change d'onglet (produits / wishlist)
 */
function switchTab(tabId) {
    // Masquer tous les onglets
    const tabs = document.querySelectorAll('.partner-tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Afficher l'onglet demandé
    const activeTab = document.getElementById(tabId);
    if (activeTab) activeTab.classList.add('active');
    
    // Mettre à jour les boutons d'onglet
    const tabButtons = document.querySelectorAll('.partner-tab-btn');
    tabButtons.forEach(button => {
        if (button.getAttribute('data-tab') === tabId) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
    
    // Si on affiche l'onglet wishlist, mettre à jour la wishlist
    if (tabId === 'wishlist-tab') {
        renderWishlist();
    }
}

/**
 * Recherche des produits
 */
function searchProducts(query) {
    if (!query || query.trim() === '') {
        // Réinitialiser les produits affichés avec le filtre de catégorie actuel
        const activeCategory = document.querySelector('.category-item.active');
        if (activeCategory) {
            const category = activeCategory.getAttribute('data-category');
            filterProductsByCategory(category);
        } else {
            filteredProducts = partnerProducts;
            renderProducts();
        }
        return;
    }
    
    query = query.toLowerCase().trim();
    
    // Récupérer la catégorie actuellement sélectionnée
    const activeCategory = document.querySelector('.category-item.active');
    const category = activeCategory ? activeCategory.getAttribute('data-category') : 'all';
    
    // Filtrer d'abord par catégorie si nécessaire
    const categoryFiltered = category === 'all' ? 
        partnerProducts : 
        partnerProducts.filter(product => product.category === category);
    
    // Puis filtrer par la recherche
    filteredProducts = categoryFiltered.filter(product => 
        product.name.toLowerCase().includes(query) || 
        product.description.toLowerCase().includes(query)
    );
    
    renderProducts();
}

/**
 * Formate un montant en devise
 */
function formatCurrency(amount) {
    // Utiliser la fonction globale si elle existe
    if (typeof window.formatCurrency === 'function') {
        return window.formatCurrency(amount);
    }
    
    // Utiliser le formateur par défaut
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
    }).format(amount || 0);
}

/**
 * Fonction utilitaire debounce pour limiter les appels fréquents
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
 * Affiche une notification
 */
function showNotification(message, type = 'info') {
    // Utiliser la fonction globale si elle existe
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
        return;
    }
    
    // Créer une notification par défaut
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <p>${message}</p>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    // Animer l'apparition
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Fermer automatiquement après 5 secondes
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
    
    // Ajouter un gestionnaire pour fermer manuellement
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
}

// Initialiser le système de rappel au chargement
document.addEventListener('DOMContentLoaded', function() {
    // Attendre quelques secondes avant de montrer des rappels
    setTimeout(setupReminderSystem, 5000);
    
    // Actualiser le système de rappel toutes les heures
    setInterval(setupReminderSystem, 3600 * 1000);
});