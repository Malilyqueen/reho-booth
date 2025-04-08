/**
 * Voice Command Navigation System for MaPocket
 * Ce module permet la navigation par commandes vocales dans l'application
 */

// Variables pour la reconnaissance vocale
let recognition;
let isListening = false;
let commandsEnabled = false;

// Commandes vocales disponibles
const voiceCommands = {
    // Navigation générale
    'accueil': () => navigateTo('index.html'),
    'tableau de bord': () => navigateTo('index.html'),
    'nouveau projet': () => navigateTo('nouveau-projet.html'),
    'portefeuille': () => navigateTo('portefeuille.html'),
    'objectifs': () => navigateTo('objectifs.html'),
    'défis': () => navigateTo('objectifs.html'),
    'objectifs et défis': () => navigateTo('objectifs.html'),
    'suggestions': () => navigateTo('suggestions-ia.html'),
    'chat': () => navigateTo('chat-ia.html'),
    
    // Actions sur les projets
    'voir le projet': (args) => viewProjectVoice(args),
    'ouvrir le projet': (args) => viewProjectVoice(args),
    'éditer le projet': (args) => editProjectVoice(args),
    'modifier le projet': (args) => editProjectVoice(args),
    'supprimer le projet': (args) => deleteProjectVoice(args),
    
    // Actions sur les objectifs et défis
    'nouvel objectif': () => navigateTo('objectifs.html#nouvel-objectif'),
    'nouveau défi': () => navigateTo('objectifs.html#nouveau-defi'),
    'mes objectifs': () => navigateTo('objectifs.html#savings-goals'),
    'mes défis': () => navigateTo('objectifs.html#spending-challenges'),
    'suivi de progression': () => navigateTo('objectifs.html#progress-tracking'),
    
    // Aide et contrôle vocal
    'aide vocale': () => showVoiceHelp(),
    'afficher les commandes': () => showVoiceHelp(),
    'liste des commandes': () => showVoiceHelp(),
    'arrêter l\'écoute': () => stopVoiceRecognition(),
    'fin de l\'écoute': () => stopVoiceRecognition(),
    'terminer l\'écoute': () => stopVoiceRecognition()
};

/**
 * Initialise le système de reconnaissance vocale
 */
function initVoiceCommands() {
    // Vérifier si la reconnaissance vocale est supportée par le navigateur
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        console.log('La reconnaissance vocale n\'est pas supportée par ce navigateur');
        return;
    }
    
    // Créer une instance de SpeechRecognition
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    
    // Configurer le moteur de reconnaissance
    recognition.lang = 'fr-FR';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    // Ajouter les écouteurs d'événements
    recognition.onstart = () => {
        isListening = true;
        updateVoiceControlUI();
        console.log('La reconnaissance vocale a commencé, en attente de commandes...');
    };
    
    recognition.onresult = (event) => {
        const result = event.results[0][0].transcript.toLowerCase().trim();
        console.log('Commande vocale détectée:', result);
        processVoiceCommand(result);
    };
    
    recognition.onend = () => {
        isListening = false;
        updateVoiceControlUI();
        console.log('La reconnaissance vocale s\'est arrêtée');
        
        // Redémarrer l'écoute si les commandes sont toujours activées
        if (commandsEnabled && localStorage.getItem('voiceCommandsEnabled') === 'true') {
            setTimeout(() => {
                startVoiceRecognition();
            }, 1000);
        }
    };
    
    recognition.onerror = (event) => {
        console.error('Erreur de reconnaissance vocale:', event.error);
        isListening = false;
        updateVoiceControlUI();
    };
    
    // Vérifier si les commandes vocales étaient activées précédemment
    if (localStorage.getItem('voiceCommandsEnabled') === 'true') {
        enableVoiceCommands();
    }
    
    // Ajouter le bouton de contrôle vocal à l'interface
    createVoiceControlUI();
}

/**
 * Traite la commande vocale reçue
 */
