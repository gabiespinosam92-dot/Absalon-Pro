/* ==========================================================
   ABSALON PRO
   modules/historial.js
   Sprint 6.7 - Lógica Real de Clonación de Presupuestos
========================================================== */

// PASO 1: Unificamos los imports desde storage.js para no repetir funciones
import { getAll, getById, add, update } from "./storage.js";

/* =====================================================
   FUNCIONES AUXILIARES DE ESTADO
===================================================== */
function iconoEstado(estado){
    switch(estado){
        case "Borrador": return "🟡";
        case "Enviado": return "🔵";
        case "Pendiente": return "orange";
        case "Aprobado": return "🟢";
        case "Rechazado": return "🔴";
        case "Facturado": return "🟣";
        case "Finalizado": return "⚫";
        default: return "white";
    }
}

function colorEstado(estado){
    switch(estado){
        case "Borrador": return "#ffc107";
        case "Enviado": return "#2196F3";
        case "Pendiente": return "#ff9800";
        case "Aprobado": return "#4CAF50";
        case "Rechazado": return "#F44336";
        case "Facturado": return "#9C27B0";
        case "Finalizado": return "#616161";
        default: return "#999";
    }
}

class Historial {

    constructor() {
        this.workspace = document.getElementById("workspace");
    }

    /* =====================================================
       INICIO
    ===================================================== */
    async load() {
        await this.render();
    }

    /* =====================================================
       ACCIONES DE LA CLASE
    ===================================================== */
    async verPresupuesto(id){
        // 1. Simulamos el clic en la pestaña de presupuestos del menú para cambiar la vista visualmente
        const btnMenuPresupuestos = document.querySelector('[data-view="presupuestos"]');
        if (btnMenuPresupuestos) {
            btnMenuPresupuestos.click();
        } else {
            window.location.hash = "#presupuestos";
        }

        // 2. Importamos dinámicamente el módulo
        const presupuestoModule = await import("./presupuestos.js");

        // 3. Instanciamos la clase y cargamos el ID viejo
        const viewPresupuesto = new presupuestoModule.default();
        await viewPresupuesto.load(id);
    } // 👈 ¡ACÁ ESTABA EL ERROR! Ponemos la llave de cierre que faltaba

    /* =====================================================
       PASO 2: LÓGICA DE DUPLICACIÓN INTEGRADA
    ===================================================== */
    async duplicarPresupuesto(id){
        // Buscamos el original convirtiendo el ID a Número para IndexedDB
        const presupuesto = await getById("presupuestos", Number(id));

        if(!presupuesto){
            alert("Presupuesto no encontrado.");
            return;
        }

        // Creamos la copia exacta reseteando metadatos de control
        const copia = {
            ...presupuesto,
            id: Date.now(),
            numero: Date.now(), // Usamos timestamp temporal como número de presupuesto
            estado: "Borrador",
            fecha: new Date().toISOString().split("T")[0],
            creado: new Date().toISOString(),
            actualizado: new Date().toISOString()
        };

        // Guardamos en la base de datos local
        await add("presupuestos", copia);

        alert("🎉 ¡Presupuesto duplicado correctamente con estado Borrador!");

        // Refrescamos la pantalla para ver la nueva tarjeta al instante
        await this.render();
    }

    async cambiarEstado(id, estado){
        const presupuestos = await getAll("presupuestos");
        const presupuesto = presupuestos.find(p => p.id == id);

        if(!presupuesto) return;

        presupuesto.estado = estado;
        presupuesto.actualizado = new Date().toISOString();

        await update("presupuestos", presupuesto);
        this.render();
    }

