<?php
/* Formulario de contacto: guarda el mensaje en MySQL (solo usuarios con cuenta). */
require __DIR__ . '/bootstrap.php';

exigir_post();
$u = exigir_usuario();
$d = entrada();

$nombre   = texto($d, 'nombre', 3, 60, 'El nombre');
$correo   = strtolower(trim((string)($d['correo'] ?? '')));
$telefono = trim((string)($d['telefono'] ?? ''));
$asunto   = (string)($d['asunto'] ?? '');
$mensaje  = texto($d, 'mensaje', 10, 500, 'El mensaje');

if (strlen($correo) > 100 || !filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    fallar('Escribe un correo válido.', 422);
}
if (!preg_match('/^[0-9]{10}$/', $telefono)) {
    fallar('El teléfono debe tener exactamente 10 dígitos.', 422);
}
if (!in_array($asunto, ['duda', 'sugerencia', 'resena', 'otro'], true)) {
    fallar('Selecciona un asunto válido.', 422);
}
if (empty($d['acepto'])) {
    fallar('Debes aceptar el uso de tus datos.', 422);
}

$q = db()->prepare('INSERT INTO mensajes_contacto (usuario_id, nombre, correo, telefono, asunto, mensaje) VALUES (?, ?, ?, ?, ?, ?)');
$q->execute([$u['id'], $nombre, $correo, $telefono, $asunto, $mensaje]);
responder(['ok' => true], 201);