function processVoiceCommand(command) {
    // Afficher un feedback visuel de la commande détectée
    showVoiceCommandFeedback(command);
    
    // Rechercher la commande dans la liste des commandes disponibles
    let commandFound = false;
    
    // Vérifier si la commande existe exactement
    for (const [key, action] of Object.entries(voiceCommands)) {
        if (command === key) {
            action();
            commandFound = true;
            break;
        }
    }
    
    // Si la commande n'est pas trouvée, essayer de trouver une commande qui contient un argument
    if (!commandFound) {
        for (const [key, action] of Object.entries(voiceCommands)) {
            if (command.startsWith(key + ' ')) {
                const args = command.substring(key.length).trim();
                action(args);
                commandFound = true;
                break;
            }
        }
    }
    
    // Si aucune commande n'est trouvée, afficher un message d'erreur
    if (!commandFound) {
        showNotification('Commande vocale non reconnue: ' + command, 'warning');
    }
}

/**
 * Démarre la reconnaissance vocale
 */
function startVoiceRecognition() {
    if (recognition && !isListening) {
        try {
            recognition.start();
        } catch (error) {
            console.error('Erreur au démarrage de la reconnaissance vocale:', error);
        }
    }
}

/**
 * Arrête la reconnaissance vocale
 */
function stopVoiceRecognition() {
    if (recognition && isListening) {
        try {
            recognition.stop();
        } catch (error) {
            console.error('Erreur à l\'arrêt de la reconnaissance vocale:', error);
        }
    }
}

/**
 * Active les commandes vocales
 */
function enableVoiceCommands() {
    commandsEnabled = true;
    localStorage.setItem('voiceCommandsEnabled', 'true');
    startVoiceRecognition();
    updateVoiceControlUI();
    showNotification('Commandes vocales activées');
}

/**
 * Désactive les commandes vocales
 */
function disableVoiceCommands() {
    commandsEnabled = false;
    localStorage.setItem('voiceCommandsEnabled', 'false');
    stopVoiceRecognition();
    updateVoiceControlUI();
    showNotification('Commandes vocales désactivées');
}

/**
 * Bascule l'état des commandes vocales (activer/désactiver)
 */
function toggleVoiceCommands() {
    if (commandsEnabled) {
        disableVoiceCommands();
    } else {
        enableVoiceCommands();
    }
}

/**
 * Créer l'interface utilisateur pour le contrôle vocal
 */
function createVoiceControlUI() {
    // Créer le conteneur pour le bouton et l'indicateur
    const container = document.createElement('div');
    container.id = 'voice-control-container';
    container.className = 'voice-control-container';
    
    // Créer le bouton de contrôle vocal
    const button = document.createElement('button');
    button.id = 'voice-control-button';
    button.className = 'voice-control-button';
    button.innerHTML = '<i class="fas fa-microphone"></i>';
    button.title = 'Activer/désactiver les commandes vocales';
    button.onclick = toggleVoiceCommands;
    
    // Créer l'indicateur d'état
    const indicator = document.createElement('div');
    indicator.id = 'voice-control-indicator';
    indicator.className = 'voice-control-indicator';
    
    // Ajouter des éléments au conteneur
    container.appendChild(button);
    container.appendChild(indicator);
    
    // Ajouter le conteneur au corps du document
    document.body.appendChild(container);
    
    // Mettre à jour l'interface pour refléter l'état actuel
    updateVoiceControlUI();
    
    // Ajouter les styles CSS nécessaires
    addVoiceControlStyles();
}

/**
 * Met à jour l'interface utilisateur du contrôle vocal
 */
function updateVoiceControlUI() {
    const button = document.getElementById('voice-control-button');
    const indicator = document.getElementById('voice-control-indicator');
    
    if (!button || !indicator) return;
    
    if (commandsEnabled) {
        button.classList.add('active');
        button.innerHTML = '<i class="fas fa-microphone"></i>';
        button.title = 'Désactiver les commandes vocales';
        
        if (isListening) {
            indicator.className = 'voice-control-indicator listening';
            indicator.title = 'En écoute...';
        } else {
            indicator.className = 'voice-control-indicator active';
            indicator.title = 'Commandes vocales activées';
        }
    } else {
        button.classList.remove('active');
        button.innerHTML = '<i class="fas fa-microphone-slash"></i>';
        button.title = 'Activer les commandes vocales';
        indicator.className = 'voice-control-indicator';
        indicator.title = 'Commandes vocales désactivées';
    }
}

