// Avisa al CSS que JavaScript está activo
document.documentElement.classList.add('js');

// ---------- Menú hamburguesa ----------
const botonMenu = document.querySelector('.menu-toggle');
const menu = document.getElementById('menu-principal');
botonMenu?.addEventListener('click', () => {
    const abierto = menu.classList.toggle('abierto');
    botonMenu.setAttribute('aria-expanded', abierto);
});

// ---------- Utilidades ----------
// Convierte símbolos peligrosos en texto inofensivo (prevención de XSS)
function escaparHTML(texto) {
    return String(texto).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function fechaLarga(iso) {
    return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
}
// Quita mayúsculas y acentos: "baldurs" encuentra "Baldur’s" y "accion" encuentra "acción"
const normalizar = texto => texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const rutaImagen = j => j.imagen || `img/${j.id}.jpg`;

// Mensaje de error arriba de un formulario
function mostrarMensaje(form, texto) {
    form.querySelector('.exito')?.remove();
    let aviso = form.querySelector('.error_general');
    if (!aviso) {
        aviso = document.createElement('p');
        aviso.className = 'error error_general';
        aviso.setAttribute('role', 'alert');
        form.prepend(aviso);
    }
    aviso.textContent = texto;
}
// Mensaje de éxito al final de un formulario (acepta HTML propio, nunca datos de usuarios)
function mostrarExito(form, html) {
    form.querySelector('.error_general')?.remove();
    let exito = form.querySelector('.exito');
    if (!exito) {
        exito = document.createElement('p');
        exito.className = 'exito';
        exito.setAttribute('role', 'status');
        form.appendChild(exito);
    }
    exito.innerHTML = html;
}
// Ejecuta una acción y, si falla, muestra el error en el formulario
async function conErrores(form, accion) {
    try { await accion(); }
    catch (error) { mostrarMensaje(form, error.message || 'Ocurrió un error. Inténtalo de nuevo.'); }
}

// ---------- Sesión y roles ----------
function configurarSesion(sesion, rol) {
    // "Iniciar sesión" del menú cambia a "Salir" si hay sesión
    const enlaceEntrar = document.querySelector('.menu a.entrar');
    if (enlaceEntrar && sesion) {
        enlaceEntrar.textContent = `Salir (${sesion.usuario})`;
        enlaceEntrar.href = '#';
        enlaceEntrar.removeAttribute('aria-current');
        enlaceEntrar.addEventListener('click', async e => {
            e.preventDefault();
            await Datos.logout();
            window.location.href = 'index.html';
        });
    }

    // Entrar como invitado = no tener sesión
    document.getElementById('entrar_invitado')?.addEventListener('click', async e => {
        e.preventDefault();
        await Datos.logout();
        window.location.href = 'index.html';
    });

    // Bloqueo visual según el rol (la seguridad real la aplica el servidor en modo PHP)
    document.querySelectorAll('[data-requiere]').forEach(zona => {
        const necesario = zona.dataset.requiere;
        const permitido = necesario === 'admin' ? rol === 'admin' : rol !== 'invitado';
        if (permitido) return;

        if (zona.tagName === 'FORM') {
            zona.querySelectorAll('input, select, textarea, button').forEach(campo => { campo.disabled = true; });
            zona.classList.add('bloqueado');
        } else {
            const mensaje = necesario === 'admin'
                ? 'Esta sección es solo para administradores.'
                : 'Necesitas una cuenta para ver esta sección.';
            zona.innerHTML = `<section class="restringido"><h1>Acceso restringido</h1><p>${mensaje}</p><a class="boton" href="login.html">Iniciar sesión</a></section>`;
        }
    });

    // Si ya hay sesión, los avisos de "solo para usuarios con cuenta" sobran
    if (rol !== 'invitado') {
        document.querySelectorAll('.aviso-acceso').forEach(aviso => { aviso.hidden = true; });
    }
}

// Indica en el pie de página de dónde vienen los datos (útil para la defensa del proyecto)
function mostrarModo(modo) {
    const pie = document.querySelector('.pie p');
    if (!pie) return;
    const aviso = document.createElement('small');
    aviso.className = 'modo-datos';
    aviso.textContent = modo === 'servidor'
        ? 'Datos: servidor PHP + base de datos MySQL'
        : 'Modo demostración: datos guardados en este navegador (sin servidor PHP)';
    pie.append(aviso);
}

// ---------- Inicio de sesión y registro ----------
function paginaLogin() {
    const formLogin = document.getElementById('form_login');
    formLogin?.addEventListener('submit', e => {
        e.preventDefault();
        conErrores(formLogin, async () => {
            const datos = new FormData(formLogin);
            const correo = datos.get('correo').trim().toLowerCase();
            const contrasena = datos.get('contrasena');
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo)) throw new Error('Escribe un correo válido.');
            if (contrasena.length < 8) throw new Error('La contraseña debe tener al menos 8 caracteres.');
            const usuario = await Datos.login({ correo, contrasena });
            window.location.href = usuario.rol === 'admin' ? 'admin.html' : 'index.html';
        });
    });

    const formRegistro = document.getElementById('form_registro');
    formRegistro?.addEventListener('submit', e => {
        e.preventDefault();
        conErrores(formRegistro, async () => {
            const datos = new FormData(formRegistro);
            const usuario = datos.get('usuario').trim();
            const correo = datos.get('correo').trim().toLowerCase();
            const contrasena = datos.get('contrasena');
            const contrasena2 = datos.get('contrasena2');
            if (!/^[A-Za-z0-9_]{3,20}$/.test(usuario)) throw new Error('El usuario debe tener de 3 a 20 letras, números o guion bajo.');
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo)) throw new Error('Escribe un correo válido.');
            if (contrasena.length < 8) throw new Error('La contraseña debe tener al menos 8 caracteres.');
            if (contrasena !== contrasena2) throw new Error('Las contraseñas no coinciden.');
            await Datos.registro({ usuario, correo, contrasena, contrasena2 });
            window.location.href = 'index.html';
        });
    });
}

