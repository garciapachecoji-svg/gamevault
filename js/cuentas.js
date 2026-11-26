/* Cuentas fijas de GameVault: una de administrador y una de usuario normal.
   Para cambiar el nombre de usuario, edita el valor de "usuario".
   (Si ya habías iniciado sesión, cierra sesión y entra otra vez para ver el cambio.) */
const CUENTAS = [
    {
        usuario: 'admin',               // <- nombre de usuario editable
        correo: 'admin@gamevault.com',
        contrasena: 'Admin1234',
        rol: 'admin'                    // puede entrar a Administración
    },
    {
        usuario: 'jugador',             // <- nombre de usuario editable
        correo: 'jugador@gamevault.com',
        contrasena: 'Jugador1234',
        rol: 'usuario'                  // cuenta normal
    }
];
