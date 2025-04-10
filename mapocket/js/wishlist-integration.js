/**
 * Module d'intégration de wishlist dans le budget
 * Ce script améliore les fonctionnalités pour lier une wishlist à un projet
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialiser les données de wishlist de démonstration
    initDemoWishlist();
    
    // Appliquer directement nos fonctionnalités améliorées
    // si nous sommes sur la page de création/édition de projet
    if (document.getElementById('linkToWishlist')) {
        console.log("Initialisation des fonctionnalités de wishlist améliorées");
        // Attendre un court délai pour s'assurer que les autres scripts sont chargés
        setTimeout(() => {
            setupWishlistIntegration();
        }, 100);
    }
});

// Fonction pour initialiser les données de wishlist de démonstration
function initDemoWishlist() {
    // Créer des exemples de wishlist si aucune n'existe
    const existingWishlists = JSON.parse(localStorage.getItem('wishlists') || '[]');
    if (existingWishlists.length === 0) {
        const demoWishlist = {
            id: Date.now().toString(),
            name: "Anniversaire de Sophie",
            items: [
                { id: "item1", name: "Gâteau d'anniversaire", price: 45.00 },
                { id: "item2", name: "Décoration salle", price: 35.50 },
                { id: "item3", name: "Bougies spéciales", price: 8.75 }
            ],
            createdAt: new Date().toISOString(),
            linkedProjectId: null
        };
        localStorage.setItem('wishlists', JSON.stringify([demoWishlist]));
        console.log("Liste de souhaits de démonstration créée");
    }
}

// Fonction d'intégration de la wishlist
function setupWishlistIntegration() {
    const linkToWishlistCheckbox = document.getElementById('linkToWishlist');
    const wishlistOptionsDiv = document.getElementById('wishlistOptions');
    const wishlistSelect = document.getElementById('wishlistSelect');
    const newWishlistNameInput = document.getElementById('newWishlistName');
    const createWishlistBtn = document.getElementById('createWishlistBtn');
    
    console.log("Initialisation des fonctionnalités de wishlist améliorées");
    
    if (!linkToWishlistCheckbox || !wishlistOptionsDiv) {
        console.error("Éléments de wishlist manquants dans le DOM");
        return;
    }
    
    // Charger les wishlists existantes
    function loadWishlists() {
        const savedWishlists = JSON.parse(localStorage.getItem('wishlists') || '[]');
        console.log("Chargement des wishlists:", savedWishlists.length, "trouvées");
        
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
        console.log("Chargement des produits de la wishlist:", wishlistId, wishlist?.items?.length || 0, "produits trouvés");
        
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
            <h4><i class="fas fa-list"></i> Produits de la liste (${wishlist.items.length})</h4>
            <div class="wishlist-items-grid"></div>
            <div class="wishlist-budget-integration">
                <button id="addAllWishlistItems" class="btn-primary">
                    <i class="fas fa-plus-circle"></i> Tout ajouter au budget
                </button>
                <div class="wishlist-category-section" style="margin-top: 15px;">
                    <p><strong>Catégoriser les produits :</strong></p>
                    <select id="wishlistCategorySelect" class="form-control">
                        <option value="">-- Sélectionner une catégorie --</option>
                        <option value="wishlist">Créer catégorie "Wishlist"</option>
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
                // Vérifier si ce n'est pas déjà l'option "Wishlist" que nous avons ajoutée
                if (categoryName !== 'Wishlist') {
                    const option = document.createElement('option');
                    option.value = categoryName;
                    option.textContent = categoryName;
                    categorySelect.appendChild(option);
                }
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
                            <h4>Ajouter à la catégorie "${selectedCategory === 'wishlist' ? 'Wishlist (nouvelle)' : selectedCategory}"</h4>
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
                        if (selectedCategory === 'wishlist') {
                            // Créer une catégorie Wishlist si elle n'existe pas
                            addWishlistCategoryIfNeeded();
                            // Ajouter tous les éléments à cette catégorie
                            addAllWishlistItemsToCategory('Wishlist', wishlist.items);
                        } else {
                            // Ajouter tous les éléments à la catégorie sélectionnée
                            addAllWishlistItemsToCategory(selectedCategory, wishlist.items);
                        }
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
        
        // Créer la nouvelle wishlist avec des exemples de produits
        const newWishlist = {
            id: Date.now().toString(),
            name: wishlistName,
            items: [
                { id: "item1" + Date.now(), name: "Gâteau d'anniversaire", price: 45.00 },
                { id: "item2" + Date.now(), name: "Décoration salle", price: 35.50 },
                { id: "item3" + Date.now(), name: "Bougies spéciales", price: 8.75 }
            ],
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
        
        // Charger les produits
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

// Amélioration pour l'ajout de lignes de dépenses
document.addEventListener('DOMContentLoaded', function() {
    // Capture all add-expense-line button clicks
    document.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('add-expense-line-btn')) {
            enhanceExpenseLineFunctionality();
        }
    });
    
    // Initial enhancement in case elements already exist
    enhanceExpenseLineFunctionality();
});

// Function to enhance expense line forms
function enhanceExpenseLineFunctionality() {
    // Find all expense line forms
    const expenseLineForms = document.querySelectorAll('.expense-line-form');
    
    expenseLineForms.forEach(form => {
        // Only enhance if not already enhanced
        if (!form.dataset.enhanced) {
            const addButton = form.querySelector('.btn-add-line');
            const nameInput = form.querySelector('input[id^="newLineName"]');
            const amountInput = form.querySelector('input[id^="newLineAmount"]');
            
            if (addButton && nameInput && amountInput) {
                // Mark as enhanced to avoid duplicates
                form.dataset.enhanced = "true";
                
                // Add visual feedback on successful addition
                const originalClickHandler = addButton.onclick;
                addButton.onclick = function(e) {
                    if (nameInput.value.trim() && amountInput.value.trim()) {
                        // Provide visual feedback
                        const successFeedback = document.createElement('div');
                        successFeedback.className = 'validation-feedback';
                        successFeedback.innerHTML = '<i class="fas fa-check-circle"></i> Ligne ajoutée!';
                        successFeedback.style.color = '#4caf50';
                        successFeedback.style.marginTop = '8px';
                        successFeedback.style.fontWeight = 'bold';
                        
                        form.appendChild(successFeedback);
                        
                        // Remove feedback after animation
                        setTimeout(() => {
                            successFeedback.style.opacity = '0';
                            setTimeout(() => successFeedback.remove(), 300);
                        }, 1500);
                        
                        // Call the original handler
                        if (originalClickHandler) {
                            originalClickHandler.call(this, e);
                        }
                    }
                };
            }
        }
    });
}