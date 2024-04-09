// Fonction pour extraire les valeurs de la chaÃ®ne de rÃ©ponse et traiter un bloc de valeurs boolÃ©ennes
function extractValues(response) {
    // Trouve le dÃ©but de la chaÃ®ne de valeurs numÃ©riques
    const start = response.indexOf('(') + 1;
    // DÃ©termine la fin de la chaÃ®ne de valeurs numÃ©riques
    let end;
    if (response.indexOf(']') > -1) {
        end = response.indexOf(']') - 1;
    } else if (response.indexOf('\\') > -1) {
        end = response.indexOf('\\') - 1;
    } else {
        return {error: 'Format de rÃ©ponse inattendu.'};
    }
    // Extrait la sous-chaÃ®ne contenant les valeurs
    const valuesString = response.substring(start, end);
    // Initialisation d'un tableau pour les valeurs sÃ©parÃ©es
    let values = [];
    
    // DÃ©tecter et traiter le bloc de valeurs boolÃ©ennes
    const boolBlockStart = valuesString.search(/\d{8}/); // Recherche la premiÃ¨re occurrence d'un bloc de 8 chiffres
    if (boolBlockStart !== -1) {
        // Extraire le bloc de valeurs boolÃ©ennes
        const boolBlock = valuesString.substr(boolBlockStart, 8);
        // Convertir chaque chiffre du bloc en boolÃ©en et l'insÃ©rer dans l'array 'values'
        boolBlock.split('').forEach(bit => values.push(bit === '1' ? true : false));
        // Remplacer le bloc dans la chaÃ®ne de valeurs par des espaces pour Ã©viter de le retraiter
        const updatedValuesString = valuesString.slice(0, boolBlockStart) + '        ' + valuesString.slice(boolBlockStart + 8);
        // SÃ©parer les autres valeurs en utilisant l'espace comme sÃ©parateur
        values = [...values, ...updatedValuesString.split(' ').filter(v => v).map(value => isNaN(parseFloat(value)) ? value : parseFloat(value))];
    } else {
        // Si aucun bloc de valeurs boolÃ©ennes n'est trouvÃ©, traiter la chaÃ®ne comme avant
        values = valuesString.split(' ').map(value => isNaN(parseFloat(value)) ? value : parseFloat(value));
    }

    return {payload: values};
}

// Application de la fonction d'extraction au payload reÃ§u
const result = extractValues(msg.payload);

// VÃ©rifie si le rÃ©sultat contient une erreur ou non
if (result.error) {
    return {payload: result.error, topic: "error"};
} else {
    msg.payload = result.payload;
    return msg; // Renvoie le message avec le payload modifiÃ©
}