// ---------- Formulario de contacto ----------
function paginaContacto() {
    const formContacto = document.getElementById('form-contacto');
    if (!formContacto) return;

    // Una regla por campo: devuelve '' si está bien, o el mensaje de error
    const reglas = {
        nombre: v => v.trim().length < 3 ? 'Escribe tu nombre completo (mínimo 3 letras).' : '',
        correo: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Escribe un correo válido, por ejemplo nombre@correo.com.',
        telefono: v => /^\d{10}$/.test(v.trim()) ? '' : 'El teléfono debe tener exactamente 10 dígitos, solo números.',
        asunto: v => v === '' ? 'Selecciona un asunto.' : '',
        mensaje: v => v.trim().length < 10 ? 'El mensaje debe tener al menos 10 caracteres.' : '',
        acepto: (v, campo) => campo.checked ? '' : 'Debes aceptar el uso de tus datos.'
    };

    function mostrarError(campo, mensaje) {
        let aviso = campo.parentElement.querySelector('.error');
        if (!aviso) {
            aviso = document.createElement('small');
            aviso.className = 'error';
            aviso.setAttribute('role', 'alert');
            campo.parentElement.appendChild(aviso);
        }
        aviso.textContent = mensaje;
        campo.classList.toggle('invalido', mensaje !== '');
        campo.setAttribute('aria-invalid', mensaje !== '');
    }
    function validarCampo(campo) {
        const regla = reglas[campo.name];
        if (!regla) return true;
        const mensaje = regla(campo.value, campo);
        mostrarError(campo, mensaje);
        return mensaje === '';
    }

    formContacto.querySelectorAll('input, select, textarea').forEach(campo => {
        campo.addEventListener('input', () => validarCampo(campo));
        campo.addEventListener('change', () => validarCampo(campo));
    });

    formContacto.addEventListener('submit', e => {
        e.preventDefault(); // Sin preventDefault() el formulario se enviaría antes de validarlo
        const campos = [...formContacto.querySelectorAll('input, select, textarea')];
        const invalidos = campos.filter(campo => !validarCampo(campo));
        if (invalidos.length > 0) {
            invalidos[0].focus();
            return;
        }
        conErrores(formContacto, async () => {
            const datos = new FormData(formContacto);
            await Datos.enviarContacto({
                nombre: datos.get('nombre').trim(),
                correo: datos.get('correo').trim(),
                telefono: datos.get('telefono').trim(),
                asunto: datos.get('asunto'),
                mensaje: datos.get('mensaje').trim(),
                acepto: formContacto.querySelector('[name="acepto"]').checked
            });
            formContacto.reset();
            mostrarExito(formContacto, '¡Mensaje enviado! Gracias por escribirnos.');
        });
    });
}

