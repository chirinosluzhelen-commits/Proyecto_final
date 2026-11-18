// ==========================================
// SIMTELE-WEB
// Panel educativo de monitoreo
// ==========================================


// ARREGLOS

let mantenimientos = [];
let sensores = [];


// ==========================================
// GESTIÓN DE AUTENTICACIÓN Y USUARIOS
// ==========================================

let esModoRegistro = false;

document.getElementById("cambiarModoRegistro").addEventListener("click", function(e) {
    e.preventDefault();
    esModoRegistro = !esModoRegistro;

    let titulo = document.getElementById("tituloLogin");
    let subtitulo = document.getElementById("subtituloLogin");
    let btnAccion = document.getElementById("btnAccionLogin");
    let textoCambio = document.getElementById("textoCambioModo");
    let enlaceCambio = document.getElementById("cambiarModoRegistro");
    let mensaje = document.getElementById("mensajeLogin");

    mensaje.textContent = "";

    if (esModoRegistro) {
        titulo.textContent = "🚡 Registrarse";
        subtitulo.textContent = "Crea una nueva cuenta";
        btnAccion.textContent = "Registrarse";
        textoCambio.textContent = "¿Ya tienes cuenta?";
        enlaceCambio.textContent = "Inicia sesión aquí";
    } else {
        titulo.textContent = "🚡 SIMTELE-WEB";
        subtitulo.textContent = "Iniciar sesión en el sistema";
        btnAccion.textContent = "Iniciar sesión";
        textoCambio.textContent = "¿No tienes cuenta?";
        enlaceCambio.textContent = "Regístrate aquí";
    }
});

document.getElementById("formLogin").addEventListener("submit", function(e) {
    e.preventDefault();

    let usuarioInput = document.getElementById("usuario").value.trim();
    let contrasenaInput = document.getElementById("contrasena").value.trim();
    let mensaje = document.getElementById("mensajeLogin");

    // Obtener usuarios guardados o crear un array vacío
    let usuariosGuardados = JSON.parse(localStorage.getItem("simtele_usuarios")) || [];

    if (esModoRegistro) {
        // Lógica de Registro
        let existe = usuariosGuardados.some(u => u.usuario === usuarioInput);
        if (existe) {
            mensaje.textContent = "Error: El usuario ya existe.";
            mensaje.style.color = "red";
            return;
        }

        usuariosGuardados.push({ usuario: usuarioInput, contrasena: contrasenaInput });
        localStorage.setItem("simtele_usuarios", JSON.stringify(usuariosGuardados));

        mensaje.textContent = "¡Registro exitoso! Ahora puedes iniciar sesión.";
        mensaje.style.color = "green";
        document.getElementById("formLogin").reset();
        
        // Cambiar automáticamente a modo login
        document.getElementById("cambiarModoRegistro").click();
    } else {
        // Lógica de Inicio de Sesión
        let usuarioValido = usuariosGuardados.find(u => u.usuario === usuarioInput && u.contrasena === contrasenaInput);

        if (usuarioValido) {
            localStorage.setItem("simtele_sesion_activa", usuarioInput);
            verificarSesion();
        } else {
            mensaje.textContent = "Error: Usuario o contraseña incorrectos.";
            mensaje.style.color = "red";
        }
    }
});

document.getElementById("cerrarSesion").addEventListener("click", function() {
    localStorage.removeItem("simtele_sesion_activa");
    verificarSesion();
    document.getElementById("formLogin").reset();
});

function verificarSesion() {
    let sesionActiva = localStorage.getItem("simtele_sesion_activa");
    let seccionLogin = document.getElementById("seccionLogin");
    let appPrincipal = document.getElementById("appPrincipal");

    if (sesionActiva) {
        seccionLogin.hidden = true;
        appPrincipal.hidden = false;
    } else {
        seccionLogin.hidden = false;
        appPrincipal.hidden = true;
    }
}

// Ejecutar verificación al cargar la página
window.addEventListener("DOMContentLoaded", function() {
    verificarSesion();
});


// ==========================================
// MODULO 1: DETENCION DE EMERGENCIA
// ==========================================

