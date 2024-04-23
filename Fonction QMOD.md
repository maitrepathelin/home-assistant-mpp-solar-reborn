// Fonction pour vérifier le mode device dans la réponse HTTP
function checkDeviceMode(msg) {
    var responseText = msg.payload; // Assurez-vous que 'msg.payload' contient la réponse HTTP en texte

    // Chercher le mot 'Battery' dans la réponse
    if (responseText.includes("Battery")) {
        msg.payload = 1; // Retourne 1 si 'Battery' est trouvé
    } else if (responseText.includes("Line")) {
        msg.payload = 0; // Retourne 0 si 'Line' est trouvé
    } else {
        msg.payload = -1; // Retourne -1 si aucun des termes n'est trouvé
    }

    return msg; // Renvoie le message avec la nouvelle charge utile
}

// Exemple d'appel de la fonction
var message = {
    payload: "Command: QMOD - Mode inquiry -------------------------------------------------------------------------------- Parameter Value Unit device_mode Battery --------------------------------------------------------------------------------"
};

return checkDeviceMode(message); // Utilisez cette ligne dans le noeud "function" de Node-RED
