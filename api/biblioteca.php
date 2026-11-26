<?php
/* Biblioteca personal de cada usuario: ver, guardar, cambiar estado y quitar juegos. */
require __DIR__ . '/bootstrap.php';

$u = exigir_usuario();

if (metodo() === 'GET') {
    $q = db()->prepare('SELECT juego_id AS id, estado FROM biblioteca WHERE usuario_id = ? ORDER BY creado');
    $q->execute([$u['id']]);
    $filas = $q->fetchAll();
    foreach ($filas as &$f) {
        $f['id'] = (string)$f['id'];
    }
    unset($f);
    responder($filas);
}

exigir_post();
$d = entrada();
$accion  = $d['accion'] ?? '';
$juegoId = (int)numero($d, 'juego_id', 1, 2147483647, 'El juego');

if ($accion === 'agregar') {
    $q = db()->prepare('SELECT 1 FROM juegos WHERE id = ?');
    $q->execute([$juegoId]);
    if (!$q->fetch()) {
        fallar('Ese juego no existe.', 422);
    }
    $q = db()->prepare("INSERT IGNORE INTO biblioteca (usuario_id, juego_id, estado) VALUES (?, ?, 'quiero')");
    $q->execute([$u['id'], $juegoId]);
    responder(['ok' => true], 201);
}

if ($accion === 'estado') {
    $estado = (string)($d['estado'] ?? '');
    if (!in_array($estado, ['quiero', 'jugando', 'completado'], true)) {
        fallar('Estado no válido.', 422);
    }
    $q = db()->prepare('UPDATE biblioteca SET estado = ? WHERE usuario_id = ? AND juego_id = ?');
    $q->execute([$estado, $u['id'], $juegoId]);
    responder(['ok' => true]);
}

if ($accion === 'quitar') {
    $q = db()->prepare('DELETE FROM biblioteca WHERE usuario_id = ? AND juego_id = ?');
    $q->execute([$u['id'], $juegoId]);
    responder(['ok' => true]);
}

fallar('Acción no válida.', 400);
