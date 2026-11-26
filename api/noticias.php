<?php
/* Noticias: listar (todos) y publicar (solo administrador). */
require __DIR__ . '/bootstrap.php';

if (metodo() === 'GET') {
    $filas = db()->query('SELECT id, categoria, titulo, texto, creado AS fecha FROM noticias ORDER BY creado DESC, id DESC')->fetchAll();
    foreach ($filas as &$f) {
        $f['id']    = (string)$f['id'];
        $f['fecha'] = fecha_iso($f['fecha']);
    }
    unset($f);
    responder($filas);
}

exigir_post();
exigir_admin();
$d = entrada();

$categoria = (string)($d['categoria'] ?? '');
if (!in_array($categoria, ['Industria', 'Guías', 'Comunidad', 'Reseñas'], true)) {
    fallar('Selecciona una categoría válida.', 422);
}
$titulo = texto($d, 'titulo', 5, 100, 'El título');
$texto  = texto($d, 'texto', 30, 2000, 'El contenido');

$q = db()->prepare('INSERT INTO noticias (categoria, titulo, texto) VALUES (?, ?, ?)');
$q->execute([$categoria, $titulo, $texto]);
responder(['ok' => true], 201);
