/* ==========================================================
   ABSALON PRO - modules/historial.js
========================================================== */
import { getAll, getById, save, update } from "./storage.js";

class Historial {
    constructor() {
        this.workspace = document.getElementById("workspace");
        this.presupuestos = [];
        this.clientes = [];
        const hoy = new Date();
        const mm = String(hoy.getMonth() + 1).padStart(2, '0');
        this.mesSeleccionado = `${hoy.getFullYear()}-${mm}`;
    }

    async load() {
        try {
            this.presupuestos = await getAll("presupuestos") || [];
            this.clientes = await getAll("clientes") || [];
        } catch (err) {
            console.error("Error al cargar datos en historial:", err);
        }
        await this.render();
    }

    async verPresupuesto(id) {
        const btnMenuPresupuestos = document.querySelector('[data-view="presupuestos"]');
        if (btnMenuPresupuestos) {
            btnMenuPresupuestos.click();
        } else {
            window.location.hash = "#presupuestos";
        }

        const presupuestoModule = await import("./presupuestos.js");
        const viewPresupuesto = presupuestoModule.default;
        await viewPresupuesto.load(Number(id));
    }

    async eliminarPresupuesto(id) {
        if (confirm(`¿Estás completamente seguro de que querés eliminar permanentemente el Presupuesto N° ${id}?`)) {
            try {
                const listDB = await indexedDB.databases();
                let dbName = "AbsalonProDB";
                if (listDB && listDB.length > 0) dbName = listDB[0].name;

                const dbRequest = indexedDB.open(dbName);
                dbRequest.onsuccess = (event) => {
                    const db = event.target.result;
                    const nombreStore = db.objectStoreNames.contains("presupuestos") ? "presupuestos" : db.objectStoreNames[0];

                    const tx = db.transaction(nombreStore, "readwrite");
                    const store = tx.objectStore(nombreStore);
                    store.delete(Number(id));

                    tx.oncomplete = async () => {
                        alert("🗑️ Presupuesto eliminado del registro.");
                        // Recargar datos locales y refrescar interfaz
                        this.presupuestos = this.presupuestos.filter(p => p.id != id);
                        this.procesarYRenderizar();
                    };
                };
            } catch (err) {
                console.error("Error al borrar presupuesto:", err);
            }
        }
    }

