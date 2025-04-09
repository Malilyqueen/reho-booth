/**
 * MaPocket - JS Wishlist
 * Gestion des listes de souhaits
 */

// Variables globales
let currentWishlist = null;
let currentItem = null;
let wishlists = [];
let projects = [];

/**
 * Initialisation de la page des listes de souhaits
 */
document.addEventListener('DOMContentLoaded', function() {
    // S'assurer que les préférences sont appliquées avant d'initialiser la page
    if (window.preferencesManager) {
        window.preferencesManager.applyAllPreferences();
    }
    
    // Chargement des listes de souhaits
    loadWishlists();
    
    // Chargement des projets pour les options des listes
    loadProjects();
    
    // Initialisation des écouteurs d'événements
    initEventListeners();
    
    // Afficher/masquer le champ de destinataire en fonction de la sélection
    document.getElementById('wishlistRecipient').addEventListener('change', function(e) {
        const recipientDetails = document.querySelector('.recipient-details');
        if (e.target.value === 'other') {
            recipientDetails.style.display = 'block';
        } else {
            recipientDetails.style.display = 'none';
        }
    });
});

/**
 * Initialisation des écouteurs d'événements
 */
function initEventListeners() {
    // Bouton de création d'une nouvelle liste
    document.getElementById('addWishlistBtn').addEventListener('click', openNewWishlistModal);
    
    // Bouton de retour à la liste des wishlists
    document.getElementById('backToWishlistsBtn').addEventListener('click', showWishlistsList);
    
    // Bouton d'ajout d'un produit
    document.getElementById('addItemBtn').addEventListener('click', openNewItemModal);
    
    // Bouton de modification d'une liste
    document.getElementById('editWishlistBtn').addEventListener('click', () => {
        if (currentWishlist) {
            openEditWishlistModal(currentWishlist.id);
        }
    });
    
    // Bouton de partage de liste
    document.getElementById('shareWishlistBtn').addEventListener('click', openShareModal);
    
    // Filtre des produits
    document.getElementById('filterOptions').addEventListener('change', filterItems);
    
    // Formulaire de wishlist
    document.getElementById('wishlistForm').addEventListener('submit', handleWishlistFormSubmit);
    
    // Formulaire de produit
    document.getElementById('itemForm').addEventListener('submit', handleItemFormSubmit);
    
    // Fermeture des modales
    document.querySelectorAll('.close-modal, .cancel-button').forEach(element => {
        element.addEventListener('click', closeAllModals);
    });
    
    // Copie du lien de partage
    document.getElementById('copyLinkBtn').addEventListener('click', copyShareLink);
    
    // Téléchargement du QR code
    document.getElementById('downloadQrBtn').addEventListener('click', downloadQRCode);
    
    // Partage sur réseaux sociaux
    document.querySelectorAll('.social-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const platform = e.currentTarget.getAttribute('data-platform');
            shareOnPlatform(platform);
        });
    });
    
    // Fermeture des notifications
    document.getElementById('closeNotification').addEventListener('click', hideNotification);
}

/**
 * Charge les listes de souhaits depuis le stockage local
 */
function loadWishlists() {
    // Récupération des listes depuis le stockage local
    wishlists = getWishlistsFromStorage();
    
    if (wishlists.length === 0) {
        // Aucune liste trouvée
        document.querySelector('.wishlists-grid').style.display = 'none';
        document.querySelector('.empty-wishlist-message').style.display = 'block';
        return;
    }
    
    // Affichage des listes dans la grille
    document.querySelector('.wishlists-grid').style.display = 'grid';
    document.querySelector('.empty-wishlist-message').style.display = 'none';
    
    renderWishlistsGrid();
}

/**
 * Récupère les listes de souhaits depuis le stockage local
 */
function getWishlistsFromStorage() {
    const storedWishlists = localStorage.getItem('mapocket_wishlists');
    return storedWishlists ? JSON.parse(storedWishlists) : [];
}

/**
 * Sauvegarde les listes de souhaits dans le stockage local
 */
