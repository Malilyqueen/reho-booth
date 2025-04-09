#!/bin/bash

# Fichier à modifier
FILE="mapocket/js/project.js"

# 1. Modifier la définition de la fonction updateCategoriesUI
sed -i 's/function updateCategoriesUI(categoriesData) {/function updateCategoriesUI(categoriesData, incomingCurrencySymbol) {\n    const currencySymbol = incomingCurrencySymbol || "€";/g' "$FILE"

# 2. Modifier tous les appels à updateCategoriesUI pour ajouter le paramètre currencySymbol
sed -i 's/updateCategoriesUI(categoriesData);/updateCategoriesUI(categoriesData, currencySymbol);/g' "$FILE"

# 3. Vérifier les modifications
echo "Mise à jour de la fonction updateCategoriesUI pour accepter le paramètre currencySymbol."

