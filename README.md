# Parte servidor - Lector triatlon

El servidor tiene tres partes principales:

  - Una pagina web para visualizar los datos y agregar las entidades que correspondan.
  - Socket.io para interactuar en tiempo real con los arduinos y con el frontend.
  - Comunicacion a una base de datos en Postgresql.

### ¿Como abrir el servidor?

Ingresar en el terminal:
```sh
cd /carpeta/del/servidor
node app.js -p {puerto}
```