function saveWishlistsToStorage(updatedWishlists) {
    localStorage.setItem('mapocket_wishlists', JSON.stringify(updatedWishlists));
    wishlists = updatedWishlists;
}

/**
 * Charge les projets depuis le stockage local
 */
function loadProjects() {
    // Récupération des projets depuis le stockage local
    projects = getProjectsFromStorage();
    
    // Mise à jour du select des projets dans le formulaire
    const projectSelect = document.getElementById('linkedProject');
    projectSelect.innerHTML = '<option value="">Aucun projet</option>';
    
    projects.forEach(project => {
        const option = document.createElement('option');
        option.value = project.id;
        option.textContent = project.projectName;
        projectSelect.appendChild(option);
    });
}

/**
 * Récupère les projets depuis le stockage local
 */
function getProjectsFromStorage() {
    const storedProjects = localStorage.getItem('mapocket_projects');
    return storedProjects ? JSON.parse(storedProjects) : [];
}

/**
 * Affiche la grille des listes de souhaits
 */
function renderWishlistsGrid() {
    const grid = document.querySelector('.wishlists-grid');
    grid.innerHTML = '';
    
    wishlists.forEach(wishlist => {
        // Calcul des statistiques
        const totalAmount = calculateTotalAmount(wishlist);
        const giftedAmount = calculateGiftedAmount(wishlist);
        const progressPercentage = totalAmount > 0 ? Math.round((giftedAmount / totalAmount) * 100) : 0;
        const itemsCount = wishlist.items ? wishlist.items.length : 0;
        
        // Création de la carte
        const card = document.createElement('div');
        card.className = `wishlist-card theme-${wishlist.theme || 'default'}`;
        card.dataset.id = wishlist.id;
        
        card.innerHTML = `
            <h3 class="card-title">${wishlist.name}</h3>
            <p class="card-description">${wishlist.description || ''}</p>
            <div class="card-stats">
                <div class="card-stat">
                    <span class="card-stat-value">${formatCurrency(totalAmount)}</span>
                    <span class="card-stat-label">Total</span>
                </div>
                <div class="card-stat">
                    <span class="card-stat-value">${itemsCount}</span>
                    <span class="card-stat-label">Produits</span>
                </div>
                <div class="card-stat">
                    <span class="card-stat-value">${progressPercentage}%</span>
                    <span class="card-stat-label">Offert</span>
                </div>
            </div>
            <div class="card-progress">
                <div class="card-progress-bar" style="width: ${progressPercentage}%;"></div>
            </div>
            <div class="card-actions">
                <button class="edit-wishlist-btn" title="Modifier" data-id="${wishlist.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="share-wishlist-btn" title="Partager" data-id="${wishlist.id}">
                    <i class="fas fa-share-alt"></i>
                </button>
                <button class="delete-wishlist-btn" title="Supprimer" data-id="${wishlist.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Ajout de l'écouteur pour ouvrir le détail de la liste
        card.addEventListener('click', (e) => {
            // Eviter d'ouvrir si on clique sur un bouton d'action
            if (!e.target.closest('.card-actions button')) {
                openWishlistDetail(wishlist.id);
            }
        });
        
        grid.appendChild(card);
    });
    
    // Ajout des écouteurs pour les boutons d'action
    addWishlistCardListeners();
}

/**
 * Ajoute les écouteurs d'événements aux boutons des cartes
 */
function addWishlistCardListeners() {
    // Boutons d'édition
    document.querySelectorAll('.edit-wishlist-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Empêche l'ouverture du détail
            const wishlistId = btn.getAttribute('data-id');
            openEditWishlistModal(wishlistId);
        });
    });
    
    // Boutons de partage
    document.querySelectorAll('.share-wishlist-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Empêche l'ouverture du détail
            const wishlistId = btn.getAttribute('data-id');
            currentWishlist = wishlists.find(w => w.id === wishlistId);
            openShareModal();
        });
    });
    
    // Boutons de suppression
    document.querySelectorAll('.delete-wishlist-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Empêche l'ouverture du détail
            const wishlistId = btn.getAttribute('data-id');
            deleteWishlist(wishlistId);
        });
    });
}

/**
 * Ouvre le détail d'une liste de souhaits
 */
function openWishlistDetail(wishlistId) {
    // Recherche de la liste correspondante
    const wishlist = wishlists.find(w => w.id === wishlistId);
    if (!wishlist) return;
    
    // Stockage de la liste courante
    currentWishlist = wishlist;
    
    // Masquer la grille et afficher le détail
    document.querySelector('.wishlist-container').style.display = 'none';
    document.querySelector('.wishlist-detail-container').style.display = 'block';
    
    // Mise à jour du titre
    document.getElementById('wishlistTitle').textContent = wishlist.name;
    
    // Mise à jour des statistiques
    updateWishlistStats();
    
    // Rendu des produits
    renderWishlistItems();
}

/**
 * Affiche la liste des wishlists
 */
function showWishlistsList() {
    // Masquer le détail et afficher la grille
    document.querySelector('.wishlist-detail-container').style.display = 'none';
    document.querySelector('.wishlist-container').style.display = 'block';
    
    // Réinitialiser la liste courante
    currentWishlist = null;
}

/**
 * Met à jour les statistiques de la liste courante
 */
function updateWishlistStats() {
    if (!currentWishlist) return;
    
    const totalAmount = calculateTotalAmount(currentWishlist);
    const giftedAmount = calculateGiftedAmount(currentWishlist);
    const progressPercentage = totalAmount > 0 ? Math.round((giftedAmount / totalAmount) * 100) : 0;
    
    document.getElementById('totalAmount').textContent = formatCurrency(totalAmount);
    document.getElementById('giftedAmount').textContent = formatCurrency(giftedAmount);
    document.getElementById('progressBar').style.width = `${progressPercentage}%`;
    document.getElementById('progressPercentage').textContent = `${progressPercentage}%`;
}

/**
 * Calcule le montant total d'une liste de souhaits
 */
function calculateTotalAmount(wishlist) {
    if (!wishlist.items || wishlist.items.length === 0) return 0;
    
    return wishlist.items.reduce((total, item) => total + (parseFloat(item.price) || 0), 0);
}

/**
 * Calcule le montant déjà offert d'une liste de souhaits
 */
function calculateGiftedAmount(wishlist) {
    if (!wishlist.items || wishlist.items.length === 0) return 0;
    
    return wishlist.items
        .filter(item => item.status === 'gifted')
        .reduce((total, item) => total + (parseFloat(item.price) || 0), 0);
}

/**
 * Affiche les produits de la liste courante
 */
function renderWishlistItems() {
    const container = document.querySelector('.wishlist-items');
    container.innerHTML = '';
    
    if (!currentWishlist || !currentWishlist.items || currentWishlist.items.length === 0) {
        container.innerHTML = `
            <div class="empty-items-message">
                <i class="fas fa-gift fa-3x"></i>
                <h3>Aucun produit dans cette liste</h3>
                <p>Ajoutez des produits en cliquant sur "Ajouter un produit"</p>
            </div>
        `;
        return;
    }
    
    // Filtrage des produits selon l'option sélectionnée
    const filterValue = document.getElementById('filterOptions').value;
    let filteredItems = [...currentWishlist.items];
    
    switch (filterValue) {
        case 'priority':
            filteredItems = filteredItems.filter(item => item.priority === 'high');
            break;
        case 'gifted':
            filteredItems = filteredItems.filter(item => item.status === 'gifted');
            break;
        case 'pending':
            filteredItems = filteredItems.filter(item => item.status === 'pending');
            break;
        case 'price-asc':
            filteredItems.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
            break;
        case 'price-desc':
            filteredItems.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
            break;
    }
    
    // Affichage des produits filtrés
    filteredItems.forEach(item => {
        const statusLabel = getStatusLabel(item.status);
        const priorityLabel = getPriorityLabel(item.priority);
        
        const itemElement = document.createElement('div');
        itemElement.className = 'wishlist-item';
        itemElement.dataset.id = item.id;
        
        itemElement.innerHTML = `
            <div class="item-image-container">
                <img src="${item.image || 'img/placeholder.svg'}" alt="${item.name}" class="item-image">
                <span class="item-status status-${item.status}">${statusLabel}</span>
                <span class="item-priority priority-${item.priority}">${priorityLabel}</span>
            </div>
            <div class="item-content">
                <h3 class="item-title">${item.name}</h3>
                <p class="item-price">${formatCurrency(item.price)}</p>
                ${item.assignee ? `<p class="item-assignee">Réservé pour: ${item.assignee}</p>` : ''}
                <div class="item-actions">
                    <button class="edit-item-btn" title="Modifier" data-id="${item.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${item.link ? `
                    <a href="${item.link}" target="_blank" class="view-link-btn" title="Voir le produit">
                        <i class="fas fa-external-link-alt"></i>
                    </a>
                    ` : ''}
                    <button class="delete-item-btn" title="Supprimer" data-id="${item.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        container.appendChild(itemElement);
    });
    
    // Ajout des écouteurs pour les boutons d'action
    addItemActionListeners();
}

/**
 * Obtient le libellé d'un statut
 */
function getStatusLabel(status) {
    switch (status) {
        case 'pending': return 'En attente';
        case 'reserved': return 'Réservé';
        case 'gifted': return 'Offert';
        default: return 'En attente';
    }
}

/**
 * Obtient le libellé d'une priorité
 */
function getPriorityLabel(priority) {
    switch (priority) {
        case 'high': return 'Prioritaire';
        case 'medium': return 'Moyenne';
        case 'low': return 'Secondaire';
        default: return 'Moyenne';
    }
}

/**
 * Ajoute les écouteurs d'événements aux boutons des produits
 */
function addItemActionListeners() {
    // Boutons d'édition
    document.querySelectorAll('.edit-item-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const itemId = btn.getAttribute('data-id');
            openEditItemModal(itemId);
        });
    });
    
    // Boutons de suppression
    document.querySelectorAll('.delete-item-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const itemId = btn.getAttribute('data-id');
            deleteItem(itemId);
        });
    });
}

/**
 * Filtre les produits selon l'option sélectionnée
 */
function filterItems() {
    renderWishlistItems();
}

/**
 * Ouvre la modale de création d'une nouvelle liste
 */
function openNewWishlistModal() {
    // Réinitialiser le formulaire
    document.getElementById('wishlistForm').reset();
    document.getElementById('wishlistId').value = '';
    
    // Mise à jour du titre
    document.getElementById('wishlistModalTitle').textContent = 'Nouvelle liste de souhaits';
    
    // Afficher la modale
    document.getElementById('wishlistModal').style.display = 'block';
}

/**
 * Ouvre la modale d'édition d'une liste existante
 */
function openEditWishlistModal(wishlistId) {
    // Recherche de la liste correspondante
    const wishlist = wishlists.find(w => w.id === wishlistId);
    if (!wishlist) return;
    
    // Remplissage du formulaire
    document.getElementById('wishlistId').value = wishlist.id;
    document.getElementById('wishlistName').value = wishlist.name;
    document.getElementById('wishlistDescription').value = wishlist.description || '';
    
    // Configuration du destinataire
    const recipientType = wishlist.recipientType || 'myself';
    document.getElementById('wishlistRecipient').value = recipientType;
    
    // Afficher/masquer le champ des détails du destinataire
    const recipientDetails = document.querySelector('.recipient-details');
    if (recipientType === 'other') {
        recipientDetails.style.display = 'block';
        document.getElementById('recipientName').value = wishlist.recipientName || '';
    } else {
        recipientDetails.style.display = 'none';
    }
    
    document.getElementById('linkedProject').value = wishlist.linkedProject || '';
    document.getElementById('wishlistTheme').value = wishlist.theme || 'default';
    document.getElementById('wishlistPrivacy').value = wishlist.privacy || 'private';
    
    // Mise à jour du titre
    document.getElementById('wishlistModalTitle').textContent = 'Modifier la liste de souhaits';
    
    // Afficher la modale
    document.getElementById('wishlistModal').style.display = 'block';
}

/**
 * Ouvre la modale de création d'un nouveau produit
 */
function openNewItemModal() {
    // Réinitialiser le formulaire
    document.getElementById('itemForm').reset();
    document.getElementById('itemId').value = '';
    
    // Mise à jour du titre
    document.getElementById('itemModalTitle').textContent = 'Ajouter un produit';
    
    // Valeurs par défaut
    document.getElementById('itemPriority').value = 'medium';
    document.getElementById('itemStatus').value = 'pending';
    
    // Afficher la modale
    document.getElementById('itemModal').style.display = 'block';
}

/**
 * Ouvre la modale d'édition d'un produit existant
 */
function openEditItemModal(itemId) {
    if (!currentWishlist || !currentWishlist.items) return;
    
    // Recherche du produit correspondant
    const item = currentWishlist.items.find(i => i.id === itemId);
    if (!item) return;
    
    // Stockage du produit courant
    currentItem = item;
    
    // Remplissage du formulaire
    document.getElementById('itemId').value = item.id;
    document.getElementById('itemName').value = item.name;
    document.getElementById('itemPrice').value = item.price;
    document.getElementById('itemImage').value = item.image || '';
    document.getElementById('itemLink').value = item.link || '';
    document.getElementById('itemPriority').value = item.priority || 'medium';
    document.getElementById('itemAssignee').value = item.assignee || '';
    document.getElementById('itemStatus').value = item.status || 'pending';
    document.getElementById('itemNotes').value = item.notes || '';
    
    // Mise à jour du titre
    document.getElementById('itemModalTitle').textContent = 'Modifier le produit';
    
    // Afficher la modale
    document.getElementById('itemModal').style.display = 'block';
}

/**
 * Ouvre la modale de partage de liste
 */
function openShareModal() {
    if (!currentWishlist) return;
    
    // Génération du lien de partage
    const shareUrl = generateShareUrl(currentWishlist.id);
    document.getElementById('shareLink').value = shareUrl;
    
    // Génération du QR code
    generateQRCode(shareUrl);
    
    // Afficher la modale
    document.getElementById('shareModal').style.display = 'block';
}

/**
 * Génère l'URL de partage pour une liste
 */
function generateShareUrl(wishlistId) {
    // Dans un environnement de production, il faudrait une URL absolue
    // Pour l'exemple, on utilise une URL relative
    return `${window.location.origin}${window.location.pathname}?share=${wishlistId}`;
}

/**
 * Génère un QR code pour l'URL de partage
 */
function generateQRCode(url) {
    const qrContainer = document.getElementById('qrCode');
    qrContainer.innerHTML = '';
    
    if (typeof QRCode !== 'undefined') {
        new QRCode(qrContainer, {
            text: url,
            width: 200,
            height: 200,
            colorDark: '#1d3557',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });
    } else {
        qrContainer.innerHTML = '<p>Bibliothèque QR Code non disponible</p>';
    }
}

/**
 * Copie le lien de partage dans le presse-papier
 */
function copyShareLink() {
    const shareLink = document.getElementById('shareLink');
    shareLink.select();
    document.execCommand('copy');
    
    showNotification('Lien copié dans le presse-papier !', 'success');
}

/**
 * Télécharge l'image du QR code
 */
function downloadQRCode() {
    const qrCanvas = document.querySelector('#qrCode canvas');
    if (!qrCanvas) return;
    
    const link = document.createElement('a');
    link.download = `wishlist-${currentWishlist.name.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.href = qrCanvas.toDataURL();
    link.click();
}

/**
 * Partage la liste sur une plateforme spécifique
 */
function shareOnPlatform(platform) {
    if (!currentWishlist) return;
    
    const shareUrl = document.getElementById('shareLink').value;
    const wishlistName = currentWishlist.name;
    const wishlistDescription = currentWishlist.description || 'Ma liste de souhaits sur MaPocket';
    
    let shareLink = '';
    
    switch (platform) {
        case 'whatsapp':
            shareLink = `https://wa.me/?text=${encodeURIComponent(`${wishlistName} - ${wishlistDescription}\n${shareUrl}`)}`;
            break;
        case 'facebook':
            shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
            break;
        case 'email':
            shareLink = `mailto:?subject=${encodeURIComponent(wishlistName)}&body=${encodeURIComponent(`${wishlistDescription}\n\n${shareUrl}`)}`;
            break;
    }
    
    if (shareLink) {
        window.open(shareLink, '_blank');
    }
}

/**
 * Gère la soumission du formulaire de wishlist
 */
function handleWishlistFormSubmit(event) {
    event.preventDefault();
    
    // Récupération des données du formulaire
    const wishlistId = document.getElementById('wishlistId').value;
    
    // Gestion du destinataire
    const recipientType = document.getElementById('wishlistRecipient').value;
    let recipientName = '';
    
    if (recipientType === 'other') {
        recipientName = document.getElementById('recipientName').value;
    }
    
    const wishlistData = {
        name: document.getElementById('wishlistName').value,
        description: document.getElementById('wishlistDescription').value,
        recipientType: recipientType,
        recipientName: recipientName,
        linkedProject: document.getElementById('linkedProject').value,
        theme: document.getElementById('wishlistTheme').value,
        privacy: document.getElementById('wishlistPrivacy').value
    };
    
    if (wishlistId) {
        // Mise à jour d'une liste existante
        updateWishlist(wishlistId, wishlistData);
    } else {
        // Création d'une nouvelle liste
        createWishlist(wishlistData);
    }
    
    // Fermer la modale
    closeAllModals();
}

/**
 * Crée une nouvelle liste de souhaits
 */
function createWishlist(wishlistData) {
    // Génération d'un identifiant unique
    const newWishlist = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        items: [],
        ...wishlistData
    };
    
    // Ajout à la liste des wishlists
    const updatedWishlists = [...wishlists, newWishlist];
    saveWishlistsToStorage(updatedWishlists);
    
    // Rechargement de l'affichage
    loadWishlists();
    
    // Notification
    showNotification('Liste de souhaits créée avec succès !', 'success');
}

/**
 * Met à jour une liste de souhaits existante
 */
function updateWishlist(wishlistId, wishlistData) {
    // Recherche de la liste à mettre à jour
    const updatedWishlists = wishlists.map(wishlist => {
        if (wishlist.id === wishlistId) {
            return {
                ...wishlist,
                ...wishlistData,
                updatedAt: new Date().toISOString()
            };
        }
        return wishlist;
    });
    
    saveWishlistsToStorage(updatedWishlists);
    
    // Si c'est la liste courante, mise à jour du titre
    if (currentWishlist && currentWishlist.id === wishlistId) {
        currentWishlist = updatedWishlists.find(w => w.id === wishlistId);
        document.getElementById('wishlistTitle').textContent = wishlistData.name;
    }
    
    // Rechargement de l'affichage si on est sur la liste des wishlists
    if (!currentWishlist) {
        loadWishlists();
    }
    
    // Notification
    showNotification('Liste de souhaits mise à jour avec succès !', 'success');
}

/**
 * Supprime une liste de souhaits
 */
function deleteWishlist(wishlistId) {
    // Demande de confirmation
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette liste de souhaits ?')) {
        return;
    }
    
    // Suppression de la liste
    const updatedWishlists = wishlists.filter(wishlist => wishlist.id !== wishlistId);
    saveWishlistsToStorage(updatedWishlists);
    
    // Si c'est la liste courante, retour à la liste des wishlists
    if (currentWishlist && currentWishlist.id === wishlistId) {
        showWishlistsList();
    }
    
    // Rechargement de l'affichage
    loadWishlists();
    
    // Notification
    showNotification('Liste de souhaits supprimée avec succès !', 'success');
}

/**
 * Gère la soumission du formulaire de produit
 */
function handleItemFormSubmit(event) {
    event.preventDefault();
    
    if (!currentWishlist) return;
    
    // Récupération des données du formulaire
    const itemId = document.getElementById('itemId').value;
    const itemData = {
        name: document.getElementById('itemName').value,
        price: document.getElementById('itemPrice').value,
        image: document.getElementById('itemImage').value,
        link: document.getElementById('itemLink').value,
        priority: document.getElementById('itemPriority').value,
        assignee: document.getElementById('itemAssignee').value,
        status: document.getElementById('itemStatus').value,
        notes: document.getElementById('itemNotes').value
    };
    
    if (itemId) {
        // Mise à jour d'un produit existant
        updateItem(itemId, itemData);
    } else {
        // Création d'un nouveau produit
        addItem(itemData);
    }
    
    // Fermer la modale
    closeAllModals();
    
    // Mise à jour des statistiques et de l'affichage des produits
    updateWishlistStats();
    renderWishlistItems();
}

/**
 * Ajoute un nouveau produit à la liste courante
 */
function addItem(itemData) {
    if (!currentWishlist) return;
    
    // Génération d'un identifiant unique
    const newItem = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        ...itemData
    };
    
    // Ajout à la liste courante
    const updatedWishlist = {
        ...currentWishlist,
        items: [...(currentWishlist.items || []), newItem]
    };
    
    // Mise à jour de la liste dans le stockage
    const updatedWishlists = wishlists.map(wishlist => {
        if (wishlist.id === currentWishlist.id) {
            return updatedWishlist;
        }
        return wishlist;
    });
    
    saveWishlistsToStorage(updatedWishlists);
    currentWishlist = updatedWishlist;
    
    // Notification
    showNotification('Produit ajouté avec succès !', 'success');
}

