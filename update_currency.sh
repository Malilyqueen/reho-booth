#!/bin/bash

# Script pour forcer le remplacement des symboles € par AED dans les fichiers JS

echo "Correction FORCÉE des problèmes de devise..."

# Créer un marqueur pour indiquer que le script a été exécuté
touch .currency_fix_applied

# Corriger le fichier budget-calculation-fix.js spécifiquement
sed -i 's/Budget total mis à jour: "€/Budget total mis à jour: "AED/g' mapocket/js/budget-calculation-fix.js
sed -i 's/return `€/return `AED/g' mapocket/js/budget-calculation-fix.js

# Trouver tous les fichiers JS et remplacer les instances d'euro
find mapocket/js -type f -name "*.js" -exec sed -i 's/€/AED/g' {} \;

echo "Correction forcée terminée. Toutes les devises € ont été remplacées par AED."