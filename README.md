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
