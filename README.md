# GameVault

Plataforma web comunitaria de noticias y reseñas de videojuegos.
Front-end: HTML5, CSS3 y JavaScript. Back-end: PHP 8.x y MySQL/MariaDB.

## Estructura

```
index.html, productos.html, noticias.html, resenas.html,
biblioteca.html, contacto.html, login.html, admin.html   ← páginas
css/styles.css                                           ← estilos (variables, Flexbox, Grid, Media Queries)
js/main.js                                               ← lógica de cada página
js/datos.js                                              ← capa de datos (servidor PHP o modo demostración)
js/juegos.js, js/cuentas.js                              ← datos del modo demostración
api/                                                     ← API en PHP (auth, juegos, reseñas, noticias, biblioteca, contacto)
database/gamevault.sql                                   ← tablas y datos iniciales de MySQL
Dockerfile, docker-compose.yml                           ← opción con Docker
```

## Cómo decide el sitio dónde guardar los datos

`js/datos.js` consulta `api/auth.php` al abrir cada página:

- **Responde el servidor PHP y MySQL funciona → modo servidor.** Todo se guarda en MySQL.
- **No hay PHP (GitHub Pages, abrir el archivo con doble clic) → modo demostración.** Los datos se guardan en el `localStorage` del navegador.

El pie de página de cada página indica en qué modo está.

## Cuentas de prueba

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | admin@gamevault.com | Admin1234 |
| Usuario | jugador@gamevault.com | Jugador1234 |

## Formas de publicar el proyecto

### 1. Local con XAMPP (PHP + MySQL)
1. Instala XAMPP e inicia **Apache** y **MySQL** desde su panel.
2. Copia esta carpeta dentro de `C:\xampp\htdocs\` (por ejemplo `C:\xampp\htdocs\gamevault`).
3. Abre `http://localhost/phpmyadmin`, crea una base de datos llamada `gamevault` (cotejamiento `utf8mb4_general_ci`).
4. Entra a esa base, pestaña **Importar**, elige `database/gamevault.sql` y pulsa **Importar**.
5. Abre `http://localhost/gamevault/`. En XAMPP no hay que cambiar `api/config.php` (usuario `root`, sin contraseña).

### 2. Hosting gratuito con PHP y MySQL (por ejemplo InfinityFree)
1. Crea una cuenta y una cuenta de hosting (puedes usar un subdominio gratuito).
2. En el panel del hosting, abre **MySQL Databases** y crea una base de datos. Anota el nombre de la base, el usuario, la contraseña y el servidor (host).
3. Abre **phpMyAdmin**, selecciona esa base e importa `database/gamevault.sql`.
4. Edita `api/config.php` y escribe esos cuatro datos (host, nombre de la base, usuario, contraseña).
5. Sube **el contenido** de la carpeta (no la carpeta completa) a `htdocs` con el Administrador de archivos o con FTP.
6. Activa el certificado SSL gratuito desde el panel y abre el sitio con `https://`.

Los nombres exactos de los menús pueden cambiar según el hosting.

### 3. GitHub Pages (sitio estático, modo demostración)
Sube el repositorio y activa **Settings → Pages** (rama `main`, carpeta `/ (root)`). GitHub Pages no ejecuta PHP ni tiene MySQL, así que el sitio funciona en modo demostración con `localStorage`. La carpeta `api/` y la base de datos no se usan allí.

### 4. Docker
Con Docker instalado, en esta carpeta ejecuta:

```
docker compose up --build
```

Abre `http://localhost:8080`. La primera vez MySQL tarda unos segundos en importar `database/gamevault.sql`; si el pie de página dice "modo demostración", espera un momento y recarga.

## Seguridad aplicada
- Contraseñas cifradas con `password_hash` (bcrypt) y verificadas con `password_verify`.
- Consultas preparadas con PDO (prevención de inyección SQL).
- Texto de usuarios escapado al mostrarlo (prevención de XSS).
- Validación en el navegador (JavaScript) y en el servidor (PHP).
- El rol (invitado, usuario, administrador) se comprueba siempre en el servidor.
- Cookie de sesión con `HttpOnly` y `SameSite`; las acciones que modifican datos exigen POST y una cabecera propia (protección básica contra CSRF).

## Si el inicio de sesión del administrador no funciona
Regístrate desde `login.html` y, en phpMyAdmin, ejecuta en la tabla `usuarios`:
`UPDATE usuarios SET rol = 'admin' WHERE correo = 'tu@correo.com';`
