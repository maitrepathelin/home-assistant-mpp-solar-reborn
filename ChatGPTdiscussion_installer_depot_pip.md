Installer une application Python directement depuis une source GitHub, plutôt que via PyPI avec pip, peut être nécessaire pour obtenir la version la plus récente du code, qui pourrait ne pas être encore publiée sur PyPI. Voici les étapes générales pour installer manuellement un package Python depuis GitHub:

1. **Cloner le dépôt GitHub**: Vous devez d'abord cloner le dépôt sur votre machine locale. Cela peut être fait avec la commande Git suivante:
   ```
   git clone https://github.com/jblance/mpp-solar.git
   ```
   Assurez-vous d'avoir Git installé sur votre machine pour exécuter cette commande.

2. **Naviguer dans le répertoire du projet**: Une fois le dépôt cloné, naviguez dans le répertoire du projet cloné avec la commande:
   ```
   cd mpp-solar
   ```

3. **Installation**: Le projet `mpp-solar` est un package Python. Généralement, un projet Python peut être installé en utilisant `pip` pour gérer l'installation directement depuis le répertoire du projet. Ceci assure que toutes les dépendances nécessaires sont également installées. Dans le répertoire du projet, exécutez:
   ```
   pip install .
   ```
   Cette commande va installer le package dans votre environnement Python actuel. Si vous utilisez un environnement virtuel (ce qui est recommandé pour éviter de modifier les packages Python système), assurez-vous d'activer cet environnement avant d'exécuter la commande d'installation.

