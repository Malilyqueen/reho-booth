/**
 * MODULE: templateLoader.js
 * 
 * Ce module gère le chargement des modèles prédéfinis de budget.
 * Il fournit les structures de catégories, sous-catégories et lignes
 * pour différents types de projets (mariage, anniversaire, voyage, etc.)
 * 
 * Fonctionnalités principales:
 * - Définition des templates de budget
 * - Chargement d'un template dans le DOM
 * - Gestion des templates personnalisés
 * - Interface avec les autres modules pour le rendu
 */

const TemplateLoader = (function() {
    // Liste des templates disponibles
    const TEMPLATES = {
        // Anniversaire
        'Anniversaire': {
            name: 'Anniversaire',
            icon: '🎂',
            description: 'Planifiez un anniversaire mémorable avec ce budget structuré',
            categories: [
                {
                    name: 'Restauration',
                    icon: '🍽️',
                    subcategories: [
                        {
                            name: 'Traiteur',
                            lines: [
                                { name: 'Menu principal', amount: 0 },
                                { name: 'Desserts', amount: 0 }
                            ]
                        },
                        {
                            name: 'Boissons',
                            lines: [
                                { name: 'Soft drinks', amount: 0 },
                                { name: 'Alcool', amount: 0 }
                            ]
                        }
                    ]
                },
                {
                    name: 'Animation',
                    icon: '🎵',
                    subcategories: [
                        {
                            name: 'DJ',
                            lines: [
                                { name: 'DJ forfait soirée', amount: 0 }
                            ]
                        },
                        {
                            name: 'Jeux',
                            lines: [
                                { name: 'Matériel de jeux', amount: 0 }
                            ]
                        }
                    ]
                },
                {
                    name: 'Décoration',
                    icon: '🎈',
                    subcategories: [
                        {
                            name: 'Salle',
                            lines: [
                                { name: 'Ballons', amount: 0 },
                                { name: 'Guirlandes', amount: 0 }
                            ]
                        },
                        {
                            name: 'Table',
                            lines: [
                                { name: 'Nappes', amount: 0 },
                                { name: 'Vaisselle jetable', amount: 0 }
                            ]
                        }
                    ]
                }
            ]
        },
        
        // Mariage
        'Mariage': {
            name: 'Mariage',
            icon: '💍',
            description: 'Organisez votre mariage de rêve avec ce modèle complet',
            categories: [
                {
                    name: 'Cérémonie',
                    icon: '💍',
                    subcategories: [
                        {
                            name: 'Lieu',
                            lines: [
                                { name: 'Location', amount: 0 },
                                { name: 'Décoration', amount: 0 }
                            ]
                        },
                        {
                            name: 'Officiant',
                            lines: [
                                { name: 'Honoraires', amount: 0 }
                            ]
                        }
                    ]
                },
                {
                    name: 'Réception',
                    icon: '🎉',
                    subcategories: [
                        {
                            name: 'Salle',
                            lines: [
                                { name: 'Location', amount: 0 },
                                { name: 'Décoration', amount: 0 }
                            ]
                        },
                        {
                            name: 'Traiteur',
                            lines: [
                                { name: 'Repas', amount: 0 },
                                { name: 'Gâteau', amount: 0 },
                                { name: 'Boissons', amount: 0 }
                            ]
                        },
                        {
                            name: 'Animation',
                            lines: [
                                { name: 'DJ', amount: 0 },
                                { name: 'Groupe', amount: 0 }
                            ]
                        }
                    ]
                },
                {
                    name: 'Tenues',
                    icon: '👰',
                    subcategories: [
                        {
                            name: 'Mariée',
                            lines: [
                                { name: 'Robe', amount: 0 },
                                { name: 'Accessoires', amount: 0 }
                            ]
                        },
                        {
                            name: 'Marié',
                            lines: [
                                { name: 'Costume', amount: 0 },
                                { name: 'Accessoires', amount: 0 }
                            ]
                        }
                    ]
                },
                {
                    name: 'Services',
                    icon: '📸',
                    subcategories: [
                        {
                            name: 'Photo & Vidéo',
                            lines: [
                                { name: 'Photographe', amount: 0 },
                                { name: 'Vidéaste', amount: 0 }
                            ]
                        },
                        {
                            name: 'Fleurs',
                            lines: [
                                { name: 'Bouquets', amount: 0 },
                                { name: 'Décorations florales', amount: 0 }
                            ]
                        }
                    ]
                }
            ]
        },
        
        // Voyage
        'Voyage': {
            name: 'Voyage',
            icon: '✈️',
            description: 'Planifiez votre voyage sans stress avec ce modèle détaillé',
            categories: [
                {
                    name: 'Transport',
                    icon: '✈️',
                    subcategories: [
                        {
                            name: 'Aller',
                            lines: [
                                { name: 'Billets', amount: 0 }
                            ]
                        },
                        {
                            name: 'Retour',
                            lines: [
                                { name: 'Billets', amount: 0 }
                            ]
                        },
                        {
                            name: 'Sur place',
                            lines: [
                                { name: 'Transports locaux', amount: 0 },
                                { name: 'Location de véhicule', amount: 0 }
                            ]
                        }
                    ]
                },
                {
                    name: 'Hébergement',
                    icon: '🏨',
                    subcategories: [
                        {
                            name: 'Hôtels',
                            lines: [
                                { name: 'Chambres', amount: 0 }
                            ]
                        },
                        {
                            name: 'Locations',
                            lines: [
                                { name: 'Appartements', amount: 0 }
                            ]
                        }
                    ]
                },
                {
                    name: 'Activités',
                    icon: '🏄‍♂️',
                    subcategories: [
                        {
                            name: 'Excursions',
                            lines: [
                                { name: 'Visites guidées', amount: 0 }
                            ]
                        },
                        {
                            name: 'Loisirs',
                            lines: [
                                { name: 'Sports', amount: 0 },
                                { name: 'Attractions', amount: 0 }
                            ]
                        }
                    ]
                },
                {
                    name: 'Restauration',
                    icon: '🍴',
                    subcategories: [
                        {
                            name: 'Restaurants',
                            lines: [
                                { name: 'Repas', amount: 0 }
                            ]
                        },
                        {
                            name: 'Divers',
                            lines: [
                                { name: 'Snacks', amount: 0 },
                                { name: 'Boissons', amount: 0 }
                            ]
                        }
                    ]
                }
            ]
        },
        
        // Déménagement
        'Déménagement': {
            name: 'Déménagement',
            icon: '📦',
            description: 'Organisez votre déménagement étape par étape avec ce modèle',
            categories: [
                {
                    name: 'Transport',
                    icon: '🚚',
                    subcategories: [
                        {
                            name: 'Véhicule',
                            lines: [
                                { name: 'Location de camion', amount: 0 },
                                { name: 'Carburant', amount: 0 }
                            ]
                        },
                        {
                            name: 'Déménageurs',
                            lines: [
                                { name: 'Service professionnel', amount: 0 }
                            ]
                        }
                    ]
                },
                {
                    name: 'Emballage',
                    icon: '📦',
                    subcategories: [
                        {
                            name: 'Matériel',
                            lines: [
                                { name: 'Cartons', amount: 0 },
                                { name: 'Ruban adhésif', amount: 0 },
                                { name: 'Protections', amount: 0 }
                            ]
                        }
                    ]
                },
                {
                    name: 'Logement',
                    icon: '🏠',
                    subcategories: [
                        {
                            name: 'Ancien',
                            lines: [
                                { name: 'Nettoyage', amount: 0 },
                                { name: 'Réparations', amount: 0 }
                            ]
                        },
                        {
                            name: 'Nouveau',
                            lines: [
                                { name: 'Caution', amount: 0 },
                                { name: 'Premier loyer', amount: 0 },
                                { name: 'Frais d\'agence', amount: 0 }
                            ]
                        }
                    ]
                },
                {
                    name: 'Administratif',
                    icon: '📝',
                    subcategories: [
                        {
                            name: 'Changements d\'adresse',
                            lines: [
                                { name: 'Abonnements', amount: 0 }
                            ]
                        },
                        {
                            name: 'Installation',
                            lines: [
                                { name: 'Internet', amount: 0 },
                                { name: 'Électricité', amount: 0 }
                            ]
                        }
                    ]
                }
            ]
        },
        
        // Travaux
        'Travaux': {
            name: 'Travaux',
            icon: '🔨',
            description: 'Planifiez vos travaux de rénovation en détail',
            categories: [
                {
                    name: 'Matériaux',
                    icon: '🧱',
                    subcategories: [
                        {
                            name: 'Gros œuvre',
                            lines: [
                                { name: 'Ciment', amount: 0 },
                                { name: 'Bois', amount: 0 }
                            ]
                        },
                        {
                            name: 'Finitions',
                            lines: [
                                { name: 'Peinture', amount: 0 },
                                { name: 'Revêtements', amount: 0 }
                            ]
                        }
                    ]
                },
                {
                    name: 'Main d\'œuvre',
                    icon: '👷',
                    subcategories: [
                        {
                            name: 'Professionnels',
                            lines: [
                                { name: 'Plombier', amount: 0 },
                                { name: 'Électricien', amount: 0 },
                                { name: 'Maçon', amount: 0 }
                            ]
                        }
                    ]
                },
                {
                    name: 'Équipement',
                    icon: '🔧',
                    subcategories: [
                        {
                            name: 'Outils',
                            lines: [
                                { name: 'Location', amount: 0 },
                                { name: 'Achat', amount: 0 }
                            ]
                        },
                        {
                            name: 'Sécurité',
                            lines: [
                                { name: 'Équipements de protection', amount: 0 }
                            ]
                        }
                    ]
                },
                {
                    name: 'Déchets',
                    icon: '🗑️',
                    subcategories: [
                        {
                            name: 'Évacuation',
                            lines: [
                                { name: 'Location benne', amount: 0 }
                            ]
                        }
                    ]
                }
            ]
        },
        
        // Entreprise
        'Entreprise': {
            name: 'Entreprise',
            icon: '💼',
            description: 'Gérez le budget de votre entreprise ou projet professionnel',
            categories: [
                {
                    name: 'Personnel',
                    icon: '👥',
                    subcategories: [
                        {
                            name: 'Salaires',
                            lines: [
                                { name: 'Employés', amount: 0 },
                                { name: 'Charges sociales', amount: 0 }
                            ]
                        },
                        {
                            name: 'Freelances',
                            lines: [
                                { name: 'Prestataires externes', amount: 0 }
                            ]
                        }
                    ]
                },
                {
                    name: 'Locaux',
                    icon: '🏢',
                    subcategories: [
                        {
                            name: 'Loyer',
                            lines: [
                                { name: 'Mensualités', amount: 0 }
                            ]
                        },
                        {
                            name: 'Charges',
                            lines: [
                                { name: 'Électricité', amount: 0 },
                                { name: 'Eau', amount: 0 },
                                { name: 'Internet', amount: 0 }
                            ]
                        }
                    ]
                },
                {
                    name: 'Marketing',
                    icon: '📊',
                    subcategories: [
                        {
                            name: 'Digital',
                            lines: [
                                { name: 'Site web', amount: 0 },
                                { name: 'Publicité en ligne', amount: 0 }
                            ]
                        },
                        {
                            name: 'Traditionnel',
                            lines: [
                                { name: 'Impression', amount: 0 },
                                { name: 'Événements', amount: 0 }
                            ]
                        }
                    ]
                },
                {
                    name: 'Équipement',
                    icon: '💻',
                    subcategories: [
                        {
                            name: 'Informatique',
                            lines: [
                                { name: 'Matériel', amount: 0 },
                                { name: 'Logiciels', amount: 0 }
                            ]
                        },
                        {
                            name: 'Mobilier',
                            lines: [
                                { name: 'Bureau', amount: 0 }
                            ]
                        }
                    ]
                },
                {
                    name: 'Services',
                    icon: '📝',
                    subcategories: [
                        {
                            name: 'Comptabilité',
                            lines: [
                                { name: 'Honoraires comptable', amount: 0 }
                            ]
                        },
                        {
                            name: 'Juridique',
                            lines: [
                                { name: 'Conseils', amount: 0 }
                            ]
                        }
                    ]
                }
            ]
        },
        
        // Personnalisé
        'Personnalisé': {
            name: 'Personnalisé',
            icon: '✨',
            description: 'Créez votre propre structure de budget',
            categories: [
                {
                    name: 'Catégorie 1',
                    icon: '📊',
                    subcategories: [
                        {
                            name: 'Sous-catégorie 1',
                            lines: [
                                { name: 'Ligne 1', amount: 0 }
                            ]
                        }
                    ]
                }
            ]
        },
        
        // Vide (pour partir de zéro)
        'Empty': {
            name: 'Vide',
            icon: '📝',
            description: 'Commencez avec une structure vide',
            categories: []
        }
    };
    
    /**
     * Initialise le chargeur de templates
     */
    function initialize() {
        console.log('Initialisation du chargeur de templates...');
        
        // Attacher les écouteurs d'événements si nécessaire
        _setupTemplateSelectors();
        
        console.log('✅ Chargeur de templates initialisé avec succès');
        return {
            success: true,
            message: 'Chargeur de templates initialisé avec succès'
        };
    }
    
    /**
     * Obtient la liste des templates disponibles
     * @returns {Array} Liste des templates
     */
    function getAvailableTemplates() {
        return Object.keys(TEMPLATES).map(key => ({
            id: key,
            name: TEMPLATES[key].name,
            icon: TEMPLATES[key].icon,
            description: TEMPLATES[key].description
        }));
    }
    
    /**
     * Obtient un template spécifique
     * @param {string} templateId Identifiant du template
     * @returns {Object|null} Le template ou null s'il n'existe pas
     */
    function getTemplate(templateId) {
        return TEMPLATES[templateId] || null;
    }
    
    /**
     * Charge un template dans le DOM
     * @param {string} templateId Identifiant du template
     * @returns {boolean} true si le chargement a réussi
     */
    function loadTemplate(templateId) {
        console.log(`🔄 Chargement du template: ${templateId}`);
        
        // Vérifier que le template existe
        if (!TEMPLATES[templateId]) {
            console.error(`❌ Template non trouvé: ${templateId}`);
            return false;
        }
        
        // Récupérer les données du template
        const template = TEMPLATES[templateId];
        
        try {
            // Utiliser ProjectRenderer si disponible
            if (window.ProjectRenderer) {
                // Vider le conteneur
                const container = document.querySelector('#expenseCategories') || 
                                 document.querySelector('#categoriesContainer');
                                 
                if (!container) {
                    console.error('❌ Conteneur de catégories non trouvé');
                    return false;
                }
                
                container.innerHTML = '';
                
                // Rendre chaque catégorie
                template.categories.forEach(category => {
                    const categoryElement = ProjectRenderer.renderCategory(category, { editMode: true });
                    container.appendChild(categoryElement);
                    
                    // Attacher les écouteurs si FormManager est disponible
                    if (window.FormManager && typeof FormManager.attachCategoryEventListeners === 'function') {
                        FormManager.attachCategoryEventListeners(categoryElement);
                    }
                });
                
                // Recalculer les montants
                if (window.BudgetCalculator && typeof BudgetCalculator.recalculateAllAmounts === 'function') {
                    setTimeout(BudgetCalculator.recalculateAllAmounts, 0);
                } else if (typeof recalculateAllAmounts === 'function') {
                    setTimeout(recalculateAllAmounts, 0);
                }
            } else if (typeof updateTemplateCategoriesUI === 'function') {
                // Fallback: utiliser la fonction existante
                updateTemplateCategoriesUI(templateId);
            } else {
                console.error('❌ Aucune méthode de rendu disponible');
                return false;
            }
            
            console.log(`✅ Template "${template.name}" chargé avec succès`);
            return true;
        } catch (error) {
            console.error('❌ Erreur lors du chargement du template:', error);
            return false;
        }
    }
    
    /**
     * Ajoute un template personnalisé
     * @param {string} templateId Identifiant du template
     * @param {Object} templateData Données du template
     * @returns {boolean} true si l'ajout a réussi
     */
    function addCustomTemplate(templateId, templateData) {
        if (!templateId || !templateData) {
            console.error('❌ Identifiant ou données de template non fournis');
            return false;
        }
        
        // Vérifier que l'ID n'existe pas déjà
        if (TEMPLATES[templateId] && !templateData.overwrite) {
            console.error(`❌ Un template avec l'ID "${templateId}" existe déjà`);
            return false;
        }
        
        // Valider la structure
        if (!_validateTemplateStructure(templateData)) {
            console.error('❌ Structure de template invalide');
            return false;
        }
        
        // Ajouter le template
        TEMPLATES[templateId] = templateData;
        
        console.log(`✅ Template "${templateData.name}" ajouté avec succès`);
        return true;
    }
    
    /**
     * Méthode privée pour configurer les sélecteurs de templates
     * @private
     */
    function _setupTemplateSelectors() {
        // Si EventsManager est disponible, on lui délègue la gestion des événements
        if (window.EventsManager) {
            return;
        }
        
        // Fallback: attacher directement les écouteurs
        const templateOptions = document.querySelectorAll('.template-option');
        
        templateOptions.forEach(option => {
            option.addEventListener('click', function() {
                const templateId = this.dataset.template;
                
                // Marquer cette option comme sélectionnée
                templateOptions.forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
                
                // Charger le template
                loadTemplate(templateId);
                
                // Mettre à jour le champ de sélection de template
                const templateSelector = document.querySelector('#templateSelector');
                if (templateSelector) {
                    templateSelector.value = templateId;
                }
            });
        });
    }
    
    /**
     * Méthode privée pour valider la structure d'un template
     * @private
     * @param {Object} template Template à valider
     * @returns {boolean} true si le template est valide
     */
    function _validateTemplateStructure(template) {
        // Vérifier les propriétés de base
        if (!template.name || !template.categories) {
            return false;
        }
        
        // Vérifier que categories est un tableau
        if (!Array.isArray(template.categories)) {
            return false;
        }
        
        // Vérifier chaque catégorie
        for (const category of template.categories) {
            if (!category.name || !Array.isArray(category.subcategories)) {
                return false;
            }
            
            // Vérifier chaque sous-catégorie
            for (const subcategory of category.subcategories) {
                if (!subcategory.name || !Array.isArray(subcategory.lines)) {
                    return false;
                }
                
                // Vérifier chaque ligne
                for (const line of subcategory.lines) {
                    if (!line.name) {
                        return false;
                    }
                }
            }
        }
        
        return true;
    }
    
    // Exposer l'API publique
    return {
        initialize,
        getAvailableTemplates,
        getTemplate,
        loadTemplate,
        addCustomTemplate
    };
})();

// Auto-initialisation du module
document.addEventListener('DOMContentLoaded', function() {
    TemplateLoader.initialize();
});