/**
 * Met à jour un produit existant
 */
function updateItem(itemId, itemData) {
    if (!currentWishlist || !currentWishlist.items) return;
    
    // Mise à jour du produit dans la liste courante
    const updatedItems = currentWishlist.items.map(item => {
        if (item.id === itemId) {
            return {
                ...item,
                ...itemData,
                updatedAt: new Date().toISOString()
            };
        }
        return item;
    });
    
    const updatedWishlist = {
        ...currentWishlist,
        items: updatedItems
    };
    
    // Mise à jour de la liste dans le stockage
    const updatedWishlists = wishlists.map(wishlist => {
        if (wishlist.id === currentWishlist.id) {
            return updatedWishlist;
        }
        return wishlist;
    });
    
    saveWishlistsToStorage(updatedWishlists);
    currentWishlist = updatedWishlist;
    
    // Notification
    showNotification('Produit mis à jour avec succès !', 'success');
}

/**
 * Supprime un produit de la liste courante
 */
function deleteItem(itemId) {
    if (!currentWishlist || !currentWishlist.items) return;
    
    // Demande de confirmation
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
        return;
    }
    
    // Suppression du produit
    const updatedItems = currentWishlist.items.filter(item => item.id !== itemId);
    
    const updatedWishlist = {
        ...currentWishlist,
        items: updatedItems
    };
    
    // Mise à jour de la liste dans le stockage
    const updatedWishlists = wishlists.map(wishlist => {
        if (wishlist.id === currentWishlist.id) {
            return updatedWishlist;
        }
        return wishlist;
    });
    
    saveWishlistsToStorage(updatedWishlists);
    currentWishlist = updatedWishlist;
    
    // Mise à jour des statistiques et de l'affichage des produits
    updateWishlistStats();
    renderWishlistItems();
    
    // Notification
    showNotification('Produit supprimé avec succès !', 'success');
}

