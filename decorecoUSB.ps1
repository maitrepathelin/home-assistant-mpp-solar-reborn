Write-Host "Début script USBIPD"
usbipd.exe detach -b 3-1
Write-Host "Périphérique détaché, attente 10 secondes"
Start-sleep -Seconds 10
usbipd.exe attach -a -b 3-1 -w
Write-Host "Périphérique rattaché, attente 10 seconde et fermeture"
Start-Sleep -Seconds 10