/**
 * Affiche un feedback visuel pour la commande vocale détectée
 */
function showVoiceCommandFeedback(command) {
    // Créer un élément pour afficher la commande reconnue
    const feedback = document.createElement('div');
    feedback.className = 'voice-command-feedback';
    feedback.textContent = '"' + command + '"';
    
    // Ajouter l'élément au corps du document
    document.body.appendChild(feedback);
    
    // Animer et supprimer après un délai
    setTimeout(() => {
        feedback.classList.add('show');
        setTimeout(() => {
            feedback.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(feedback);
            }, 500);
        }, 2000);
    }, 10);
}

/**
 * Ajoute les styles CSS nécessaires pour l'interface de contrôle vocal
 */
function addVoiceControlStyles() {
    // Créer un élément de style
    const style = document.createElement('style');
    style.textContent = `
        .voice-control-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            display: flex;
            align-items: center;
            z-index: 1000;
        }
        
        .voice-control-button {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background-color: #1d3557;
            color: white;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
            transition: all 0.3s ease;
        }
        
        .voice-control-button:hover {
            background-color: #2a4b76;
        }
        
        .voice-control-button.active {
            background-color: #ffc300;
            color: #1d3557;
        }
        
        .voice-control-indicator {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background-color: #ccc;
            margin-left: 10px;
            position: relative;
        }
        
        .voice-control-indicator.active {
            background-color: #ffc300;
        }
        
        .voice-control-indicator.listening {
            background-color: #ff5733;
            animation: pulse 1.5s infinite;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.3); opacity: 0.7; }
            100% { transform: scale(1); opacity: 1; }
        }
        
        .voice-command-feedback {
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%) translateY(-20px);
            background-color: rgba(29, 53, 87, 0.8);
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            font-size: 16px;
            opacity: 0;
            transition: all 0.3s ease;
            z-index: 1001;
        }
        
        .voice-command-feedback.show {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        
        .voice-help-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }
        
        .voice-help-overlay.show {
            opacity: 1;
            visibility: visible;
        }
        
        .voice-help-container {
            background-color: white;
            border-radius: 10px;
            width: 80%;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            padding: 20px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }
        
        .voice-help-title {
            color: #1d3557;
            text-align: center;
            margin-bottom: 20px;
            font-size: 24px;
        }
        
        .voice-help-category {
            margin-bottom: 15px;
        }
        
        .voice-help-category h3 {
            color: #1d3557;
            font-size: 18px;
            margin-bottom: 10px;
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
        }
        
        .voice-help-command {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
            padding: 5px 0;
        }
        
        .voice-help-command:nth-child(even) {
            background-color: #f9f9f9;
        }
        
        .voice-help-command-phrase {
            font-weight: bold;
            color: #2a4b76;
        }
        
        .voice-help-close {
            text-align: center;
            margin-top: 20px;
        }
        
        .voice-help-close button {
            background-color: #1d3557;
            color: white;
            border: none;
            padding: 8px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            transition: background-color 0.3s ease;
        }
        
        .voice-help-close button:hover {
            background-color: #2a4b76;
        }
    `;
    
    // Ajouter l'élément de style au head du document
    document.head.appendChild(style);
}

/**
 * Affiche l'aide pour les commandes vocales
 */
