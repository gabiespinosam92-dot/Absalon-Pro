// garantias.js - Módulo unificado para Administrar e Imprimir Garantías en Absalon Pro
import { getAll, save, remove } from "./storage.js";
import { exportarPresupuestoPDF } from "./pdf.js";

export const garantias = {
    datos: [],
    presupuestos: [],
    vistaActual: "emitir", // "emitir" o "plantillas"

    async iniciar() {
        await this.cargarDatos();
        this.render();
        this.eventos();
    },

    async cargarDatos() {
        try {
            this.datos = await getAll("garantias") || [];
            this.presupuestos = await getAll("presupuestos") || [];
        } catch (error) {
            console.error("Error al cargar datos de garantías y presupuestos:", error);
            this.datos = [];
            this.presupuestos = [];
        }
    },

    render() {
        const main = document.getElementById("workspace");
        if (!main) return;

        main.innerHTML = `
            <div class="workspace">
                <div class="welcome-card" style="border-left: 5px solid #104E2E; display:flex; justify-spacing:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                    <div>
                        <h2>🛡️ Gestión e Impresión de Garantías</h2>
                        <p>Emití certificados de garantía vinculados a presupuestos o administrá tus plantillas por rubro.</p>
                    </div>
                    
                    <!-- Botones de pestañas -->
                    <div style="display:flex; gap:10px;">
                        <button id="tab-emitir" class="menu-item" style="background:${this.vistaActual === 'emitir' ? '#104E2E' : '#6b7280'}; color:white; border:none; padding:8px 15px; border-radius:4px; cursor:pointer;">
                            🖨️ Emitir por Presupuesto
                        </button>
                        <button id="tab-plantillas" class="menu-item" style="background:${this.vistaActual === 'plantillas' ? '#104E2E' : '#6b7280'}; color:white; border:none; padding:8px 15px; border-radius:4px; cursor:pointer;">
                            ⚙️ Plantillas Base (${this.datos.length})
                        </button>
                    </div>
                </div>

                <div id="contenedor-vista" style="margin-top: 20px;">
                    ${this.vistaActual === "emitir" ? this.renderVistaEmitir() : this.renderVistaPlantillas()}
                </div>
            </div>
        `;
    },

    // -------------------------------------------------------------------------
    // VISTA 1: EMITIR GARANTÍA PARA UN PRESUPUESTO
    // -------------------------------------------------------------------------
    renderVistaEmitir() {
        // Filtrar presupuestos terminados (que empiezan con 'T' o todos)
        const opcionesPresupuestos = this.presupuestos
            .map(p => `<option value="${p.numero}">${p.numero} - ${p.clienteNombre || 'Sin Nombre'}</option>`)
            .join("");

        const opcionesPlantillas = this.datos
            .map(g => `<option value="${g.id}">${g.titulo} (${g.especialidad})</option>`)
            .join("");

        return `
            <div class="dashboard-card" style="max-width: 850px;">
                <h3 style="margin-bottom: 15px; color: #104E2E;">📄 Generar Hoja de Cobertura</h3>
                
                <form id="form-emisor-garantia" style="display: flex; flex-direction: column; gap: 15px;">
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:15px;">
                        <div>
                            <label style="display:block; margin-bottom:5px; font-weight:bold;">1. N° de Presupuesto:</label>
                            <select id="sel-presupuesto" style="width:100%; padding:9px; border:1px solid #ccc; border-radius:4px;" required>
                                <option value="">-- Seleccioná un Presupuesto --</option>
                                ${opcionesPresupuestos}
                            </select>
                        </div>

                        <div>
                            <label style="display:block; margin-bottom:5px; font-weight:bold;">2. Cargar Plantilla (Opcional):</label>
                            <select id="sel-plantilla" style="width:100%; padding:9px; border:1px solid #ccc; border-radius:4px;">
                                <option value="">-- Seleccioná plantilla base --</option>
                                ${opcionesPlantillas}
                            </select>
                        </div>
                    </div>

                    <!-- Datos del cliente detectados -->
                    <div id="info-cliente" style="background:#f9fafb; padding:10px; border-radius:4px; border:1px dashed #ccc; font-size:13px; display:none;">
                        <b>Cliente:</b> <span id="lbl-cliente">-</span> | <b>Dirección:</b> <span id="lbl-direccion">-</span> | <b>Fecha:</b> <span id="lbl-fecha">-</span>
                    </div>

                    <hr style="border:0; border-top:1px solid #e5e7eb;">

                    <div>
                        <label style="display:block; margin-bottom:5px; font-weight:bold;">1. Alcance y Condiciones de Aplicación de la Garantía:</label>
                        <textarea id="garantia-aplica" rows="4" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;" placeholder="Detallá qué cubre la garantía..." required></textarea>
                    </div>

                    <div>
                        <label style="display:block; margin-bottom:5px; font-weight:bold;">2. Exclusiones y Pérdida de Cobertura:</label>
                        <textarea id="garantia-exclusiones" rows="4" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;" placeholder="Detallá las exclusiones..." required></textarea>
                    </div>

                    <button type="submit" style="background:#104E2E; color:white; border:none; padding:12px; font-size:15px; font-weight:bold; border-radius:4px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;">
                        🖨️ Generar e Imprimir Documento PDF
                    </button>
                </form>
            </div>
        `;
    },

    // -------------------------------------------------------------------------
    // VISTA 2: ADMINISTRAR PLANTILLAS BASE
    // -------------------------------------------------------------------------
    renderVistaPlantillas() {
        return `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                
                <!-- Formulario de Alta -->
                <div class="dashboard-card" style="height: fit-content;">
                    <h3 id="form-titulo" style="margin-bottom: 15px; color: #104E2E;">📜 Nueva Plantilla</h3>
                    <form id="form-garantia" style="display: flex; flex-direction: column; gap: 12px;">
                        <input type="hidden" id="garantia-id">
                        
                        <div>
                            <label style="display:block; margin-bottom:5px; font-weight:bold;">Título:</label>
                            <input type="text" id="garantia-titulo" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;" placeholder="Ej: Garantía de Compresor R600a" required>
                        </div>

                        <div>
                            <label style="display:block; margin-bottom:5px; font-weight:bold;">Especialidad / Rubro:</label>
                            <select id="garantia-especialidad" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;" required>
                                <option value="">Seleccioná un rubro...</option>
                                <option value="Refrigeración">Refrigeración</option>
                                <option value="Electricidad">Electricidad</option>
                                <option value="Construcción Seco">Construcción Seco</option>
                                <option value="Obra / MMO">Obra / MMO</option>
                            </select>
                        </div>

                        <div>
                            <label style="display:block; margin-bottom:5px; font-weight:bold;">Duración:</label>
                            <input type="text" id="garantia-duracion" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;" placeholder="Ej: 6 meses / 1 año" required>
                        </div>

                        <div>
                            <label style="display:block; margin-bottom:5px; font-weight:bold;">Texto Completo de Cobertura:</label>
                            <textarea id="garantia-texto" rows="5" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px; font-family:sans-serif;" placeholder="Detallá los términos de cobertura técnica..." required></textarea>
                        </div>

                        <div style="display:flex; gap:10px;">
                            <button type="submit" class="menu-item" style="background:#104E2E; color:white; border:none; padding:10px; border-radius:4px; cursor:pointer; flex:1; justify-content:center;">Guardar Plantilla</button>
                            <button type="button" id="btn-cancelar" style="background:#6b7280; color:white; border:none; padding:10px; border-radius:4px; cursor:pointer; display:none;">X</button>
                        </div>
                    </form>
                </div>

                <!-- Listado de Garantías -->
                <div class="dashboard-card">
                    <h3 style="margin-bottom: 15px;">📋 Plantillas Guardadas</h3>
                    <div style="overflow-x: auto;">
                        <table style="width:100%; border-collapse: collapse; text-align: left;">
                            <thead>
                                <tr style="border-bottom: 2px solid #e5e7eb; background:#f9fafb;">
                                    <th style="padding:10px;">Título</th>
                                    <th style="padding:10px;">Rubro</th>
                                    <th style="padding:10px;">Tiempo</th>
                                    <th style="padding:10px; text-align:right;">Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="lista-garantias">
                                ${this.renderFilas()}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        `;
    },

    renderFilas() {
        if (this.datos.length === 0) {
            return `<tr><td colspan="4" style="padding:20px; text-align:center; color:#6b7280;">No hay plantillas creadas.</td></tr>`;
        }

        return this.datos.map(g => {
            let colorBadge = "#6b7280";
            if (g.especialidad === "Refrigeración") colorBadge = "#0284c7";
            if (g.especialidad === "Electricidad") colorBadge = "#d97706";
            if (g.especialidad === "Construcción Seco" || g.especialidad === "Obra / MMO") colorBadge = "#16a34a";

            return `
                <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding:10px;"><b>${g.titulo}</b></td>
                    <td style="padding:10px;"><span style="background:${colorBadge}; color:white; padding:2px 6px; border-radius:4px; font-size:11px;">${g.especialidad}</span></td>
                    <td style="padding:10px;">${g.duracion}</td>
                    <td style="padding:10px; text-align:right;">
                        <button class="btn-editar" data-id="${g.id}" style="border:none; background:none; cursor:pointer; margin-right:5px;">✏️</button>
                        <button class="btn-eliminar" data-id="${g.id}" style="border:none; background:none; cursor:pointer;">🗑️</button>
                    </td>
                </tr>
            `;
        }).join("");
    },

    // -------------------------------------------------------------------------
    // EVENTOS Y LÓGICA DE INTERACCIÓN
    // -------------------------------------------------------------------------
    eventos() {
        // Eventos de Pestañas
        const tabEmitir = document.getElementById("tab-emitir");
        const tabPlantillas = document.getElementById("tab-plantillas");

        if (tabEmitir) {
            tabEmitir.onclick = () => {
                this.vistaActual = "emitir";
                this.render();
                this.eventos();
            };
        }

        if (tabPlantillas) {
            tabPlantillas.onclick = () => {
                this.vistaActual = "plantillas";
                this.render();
                this.eventos();
            };
        }

        if (this.vistaActual === "emitir") {
            this.eventosEmisor();
        } else {
            this.eventosPlantillas();
        }
    },

    eventosEmisor() {
        const selPresupuesto = document.getElementById("sel-presupuesto");
        const selPlantilla = document.getElementById("sel-plantilla");
        const txtAplica = document.getElementById("garantia-aplica");
        const txtExclusiones = document.getElementById("garantia-exclusiones");
        const infoCliente = document.getElementById("info-cliente");
        const formEmisor = document.getElementById("form-emisor-garantia");

        if (!formEmisor) return;

        // Auto-completar datos al seleccionar un N° de Presupuesto
        selPresupuesto.onchange = () => {
            const nro = selPresupuesto.value;
            const p = this.presupuestos.find(item => item.numero === nro);

            if (p) {
                document.getElementById("lbl-cliente").innerText = p.clienteNombre || "Sin nombre";
                document.getElementById("lbl-direccion").innerText = p.clienteDireccion || "-";
                document.getElementById("lbl-fecha").innerText = p.fecha || "-";
                infoCliente.style.display = "block";
            } else {
                infoCliente.style.display = "none";
            }
        };

        // Auto-completar textos al seleccionar una plantilla
        selPlantilla.onchange = () => {
            const idPlantilla = selPlantilla.value;
            const g = this.datos.find(item => item.id == idPlantilla);

            if (g) {
                txtAplica.value = `Garantía (${g.duracion}): ${g.textoGarantia}`;
                txtExclusiones.value = "Quedan expresamente excluidas de la garantía las siguientes situaciones:\n" +
                    "• Intervención o modificación de las instalaciones por parte de terceros no autorizados.\n" +
                    "• Daños provocados por mal uso, sobrecargas eléctricas o factores climáticos extremos.\n" +
                    "• Desgaste natural de insumos provistos directamente por el cliente.";
            }
        };

        // Enviar y generar el PDF
        formEmisor.onsubmit = async (e) => {
            e.preventDefault();

            const nro = selPresupuesto.value;
            const presupuestoObj = this.presupuestos.find(p => p.numero === nro);

            if (!presupuestoObj) {
                alert("Por favor seleccioná un presupuesto válido.");
                return;
            }

            const datosFinalesPDF = {
                ...presupuestoObj,
                garantiaAplica: txtAplica.value.trim(),
                garantiaExclusiones: txtExclusiones.value.trim(),
                forzarGarantia: true
            };

            await exportarPresupuestoPDF(datosFinalesPDF);
        };
    },

    eventosPlantillas() {
        const form = document.getElementById("form-garantia");
        if (!form) return;

        form.onsubmit = async (e) => {
            e.preventDefault();
            
            const idInput = document.getElementById("garantia-id").value;
            const titulo = document.getElementById("garantia-titulo").value.trim();
            const especialidad = document.getElementById("garantia-especialidad").value;
            const duracion = document.getElementById("garantia-duracion").value.trim();
            const textoGarantia = document.getElementById("garantia-texto").value.trim();

            const nuevaGarantia = { titulo, especialidad, duracion, textoGarantia };
            
            if (idInput) {
                nuevaGarantia.id = Number(idInput);
            }

            await save("garantias", nuevaGarantia);
            await this.cargarDatos();
            this.render();
            this.eventos();
        };

        document.getElementById("lista-garantias").onclick = async (e) => {
            const btnEditar = e.target.closest(".btn-editar");
            const btnEliminar = e.target.closest(".btn-eliminar");

            if (btnEditar) {
                const id = btnEditar.dataset.id;
                const g = this.datos.find(item => item.id == id);
                if (g) {
                    document.getElementById("garantia-id").value = g.id;
                    document.getElementById("garantia-titulo").value = g.titulo;
                    document.getElementById("garantia-especialidad").value = g.especialidad;
                    document.getElementById("garantia-duracion").value = g.duracion;
                    document.getElementById("garantia-texto").value = g.textoGarantia;
                    document.getElementById("form-titulo").innerText = "✏️ Editar Plantilla";
                    document.getElementById("btn-cancelar").style.display = "block";
                }
            }

            if (btnEliminar) {
                if (confirm("¿Borrar esta plantilla de garantía?")) {
                    const idABorrar = Number(btnEliminar.dataset.id);
                    await remove("garantias", idABorrar);
                    await this.cargarDatos();
                    this.render();
                    this.eventos();
                }
            }
        };

        document.getElementById("btn-cancelar").onclick = () => {
            form.reset();
            document.getElementById("garantia-id").value = "";
            document.getElementById("form-titulo").innerText = "📜 Nueva Plantilla";
            document.getElementById("btn-cancelar").style.display = "none";
        };
    }
};

export default garantias;
