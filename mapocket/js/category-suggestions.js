/**
 * Système de suggestions de catégories et sous-catégories pour MaPocket
 * Ce module fournit des suggestions adaptées au modèle de projet sélectionné
 */

/**
 * Obtient les suggestions de catégories et sous-catégories pour un type de projet donné
 * @param {string} type - Le type de projet (template)
 * @returns {Array} - Un tableau d'objets représentant les catégories suggérées
 */
function getSuggestionsByTemplate(type) {
    // Templates de suggestions par type de projet
    const templates = {
        "Anniversaire": [
            {
                name: "Restauration",
                subcategories: [
                    { name: "Traiteur", lines: [] },
                    { name: "Gâteau", lines: [] },
                    { name: "Boissons", lines: [] }
                ]
            },
            {
                name: "Ambiance & Animation",
                subcategories: [
                    { name: "DJ / Musique", lines: [] },
                    { name: "Décoration", lines: [] },
                    { name: "Animations", lines: [] }
                ]
            },
            {
                name: "Logistique",
                subcategories: [
                    { name: "Location salle", lines: [] },
                    { name: "Transport", lines: [] },
                    { name: "Invitations", lines: [] }
                ]
            },
            {
                name: "Cadeaux",
                subcategories: [
                    { name: "Cadeaux invités", lines: [] },
                    { name: "Cadeau principal", lines: [] }
                ]
            }
        ],
        "Mariage": [
            {
                name: "Cérémonie",
                subcategories: [
                    { name: "Lieu", lines: [] },
                    { name: "Officiant", lines: [] },
                    { name: "Décoration cérémoniale", lines: [] }
                ]
            },
            {
                name: "Réception",
                subcategories: [
                    { name: "Lieu", lines: [] },
                    { name: "Traiteur", lines: [] },
                    { name: "Boissons", lines: [] },
                    { name: "Gâteau", lines: [] },
                    { name: "Décoration", lines: [] }
                ]
            },
            {
                name: "Tenues",
                subcategories: [
                    { name: "Robe", lines: [] },
                    { name: "Costume", lines: [] },
                    { name: "Accessoires", lines: [] },
                    { name: "Coiffure & Maquillage", lines: [] }
                ]
            },
            {
                name: "Services",
                subcategories: [
                    { name: "Photographe", lines: [] },
                    { name: "Vidéaste", lines: [] },
                    { name: "DJ / Musique", lines: [] },
                    { name: "Animation", lines: [] }
                ]
            },
            {
                name: "Papeterie",
                subcategories: [
                    { name: "Faire-part", lines: [] },
                    { name: "Menu", lines: [] },
                    { name: "Plan de table", lines: [] }
                ]
            },
            {
                name: "Logistique",
                subcategories: [
                    { name: "Transport", lines: [] },
                    { name: "Hébergement", lines: [] }
                ]
            }
        ],
        "Baby shower": [
            {
                name: "Restauration",
                subcategories: [
                    { name: "Buffet", lines: [] },
                    { name: "Gâteau", lines: [] },
                    { name: "Boissons", lines: [] }
                ]
            },
            {
                name: "Déco & Ambiance",
                subcategories: [
                    { name: "Décoration", lines: [] },
                    { name: "Jeux", lines: [] }
                ]
            },
            {
                name: "Cadeaux",
                subcategories: [
                    { name: "Cadeaux invités", lines: [] },
                    { name: "Cadeaux parents/bébé", lines: [] }
                ]
            },
            {
                name: "Logistique",
                subcategories: [
                    { name: "Location salle", lines: [] },
                    { name: "Invitations", lines: [] }
                ]
            }
        ],
        "Fête d'entreprise": [
            {
                name: "Lieu",
                subcategories: [
                    { name: "Location salle", lines: [] },
                    { name: "Configuration", lines: [] }
                ]
            },
            {
                name: "Restauration",
                subcategories: [
                    { name: "Traiteur", lines: [] },
                    { name: "Boissons", lines: [] },
                    { name: "Service", lines: [] }
                ]
            },
            {
                name: "Animation",
                subcategories: [
                    { name: "DJ / Musique", lines: [] },
                    { name: "Activités team building", lines: [] },
                    { name: "Animations spéciales", lines: [] }
                ]
            },
            {
                name: "Logistique",
                subcategories: [
                    { name: "Transport", lines: [] },
                    { name: "Hébergement", lines: [] },
                    { name: "Communication", lines: [] }
                ]
            },
            {
                name: "Cadeaux",
                subcategories: [
                    { name: "Cadeaux collaborateurs", lines: [] },
                    { name: "Prix", lines: [] }
                ]
            }
        ],
        "Célébration religieuse": [
            {
                name: "Cérémonie",
                subcategories: [
                    { name: "Lieu", lines: [] },
                    { name: "Officiant", lines: [] },
                    { name: "Décoration", lines: [] }
                ]
            },
            {
                name: "Réception",
                subcategories: [
                    { name: "Lieu", lines: [] },
                    { name: "Traiteur", lines: [] },
                    { name: "Boissons", lines: [] },
                    { name: "Décoration", lines: [] }
                ]
            },
            {
                name: "Tenues",
                subcategories: [
                    { name: "Tenue principale", lines: [] },
                    { name: "Accessoires", lines: [] }
                ]
            },
            {
                name: "Services",
                subcategories: [
                    { name: "Photographe", lines: [] },
                    { name: "Musique", lines: [] }
                ]
            },
            {
                name: "Communication",
                subcategories: [
                    { name: "Faire-part", lines: [] },
                    { name: "Souvenirs", lines: [] }
                ]
            }
        ],
        "Lancement de produit": [
            {
                name: "Communication",
                subcategories: [
                    { name: "RP & Presse", lines: [] },
                    { name: "Marketing digital", lines: [] },
                    { name: "Supports imprimés", lines: [] }
                ]
            },
            {
                name: "Événement de lancement",
                subcategories: [
                    { name: "Location salle", lines: [] },
                    { name: "Traiteur", lines: [] },
                    { name: "Technique", lines: [] },
                    { name: "Décoration", lines: [] }
                ]
            },
            {
                name: "Produit",
                subcategories: [
                    { name: "Échantillons", lines: [] },
                    { name: "Démonstration", lines: [] },
                    { name: "Packaging", lines: [] }
                ]
            },
            {
                name: "Logistique",
                subcategories: [
                    { name: "Transport", lines: [] },
                    { name: "Personnel", lines: [] },
                    { name: "Hébergement", lines: [] }
                ]
            }
        ],
        "Formation professionnelle": [
            {
                name: "Formation",
                subcategories: [
                    { name: "Formateur", lines: [] },
                    { name: "Supports", lines: [] },
                    { name: "Certification", lines: [] }
                ]
            },
            {
                name: "Logistique",
                subcategories: [
                    { name: "Salle", lines: [] },
                    { name: "Équipement", lines: [] },
                    { name: "Restauration", lines: [] }
                ]
            },
            {
                name: "Marketing",
                subcategories: [
                    { name: "Communication", lines: [] },
                    { name: "Inscription", lines: [] }
                ]
            },
            {
                name: "Personnel",
                subcategories: [
                    { name: "Assistants", lines: [] },
                    { name: "Administration", lines: [] }
                ]
            }
        ],
        "Budget mensuel": [
            {
                name: "Logement",
                subcategories: [
                    { name: "Loyer/Prêt", lines: [] },
                    { name: "Charges", lines: [] },
                    { name: "Entretien", lines: [] }
                ]
            },
            {
                name: "Alimentation",
                subcategories: [
                    { name: "Courses", lines: [] },
                    { name: "Restaurants", lines: [] }
                ]
            },
            {
                name: "Transport",
                subcategories: [
                    { name: "Carburant", lines: [] },
                    { name: "Transports en commun", lines: [] },
                    { name: "Entretien véhicule", lines: [] }
                ]
            },
            {
                name: "Santé",
                subcategories: [
                    { name: "Assurances", lines: [] },
                    { name: "Médicaments", lines: [] },
                    { name: "Consultations", lines: [] }
                ]
            },
            {
                name: "Loisirs",
                subcategories: [
                    { name: "Sorties", lines: [] },
                    { name: "Abonnements", lines: [] },
                    { name: "Shopping", lines: [] }
                ]
            },
            {
                name: "Épargne",
                subcategories: [
                    { name: "Épargne régulière", lines: [] },
                    { name: "Investissements", lines: [] }
                ]
            }
        ]
    };
    
    // Pour tout autre type non défini, retourner un modèle de base
    if (!templates[type]) {
        return [
            {
                name: "Catégorie 1",
                subcategories: [
                    { name: "Sous-catégorie 1", lines: [] },
                    { name: "Sous-catégorie 2", lines: [] }
                ]
            },
            {
                name: "Catégorie 2",
                subcategories: [
                    { name: "Sous-catégorie 1", lines: [] },
                    { name: "Sous-catégorie 2", lines: [] }
                ]
            }
        ];
    }
    
    return templates[type];
}