/**
 * Ferme toutes les modales
 */
function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
}

/**
 * Affiche une notification
 */
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notificationMessage');
    
    notification.className = 'notification';
    notification.classList.add(type);
    notification.classList.add('show');
    
    notificationMessage.textContent = message;
    
    // Fermeture automatique après 3 secondes
    setTimeout(() => {
        hideNotification();
    }, 3000);
}

/**
 * Masque la notification
 */
function hideNotification() {
    const notification = document.getElementById('notification');
    notification.classList.remove('show');
}

/**
 * Traitement des paramètres d'URL pour le partage
 */
function handleUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const shareId = urlParams.get('share');
    
    if (shareId) {
        // Ouverture d'une liste partagée
        const sharedWishlist = wishlists.find(w => w.id === shareId);
        
        if (sharedWishlist) {
            openWishlistDetail(shareId);
            
            // Ajout du bouton pour suggérer un cadeau
            const actionsContainer = document.querySelector('.wishlist-header-actions');
            const suggestButton = document.createElement('button');
            suggestButton.className = 'action-button';
            suggestButton.innerHTML = '<i class="fas fa-gift"></i> Suggérer un cadeau';
            suggestButton.addEventListener('click', openSuggestModal);
            actionsContainer.appendChild(suggestButton);
        } else {
            showNotification('Liste de souhaits introuvable', 'error');
        }
    }
}

