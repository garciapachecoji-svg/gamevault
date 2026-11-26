<?php
/* Reseñas: listar (todos), publicar (usuario con cuenta) y eliminar (administrador). */
require __DIR__ . '/bootstrap.php';

if (metodo() === 'GET') {
    $filas = db()->query(
        'SELECT r.id, j.titulo AS juego, r.nota, r.titulo, r.texto, u.usuario, r.creado AS fecha
         FROM resenas r
         JOIN juegos j ON j.id = r.juego_id
         JOIN usuarios u ON u.id = r.usuario_id
         ORDER BY r.creado DESC, r.id DESC'
    )->fetchAll();
    foreach ($filas as &$f) {
        $f['id']    = (string)$f['id'];
        $f['nota']  = (int)$f['nota'];
        $f['fecha'] = fecha_iso($f['fecha']);
    }
    unset($f);
    responder($filas);
}

exigir_post();
$d = entrada();
$accion = $d['accion'] ?? '';

if ($accion === 'crear') {
    $u = exigir_usuario();
    $juegoId = (int)numero($d, 'juego_id', 1, 2147483647, 'El juego');
    $nota    = (int)numero($d, 'nota', 1, 10, 'La nota');
    $titulo  = texto($d, 'titulo', 5, 80, 'El título');
    $texto   = texto($d, 'texto', 30, 1000, 'La opinión');

    $q = db()->prepare('SELECT 1 FROM juegos WHERE id = ?');
    $q->execute([$juegoId]);
    if (!$q->fetch()) {
        fallar('Ese juego no existe.', 422);
    }

    $q = db()->prepare('INSERT INTO resenas (juego_id, usuario_id, nota, titulo, texto) VALUES (?, ?, ?, ?, ?)');
    $q->execute([$juegoId, $u['id'], $nota, $titulo, $texto]);
    responder(['ok' => true], 201);
}

if ($accion === 'eliminar') {
    exigir_admin();
    $id = (int)numero($d, 'id', 1, 2147483647, 'La reseña');
    $q = db()->prepare('DELETE FROM resenas WHERE id = ?');
    $q->execute([$id]);
    responder(['ok' => true]);
}

fallar('Acción no válida.', 400);
