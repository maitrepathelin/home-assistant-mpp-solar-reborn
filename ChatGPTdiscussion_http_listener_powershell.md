Pour restreindre les requêtes au script PowerShell à une adresse IP spécifique, vous devez ajouter une logique pour vérifier l'adresse IP source de chaque requête. Si l'adresse IP ne correspond pas à celle autorisée, le script doit refuser de traiter la requête.

Voici une version modifiée du script qui n'accepte les requêtes que depuis l'adresse IP `192.168.xxx.xxx`. Ce script utilise la propriété `RemoteEndPoint` de l'objet requête pour obtenir l'adresse IP du client et la compare à l'adresse autorisée avant de décider d'exécuter la commande.

```powershell
# Définir le port sur lequel écouter
$port = 8020 # Assurez-vous que ce port est ouvert et non utilisé sur votre machine
$allowedIPAddress = "192.168.xxx.xxx" # L'adresse IP autorisée

# Créer un listener HTTP
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://*:$port/")
$listener.Start()

Write-Host "Serveur HTTP en écoute sur le port $port..."

while ($listener.IsListening) {
    try {
        # Attendre une requête entrante
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        # Vérifier si la requête provient de l'adresse IP autorisée
        $clientIPAddress = $request.RemoteEndPoint.Address.ToString()
        if ($clientIPAddress -eq $allowedIPAddress) {
            # Récupérer le corps de la requête
            $reader = [System.IO.StreamReader]::new($request.InputStream)
            $requestData = $reader.ReadToEnd()

            # Exécuter la commande
            $result = Invoke-Expression $requestData

            # Répondre à la requête avec le résultat de la commande
            $buffer = [System.Text.Encoding]::UTF8.GetBytes($result)
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
        } else {
            # Refuser la requête si elle ne provient pas de l'adresse IP autorisée
            $result = "Accès refusé"
            $buffer = [System.Text.Encoding]::UTF8.GetBytes($result)
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
        }

        $response.OutputStream.Close()
    } catch {
        Write-Host $_.Exception.Message
    }
}

$listener.Stop()
```

Ce script vérifie l'adresse IP source de chaque requête et ne traite la requête que si elle provient de `192.168.xxx.xxx`. Si la requête vient d'une autre adresse IP, le script répond avec "Accès refusé".


Cette méthode permet de restreindre l'accès au script basé sur l'adresse IP, mais gardez à l'esprit les meilleures pratiques de sécurité lors de l'exécution de scripts qui acceptent et exécutent des commandes à distance.
