// garantias.js - Módulo unificado de Garantías con buscador dinámico de presupuestos
import { getAll, save, remove } from "./storage.js";
import { exportarPresupuestoPDF } from "./pdf.js";

export const garantias = {
    datos: [],
    presupuestos: [],
    clientes: [],
    presupuestoSeleccionado: null,
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
            this.clientes = await getAll("clientes") || [];
        } catch (error) {
            console.error("Error al cargar datos en garantías:", error);
            this.datos = [];
            this.presupuestos = [];
            this.clientes = [];
        }
    },

    // Auxiliar para resolver el nombre real del cliente cruzando colecciones (igual que en historial.js)
    obtenerNombreCliente(p) {
        if (!p) return "Sin Nombre";
        if (p.clienteNombre) return p.clienteNombre; // Si ya viene directo
        const clienteIdString = String(p.cliente || '');
        const clienteObj = this.clientes.find(c => String(c.id) === clienteIdString);
        return clienteObj ? clienteObj.nombre : (p.cliente || "Sin Nombre");
    },

    render() {
        const main = document.getElementById("workspace");
        if (!main) return;

        main.innerHTML = `
            <div class="workspace" style="padding:20px; font-family:sans-serif;">
                <div class="welcome-card" style="border-left: 5px solid #104E2E; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; background:white; padding:15px; border-radius:8px; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                    <div>
                        <h2 style="color:#104E2E; margin:0 0 5px 0;">🛡️ Gestión e Impresión de Garantías</h2>
                        <p style="margin:0; color:#64748b; font-size:14px;">Emití certificados de garantía vinculados a presupuestos o administrá tus plantillas por rubro.</p>
                    </div>
                    
                    <div style="display:flex; gap:10px;">
                        <button id="tab-emitir" style="background:${this.vistaActual === 'emitir' ? '#104E2E' : '#64748b'}; color:white; border:none; padding:8px 15px; border-radius:6px; cursor:pointer; font-weight:bold;">
                            🖨️ Emitir por Presupuesto
                        </button>
                        <button id="tab-plantillas" style="background:${this.vistaActual === 'plantillas' ? '#104E2E' : '#64748b'}; color:white; border:none; padding:8px 15px; border-radius:6px; cursor:pointer; font-weight:bold;">
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
    // VISTA 1: EMITIR GARANTÍA
    // -------------------------------------------------------------------------
    renderVistaEmitir() {
        const opcionesPlantillas = this.datos
            .map(g => `<option value="${g.id}">${g.titulo} (${g.especialidad})</option>`)
            .join("");

        return `
            <div style="background:white; padding:20px; border-radius:8px; box-shadow:0 1px 3px rgba(0,0,0,0.1); max-width:850px; margin:0 auto;">
                <h3 style="margin-top:0; margin-bottom:15px; color:#104E2E;">📄 Generar Hoja de Cobertura</h3>
                
                <form id="form-emisor-garantia" style="display:flex; flex-direction:column; gap:15px;">
                    
                    <!-- BÚSQUEDA Y SELECCIÓN DE PRESUPUESTO -->
                    <div>
                        <label style="display:block; margin-bottom:5px; font-weight:bold; color:#334155;">1. Buscar Presupuesto o Cliente:</label>
                        <input type="text" id="buscar-presupuesto-input" placeholder="🔍 Escribí N° de presupuesto o nombre del cliente..." 
                            style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:6px; font-size:14px; box-sizing:border-box;">
                        
                        <!-- Lista de coincidencias -->
                        <div id="lista-resultados-presupuesto" style="max-height:180px; overflow-y:auto; border:1px solid #cbd5e1; border-top:none; border-radius:0 0 6px 6px; display:none; background:white;"></div>
                    </div>

                    <!-- Ficha del Presupuesto Seleccionado -->
                    <div id="info-cliente" style="background:#f8fafc; padding:12px; border-radius:6px; border:1px solid #cbd5e1; font-size:14px; display:${this.presupuestoSeleccionado ? 'block' : 'none'};">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <div>
                                <b style="color:#104E2E;">Presupuesto Seleccionado:</b> <span id="lbl-numero">${this.presupuestoSeleccionado ? (this.presupuestoSeleccionado.numero || 'N° ' + this.presupuestoSeleccionado.id) : '-'}</span><br>
                                <b>Cliente:</b> <span id="lbl-cliente">${this.presupuestoSeleccionado ? this.obtenerNombreCliente(this.presupuestoSeleccionado) : '-'}</span> | 
                                <b>Fecha:</b> <span id="lbl-fecha">${this.presupuestoSeleccionado ? (this.presupuestoSeleccionado.fecha || '-') : '-'}</span>
                            </div>
                            <button type="button" id="btn-deseleccionar-p" style="background:#ef4444; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:12px;">Cambiar</button>
                        </div>
                    </div>

                    <!-- Plantillas Predefinidas -->
                    <div>
                        <label style="display:block; margin-bottom:5px; font-weight:bold; color:#334155;">2. Cargar Texto desde Plantilla Base (Opcional):</label>
                        <select id="sel-plantilla" style="width:100%; padding:9px; border:1px solid #cbd5e1; border-radius:6px;">
                            <option value="">-- Seleccioná una plantilla previa --</option>
                            ${opcionesPlantillas}
                        </select>
                    </div>

                    <hr style="border:0; border-top:1px solid #e2e8f0; margin:5px 0;">

                    <!-- Textos editables -->
                    <div>
                        <label style="display:block; margin-bottom:5px; font-weight:bold; color:#334155;">3. Alcance y Condiciones de Aplicación de la Garantía:</label>
                        <textarea id="garantia-aplica" rows="4" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px; box-sizing:border-box;" placeholder="Detallá qué cubre la garantía..." required></textarea>
                    </div>

                    <div>
                        <label style="display:block; margin-bottom:5px; font-weight:bold; color:#334155;">4. Exclusiones y Pérdida de Cobertura:</label>
                        <textarea id="garantia-exclusiones" rows="4" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px; box-sizing:border-box;" placeholder="Detallá las exclusiones..." required></textarea>
                    </div>

                    <button type="submit" style="background:#104E2E; color:white; border:none; padding:12px; font-size:15px; font-weight:bold; border-radius:6px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; margin-top:10px;">
                        🖨️ Generar e Imprimir Documento PDF
                    </button>
                </form>
            </div>
        `;
    },

    // -------------------------------------------------------------------------
    // VISTA 2: PLANTILLAS BASE
    // -------------------------------------------------------------------------
    renderVistaPlantillas() {
        return `
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:20px;">
                <div style="background:white; padding:20px; border-radius:8px; box-shadow:0 1px 3px rgba(0,0,0,0.1); height:fit-content;">
                    <h3 id="form-titulo" style="margin-top:0; margin-bottom:15px; color:#104E2E;">📜 Nueva Plantilla Base</h3>
                    <form id="form-garantia" style="display:flex; flex-direction:column; gap:12px;">
                        <input type="hidden" id="garantia-id">
                        
                        <div>
                            <label style="display:block; margin-bottom:5px; font-weight:bold;">Título:</label>
                            <input type="text" id="garantia-titulo" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:4px; box-sizing:border-box;" placeholder="Ej: Garantía Compresor R600a" required>
                        </div>

                        <div>
                            <label style="display:block; margin-bottom:5px; font-weight:bold;">Rubro:</label>
                            <select id="garantia-especialidad" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:4px;" required>
                                <option value="">Seleccioná un rubro...</option>
                                <option value="Refrigeración">Refrigeración</option>
                                <option value="Electricidad">Electricidad</option>
                                <option value="Construcción Seco">Construcción Seco</option>
                                <option value="Obra / MMO">Obra / MMO</option>
                            </select>
                        </div>

                        <div>
                            <label style="display:block; margin-bottom:5px; font-weight:bold;">Duración:</label>
                            <input type="text" id="garantia-duracion" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:4px; box-sizing:border-box;" placeholder="Ej: 6 meses / 1 año" required>
                        </div>

                        <div>
                            <label style="display:block; margin-bottom:5px; font-weight:bold;">Texto Completo de Cobertura:</label>
                            <textarea id="garantia-texto" rows="5" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:4px; box-sizing:border-box;" placeholder="Detallá los términos técnicos..." required></textarea>
                        </div>

                        <div style="display:flex; gap:10px;">
                            <button type="submit" style="background:#104E2E; color:white; border:none; padding:10px; border-radius:4px; cursor:pointer; flex:1; font-weight:bold;">Guardar Plantilla</button>
                            <button type="button" id="btn-cancelar" style="background:#64748b; color:white; border:none; padding:10px; border-radius:4px; cursor:pointer; display:none;">Cancelar</button>
                        </div>
                    </form>
                </div>

                <div style="background:white; padding:20px; border-radius:8px; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                    <h3 style="margin-top:0; margin-bottom:15px; color:#334155;">📋 Plantillas Guardadas</h3>
                    <div style="overflow-x:auto;">
                        <table style="width:100%; border-collapse:collapse; text-align:left; font-size:14px;">
                            <thead>
                                <tr style="border-bottom:2px solid #e2e8f0; background:#f8fafc; color:#475569;">
                                    <th style="padding:10px;">Título</th>
                                    <th style="padding:10px;">Rubro</th>
                                    <th style="padding:10px;">Tiempo</th>
                                    <th style="padding:10px; text-align:right;">Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="lista-garantias">${this.renderFilas()}</tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    renderFilas() {
        if (this.datos.length === 0) {
            return `<tr><td colspan="4" style="padding:20px; text-align:center; color:#94a3b8;">No hay plantillas creadas.</td></tr>`;
        }

        return this.datos.map(g => `
            <tr style="border-bottom:1px solid #e2e8f0;">
                <td style="padding:10px;"><b>${g.titulo}</b></td>
                <td style="padding:10px;"><span style="background:#e2e8f0; color:#334155; padding:2px 6px; border-radius:4px; font-size:12px;">${g.especialidad}</span></td>
                <td style="padding:10px;">${g.duracion}</td>
                <td style="padding:10px; text-align:right;">
                    <button class="btn-editar" data-id="${g.id}" style="border:none; background:none; cursor:pointer; margin-right:5px;">✏️</button>
                    <button class="btn-eliminar" data-id="${g.id}" style="border:none; background:none; cursor:pointer;">🗑️</button>
                </td>
            </tr>
        `).join("");
    },

    // -------------------------------------------------------------------------
    // EVENTOS
    // -------------------------------------------------------------------------
    eventos() {
        const tabEmitir = document.getElementById("tab-emitir");
        const tabPlantillas = document.getElementById("tab-plantillas");

        if (tabEmitir) tabEmitir.onclick = () => { this.vistaActual = "emitir"; this.render(); this.eventos(); };
        if (tabPlantillas) tabPlantillas.onclick = () => { this.vistaActual = "plantillas"; this.render(); this.eventos(); };

        if (this.vistaActual === "emitir") this.eventosEmisor();
        else this.eventosPlantillas();
    },

    eventosEmisor() {
        const inputBuscar = document.getElementById("buscar-presupuesto-input");
        const contenedorResultados = document.getElementById("lista-resultados-presupuesto");
        const selPlantilla = document.getElementById("sel-plantilla");
        const txtAplica = document.getElementById("garantia-aplica");
        const txtExclusiones = document.getElementById("garantia-exclusiones");
        const formEmisor = document.getElementById("form-emisor-garantia");
        const btnDeseleccionar = document.getElementById("btn-deseleccionar-p");

        if (!formEmisor) return;

        // Búsqueda en tiempo real de presupuestos por Nombre o Número
        if (inputBuscar) {
            inputBuscar.oninput = (e) => {
                const query = e.target.value.toLowerCase().trim();
                if (!query) {
                    contenedorResultados.style.display = "none";
                    return;
                }

                const Coincidencias = this.presupuestos.filter(p => {
                    const clienteNombre = this.obtenerNombreCliente(p).toLowerCase();
                    const num = String(p.numero || p.id).toLowerCase();
                    return clienteNombre.includes(query) || num.includes(query);
                });

                if (Coincidencias.length === 0) {
                    contenedorResultados.innerHTML = `<div style="padding:10px; color:#94a3b8; font-size:13px;">No se encontraron presupuestos.</div>`;
                } else {
                    contenedorResultados.innerHTML = Coincidencias.map(p => `
                        <div class="item-presupuesto-res" data-id="${p.id}" style="padding:10px; border-bottom:1px solid #f1f5f9; cursor:pointer; font-size:13px;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='white'">
                            <b>${p.numero || ('N° ' + p.id)}</b> - ${this.obtenerNombreCliente(p)} (${p.fecha || 'Sin fecha'})
                        </div>
                    `).join("");
                }
                contenedorResultados.style.display = "block";
            };

            // Selección de un presupuesto de la lista
            contenedorResultados.onclick = (e) => {
                const item = e.target.closest(".item-presupuesto-res");
                if (item) {
                    const id = item.dataset.id;
                    this.presupuestoSeleccionado = this.presupuestos.find(p => p.id == id);
                    contenedorResultados.style.display = "none";
                    inputBuscar.value = "";
                    this.render();
                    this.eventos();
                }
            };
        }

        if (btnDeseleccionar) {
            btnDeseleccionar.onclick = () => {
                this.presupuestoSeleccionado = null;
                this.render();
                this.eventos();
            };
        }

        // Selección de plantilla
        if (selPlantilla) {
            selPlantilla.onchange = () => {
                const g = this.datos.find(item => item.id == selPlantilla.value);
                if (g) {
                    txtAplica.value = `Garantía (${g.duracion}): ${g.textoGarantia}`;
                    txtExclusiones.value = "Quedan expresamente excluidas de la garantía las siguientes situaciones:\n" +
                        "• Intervención o modificación de las instalaciones por parte de terceros no autorizados.\n" +
                        "• Daños provocados por mal uso, sobrecargas eléctricas o factores climáticos extremos.\n" +
                        "• Desgaste natural de insumos provistos directamente por el cliente.";
                }
            };
        }

        // Emitir PDF
        formEmisor.onsubmit = async (e) => {
            e.preventDefault();

            if (!this.presupuestoSeleccionado) {
                alert("Por favor buscá y seleccioná un presupuesto antes de imprimir.");
                return;
            }

            const clienteNombreReal = this.obtenerNombreCliente(this.presupuestoSeleccionado);

            const datosFinalesPDF = {
                ...this.presupuestoSeleccionado,
                clienteNombre: clienteNombreReal,
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
            const nuevaGarantia = {
                titulo: document.getElementById("garantia-titulo").value.trim(),
                especialidad: document.getElementById("garantia-especialidad").value,
                duracion: document.getElementById("garantia-duracion").value.trim(),
                textoGarantia: document.getElementById("garantia-texto").value.trim()
            };

            if (idInput) nuevaGarantia.id = Number(idInput);

            await save("garantias", nuevaGarantia);
            await this.cargarDatos();
            this.render();
            this.eventos();
        };

        document.getElementById("lista-garantias").onclick = async (e) => {
            const btnEditar = e.target.closest(".btn-editar");
            const btnEliminar = e.target.closest(".btn-eliminar");

            if (btnEditar) {
                const g = this.datos.find(item => item.id == btnEditar.dataset.id);
                if (g) {
                    document.getElementById("garantia-id").value = g.id;
                    document.getElementById("garantia-titulo").value = g.titulo;
                    document.getElementById("garantia-especialidad").value = g.especialidad;
                    document.getElementById("garantia-duracion").value = g.duracion;
                    document.getElementById("garantia-texto").value = g.textoGarantia;
                    document.getElementById("form-titulo").innerText = "✏️️ Editar Plantilla Base";
                    document.getElementById("btn-cancelar").style.display = "inline-block";
                }
            }

            if (btnEliminar) {
                if (confirm("¿Borrar esta plantilla de garantía?")) {
                    await remove("garantias", Number(btnEliminar.dataset.id));
                    await this.cargarDatos();
                    this.render();
                    this.eventos();
                }
            }
        };

        document.getElementById("btn-cancelar").onclick = () => {
            form.reset();
            document.getElementById("garantia-id").value = "";
            document.getElementById("form-titulo").innerText = "📜 Nueva Plantilla Base";
            document.getElementById("btn-cancelar").style.display = "none";
        };
    }
};

export default garantias;