/**
 * Génère le HTML pour les catégories suggérées
 * @param {Array} categories - Tableau d'objets représentant les catégories
 * @returns {string} - Le HTML généré pour les catégories
 */
function generateCategoriesHTML(categories) {
    let html = '';
    
    categories.forEach((category, categoryIndex) => {
        html += `
        <div class="category" data-category-index="${categoryIndex}">
            <div class="category-header">
                <div class="category-name-container">
                    <span class="category-emoji">${getEmoji(category.name)}</span>
                    <input type="text" class="category-name editable-field" value="${category.name}" data-original="${category.name}">
                </div>
                <div class="category-actions">
                    <span class="category-amount">€ 0</span>
                    <button type="button" class="btn-delete-category" title="Supprimer cette catégorie">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
            <div class="subcategories">
                ${generateSubcategoriesHTML(category.subcategories, categoryIndex)}
                <button type="button" class="btn-add-subcategory" data-category-index="${categoryIndex}">
                    <i class="fas fa-plus"></i> Ajouter une sous-catégorie
                </button>
            </div>
        </div>
        `;
    });
    
    html += `
    <button type="button" id="addCategoryBtn" class="add-category-btn">
        <i class="fas fa-plus"></i> Ajouter une catégorie
    </button>
    `;
    
    return html;
}

