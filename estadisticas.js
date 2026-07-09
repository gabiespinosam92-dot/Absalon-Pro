/* ==========================================================
   ABSALON PRO - modules/estadisticas.js
========================================================== */
import { getAll } from "./storage.js";

class Estadisticas {
    constructor() {
        this.workspace = document.getElementById("workspace");
        this.presupuestos = [];
        this.clientes = [];
        const hoy = new Date();
        const mm = String(hoy.getMonth() + 1).padStart(2, '0');
        this.mesSeleccionado = `${hoy.getFullYear()}-${mm}`;
    }

    // 🌟 ESTA ES LA FUNCIÓN QUE TU APP.JS BUSCA Y NECESITA
    async iniciar() {
        await this.load();
    }

    async load() {
        try {
            this.presupuestos = await getAll("presupuestos") || [];
            this.clientes = await getAll("clientes") || [];
        } catch (err) {
            console.error("Error al cargar almacenes en estadísticas:", err);
        }
        await this.render();
    }

    async render() {
        if (!this.workspace) return;

        this.workspace.innerHTML = `
            <div style="padding: 20px; font-family: sans-serif; background: #f8fafc; min-height: 100vh;">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; margin-bottom: 25px;">
                    <h2 style="color: #104E2E; margin: 0; font-size: 22px; font-weight: bold;">📊 Panel Estadístico Unificado</h2>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <label style="font-size: 14px; font-weight: bold; color: #475569;">Período Analítico:</label>
                        <input type="month" id="filtroMesEstadisticas" value="${this.mesSeleccionado}" 
                            style="padding: 6px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; color: #334155;">
                    </div>
                </div>

                <div style="display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 25px;">
                    <div style="flex: 1; min-width: 320px; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                        <h3 style="color: #104E2E; margin-top: 0; margin-bottom: 15px; font-size: 16px; font-weight: bold; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">💰 Control Financiero Mensual</h3>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                            <div style="background: #f1f5f9; padding: 12px; border-radius: 6px; grid-column: span 2; border-left: 4px solid #104E2E;">
                                <span style="font-size: 11px; color: #64748b; font-weight: bold; display: block;">GANANCIAS TOTALES (100%)</span>
                                <span id="finTotal" style="font-size: 20px; font-weight: bold; color: #0f172a;">$ 0,00</span>
                            </div>
                            <div style="background: #ecfdf5; padding: 12px; border-radius: 6px; border-left: 4px solid #10b981;">
                                <span style="font-size: 11px; color: #047857; font-weight: bold; display: block;">GANANCIA NETA (78%)</span>
                                <span id="finNeta" style="font-size: 15px; font-weight: bold; color: #065f46;">$ 0,00</span>
                            </div>
                            <div style="background: #fef3c7; padding: 12px; border-radius: 6px; border-left: 4px solid #d97706;">
                                <span style="font-size: 11px; color: #b45309; font-weight: bold; display: block;">AHORRO OBLIGATORIO (10%)</span>
                                <span id="finAhorro" style="font-size: 15px; font-weight: bold; color: #92400e;">$ 0,00</span>
                            </div>
                            <div style="background: #eff6ff; padding: 12px; border-radius: 6px; border-left: 4px solid #3b82f6; grid-column: span 2;">
                                <span style="font-size: 11px; color: #1d4ed8; font-weight: bold; display: block;">FONDO INVERSIÓN / MATERIALES (12%)</span>
                                <span id="finInversion" style="font-size: 15px; font-weight: bold; color: #1e40af;">$ 0,00</span>
                            </div>
                        </div>
                    </div>

                    <div style="flex: 1; min-width: 320px; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); display: flex; flex-direction: column;">
                        <h3 style="color: #104E2E; margin-top: 0; margin-bottom: 12px; font-size: 16px; font-weight: bold; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">👥 Gestión y Ficha de Clientes</h3>
                        <div style="background: #f8fafc; padding: 10px; border-radius: 6px; margin-bottom: 12px; text-align: center; border: 1px dashed #cbd5e1;">
                            <span style="font-size: 13px; color: #475569;">Número Total de Clientes Activos: <strong id="totalClientesBadge" style="color: #104E2E; font-size: 16px;">0</strong></span>
                        </div>
                        <input type="text" id="busquedaClientesEst" placeholder="🔍 Buscar cliente..." style="width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; box-sizing: border-box; margin-bottom: 12px;">
                        <div id="fichaDetalleCliente" style="display: none; background: #fffbeb; border: 1px solid #fef3c7; padding: 12px; border-radius: 6px; margin-bottom: 12px; font-size: 13px; color: #334155;">
                            <h4 id="fichaNombre" style="margin: 0 0 6px 0; color: #b45309; font-size: 14px; font-weight: bold;">-</h4>
                            <p style="margin: 2px 0;">📊 Cantidad de Presupuestos: <strong id="fichaCant">0</strong></p>
                            <p style="margin: 2px 0;">📅 Última Interacción: <strong id="fichaUltima">S/D</strong></p>
                        </div>
                        <div id="listaClientesEst" style="flex: 1; max-height: 150px; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 13px;"></div>
                    </div>
                </div>
            </div>
        `;

        const inputFiltro = document.getElementById("filtroMesEstadisticas");
        if (inputFiltro) {
            inputFiltro.onchange = (e) => {
                this.mesSeleccionado = e.target.value;
                this.calcularFinanzasMensuales();
            };
        }

        const inputBusqueda = document.getElementById("busquedaClientesEst");
        if (inputBusqueda) {
            inputBusqueda.oninput = () => {
                this.renderizarListaClientes();
            };
        }

        this.calcularFinanzasMensuales();
        this.renderizarListaClientes();
    }

