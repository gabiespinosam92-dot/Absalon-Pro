/* ==========================================================
   ABSALON PRO - modules/estadisticas.js
   Sprint 9.2: Desglose de Mano de Obra (T- / Finalizados)
========================================================== */
import { getAll } from "./storage.js";

class Estadisticas {
    constructor() {
        this.presupuestos = [];
        this.clientes = [];
        const hoy = new Date();
        const mm = String(hoy.getMonth() + 1).padStart(2, '0');
        this.mesSeleccionado = `${hoy.getFullYear()}-${mm}`;
    }

    async iniciar() {
        await this.load();
    }

    async load() {
        this.workspace = document.getElementById("workspace");
        try {
            this.presupuestos = await getAll("presupuestos") || [];
            this.clientes = await getAll("clientes") || [];
        } catch (err) {
            console.error("Error al cargar almacenes en estadísticas:", err);
        }
        await this.render();
    }

    async render() {
        this.workspace = document.getElementById("workspace");
        if (!this.workspace) return;

        this.workspace.innerHTML = `
            <div style="padding: 20px; font-family: sans-serif; background: #f8fafc; min-height: 100vh;">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; margin-bottom: 20px;">
                    <h2 style="color: #104E2E; margin: 0; font-size: 22px; font-weight: bold;">📊 Estadísticas y Control Financiero</h2>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <label style="font-size: 14px; font-weight: bold; color: #475569;">Mes de Análisis:</label>
                        <input type="month" id="filtroMesEstadisticas" value="${this.mesSeleccionado}" 
                            style="padding: 6px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; color: #334155;">
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px; margin-bottom: 25px;">
                    <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-left: 4px solid #104E2E;">
                        <span style="font-size: 11px; color: #64748b; font-weight: bold; display: block; margin-bottom: 5px;">ACTIVIDAD MENSUAL COMPLETA</span>
                        <span id="statMontoCompleto" style="font-size: 20px; font-weight: bold; color: #1e293b;">$ 0,00</span>
                        <small style="color: #64748b; font-size: 0.75rem;">Monto total facturado (con materiales)</small>
                    </div>
                    <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-left: 4px solid #3b82f6;">
                        <span style="font-size: 11px; color: #64748b; font-weight: bold; display: block; margin-bottom: 5px;">PROMEDIO TICKET COMPLETO</span>
                        <span id="statPromedio" style="font-size: 20px; font-weight: bold; color: #1e293b;">$ 0,00</span>
                    </div>
                    <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-left: 4px solid #10b981;">
                        <span style="font-size: 11px; color: #64748b; font-weight: bold; display: block; margin-bottom: 5px;">TASA ACEPTACIÓN / FINALIZADOS</span>
                        <span id="statConversion" style="font-size: 20px; font-weight: bold; color: #1e293b;">0% (0)</span>
                    </div>
                </div>

                <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 25px; border-top: 4px solid #104E2E;">
                    <h3 style="color: #104E2E; margin-top: 0; margin-bottom: 5px; font-size: 18px; display: flex; align-items: center; gap: 8px;">
                        💰 Control Financiero (Distribución de Mano de Obra)
                    </h3>
                    <p style="color: #64748b; font-size: 13px; margin-bottom: 15px;">
                        Calculado exclusivamente sobre la ganancia líquida de tu mano de obra de los trabajos finalizados del mes (<strong id="totalManoObraMes">$ 0,00</strong>).
                    </p>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                        <div style="background: #f8fafc; padding: 15px; border-radius: 6px; border: 1px dashed #cbd5e1;">
                            <span style="font-size: 11px; color: #475569; font-weight: bold; display: block; margin-bottom: 5px;">🏠 NECESIDADES BÁSICAS (78%)</span>
                            <span id="finNecesidades" style="font-size: 22px; font-weight: bold; color: #334155;">$ 0,00</span>
                            <p style="margin: 5px 0 0 0; font-size: 11px; color: #64748b;">Para tus gastos del día a día.</p>
                        </div>

                        <div style="background: #eff6ff; padding: 15px; border-radius: 6px; border: 1px dashed #bfdbfe;">
                            <span style="font-size: 11px; color: #1e40af; font-weight: bold; display: block; margin-bottom: 5px;">🛠 INVERSIÓN (12%)</span>
                            <span id="finInversion" style="font-size: 22px; font-weight: bold; color: #1d4ed8;">$ 0,00</span>
                            <p style="margin: 5px 0 0 0; font-size: 11px; color: #1e40af;">Herramientas, equipos y capacitación.</p>
                        </div>

                        <div style="background: #f0fdf4; padding: 15px; border-radius: 6px; border: 1px dashed #bbf7d0;">
                            <span style="font-size: 11px; color: #166534; font-weight: bold; display: block; margin-bottom: 5px;">🛡 AHORRO (10%)</span>
                            <span id="finAhorro" style="font-size: 22px; font-weight: bold; color: #16a34a;">$ 0,00</span>
                            <p style="margin: 5px 0 0 0; font-size: 11px; color: #166534;">Fondo de reserva y seguridad personal.</p>
                        </div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 80px;">
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                        <h3 style="color: #334155; margin-top: 0; margin-bottom: 12px; font-size: 16px;">👤 Clientes Operativos</h3>
                        <input type="text" id="buscadorClientes" placeholder="🔍 Buscar por nombre..." 
                            style="width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; margin-bottom: 15px; box-sizing: border-box;">
                        
                        <div id="listaClientesEstadisticas" style="max-height: 250px; overflow-y: auto; border: 1px solid #f1f5f9; border-radius: 6px;">
                        </div>
                    </div>

                    <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-top: 4px solid #104E2E;">
                        <h3 id="fichaNombre" style="color: #104E2E; margin-top: 0; margin-bottom: 15px; font-size: 18px;">👤 Seleccioná un Cliente</h3>
                        
                        <div id="fichaDetalleCliente" style="display: none; flex-direction: column; gap: 15px;">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                                <div style="background: #f8fafc; padding: 12px; border-radius: 6px; text-align: center;">
                                    <span style="font-size: 12px; color: #64748b; font-weight: bold; display: block;">PRESUPUESTOS</span>
                                    <span id="fichaCant" style="font-size: 18px; font-weight: bold; color: #334155;">0</span>
                                </div>
                                <div style="background: #f0fdf4; padding: 12px; border-radius: 6px; text-align: center;">
                                    <span style="font-size: 12px; color: #166534; font-weight: bold; display: block;">MANO DE OBRA COBRADA</span>
                                    <span id="fichaInvertido" style="font-size: 18px; font-weight: bold; color: #16a34a;">$ 0,00</span>
                                </div>
                            </div>
                            
                            <div style="background: #f8fafc; padding: 12px; border-radius: 6px;">
                                <p style="margin: 0 0 5px 0; font-size: 13px; color: #64748b;"><strong>Último Trabajo:</strong> <span id="fichaUltimaFecha" style="color: #334155; font-weight: bold;">-</span></p>
                                <p style="margin: 0; font-size: 13px; color: #64748b;"><strong>Contacto de Referencia:</strong> <span id="fichaContacto" style="color: #334155; font-weight: bold;">-</span></p>
                            </div>
                        </div>

                        <div id="fichaVacia" style="color: #94a3b8; text-align: center; padding: 40px 10px; font-style: italic;">
                            Hacé clic en el nombre de un cliente para auditar su volumen de trabajo acumulado.
                        </div>
                    </div>

                </div>
            </div>
        `;

        const filtroMes = document.getElementById("filtroMesEstadisticas");
        if (filtroMes) {
            filtroMes.onchange = (e) => {
                this.mesSeleccionado = e.target.value;
                this.procesarMetricasDelMes();
            };
        }

        const buscador = document.getElementById("buscadorClientes");
        if (buscador) {
            buscador.oninput = () => {
                this.filtrarClientes(buscador.value);
            };
        }

        this.procesarMetricasDelMes();
        this.filtrarClientes(""); 
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

    // Extrae de forma segura la mano de obra de un presupuesto
    _obtenerManoObra(p) {
        let subMo = 0;

        // 1. Si tiene un listado explicito de items de mano de obra
        if (Array.isArray(p.manoObraItems) && p.manoObraItems.length > 0) {
            subMo = p.manoObraItems.reduce((s, item) => {
                const cant = Number(item.cantidad || 1);
                const precio = Number(item.precio || item.valor || 0);
                return s + (cant * precio);
            }, 0);
        } 
        // 2. Si se guardo como un campo directo
        else if (p.manoDeObra !== undefined || p.manoObra !== undefined || p.totalManoObra !== undefined) {
            subMo = this._parseMonto(p.manoDeObra || p.manoObra || p.totalManoObra || 0);
        } 
        // 3. Si no hay desglose, pero si materiales: Total - Materiales
        else if (p.totalMateriales !== undefined || p.costoMateriales !== undefined) {
            const tot = this._parseMonto(p.totalGeneral || p.total || 0);
            const mat = this._parseMonto(p.totalMateriales || p.costoMateriales || 0);
            subMo = Math.max(0, tot - mat);
        }

        return subMo;
    }

    // Verifica si un presupuesto esta finalizado o empieza con T-
    _esTrabajoFinalizado(p) {
        const est = String(p.estado || '').toLowerCase().trim();
        const cod = String(p.codigo || p.numero || p.id || p.titulo || '').toLowerCase().trim();
        return est === "finalizado" || cod.startsWith("t-");
    }

    procesarMetricasDelMes() {
        const [anoFiltro, mesFiltro] = this.mesSeleccionado.split("-");
        const nAnoFiltro = Number(anoFiltro);
        const nMesFiltro = Number(mesFiltro);

        // Presupuestos creados en este mes
        const delMes = this.presupuestos.filter(p => {
            if (!p.fecha) return false;
            
            if (p.fecha.includes("/")) {
                const parts = p.fecha.split("/");
                if (parts.length === 3) {
                    const m = Number(parts[1]);
                    const a = Number(parts[2]);
                    return a === nAnoFiltro && m === nMesFiltro;
                }
            }
            
            if (p.fecha.includes("-")) {
                const parts = p.fecha.split("-");
                if (parts.length >= 2) {
                    const a = Number(parts[0]);
                    const m = Number(parts[1]);
                    return a === nAnoFiltro && m === nMesFiltro;
                }
            }
            return false;
        });

        const totalPresupuestos = delMes.length;
        
        // Filtra los que sean "finalizados" O empiecen con "T-"
        const finalizados = delMes.filter(p => this._esTrabajoFinalizado(p));

        /* =====================================================
           MÉTRICA 1: ACTIVIDAD MENSUAL COMPLETA
        ===================================================== */
        const totalDineroCompleto = finalizados.reduce((s, p) => s + this._parseMonto(p.totalGeneral || p.total || 0), 0);
        const promedioCompleto = finalizados.length > 0 ? (totalDineroCompleto / finalizados.length) : 0;
        const tasaConversion = totalPresupuestos > 0 ? Math.round((finalizados.length / totalPresupuestos) * 100) : 0;

        /* =====================================================
           MÉTRICA 2: CÁLCULOS SÓLO DE MANO DE OBRA (CONTROL FINANCIERO)
        ===================================================== */
        const totalManoObraTerminada = finalizados.reduce((suma, p) => suma + this._obtenerManoObra(p), 0);

        const ahorro = totalManoObraTerminada * 0.10;
        const inversion = totalManoObraTerminada * 0.12;
        const necesidades = totalManoObraTerminada * 0.78;

        // Renderizado en el DOM
        const elMontoCompleto = document.getElementById("statMontoCompleto");
        const elPromedio = document.getElementById("statPromedio");
        const elConversion = document.getElementById("statConversion");

        if (elMontoCompleto) elMontoCompleto.innerText = totalDineroCompleto.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
        if (elPromedio) elPromedio.innerText = promedioCompleto.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
        if (elConversion) elConversion.innerText = `${tasaConversion}% (${finalizados.length} de ${totalPresupuestos})`;

        // Renderizado del Bloque Financiero
        const elTotalMo = document.getElementById("totalManoObraMes");
        const realNecesidades = document.getElementById("finNecesidades") || document.getElementById("finNeeds");
        const elInversion = document.getElementById("finInversion");
        const elAhorro = document.getElementById("finAhorro");

        if (elTotalMo) elTotalMo.innerText = totalManoObraTerminada.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
        if (realNecesidades) realNecesidades.innerText = necesidades.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
        if (elInversion) elInversion.innerText = inversion.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
        if (elAhorro) elAhorro.innerText = ahorro.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
    }

    filtrarClientes(busqueda = "") {
        const contenedor = document.getElementById("listaClientesEstadisticas");
        if (!contenedor) return;

        contenedor.innerHTML = "";
        const textoBusqueda = busqueda.toLowerCase().trim();

        const filtrados = this.clientes.filter(c => c.nombre && c.nombre.toLowerCase().includes(textoBusqueda));

        if (filtrados.length === 0) {
            contenedor.innerHTML = `<div style="padding: 15px; text-align: center; color: #94a3b8; font-size: 13px;">No hay clientes registrados</div>`;
            return;
        }

        filtrados.sort((a, b) => a.nombre.localeCompare(b.nombre));

        filtrados.forEach(c => {
            const item = document.createElement("div");
            item.style = "padding: 10px 12px; border-bottom: 1px solid #f1f5f9; cursor: pointer; font-weight: bold; color: #334155; transition: background 0.2s;";
            item.innerText = c.nombre;

            item.onmouseover = () => { item.style.background = "#f1f5f9"; };
            item.onmouseout = () => { item.style.background = "transparent"; };
            
            item.onclick = () => this.mostrarFichaCliente(c);
            contenedor.appendChild(item);
        });
    }

    mostrarFichaCliente(cliente) {
        const ficha = document.getElementById("fichaDetalleCliente");
        const fichaVacia = document.getElementById("fichaVacia");
        if (!ficha || !fichaVacia) return;

        const pCliente = this.presupuestos.filter(p => {
            const cliId = String(p.cliente || '');
            return cliId === String(cliente.id) || cliId === String(cliente.nombre);
        });

        const totalManoObraCliente = pCliente
            .filter(p => this._esTrabajoFinalizado(p))
            .reduce((s, p) => s + this._obtenerManoObra(p), 0);

        let ult = "S/D";
        if (pCliente.length > 0) {
            const fechas = pCliente.map(p => p.fecha).filter(x => !!x).sort((a, b) => b.localeCompare(a));
            if (fechas.length > 0) ult = fechas[0];
        }

        const elNombre = document.getElementById("fichaNombre");
        const elCant = document.getElementById("fichaCant");
        const elInvertido = document.getElementById("fichaInvertido");
        const elUltimaFecha = document.getElementById("fichaUltimaFecha");
        const elContacto = document.getElementById("fichaContacto");

        if (elNombre) elNombre.innerText = `👤 ${cliente.nombre}`;
        if (elCant) elCant.innerText = pCliente.length;
        if (elInvertido) elInvertido.innerText = totalManoObraCliente.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
        if (elUltimaFecha) elUltimaFecha.innerText = ult;
        
        if (elContacto) {
            elContacto.innerText = cliente.telefono ? `📞 ${cliente.telefono}` : "S/D";
        }

        fichaVacia.style.display = "none";
        ficha.style.display = "flex";
    }
}

export default new Estadisticas();