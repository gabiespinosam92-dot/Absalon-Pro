// modules/garantias.js
import { getAll, save, remove } from "./storage.js";
import { exportarPresupuestoPDF } from "./pdf.js";

export const garantias = {
    datos: [],
    clientes: [],
    presupuestos: [],
    tabActual: "plantillas", // 'plantillas' | 'certificados'

    async iniciar() {
        await this.cargarDatos();
        this.render();
        this.eventos();
    },

    async cargarDatos() {
        try {
            this.datos = (await getAll("garantias")) || [];
            this.clientes = (await getAll("clientes")) || [];
            this.presupuestos = (await getAll("presupuestos")) || [];
        } catch (error) {
            console.error("Error al cargar datos en garantías:", error);
            this.datos = [];
            this.clientes = [];
            this.presupuestos = [];
        }
    },

    render() {
        const main = document.getElementById("workspace") || document.getElementById("contenido") || document.getElementById("app");
        if (!main) return;

        main.innerHTML = `
            <div class="workspace">
                <div class="welcome-card" style="border-left: 5px solid #104E2E; margin-bottom: 20px;">
                    <h2>🛡️ Módulo de Garantías y Certificados</h2>
                    <p>Gestioná tus plantillas técnicas por rubro y emití certificados directos de trabajos finalizados.</p>
                </div>

                <!-- Navegación por Solapas / Pestañas -->
                <div style="display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
                    <button id="tab-btn-plantillas" style="padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 14px; background: ${this.tabActual === 'plantillas' ? '#104E2E' : '#e5e7eb'}; color: ${this.tabActual === 'plantillas' ? 'white' : '#374151'};">
                        📜 Plantillas de Garantía
                    </button>
                    <button id="tab-btn-certificados" style="padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 14px; background: ${this.tabActual === 'certificados' ? '#104E2E' : '#e5e7eb'}; color: ${this.tabActual === 'certificados' ? 'white' : '#374151'};">
                        📄 Generar Certificado de Garantía
                    </button>
                </div>

                <!-- Contenido Dinámico de la Solapa -->
                <div id="contenedor-tab-contenido">
                    ${this.tabActual === 'plantillas' ? this.renderSolapaPlantillas() : this.renderSolapaCertificados()}
                </div>
            </div>
        `;
    },

    renderSolapaPlantillas() {
        return `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                <!-- Formulario de Alta -->
                <div class="dashboard-card" style="height: fit-content; background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
                    <h3 id="form-titulo" style="margin-bottom: 15px; color: #104E2E;">📜 Nueva Plantilla</h3>
                    <form id="form-garantia" style="display: flex; flex-direction: column; gap: 12px;">
                        <input type="hidden" id="garantia-id">
                        
                        <div>
                            <label style="display:block; margin-bottom:5px; font-weight:bold;">Título:</label>
                            <input type="text" id="garantia-titulo" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;" placeholder="Ej: Garantía de Compresor R600a" required>
                        </div>

                        <div>
                            <label style="display:block; margin-bottom:5px; font-weight:bold;">Especialidad / Rubro:</label>
                            <select id="garantia-especialidad" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px; background:white;" required>
                                <option value="">Seleccioná un rubro...</option>
                                <option value="Refrigeración">Refrigeración</option>
                                <option value="Electricidad">Electricidad</option>
                                <option value="Construcción Seco">Construcción Seco</option>
                                <option value="General">Servicios Generales</option>
                            </select>
                        </div>

                        <div>
                            <label style="display:block; margin-bottom:5px; font-weight:bold;">Duración:</label>
                            <input type="text" id="garantia-duracion" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;" placeholder="Ej: 6 meses / 1 año" required>
                        </div>

                        <div>
                            <label style="display:block; margin-bottom:5px; font-weight:bold;">Texto Cobertura / Alcance:</label>
                            <textarea id="garantia-texto" rows="4" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px; font-family:sans-serif;" placeholder="Detallá los términos de cobertura técnica..." required></textarea>
                        </div>

                        <div>
                            <label style="display:block; margin-bottom:5px; font-weight:bold;">Exclusiones / Excepciones (Opcional):</label>
                            <textarea id="garantia-exclusiones" rows="3" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px; font-family:sans-serif;" placeholder="Ej: Quedan excluidas sobrecargas eléctricas o vicios propios de los insumos provistos por el cliente..."></textarea>
                        </div>

                        <div style="display:flex; gap:10px;">
                            <button type="submit" class="menu-item" style="background:#104E2E; color:white; border:none; padding:10px; border-radius:4px; cursor:pointer; flex:1; justify-content:center; font-weight:bold;">Guardar Plantilla</button>
                            <button type="button" id="btn-cancelar" style="background:#6b7280; color:white; border:none; padding:10px; border-radius:4px; cursor:pointer; display:none;">X</button>
                        </div>
                    </form>
                </div>

                <!-- Listado de Garantías -->
                <div class="dashboard-card" style="background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
                    <h3 style="margin-bottom: 15px; color: #333;">📋 Plantillas Guardadas</h3>
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

    renderSolapaCertificados() {
        const opcionesClientes = this.clientes.map(c => `
            <option value="${c.id}">${c.nombre} ${c.direccion ? `(${c.direccion})` : ''}</option>
        `).join("");

        const opcionesPlantillas = this.datos.map(g => `
            <option value="${g.id}">${g.titulo} - ${g.especialidad} (${g.duracion})</option>
        `).join("");

        return `
            <div class="card" style="max-width: 700px; margin: 0 auto; background: #fff; padding: 25px; border-radius: 8px; border: 1px solid #e5e7eb; font-family: sans-serif;">
                <h3 style="color: #104E2E; margin-top: 0; display: flex; align-items: center; gap: 8px;">
                    🎓 Emisión de Certificado de Garantía
                </h3>
                <p style="color: #666; font-size: 13px; margin-bottom: 20px;">
                    Seleccioná el cliente registrado para vincular sus datos de contacto y emitir la Orden de Trabajo Finalizado.
                </p>

                <!-- Selección de Cliente -->
                <div style="margin-bottom: 15px;">
                    <label style="font-weight: bold; font-size: 14px; display: block; margin-bottom: 5px;">1. Cliente Registrado:</label>
                    <select id="cert-cliente" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; background: white;">
                        <option value="">-- Seleccionar Cliente --</option>
                        ${opcionesClientes}
                    </select>
                </div>

                <!-- Selección de Presupuesto del Cliente -->
                <div style="margin-bottom: 15px;">
                    <label style="font-weight: bold; font-size: 14px; display: block; margin-bottom: 5px;">2. Presupuesto / Trabajo Asociado:</label>
                    <select id="cert-presupuesto" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; background: white;" disabled>
                        <option value="">-- Primero seleccioná un cliente --</option>
                    </select>
                </div>

                <!-- Selección de Plantilla de Cobertura -->
                <div style="margin-bottom: 15px;">
                    <label style="font-weight: bold; font-size: 14px; display: block; margin-bottom: 5px;">3. Plantilla de Cobertura Técnicas (Opcional):</label>
                    <select id="cert-plantilla" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; background: white;">
                        <option value="">-- Usar Texto Estándar del Sistema --</option>
                        ${opcionesPlantillas}
                    </select>
                </div>

                <!-- Vista Previa / Ajustes de Texto -->
                <div style="margin-bottom: 15px;">
                    <label style="font-weight: bold; font-size: 14px; display: block; margin-bottom: 5px;">4. Alcance y Condiciones Aplicadas:</label>
                    <textarea id="cert-texto-aplica" rows="4" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; font-family: sans-serif; box-sizing: border-box;" placeholder="Texto de cobertura que figurará en el certificado..."></textarea>
                </div>

                <div style="margin-bottom: 20px;">
                    <label style="font-weight: bold; font-size: 14px; display: block; margin-bottom: 5px;">5. Exclusiones y Excepciones:</label>
                    <textarea id="cert-texto-exclusiones" rows="3" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; font-family: sans-serif; box-sizing: border-box;" placeholder="Texto de exclusiones..."></textarea>
                </div>

                <div style="text-align: right;">
                    <button id="btnEmitirCertificado" style="padding: 12px 25px; background: #104E2E; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 15px;">
                        📄 Generar Certificado PDF
                    </button>
                </div>
            </div>
        `;
    },

    renderFilas() {
        if (this.datos.length === 0) {
            return `<tr><td colspan="4" style="padding:20px; text-align:center; color:#6b7280;">No hay plantillas de garantía creadas.</td></tr>`;
        }

        return this.datos.map(g => {
            let colorBadge = "#6b7280";
            if (g.especialidad === "Refrigeración") colorBadge = "#0284c7";
            if (g.especialidad === "Electricidad") colorBadge = "#d97706";
            if (g.especialidad === "Construcción Seco") colorBadge = "#16a34a";

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

    eventos() {
        // Eventos de Pestañas/Solapas
        const btnTabPlantillas = document.getElementById("tab-btn-plantillas");
        const btnTabCertificados = document.getElementById("tab-btn-certificados");

        if (btnTabPlantillas && btnTabCertificados) {
            btnTabPlantillas.onclick = () => {
                this.tabActual = "plantillas";
                this.render();
                this.eventos();
            };
            btnTabCertificados.onclick = () => {
                this.tabActual = "certificados";
                this.render();
                this.eventos();
            };
        }

        // Lógica de Solapa Plantillas
        if (this.tabActual === "plantillas") {
            const form = document.getElementById("form-garantia");
            if (!form) return;

            form.onsubmit = async (e) => {
                e.preventDefault();
                const idInput = document.getElementById("garantia-id").value;
                const titulo = document.getElementById("garantia-titulo").value.trim();
                const especialidad = document.getElementById("garantia-especialidad").value;
                const duracion = document.getElementById("garantia-duracion").value.trim();
                const textoGarantia = document.getElementById("garantia-texto").value.trim();
                const garantiaExclusiones = document.getElementById("garantia-exclusiones").value.trim();

                const nuevaGarantia = { 
                    titulo, 
                    especialidad, 
                    duracion, 
                    textoGarantia,
                    garantiaExclusiones
                };
                
                if (idInput) {
                    nuevaGarantia.id = Number(idInput);
                }

                await save("garantias", nuevaGarantia);
                await this.cargarDatos();
                this.render();
                this.eventos();
            };

            const listaGarantias = document.getElementById("lista-garantias");
            if (listaGarantias) {
                listaGarantias.onclick = async (e) => {
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
                            document.getElementById("garantia-texto").value = g.textoGarantia || "";
                            document.getElementById("garantia-exclusiones").value = g.garantiaExclusiones || "";
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
            }

            const btnCancelar = document.getElementById("btn-cancelar");
            if (btnCancelar) {
                btnCancelar.onclick = () => {
                    form.reset();
                    document.getElementById("garantia-id").value = "";
                    document.getElementById("form-titulo").innerText = "📜 Nueva Plantilla";
                    btnCancelar.style.display = "none";
                };
            }
        }

        // Lógica de Solapa Certificados
        if (this.tabActual === "certificados") {
            const selectCliente = document.getElementById("cert-cliente");
            const selectPresupuesto = document.getElementById("cert-presupuesto");
            const selectPlantilla = document.getElementById("cert-plantilla");
            const txtAplica = document.getElementById("cert-texto-aplica");
            const txtExclusiones = document.getElementById("cert-texto-exclusiones");
            const btnEmitir = document.getElementById("btnEmitirCertificado");

            if (selectCliente) {
                selectCliente.onchange = (e) => {
                    const clienteId = e.target.value;
                    selectPresupuesto.innerHTML = `<option value="">-- Seleccionar Presupuesto --</option>`;
                    
                    if (!clienteId) {
                        selectPresupuesto.disabled = true;
                        return;
                    }

                    const clienteSel = this.clientes.find(c => c.id == clienteId);
                    const presupuestosDelCliente = this.presupuestos.filter(p => {
                        const mId = p.clienteId && String(p.clienteId) === String(clienteId);
                        const mNombre = clienteSel && p.clienteNombre && p.clienteNombre.trim().toLowerCase() === clienteSel.nombre.trim().toLowerCase();
                        return mId || mNombre;
                    });

                    if (presupuestosDelCliente.length === 0) {
                        selectPresupuesto.innerHTML = `<option value="">Sin presupuestos vinculados (se usará S/N)</option>`;
                    } else {
                        presupuestosDelCliente.forEach(p => {
                            selectPresupuesto.innerHTML += `
                                <option value="${p.id || p.numero}">N° ${p.numero || 'S/N'} - ${p.fecha || ''} ($ ${(p.total || 0).toLocaleString('es-AR')})</option>
                            `;
                        });
                    }

                    selectPresupuesto.disabled = false;
                };
            }

            if (selectPlantilla) {
                selectPlantilla.onchange = (e) => {
                    const plantillaId = e.target.value;
                    const g = this.datos.find(item => item.id == plantillaId);
                    if (g) {
                        txtAplica.value = g.textoGarantia || "";
                        txtExclusiones.value = g.garantiaExclusiones || "";
                    }
                };
            }

            if (btnEmitir) {
                btnEmitir.onclick = async () => {
                    const clienteId = selectCliente.value;
                    if (!clienteId) {
                        alert("Por favor, seleccioná un cliente registrado.");
                        return;
                    }

                    const clienteObj = this.clientes.find(c => c.id == clienteId);
                    const presVal = selectPresupuesto.value;
                    let presupuestoObj = this.presupuestos.find(p => (p.id == presVal || p.numero == presVal));

                    // Si no tiene presupuesto asociado, armamos uno base con los datos completos del cliente
                    if (!presupuestoObj) {
                        presupuestoObj = {
                            numero: "S/N",
                            fecha: new Date().toLocaleDateString("es-AR"),
                            clienteNombre: clienteObj.nombre,
                            clienteDireccion: clienteObj.direccion || "",
                            clienteTelefono: clienteObj.telefono || "",
                            clienteTipoDoc: clienteObj.tipoDocumento || "CUIL/CUIT",
                            clienteNumDoc: clienteObj.numeroDocumento || ""
                        };
                    } else {
                        presupuestoObj = {
                            ...presupuestoObj,
                            clienteNombre: clienteObj.nombre,
                            clienteDireccion: clienteObj.direccion || presupuestoObj.clienteDireccion || "",
                            clienteTelefono: clienteObj.telefono || presupuestoObj.clienteTelefono || "",
                            clienteTipoDoc: clienteObj.tipoDocumento || presupuestoObj.clienteTipoDoc || "CUIL/CUIT",
                            clienteNumDoc: clienteObj.numeroDocumento || presupuestoObj.clienteNumDoc || ""
                        };
                    }

                    // Inyectamos textos modificados de la vista
                    presupuestoObj.garantiaAplica = txtAplica.value.trim();
                    presupuestoObj.garantiaExclusiones = txtExclusiones.value.trim();
                    presupuestoObj.esGarantiaDirecta = true;

                    await exportarPresupuestoPDF(presupuestoObj);
                };
            }
        }
    }
};

export const iniciar = async () => {
    await garantias.iniciar();
};

export default garantias;
