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

## Architecture globale

![Diagramme1](https://github.com/maitrepathelin/home-assistant-mpp-solar-rethinked/assets/11854885/d8550786-2451-4fb6-9587-986ff11bbd11)

## Etape de programmation
1. Configurer Windows avec un autologon au démarrage. La plupart des scripts se lancent à l'ouverture de session, j'utilise le programme WITweaker de Arium.

2. Installer WSL avec la distribution debian, penser à supprimer Ubuntu qui est toujours par défaut

3. Installer [USPIPD-WIN](https://learn.microsoft.com/fr-fr/windows/wsl/connect-usb "USPIPD-WIN") pour connecter le port usb de l'onduleur à WSL.

4. Tester la connexion avec WSL, les commandes powershell sont ici : 
`usbipd bind --busid 4-2` (4-2 est à changer en fonction de la liste de port), 
à éxécuter qu'une seule fois pour mettre le port en partage, survit au reboot
`usbipd attach --wsl --busid 4-2` 
à exécuter à chaque déco reco du port usb. J'ai déjà automatisé à l'ouverture de session avec le script USB_WSL.ps1, penser à adapter le délai d'attente si WSL est long à se lancer
*todo : rajouter l'éxécution régulière du script si le port USB se deco à postériori*

Aller voir ensuite dans la console Debian si le port USB est bien présent avec la commande `ls /dev` , on doit avoir normalement **ttyUSB0** , c'est notre onduleur. 

6. Rendre ttyUSB0 accessible sans sudo : 
Un problème compliqué à résoudre à été de donner accès au port usb à mpp-solar sans devoir taper le mot de passe sudo (car les commandes sont envoyées par powershell httplistener). 

Pour cela il faut déjà activer **systemd** dans WSL, procédure décrite [ici](https://learn.microsoft.com/fr-fr/windows/wsl/systemd "ici")