    calcularFinanzasMensuales() {
        let dineroAprobadosTotal = 0;
        const [anoFiltro, mesFiltro] = this.mesSeleccionado.split("-");

        const aprobados = this.presupuestos.filter(p => {
            if (!p.fecha) return false;
            const est = String(p.estado || '').toLowerCase().trim();
            const esValido = (est === "finalizado" || est === "terminado" || est === "t" || est === "aceptado");
            if (!esValido) return false;

            if (p.fecha.includes("/")) {
                const [d, m, a] = p.fecha.split("/");
                return a === anoFiltro && m === mesFiltro;
            }
            return p.fecha.startsWith(this.mesSeleccionado);
        });

        aprobados.forEach(p => {
            let valorBruto = p.totalGeneral || p.total || p.monto || p.totalPresupuesto || 0;
            if (typeof valorBruto === "string") {
                valorBruto = valorBruto.replace(/\$/g, "").replace(/\s/g, "");
                if (valorBruto.includes(",") && valorBruto.includes(".")) {
                    valorBruto = valorBruto.replace(/\./g, "").replace(",", ".");
                } else if (valorBruto.includes(",")) {
                    valorBruto = valorBruto.replace(",", ".");
                }
            }
            const num = parseFloat(valorBruto);
            if (!isNaN(num)) dineroAprobadosTotal += num;
        });

        const ahorro = dineroAprobadosTotal * 0.10;
        const inversion = dineroAprobadosTotal * 0.12;
        const neta = dineroAprobadosTotal - ahorro - inversion;

        const fmt = (v) => v.toLocaleString("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 2 });

        if (document.getElementById("finTotal")) document.getElementById("finTotal").innerText = fmt(dineroAprobadosTotal);
        if (document.getElementById("finNeta")) document.getElementById("finNeta").innerText = fmt(neta);
        if (document.getElementById("finAhorro")) document.getElementById("finAhorro").innerText = fmt(ahorro);
        if (document.getElementById("finInversion")) document.getElementById("finInversion").innerText = fmt(inversion);
    }

    renderizarListaClientes() {
        const inputBusqueda = document.getElementById("busquedaClientesEst");
        const busqueda = inputBusqueda ? inputBusqueda.value.toLowerCase().trim() : "";
        const contenedor = document.getElementById("listaClientesEst");
        if (!contenedor) return;
        contenedor.innerHTML = "";

        if (document.getElementById("totalClientesBadge")) {
            document.getElementById("totalClientesBadge").innerText = this.clientes.length;
        }

        const filtrados = this.clientes.filter(c => c.nombre && c.nombre.toLowerCase().includes(busqueda));

        filtrados.forEach(c => {
            const item = document.createElement("div");
            item.style = "padding: 8px 12px; border-bottom: 1px solid #f1f5f9; cursor: pointer; font-weight: bold; color: #334155;";
            item.innerText = c.nombre;
            item.onclick = () => this.mostrarFichaCliente(c);
            contenedor.appendChild(item);
        });
    }

    mostrarFichaCliente(cliente) {
        const ficha = document.getElementById("fichaDetalleCliente");
        if (!ficha) return;

        const pCliente = this.presupuestos.filter(p => p.clienteId === cliente.id || p.cliente === cliente.id);
        let ult = "S/D";
        if (pCliente.length > 0) {
            const f = pCliente.map(p => p.fecha).filter(x => !!x).sort((a, b) => b.localeCompare(a));
            if (f.length > 0) ult = f[0];
        }

        if (document.getElementById("fichaNombre")) document.getElementById("fichaNombre").innerText = `👤 ${cliente.nombre}`;
        if (document.getElementById("fichaCant")) document.getElementById("fichaCant").innerText = pCliente.length;
        if (document.getElementById("fichaUltima")) document.getElementById("fichaUltima").innerText = ult;
        ficha.style.display = "block";
    }
}

export default new Estadisticas();