    /* =====================================================
       RENDER DE LA VISTA
    ===================================================== */
    async render() {
        const presupuestos = await getAll("presupuestos");

        let html = `
        <div class="card">
            <h2>📜 Historial General</h2>
            <p class="text-muted">Gestioná, modificá estados o cloná presupuestos en tiempo real.</p>
        </div>
        `;

        if (presupuestos.length === 0) {
            html += `
            <div class="card text-center py-5 mt-2">
                <p class="text-muted">No se encontraron presupuestos en el historial.</p>
            </div>
            `;
            this.workspace.innerHTML = html;
            return;
        }

        // Agrupar por cliente
        const grupos = {};
        presupuestos.forEach(p => {
            const idCliente = p.cliente || "Sin Cliente";
            if (!grupos[idCliente]) {
                grupos[idCliente] = {
                    nombre: idCliente,
                    presupuestos: []
                };
            }
            grupos[idCliente].presupuestos.push(p);
        });

        // Armar tarjetas HTML
        Object.values(grupos).forEach(cliente => {
            html += `
            <div class="card mt-3" style="border-left: 5px solid var(--primary);">
                <h2 style="margin-bottom: 15px;">
                    👤 ${cliente.nombre}
                </h2>
            `;

            cliente.presupuestos.forEach(p => {
                const estadoActual = p.estado || "Borrador";

                html += `
                <div class="card mt-2" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <strong>
                            📄 Presupuesto Nº ${p.numero}
                        </strong>
                        
                        <select class="estadoSelect" data-id="${p.id}" style="background:${colorEstado(estadoActual)}; color:white; border:none; border-radius:20px; padding:6px 10px; font-weight:bold; cursor:pointer; outline: none;">
                            <option value="Borrador" ${estadoActual === "Borrador" ? "selected" : ""}>🟡 Borrador</option>
                            <option value="Enviado" ${estadoActual === "Enviado" ? "selected" : ""}>🔵 Enviado</option>
                            <option value="Pendiente" ${estadoActual === "Pendiente" ? "selected" : ""}>🟠 Pendiente</option>
                            <option value="Aprobado" ${estadoActual === "Aprobado" ? "selected" : ""}>🟢 Aprobado</option>
                            <option value="Rechazado" ${estadoActual === "Rechazado" ? "selected" : ""}>🔴 Rechazado</option>
                            <option value="Facturado" ${estadoActual === "Facturado" ? "selected" : ""}>🟣 Facturado</option>
                            <option value="Finalizado" ${estadoActual === "Finalizado" ? "selected" : ""}>⚫ Finalizado</option>
                        </select>
                    </div>
                    <p class="mt-2 text-muted" style="font-size: 0.9rem; margin-bottom: 4px;">
                        📅 ${p.fecha}
                    </p>
                    <h3 style="color: var(--primary); margin: 0; font-size: 1.3rem;">
                        $ ${Number(p.total || 0).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                    </h3>

                    <div style="display:flex; gap:10px; margin-top:15px;">
                        <button class="btn btnVer" data-id="${p.id}" style="padding: 6px 15px; font-size: 0.9rem; cursor: pointer;">
                            👁 Ver
                        </button>
                        <button class="btn btn-secondary btnDuplicar" data-id="${p.id}" style="padding: 6px 15px; font-size: 0.9rem; cursor: pointer;">
                            📄 Duplicar
                        </button>
                    </div>
                </div>
                `;
            });

            html += `
            </div>
            `;
        });

        this.workspace.innerHTML = html;

        // Manejadores de eventos de cambio de estado
        document.querySelectorAll(".estadoSelect").forEach(select => {
            select.onchange = (e) => {
                this.cambiarEstado(e.target.dataset.id, e.target.value);
            };
        });

        // Manejadores de botones (Ver)
        document.querySelectorAll(".btnVer").forEach(btn => {
            btn.onclick = (e) => {
                const id = e.target.closest(".btnVer").dataset.id;
                this.verPresupuesto(id);
            };
        });

        // Manejadores de botones (Duplicar)
        document.querySelectorAll(".btnDuplicar").forEach(btn => {
            btn.onclick = (e) => {
                const id = e.target.closest(".btnDuplicar").dataset.id;
                this.duplicarPresupuesto(id);
            };
        });
    }
}

export default new Historial();