// ---------- Catálogo: mostrar, buscar, filtrar y guardar ----------
async function paginaCatalogo(sesion) {
    const lista = document.getElementById('catalogo');
    if (!lista) return;
    const campoBuscar = document.getElementById('buscar');
    const selectGenero = document.getElementById('filtro-genero');
    const formBuscador = document.querySelector('.buscador');
    const contador = document.getElementById('contador');
    const sinResultados = document.getElementById('sin-resultados');

    const juegos = await Datos.juegos();
    const guardados = new Set(sesion ? (await Datos.biblioteca()).map(g => String(g.id)) : []);

    function crearTarjeta(j) {
        return `
        <li>
          <article class="juego">
            <figure><img src="${escaparHTML(rutaImagen(j))}" alt="Portada de ${escaparHTML(j.titulo)}" width="600" height="340" loading="lazy"></figure>
            <div class="cuerpo">
              <h3>${escaparHTML(j.titulo)}</h3>
              <p class="nota" aria-label="Nota GameVault ${j.nota} de 10">★ ${j.nota}</p>
              <p>${escaparHTML(j.descripcion)}</p>
              <dl>
                <dt>Género</dt><dd>${escaparHTML(j.genero)}</dd>
                <dt>Estudio</dt><dd>${escaparHTML(j.estudio)}</dd>
                <dt>Año</dt><dd>${j.anio}</dd>
                <dt>Plataformas</dt><dd>${escaparHTML(j.plataformas)}</dd>
              </dl>
              <footer class="acciones">
                <a class="boton" href="${escaparHTML(j.tienda)}" target="_blank" rel="noopener noreferrer">Ver en tienda oficial</a>
                <button class="boton boton-sec" type="button" data-guardar="${escaparHTML(j.id)}">${guardados.has(String(j.id)) ? '★ Guardado' : '☆ Guardar en biblioteca'}</button>
              </footer>
            </div>
          </article>
        </li>`;
    }

    // Géneros que existan en los datos (sin repetir)
    [...new Set(juegos.map(j => j.genero))].sort().forEach(genero => selectGenero.add(new Option(genero, genero)));

    function actualizarCatalogo() {
        const texto = normalizar(campoBuscar.value.trim());
        const genero = selectGenero.value;
        const resultado = juegos.filter(j =>
            normalizar(`${j.titulo} ${j.genero} ${j.estudio}`).includes(texto) && (genero === '' || j.genero === genero));
        lista.innerHTML = resultado.map(crearTarjeta).join('');
        sinResultados.hidden = resultado.length > 0;
        contador.textContent = `Mostrando ${resultado.length} de ${juegos.length} juegos.`;
    }

    campoBuscar.addEventListener('input', actualizarCatalogo);
    selectGenero.addEventListener('change', actualizarCatalogo);
    formBuscador.addEventListener('submit', e => { e.preventDefault(); actualizarCatalogo(); });

    // Botón "Guardar" (delegación de eventos: un solo escuchador para toda la lista)
    lista.addEventListener('click', async e => {
        const boton = e.target.closest('[data-guardar]');
        if (!boton) return;
        if (!sesion) {
            contador.textContent = 'Inicia sesión para guardar juegos en tu biblioteca.';
            return;
        }
        const id = boton.dataset.guardar;
        try {
            if (guardados.has(id)) {
                await Datos.quitarBiblioteca(id);
                guardados.delete(id);
                boton.textContent = '☆ Guardar en biblioteca';
            } else {
                await Datos.agregarBiblioteca(id);
                guardados.add(id);
                boton.textContent = '★ Guardado';
            }
        } catch (error) {
            contador.textContent = error.message;
        }
    });

    actualizarCatalogo();
}

