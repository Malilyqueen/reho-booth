/**
 * Script dédié à la redirection vers l'édition directe du projet
 * Plutôt que d'essayer de corriger la page d'édition existante, nous redirigeons
 * vers une nouvelle page d'édition dédiée.
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Initialisation du script de redirection vers l\'édition directe');
    
    // Récupérer le bouton d'édition
    const editBtn = document.querySelector('.btn-edit-project');
    
    if (editBtn) {
        // Remplacer le comportement par défaut
        editBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Récupérer l'ID du projet depuis l'URL
            const urlParams = new URLSearchParams(window.location.search);
            const projectId = urlParams.get('id');
            
            if (projectId) {
                // Rediriger vers la page d'édition directe
                window.location.href = 'direct-edit.html?id=' + projectId;
            } else {
                console.error('Impossible de récupérer l\'ID du projet');
                alert('Erreur: Impossible de récupérer l\'ID du projet');
            }
        });
        
        console.log('Redirection configurée avec succès');
    } else {
        console.warn('Bouton d\'édition non trouvé');
    }
});