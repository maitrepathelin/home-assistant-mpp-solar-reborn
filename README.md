# MPP-Solar sans MQTT, sans docker, dans Home Assistant

##### Voici mon projet complet pour piloter et gérer mon onduleur solaire sur Home Assistant. Ce projet peut vous intéressez si vous avez un onduleur avec le protocole PI30 (voir [ici pour le protocole](https://github.com/jblance/mpp-solar/tree/master/docs/protocols "ici pour le protocole")) ou équivalent.
Il n'est pas encore terminé mais est déjà en grande partie fonctionnel. Je compte l'updater régulièrement. Il reste facile à comprendre et flexible.

![image](https://github.com/maitrepathelin/home-assistant-mpp-solar-rethinked/assets/11854885/bbb1ba7a-ee66-4062-bdf6-99e7035bb13c)



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

## Etape de programmation Windows / WSL

(créer toutes les tâches planifiées avec la case "Executer avec les autorisations maximale" sinon ca ne fonctionne pas.)

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

Pour envoyer des commandes depuis home assistant vers mpp-solar j'utilise un petit daemon powershell que ChatGPT m'a concocté. Il réceptionne les httprequest de node-red, les execute, et node-red recoit le retour de commande.

Il n'accepte les requêtes que depuis une IP. Pour un semblant de sécurité j'autorise que l'IP de HomeAssistant du réseau privé hôte de VirtualBox (voir étapes suivantes pour HomeAssistant). Ca évite déjà de faire passer les requêtes en boucle sur le réseau LAN et ca protège peu. 

[ChatGPT / Http listener powershell](ChatGPTdiscussion_http_listener_powershell.md) 

Penser à intégrer ce script en tâche planifié démarrage de windows.

## Etape de programmation HomeAssistant

1. Installer VirtualBox, pas besoin de décrire. Intégrer le script [HAOS.bat](HAOS.bat) à shell:startup de Windows pour démarrer automatiquement la VM. 

2. Suivre la documentation HomeAssistant pour installer HAOS sur VirtualBox

3. Créer deux cartes réseaux dans la VM : 1 en bridge sur le LAN, 1 en réseau privé hôte pour HTTP listener

4. Démarrer et configurer de manière classique HomeAssistant

5. Installer le plugin Node-Red et Node-red Companion (avec Home Assistant Community Store). Node-Red Companion est obligatoire pour créer les entités HomeAssistant depuis le flux.

6. Ne pas oublier de reboot

7. Intégrer dans Node-Red le flux 1, ressemblant à ca :

![image](https://github.com/maitrepathelin/home-assistant-mpp-solar-rethinked/assets/11854885/0999f61b-aceb-4ccd-98a0-11cbc33974ff)

Le flux est disponible [ICI](flows.json) , importable normalement directement JSON sur Red-Node. 

En revanche en analysant le JSON sur GitHub j'ai des doutes car certaines fonctions sont vraiment complexes (la ligne func: s'affiche en blanc, comme si pas de formattage JSON), je préfère donc les rajouter en plus sur GitHub au besoin, si l'import du fichier flows.json plante alors remplacer par quelque chose de simple style "return msg.payload;" la ligne func: des fonctions ci dessous dans le fichier JSON, importer le flux et recopier le contenu des fonctions dans les noeuds correspondants :
  - [FX traitement erreur V2](Flow_FX_traitement_reponse_V2.js)
  - [FX traitement réponse QPIGS](Flow_fx_traitement_reponse_QPIGS.js)
  - [Traitement erreur](Flow_traitement_erreur.js)

(j'ai nommé les fichiers des fonctions en .js juste pour avoir la colorisation sur github, mais il faut bien copier leurs contenus brut dans le neouds de fonction correspondant node-red !)

8. Explication du flow Node-Red

C'est ce flow qui fait 99,99% du travail :
 - Il créer les entités (boutons, capteur, capteurs binaires) dans HomeAssistant automatiquement grâce à Node-Red Companion
 - Il lance une boucle qui va interroger toutes les 3 secondes les valeurs de production de l'onduleur, commande QPIGS (mpp-solar) en passant par HttpRequest qui envoi la requête au script HttpListener powershell de l'hôte
 - Il lance une boucle qui va interroger toutes les 10 secondes les valeurs de configuration de l'onduleur, commande QPIRI (mpp-solar) en passant par HttpRequest qui envoi la requête au script HttpListener powershell de l'hôte
 - Il intercepte les appuis de boutons (automatisation de l'appui par HomeAssistant, à vous de jouer), met en pause les commandes QPIGS et QPIRI, envoi la commande, attends 2 secondes, et relance les boucles
 - Il parse le retour des commandes QPIGS et QPIRI (cf fonctions magiques ChatGPT ci dessus) et renvoi les valeurs de l'array dans des capteurs Home Assistant
 - Il vérifie le retour des commandes, si elles ne sont pas conformes alors ca veut dire que soit l'onduleur est débranché, soit le HttpListener pas à l'écoute, et donc déclenche des capteurs binaires pour signaler l'erreur à HomeAssistant

**Ce flow est fonctionnel, et permet de récupérer quasi en direct l'ensemble des valeurs de l'onduleur de manière fiable, avec détection des erreurs**


**J'ai commencé à intégrer des commandes, notamment pour définir la puissance de rechargement sur EDF (2 ou 10 A) et le mode (sortie solaire->batterie->EDF / sortie EDF). De par la conception du flow il est très simple de rajouter des commandes et facilement compréhensible, n'hésitez pas à rajouter vos commandes ! Sinon je le ferais au fur à et à mesure que j'en ai besoin.**

9. Les 00,01% sur HomeAssistant

Il s'agit simplement de transformer des valeurs numériques en texte pour que ce soit plus visuel, notamment sur l'état du mode de sortie (SBU/EDF), le mode de rechargement, et une erreur de communication USB. 

Intégrer ces lignes dans votre fichier configuration.yaml de HomeAssistant. 
[configuratio.yaml HomeAssistant](configuration.yaml)

(petit tips si vous ne l'avez pas déjà, intégrer le plugin VisualCode Server sur HomeAssistant pour modifier rapidemment votre configuration)


