/* ==========================================================
   ABSALON PRO
   modules/asistentes.js
   Sprint 8.6 - Arquitectura del Asistente Técnico
========================================================== */

class Asistentes {

    abrir(categoria) {
        switch(categoria) {
            case "REFRIGERACION":
                this.refrigeracion();
                break;
            case "ELECTRICIDAD":
                this.electricidad();
                break;
            case "CONSTRUCCION EN SECO":
                this.construccion();
                break;
            default:
                alert("Asistente no disponible para esta categoría.");
        }
    }

    refrigeracion() {
        alert("🚧\n\nAsistente de Refrigeración\n\nPróximamente");
    }

    electricidad() {
        alert("🚧\n\nAsistente de Electricidad\n\nPróximamente");
    }

    construccion() {
        alert("🚧\n\nAsistente de Construcción en Seco\n\nPróximamente");
    }
}

export default new Asistentes();