// ---------- Biblioteca personal ----------
async function paginaBiblioteca() {
    const lista = document.getElementById('lista-biblioteca');
    if (!lista) return;
    const vacio = document.getElementById('biblioteca-vacia');
    const ESTADOS = { quiero: 'Quiero jugar', jugando: 'Jugando', completado: 'Completado' };
    const juegos = await Datos.juegos();
    let guardados = await Datos.biblioteca();

    function tarjeta(j, estado) {
        const opciones = Object.entries(ESTADOS)
            .map(([valor, texto]) => `<option value="${valor}"${valor === estado ? ' selected' : ''}>${texto}</option>`).join('');
        return `
        <li>
          <article class="juego">
            <figure><img src="${escaparHTML(rutaImagen(j))}" alt="Portada de ${escaparHTML(j.titulo)}" width="600" height="340" loading="lazy"></figure>
            <div class="cuerpo">
              <h3>${escaparHTML(j.titulo)}</h3>
              <p>${escaparHTML(j.genero)}</p>
              <form class="estado" action="#" method="post">
                <label for="estado-${escaparHTML(j.id)}">Estado</label>
                <select id="estado-${escaparHTML(j.id)}" name="estado" data-estado="${escaparHTML(j.id)}">${opciones}</select>
              </form>
              <footer class="acciones">
                <a class="boton boton-sec" href="productos.html">Ver en catálogo</a>
                <button class="boton boton-peligro" type="button" data-quitar="${escaparHTML(j.id)}">Quitar de mi biblioteca</button>
              </footer>
            </div>
          </article>
        </li>`;
    }
    function dibujar() {
        lista.innerHTML = guardados
            .map(g => { const j = juegos.find(x => String(x.id) === String(g.id)); return j ? tarjeta(j, g.estado) : ''; })
            .join('');
        vacio.hidden = guardados.length > 0;
    }

    lista.addEventListener('change', async e => {
        const select = e.target.closest('[data-estado]');
        if (!select) return;
        await Datos.estadoBiblioteca(select.dataset.estado, select.value);
        guardados = guardados.map(g => String(g.id) === select.dataset.estado ? { ...g, estado: select.value } : g);
    });
    lista.addEventListener('click', async e => {
        const boton = e.target.closest('[data-quitar]');
        if (!boton) return;
        await Datos.quitarBiblioteca(boton.dataset.quitar);
        guardados = guardados.filter(g => String(g.id) !== boton.dataset.quitar);
        dibujar();
    });
    dibujar();
}

// ---------- Reseñas ----------
function tarjetaResena(r) {
    return `
    <article class="tarjeta">
      <h3>${escaparHTML(r.juego)}</h3>
      <p class="nota" aria-label="Nota ${r.nota} de 10">★ ${r.nota}</p>
      <p><strong>${escaparHTML(r.titulo)}</strong></p>
      <p>${escaparHTML(r.texto)}</p>
      <footer><small>Por <strong>${escaparHTML(r.usuario)}</strong> · <time datetime="${r.fecha.slice(0, 10)}">${fechaLarga(r.fecha)}</time></small></footer>
    </article>`;
}

