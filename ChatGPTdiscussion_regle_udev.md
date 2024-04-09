Si vous avez déjà une règle spécifique dans votre fichier sudoers pour l'utilisateur `maitrepathelin`, vous pouvez simplement ajouter une nouvelle ligne pour la commande `chmod` que vous souhaitez exécuter sans mot de passe. Chaque commande ou ensemble de commandes que vous souhaitez autoriser sans mot de passe doit avoir sa propre ligne dans le fichier sudoers. Voici comment vous pouvez le faire :

1. Ouvrez le fichier sudoers avec `sudo visudo` dans votre terminal WSL.

2. Ajoutez une nouvelle ligne sous celle existante pour `maitrepathelin` comme suit :

   ```
   maitrepathelin ALL=(ALL) NOPASSWD: /home/maitrepathelin/venv/bin/mpp-solar
   maitrepathelin ALL=(ALL) NOPASSWD: /bin/chmod 666 /dev/ttyUSB0
   ```

3. Sauvegardez et fermez le fichier. Si vous utilisez `nano`, cela se fait avec `Ctrl-O`, `Enter`, puis `Ctrl-X`. Pour `vi` ou `vim`, tapez `:wq` et appuyez sur `Enter`.

En ajoutant cette nouvelle ligne, vous spécifiez que l'utilisateur `maitrepathelin` peut exécuter la commande `/bin/chmod 666 /dev/ttyUSB0` sans être invité à saisir un mot de passe, en plus de la commande déjà autorisée (`/home/maitrepathelin/venv/bin/mpp-solar`).

Votre script PowerShell n'aura pas besoin d'être modifié ; il pourra exécuter la commande pour changer les permissions sur `/dev/ttyUSB0` sans requérir de mot de passe :

