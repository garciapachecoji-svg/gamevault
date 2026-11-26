<?php
/* Sesión de usuarios: consultar, registrarse, iniciar y cerrar sesión. */
require __DIR__ . '/bootstrap.php';

function abrir_sesion($u) {
    session_regenerate_id(true); // evita la fijación de sesión
    $_SESSION['usuario'] = [
        'id'      => (int)$u['id'],
        'usuario' => $u['usuario'],
        'correo'  => $u['correo'],
        'rol'     => $u['rol'],
    ];
    responder(['usuario' => [
        'usuario' => $u['usuario'],
        'correo'  => $u['correo'],
        'rol'     => $u['rol'],
    ]]);
}

// GET: ¿quién tiene sesión? (también comprueba que la base de datos responda)
if (metodo() === 'GET') {
    db();
    $u = usuario_actual();
    responder(['usuario' => $u ? ['usuario' => $u['usuario'], 'correo' => $u['correo'], 'rol' => $u['rol']] : null]);
}

exigir_post();
$d = entrada();
$accion = $d['accion'] ?? '';

if ($accion === 'registro') {
    $usuario = trim((string)($d['usuario'] ?? ''));
    $correo  = strtolower(trim((string)($d['correo'] ?? '')));
    $pass    = (string)($d['contrasena'] ?? '');

    if (!preg_match('/^[A-Za-z0-9_]{3,20}$/', $usuario)) {
        fallar('El usuario debe tener de 3 a 20 letras, números o guion bajo.', 422);
    }
    if (strlen($correo) > 100 || !filter_var($correo, FILTER_VALIDATE_EMAIL)) {
        fallar('Escribe un correo válido.', 422);
    }
    if (strlen($pass) < 8 || strlen($pass) > 72) {
        fallar('La contraseña debe tener entre 8 y 72 caracteres.', 422);
    }
    if ($pass !== (string)($d['contrasena2'] ?? '')) {
        fallar('Las contraseñas no coinciden.', 422);
    }

    $q = db()->prepare('SELECT 1 FROM usuarios WHERE correo = ? OR usuario = ?');
    $q->execute([$correo, $usuario]);
    if ($q->fetch()) {
        fallar('Ese correo o nombre de usuario ya está registrado.', 409);
    }

    // La contraseña se guarda cifrada (bcrypt); el rol nunca viene del navegador
    $q = db()->prepare("INSERT INTO usuarios (usuario, correo, contrasena, rol) VALUES (?, ?, ?, 'usuario')");
    $q->execute([$usuario, $correo, password_hash($pass, PASSWORD_DEFAULT)]);

    abrir_sesion(['id' => db()->lastInsertId(), 'usuario' => $usuario, 'correo' => $correo, 'rol' => 'usuario']);
}

if ($accion === 'login') {
    $correo = strtolower(trim((string)($d['correo'] ?? '')));
    $pass   = (string)($d['contrasena'] ?? '');

    $q = db()->prepare('SELECT id, usuario, correo, contrasena, rol FROM usuarios WHERE correo = ?');
    $q->execute([$correo]);
    $u = $q->fetch();

    if (!$u || !password_verify($pass, $u['contrasena'])) {
        fallar('Correo o contraseña incorrectos.', 401);
    }
    abrir_sesion($u);
}

if ($accion === 'logout') {
    $_SESSION = [];
    session_destroy();
    responder(['ok' => true]);
}

fallar('Acción no válida.', 400);
