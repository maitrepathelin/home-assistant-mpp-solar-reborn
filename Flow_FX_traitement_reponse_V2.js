// Fonction pour extraire les valeurs de la chaîne de réponse
function extractValues(response) {
    // Trouve le début de la chaîne de valeurs numériques
    const start = response.indexOf('(') + 1;
    // Détermine la fin de la chaîne de valeurs numériques
    let end;
    if (response.indexOf(']') > -1) {
        // Si le caractère de fin est ']', utilisez-le pour trouver la fin
        end = response.indexOf(']') - 1;
    } else if (response.indexOf('\\') > -1) {
        // Si le caractère de fin est '\', utilisez-le pour trouver la fin
        end = response.indexOf('\\') - 1;
    } else {
        // Si aucun caractère de fin attendu n'est trouvé, envoie un message d'erreur
        return {error: 'Format de réponse inattendu.'}; // Modification ici
    }
    // Extrait la sous-chaîne contenant les valeurs
    const valuesString = response.substring(start, end);
    // Sépare les valeurs en utilisant l'espace comme séparateur
    const values = valuesString.split(' ');
    // Convertit chaque valeur en nombre, si possible
    const parsedValues = values.map(value => isNaN(parseFloat(value)) ? value : parseFloat(value));
    return {payload: parsedValues}; // Assurez-vous de retourner un objet avec une propriété payload
}

// Application de la fonction d'extraction au payload reçu
const result = extractValues(msg.payload);

// Vérifie si le résultat contient une erreur ou non
if (result.error) {
    // Envoyer l'erreur à la fonction de gestion des erreurs
    return {payload: result.error, topic: "error"};
} else {
    // Aucune erreur, envoyer le payload modifié
    msg.payload = result.payload;
    return msg; // Renvoie le message avec le payload modifié
}