/**
 * Ouvre la modale de suggestion de cadeau
 */
function openSuggestModal() {
    if (!currentWishlist) return;
    
    // Réinitialiser le formulaire
    document.getElementById('suggestForm').reset();
    
    // Afficher la modale
    document.getElementById('suggestModal').style.display = 'block';
}

/**
 * Crée une nouvelle liste de souhaits associée à un projet
 * Cette fonction est appelée depuis la page de détail du projet
 */
function createWishlistForProject(projectId) {
    // Vérifier si le projet existe
    const project = projects.find(p => p.id === projectId);
    if (!project) {
        showNotification('Projet introuvable', 'error');
        return;
    }
    
    // Ouvrir la modale de création avec le projet déjà sélectionné
    openNewWishlistModal();
    
    // Pré-remplir certains champs
    document.getElementById('linkedProject').value = projectId;
    
    // Suggérer un nom basé sur le projet
    document.getElementById('wishlistName').value = `Liste de souhaits - ${project.projectName}`;
    
    // Proposer un thème adapté selon le type de projet
    if (project.template) {
        const templateLower = project.template.toLowerCase();
        if (templateLower.includes('anniversaire')) {
            document.getElementById('wishlistTheme').value = 'birthday';
        } else if (templateLower.includes('mariage')) {
            document.getElementById('wishlistTheme').value = 'wedding';
        } else if (templateLower.includes('naissance') || templateLower.includes('bébé')) {
            document.getElementById('wishlistTheme').value = 'baby';
        } else if (templateLower.includes('noël')) {
            document.getElementById('wishlistTheme').value = 'christmas';
        } else if (templateLower.includes('voyage')) {
            document.getElementById('wishlistTheme').value = 'travel';
        }
    }
    
    // Si le projet contient des informations sur le destinataire de la liste, les pré-remplir
    if (project.wishlistData) {
        const recipientType = project.wishlistData.recipientType || 'myself';
        document.getElementById('wishlistRecipient').value = recipientType;
        
        // Afficher le champ de destinataire si nécessaire
        const recipientDetails = document.querySelector('.recipient-details');
        if (recipientType === 'other') {
            recipientDetails.style.display = 'block';
            if (project.wishlistData.recipientName) {
                document.getElementById('recipientName').value = project.wishlistData.recipientName;
            }
        } else {
            recipientDetails.style.display = 'none';
        }
    }
}

/**
 * Formate un montant en devise
 */
function formatCurrency(amount) {
    // Utiliser la fonction globale si elle existe
    if (typeof window.getCurrencySymbol === 'function') {
        // Récupérer les préférences utilisateur pour obtenir la devise
        let currencyCode = 'EUR'; // Devise par défaut
        
        try {
            const savedPrefs = localStorage.getItem('userPreferences');
            if (savedPrefs) {
                const userPreferences = JSON.parse(savedPrefs);
                currencyCode = userPreferences.currency || 'EUR';
            }
        } catch (error) {
            console.error('Erreur lors du chargement des préférences utilisateur:', error);
        }
        
        const currencySymbol = window.getCurrencySymbol(currencyCode);
        return `${currencySymbol} ${parseFloat(amount || 0).toFixed(2)}`;
    }
    
    // Fallback à l'ancienne méthode si la fonction globale n'existe pas
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
    }).format(amount || 0);
}

// Traitement des paramètres d'URL au chargement
document.addEventListener('DOMContentLoaded', handleUrlParams);