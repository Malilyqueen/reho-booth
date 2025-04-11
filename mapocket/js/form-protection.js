// IMPORTANT : Protection supplémentaire globale contre les redirections et soumissions involontaires 
// Appliquer à toutes les pages de l'application

document.addEventListener('DOMContentLoaded', function() {
    console.log("🛡️ Activation de la protection globale contre les soumissions involontaires...");
    applyGlobalFormProtection();
});

function applyGlobalFormProtection() {
    // 1. Protéger TOUS les formulaires contre la soumission non désirée
    document.querySelectorAll('form').forEach(form => {
        // Si le formulaire n'a pas déjà un gestionnaire onsubmit explicite
        if (!form.hasAttribute('onsubmit')) {
            form.setAttribute('onsubmit', 'event.preventDefault(); return false;');
        }
        
        // Ajouter un event listener pour bloquer la soumission classique
        form.addEventListener('submit', function(event) {
            // Ne laisser passer que les soumissions explicitement autorisées
            if (!event.target.hasAttribute('data-submit-allowed')) {
                console.log("🛑 Soumission de formulaire bloquée:", event.target);
                event.preventDefault();
                event.stopPropagation();
                return false;
            }
        }, true); // Utiliser la phase de capture pour intercepter avant tout
    });
    
    // 2. Empêcher la touche Enter de soumettre les formulaires
    document.addEventListener('keydown', function(event) {
        // Si c'est la touche Enter et que nous sommes dans un champ de saisie
        if ((event.key === 'Enter' || event.keyCode === 13) && 
            (event.target.tagName === 'INPUT' || 
             event.target.tagName === 'TEXTAREA' || 
             event.target.hasAttribute('contenteditable'))) {
            
            // Vérifier que ce n'est pas un textarea multilignes où Enter est attendu
            if (event.target.tagName !== 'TEXTAREA' || event.ctrlKey || event.metaKey) {
                console.log("🛑 Touche Enter bloquée dans:", event.target);
                event.preventDefault();
                event.stopPropagation();
                return false;
            }
        }
    }, true);
    
    // 3. Empêcher les doubles clics de déclencher des actions non désirées
    document.addEventListener('dblclick', function(event) {
        // Bloquer les doubles clics sur les champs modifiables ou parties de formulaire
        if (event.target.closest('form') || 
            event.target.tagName === 'INPUT' || 
            event.target.tagName === 'TEXTAREA' || 
            event.target.isContentEditable || 
            event.target.classList.contains('editable') ||
            event.target.hasAttribute('contenteditable')) {
            
            console.log("🛑 Double-clic bloqué sur:", event.target);
            event.preventDefault();
            event.stopPropagation();
            return false;
        }
    }, true);
    
    // 4. Intercepter les clics sur boutons type submit pour contrôler le comportement
    document.querySelectorAll('button[type="submit"]').forEach(button => {
        button.addEventListener('click', function(event) {
            // Si le bouton n'a pas d'attribut data-submit-allowed
            if (!button.hasAttribute('data-submit-allowed')) {
                console.log("🛑 Clic sur bouton submit bloqué:", button);
                event.preventDefault();
                event.stopPropagation();
                
                // Rechercher la fonction de sauvegarde explicite
                const formId = button.form?.id;
                if (formId === 'newProjectForm') {
                    // Déclencher la sauvegarde via le bon appel de fonction
                    if (typeof saveProject === 'function') {
                        saveProject();
                    }
                } else if (formId === 'projectForm' && typeof saveProjectChanges === 'function') {
                    // Utiliser la fonction d'édition si nous sommes en mode édition
                    const urlParams = new URLSearchParams(window.location.search);
                    const projectId = urlParams.get('id');
                    if (projectId) {
                        saveProjectChanges(projectId);
                    }
                }
                
                return false;
            }
        }, true);
    });
    
    // 5. Protéger contre la navigation arrière involontaire
    window.addEventListener('beforeunload', function(event) {
        // Si nous sommes sur une page de formulaire d'édition/création de projet
        if (window.location.href.includes('nouveau-projet.html')) {
            // Annuler la navigation et demander confirmation
            event.preventDefault();
            // Message personnalisé (souvent ignoré par les navigateurs modernes)
            event.returnValue = "Vous avez des modifications non sauvegardées. Êtes-vous sûr de vouloir quitter cette page?";
            return event.returnValue;
        }
    });
    
    console.log("✅ Protection contre les soumissions involontaires activée");
}