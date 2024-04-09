Pour créer un script qui ajuste automatiquement les permissions de `/dev/ttyUSB0` sans jamais demander de mot de passe, et en tenant compte des limitations précédemment discutées avec `udev` et l'exécution de scripts nécessitant des privilèges élevés sans interaction manuelle, nous pouvons adopter une approche légèrement différente en utilisant les capacités de `systemd` (si vous êtes sur une distribution qui l'utilise, comme la plupart des distributions Linux modernes, mais notez que WSL peut ne pas prendre en charge directement toutes ces fonctionnalités).

### Étape 1: Créer un Service systemd

1. **Créer un fichier de service systemd**. Ce service va lancer un script shell qui surveille la création de `/dev/ttyUSB0` et applique `chmod 777`.

   Créez un nouveau fichier dans `/etc/systemd/system/`, par exemple `ttyUSB0-permission.service`, avec le contenu suivant :

   ```ini
   [Unit]
   Description=Set permissions on /dev/ttyUSB0

   [Service]
   Type=simple
   ExecStart=/usr/local/bin/ttyUSB0-permission.sh

   [Install]
   WantedBy=multi-user.target
   ```

2. **Créer le script exécuté par le service**. Ce script va surveiller l'apparition de `/dev/ttyUSB0` et changer ses permissions.

   Créez un script `/usr/local/bin/ttyUSB0-permission.sh` :

   ```bash
   #!/bin/bash

   while true; do
       if [ -e "/dev/ttyUSB0" ]; then
           chmod 777 /dev/ttyUSB0
           break  # Sortie de la boucle après l'application des permissions
       fi
       sleep 1  # Attendre avant de vérifier à nouveau
   done
   ```

   Rendez le script exécutable :

   ```bash
   sudo chmod +x /usr/local/bin/ttyUSB0-permission.sh
   ```

### Étape 2: Activer le Service

Pour que ce service se lance automatiquement au démarrage, utilisez les commandes suivantes :

```bash
sudo systemctl daemon-reload
sudo systemctl enable ttyUSB0-permission.service
sudo systemctl start ttyUSB0-permission.service
```

### Exécution Sans Demander de Mot de Passe

Puisque ce service est configuré et activé en tant que root, il n'y aura pas besoin d'entrer un mot de passe à chaque fois que le script est exécuté au démarrage. Le script surveillera la création de `/dev/ttyUSB0` à chaque démarrage et appliquera `chmod 777` automatiquement.

### Remarques

- **Sécurité**: Comme mentionné précédemment, configurer les permissions de `/dev/ttyUSB0` pour être ouvertes à tous (`chmod 777`) peut présenter des risques de sécurité, surtout sur des systèmes multi-utilisateurs ou exposés sur des réseaux. Assurez-vous que ceci est acceptable pour votre cas d'usage.
- **Compatibilité avec WSL**: Cette approche est typiquement utilisée sur des systèmes Linux avec `systemd`. WSL1 ne supporte pas `systemd` nativement. Pour WSL2, des solutions existent pour exécuter `systemd`, mais elles requièrent une configuration supplémentaire.
- **Adaptabilité**: Cette solution est assez générale et peut être adaptée à d'autres noms de périphériques ou à d'autres actions en modifiant le script `ttyUSB0-permission.sh`.
