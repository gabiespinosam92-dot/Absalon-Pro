/* ==========================================================
   ABSALON PRO
   modules/clienteDetalle.js
   Sprint 8.3 - Integración de Cronología Avanzada de Cliente
   (Limpieza Estricta de Fechas: Solo Día/Mes/Año)
========================================================== */
import { getById, getByField } from "./storage.js";

/* =====================================================
   MAPEO DE ICONOS OPERATIVOS
===================================================== */
const iconosEstado = {
    "Borrador": "⚪",
    "Enviado": "📤",
    "Aprobado": "🟢",
    "Programado": "📅",
    "En ejecución": "🛠",
    "Finalizado": "✅",
    "Facturado": "🧾",
    "En garantía": "🛡",
    "Cerrado": "✔"
};

/* =====================================================
   FUNCIÓN AUXILIAR: EXTRAE STRICTAMENTE DD/MM/AAAA
===================================================== */
function formatearFechaSegura(fechaRaw) {
    if (!fechaRaw) return "-";
    
    // 1. Limpiamos espacios y nos quedamos solo con la primera parte (por si viene la hora "AAAA-MM-DD HH:mm")
    let stringFecha = String(fechaRaw).trim().split(" ")[0];

    // 2. Si ya viene formateada con barras, nos aseguramos de recortar si quedó algo de la hora
    if (stringFecha.includes("/") && !stringFecha.includes("-")) {
        return stringFecha.substring(0, 10);
    }
    
    // 3. Si viene en formato internacional (AAAA-MM-DD), la recortamos y la damos vuelta
    if (stringFecha.includes("-")) {
        const partes = stringFecha.substring(0, 10).split("-");
        if (partes.length === 3) {
            return `${partes[2]}/${partes[1]}/${partes[0]}`;
        }
    }
    
    return stringFecha; 
}

class ClienteDetalle {
    constructor() {
        this.workspace = document.getElementById("workspace");
    }
    
    async load(id) {
        this.cliente = await getById("clientes", Number(id));
        
        // Buscamos los presupuestos asociados a este cliente
        this.presupuestos = await getByField("presupuestos", "clienteId", Number(id)) || [];
        
        await this.render();
    }

