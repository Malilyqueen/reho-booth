/**
 * category-suggestions.js
 * Script pour gérer les suggestions dynamiques de titres basées sur les catégories
 */

// Suggestions pour les sous-catégories basées sur la catégorie parente
const categorySubcategorySuggestions = {
    // Vie personnelle
    "Budget mensuel": ["Alimentation", "Logement", "Transport", "Loisirs", "Santé", "Éducation", "Épargne"],
    "Ménage familial": ["Courses", "Factures", "Équipement", "Réparations", "Services"],
    "Maison": ["Loyer/Crédit", "Charges", "Ameublement", "Électroménager", "Jardinage", "Travaux"],
    "Famille": ["Enfants", "École", "Activités", "Garde d'enfants", "Vêtements"],
    "Déménagement": ["Location camion", "Cartons & matériel", "Services de déménagement", "Caution", "Frais d'agence"],
    "Rentrée scolaire": ["Fournitures", "Vêtements", "Livres", "Inscription", "Équipement"],
    "Fêtes de fin d'année": ["Cadeaux", "Décorations", "Repas", "Voyages", "Cartes & envois"],
    "Vacances": ["Transport", "Hébergement", "Repas", "Activités", "Souvenirs"],
    
    // Événementiels
    "Anniversaire": ["Lieu", "Traiteur", "Boissons", "Décoration", "Animation", "Cadeaux", "Invitations"],
    "Mariage": ["Lieu", "Traiteur", "Robe/Costume", "Alliances", "Photographie", "Décoration", "Animation", "Lune de miel"],
    "Baby shower": ["Lieu", "Traiteur", "Décoration", "Jeux", "Cadeaux", "Invitations"],
    "Fête d'entreprise": ["Lieu", "Restauration", "Boissons", "Animation", "Décoration", "Transport", "Hébergement"],
    "Célébration religieuse": ["Lieu de culte", "Cérémonie", "Tenues", "Repas", "Cadeaux", "Décoration"],
    
    // Projets professionnels
    "Lancement de produit": ["Développement", "Marketing", "Communication", "Événement", "Distribution"],
    "Création de site web": ["Design", "Développement", "Contenu", "Hébergement", "Référencement", "Maintenance"],
    "Campagne marketing": ["Conception", "Supports", "Diffusion", "Publicité", "Analyse"],
    "Formation professionnelle": ["Formateurs", "Matériel", "Lieu", "Repas", "Transport", "Hébergement"],
    "Lancement d'entreprise": ["Juridique", "Local", "Équipement", "Marketing", "Stock initial", "Assurances"],
    
    // Objectifs financiers
    "Épargne mensuelle": ["Urgence", "Projets", "Retraite", "Investissements", "Éducation"],
    "Remboursement de dettes": ["Prêt immobilier", "Crédit consommation", "Carte de crédit", "Prêt étudiant"],
    "Projet \"Gros achat\"": ["Versement initial", "Frais annexes", "Accessoires", "Assurance"],
    
    // Collectifs & communautaires
    "Cagnotte / tontine": ["Participants", "Objectifs", "Frais de gestion", "Intérêts"],
    "Association caritative": ["Collecte", "Matériel", "Communication", "Événements", "Administration"],
    "Budget réunion / AG": ["Lieu", "Matériel", "Restauration", "Documentation", "Transport"],
    "Fonds commun": ["Contributions", "Dépenses collectives", "Provisions", "Gestion"],
    
    // Personnalisé & Empty - pas de suggestions par défaut
    "Personnalisé": [],
    "Empty": []
};

