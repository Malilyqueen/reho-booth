// Script dédié à l'édition des champs dans les projets
document.addEventListener('DOMContentLoaded', function() {
    // Rendre tous les champs éditables cliquables
    makeAllFieldsEditable();
    
    // Observer les changements dans le DOM pour rendre les nouveaux éléments éditables aussi
    observeDOMChanges();
});

// Fonction pour rendre tous les éléments éditables
function makeAllFieldsEditable() {
    // Rechercher tous les éléments avec la classe editable-field
    document.querySelectorAll('.category-name, .category-amount, .subcategory-name, .subcategory-amount').forEach(element => {
        // Ajouter la classe editable-field
        element.classList.add('editable-field');
        
        // Sauvegarder la valeur originale
        element.setAttribute('data-original-value', element.textContent.trim());
        
        // Ajouter l'écouteur d'événement pour le clic
        element.addEventListener('click', function() {
            const isAmount = element.classList.contains('category-amount') || 
                             element.classList.contains('subcategory-amount');
            makeFieldEditable(this, isAmount ? 'number' : 'text');
        });
    });
}

// Fonction pour observer les changements dans le DOM
function observeDOMChanges() {
    // Créer un observateur de mutations
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element
                        // Rechercher les éléments éditables dans le noeud ajouté
                        const editableFields = node.querySelectorAll('.category-name, .category-amount, .subcategory-name, .subcategory-amount');
                        editableFields.forEach(element => {
                            // Ajouter la classe editable-field
                            element.classList.add('editable-field');
                            
                            // Sauvegarder la valeur originale
                            element.setAttribute('data-original-value', element.textContent.trim());
                            
                            // Ajouter l'écouteur d'événement pour le clic
                            element.addEventListener('click', function() {
                                const isAmount = element.classList.contains('category-amount') || 
                                                 element.classList.contains('subcategory-amount');
                                makeFieldEditable(this, isAmount ? 'number' : 'text');
                            });
                        });
                    }
                });
            }
        });
    });
    
    // Observer le conteneur des catégories
    const categoriesContainer = document.getElementById('expenseCategories');
    if (categoriesContainer) {
        observer.observe(categoriesContainer, { childList: true, subtree: true });
    }
}

// Fonction pour rendre un champ éditable
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
    input.type = type === 'number' ? 'text' : 'text'; // Utiliser text même pour les nombres pour gérer le formatage
    
    // Traiter la valeur pour les montants (enlever le symbole de devise)
    if (type === 'number') {
        // Extraire le nombre de la chaîne (ignorer tous les caractères non-numériques sauf le point/virgule)
        const numericValue = currentValue.replace(/[^0-9.,]/g, '').replace(',', '.');
        input.value = numericValue;
    } else {
        input.value = currentValue;
    }
    
    input.className = 'form-control';
    
    // Créer les boutons de validation et d'annulation
    const saveBtn = document.createElement('button');
    saveBtn.innerHTML = '<i class="fas fa-check"></i>';
    saveBtn.type = 'button';
    saveBtn.className = 'save-btn';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.innerHTML = '<i class="fas fa-times"></i>';
    cancelBtn.type = 'button';
    cancelBtn.className = 'cancel-btn';
    
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
            try {
                // Essayer d'obtenir le symbole de devise actuel
                let currencySymbol = 'DH'; // Valeur par défaut
                
                if (typeof getProjectCurrencySymbol === 'function') {
                    currencySymbol = getProjectCurrencySymbol();
                } else if (typeof getCurrencySymbol === 'function') {
                    currencySymbol = getCurrencySymbol();
                } else {
                    // Essayer de récupérer depuis les préférences
                    const preferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
                    if (preferences.currency === 'EUR') currencySymbol = '€';
                    else if (preferences.currency === 'USD') currencySymbol = '$';
                    else if (preferences.currency === 'GBP') currencySymbol = '£';
                    else if (preferences.currency === 'MAD') currencySymbol = 'DH';
                }
                
                // Formater le montant
                const numValue = parseFloat(newValue) || 0;
                newValue = `${currencySymbol} ${numValue.toFixed(2)}`;
            } catch (error) {
                console.error('Erreur lors du formatage du montant:', error);
                // Fallback en cas d'erreur
                newValue = `${newValue} €`;
            }
        }
        
        // Mettre à jour le contenu de l'élément
        element.textContent = newValue;
        
        // Mettre à jour la valeur originale
        element.setAttribute('data-original-value', newValue);
        
        // Mettre à jour les calculs si nécessaire
        if (typeof updateBudgetCalculation === 'function') {
            updateBudgetCalculation();
        }
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

// Fonction utilitaire pour extraire la valeur numérique d'un montant
function parseMonetaryValue(value) {
    if (typeof value !== 'string') return 0;
    
    // Extraire tous les chiffres, points et virgules
    const numericPart = value.replace(/[^0-9.,]/g, '');
    
    // Remplacer la virgule par un point (format français -> format américain)
    const normalizedValue = numericPart.replace(',', '.');
    
    // Convertir en nombre
    return parseFloat(normalizedValue) || 0;
}