/**
 * Génère le HTML pour les sous-catégories
 * @param {Array} subcategories - Tableau d'objets représentant les sous-catégories
 * @param {number} categoryIndex - Index de la catégorie parente
 * @returns {string} - Le HTML généré pour les sous-catégories
 */
function generateSubcategoriesHTML(subcategories, categoryIndex) {
    let html = '';
    
    subcategories.forEach((subcategory, subcategoryIndex) => {
        html += `
        <div class="subcategory" data-category-index="${categoryIndex}" data-subcategory-index="${subcategoryIndex}">
            <div class="subcategory-header">
                <div class="subcategory-name-container">
                    <span class="subcategory-emoji">${getEmoji(subcategory.name)}</span>
                    <input type="text" class="subcategory-name editable-field" value="${subcategory.name}" data-original="${subcategory.name}">
                </div>
                <div class="subcategory-actions">
                    <span class="subcategory-amount">€ 0</span>
                    <button type="button" class="btn-add-expense-line" title="Ajouter une ligne de dépense" data-category-index="${categoryIndex}" data-subcategory-index="${subcategoryIndex}">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button type="button" class="btn-delete-subcategory" title="Supprimer cette sous-catégorie">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
            <div class="expense-lines">
                ${generateExpenseLinesHTML(subcategory.lines)}
            </div>
        </div>
        `;
    });
    
    return html;
}

/**
 * Génère le HTML pour les lignes de dépense
 * @param {Array} lines - Tableau d'objets représentant les lignes de dépense
 * @returns {string} - Le HTML généré pour les lignes
 */