// Suggestions pour les lignes de dépenses basées sur la sous-catégorie
const subcategoryLineSuggestions = {
    // Alimentation
    "Alimentation": ["Courses hebdomadaires", "Marché frais", "Livraison repas", "Épicerie fine"],
    "Courses": ["Supermarché", "Boulangerie", "Boucherie", "Fruits et légumes"],
    "Restaurant": ["Déjeuners de travail", "Dîners en famille", "Fast-food", "Cafés"],
    
    // Logement
    "Loyer/Crédit": ["Mensualité principale", "Charges", "Assurance habitation"],
    "Charges": ["Électricité", "Eau", "Gaz", "Internet", "Téléphone"],
    "Ameublement": ["Salon", "Chambre", "Cuisine", "Bureau", "Décoration"],
    
    // Transport
    "Transport": ["Carburant", "Transports en commun", "Taxi/VTC", "Péage", "Stationnement"],
    "Location camion": ["Véhicule principal", "Option kilométrage", "Assurance", "Carburant"],
    
    // Événements
    "Lieu": ["Location salle", "Décoration", "Personnel", "Équipement audio/vidéo"],
    "Traiteur": ["Menu principal", "Desserts", "Service", "Nappes et vaisselle"],
    "Boissons": ["Soft drinks", "Alcool", "Cocktails", "Café/thé"],
    "Animation": ["DJ", "Groupe musical", "Animations enfants", "Photographe"],
    "Décoration": ["Fleurs", "Ballons", "Banderoles", "Éclairage", "Centre de tables"],
    
    // Services professionnels
    "Développement": ["Programmation", "Design", "Tests", "Optimisation"],
    "Marketing": ["Étude de marché", "Publicité", "Relations presse", "Réseaux sociaux"],
    "Communication": ["Supports imprimés", "Vidéos", "Site web", "Email marketing"],
    
    // Par défaut - catégories vides
    "": [] // Pour les catégories sans nom
};

/**
 * Initialise les suggestions pour toutes les catégories existantes
 */
function initializeCategorySuggestions() {
    document.addEventListener('click', function(e) {
        // Détecter les clics sur les boutons d'ajout
        if (e.target.classList.contains('add-line-btn') || e.target.closest('.add-line-btn')) {
            // Trouver la sous-catégorie parente
            const subcategory = e.target.closest('.subcategory');
            if (subcategory) {
                const subcategoryName = subcategory.querySelector('.subcategory-name').textContent;
                const category = subcategory.closest('.expense-category');
                const categoryName = category ? category.querySelector('.category-name').textContent : '';
                
                // Appliquer les suggestions après un court délai pour laisser le temps à la ligne d'être créée
                setTimeout(() => {
                    const lastAddedLine = findLastAddedLine(subcategory);
                    if (lastAddedLine) {
                        addSuggestionsToLine(lastAddedLine, categoryName, subcategoryName);
                    }
                }, 100);
            }
        }
    });
    
    // Écouter les changements sur les modèles de projet pour mettre à jour les suggestions
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('template-option') || e.target.closest('.template-option')) {
            // Quand un nouveau modèle est sélectionné, attendre que les catégories soient générées
            setTimeout(updateAllCategorySuggestions, 500);
        }
    });
}

/**
 * Met à jour les suggestions pour toutes les catégories actuellement affichées
 */
function updateAllCategorySuggestions() {
    // Trouver toutes les sous-catégories
    const subcategories = document.querySelectorAll('.subcategory');
    subcategories.forEach(subcategory => {
        const subcategoryName = subcategory.querySelector('.subcategory-name').textContent;
        const category = subcategory.closest('.expense-category');
        const categoryName = category ? category.querySelector('.category-name').textContent : '';
        
        // Mettre à jour les boutons d'ajout de ligne pour inclure des suggestions
        const addLineBtn = subcategory.querySelector('.add-line-btn');
        if (addLineBtn) {
            updateAddLineBtnWithSuggestions(addLineBtn, categoryName, subcategoryName);
        }
    });
}

/**
 * Met à jour un bouton d'ajout de ligne pour inclure un menu de suggestions
 */
