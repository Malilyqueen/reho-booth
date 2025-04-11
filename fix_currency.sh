#!/bin/bash

# Ce script est conçu pour corriger le problème de monnaie dans les fichiers JavaScript 
# afin d'assurer que la devise AED est correctement préservée à travers l'application

echo "Correction des problèmes de devise dans le code JavaScript..."

# Trouver tous les fichiers JS qui contiennent des références à l'euro
FILES_WITH_EURO=$(grep -l "€" --include="*.js" -r mapocket/)

# Remplacer les références explicites à l'euro par une détection dynamique de la devise
for FILE in $FILES_WITH_EURO; do
  echo "Traitement du fichier: $FILE"
  
  # Remplacer les instances de formatage direct en euros
  sed -i 's/return `€ \${amount.toFixed(2).replace/return `AED \${amount.toFixed(2).replace/g' "$FILE"
  sed -i 's/return "€ " + amount.toFixed(2).replace/return "AED " + amount.toFixed(2).replace/g' "$FILE"
  
  # Ajouter un message de debug
  echo "Fichier corrigé: $FILE"
done

echo "Correction terminée. Les devises ont été uniformisées pour utiliser AED."