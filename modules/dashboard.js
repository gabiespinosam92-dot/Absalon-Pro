/* ==========================================================
   ABSALON PRO
   modules/dashboard.js
   Sprint 9.0 - Caja del Mes: ÚNICAMENTE Mano de Obra
========================================================== */
import { getAll } from "./storage.js";

class Dashboard {
    constructor() {
        this.clientes = [];
        this.presupuestos = [];
    }

    async load() {
        this.workspace = document.getElementById("workspace");
        
        this.clientes = await getAll("clientes") || [];
        this.presupuestos = await getAll("presupuestos") || [];
        this.plantillasGarantias = await getAll("garantias") || [];

        await this.render();
    }

    async render() {
        this.workspace = document.getElementById("workspace");
        if (!this.workspace) return;

        const totalClientes = this.clientes.length;

        /* =====================================================
           1. GANANCIA REAL ($$$): SUMA SÓLO MANO DE OBRA
        ===================================================== */
        const totalTerminadosManoObra = this.presupuestos
            .filter(p => {
                const estadoNorm = String(p.estado || "").toLowerCase().trim();
                return estadoNorm === "finalizado";
            })
            .reduce((suma, p) => {
                // Sumamos únicamente los ítems dentro del array de mano de obra
                const manoObraTotal = (p.manoObraItems || []).reduce((sub, item) => {
                    const cant = Number(item.cantidad || 1);
                    const precio = Number(item.precio || item.valor || 0);
                    return sub + (cant * precio);
                }, 0);
                return suma + manoObraTotal;
            }, 0);

        /* =====================================================
           2. RESUMEN OPERATIVO DE OBRAS REAL
        ===================================================== */
        const enEjecucionCount = this.presupuestos.filter(p => {
            const estadoNorm = String(p.estado || "").toLowerCase().trim();
            return estadoNorm === "aprobado";
        }).length;

        const garantiasVigentesCount = this.presupuestos.filter(p => {
            const estadoNorm = String(p.estado || "").toLowerCase().trim();
            return estadoNorm === "finalizado";
        }).length;

        /* =====================================================
           3. PROGRAMADOS DE LA SEMANA
        ===================================================== */
        const obrasAgendadas = JSON.parse(localStorage.getItem("agenda_obras")) || [];
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        const sieteDiasDespues = new Date();
        sieteDiasDespues.setDate(hoy.getDate() + 7);
        sieteDiasDespues.setHours(23, 59, 59, 999);

        const programadosSemanaCount = obrasAgendadas.filter(o => {
            if (!o.fecha) return false;
            const parts = o.fecha.split("-");
            if (parts.length !== 3) return false;
            const fechaObra = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
            return fechaObra >= hoy && fechaObra <= sieteDiasDespues;
        }).length;

        // Renderizado en tu panel de control
        this.workspace.innerHTML = `
        <div class="card" style="border-left: 5px solid #104E2E;">
            <h2>👋 ¡Buen día, Gabriel!</h2>
            <p class="text-muted" style="text-transform: capitalize; font-size: 0.9rem;">${new Date().toLocaleDateString("es-AR", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div class="grid-dashboard" style="margin-top: 15px;">
            <div class="dashboard-card" style="border-left:4px solid var(--primary);">
                <h3>👥 Clientes Activos</h3>
                <span style="font-size:1.8rem; font-weight:bold; color:var(--text);">${totalClientes}</span>
            </div>
            <div class="dashboard-card" style="border-left:4px solid #104E2E;">
                <h3>💰 Caja del Mes (Mano de Obra)</h3>
                <span style="font-size:1.5rem; font-weight:bold; color:var(--text);">$ ${totalTerminadosManoObra.toLocaleString("es-AR", { maximumFractionDigits: 0 })}</span>
            </div>
        </div>

        <div class="card mt-3">
            <h3 style="display: flex; align-items: center; gap: 8px; color: #104E2E; margin-bottom: 5px;">📊 Resumen Operativo de Obras</h3>
            <p class="text-muted" style="font-size:0.85rem; margin-bottom: 15px;">Sincronizado en tiempo real con tus órdenes de servicio.</p>
            
            <div style="font-family: monospace; font-size: 1.1rem; line-height: 2; background: rgba(0,0,0,0.15); padding: 15px; border-radius: 8px; border: 1px solid var(--border);">
                <p style="margin: 0; display: flex; justify-content: space-between;">
                    <span>🛠 Trabajos en Ejecución (Aprobados)</span>
                    <span style="color: #e67e22; font-weight: bold;">${enEjecucionCount.toString().padStart(2, '0')}</span>
                </p>
                <p style="margin: 0; display: flex; justify-content: space-between;">
                    <span>📅 Programados de la Semana......</span>
                    <span style="color: #9b59b6; font-weight: bold;">${programadosSemanaCount.toString().padStart(2, '0')}</span>
                </p>
                <p style="margin: 0; display: flex; justify-content: space-between;">
                    <span>🛡 Obras Entregadas (Con Garantía)</span>
                    <span style="color: #f1c40f; font-weight: bold;">${garantiasVigentesCount.toString().padStart(2, '0')}</span>
                </p>
            </div>
        </div>

        <div class="card mt-3">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="color: #104E2E; font-size: 1.1rem; margin: 0; display: flex; align-items: center; gap: 8px;">
                    📅 Trabajos Programados (Próximas Salidas)
                </h3>
                <button id="btnVerAgendaCompleta" style="background: none; border: none; color: #104E2E; font-weight: bold; cursor: pointer; font-size: 0.85rem;">
                    Ver Agenda Completa →
                </button>
            </div>
            <div id="widgetAgendaDashboard" style="display: flex; flex-direction: column; gap: 10px;">
                <p class="text-muted" style="text-align:center; padding:15px;">Cargando cronograma...</p>
            </div>
        </div>

        <div class="card mt-3" style="margin-bottom: 80px;">
            <h3>⏰ Centro de Actividad (Seguimiento de Clientes)</h3>
            <p class="text-muted" style="margin-bottom:15px; font-size: 0.85rem;">Fechas de alerta agendadas para definir presupuestos pendientes:</p>
            <div id="agendaContenedor">
                <p class="text-muted" style="text-align:center; padding:15px;">Sin alertas comerciales pendientes.</p>
            </div>
        </div>
        `;

        this.renderAgendaAlertas();
        this.renderWidgetAgenda(obrasAgendadas); 
    }

