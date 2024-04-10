# Script PowerShell pour attacher un dispositif USB et modifier les permissions sur /dev/ttyUSB0 dans WSL
start-sleep -s 60
# Variable pour stocker le mot de passe de l'utilisateur WSL


# Attacher le dispositif USB au WSL
usbipd attach --wsl --busid 4-2
start-sleep -s 5
usbipd attach --wsl --busid 4-2
start-sleep -s 5
usbipd attach --wsl --busid 4-2
start-sleep -s 5

#Je répète ici plusieurs fois la tâche, car pour une raison obscure ca échoue souvent la première fois, mais réussi après. Ca mange pas de pain de bourrer le prompt.