async function paginaResenas(sesion) {
    const lista = document.getElementById('lista-resenas');
    if (!lista) return;
    const vacio = document.getElementById('resenas-vacia');

    async function dibujar() {
        const resenas = await Datos.resenas();
        lista.innerHTML = resenas.map(tarjetaResena).join('');
        if (vacio) { lista.append(vacio); vacio.hidden = resenas.length > 0; }
    }

    const form = document.getElementById('form-resena');
    if (form) {
        // El select se llena con los juegos del catálogo (incluye los que añada el administrador)
        const selectJuego = document.getElementById('res-juego');
        selectJuego.innerHTML = '<option value="">Selecciona un juego</option>';
        (await Datos.juegos()).forEach(j => selectJuego.add(new Option(j.titulo, j.id)));

        const avisoUsuario = document.getElementById('res-usuario');
        if (avisoUsuario && sesion) avisoUsuario.textContent = `Publicarás como: ${sesion.usuario}`;

        form.addEventListener('submit', e => {
            e.preventDefault();
            if (!sesion) return;
            conErrores(form, async () => {
                const datos = new FormData(form);
                const juegoId = datos.get('juego');
                const nota = Number(datos.get('nota'));
                const titulo = datos.get('titulo').trim();
                const texto = datos.get('texto').trim();

                if (!juegoId) throw new Error('Selecciona el juego que vas a reseñar.');
                if (!Number.isInteger(nota) || nota < 1 || nota > 10) throw new Error('La nota debe ser un número entero del 1 al 10.');
                if (titulo.length < 5) throw new Error('El título debe tener al menos 5 caracteres.');
                if (texto.length < 30) throw new Error('Tu opinión debe tener al menos 30 caracteres.');

                await Datos.crearResena({ juegoId, nota, titulo, texto });
                form.reset();
                await dibujar();
                mostrarExito(form, '¡Reseña publicada! Ya aparece en la lista.');
            });
        });
    }
    await dibujar();
}

// ---------- Noticias ----------
function tarjetaNoticia(n, nivel = 'h2') {
    return `
    <article class="tarjeta">
      <p class="etiqueta">${escaparHTML(n.categoria)}</p>
      <${nivel} class="h3">${escaparHTML(n.titulo)}</${nivel}>
      <time datetime="${n.fecha.slice(0, 10)}">${fechaLarga(n.fecha)}</time>
      <p class="texto-largo">${escaparHTML(n.texto)}</p>
    </article>`;
}

async function paginaNoticias() {
    const todas = document.getElementById('lista-noticias');
    const recientes = document.getElementById('noticias-recientes');
    if (!todas && !recientes) return;
    const noticias = await Datos.noticias();
    if (todas) todas.innerHTML = noticias.map(n => tarjetaNoticia(n)).join('');
    if (recientes) recientes.innerHTML = noticias.slice(0, 3).map(n => tarjetaNoticia(n, 'h3')).join('');
}