    async render() {
        // Calculamos el total acumulado de todos sus presupuestos
        const total = this.presupuestos.reduce((s, p) => s + Number(p.total || 0), 0);

        /* =====================================================
           ESTADÍSTICAS REALES POR ESTADO
        ===================================================== */
        const aprobados = this.presupuestos.filter(p => p.estado === "Aprobado").length;
        const enviados = this.presupuestos.filter(p => p.estado === "Enviado").length;
        const borradores = this.presupuestos.filter(p => p.estado === "Borrador").length;
        const facturados = this.presupuestos.filter(p => p.estado === "Facturado").length;

        /* =====================================================
           LÓGICA DEL ÚLTIMO TRABAJO COBRADO/REALIZADO
        ===================================================== */
        let ultimo = null;
        if (this.presupuestos.length) {
            ultimo = [...this.presupuestos].sort((a, b) => new Date(a.fecha) - new Date(b.fecha)).pop();
        }

        /* =====================================================
           CABECERA PROFESIONAL E INSIGNIA DE FIDELIDAD
        ===================================================== */
        const clienteFrecuente = this.presupuestos.length >= 5;
        
        let clienteDesde = "-";
        let ultimoContacto = "-";
        
        if (this.presupuestos.length) {
            const fechasOrdenadas = this.presupuestos.map(p => p.fecha).sort();
            clienteDesde = formatearFechaSegura(fechasOrdenadas[0]);
            ultimoContacto = formatearFechaSegura(fechasOrdenadas[fechasOrdenadas.length - 1]);
        }

        /* =====================================================
           PASO 1 - Construir los eventos (Cronología Dinámica)
        ===================================================== */
        const eventos = [];

        if (this.cliente.fechaAlta || this.cliente.creado) {
            eventos.push({
                fecha: this.cliente.fechaAlta || this.cliente.creado,
                tipo: "cliente",
                icono: "👤",
                titulo: "Cliente registrado"
            });
        }

        this.presupuestos.forEach(p => {
            const iconoDinamico = iconosEstado[p.estado] || "📄";

            eventos.push({
                fecha: p.fecha,
                tipo: "presupuesto",
                icono: iconoDinamico,
                titulo: `Presupuesto Nº ${p.numero}`,
                estado: p.estado,
                presupuestoId: p.id
            });

            if (p.fechaSeguimiento) {
                eventos.push({
                    fecha: p.fechaSeguimiento,
                    tipo: "seguimiento",
                    icono: "🔔",
                    titulo: "Seguimiento programado",
                    presupuestoId: p.id
                });
            }

            if (p.fechaAprobacion) {
                eventos.push({
                    fecha: p.fechaAprobacion,
                    tipo: "aprobado",
                    icono: "🟢",
                    titulo: "Presupuesto aprobado",
                    presupuestoId: p.id
                });
            }

            if (p.fechaFinalizacion) {
                eventos.push({
                    fecha: p.fechaFinalizacion,
                    tipo: "trabajo",
                    icono: "🛠",
                    titulo: "Trabajo finalizado",
                    presupuestoId: p.id
                });
            }
        });

        /* =====================================================
           PASO 2 - Ordenar eventos cronológicamente
        ===================================================== */
        eventos.sort((a, b) => {
            if (!a.fecha) return 1;
            if (!b.fecha) return -1;
            return new Date(a.fecha) - new Date(b.fecha);
        });

        /* =====================================================
           PASO 3 - Dibujar la cronología compacta (Timeline)
        ===================================================== */
        let timeline = `
        <div class="card mt-3" style="padding: 20px;">
            <h3 style="margin-bottom: 15px;">🕒 Línea de Tiempo Operativa</h3>
            <div style="border-left: 2px solid var(--border); margin-left: 10px; padding-left: 20px; display: flex; flex-direction: column; gap: 15px;">
        `;

        eventos.forEach(evento => {
            const fechaVisual = formatearFechaSegura(evento.fecha);

            timeline += `
            <div style="position: relative;">
                <div style="position: absolute; left: -27px; top: 2px; background: var(--card-bg, #222); width: 14px; height: 14px; border-radius: 50%; border: 2px solid var(--primary); display: flex; align-items: center; justify-content: center; font-size: 8px;"></div>
                
                <div style="display: flex; flex-direction: column; background: rgba(255,255,255,0.02); padding: 10px 15px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 5px;">
                        <span style="font-weight: bold; font-size: 0.95rem;">${evento.icono} ${evento.titulo}</span>
                        <span class="text-muted" style="font-size: 0.8rem; font-weight: bold; background: rgba(255,255,255,0.05); padding: 2px 6px; border-radius: 4px;">📅 ${fechaVisual}</span>
                    </div>
                    ${evento.estado ? `<div style="font-size: 0.85rem; margin-top: 4px; color: #aaa;">Estado actual: <strong style="color:var(--text);">${evento.estado}</strong></div>` : ""}
                    ${evento.presupuestoId ? `
                    <div style="margin-top: 8px; text-align: right;">
                        <button class="btn btn-secondary btnTimeline" data-id="${evento.presupuestoId}" style="padding: 3px 8px; font-size: 0.75rem; cursor: pointer; border-radius: 4px;">
                            📂 Ir a la Orden
                        </button>
                    </div>` : ""}
                </div>
            </div>
            `;
        });

        timeline += "</div></div>";

        /* =====================================================
           GENERAR LISTADO DE HISTORIAL GENERAL
        ===================================================== */
        let listaPresupuestos = "";
        if (this.presupuestos.length === 0) {
            listaPresupuestos = `<p class="text-muted mt-2">Este cliente todavía no tiene órdenes cargadas.</p>`;
        } else {
            this.presupuestos
                .sort((a, b) => b.numero - a.numero)
                .forEach(p => {
                    listaPresupuestos += `
                    <div class="card mt-2" style="background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.05); padding: 15px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                            <div>
                                <h4 style="margin: 0; font-size: 1rem;">📄 Registro Nº ${p.numero}</h4>
                                <small class="text-muted">Emitido: ${formatearFechaSegura(p.fecha)}</small>
                            </div>
                            <div style="text-align: right;">
                                <strong style="color: var(--primary); font-size: 1.1rem; display: block;">
                                    $ ${Number(p.total || 0).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                                </strong>
                                <span style="background: rgba(255,255,255,0.07); padding: 2px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: bold; text-transform: uppercase; display: inline-block; margin-top: 4px;">${p.estado}</span>
                            </div>
                        </div>
                        <div style="margin-top: 12px; display: flex; gap: 10px; justify-content: flex-end;">
                            <button class="btn btnAbrir" data-id="${p.id}" style="padding: 4px 10px; font-size: 0.8rem; cursor: pointer;">👁 Ver</button>
                            <button class="btn btn-secondary btnDuplicar" data-id="${p.id}" style="padding: 4px 10px; font-size: 0.8rem; cursor: pointer;">📋 Clonar</button>
                        </div>
                    </div>
                    `;
                });
        }

        /* =====================================================
           INYECCIÓN ESTRUCTURAL EN INTERFAZ
        ===================================================== */
        this.workspace.innerHTML = `
        <div class="card" style="border-left: 5px solid ${clienteFrecuente ? '#ffd700' : 'var(--primary)'}; padding: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 15px;">
                <div>
                    <h2 style="margin: 0; display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                        👤 ${this.cliente.nombre}
                        ${clienteFrecuente ? '<span style="background: #ffd700; color: #000; font-size: 0.75rem; padding: 3px 8px; border-radius: 10px; font-weight: bold;">⭐ CLIENTE FRECUENTE</span>' : ''}
                    </h2>
                    <p style="margin: 8px 0 4px 0; font-size: 0.95rem;">📞 <strong>Tel:</strong> ${this.cliente.telefono || "-"}</p>
                    <p style="margin: 4px 0 0 0; font-size: 0.95rem;">📍 <strong>Dir:</strong> ${this.cliente.direccion || "-"}</p>
                </div>
                <div style="text-align: right; font-size: 0.85rem; color: #aaa; min-width: 150px;">
                    <p style="margin: 0 0 4px 0;">📅 Inicio: <strong>${clienteDesde}</strong></p>
                    <p style="margin: 0;">🕒 Último contacto: <strong>${ultimoContacto}</strong></p>
                </div>
            </div>
        </div>
        
        <div class="card mt-3" style="padding: 20px;">
            <h3>📊 Resumen Estadístico</h3>
            <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 15px;">
                <div style="flex: 1; min-width: 90px; background: rgba(255,255,255,0.02); padding: 10px; border-radius: 8px; text-align: center; border: 1px solid rgba(255,255,255,0.03);">
                    <span style="font-size: 1.1rem;">📄</span> <p style="margin: 3px 0 0 0; font-size: 0.75rem; color:#aaa;">Totales</p>
                    <strong style="font-size: 1.2rem; display:block; margin-top:2px;">${this.presupuestos.length}</strong>
                </div>
                <div style="flex: 1; min-width: 90px; background: rgba(255,255,255,0.02); padding: 10px; border-radius: 8px; text-align: center; border: 1px solid rgba(255,255,255,0.03);">
                    <span style="font-size: 1.1rem;">📤</span> <p style="margin: 3px 0 0 0; font-size: 0.75rem; color:#aaa;">Enviados</p>
                    <strong style="font-size: 1.2rem; display:block; margin-top:2px; color: #2196F3;">${enviados}</strong>
                </div>
                <div style="flex: 1; min-width: 90px; background: rgba(255,255,255,0.02); padding: 10px; border-radius: 8px; text-align: center; border: 1px solid rgba(255,255,255,0.03);">
                    <span style="font-size: 1.1rem;">🟢</span> <p style="margin: 3px 0 0 0; font-size: 0.75rem; color:#aaa;">Aprobados</p>
                    <strong style="font-size: 1.2rem; display:block; margin-top:2px; color: #4CAF50;">${aprobados}</strong>
                </div>
                <div style="flex: 1; min-width: 90px; background: rgba(255,255,255,0.02); padding: 10px; border-radius: 8px; text-align: center; border: 1px solid rgba(255,255,255,0.03);">
                    <span style="font-size: 1.1rem;">🧾</span> <p style="margin: 3px 0 0 0; font-size: 0.75rem; color:#aaa;">Facturados</p>
                    <strong style="font-size: 1.2rem; display:block; margin-top:2px; color: #9C27B0;">${facturados}</strong>
                </div>
                <div style="flex: 1; min-width: 90px; background: rgba(255,255,255,0.02); padding: 10px; border-radius: 8px; text-align: center; border: 1px solid rgba(255,255,255,0.03);">
                    <span style="font-size: 1.1rem;">⚪</span> <p style="margin: 3px 0 0 0; font-size: 0.75rem; color:#aaa;">Borrador</p>
                    <strong style="font-size: 1.2rem; display:block; margin-top:2px; color: #7f8c8d;">${borradores}</strong>
                </div>
            </div>
            
            <div style="margin-top: 20px; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 15px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <h4 style="margin: 0; color:#aaa;">Inversión Total Acumulada:</h4>
                <h2 style="color: var(--primary); margin: 0; font-size: 1.5rem;">$ ${total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</h2>
            </div>
        </div>

        <div class="card mt-3" style="padding: 15px;">
            <h3>🛠 Última Actividad</h3>
            ${ultimo ? `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; background: rgba(var(--primary-rgb), 0.03); padding: 12px; border-radius: 8px; border-left: 4px solid var(--primary); flex-wrap: wrap; gap: 10px;">
                    <div>
                        <p style="margin: 0; font-weight: bold; font-size: 0.95rem;">Orden de Trabajo Nº ${ultimo.numero}</p>
                        <small class="text-muted">Fecha: ${formatearFechaSegura(ultimo.fecha)}</small>
                    </div>
                    <div style="font-size: 0.85rem; background: var(--border); padding: 4px 10px; border-radius: 6px; font-weight: bold; text-transform: uppercase;">
                        ${ultimo.estado}
                    </div>
                </div>
            ` : `<p class="text-muted mt-2">Sin movimientos comerciales cargados.</p>`}
        </div>

        ${timeline}

        <div class="card mt-3" style="padding: 20px;">
            <h3 style="margin-bottom: 10px;">📜 Carpetas del Historial</h3>
            ${listaPresupuestos}
        </div>
        `;

        /* =====================================================
           CAPTURA Y ENRUTAMIENTO DE CLICS (TIMELINE)
        ===================================================== */
        document.querySelectorAll(".btnTimeline").forEach(btn => {
            btn.onclick = async (e) => {
                const idPresupuesto = Number(e.currentTarget.dataset.id);
                const btnMenuPresupuestos = document.querySelector('[data-view="presupuestos"]');
                if (btnMenuPresupuestos) btnMenuPresupuestos.click();

                const modulo = await import("./presupuestos.js");
                setTimeout(async () => {
                    const instancia = new modulo.default();
                    await instancia.load(idPresupuesto);
                }, 40);
            };
        });

        /* =====================================================
           BOTONES DEL HISTORIAL GENERAL (VER Y CLONAR)
        ===================================================== */
        document.querySelectorAll(".btnAbrir").forEach(btn => {
            btn.onclick = async (e) => {
                const idPresupuesto = Number(e.currentTarget.dataset.id);
                const btnMenuPresupuestos = document.querySelector('[data-view="presupuestos"]');
                if (btnMenuPresupuestos) btnMenuPresupuestos.click();

                const modulo = await import("./presupuestos.js");
                setTimeout(async () => {
                    const instancia = new modulo.default();
                    await instancia.load(idPresupuesto);
                }, 40);
            };
        });

        document.querySelectorAll(".btnDuplicar").forEach(btn => {
            btn.onclick = async (e) => {
                const idPresupuesto = Number(e.currentTarget.dataset.id);
                const historial = await import("./historial.js");
                
                let instanciaHistorial;
                if (typeof historial.default === "function") {
                    instanciaHistorial = new historial.default();
                } else {
                    instanciaHistorial = historial.default;
                }
                
                await instanciaHistorial.duplicarPresupuesto(idPresupuesto);
                await this.load(this.cliente.id); // Recarga automática
            };
        });
    }
}

export default new ClienteDetalle();