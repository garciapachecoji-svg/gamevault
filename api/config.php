<?php
/* Configuración de la base de datos de GameVault.
   - XAMPP (local):   host localhost, usuario root, contraseña vacía, base "gamevault".
   - Hosting gratuito (InfinityFree): pon aquí los datos que muestra tu panel de MySQL.
   - Docker: se leen solos de las variables de entorno de docker-compose.yml. */
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_PORT', getenv('DB_PORT') ?: '3306');
define('DB_NAME', getenv('DB_NAME') ?: 'gamevault');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') !== false ? getenv('DB_PASS') : '');