function calcularDistancia(velocidad, tiempo) {

    let distancia = (velocidad / 3.6) * tiempo;

    return distancia;
}

document.getElementById("formEmergencia").addEventListener("submit", function(event) {

    event.preventDefault();

    let velocidad = parseFloat(document.getElementById("velocidad").value);
    let tiempo = parseFloat(document.getElementById("reaccion").value);

    let resultado = document.getElementById("resultadoEmergencia");

    if (!Number.isFinite(velocidad) || !Number.isFinite(tiempo) ||
        velocidad <= 0 || tiempo <= 0) {

        resultado.textContent = "Error: ingresa una velocidad y un tiempo mayores que cero.";
        resultado.className = "resultado error";

    } else {

        let distancia = calcularDistancia(velocidad, tiempo);

        resultado.textContent = "Distancia estimada: " +
            distancia.toFixed(2) + " metros. ";

        if (distancia > 20) {

            resultado.textContent +=
                "Aviso: la distancia supera el umbral didáctico de 20 metros.";

            resultado.className = "resultado error";

        } else {

            resultado.textContent +=
                "La distancia está dentro del umbral didáctico de esta simulación.";

            resultado.className = "resultado exito";
        }
    }

});


// ==========================================
// MODULO 2: MANTENIMIENTO
// ==========================================

function mostrarMantenimientos() {

    let tabla = document.getElementById("tablaMantenimiento");

    tabla.textContent = "";

    if (mantenimientos.length === 0) {

        let fila = document.createElement("tr");
        let celda = document.createElement("td");

        celda.colSpan = 4;
        celda.textContent = "No hay registros todavía.";

        fila.appendChild(celda);
        tabla.appendChild(fila);

    } else {

        mantenimientos.forEach(function(registro, indice) {

            let fila = document.createElement("tr");

            let componente = document.createElement("td");
            componente.textContent = registro.componente;

            let horas = document.createElement("td");
            horas.textContent = registro.horas;

            let estado = document.createElement("td");
            estado.textContent = registro.estado;

            if (registro.estado === "Normal") {
                estado.className = "normal";
            } else if (registro.estado === "Revisión") {
                estado.className = "revision";
            } else {
                estado.className = "urgente";
            }

            let accion = document.createElement("td");

            let boton = document.createElement("button");
            boton.textContent = "Eliminar";
            boton.className = "eliminar";

            boton.addEventListener("click", function() {

                mantenimientos.splice(indice, 1);

                mostrarMantenimientos();

            });

            accion.appendChild(boton);

            fila.appendChild(componente);
            fila.appendChild(horas);
            fila.appendChild(estado);
            fila.appendChild(accion);

            tabla.appendChild(fila);

        });
    }

    document.getElementById("totalMantenimiento").textContent =
        mantenimientos.length;
}


document.getElementById("formMantenimiento").addEventListener("submit", function(event) {

    event.preventDefault();

    let componente = document.getElementById("componente").value.trim();

    let horas = parseFloat(document.getElementById("horas").value);

    let estado = document.getElementById("estado").value;

    if (componente === "" || !Number.isFinite(horas) || horas < 0 || estado === "") {

        alert("Error: revisa los datos del mantenimiento.");

    } else {

        let nuevoRegistro = {
            componente: componente,
            horas: horas,
            estado: estado
        };

        mantenimientos.push(nuevoRegistro);

        mostrarMantenimientos();

        document.getElementById("formMantenimiento").reset();

    }

});


// ==========================================
// MODULO 3: VIENTO Y OSCILACION
// ==========================================

function analizarViento(mediciones) {

    let suma = 0;
    let maximo = mediciones[0];

    for (let i = 0; i < mediciones.length; i++) {

        suma = suma + mediciones[i];

        if (mediciones[i] > maximo) {

            maximo = mediciones[i];

        }
    }

    let promedio = suma / mediciones.length;

    let clasificacion;

    if (promedio < 20) {

        clasificacion = "Baja";

    } else if (promedio <= 40) {

        clasificacion = "Moderada";

    } else {

        clasificacion = "Alta";

    }

    return {
        promedio: promedio,
        maximo: maximo,
        clasificacion: clasificacion
    };
}


