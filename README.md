# WebServer del Lector triatlon

El servidor tiene tres partes principales:

  - Un servidor web para cargar las vistas.
  - Un WebSocket para interactuar en tiempo real con los arduinos.
  - Una base de datos en Postgresql.

### ¿Como abrir el servidor?

Ingresar en el terminal:
```sh
cd /carpeta/del/servidor
node app.js -p {puerto}
```
