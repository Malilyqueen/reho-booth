/**
 * Script d'amélioration pour l'ajout de lignes budgétaires
 * Ce script améliore le processus d'ajout de lignes budgétaires avec validation et retour visuel
 * Version 2.0 - Intégration des modules
 */

document.addEventListener('DOMContentLoaded', function() {
    // Améliorer les formulaires d'ajout de ligne existants
    enhanceExistingLineForms();
    
    // Observer les nouveaux formulaires qui pourraient être créés dynamiquement
    observeNewLineForms();
    
    // Améliorer les formulaires existants d'une manière plus robuste
    setInterval(checkForNewForms, 1000);
    
    console.log("Améliorations des lignes budgétaires chargées (version 2.0)");
    
    // S'intégrer avec le connecteur de modules s'il est disponible
    if (window.ModuleConnector) {
        console.log("Connexion aux modules détectée, mise en place de l'intégration");
        setupModuleIntegration();
    }
});

// Fonction pour améliorer les formulaires d'ajout de ligne existants
function enhanceExistingLineForms() {
    const allForms = document.querySelectorAll('.expense-line-form');
    allForms.forEach(form => enhanceLineForm(form));
}

// Fonction pour vérifier périodiquement la présence de nouveaux formulaires
function checkForNewForms() {
    const allForms = document.querySelectorAll('.expense-line-form:not([data-enhanced="true"])');
    if (allForms.length > 0) {
        console.log(`Nouveaux formulaires détectés (${allForms.length}), amélioration...`);
        allForms.forEach(form => enhanceLineForm(form));
    }
}

// Fonction pour observer l'ajout de nouveaux formulaires
function observeNewLineForms() {
    // Créer un observateur qui détecte les modifications du DOM
    const observer = new MutationObserver(function(mutations) {
        let formsFound = false;
        
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach(function(node) {
                    // Vérifier si le noeud ajouté est un élément DOM
                    if (node.nodeType === 1) {
                        // Rechercher les formulaires d'ajout de ligne dans le noeud ajouté
                        const forms = node.classList?.contains('expense-line-form') 
                            ? [node] 
                            : Array.from(node.querySelectorAll?.('.expense-line-form') || []);
                        
                        if (forms.length > 0) {
                            formsFound = true;
                            forms.forEach(form => enhanceLineForm(form));
                        }
                    }
                });
            }
        });
        
        if (formsFound) {
            console.log("Nouvelles modifications détectées, formulaires améliorés");
        }
    });
    
    // Configurer l'observateur pour surveiller les ajouts et modifications dans tout le document
    observer.observe(document.body, { 
        childList: true, 
        subtree: true 
    });
    
    console.log("Observateur de formulaires installé");
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
    
    if (!nameInput || !amountInput || !addButton) {
        console.warn("Formulaire incomplet, impossible de l'améliorer");
        return;
    }
    
    // Améliorer visuellement le formulaire pour plus de clarté
    improveFormVisuals(form, nameInput, amountInput, addButton);
    
    // Ajouter un gestionnaire de validation à la saisie
    nameInput.addEventListener('input', function() {
        validateInputs(nameInput, amountInput, addButton);
    });
    
    amountInput.addEventListener('input', function() {
        validateInputs(nameInput, amountInput, addButton);
        
        // Formatage du montant lors de la saisie
        formatAmountInput(amountInput);
    });
    
    // Ajouter la gestion des touches (notamment Enter)
    nameInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            
            if (nameInput.value.trim() !== '') {
                if (amountInput.value.trim() === '') {
                    // Si le nom est rempli mais pas le montant, passer au montant
                    amountInput.focus();
                } else {
                    // Si les deux sont remplis, cliquer sur le bouton
                    addButton.click();
                }
            }
        }
    });
    
    amountInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            
            if (amountInput.value.trim() !== '' && nameInput.value.trim() !== '') {
                addButton.click();
            } else if (amountInput.value.trim() !== '' && nameInput.value.trim() === '') {
                nameInput.focus();
            }
        }
    });
    
    // Renforcer la validation lors du clic sur le bouton Ajouter
    const originalClickHandler = addButton.onclick;
    addButton.onclick = function(event) {
        // Vérifier si les entrées sont valides
        if (nameInput.value.trim() === '' || amountInput.value.trim() === '') {
            // Indiquer visuellement les champs invalides
            if (nameInput.value.trim() === '') {
                nameInput.classList.add('error-input');
                nameInput.placeholder = "Nom requis";
                nameInput.focus();
                setTimeout(() => {
                    nameInput.classList.remove('error-input');
                    nameInput.placeholder = "Nom de la ligne";
                }, 2000);
            }
            
            if (amountInput.value.trim() === '') {
                amountInput.classList.add('error-input');
                amountInput.placeholder = "Montant requis";
                if (nameInput.value.trim() !== '') {
                    amountInput.focus();
                }
                setTimeout(() => {
                    amountInput.classList.remove('error-input');
                    amountInput.placeholder = "Montant";
                }, 2000);
            }
            
            // Empêcher l'action par défaut
            event.preventDefault();
            event.stopPropagation();
            return false;
        }
        
        // Normaliser les valeurs avant d'ajouter
        const lineName = nameInput.value.trim();
        let lineAmount = amountInput.value.trim();
        
        // S'assurer que le montant est un nombre valide
        if (window.ModuleStandardizer) {
            lineAmount = window.ModuleStandardizer.standardizeAmount(lineAmount);
        } else {
            // Méthode de secours si le standardiseur n'est pas disponible
            lineAmount = parseFloat(lineAmount.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
        }
        
        // Stocker les valeurs pour les utiliser après l'exécution du handler original
        const lineData = { name: lineName, amount: lineAmount };
        
        // Ajouter un feedback visuel de réussite
        showSuccessFeedback(form, lineName, lineAmount);
        
        // Réinitialiser le formulaire et se concentrer sur le champ de nom
        resetFormAfterSubmission(form);
        nameInput.focus();
        
        // Exécuter le gestionnaire d'origine si présent
        let result = true;
        if (typeof originalClickHandler === 'function') {
            result = originalClickHandler.call(this, event);
        }
        
        // Publier l'événement d'ajout de ligne si le connecteur est disponible
        if (window.ModuleConnector && result !== false) {
            setTimeout(() => {
                window.ModuleConnector.publish(
                    window.ModuleConnector.channels.BUDGET,
                    window.ModuleConnector.actions.budget.ITEM_ADDED,
                    lineData,
                    { source: 'budget-line-improvements' }
                );
            }, 300);
        }
        
        return result;
    };
    
    console.log("Formulaire d'ajout de ligne amélioré");
}