// ---------- Panel de administrador ----------
async function paginaAdmin() {
    // Moderar reseñas
    const lista = document.getElementById('lista-admin-resenas');
    if (lista) {
        const vacio = document.getElementById('admin-vacio');
        async function dibujar() {
            const resenas = await Datos.resenas();
            lista.innerHTML = resenas.map(r => `
            <li>
              <article class="tarjeta">
                <h3>${escaparHTML(r.juego)} <span class="nota">★ ${r.nota}</span></h3>
                <p><strong>${escaparHTML(r.titulo)}</strong></p>
                <p>${escaparHTML(r.texto)}</p>
                <p><small>Por <strong>${escaparHTML(r.usuario)}</strong> · <time datetime="${r.fecha.slice(0, 10)}">${fechaLarga(r.fecha)}</time></small></p>
                <button class="boton boton-peligro" type="button" data-eliminar="${escaparHTML(r.id)}">Eliminar reseña</button>
              </article>
            </li>`).join('');
            if (vacio) vacio.hidden = resenas.length > 0;
        }
        lista.addEventListener('click', async e => {
            const boton = e.target.closest('[data-eliminar]');
            if (!boton) return;
            if (!confirm('¿Eliminar esta reseña? Esta acción no se puede deshacer.')) return;
            try { await Datos.eliminarResena(boton.dataset.eliminar); await dibujar(); }
            catch (error) { alert(error.message); }
        });
        await dibujar();
    }

    // Añadir juego al catálogo
    const formJuego = document.getElementById('form-juego');
    if (formJuego) {
        const selectGenero = document.getElementById('juego-genero');
        [...new Set((await Datos.juegos()).map(j => j.genero))].sort().forEach(g => selectGenero.add(new Option(g, g)));

        const urlValida = valor => { try { return /^https?:$/.test(new URL(valor).protocol); } catch { return false; } };
        formJuego.addEventListener('submit', e => {
            e.preventDefault();
            conErrores(formJuego, async () => {
                const datos = new FormData(formJuego);
                const campo = nombre => datos.get(nombre).trim();
                const nota = Number(datos.get('nota'));
                const anio = Number(datos.get('anio'));
                const imagen = campo('imagen');
                const tienda = campo('tienda');

                if (campo('titulo').length < 2) throw new Error('El título debe tener al menos 2 caracteres.');
                if (!datos.get('genero')) throw new Error('Selecciona un género.');
                if (!campo('estudio') || !campo('plataformas')) throw new Error('Completa estudio y plataformas.');
                if (!Number.isInteger(anio) || anio < 1970 || anio > 2100) throw new Error('Escribe un año válido.');
                if (isNaN(nota) || nota < 0 || nota > 10) throw new Error('La nota debe estar entre 0 y 10.');
                if (campo('descripcion').length < 20) throw new Error('La descripción debe tener al menos 20 caracteres.');
                if (!urlValida(imagen)) throw new Error('La URL de la imagen no es válida (debe empezar con http:// o https://).');
                if (!urlValida(tienda)) throw new Error('El enlace de la tienda no es válido (debe empezar con http:// o https://).');

                await Datos.crearJuego({
                    titulo: campo('titulo'), genero: datos.get('genero'), estudio: campo('estudio'), anio,
                    plataformas: campo('plataformas'), nota, descripcion: campo('descripcion'),
                    imagen: new URL(imagen).href, tienda: new URL(tienda).href
                });
                formJuego.reset();
                mostrarExito(formJuego, '¡Juego añadido! <a href="productos.html">Ver en el Catálogo</a>');
            });
        });
    }

    // Publicar noticia
    const formNoticia = document.getElementById('form-noticia');
    if (formNoticia) {
        const CATEGORIAS = { industria: 'Industria', guias: 'Guías', comunidad: 'Comunidad', resenas: 'Reseñas' };
        formNoticia.addEventListener('submit', e => {
            e.preventDefault();
            conErrores(formNoticia, async () => {
                const datos = new FormData(formNoticia);
                const categoria = CATEGORIAS[datos.get('categoria')];
                const titulo = datos.get('titulo').trim();
                const texto = datos.get('contenido').trim();
                if (!categoria) throw new Error('Selecciona una categoría.');
                if (titulo.length < 5) throw new Error('El título debe tener al menos 5 caracteres.');
                if (texto.length < 30) throw new Error('El contenido debe tener al menos 30 caracteres.');
                await Datos.crearNoticia({ categoria, titulo, texto });
                formNoticia.reset();
                mostrarExito(formNoticia, '¡Noticia publicada! <a href="noticias.html">Ver en Noticias</a>');
            });
        });
    }
}

// ---------- Arranque ----------
async function iniciar() {
    const sesion = await Datos.sesion().catch(() => null);
    const rol = sesion?.rol ?? 'invitado';
    mostrarModo(await Datos.modo());
    configurarSesion(sesion, rol); // primero los bloqueos: una zona restringida se reemplaza por un aviso

    const paginas = [paginaLogin, paginaContacto, () => paginaCatalogo(sesion), paginaBiblioteca,
        () => paginaResenas(sesion), paginaNoticias, paginaAdmin];
    for (const pagina of paginas) {
        try { await pagina(); }
        catch (error) { console.error(error); }
    }
}
iniciar();