function updateAddLineBtnWithSuggestions(button, categoryName, subcategoryName) {
    // Vérifier si le bouton a déjà été modifié
    if (button.dataset.hasSuggestions === 'true') {
        return;
    }
    
    // Obtenir les suggestions pour cette sous-catégorie
    const suggestions = getLineSuggestions(categoryName, subcategoryName);
    
    // Si pas de suggestions, ne rien faire
    if (!suggestions || suggestions.length === 0) {
        return;
    }
    
    // Marquer le bouton comme ayant des suggestions
    button.dataset.hasSuggestions = 'true';
    
    // Créer un menu déroulant pour les suggestions
    const originalText = button.innerHTML;
    const dropdownContainer = document.createElement('div');
    dropdownContainer.className = 'suggestion-dropdown';
    
    const dropdownBtn = document.createElement('button');
    dropdownBtn.type = 'button';
    dropdownBtn.className = 'suggestion-dropdown-btn';
    dropdownBtn.innerHTML = '<i class="fas fa-lightbulb"></i>';
    dropdownBtn.title = 'Voir les suggestions';
    
    const dropdownContent = document.createElement('div');
    dropdownContent.className = 'suggestion-dropdown-content';
    
    // Ajouter les suggestions au menu
    suggestions.forEach(suggestion => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.textContent = suggestion;
        item.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Trouver le conteneur de lignes
            const expenseLines = button.closest('.expense-lines');
            
            // Obtenir le symbole de devise
            const currencySymbol = getCurrencySymbol ? getCurrencySymbol() : '€';
            
            // Créer une nouvelle ligne avec le titre suggéré
            const newLine = document.createElement('div');
            newLine.className = 'expense-line';
            newLine.innerHTML = `
                <div class="expense-line-name" contenteditable="true">${suggestion}</div>
                <div class="expense-line-amount" contenteditable="true">${currencySymbol} 0</div>
                <div class="expense-line-actions">
                    <button type="button" class="btn-sm btn-delete-line">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            
            // Insérer la nouvelle ligne avant le bouton d'ajout
            expenseLines.insertBefore(newLine, button);
            
            // Initialiser le bouton de suppression de la nouvelle ligne
            const deleteBtn = newLine.querySelector('.btn-delete-line');
            if (typeof initializeDeleteLineButton === 'function') {
                initializeDeleteLineButton(deleteBtn);
            }
            
            // Mettre à jour les totaux
            const subcategory = button.closest('.subcategory');
            if (subcategory && typeof updateSubcategoryTotal === 'function') {
                updateSubcategoryTotal(subcategory);
            }
            
            // Fermer le menu
            dropdownContent.style.display = 'none';
        });
        
        dropdownContent.appendChild(item);
    });
    
    // Ajouter une option pour ajouter une ligne vide
    const emptyItem = document.createElement('div');
    emptyItem.className = 'suggestion-item empty-item';
    emptyItem.innerHTML = '<i class="fas fa-plus"></i> Ligne vide';
    emptyItem.addEventListener('click', function(e) {
        e.stopPropagation();
        
        // Simuler un clic sur le bouton d'ajout original
        button.dataset.suggestionsClick = 'true';
        button.click();
        
        // Fermer le menu
        dropdownContent.style.display = 'none';
    });
    
    dropdownContent.appendChild(emptyItem);
    
    // Ajouter le menu au bouton
    dropdownContainer.appendChild(dropdownBtn);
    dropdownContainer.appendChild(dropdownContent);
    
    // Remplacer le contenu du bouton
    const originalButton = button.cloneNode(true);
    button.innerHTML = '';
    button.appendChild(document.createTextNode(' Ajouter une ligne '));
    button.appendChild(dropdownContainer);
    
    // Gérer l'affichage du menu
    dropdownBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        
        // Toggle l'affichage du menu
        const isDisplayed = dropdownContent.style.display === 'block';
        dropdownContent.style.display = isDisplayed ? 'none' : 'block';
    });
    
    // Fermer le menu quand on clique ailleurs
    document.addEventListener('click', function() {
        dropdownContent.style.display = 'none';
    });
    
    // Modifier le comportement du bouton d'ajout original
    button.addEventListener('click', function(e) {
        // Si le clic vient d'une suggestion, laisser le comportement par défaut
        if (button.dataset.suggestionsClick === 'true') {
            button.dataset.suggestionsClick = 'false';
            return;
        }
        
        // Sinon, afficher le menu de suggestions
        e.stopPropagation();
        dropdownContent.style.display = 'block';
    }, true); // Capture phase
}

/**
 * Trouve la dernière ligne ajoutée dans une sous-catégorie
 */
function findLastAddedLine(subcategory) {
    const expenseLines = subcategory.querySelectorAll('.expense-line');
    return expenseLines[expenseLines.length - 1];
}

/**
 * Ajoute des suggestions à une ligne de dépense existante
 */
function addSuggestionsToLine(line, categoryName, subcategoryName) {
    const nameField = line.querySelector('.expense-line-name');
    if (!nameField || nameField.textContent.trim() !== 'Nouvelle ligne') {
        return; // Ne pas modifier les lignes qui ont déjà un nom personnalisé
    }
    
    // Obtenir les suggestions
    const suggestions = getLineSuggestions(categoryName, subcategoryName);
    if (!suggestions || suggestions.length === 0) {
        return; // Pas de suggestions disponibles
    }
    
    // Créer un menu de suggestions
    const suggestionMenu = document.createElement('div');
    suggestionMenu.className = 'line-suggestion-menu';
    
    // Ajouter les suggestions au menu
    suggestions.forEach(suggestion => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.textContent = suggestion;
        item.addEventListener('click', function() {
            nameField.textContent = suggestion;
            suggestionMenu.remove();
        });
        
        suggestionMenu.appendChild(item);
    });
    
    // Ajouter une option pour garder la valeur par défaut
    const keepDefaultItem = document.createElement('div');
    keepDefaultItem.className = 'suggestion-item keep-default';
    keepDefaultItem.textContent = 'Conserver "Nouvelle ligne"';
    keepDefaultItem.addEventListener('click', function() {
        suggestionMenu.remove();
    });
    
    suggestionMenu.appendChild(keepDefaultItem);
    
    // Positionner et afficher le menu
    line.style.position = 'relative';
    suggestionMenu.style.position = 'absolute';
    suggestionMenu.style.top = nameField.offsetTop + nameField.offsetHeight + 'px';
    suggestionMenu.style.left = nameField.offsetLeft + 'px';
    
    line.appendChild(suggestionMenu);
    
    // Fermer le menu après un clic ailleurs
    document.addEventListener('click', function(e) {
        if (!suggestionMenu.contains(e.target) && e.target !== suggestionMenu) {
            suggestionMenu.remove();
        }
    });
}

/**
 * Obtient les suggestions de lignes pour une catégorie et sous-catégorie données
 */
function getLineSuggestions(categoryName, subcategoryName) {
    // Essayer d'abord les suggestions spécifiques à la sous-catégorie
    if (subcategoryName && subcategoryLineSuggestions[subcategoryName]) {
        return subcategoryLineSuggestions[subcategoryName];
    }
    
    // Si pas de suggestions pour la sous-catégorie, essayer la catégorie
    if (categoryName && categorySubcategorySuggestions[categoryName]) {
        // Retourner les suggestions de catégorie comme suggestions de lignes par défaut
        return categorySubcategorySuggestions[categoryName];
    }
    
    // Si toujours pas de suggestions, retourner un tableau vide
    return [];
}

/**
 * Initialise les suggestions quand le DOM est chargé
 */
document.addEventListener('DOMContentLoaded', function() {
    // Démarrer l'initialisation après un court délai pour s'assurer que les autres scripts ont eu le temps de s'exécuter
    setTimeout(initializeCategorySuggestions, 500);
});

// Exporter les fonctions pour les tests
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeCategorySuggestions,
        updateAllCategorySuggestions,
        getLineSuggestions
    };
}