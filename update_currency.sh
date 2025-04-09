#!/bin/bash

# Fichier à modifier
FILE="mapocket/js/project.js"

# Créer un fichier temporaire pour les modifications
TMP_FILE=$(mktemp)

# Remplacer les références hardcodées au symbole € dans les modèles HTML
cat "$FILE" | sed 's/<span class="subcategory-amount">€ 0<\/span>/<span class="subcategory-amount">${currencySymbol} 0<\/span>/g' \
              | sed 's/<input type="text" class="form-control expense-line-amount" value="€ 0">/<input type="text" class="form-control expense-line-amount" value="${currencySymbol} 0">/g' > "$TMP_FILE"

# Copier le fichier modifié vers l'original
cp "$TMP_FILE" "$FILE"

# Supprimer le fichier temporaire
rm "$TMP_FILE"

echo "Mise à jour des références au symbole de devise réussie!"