    async render() {
        if (!this.workspace) return;

        this.workspace.innerHTML = `
            <div style="padding: 20px; font-family: sans-serif; background: #f8fafc; min-height: 100vh;">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; margin-bottom: 20px;">
                    <h2 style="color: #104E2E; margin: 0; font-size: 22px; font-weight: bold;">📜 Historial General</h2>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <label style="font-size: 14px; font-weight: bold; color: #475569;">Filtrar Mes:</label>
                        <input type="month" id="filtroMesHistorial" value="${this.mesSeleccionado}" 
                            style="padding: 6px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; color: #334155;">
                    </div>
                </div>

                <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 20px;">
                    <h3 style="color: #334155; margin-top: 0; margin-bottom: 15px; font-size: 16px;">📊 Resumen de Montos Mensuales</h3>
                    <div style="display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 40px;">
                        <div style="position: relative; width: 160px; height: 160px;">
                            <canvas id="canvasHistorialMes" width="160" height="160"></canvas>
                        </div>
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; min-width: 280px; flex: 1;">
                            <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 12px; border-radius: 6px; text-align: center;">
                                <span style="font-size: 12px; color: #991b1b; font-weight: bold; display: block;">BORRADORES</span>
                                <span id="txtTotalB" style="font-size: 15px; font-weight: bold; color: #ef4444;">$ 0,00</span>
                            </div>
                            <div style="background: #fffbeb; border-left: 4px solid #ffc107; padding: 12px; border-radius: 6px; text-align: center;">
                                <span style="font-size: 12px; color: #92400e; font-weight: bold; display: block;">ENVIADOS</span>
                                <span id="txtTotalE" style="font-size: 15px; font-weight: bold; color: #b45309;">$ 0,00</span>
                            </div>
                            <div style="background: #f0fdf4; border-left: 4px solid #4ade80; padding: 12px; border-radius: 6px; text-align: center;">
                                <span style="font-size: 12px; color: #166534; font-weight: bold; display: block;">TERMINADOS</span>
                                <span id="txtTotalT" style="font-size: 15px; font-weight: bold; color: #16a34a;">$ 0,00</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 20px;">
                    <input type="text" id="buscadorHistorial" placeholder="🔍 Buscar por nombre de cliente..." 
                        style="width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; box-sizing: border-box;">
                </div>

                <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <h3 style="color: #334155; margin-top: 0; margin-bottom: 12px; font-size: 16px;">📋 Listado de Registros</h3>
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
                            <thead>
                                <tr style="background: #f1f5f9; color: #475569; font-weight: bold; border-bottom: 2px solid #e2e8f0;">
                                    <td style="padding: 10px;">Fecha</td>
                                    <td style="padding: 10px;">Cliente</td>
                                    <td style="padding: 10px;">Total</td>
                                    <td style="padding: 10px;">Estado</td>
                                    <td style="padding: 10px; text-align: center;">Acciones</td>
                                </tr>
                            </thead>
                            <tbody id="tbodyHistorialFiltrado"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        document.getElementById("filtroMesHistorial").onchange = (e) => {
            this.mesSeleccionado = e.target.value;
            this.procesarYRenderizar();
        };

        document.getElementById("buscadorHistorial").oninput = () => {
            this.procesarYRenderizar();
        };

        this.procesarYRenderizar();
    }

    _parseMonto(val) {
        if (val === null || val === undefined) return 0;
        if (typeof val === 'number') return val;
        let str = String(val).replace(/\s/g, '').replace(/\$/g, '');
        if (str.includes(',') && str.includes('.')) {
            if (str.indexOf('.') < str.indexOf(',')) {
                str = str.replace(/\./g, '').replace(',', '.');
            } else {
                str = str.replace(/,/g, '');
            }
        } else if (str.includes(',')) {
            str = str.replace(',', '.');
        }
        const num = parseFloat(str);
        return isNaN(num) ? 0 : num;
    }

    procesarYRenderizar() {
        const busqueda = document.getElementById("buscadorHistorial").value.toLowerCase().trim();
        
        let countB = 0, countE = 0, countT = 0;
        let dineroB = 0, dineroE = 0, dineroT = 0;

        const tbody = document.getElementById("tbodyHistorialFiltrado");
        if (!tbody) return;
        tbody.innerHTML = "";

        const [anoFiltro, mesFiltro] = this.mesSeleccionado.split("-");

        const presupuestosDelMes = this.presupuestos.filter(p => {
            if (!p.fecha) return false;
            if (p.fecha.includes("/")) {
                const [d, m, a] = p.fecha.split("/");
                return a === anoFiltro && m === mesFiltro;
            }
            return p.fecha.startsWith(this.mesSelected || this.mesSeleccionado);
        });

        presupuestosDelMes.forEach(p => {
            const est = String(p.estado || '').toLowerCase().trim();
            const montoNum = this._parseMonto(p.totalGeneral || p.total || 0);

            if (est === "borrador" || est === "b") {
                countB++;
                dineroB += montoNum;
            } else if (est === "enviado" || est === "e") {
                countE++;
                dineroE += montoNum;
            } else if (est === "finalizado" || est === "terminado" || est === "t" || est === "aceptado") {
                countT++;
                dineroT += montoNum;
            }
        });

        const fmt = (v) => v.toLocaleString("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 2 });

        document.getElementById("txtTotalB").innerText = fmt(dineroB);
        document.getElementById("txtTotalE").innerText = fmt(dineroE);
        document.getElementById("txtTotalT").innerText = fmt(dineroT);

        this.dibujarCirculo(countB, countE, countT);

        const filtrados = presupuestosDelMes.filter(p => {
            const clienteIdString = String(p.cliente || '');
            const clienteObj = this.clientes.find(c => String(c.id) === clienteIdString);
            const nombre = clienteObj ? clienteObj.nombre.toLowerCase() : clienteIdString.toLowerCase();
            return nombre.includes(busqueda);
        });

        if (filtrados.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="padding: 15px; text-align: center; color: #94a3b8;">No hay registros para este mes.</td></tr>`;
            return;
        }

