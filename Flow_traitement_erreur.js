let timeout; // Pour stocker la référence du délai d'attente

// Vérifie si le message reçu est un message d'erreur
if (msg.topic === "error") {
    // Envoie un payload à 1 immédiatement pour indiquer une erreur
    node.send({ payload: 1 });

    // Réinitialise le délai d'attente s'il est déjà défini
    if (timeout) clearTimeout(timeout);

    // Définit un nouveau délai d'attente pour réinitialiser le payload après 20 secondes
    //timeout = setTimeout(function () {
    //    node.send({ payload: 0 }); // Envoie un payload à 0 après 20 secondes sans erreur
    //}, 20000);
} else {
    // Si ce n'est pas un message d'erreur, ne fait rien
    node.send({ payload: 0 }); // Envoie un payload à 0 après 20 secondes sans erreur
}