function showVoiceHelp() {
    // Vérifier si l'overlay existe déjà
    let overlay = document.getElementById('voice-help-overlay');
    
    // Créer l'overlay s'il n'existe pas
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'voice-help-overlay';
        overlay.className = 'voice-help-overlay';
        
        const container = document.createElement('div');
        container.className = 'voice-help-container';
        
        // Titre
        const title = document.createElement('h2');
        title.className = 'voice-help-title';
        title.textContent = 'Commandes Vocales Disponibles';
        container.appendChild(title);
        
        // Catégories de commandes
        const categories = {
            'Navigation générale': {
                'accueil': 'Aller à la page d\'accueil',
                'tableau de bord': 'Aller à la page d\'accueil',
                'nouveau projet': 'Créer un nouveau projet',
                'portefeuille': 'Aller à la page portefeuille',
                'objectifs': 'Aller à la page objectifs et défis',
                'défis': 'Aller à la page objectifs et défis',
                'objectifs et défis': 'Aller à la page objectifs et défis',
                'suggestions': 'Voir les suggestions IA',
                'chat': 'Ouvrir le chat IA'
            },
            'Actions sur les projets': {
                'voir le projet [nom]': 'Ouvrir le projet spécifié',
                'ouvrir le projet [nom]': 'Ouvrir le projet spécifié',
                'éditer le projet [nom]': 'Modifier le projet spécifié',
                'modifier le projet [nom]': 'Modifier le projet spécifié',
                'supprimer le projet [nom]': 'Supprimer le projet spécifié'
            },
            'Objectifs et défis': {
                'nouvel objectif': 'Créer un nouvel objectif d\'épargne',
                'nouveau défi': 'Créer un nouveau défi budgétaire',
                'mes objectifs': 'Voir mes objectifs d\'épargne',
                'mes défis': 'Voir mes défis budgétaires',
                'suivi de progression': 'Voir le suivi et la progression'
            },
            'Aide et contrôle vocal': {
                'aide vocale': 'Afficher cette aide',
                'afficher les commandes': 'Afficher cette aide',
                'liste des commandes': 'Afficher cette aide',
                'arrêter l\'écoute': 'Désactiver la reconnaissance vocale',
                'fin de l\'écoute': 'Désactiver la reconnaissance vocale',
                'terminer l\'écoute': 'Désactiver la reconnaissance vocale'
            }
        };
        
        // Ajouter chaque catégorie et ses commandes
        for (const [category, commands] of Object.entries(categories)) {
            const categoryEl = document.createElement('div');
            categoryEl.className = 'voice-help-category';
            
            const categoryTitle = document.createElement('h3');
            categoryTitle.textContent = category;
            categoryEl.appendChild(categoryTitle);
            
            for (const [command, description] of Object.entries(commands)) {
                const commandEl = document.createElement('div');
                commandEl.className = 'voice-help-command';
                
                const phrase = document.createElement('div');
                phrase.className = 'voice-help-command-phrase';
                phrase.textContent = '"' + command + '"';
                
                const desc = document.createElement('div');
                desc.className = 'voice-help-command-description';
                desc.textContent = description;
                
                commandEl.appendChild(phrase);
                commandEl.appendChild(desc);
                categoryEl.appendChild(commandEl);
            }
            
            container.appendChild(categoryEl);
        }
        
        // Bouton de fermeture
        const closeContainer = document.createElement('div');
        closeContainer.className = 'voice-help-close';
        
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Fermer';
        closeButton.onclick = () => {
            document.getElementById('voice-help-overlay').classList.remove('show');
        };
        
        closeContainer.appendChild(closeButton);
        container.appendChild(closeContainer);
        
        // Ajouter le conteneur à l'overlay
        overlay.appendChild(container);
        
        // Ajouter l'overlay au corps du document
        document.body.appendChild(overlay);
        
        // Ajouter un gestionnaire d'événement pour fermer l'overlay en cliquant en dehors
        overlay.addEventListener('click', (event) => {
            if (event.target === overlay) {
                overlay.classList.remove('show');
            }
        });
    }
    
    // Afficher l'overlay
    overlay.classList.add('show');
}

/**
 * Navigation vers une page
 */
function navigateTo(url) {
    showNotification('Navigation vers ' + url);
    setTimeout(() => {
        window.location.href = url;
    }, 500);
}

