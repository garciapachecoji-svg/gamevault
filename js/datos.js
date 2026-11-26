/* Capa de datos de GameVault.
   Todas las páginas piden sus datos a "Datos" y no les importa de dónde vienen:
   - Modo SERVIDOR: si existe el servidor PHP, los datos viven en MySQL (carpeta api/).
   - Modo DEMOSTRACIÓN: si no hay PHP (GitHub Pages, abrir el archivo con doble clic),
     se usa el localStorage del navegador, como en la entrega anterior. */
const Datos = (() => {
    const leer = (clave, porDefecto) => {
        try { return JSON.parse(localStorage.getItem(clave)) ?? porDefecto; }
        catch { return porDefecto; }
    };
    const escribir = (clave, valor) => localStorage.setItem(clave, JSON.stringify(valor));

    // ======================= MODO SERVIDOR (PHP + MySQL) =======================
    async function api(archivo, cuerpo) {
        const opciones = { credentials: 'same-origin', headers: { 'X-Requested-With': 'gamevault' } };
        if (cuerpo) {
            opciones.method = 'POST';
            opciones.headers['Content-Type'] = 'application/json';
            opciones.body = JSON.stringify(cuerpo);
        }
        const respuesta = await fetch('api/' + archivo, opciones);
        let datos = null;
        try { datos = await respuesta.json(); } catch { /* la respuesta no era JSON */ }
        if (!respuesta.ok) throw new Error(datos?.error || 'Error del servidor.');
        return datos;
    }

    const servidor = {
        sesion: async () => (await api('auth.php')).usuario,
        registro: async d => (await api('auth.php', { accion: 'registro', ...d })).usuario,
        login: async d => (await api('auth.php', { accion: 'login', ...d })).usuario,
        logout: () => api('auth.php', { accion: 'logout' }),
        juegos: () => api('juegos.php'),
        crearJuego: d => api('juegos.php', d),
        resenas: () => api('resenas.php'),
        crearResena: d => api('resenas.php', { accion: 'crear', juego_id: d.juegoId, nota: d.nota, titulo: d.titulo, texto: d.texto }),
        eliminarResena: id => api('resenas.php', { accion: 'eliminar', id }),
        noticias: () => api('noticias.php'),
        crearNoticia: d => api('noticias.php', d),
        biblioteca: () => api('biblioteca.php'),
        agregarBiblioteca: id => api('biblioteca.php', { accion: 'agregar', juego_id: id }),
        estadoBiblioteca: (id, estado) => api('biblioteca.php', { accion: 'estado', juego_id: id, estado }),
        quitarBiblioteca: id => api('biblioteca.php', { accion: 'quitar', juego_id: id }),
        enviarContacto: d => api('contacto.php', d)
    };

    // ======================= MODO DEMOSTRACIÓN (localStorage) =======================
    const RESENAS_EJEMPLO = [
        { id: 'ej1', juego: 'Hades', nota: 9, titulo: 'Cada intento es distinto', texto: 'Cada intento se siente distinto y la historia avanza aunque pierdas. Muy recomendable.', usuario: 'jugador_ejemplo1', fecha: '2026-11-12T12:00:00' },
        { id: 'ej2', juego: 'Celeste', nota: 10, titulo: 'Difícil pero justo', texto: 'Difícil pero justo. Las opciones de accesibilidad permiten disfrutarlo a tu ritmo.', usuario: 'jugador_ejemplo2', fecha: '2026-11-09T12:00:00' },
        { id: 'ej3', juego: 'Stardew Valley', nota: 9, titulo: 'Perfecto para relajarse', texto: 'Perfecto para relajarse después de clases. Siempre hay algo por hacer en la granja.', usuario: 'jugador_ejemplo3', fecha: '2026-11-05T12:00:00' }
    ];
    const NOTICIAS_EJEMPLO = [
        { id: 'n1', categoria: 'Guías', titulo: 'Cómo elegir tu próximo juego según tu género', texto: 'Una guía rápida para filtrar por género y plataforma sin perderte entre cientos de títulos.', fecha: '2026-11-18T12:00:00' },
        { id: 'n2', categoria: 'Comunidad', titulo: 'Biblioteca personal: organiza tu pendiente', texto: 'Guarda los juegos que quieres jugar y consúltalos después desde tu perfil.', fecha: '2026-11-15T12:00:00' },
        { id: 'n3', categoria: 'Reseñas', titulo: 'Reseñas de la comunidad: cómo escribir una útil', texto: 'Consejos para compartir opiniones honestas que ayuden a otros jugadores a decidir.', fecha: '2026-11-10T12:00:00' },
        { id: 'n4', categoria: 'Industria', titulo: 'Qué mirar antes de comprar un juego en una tienda digital', texto: 'Revisa requisitos, plataformas compatibles y vendedores oficiales para evitar sorpresas.', fecha: '2026-11-07T12:00:00' },
        { id: 'n5', categoria: 'Guías', titulo: 'Juegos para empezar si no has jugado RPG', texto: 'Cinco ideas de entrada, desde aventuras tranquilas hasta historias largas.', fecha: '2026-11-03T12:00:00' },
        { id: 'n6', categoria: 'Comunidad', titulo: 'Reglas de convivencia en las reseñas de GameVault', texto: 'Respeto, sin spoilers sin avisar y sin contenido ofensivo. Así cuidamos la comunidad.', fecha: '2026-10-28T12:00:00' }
    ];

    const cuentasFijas = () => (typeof CUENTAS !== 'undefined' ? CUENTAS : []);
    const sesionLocal = () => leer('gv_sesion', null);
    const claveBiblioteca = () => { const s = sesionLocal(); return s ? 'gv_biblioteca' + s.correo : null; };

    function exigirUsuario() {
        const s = sesionLocal();
        if (!s) throw new Error('Debes iniciar sesión.');
        return s;
    }
    function exigirAdmin() {
        if (exigirUsuario().rol !== 'admin') throw new Error('Solo para administradores.');
    }
    function abrirSesion(u) {
        const s = { usuario: u.usuario, correo: u.correo, rol: u.rol };
        escribir('gv_sesion', s);
        return s;
    }

    const local = {
        sesion: async () => sesionLocal(),
        async registro({ usuario, correo, contrasena, contrasena2 }) {
            if (contrasena !== contrasena2) throw new Error('Las contraseñas no coinciden.');
            const usuarios = leer('gv_usuarios', []);
            if ([...cuentasFijas(), ...usuarios].some(u => u.correo === correo)) throw new Error('Ese correo ya está registrado.');
            const nuevo = { usuario, correo, contrasena, rol: 'usuario' };
            escribir('gv_usuarios', [...usuarios, nuevo]);
            return abrirSesion(nuevo);
        },
        async login({ correo, contrasena }) {
            const u = [...cuentasFijas(), ...leer('gv_usuarios', [])].find(x => x.correo === correo && x.contrasena === contrasena);
            if (!u) throw new Error('Correo o contraseña incorrectos.');
            return abrirSesion(u);
        },
        logout: async () => localStorage.removeItem('gv_sesion'),

        async juegos() {
            const base = typeof JUEGOS_BASE !== 'undefined' ? JUEGOS_BASE : [];
            return [...base, ...leer('gv_juegos', [])];
        },
        async crearJuego(d) {
            exigirAdmin();
            escribir('gv_juegos', [...leer('gv_juegos', []), { ...d, id: String(Date.now()) }]);
        },

        async resenas() {
            if (localStorage.getItem('gv_resenas') === null) escribir('gv_resenas', RESENAS_EJEMPLO);
            return leer('gv_resenas', []);
        },
        async crearResena({ juegoId, nota, titulo, texto }) {
            const s = exigirUsuario();
            const juego = (await this.juegos()).find(j => String(j.id) === String(juegoId));
            if (!juego) throw new Error('Ese juego no existe.');
            const lista = await this.resenas();
            escribir('gv_resenas', [{ id: String(Date.now()), juego: juego.titulo, nota, titulo, texto, usuario: s.usuario, fecha: new Date().toISOString() }, ...lista]);
        },
        async eliminarResena(id) {
            exigirAdmin();
            escribir('gv_resenas', (await this.resenas()).filter(r => r.id !== String(id)));
        },

        async noticias() {
            if (localStorage.getItem('gv_noticias') === null) escribir('gv_noticias', NOTICIAS_EJEMPLO);
            return leer('gv_noticias', []);
        },
        async crearNoticia({ categoria, titulo, texto }) {
            exigirAdmin();
            escribir('gv_noticias', [{ id: String(Date.now()), categoria, titulo, texto, fecha: new Date().toISOString() }, ...(await this.noticias())]);
        },

        async biblioteca() {
            const clave = claveBiblioteca();
            return clave ? leer(clave, []) : [];
        },
        async agregarBiblioteca(id) {
            exigirUsuario();
            const lista = await this.biblioteca();
            if (!lista.some(g => String(g.id) === String(id))) escribir(claveBiblioteca(), [...lista, { id: String(id), estado: 'quiero' }]);
        },
        async estadoBiblioteca(id, estado) {
            exigirUsuario();
            escribir(claveBiblioteca(), (await this.biblioteca()).map(g => String(g.id) === String(id) ? { ...g, estado } : g));
        },
        async quitarBiblioteca(id) {
            exigirUsuario();
            escribir(claveBiblioteca(), (await this.biblioteca()).filter(g => String(g.id) !== String(id)));
        },

        async enviarContacto(d) {
            exigirUsuario();
            escribir('gv_mensajes', [...leer('gv_mensajes', []), { ...d, fecha: new Date().toISOString() }]);
        }
    };

    // ======================= Selección automática del modo =======================
    let modoPromesa = null;
    function modo() {
        // Si api/auth.php responde JSON (y la base de datos funciona) -> servidor; si no -> demostración
        modoPromesa ??= api('auth.php')
            .then(d => (d && 'usuario' in d ? 'servidor' : 'local'))
            .catch(() => 'local');
        return modoPromesa;
    }

    const publico = { modo };
    Object.keys(servidor).forEach(nombre => {
        publico[nombre] = async (...args) => {
            const implementacion = (await modo()) === 'servidor' ? servidor : local;
            return implementacion[nombre](...args);
        };
    });
    return publico;
})();
