// Fonction pour configurer les fonctionnalités liées à la wishlist
function setupWishlistFeatures() {
    const linkToWishlistCheckbox = document.getElementById('linkToWishlist');
    const wishlistOptionsDiv = document.getElementById('wishlistOptions');
    const wishlistSelect = document.getElementById('wishlistSelect');
    const newWishlistNameInput = document.getElementById('newWishlistName');
    const createWishlistBtn = document.getElementById('createWishlistBtn');
    
    if (!linkToWishlistCheckbox || !wishlistOptionsDiv) return;
    
    // Charger les wishlists existantes
    function loadWishlists() {
        const savedWishlists = JSON.parse(localStorage.getItem('wishlists') || '[]');
        
        // Vider le select
        wishlistSelect.innerHTML = '<option value="">-- Sélectionner une liste --</option>';
        
        // Ajouter les options
        savedWishlists.forEach(wishlist => {
            const option = document.createElement('option');
            option.value = wishlist.id;
            option.textContent = wishlist.name;
            wishlistSelect.appendChild(option);
        });
        
        // Si aucune wishlist n'existe, afficher un message
        if (savedWishlists.length === 0) {
            const option = document.createElement('option');
            option.disabled = true;
            option.textContent = 'Aucune liste de souhaits existante';
            wishlistSelect.appendChild(option);
        }
    }
    
    // Fonction pour charger et afficher les produits d'une wishlist
    function loadWishlistItems(wishlistId) {
        if (!wishlistId) return;
        
        const savedWishlists = JSON.parse(localStorage.getItem('wishlists') || '[]');
        const wishlist = savedWishlists.find(w => w.id === wishlistId);
        
        if (!wishlist || !wishlist.items || wishlist.items.length === 0) {
            // Aucun élément dans la wishlist
            const wishlistItemsDiv = document.getElementById('wishlistItems');
            if (wishlistItemsDiv) {
                wishlistItemsDiv.innerHTML = '<p class="text-muted">Aucun produit dans cette liste de souhaits</p>';
            }
            return;
        }
        
        // Créer la section d'affichage des produits
        let wishlistItemsDiv = document.getElementById('wishlistItems');
        
        if (!wishlistItemsDiv) {
            wishlistItemsDiv = document.createElement('div');
            wishlistItemsDiv.id = 'wishlistItems';
            wishlistItemsDiv.className = 'wishlist-items-container';
            wishlistOptionsDiv.appendChild(wishlistItemsDiv);
        }
        
        // Vider et remplir la section
        wishlistItemsDiv.innerHTML = `
            <h4>Produits de la liste de souhaits</h4>
            <div class="wishlist-items-grid"></div>
            <div class="wishlist-budget-integration">
                <button id="addAllWishlistItems" class="btn-primary">
                    <i class="fas fa-plus-circle"></i> Tout ajouter au budget
                </button>
                <div class="wishlist-category-section" style="margin-top: 15px;">
                    <p><strong>Catégoriser les produits :</strong></p>
                    <select id="wishlistCategorySelect" class="form-control">
                        <option value="">-- Sélectionner une catégorie --</option>
                    </select>
                </div>
            </div>
        `;
        
        // Remplir le select des catégories
        const categorySelect = document.getElementById('wishlistCategorySelect');
        const categoriesContainer = document.getElementById('categoriesContainer');
        if (categoriesContainer && categorySelect) {
            const categories = Array.from(categoriesContainer.querySelectorAll('.expense-category'));
            categories.forEach(category => {
                const categoryName = category.querySelector('.category-name').textContent;
                const option = document.createElement('option');
                option.value = categoryName;
                option.textContent = categoryName;
                categorySelect.appendChild(option);
            });
        }
        
        // Ajouter les produits de la wishlist
        const itemsGrid = wishlistItemsDiv.querySelector('.wishlist-items-grid');
        wishlist.items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'wishlist-item';
            itemElement.dataset.itemId = item.id;
            itemElement.dataset.price = item.price || 0;
            
            itemElement.innerHTML = `
                <div class="wishlist-item-info">
                    <div class="wishlist-item-name">${item.name}</div>
                    <div class="wishlist-item-price">${getProjectCurrencySymbol()} ${parseFloat(item.price || 0).toFixed(2)}</div>
                </div>
                <div class="wishlist-item-actions">
                    <button class="add-to-budget-btn" title="Ajouter au budget">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            `;
            
            itemsGrid.appendChild(itemElement);
            
            // Ajouter un gestionnaire d'événement pour le bouton d'ajout
            const addButton = itemElement.querySelector('.add-to-budget-btn');
            addButton.addEventListener('click', function() {
                // Afficher le dialogue de sélection de catégorie
                showCategorySelectionDialog(item);
            });
        });
        
        // Ajouter un gestionnaire pour le bouton "Tout ajouter"
        const addAllButton = document.getElementById('addAllWishlistItems');
        if (addAllButton) {
            addAllButton.addEventListener('click', function() {
                // Créer une catégorie "Wishlist" si elle n'existe pas
                addWishlistCategoryIfNeeded();
                
                // Ajouter tous les éléments à cette catégorie
                addAllWishlistItemsToCategory('Wishlist', wishlist.items);
            });
        }
        
        // Ajouter un gestionnaire pour le select de catégorie
        if (categorySelect) {
            categorySelect.addEventListener('change', function() {
                const selectedCategory = this.value;
                if (selectedCategory) {
                    // Confirmation avant d'ajouter tous les produits
                    const confirmDialog = document.createElement('div');
                    confirmDialog.className = 'center-notification';
                    confirmDialog.innerHTML = `
                        <div class="notification-content">
                            <h4>Ajouter à la catégorie "${selectedCategory}"</h4>
                            <p>Voulez-vous ajouter tous les produits de la wishlist (${wishlist.items.length}) à cette catégorie ?</p>
                        </div>
                        <div class="notification-actions">
                            <button class="notification-cancel">Annuler</button>
                            <button class="notification-confirm">Confirmer</button>
                        </div>
                    `;
                    
                    document.body.appendChild(confirmDialog);
                    
                    // Gérer le bouton d'annulation
                    confirmDialog.querySelector('.notification-cancel').addEventListener('click', function() {
                        confirmDialog.remove();
                        categorySelect.value = '';
                    });
                    
                    // Gérer le bouton de confirmation
                    confirmDialog.querySelector('.notification-confirm').addEventListener('click', function() {
                        // Ajouter tous les éléments à la catégorie sélectionnée
                        addAllWishlistItemsToCategory(selectedCategory, wishlist.items);
                        confirmDialog.remove();
                        categorySelect.value = '';
                    });
                }
            });
        }
    }
    
    // Fonction pour ajouter une catégorie Wishlist si elle n'existe pas
    function addWishlistCategoryIfNeeded() {
        const categoriesContainer = document.getElementById('categoriesContainer');
        const categoryExists = Array.from(categoriesContainer.querySelectorAll('.category-name'))
            .some(elem => elem.textContent === 'Wishlist');
        
        if (!categoryExists) {
            addNewCategory('Wishlist');
            // Notification
            const notification = document.createElement('div');
            notification.className = 'temporary-notification';
            notification.innerHTML = `<i class="fas fa-plus-circle"></i> Catégorie "Wishlist" ajoutée`;
            document.body.appendChild(notification);
            
            // Faire disparaître la notification
            setTimeout(() => {
                notification.classList.add('fade-out');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }, 2000);
        }
    }
    
    // Fonction pour montrer le dialogue de sélection de catégorie
    function showCategorySelectionDialog(item) {
        // Créer le dialogue
        const dialog = document.createElement('div');
        dialog.className = 'center-notification';
        
        // Récupérer la liste des catégories
        const categoriesContainer = document.getElementById('categoriesContainer');
        const categories = Array.from(categoriesContainer.querySelectorAll('.expense-category'))
            .map(category => category.querySelector('.category-name').textContent);
        
        // Ajouter l'option pour créer une catégorie Wishlist
        const optionsHTML = categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
        
        dialog.innerHTML = `
            <div class="notification-content">
                <h4>Ajouter "${item.name}" au budget</h4>
                <p>Prix: ${getProjectCurrencySymbol()} ${parseFloat(item.price || 0).toFixed(2)}</p>
                <div class="form-group" style="margin-top: 15px;">
                    <label for="categorySelect">Choisir une catégorie:</label>
                    <select id="categorySelect" class="form-control">
                        <option value="">-- Sélectionner --</option>
                        <option value="wishlist">Ajouter à "Wishlist" (nouvelle catégorie)</option>
                        ${optionsHTML}
                    </select>
                </div>
            </div>
            <div class="notification-actions">
                <button class="notification-cancel">Annuler</button>
                <button class="notification-confirm" disabled>Ajouter</button>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // Gérer le changement de sélection
        const categorySelect = dialog.querySelector('#categorySelect');
        const confirmButton = dialog.querySelector('.notification-confirm');
        
        categorySelect.addEventListener('change', function() {
            confirmButton.disabled = !this.value;
        });
        
        // Gérer le bouton d'annulation
        dialog.querySelector('.notification-cancel').addEventListener('click', function() {
            dialog.remove();
        });
        
        // Gérer le bouton de confirmation
        confirmButton.addEventListener('click', function() {
            const selectedCategory = categorySelect.value;
            
            if (selectedCategory === 'wishlist') {
                // Créer une catégorie Wishlist si elle n'existe pas
                addWishlistCategoryIfNeeded();
                
                // Ajouter le produit comme sous-catégorie de Wishlist
                const wishlistCategory = Array.from(categoriesContainer.querySelectorAll('.expense-category'))
                    .find(cat => cat.querySelector('.category-name').textContent === 'Wishlist');
                
                if (wishlistCategory) {
                    const subcategoriesContainer = wishlistCategory.querySelector('.subcategories-container');
                    createSubcategoryInContainer(subcategoriesContainer, item.name, item.price || 0);
                }
            } else if (selectedCategory) {
                // Ajouter le produit comme sous-catégorie de la catégorie sélectionnée
                const selectedCategoryElement = Array.from(categoriesContainer.querySelectorAll('.expense-category'))
                    .find(cat => cat.querySelector('.category-name').textContent === selectedCategory);
                
                if (selectedCategoryElement) {
                    const subcategoriesContainer = selectedCategoryElement.querySelector('.subcategories-container');
                    createSubcategoryInContainer(subcategoriesContainer, item.name, item.price || 0);
                }
            }
            
            // Notification
            const notification = document.createElement('div');
            notification.className = 'temporary-notification';
            notification.innerHTML = `<i class="fas fa-check-circle"></i> "${item.name}" ajouté au budget`;
            document.body.appendChild(notification);
            
            // Faire disparaître la notification
            setTimeout(() => {
                notification.classList.add('fade-out');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }, 2000);
            
            // Fermer le dialogue
            dialog.remove();
            
            // Mettre à jour les calculs de budget
            updateBudgetCalculation();
        });
    }
    
    // Fonction pour ajouter tous les éléments d'une wishlist à une catégorie
    function addAllWishlistItemsToCategory(categoryName, items) {
        const categoriesContainer = document.getElementById('categoriesContainer');
        let categoryElement = Array.from(categoriesContainer.querySelectorAll('.expense-category'))
            .find(cat => cat.querySelector('.category-name').textContent === categoryName);
            
        // Si la catégorie n'existe pas, la créer
        if (!categoryElement) {
            addNewCategory(categoryName);
            // Attendre que la catégorie soit créée
            setTimeout(() => {
                categoryElement = Array.from(categoriesContainer.querySelectorAll('.expense-category'))
                    .find(cat => cat.querySelector('.category-name').textContent === categoryName);
                
                if (categoryElement) {
                    addItemsToCategory(categoryElement, items);
                }
            }, 100);
        } else {
            addItemsToCategory(categoryElement, items);
        }
    }
    
    // Fonction auxiliaire pour ajouter les éléments à une catégorie existante
    function addItemsToCategory(categoryElement, items) {
        const subcategoriesContainer = categoryElement.querySelector('.subcategories-container');
        
        if (subcategoriesContainer) {
            items.forEach(item => {
                createSubcategoryInContainer(subcategoriesContainer, item.name, item.price || 0);
            });
            
            // Notification
            const notification = document.createElement('div');
            notification.className = 'temporary-notification';
            notification.innerHTML = `<i class="fas fa-check-circle"></i> ${items.length} produits ajoutés au budget`;
            document.body.appendChild(notification);
            
            // Faire disparaître la notification
            setTimeout(() => {
                notification.classList.add('fade-out');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }, 2000);
            
            // Mettre à jour les calculs de budget
            updateBudgetCalculation();
        }
    }
    
    // Gérer l'affichage des options de wishlist en fonction de l'état de la checkbox
    linkToWishlistCheckbox.addEventListener('change', function() {
        if (this.checked) {
            wishlistOptionsDiv.classList.add('active');
            loadWishlists();
        } else {
            wishlistOptionsDiv.classList.remove('active');
            
            // Supprimer la section d'affichage des produits si elle existe
            const wishlistItemsDiv = document.getElementById('wishlistItems');
            if (wishlistItemsDiv) {
                wishlistItemsDiv.remove();
            }
        }
    });
    
    // Gérer le changement de wishlist sélectionnée
    wishlistSelect.addEventListener('change', function() {
        const selectedWishlistId = this.value;
        
        // Supprimer la section d'affichage des produits si elle existe
        const wishlistItemsDiv = document.getElementById('wishlistItems');
        if (wishlistItemsDiv) {
            wishlistItemsDiv.remove();
        }
        
        if (selectedWishlistId) {
            loadWishlistItems(selectedWishlistId);
        }
    });
    
    // Gérer la création d'une nouvelle wishlist
    createWishlistBtn.addEventListener('click', function() {
        const wishlistName = newWishlistNameInput.value.trim();
        
        if (!wishlistName) {
            // Feedback visuel d'erreur
            newWishlistNameInput.classList.add('error-input');
            newWishlistNameInput.focus();
            
            // Retirer l'effet d'erreur après quelques secondes
            setTimeout(() => {
                newWishlistNameInput.classList.remove('error-input');
            }, 2000);
            return;
        }
        
        // Créer la nouvelle wishlist
        const newWishlist = {
            id: Date.now().toString(),
            name: wishlistName,
            items: [],
            createdAt: new Date().toISOString(),
            linkedProjectId: null // Sera mis à jour lors de la création du projet
        };
        
        // Sauvegarder la wishlist
        const savedWishlists = JSON.parse(localStorage.getItem('wishlists') || '[]');
        savedWishlists.push(newWishlist);
        localStorage.setItem('wishlists', JSON.stringify(savedWishlists));
        
        // Mettre à jour le select et sélectionner la nouvelle wishlist
        loadWishlists();
        wishlistSelect.value = newWishlist.id;
        
        // Charger les produits (qui seront vides)
        loadWishlistItems(newWishlist.id);
        
        // Vider le champ
        newWishlistNameInput.value = '';
        
        // Notification visuelle de succès
        const notification = document.createElement('div');
        notification.className = 'temporary-notification';
        notification.innerHTML = `<i class="fas fa-check-circle"></i> Liste de souhaits "${wishlistName}" créée`;
        document.body.appendChild(notification);
        
        // Faire disparaître la notification
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 2000);
    });
    
    // Gérer la touche Enter dans le champ de création de wishlist
    newWishlistNameInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            createWishlistBtn.click();
        }
    });
    
    // Initialiser l'état initial de la section wishlist
    const currentProject = JSON.parse(localStorage.getItem('currentProject') || '{}');
    if (currentProject.linkToWishlist) {
        linkToWishlistCheckbox.checked = true;
        wishlistOptionsDiv.classList.add('active');
        loadWishlists();
        
        if (currentProject.linkedWishlistId) {
            wishlistSelect.value = currentProject.linkedWishlistId;
            loadWishlistItems(currentProject.linkedWishlistId);
        }
    }
}