document.getElementById("formViento").addEventListener("submit", function(event) {

    event.preventDefault();

    let mediciones = [];

    for (let i = 1; i <= 5; i++) {

        let valor = parseFloat(document.getElementById("viento" + i).value);

        if (!Number.isFinite(valor) || valor < 0) {

            let resultado = document.getElementById("resultadoViento");

            resultado.textContent = "Error: ingresa cinco valores numéricos iguales o mayores que cero.";

            resultado.className = "resultado error";

            return;
        }

        mediciones.push(valor);

    }

    let datos = analizarViento(mediciones);

    let resultado = document.getElementById("resultadoViento");

    resultado.textContent =
        "Promedio: " + datos.promedio.toFixed(2) + " km/h. " +
        "Máximo: " + datos.maximo + " km/h. " +
        "Clasificación simulada: " + datos.clasificacion + ".";

    if (datos.clasificacion === "Alta") {

        resultado.className = "resultado error";

    } else {

        resultado.className = "resultado exito";

    }

    document.getElementById("estadoViento").textContent =
        datos.clasificacion;

});


// ==========================================
// MODULO 4: SENSORES
// ==========================================

// Expresion regular para el codigo del sensor

let patronSensor = /^SEN-\d{3}$/;


function mostrarSensores() {

    let tabla = document.getElementById("tablaSensores");

    tabla.textContent = "";

    if (sensores.length === 0) {

        let fila = document.createElement("tr");
        let celda = document.createElement("td");

        celda.colSpan = 3;
        celda.textContent = "No hay sensores registrados.";

        fila.appendChild(celda);
        tabla.appendChild(fila);

    } else {

        sensores.forEach(function(sensor) {

            let fila = document.createElement("tr");

            let codigo = document.createElement("td");
            codigo.textContent = sensor.codigo;

            let tipo = document.createElement("td");
            tipo.textContent = sensor.tipo;

            let lectura = document.createElement("td");
            lectura.textContent = sensor.lectura;

            fila.appendChild(codigo);
            fila.appendChild(tipo);
            fila.appendChild(lectura);

            tabla.appendChild(fila);

        });
    }

    document.getElementById("totalSensores").textContent =
        sensores.length;
}


document.getElementById("formSensor").addEventListener("submit", function(event) {

    event.preventDefault();

    let codigo = document.getElementById("codigoSensor").value.trim();

    let tipo = document.getElementById("tipoSensor").value;

    let lecturaTexto = document.getElementById("lecturaSensor").value.trim();

    let lectura = Number(lecturaTexto);

    let resultado = document.getElementById("resultadoSensor");

    // Validar campos vacios

    if (codigo === "" || tipo === "" || lecturaTexto === "") {

        resultado.textContent = "Error: todos los campos son obligatorios.";

        resultado.className = "resultado error";

        return;
    }

    // Validar el formato del codigo

    if (!patronSensor.test(codigo)) {

        resultado.textContent =
            "Error: el codigo debe tener el formato SEN-001.";

        resultado.className = "resultado error";

        return;
    }

    // Validar que la lectura sea numerica

    if (!Number.isFinite(lectura) || lectura < 0) {

        resultado.textContent =
            "Error: la lectura debe ser un numero mayor o igual a cero.";

        resultado.className = "resultado error";

        return;
    }

    // Evitar codigos repetidos

    let repetido = sensores.some(function(sensor) {
        return sensor.codigo === codigo;
    });

    if (repetido) {

        resultado.textContent = "Error: este codigo de sensor ya existe.";

        resultado.className = "resultado error";

        return;
    }

    // Crear el objeto

    let nuevoSensor = {
        codigo: codigo,
        tipo: tipo,
        lectura: lectura
    };

    sensores.push(nuevoSensor);

    mostrarSensores();

    resultado.textContent =
        "Sensor " + codigo + " registrado correctamente.";

    resultado.className = "resultado exito";

    document.getElementById("formSensor").reset();

});