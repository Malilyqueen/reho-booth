/**
 * Script d'amélioration pour l'ajout de lignes budgétaires
 * Ce script améliore le processus d'ajout de lignes budgétaires avec validation et retour visuel
 */

document.addEventListener('DOMContentLoaded', function() {
    // Améliorer les formulaires d'ajout de ligne existants
    enhanceExistingLineForms();
    
    // Observer les nouveaux formulaires qui pourraient être créés dynamiquement
    observeNewLineForms();
    
    console.log("Améliorations des lignes budgétaires chargées");
});

// Fonction pour améliorer les formulaires d'ajout de ligne existants
function enhanceExistingLineForms() {
    const allForms = document.querySelectorAll('.expense-line-form');
    allForms.forEach(form => enhanceLineForm(form));
}

// Fonction pour observer l'ajout de nouveaux formulaires
function observeNewLineForms() {
    // Créer un observateur qui détecte les modifications du DOM
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach(function(node) {
                    // Vérifier si le noeud ajouté est un élément DOM
                    if (node.nodeType === 1) {
                        // Rechercher les formulaires d'ajout de ligne dans le noeud ajouté
                        const forms = node.classList?.contains('expense-line-form') 
                            ? [node] 
                            : Array.from(node.querySelectorAll?.('.expense-line-form') || []);
                        
                        forms.forEach(form => enhanceLineForm(form));
                    }
                });
            }
        });
    });
    
    // Configurer l'observateur pour surveiller les ajouts et modifications dans tout le document
    observer.observe(document.body, { 
        childList: true, 
        subtree: true 
    });
}

// Fonction pour améliorer un formulaire d'ajout de ligne spécifique
function enhanceLineForm(form) {
    // Éviter d'améliorer plusieurs fois le même formulaire
    if (form.dataset.enhanced === 'true') return;
    
    // Marquer le formulaire comme amélioré
    form.dataset.enhanced = 'true';
    
    // Obtenir les éléments du formulaire
    const nameInput = form.querySelector('#newLineName, [id^="newLineName"]');
    const amountInput = form.querySelector('#newLineAmount, [id^="newLineAmount"]');
    const addButton = form.querySelector('.btn-add-line');
    
    if (!nameInput || !amountInput || !addButton) return;
    
    // Ajouter un gestionnaire de validation à la saisie
    nameInput.addEventListener('input', function() {
        validateInputs(nameInput, amountInput, addButton);
    });
    
    amountInput.addEventListener('input', function() {
        validateInputs(nameInput, amountInput, addButton);
    });
    
    // Renforcer la validation lors du clic sur le bouton Ajouter
    const originalClickHandler = addButton.onclick;
    addButton.onclick = function(event) {
        // Vérifier si les entrées sont valides
        if (nameInput.value.trim() === '' || amountInput.value.trim() === '') {
            // Indiquer visuellement les champs invalides
            if (nameInput.value.trim() === '') {
                nameInput.classList.add('error-input');
                setTimeout(() => nameInput.classList.remove('error-input'), 2000);
            }
            
            if (amountInput.value.trim() === '') {
                amountInput.classList.add('error-input');
                setTimeout(() => amountInput.classList.remove('error-input'), 2000);
            }
            
            // Empêcher l'action par défaut
            event.preventDefault();
            event.stopPropagation();
            return false;
        }
        
        // Ajouter un feedback visuel de réussite
        showSuccessFeedback(form);
        
        // Exécuter le gestionnaire d'origine si présent
        if (typeof originalClickHandler === 'function') {
            return originalClickHandler.call(this, event);
        }
    };
    
    console.log("Formulaire d'ajout de ligne amélioré");
}

// Fonction pour valider les entrées et mettre à jour l'état du bouton
function validateInputs(nameInput, amountInput, addButton) {
    const nameValid = nameInput.value.trim() !== '';
    const amountValid = amountInput.value.trim() !== '';
    
    // Mettre à jour l'apparence du bouton en fonction de la validité
    if (nameValid && amountValid) {
        addButton.classList.add('valid');
        addButton.classList.remove('invalid');
    } else {
        addButton.classList.remove('valid');
        addButton.classList.add('invalid');
    }
}

// Fonction pour afficher un feedback de réussite
function showSuccessFeedback(form) {
    // Créer l'élément de feedback
    const feedback = document.createElement('div');
    feedback.className = 'line-success-feedback';
    feedback.innerHTML = '<i class="fas fa-check-circle"></i> Ligne ajoutée avec succès';
    feedback.style.color = '#4caf50';
    feedback.style.padding = '10px';
    feedback.style.marginTop = '10px';
    feedback.style.fontWeight = 'bold';
    feedback.style.animation = 'fadeInOut 2s ease';
    
    // Ajouter au formulaire
    form.appendChild(feedback);
    
    // Supprimer après l'animation
    setTimeout(() => {
        feedback.remove();
    }, 2000);
}

// Ajouter les styles nécessaires
const styleElement = document.createElement('style');
styleElement.textContent = `
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translateY(-10px); }
        10% { opacity: 1; transform: translateY(0); }
        90% { opacity: 1; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(-10px); }
    }
    
    .btn-add-line.valid {
        background-color: #4caf50 !important;
        transform: translateY(-2px);
        box-shadow: 0 3px 5px rgba(0,0,0,0.2);
    }
    
    .btn-add-line.invalid {
        opacity: 0.7;
    }
    
    .error-input {
        border: 2px solid #f44336 !important;
        background-color: #fff0f0 !important;
        animation: shake 0.5s ease;
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
`;
document.head.appendChild(styleElement);