    renderAgendaAlertas() {
        const contenedor = document.getElementById("agendaContenedor");
        if (!contenedor) return;

        const conSeguimiento = this.presupuestos.filter(p => p.fechaSeguimiento);
        if (conSeguimiento.length === 0) {
            contenedor.innerHTML = `<p class="text-muted" style="text-align:center; padding:15px;">No registrás ninguna alerta de seguimiento para este período.</p>`;
            return;
        }

        conSeguimiento.sort((a, b) => new Date(a.fechaSeguimiento) - new Date(b.fechaSeguimiento));

        let html = "";
        conSeguimiento.forEach(p => {
            let nombreCliente = p.cliente;
            if (typeof p.cliente === "number" || !isNaN(p.cliente)) {
                const cliObj = this.clientes.find(c => Number(c.id) === Number(p.cliente));
                if (cliObj) nombreCliente = cliObj.nombre;
            }

            html += `
            <div class="flex-between py-2 border-bottom" style="gap:10px; background: rgba(255,255,255,0.01); margin-bottom:5px; padding:8px; border-radius:6px;">
                <div>
                    <strong>🔔 Contactar a: ${nombreCliente || "Cliente Registrado"}</strong><br>
                    <small class="text-muted">Orden N° ${p.numero || p.id} | Programado para: ${p.fechaSeguimiento.split("-").reverse().join("/")}</small>
                </div>
                <button class="btn-secondary btnAbrirAgenda" data-id="${p.id}" style="padding:4px 10px; font-size:0.85rem; cursor:pointer; height:fit-content;">🔍 Ver Orden</button>
            </div>
            `;
        });

        contenedor.innerHTML = html;

        document.querySelectorAll(".btnAbrirAgenda").forEach(btn => {
            btn.onclick = async (e) => {
                const idPresupuesto = Number(e.currentTarget.dataset.id);
                const modulo = await import("./presupuestos.js");
                const btnMenuPresupuestos = document.querySelector('[data-view="presupuestos"]');
                if (btnMenuPresupuestos) btnMenuPresupuestos.click();

                setTimeout(async () => {
                    const contenedorPresupuestos = document.getElementById("workspace");
                    if (contenedorPresupuestos) {
                        const instancia = modulo.default || modulo.presupuestos;
                        if (instancia && typeof instancia.load === "function") {
                            await instancia.load(idPresupuesto);
                        }
                    }
                }, 50);
            };
        });
    }

    renderWidgetAgenda(obras) {
        const contenedorWidget = document.getElementById("widgetAgendaDashboard");
        if (!contenedorWidget) return;

        if (obras.length === 0) {
            contenedorWidget.innerHTML = `<p class="text-muted" style="text-align:center; padding:15px;">No hay trabajos programados en tu agenda de obras.</p>`;
            return;
        }

        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        const obrasFuturas = obras
            .filter(o => {
                if (!o.fecha) return false;
                const parts = o.fecha.split("-");
                if (parts.length !== 3) return false;
                const fechaObra = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                return fechaObra >= hoy;
            })
            .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

        if (obrasFuturas.length === 0) {
            contenedorWidget.innerHTML = `<p class="text-muted" style="text-align:center; padding:15px;">No tenés salidas de obras agendadas a partir de hoy.</p>`;
            return;
        }

        const proximas = obrasFuturas.slice(0, 3);

        contenedorWidget.innerHTML = proximas.map(o => {
            let fechaFormateada = "";
            if (o.fecha) {
                const parts = o.fecha.split("-");
                fechaFormateada = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : o.fecha;
            }

            const refPresupuesto = o.presupuestoId && o.presupuestoId !== "manual" && o.presupuestoId !== "Manual"
                ? `(Orden N° ${o.presupuestoId})` 
                : "(Carga Directa)";

            return `
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding: 8px 0; gap: 10px;">
                <div>
                    <strong style="font-size: 0.95rem; color: var(--text);">👤 ${o.cliente}</strong>
                    <span style="display: block; font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">
                        🛠 ${o.especialidad} <span style="color: #104E2E; font-weight: 500;">${refPresupuesto}</span>
                    </span>
                </div>
                <span style="background: #104E2E; color: white; padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: bold; white-space: nowrap;">
                    📅 ${fechaFormateada}
                </span>
            </div>
            `;
        }).join("");

        const btnVerCompleta = document.getElementById("btnVerAgendaCompleta");
        if (btnVerCompleta) {
            btnVerCompleta.onclick = () => {
                const btnAgenda = document.querySelector('[data-view="agenda"]');
                if (btnAgenda) btnAgenda.click();
            };
        }
    }
}

export default new Dashboard();