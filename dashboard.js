/* ==========================================================
   ABSALON PRO
   modules/dashboard.js
   Sprint 8.3 - Dashboard General y Agenda de Seguimiento
   Sprint 8.5 - Actualización de Resumen Operativo Centrado en Obras
========================================================== */
import { getAll } from "./storage.js";

class Dashboard {
    constructor() {
        this.workspace = document.getElementById("workspace");
    }

    async load() {
        this.clientes = await getAll("clientes") || [];
        this.presupuestos = await getAll("presupuestos") || [];
        this.garantias = await getAll("garantias") || [];

        await this.render();
    }

    async render() {
        const totalClientes = this.clientes.length;
        const totalPresupuestos = this.presupuestos.length;

        // Cálculos financieros anteriores
        const aprobados = this.presupuestos.filter(p => p.estado === "Aprobado" || p.estado === "En ejecución").length;
        const pendientes = this.presupuestos.filter(p => p.estado === "Enviado").length;
        const total = this.presupuestos.reduce((s, p) => s + Number(p.total || 0), 0);

        /* =====================================================
           PASO 3: CONTADORES DINÁMICOS PARA RESUMEN DE OBRAS
        ===================================================== */
        const enEjecucionCount = this.presupuestos.filter(p => p.estado === "En ejecución").length;
        const programadosCount = this.presupuestos.filter(p => p.estado === "Programado").length;
        const garantiasCount = this.presupuestos.filter(p => p.estado === "En garantía").length;

        this.workspace.innerHTML = `
        <div class="card">
            <h2>👋 Bienvenido Gabriel</h2>
            <p class="text-muted">${new Date().toLocaleDateString("es-AR", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div class="grid-dashboard">
            <div class="dashboard-card" style="border-left:4px solid var(--primary);">
                <h3>👥 Clientes Activos</h3>
                <span style="font-size:1.8rem; font-weight:bold; color:var(--text);">${totalClientes}</span>
            </div>
            <div class="dashboard-card" style="border-left:4px solid var(--success);">
                <h3>💰 Total Presupuestado</h3>
                <span style="font-size:1.5rem; font-weight:bold; color:var(--text);">$ ${total.toLocaleString("es-AR", { maximumFractionDigits: 0 })}</span>
            </div>
        </div>

        <div class="card mt-3">
            <h3 style="display: flex; align-items: center; gap: 8px;">📊 Resumen Operativo de Obras</h3>
            <p class="text-muted" style="font-size:0.9rem; margin-top:2px;">Estado en tiempo real de los trabajos de taller y obras en la calle.</p>
            
            <div style="font-family: monospace; font-size: 1.1rem; margin-top: 15px; line-height: 2; background: rgba(0,0,0,0.15); padding: 15px; border-radius: 8px; border: 1px solid var(--border);">
                <p style="margin: 0; display: flex; justify-content: space-between;">
                    <span>🛠 Trabajos en ejecución.....</span>
                    <span style="color: #e67e22; font-weight: bold;">${enEjecucionCount}</span>
                </p>
                <p style="margin: 0; display: flex; justify-content: space-between;">
                    <span>📅 Programados...............</span>
                    <span style="color: #9b59b6; font-weight: bold;">${programadosCount}</span>
                </p>
                <p style="margin: 0; display: flex; justify-content: space-between;">
                    <span>🛡 Garantías.................</span>
                    <span style="color: #f1c40f; font-weight: bold;">${garantiasCount}</span>
                </p>
            </div>
        </div>

        <div class="card mt-3">
            <h3>⏰ Centro de Actividad (Próximos Alertas)</h3>
            <p class="text-muted" style="margin-bottom:15px;">Listado automático de órdenes con alertas de seguimiento agendadas para el mes actual:</p>
            <div id="agendaContenedor">
                </div>
        </div>
        `;

        this.renderAgenda();
    }

    renderAgenda() {
        const contenedor = document.getElementById("agendaContenedor");
        if (!contenedor) return;

        // Filtrar presupuestos que tengan fecha de seguimiento activa
        const conSeguimiento = this.presupuestos.filter(p => p.fechaSeguimiento);

        if (conSeguimiento.length === 0) {
            contenedor.innerHTML = `<p class="text-muted" style="text-align:center; padding:15px;">No registrás ninguna alerta de seguimiento para este período.</p>`;
            return;
        }

        // Ordenamos por fecha de alerta más próxima
        conSeguimiento.sort((a, b) => new Date(a.fechaSeguimiento) - new Date(b.fechaSeguimiento));

        let html = "";
        conSeguimiento.forEach(p => {
            html += `
            <div class="flex-between py-2 border-bottom" style="gap:10px; background: rgba(255,255,255,0.01); margin-bottom:5px; padding:8px; border-radius:6px;">
                <div>
                    <strong>🔔 Obra de: ${p.cliente}</strong><br>
                    <small class="text-muted">Orden Nº ${p.numero} | Alerta: ${p.fechaSeguimiento.split("-").reverse().join("/")}</small>
                </div>
                <button class="btn-secondary btnAbrirAgenda" data-id="${p.id}" style="padding:4px 10px; font-size:0.85rem; cursor:pointer; height:fit-content;">🔍 Ver Orden</button>
            </div>
            `;
        });

        contenedor.innerHTML = html;

        /* =====================================================
           LÓGICA DE APERTURA INTEGRADA (EVITA ERRORES DE RUTEO)
        ===================================================== */
        document.querySelectorAll(".btnAbrirAgenda").forEach(btn => {
            btn.onclick = async (e) => {
                const idPresupuesto = Number(e.currentTarget.dataset.id);

                // 1. Importamos el módulo para asegurarnos de que esté disponible
                const modulo = await import("./presupuestos.js");
                
                // 2. Buscamos el botón de presupuestos en el menú lateral de tu App y le hacemos clic para cambiar visualmente de sección
                const btnMenuPresupuestos = document.querySelector('[data-view="presupuestos"]');
                if (btnMenuPresupuestos) {
                    btnMenuPresupuestos.click();
                }

                // 3. Le damos un mini respiro al navegador para que renderice la vista y cargamos el presupuesto por ID
                setTimeout(async () => {
                    const contenedorPresupuestos = document.getElementById("workspace");
                    if (contenedorPresupuestos) {
                        const instancia = new modulo.default();
                        await instancia.load(idPresupuesto);
                    }
                }, 50);
            };
        });
    }
}

export default new Dashboard();