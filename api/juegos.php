<?php
/* Catálogo de videojuegos: listar (todos) y añadir (solo administrador). */
require __DIR__ . '/bootstrap.php';

function formato_juego($f) {
    $f['id']   = (string)$f['id'];
    $f['anio'] = (int)$f['anio'];
    $f['nota'] = (float)$f['nota'];
    return $f;
}

if (metodo() === 'GET') {
    $filas = db()->query('SELECT id, titulo, genero, estudio, anio, plataformas, nota, descripcion, imagen, tienda FROM juegos ORDER BY id')->fetchAll();
    responder(array_map('formato_juego', $filas));
}

exigir_post();
exigir_admin();
$d = entrada();

$titulo      = texto($d, 'titulo', 2, 80, 'El título');
$genero      = texto($d, 'genero', 2, 40, 'El género');
$estudio     = texto($d, 'estudio', 2, 60, 'El estudio');
$plataformas = texto($d, 'plataformas', 2, 80, 'Las plataformas');
$descripcion = texto($d, 'descripcion', 20, 300, 'La descripción');
$anio        = (int)numero($d, 'anio', 1970, 2100, 'El año');
$nota        = numero($d, 'nota', 0, 10, 'La nota');
$imagen      = trim((string)($d['imagen'] ?? ''));
$tienda      = trim((string)($d['tienda'] ?? ''));

if (!url_valida($imagen)) {
    fallar('La URL de la imagen no es válida (debe empezar con http:// o https://).', 422);
}
if (!url_valida($tienda)) {
    fallar('El enlace de la tienda no es válido (debe empezar con http:// o https://).', 422);
}

$q = db()->prepare('INSERT INTO juegos (titulo, genero, estudio, anio, plataformas, nota, descripcion, imagen, tienda) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
$q->execute([$titulo, $genero, $estudio, $anio, $plataformas, $nota, $descripcion, $imagen, $tienda]);

responder(['ok' => true, 'id' => (string)db()->lastInsertId()], 201);
