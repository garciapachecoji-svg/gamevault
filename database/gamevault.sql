-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 26-11-2026 a las 22:17:33
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `gamevault`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `biblioteca`
--

CREATE TABLE `biblioteca` (
  `usuario_id` int(10) UNSIGNED NOT NULL,
  `juego_id` int(10) UNSIGNED NOT NULL,
  `estado` enum('quiero','jugando','completado') NOT NULL DEFAULT 'quiero',
  `creado` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `biblioteca`
--

INSERT INTO `biblioteca` (`usuario_id`, `juego_id`, `estado`, `creado`) VALUES
(6, 4, 'completado', '2026-11-26 21:04:49'),
(6, 8, 'completado', '2026-11-26 21:04:47'),
(6, 13, 'jugando', '2026-11-26 21:04:45');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `juegos`
--

CREATE TABLE `juegos` (
  `id` int(10) UNSIGNED NOT NULL,
  `titulo` varchar(80) NOT NULL,
  `genero` varchar(40) NOT NULL,
  `estudio` varchar(60) NOT NULL,
  `anio` smallint(5) UNSIGNED NOT NULL,
  `plataformas` varchar(80) NOT NULL,
  `nota` decimal(3,1) NOT NULL,
  `descripcion` varchar(300) NOT NULL,
  `imagen` varchar(255) NOT NULL,
  `tienda` varchar(255) NOT NULL,
  `creado` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `juegos`
--

INSERT INTO `juegos` (`id`, `titulo`, `genero`, `estudio`, `anio`, `plataformas`, `nota`, `descripcion`, `imagen`, `tienda`, `creado`) VALUES
(1, 'Elden Ring', 'RPG de acción', 'FromSoftware', 2022, 'PC, PlayStation, Xbox', 9.5, 'Un mundo abierto enorme y desafiante, ideal para quienes disfrutan explorar y superar retos.', 'img/elden_ring.jpg', 'https://store.steampowered.com/app/1245620/', '2026-11-26 20:41:47'),
(2, 'Baldur’s Gate 3', 'RPG por turnos', 'Larian Studios', 2023, 'PC, PlayStation, Xbox', 9.7, 'Decisiones con consecuencias reales y una historia que cambia según cómo juegues.', 'img/baldurs_gate_3.jpg', 'https://store.steampowered.com/app/1086940/', '2026-11-26 20:41:47'),
(3, 'Hades', 'Roguelike de acción', 'Supergiant Games', 2020, 'PC, Switch, PlayStation, Xbox', 9.3, 'Combate rápido y una narrativa que avanza con cada intento de escapar.', 'img/hades.jpg', 'https://store.steampowered.com/app/1145360/', '2026-11-26 20:41:47'),
(4, 'Hollow Knight', 'Metroidvania', 'Team Cherry', 2017, 'PC, Switch, PlayStation, Xbox', 9.2, 'Exploración, jefes memorables y un reino subterráneo lleno de secretos.', 'img/hollow_knight.jpg', 'https://store.steampowered.com/app/367520/', '2026-11-26 20:41:47'),
(5, 'Stardew Valley', 'Simulación y granja', 'ConcernedApe', 2016, 'PC, Switch, PlayStation, Xbox, móvil', 9.0, 'Cultiva, pesca y construye amistades a tu propio ritmo en un pueblo acogedor.', 'img/stardew_valley.jpg', 'https://store.steampowered.com/app/413150/', '2026-11-26 20:41:47'),
(6, 'Cyberpunk 2077', 'RPG de acción', 'CD Projekt Red', 2020, 'PC, PlayStation, Xbox', 8.5, 'Una ciudad futurista para recorrer con libertad, con historia y personajes memorables.', 'img/cyberpunk_2077.jpg', 'https://store.steampowered.com/app/1091500/', '2026-11-26 20:41:47'),
(7, 'The Witcher 3: Wild Hunt', 'RPG de acción', 'CD Projekt Red', 2015, 'PC, PlayStation, Xbox, Switch', 9.4, 'Un cazador de monstruos, un mundo abierto lleno de historias y misiones secundarias memorables.', 'img/the_witcher_3.jpg', 'https://store.steampowered.com/app/292030/', '2026-11-26 20:41:47'),
(8, 'Celeste', 'Plataformas', 'Maddy Makes Games', 2018, 'PC, Switch, PlayStation, Xbox', 9.1, 'Escalar una montaña con saltos precisos y una historia sincera sobre superarse.', 'img/celeste.jpg', 'https://store.steampowered.com/app/504230/', '2026-11-26 20:41:47'),
(9, 'Portal 2', 'Puzles en primera persona', 'Valve', 2011, 'PC', 9.3, 'Puzles ingeniosos con portales y un humor que lo hace único.', 'img/portal_2.jpg', 'https://store.steampowered.com/app/620/', '2026-11-26 20:41:47'),
(10, 'Disco Elysium', 'RPG narrativo', 'ZA/UM', 2019, 'PC, PlayStation, Xbox, Switch', 9.2, 'Un detective con amnesia y un mundo que se resuelve con diálogos, no con combate.', 'img/disco_elysium.jpg', 'https://store.steampowered.com/app/632470/', '2026-11-26 20:41:47'),
(11, 'Terraria', 'Aventura y construcción', 'Re-Logic', 2011, 'PC, consolas, móvil', 9.0, 'Explora, construye y enfrenta jefes en un mundo 2D con mucha libertad.', 'img/terraria.jpg', 'https://store.steampowered.com/app/105600/', '2026-11-26 20:41:47'),
(12, 'Red Dead Redemption 2', 'Acción y aventura', 'Rockstar Games', 2018, 'PC, PlayStation 4, Xbox One', 9.4, 'Una historia de forajidos en el viejo oeste con un mundo muy detallado.', 'img/red_dead_redemption_2.jpg', 'https://store.steampowered.com/app/1174180/', '2026-11-26 20:41:47'),
(13, 'Mortal Kombat X', 'Peleas 2D', 'NetherRealm Studios', 2015, 'PC, PlayStation, Xbox', 8.4, 'La décima entrega de la mítica saga de peleas Mortal Kombat la cual continua con su historia 20 años en el futuro presentando personajes nuevos además de la jugabilidad más rápida y frenética hasta la fecha', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/307780/header.jpg?t=1761846088', 'https://store.steampowered.com/app/307780/Mortal_Kombat_X/', '2026-11-26 20:58:40');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mensajes_contacto`
--

CREATE TABLE `mensajes_contacto` (
  `id` int(10) UNSIGNED NOT NULL,
  `usuario_id` int(10) UNSIGNED NOT NULL,
  `nombre` varchar(60) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `telefono` char(10) NOT NULL,
  `asunto` varchar(20) NOT NULL,
  `mensaje` varchar(500) NOT NULL,
  `creado` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `noticias`
--

CREATE TABLE `noticias` (
  `id` int(10) UNSIGNED NOT NULL,
  `categoria` varchar(20) NOT NULL,
  `titulo` varchar(100) NOT NULL,
  `texto` varchar(2000) NOT NULL,
  `creado` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `noticias`
--

INSERT INTO `noticias` (`id`, `categoria`, `titulo`, `texto`, `creado`) VALUES
(1, 'Guías', 'Cómo elegir tu próximo juego según tu género', 'Una guía rápida para filtrar por género y plataforma sin perderte entre cientos de títulos.', '2026-11-18 18:00:00'),
(2, 'Comunidad', 'Biblioteca personal: organiza tu pendiente', 'Guarda los juegos que quieres jugar y consúltalos después desde tu perfil.', '2026-11-15 18:00:00'),
(3, 'Reseñas', 'Reseñas de la comunidad: cómo escribir una útil', 'Consejos para compartir opiniones honestas que ayuden a otros jugadores a decidir.', '2026-11-10 18:00:00'),
(4, 'Industria', 'Qué mirar antes de comprar un juego en una tienda digital', 'Revisa requisitos, plataformas compatibles y vendedores oficiales para evitar sorpresas.', '2026-11-07 18:00:00'),
(5, 'Guías', 'Juegos para empezar si no has jugado RPG', 'Cinco ideas de entrada, desde aventuras tranquilas hasta historias largas.', '2026-11-03 18:00:00'),
(6, 'Comunidad', 'Reglas de convivencia en las reseñas de GameVault', 'Respeto, sin spoilers sin avisar y sin contenido ofensivo. Así cuidamos la comunidad.', '2026-10-28 18:00:00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `resenas`
--

CREATE TABLE `resenas` (
  `id` int(10) UNSIGNED NOT NULL,
  `juego_id` int(10) UNSIGNED NOT NULL,
  `usuario_id` int(10) UNSIGNED NOT NULL,
  `nota` tinyint(3) UNSIGNED NOT NULL,
  `titulo` varchar(80) NOT NULL,
  `texto` varchar(1000) NOT NULL,
  `creado` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `resenas`
--

INSERT INTO `resenas` (`id`, `juego_id`, `usuario_id`, `nota`, `titulo`, `texto`, `creado`) VALUES
(6, 13, 6, 8, 'Muy bueno pero dificil si eres nuevo en el género', 'Tal vez sea el mejor si quieres competir en un juego dificil por lo rápido de su sistema de combate pero esto mismo lo hace poco accesible para nuevos jugadores. Si ya eres veterano en el género y tienes algo dificil de dominar este es tu juego, si apenas estas entrando en el género te recomiendo otros juegos como Mortal Kombat 11', '2026-11-26 21:12:42'),
(7, 8, 6, 10, 'Uno de los mejores indies de la historia', 'Perfecto si no sabes que juego nuevo probar: una historia muy emotiva, mecánicas sencillas pero llevadas al límite en momentos, una gran dificultad para quienes busquen completarlo al máximo y una más accesible si solo quiere completar la historia principal, además de contar con muchos coleccionables y secretos motivandote a rejugarlo. Una obra maestra.', '2026-11-26 21:14:56'),
(8, 10, 6, 2, 'Perfecto para gente con insomnio', 'No es mi estilo de juego, casi todo el gameplay es estar leyendo dialogos y más dialogos y llega a ser algo aburrido. Si te gustan las novelas visuales pruebalo dicen que tiene buena historia, si no, NI PIENSES EN COMPRARLO te va a aburrir.', '2026-11-26 21:16:43');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(10) UNSIGNED NOT NULL,
  `usuario` varchar(20) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  `rol` enum('usuario','admin') NOT NULL DEFAULT 'usuario',
  `creado` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `usuario`, `correo`, `contrasena`, `rol`, `creado`) VALUES
(1, 'admin', 'admin@gamevault.com', '$2y$10$3.MnWEcIodFDHNmfKvzxaO7IBACqTRCGmdu/DAZXcjpLteDscPd6y', 'admin', '2026-11-26 20:41:47'),
(6, 'Prueba', 'prueba@gmail.com', '$2y$10$Ok6HKpgEIevmt9zxt1q9s.B/jFanhOf2uECpmoyU3./uT9FHPf45O', 'usuario', '2026-11-26 21:04:03');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `biblioteca`
--
ALTER TABLE `biblioteca`
  ADD PRIMARY KEY (`usuario_id`,`juego_id`),
  ADD KEY `juego_id` (`juego_id`);

--
-- Indices de la tabla `juegos`
--
ALTER TABLE `juegos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_juegos_genero` (`genero`);

--
-- Indices de la tabla `mensajes_contacto`
--
ALTER TABLE `mensajes_contacto`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `noticias`
--
ALTER TABLE `noticias`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `resenas`
--
ALTER TABLE `resenas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `juego_id` (`juego_id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `usuario` (`usuario`),
  ADD UNIQUE KEY `correo` (`correo`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `juegos`
--
ALTER TABLE `juegos`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `mensajes_contacto`
--
ALTER TABLE `mensajes_contacto`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `noticias`
--
ALTER TABLE `noticias`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `resenas`
--
ALTER TABLE `resenas`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `biblioteca`
--
ALTER TABLE `biblioteca`
  ADD CONSTRAINT `biblioteca_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `biblioteca_ibfk_2` FOREIGN KEY (`juego_id`) REFERENCES `juegos` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `mensajes_contacto`
--
ALTER TABLE `mensajes_contacto`
  ADD CONSTRAINT `mensajes_contacto_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `resenas`
--
ALTER TABLE `resenas`
  ADD CONSTRAINT `resenas_ibfk_1` FOREIGN KEY (`juego_id`) REFERENCES `juegos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `resenas_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