// Fonction pour améliorer visuellement le formulaire
function improveFormVisuals(form, nameInput, amountInput, addButton) {
    try {
        // Sauvegarde des propriétés importantes
        const originalNameId = nameInput.id;
        const originalAmountId = amountInput.id;
        const originalNameValue = nameInput.value;
        const originalAmountValue = amountInput.value;
        const originalAddHandler = addButton.onclick;
        
        // Création d'une structure HTML simple et directe
        form.innerHTML = `
            <div class="budget-line-form-row" style="display: flex; flex-wrap: wrap; gap: 10px; width: 100%; align-items: flex-end;">
                <div class="form-input-container" style="flex: 2; min-width: 180px;">
                    <label for="${originalNameId || 'newLineName'}" style="display: block; margin-bottom: 5px; font-size: 0.85rem; font-weight: 500; color: #1d3557;">Nom</label>
                    <input type="text" id="${originalNameId || 'newLineName'}" class="enhanced-input" placeholder="Nom de la ligne" 
                           style="width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box;">
                </div>
                <div class="form-input-container" style="flex: 1; min-width: 120px;">
                    <label for="${originalAmountId || 'newLineAmount'}" style="display: block; margin-bottom: 5px; font-size: 0.85rem; font-weight: 500; color: #1d3557;">Montant</label>
                    <input type="text" id="${originalAmountId || 'newLineAmount'}" class="enhanced-input" placeholder="Montant" 
                           style="width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box;">
                </div>
                <div class="form-button-container" style="flex: 0 0 auto; display: flex; align-items: flex-end;">
                    <button type="button" id="addLineButton" class="btn-add-line enhanced-add-btn" 
                            style="padding: 10px 16px; border-radius: 6px; background-color: #ffc300; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 8px;">
                        <i class="fas fa-plus-circle"></i> Ajouter
                    </button>
                </div>
            </div>
        `;
        
        // Récupérer les nouveaux éléments
        const newNameInput = form.querySelector(`#${originalNameId || 'newLineName'}`);
        const newAmountInput = form.querySelector(`#${originalAmountId || 'newLineAmount'}`);
        const newAddButton = form.querySelector('#addLineButton');
        
        // Restaurer les valeurs d'origine
        if (originalNameValue) newNameInput.value = originalNameValue;
        if (originalAmountValue) newAmountInput.value = originalAmountValue;
        
        // Ajouter le gestionnaire d'événements
        newAddButton.onclick = function(event) {
            // Vérifier les entrées avant d'ajouter
            if (newNameInput.value.trim() === '' || newAmountInput.value.trim() === '') {
                // Mettre en évidence les champs manquants
                if (newNameInput.value.trim() === '') {
                    newNameInput.style.border = '2px solid #f44336';
                    newNameInput.style.backgroundColor = '#fff0f0';
                    newNameInput.focus();
                }
                if (newAmountInput.value.trim() === '') {
                    newAmountInput.style.border = '2px solid #f44336';
                    newAmountInput.style.backgroundColor = '#fff0f0';
                }
                return false;
            }
            
            // Normaliser les valeurs
            const lineName = newNameInput.value.trim();
            let lineAmount = newAmountInput.value.trim();
            lineAmount = parseFloat(lineAmount.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
            
            // Montrer un feedback visuel
            const feedback = document.createElement('div');
            feedback.style.backgroundColor = '#f0fff0';
            feedback.style.border = '1px solid #c3e6cb';
            feedback.style.color = '#155724';
            feedback.style.padding = '10px 15px';
            feedback.style.marginTop = '10px';
            feedback.style.borderRadius = '6px';
            feedback.style.boxShadow = '0 2px 5px rgba(0,0,0,0.05)';
            
            let currencySymbol = '€';
            if (typeof getProjectCurrencySymbol === 'function') {
                currencySymbol = getProjectCurrencySymbol();
            }
            
            feedback.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-check-circle" style="color: #28a745;"></i>
                    <div>
                        <strong>Ligne ajoutée avec succès</strong><br>
                        <span style="font-size: 0.85rem; opacity: 0.9;">
                            "${lineName}" (${currencySymbol} ${lineAmount.toFixed(2)})
                        </span>
                    </div>
                </div>
            `;
            
            // Exécuter le gestionnaire d'origine
            if (typeof originalAddHandler === 'function') {
                originalAddHandler.call(newAddButton, event);
            }
            
            // Nettoyer les champs
            setTimeout(() => {
                newNameInput.value = '';
                newAmountInput.value = '';
                form.appendChild(feedback);
                
                // Supprimer le feedback après un délai
                setTimeout(() => {
                    feedback.remove();
                }, 2500);
                
                // Publier l'événement d'ajout
                if (window.ModuleConnector) {
                    window.ModuleConnector.publish(
                        window.ModuleConnector.channels.BUDGET,
                        window.ModuleConnector.actions.budget.ITEM_ADDED,
                        { name: lineName, amount: lineAmount },
                        { source: 'budget-line-improvements' }
                    );
                }
            }, 10);
            
            return true;
        };
        
        // Ajouter les gestionnaires d'événements pour l'entrée
        newNameInput.addEventListener('input', () => {
            newNameInput.style.border = '1px solid #ddd';
            newNameInput.style.backgroundColor = '';
        });
        
        newAmountInput.addEventListener('input', () => {
            newAmountInput.style.border = '1px solid #ddd';
            newAmountInput.style.backgroundColor = '';
            
            // Formatage du montant
            let value = newAmountInput.value;
            value = value.replace(/[^\d.,]/g, '');
            if (value !== newAmountInput.value) {
                newAmountInput.value = value;
            }
        });
        
        console.log("Formulaire d'ajout de ligne amélioré avec succès");
        
    } catch (error) {
        console.error("Erreur lors de l'amélioration du formulaire:", error);
        
        // En cas d'erreur, essayer une approche minimaliste pour ne pas casser la fonctionnalité
        try {
            // Styles minimaux directs sur les éléments existants
            form.style.display = 'flex';
            form.style.gap = '10px';
            form.style.marginBottom = '15px';
            
            nameInput.style.padding = '8px';
            nameInput.style.border = '1px solid #ddd';
            nameInput.style.borderRadius = '4px';
            nameInput.placeholder = 'Nom de la ligne';
            
            amountInput.style.padding = '8px';
            amountInput.style.border = '1px solid #ddd';
            amountInput.style.borderRadius = '4px';
            amountInput.placeholder = 'Montant';
            
            addButton.style.padding = '8px 12px';
            addButton.style.backgroundColor = '#ffc300';
            addButton.style.border = 'none';
            addButton.style.borderRadius = '4px';
            
            if (!addButton.innerHTML.includes('Ajouter')) {
                addButton.innerHTML = 'Ajouter';
            }
            
            console.log("Appliqué une mise en forme minimaliste au formulaire après erreur");
        } catch (fallbackError) {
            console.error("Échec du fallback:", fallbackError);
        }
    }
}

// Fonction pour formater l'entrée du montant en temps réel
function formatAmountInput(input) {
    let value = input.value;
    
    // Enlever tout sauf les chiffres, le point et la virgule
    value = value.replace(/[^\d.,]/g, '');
    
    // S'assurer qu'il n'y a qu'un seul séparateur décimal
    const dotIndex = value.indexOf('.');
    const commaIndex = value.indexOf(',');
    
    if (dotIndex !== -1 && commaIndex !== -1) {
        // Si les deux sont présents, garder le premier et convertir
        if (dotIndex < commaIndex) {
            value = value.replace(',', '');
        } else {
            value = value.replace('.', '').replace(',', '.');
        }
    } else if (commaIndex !== -1) {
        // Convertir la virgule en point pour la cohérence
        value = value.replace(',', '.');
    }
    
    // Limiter à deux décimales
    if (value.includes('.')) {
        const parts = value.split('.');
        if (parts[1].length > 2) {
            parts[1] = parts[1].substring(0, 2);
            value = parts.join('.');
        }
    }
    
    // Éviter la mise à jour si la valeur n'a pas changé (pour éviter des problèmes de curseur)
    if (value !== input.value) {
        input.value = value;
    }
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
    
    // Mettre à jour les classes des champs
    if (nameInput.value.trim() !== '') {
        nameInput.classList.add('has-value');
    } else {
        nameInput.classList.remove('has-value');
    }
    
    if (amountInput.value.trim() !== '') {
        amountInput.classList.add('has-value');
    } else {
        amountInput.classList.remove('has-value');
    }
}

// Fonction pour afficher un feedback de réussite
function showSuccessFeedback(form, name, amount) {
    // Créer l'élément de feedback
    const feedback = document.createElement('div');
    feedback.className = 'line-success-feedback';
    
    // Récupérer le symbole de la devise si disponible
    let currencySymbol = '€';
    if (typeof getProjectCurrencySymbol === 'function') {
        currencySymbol = getProjectCurrencySymbol();
    }
    
    feedback.innerHTML = `
        <div class="success-feedback-content">
            <i class="fas fa-check-circle"></i>
            <span class="success-feedback-text">
                <strong>Ligne ajoutée avec succès</strong>
                <span class="success-feedback-details">
                    "${name}" (${currencySymbol} ${parseFloat(amount).toFixed(2)})
                </span>
            </span>
        </div>
    `;
    
    // Styles en ligne pour assurer la cohérence
    feedback.style.backgroundColor = '#f0fff0';
    feedback.style.border = '1px solid #c3e6cb';
    feedback.style.color = '#155724';
    feedback.style.padding = '10px 15px';
    feedback.style.marginTop = '10px';
    feedback.style.borderRadius = '6px';
    feedback.style.boxShadow = '0 2px 5px rgba(0,0,0,0.05)';
    feedback.style.animation = 'fadeInOut 2.5s ease forwards';
    
    // Rafraîchir l'affichage des lignes de dépenses et défilement vers la ligne ajoutée
    setTimeout(() => {
        refreshExpenseLines();
    }, 100);
    
    // Ajouter au formulaire
    form.appendChild(feedback);
    
    // Supprimer après l'animation
    setTimeout(() => {
        feedback.remove();
    }, 2500);
}

// Fonction pour réinitialiser le formulaire après soumission
function resetFormAfterSubmission(form) {
    // Trouver les champs du formulaire
    const nameInput = form.querySelector('input[name="line-name"], #newLineName, [id^="newLineName"]');
    const amountInput = form.querySelector('input[name="line-amount"], #newLineAmount, [id^="newLineAmount"]');
    
    // Réinitialiser les valeurs
    if (nameInput) nameInput.value = '';
    if (amountInput) amountInput.value = '';
    
    // Réinitialiser les classes
    if (nameInput) nameInput.classList.remove('has-value', 'error-input');
    if (amountInput) amountInput.classList.remove('has-value', 'error-input');
    
    // Désactiver le bouton d'ajout
    const addButton = form.querySelector('.btn-add-line');
    if (addButton) {
        addButton.classList.remove('valid');
        addButton.classList.add('invalid');
    }
}

// Fonction pour actualiser l'affichage des lignes de dépenses
function refreshExpenseLines() {
    console.log("Rafraîchissement des lignes de dépenses après ajout");
    
    // Mettre à jour le calcul du budget si la fonction existe
    if (typeof updateBudgetCalculation === 'function') {
        updateBudgetCalculation();
    }
    
    // Trouver la dernière ligne ajoutée dans la même sous-catégorie que le formulaire actif
    let targetContainer = null;
    let activeForm = document.querySelector('.expense-line-form:not(.form-disappear)');
    
    if (activeForm) {
        // Trouver la sous-catégorie contenant le formulaire actif
        targetContainer = activeForm.closest('.subcategory');
    }
    
    if (!targetContainer) {
        // Si on ne trouve pas le conteneur spécifique, utiliser une méthode alternative
        targetContainer = document.querySelector('.subcategory:last-child');
    }
    
    if (targetContainer) {
        setTimeout(() => {
            // Récupérer uniquement les lignes dans cette sous-catégorie spécifique
            const expenseLines = targetContainer.querySelectorAll('.expense-line');
            
            if (expenseLines.length > 0) {
                // Mettre en évidence uniquement la dernière ligne de cette sous-catégorie
                const lastLine = expenseLines[expenseLines.length - 1];
                lastLine.classList.add('highlight-new');
                
                // Défiler vers cette ligne
                lastLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Retirer la mise en évidence après un délai
                setTimeout(() => {
                    lastLine.classList.remove('highlight-new');
                }, 2000);
            }
        }, 300);
    }
}

// Fonction pour configurer l'intégration avec les modules
function setupModuleIntegration() {
    // S'abonner aux événements pertinents
    window.ModuleConnector.subscribe(
        window.ModuleConnector.channels.BUDGET,
        function(message) {
            if (message.action === window.ModuleConnector.actions.budget.ITEM_ADDED) {
                console.log("Élément ajouté au budget:", message.data);
                // Rafraîchir l'affichage des lignes
                refreshExpenseLines();
            }
        }
    );
    
    // S'abonner aux événements de wishlist
    window.ModuleConnector.subscribe(
        window.ModuleConnector.channels.WISHLIST,
        function(message) {
            if (message.action === window.ModuleConnector.actions.wishlist.ADDED_TO_BUDGET) {
                console.log("Élément de wishlist ajouté au budget:", message.data);
                
                // Mettre à jour les calculs du budget
                if (typeof updateBudgetCalculation === 'function') {
                    setTimeout(updateBudgetCalculation, 300);
                    console.log("Mise à jour du budget déclenchée suite à l'ajout d'éléments de wishlist");
                }
            }
        }
    );
}

// Ajouter les styles nécessaires
const styleElement = document.createElement('style');
styleElement.textContent = `
    /* Animations */
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translateY(-10px); }
        10% { opacity: 1; transform: translateY(0); }
        85% { opacity: 1; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(-10px); }
    }
    
    /* Bouton d'ajout de ligne */
    .btn-add-line.valid {
        background-color: #4caf50 !important;
        transform: translateY(-2px);
        box-shadow: 0 3px 5px rgba(0,0,0,0.2);
        color: white !important;
    }
    
    .btn-add-line.invalid {
        opacity: 0.7;
    }
    
    /* Mise en évidence des erreurs */
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
    
    /* Formulaire amélioré */
    .enhanced-line-form {
        display: flex;
        flex-wrap: wrap;
        background-color: #f8faff;
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        margin-bottom: 15px;
        align-items: flex-end;
        gap: 15px;
    }
    
    .form-input-container {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-width: 180px;
    }
    
    .expense-line-label {
        font-size: 0.85rem;
        font-weight: 500;
        color: #1d3557;
        margin-bottom: 5px;
    }
    
    .enhanced-input {
        padding: 10px 12px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-family: 'Poppins', sans-serif;
        transition: all 0.2s ease;
    }
    
    .enhanced-input:focus {
        border-color: #4a7aff;
        box-shadow: 0 0 0 3px rgba(74, 122, 255, 0.1);
        outline: none;
    }
    
    .enhanced-input.has-value {
        border-color: #6fbf73;
        background-color: #f5fff7;
    }
    
    .enhanced-add-btn {
        padding: 10px 16px;
        font-weight: 500;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        transition: all 0.2s ease;
        margin-left: auto;
        white-space: nowrap;
        flex-grow: 0;
    }
    
    .enhanced-add-btn i {
        font-size: 0.9rem;
    }
    
    /* Feedback de succès */
    .success-feedback-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .success-feedback-content i {
        font-size: 1.1rem;
        color: #28a745;
    }
    
    .success-feedback-text {
        display: flex;
        flex-direction: column;
    }
    
    .success-feedback-details {
        font-size: 0.85rem;
        opacity: 0.9;
    }
    
    /* Mise en évidence lors de l'ajout */
    .highlight-new {
        animation: highlightNew 2s ease;
    }
    
    @keyframes highlightNew {
        0% { background-color: rgba(76, 175, 80, 0.1); }
        100% { background-color: transparent; }
    }
`;
document.head.appendChild(styleElement);