/**
 * Voir un projet par commande vocale
 */
function viewProjectVoice(projectName) {
    if (!projectName) {
        showNotification('Nom de projet non spécifié', 'error');
        return;
    }
    
    // Charger tous les projets
    let projects = [];
    try {
        projects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
    } catch (error) {
        console.error('Erreur lors du chargement des projets:', error);
        showNotification('Erreur lors du chargement des projets', 'error');
        return;
    }
    
    // Rechercher le projet par nom (en utilisant une correspondance partielle)
    projectName = projectName.toLowerCase();
    const project = projects.find(p => p.projectName.toLowerCase().includes(projectName));
    
    if (project) {
        showNotification('Ouverture du projet: ' + project.projectName);
        setTimeout(() => {
            window.location.href = `projet.html?id=${project.id}`;
        }, 500);
    } else {
        showNotification('Projet non trouvé: ' + projectName, 'error');
    }
}

/**
 * Éditer un projet par commande vocale
 */
function editProjectVoice(projectName) {
    if (!projectName) {
        showNotification('Nom de projet non spécifié', 'error');
        return;
    }
    
    // Charger tous les projets
    let projects = [];
    try {
        projects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
    } catch (error) {
        console.error('Erreur lors du chargement des projets:', error);
        showNotification('Erreur lors du chargement des projets', 'error');
        return;
    }
    
    // Rechercher le projet par nom (en utilisant une correspondance partielle)
    projectName = projectName.toLowerCase();
    const project = projects.find(p => p.projectName.toLowerCase().includes(projectName));
    
    if (project) {
        showNotification('Édition du projet: ' + project.projectName);
        setTimeout(() => {
            window.location.href = `nouveau-projet.html?id=${project.id}`;
        }, 500);
    } else {
        showNotification('Projet non trouvé: ' + projectName, 'error');
    }
}

/**
 * Supprimer un projet par commande vocale
 */
function deleteProjectVoice(projectName) {
    if (!projectName) {
        showNotification('Nom de projet non spécifié', 'error');
        return;
    }
    
    // Charger tous les projets
    let projects = [];
    try {
        projects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
    } catch (error) {
        console.error('Erreur lors du chargement des projets:', error);
        showNotification('Erreur lors du chargement des projets', 'error');
        return;
    }
    
    // Rechercher le projet par nom (en utilisant une correspondance partielle)
    projectName = projectName.toLowerCase();
    const project = projects.find(p => p.projectName.toLowerCase().includes(projectName));
    
    if (project) {
        if (confirm(`Êtes-vous sûr de vouloir supprimer le projet "${project.projectName}" ?`)) {
            // Filtrer le projet à supprimer
            projects = projects.filter(p => p.id !== project.id);
            
            // Enregistrer les projets mis à jour
            localStorage.setItem('savedProjects', JSON.stringify(projects));
            
            // Si le projet était lié à un portefeuille, mettre à jour les données du portefeuille
            if (project.linkToWallet) {
                let walletData = {};
                try {
                    walletData = JSON.parse(localStorage.getItem('walletData') || '{"linkedProjects":[]}');
                    if (walletData.linkedProjects) {
                        walletData.linkedProjects = walletData.linkedProjects.filter(id => id !== project.id);
                        localStorage.setItem('walletData', JSON.stringify(walletData));
                    }
                } catch (error) {
                    console.error('Erreur lors de la mise à jour du portefeuille:', error);
                }
            }
            
            showNotification('Projet supprimé avec succès: ' + project.projectName);
            
            // Recharger la page si nous sommes sur la page d'accueil
            if (window.location.pathname.endsWith('index.html')) {
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                // Sinon, rediriger vers la page d'accueil
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            }
        }
    } else {
        showNotification('Projet non trouvé: ' + projectName, 'error');
    }
}

// Initialiser les commandes vocales lors du chargement du document
document.addEventListener('DOMContentLoaded', initVoiceCommands);