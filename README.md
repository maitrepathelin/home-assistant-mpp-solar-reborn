# MPP-Solar sans MQTT, sans docker, dans Home Assistant

##### Voici mon projet complet pour piloter et gérer mon onduleur solaire sur Home Assistant. Ce projet peut vous intéressez si vous avez un onduleur avec le protocole PI30 (voir [ici pour le protocole](https://github.com/jblance/mpp-solar/tree/master/docs/protocols "ici pour le protocole")) ou équivalent.


------------


*Le but étant de profiter des possibilités d'EDF Tempo, afin de par exemple charger ma batterie lithium la nuit (heures creuses) des jours rouges et ne pas tirer de puissance EDF en heures pleines jours rouges. Le tout de manière automatisée en fonction de ma prévision de production solaire prévue par home assistant.*


------------


**C'est un projet amateur et je le met sur github avant tout pour me souvenir de comment j'ai fait ce setup avant de tout oublier, donc oui ca peut sembler moche, mal fait, mais au final ca marche plutôt bien. **


## Se base sur  :
- mpp-solar, permet la communication avec l'onduleur (grand merci à jblance, super logiciel !) : [jblance/mpp-solar](https://github.com/jblance/mpp-solar "jblance/mpp-solar")

- home-assistant, pas besoin de le présenter : [home-assistant](https://github.com/home-assistant "home-assistant")

- son plugin node-red avec node-red companion, permet l'interrogration de mpp-solar et le parse des données :
  [node-red](https://github.com/node-red/node-red "node-red")
 [hass-node-red](https://github.com/zachowj/hass-node-red "hass-node-red")
 
- Microsoft windows 11 (machine hôte + WSL)

- Oracle Virtualbox (pour héberger Home Assistant OS)

## Architecture globale simplifiée

![Diagramme1](https://github.com/maitrepathelin/home-assistant-mpp-solar-rethinked/assets/11854885/d8550786-2451-4fb6-9587-986ff11bbd11)

### Accès à distance et machine hôte
Ma machine hôte est un vieux portable mais avec un i7 3630QM et 16gb de ram, donc largement suffisant.


En revanche concernant l'accès à distance il faut obligatoirement passer par un VNC Server ou équivalent (teamviewer / anydesk), un programme qui **ne vérouille par la session utilisateur sur l'hôte** lorsqu'on se connecte à distance. 


[Tight VNC Server](https://www.tightvnc.com/)


Pourquoi pas de RDP : J'ai des scripts powershell et docker (pas utilisé ici mais pour d'autres projets) qui tournent sur la session et pas en tant que service. Donc j'évite de faire des déco reco en RDP. 

## Etape de programmation
1. Configurer Windows avec un autologon au démarrage. La plupart des scripts se lancent à l'ouverture de session, j'utilise le programme WITweaker de Arium.

2. Installer WSL avec la distribution debian, penser à supprimer Ubuntu qui est toujours par défaut

3. Installer [USPIPD-WIN](https://learn.microsoft.com/fr-fr/windows/wsl/connect-usb "USPIPD-WIN") pour connecter le port usb de l'onduleur à WSL.

4. Tester la connexion avec WSL, les commandes powershell sont ici :
   
`usbipd bind --busid 4-2` (4-2 est à changer en fonction de la liste de port), 
à éxécuter qu'une seule fois pour mettre le port en partage, survit au reboot

`usbipd attach --wsl --busid 4-2` 
à exécuter à chaque déco reco du port usb. **J'ai déjà automatisé à l'ouverture de session avec le script USB_WSL.ps1**, penser à adapter le délai d'attente si WSL est long à se lancer
*todo : rajouter l'éxécution régulière du script si le port USB se deco à postériori*

Aller voir ensuite dans la console Debian si le port USB est bien présent avec la commande `ls /dev` , on doit avoir normalement **ttyUSB0** , c'est notre onduleur. 

Cette étape n'est pas à répéter si le script PS1 a été intégré au planificateur de tâche à l'ouverture de session.

5. Rendre ttyUSB0 accessible sans sudo : 
Un problème compliqué à résoudre à été de donner accès au port usb à mpp-solar sans devoir taper le mot de passe sudo (car les commandes sont envoyées par powershell httplistener). 

Pour cela il faut déjà activer **systemd** dans WSL, procédure décrite [ici](https://learn.microsoft.com/fr-fr/windows/wsl/systemd "ici")

6. Créer un service dans Debian executer un chmod 777 sur /dev/ttyUSB0

(on rage pas le sur 777, j'ai pas d'objectif top sécurité, la machine n'a pas de ports entrants depuis internet et j'ai confiance en mon réseau local)

J'ai utilisé ChatGPT pour qu'il me construise un service systemd et qu'il se lance au démarrage de la machine, cf étape 5 pour activer systemd WSL. 

Ce service scan à intervalle régulier /dev/ttyUSB0 et s'il doit alors il applique un chmod 777.

Se baser sur cette discussion ChatGPT :

[ChatGPT / Créer le service chmod](ChatGPTdiscussion_creer_service.md)

J'avais tenté avant de créer des règles udev mais sans succès, je poste ici quand même la discussion car j'y ai laissé la règle udev NOPASSWD de mpp-solar, à rajouter donc au cas ou, mais normalement pas utile :

[ChatGPT / Créer règle udev](ChatGPTdiscussion_regle_udev.md)

**Après ca reboot complet de l'hôte, pas juste WSL**

7. Installation de mpp-solar

Ok, maintenant on a un WSL Debian configuré proprement, on va d'abord installer mpp-solar ce qui nous permettras ensuite de valider l'étape 6.

J'ai tenté d'installer le conteneur docker de mpp-solar mais ce n'était pas pratique. Donc installation par PIP. 

Il faut d'abord créer un environnement virtuel, je l'ai placé dans /home/maitrepathelin/venv. Ca créer un executable Python3.11 dans venv/bin. Quand on va executer la commande d'installation PIP sela placera mpp-solar dans ce dossier bin. Il faudra systématiquement appeller par la suite mpp-solar par ce dossier.

**ATTENTION**

Il y a problème dans le dépôt pip mpp-solar. Si on tente la commande indiqué par jblance, à savoir pip install mpp-solar ca ne fonctionne pas : 

Le dépôt pip s'arrête sur une vieille version et on a un message d'erreur, on peut le forcer mais on installe alors une version périmée. 

La solution est de télécharger le dépôt manuellement dans Debian WSL. Pour installer directement depuis un dépôt suivre cette discussion :

[ChatGPT / Installer dépôt PIP local](ChatGPTdiscussion_installer_depot_pip.md)

8. Tester installation mpp-solar

Pour tester l'installation mpp-solar, depuis un shell powershell sur l'hôte Windows il suffit d'envoyer la commande 

```wsl /home/maitrepathelin/venv/bin/mpp-solar -v``` (affiche la version de mpp-solar)

Ici pas encore besoin de mpp en version sudo, donc on doit juste avoir un retour dans le shell de la version. 

Maintenant envoyer la commande ```wsl /home/maitrepathelin/venv/bin/mpp-solar -p /dev/ttyUSB0 -c QPIRI```

Là il faut que mpp-solar puisse attaquer le port ttyUSB0 sans droit sudo. Si l'étape 5 et 6 est bien passée alors s'affiche dans le sell la configuration de l'onduleur. Sinon si pas de droit sur le port ttyUSB0 alors on a une erreur de permission denied. 

9. Intégrer le daemon d'écoute HTTP

Pour envoyer des commandes depuis home assistant vers mpp-solar j'utilise un petit daemon powershell que ChatGPT m'a concocté. Il réceptionne les httprequest de node-red et les execute 

10. 


