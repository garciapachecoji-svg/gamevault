<?php
/* Funciones comunes de la API: conexión a MySQL, sesión, validaciones y respuestas JSON. */
require __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

session_set_cookie_params([
    'lifetime' => 0,
    'path'     => '/',
    'httponly' => true,           // JavaScript no puede leer la cookie de sesión
    'samesite' => 'Lax',
    'secure'   => !empty($_SERVER['HTTPS']),
]);
session_start();

function responder($datos, $codigo = 200) {
    http_response_code($codigo);
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    exit;
}

function fallar($mensaje, $codigo = 400) {
    responder(['error' => $mensaje], $codigo);
}

// Conexión a MySQL con PDO (una sola vez por petición)
function db() {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $pdo = new PDO(
                'mysql:host=' . DB_HOST . ';port=' . DB_PORT . ';dbname=' . DB_NAME . ';charset=utf8mb4',
                DB_USER,
                DB_PASS,
                [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false,
                ]
            );
        } catch (PDOException $e) {
            fallar('No se pudo conectar con la base de datos.', 500);
        }
    }
    return $pdo;
}

function metodo() {
    return $_SERVER['REQUEST_METHOD'];
}

// Cuerpo de la petición (JSON) como arreglo
function entrada() {
    $json = json_decode(file_get_contents('php://input'), true);
    return is_array($json) ? $json : [];
}

// Toda operación que modifica datos debe ser POST y traer la cabecera propia de GameVault
// (protección básica contra CSRF: otro sitio no puede añadir esa cabecera).
function exigir_post() {
    if (metodo() !== 'POST') {
        fallar('Método no permitido.', 405);
    }
    if (($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') !== 'gamevault') {
        fallar('Solicitud no válida.', 403);
    }
}

function usuario_actual() {
    return $_SESSION['usuario'] ?? null;
}

function exigir_usuario() {
    $u = usuario_actual();
    if (!$u) {
        fallar('Debes iniciar sesión.', 401);
    }
    return $u;
}

// El rol se comprueba SIEMPRE en el servidor, nunca se confía en lo que diga el navegador
function exigir_admin() {
    $u = exigir_usuario();
    if ($u['rol'] !== 'admin') {
        fallar('Solo para administradores.', 403);
    }
    return $u;
}

// Texto obligatorio con longitud mínima y máxima
function texto($datos, $campo, $min, $max, $etiqueta) {
    $valor = trim((string)($datos[$campo] ?? ''));
    $largo = mb_strlen($valor);
    if ($largo < $min || $largo > $max) {
        fallar("$etiqueta debe tener entre $min y $max caracteres.", 422);
    }
    return $valor;
}

// Número obligatorio dentro de un rango
function numero($datos, $campo, $min, $max, $etiqueta) {
    $valor = $datos[$campo] ?? null;
    if (!is_numeric($valor) || $valor < $min || $valor > $max) {
        fallar("$etiqueta debe ser un número entre $min y $max.", 422);
    }
    return $valor + 0;
}

function url_valida($valor) {
    return strlen($valor) <= 255
        && filter_var($valor, FILTER_VALIDATE_URL) !== false
        && preg_match('#^https?://#i', $valor) === 1;
}

// Fecha de MySQL ("2026-11-12 12:00:00") a formato ISO que entienden todos los navegadores
function fecha_iso($fecha) {
    return str_replace(' ', 'T', $fecha);
}
