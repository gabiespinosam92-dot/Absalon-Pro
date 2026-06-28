/* ==========================================================
   ABSALON PRO
   modules/construccionSeco.js
   Módulo: Calculador de Materiales para Construcción en Seco
========================================================== */

class ConstruccionSeco {
    constructor() {
        this.workspace = document.getElementById("workspace");
    }

    async load() {
        await this.render();
    }

    async render() {
        this.workspace.innerHTML = `
        <div class="card">
            <h2>🏗 Calculador de Construcción en Seco</h2>
            <p class="text-muted">Ingresá las medidas para calcular automáticamente el catálogo de materiales requeridos.</p>
        </div>

        <div class="card mt-3">
            <h3>📏 Dimensiones de la Estructura</h3>
            <p class="text-muted">Próximamente definiremos los coeficientes para tabiques, cielorrasos y revestimientos.</p>
        </div>
        `;
    }
}

export default new ConstruccionSeco();