        filtrados.forEach(p => {
            const clienteIdString = String(p.cliente || '');
            const clienteObj = this.clientes.find(c => String(c.id) === clienteIdString);
            const nombreCliente = clienteObj ? clienteObj.nombre : (p.cliente || "Sin Nombre");
            
            const est = String(p.estado || '').toLowerCase().trim();
            let badgeBg = "#fee2e2", badgeCc = "#ef4444";
            if (est === "finalizado" || est === "terminado" || est === "t" || est === "aceptado") { badgeBg = "#d1fae5"; badgeCc = "#16a34a"; }
            else if (est === "enviado" || est === "e") { badgeBg = "#fffbeb"; badgeCc = "#b45309"; }

            const totalFinal = this._parseMonto(p.totalGeneral || p.total || 0);

            const fila = document.createElement("tr");
            fila.style.borderBottom = "1px solid #e2e8f0";
            fila.innerHTML = `
                <td style="padding: 10px; color: #475569;">${p.fecha}</td>
                <td style="padding: 10px; font-weight: bold; color: #334155;">${nombreCliente}</td>
                <td style="padding: 10px; font-weight: bold; color: #0f172a;">${fmt(totalFinal)}</td>
                <td style="padding: 10px;"><span style="background: ${badgeBg}; color: ${badgeCc}; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">${p.estado || 'Borrador'}</span></td>
                <td style="padding: 10px; text-align: center;">
                    <button class="btn-ver-presupuesto" data-id="${p.id}" style="background: #104E2E; color: white; border: none; padding: 5px 10px; border-radius: 4px; font-size: 12px; cursor: pointer; font-weight: bold; margin-right: 5px;">👁️ Ver / Editar</button>
                    <button class="btn-eliminar-presupuesto" data-id="${p.id}" style="background: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 4px; font-size: 12px; cursor: pointer; font-weight: bold;">🗑️ Eliminar</button>
                </td>
            `;
            tbody.appendChild(fila);
        });

        this.asignarEventosBotones();
    }

    asignarEventosBotones() {
        document.querySelectorAll(".btn-ver-presupuesto").forEach(btn => {
            btn.onclick = (e) => {
                const id = e.target.getAttribute("data-id");
                this.verPresupuesto(id);
            };
        });

        document.querySelectorAll(".btn-eliminar-presupuesto").forEach(btn => {
            btn.onclick = (e) => {
                const id = e.target.getAttribute("data-id");
                this.eliminarPresupuesto(id);
            };
        });
    }

    dibujarCirculo(b, e, t) {
        const canvas = document.getElementById("canvasHistorialMes");
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        const total = b + e + t;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (total === 0) {
            ctx.beginPath(); ctx.arc(80, 80, 70, 0, 2 * Math.PI); ctx.fillStyle = "#e2e8f0"; ctx.fill();
            return;
        }

        const data = [b, e, t];
        const colors = ["#ef4444", "#ffc107", "#4ade80"];
        let startAngle = 0;
        data.forEach((val, idx) => {
            if (val > 0) {
                const slice = (val / total) * 2 * Math.PI;
                ctx.beginPath(); ctx.moveTo(80, 80); ctx.arc(80, 80, 70, startAngle, startAngle + slice);
                ctx.closePath(); ctx.fillStyle = colors[idx]; ctx.fill();
                startAngle += slice;
            }
        });
    }
}

export default new Historial();