function generateExpenseLinesHTML(lines) {
    let html = '';
    
    if (lines && lines.length > 0) {
        lines.forEach((line, lineIndex) => {
            html += `
            <div class="expense-line" data-line-index="${lineIndex}">
                <div class="expense-line-content">
                    <input type="text" class="expense-line-name editable-field" value="${line.name}" data-original="${line.name}">
                    <div class="expense-line-amount-container">
                        <input type="text" class="expense-line-amount editable-field" value="${formatCurrency(line.amount)}" data-original="${line.amount}">
                        <button type="button" class="btn-delete-expense-line" title="Supprimer cette ligne">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            </div>
            `;
        });
    }
    
    return html;
}

/**
 * Obtient un emoji pour une catégorie ou sous-catégorie donnée
 * @param {string} name - Nom de la catégorie ou sous-catégorie
 * @returns {string} - Un emoji approprié
 */
function getEmoji(name) {
    const emojiMap = {
        // Catégories générales
        "Restauration": "🍽️",
        "Ambiance & Animation": "🎵",
        "Logistique": "🚚",
        "Cadeaux": "🎁",
        "Lieu": "🏢",
        "Communication": "📣",
        "Personnel": "👥",
        "Services": "🛎️",
        "Tenues": "👗",
        "Déco & Ambiance": "🎊",
        "Animation": "🎭",
        "Cérémonie": "💒",
        "Réception": "🎉",
        "Papeterie": "📝",
        "Formation": "📚",
        "Marketing": "📈",
        "Produit": "📦",
        "Événement de lancement": "🚀",
        "Logement": "🏠",
        "Alimentation": "🍎",
        "Transport": "🚗",
        "Santé": "⚕️",
        "Loisirs": "🎮",
        "Épargne": "💰",
        
        // Sous-catégories
        "Traiteur": "🍴",
        "Gâteau": "🎂",
        "Boissons": "🥂",
        "DJ / Musique": "🎧",
        "Décoration": "🎈",
        "Animations": "🎪",
        "Location salle": "🏛️",
        "Transport": "🚌",
        "Invitations": "💌",
        "Cadeaux invités": "🎀",
        "Cadeau principal": "🎁",
        "Lieu": "🏛️",
        "Officiant": "👨‍⚖️",
        "Décoration cérémoniale": "💐",
        "Robe": "👰",
        "Costume": "🤵",
        "Accessoires": "👑",
        "Coiffure & Maquillage": "💇",
        "Photographe": "📸",
        "Vidéaste": "🎥",
        "Animation": "🎮",
        "Faire-part": "✉️",
        "Menu": "📜",
        "Plan de table": "🗺️",
        "Hébergement": "🏨",
        "Buffet": "🍱",
        "Jeux": "🎯",
        "Cadeaux parents/bébé": "👶",
        "Configuration": "⚙️",
        "Service": "👨‍🍳",
        "Activités team building": "🧩",
        "Animations spéciales": "🎬",
        "Prix": "🏆",
        "Tenue principale": "👔",
        "Musique": "🎻",
        "Souvenirs": "🖼️",
        "RP & Presse": "📰",
        "Marketing digital": "💻",
        "Supports imprimés": "🖨️",
        "Technique": "🔌",
        "Échantillons": "🧪",
        "Démonstration": "🔍",
        "Packaging": "📦",
        "Formateur": "👨‍🏫",
        "Supports": "📊",
        "Certification": "📜",
        "Équipement": "🔧",
        "Inscription": "📝",
        "Assistants": "👨‍💼",
        "Administration": "📋",
        "Loyer/Prêt": "🏦",
        "Charges": "📑",
        "Entretien": "🧹",
        "Courses": "🛒",
        "Restaurants": "🍝",
        "Carburant": "⛽",
        "Transports en commun": "🚇",
        "Entretien véhicule": "🔧",
        "Assurances": "📋",
        "Médicaments": "💊",
        "Consultations": "👨‍⚕️",
        "Sorties": "🎟️",
        "Abonnements": "📱",
        "Shopping": "🛍️",
        "Épargne régulière": "💵",
        "Investissements": "📊"
    };
    
    return emojiMap[name] || "📌"; // Emoji par défaut si aucune correspondance
}

// Initialisation du module
console.log("Module de suggestions de catégories chargé");