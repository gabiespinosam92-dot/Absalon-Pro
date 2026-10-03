import { getAll, save, remove } from "./storage.js";
import { exportarPresupuestoPDF } from "./pdf.js";

export const garantias = {
    datos: [],
    presupuestos: [],
    clientes: [],

    async iniciar() {
        await this.cargarDatos();
        this.render();
        this.poblarSelectClientes();
        this.eventos();
    },

    async cargarDatos() {
        try {
            this.datos = (await getAll("garantias")) || [];
            this.presupuestos = (await getAll("presupuestos")) || [];
            this.clientes = (await getAll("clientes")) || [];
        } catch (error) {
            console.error("Error al cargar datos en garantías:", error);
            this.datos = [];
            this.presupuestos = [];
            this.clientes = [];
        }
    },

    poblarSelectClientes() {
        const selectCliente = document.getElementById("select-cliente-garantia");
        if (!selectCliente) return;

        selectCliente.innerHTML = `<option value="">-- 1° Seleccioná un Cliente --</option>`;

        // Si hay clientes guardados los mapeamos, de lo contrario agrupamos desde los presupuestos
        let listaClientes = [];
        if (this.clientes && this.clientes.length > 0) {
            listaClientes = this.clientes.map(c => ({ id: c.id, nombre: c.nombre || c.clienteNombre }));
        } else {
            // Extraer clientes únicos desde los presupuestos existentes
            const nombresUnicos = [...new Set(this.presupuestos.map(p => p.clienteNombre).filter(Boolean))];
            listaClientes = nombresUnicos.map(nombre => ({ id: nombre, nombre }));
        }

        listaClientes.forEach(c => {
            const opt = document.createElement("option");
            opt.value = c.nombre;
            opt.textContent = c.nombre;
            selectCliente.appendChild(opt);
        });
    },

    filtrarPresupuestosPorCliente(nombreCliente) {
        const selectPresupuesto = document.getElementById("select-presupuesto-garantia");
        if (!selectPresupuesto) return;

        selectPresupuesto.innerHTML = "";

        if (!nombreCliente) {
            selectPresupuesto.disabled = true;
            selectPresupuesto.innerHTML = `<option value="">-- Primero seleccioná un cliente --</option>`;
            return;
        }

        const filtrados = this.presupuestos.filter(p => 
            p.clienteNombre && p.clienteNombre.toLowerCase().trim() === nombreCliente.toLowerCase().trim()
        );

        if (filtrados.length === 0) {
            selectPresupuesto.disabled = true;
            selectPresupuesto.innerHTML = `<option value="">-- No hay presupuestos para este cliente --</option>`;
            return;
        }

        selectPresupuesto.disabled = false;
        const defaultOpt = document.createElement("option");
        defaultOpt.value = "";
        defaultOpt.textContent = `-- 2° Seleccioná el Presupuesto / Trabajo (${filtrados.length}) --`;
        selectPresupuesto.appendChild(defaultOpt);

        filtrados.forEach(p => {
            const opt = document.createElement("option");
            opt.value = p.id || p.numero;
            const num = p.numero || "S/N";
            const fec = p.fecha || "-";
            const total = p.total ? ` - $${Number(p.total).toLocaleString('es-AR')}` : '';
            opt.textContent = `N° ${num} (${fec})${total}`;
            selectPresupuesto.appendChild(opt);
        });
    },

    render() {
        const main = document.getElementById("workspace");
        if (!main) return;

        main.innerHTML = `
            <div class="workspace">
                <div class="welcome-card" style="border-left: 5px solid #104E2E;">
                    <h2>🛡️ Gestión y Certificados de Garantía</h2>
                    <p>Emití certificados de garantía oficiales vinculados a la ficha de tus clientes y presupuestos.</p>
                </div>

                <!-- EMISIÓN RÁPIDA DE GARANTÍAS -->
                <div class="dashboard-card" style="margin-top: 20px; border-top: 4px solid #104E2E;">
                    <h3 style="margin-bottom: 10px; color: #104E2E;">📄 Emitir Certificado de Garantía</h3>
                    <p style="font-size: 13px; color: #666; margin-bottom: 15px;">
                        Seleccioná un cliente para filtrar sus trabajos registrados y generar la Hoja Oficial con membrete e identidad de marca.
                    </p>
                    
                    <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
                        <select id="select-cliente-garantia" style="flex: 1; min-width: 220px; padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-weight: 500;">
                            <option value="">Cargando clientes...</option>
                        </select>

                        <select id="select-presupuesto-garantia" disabled style="flex: 1; min-width: 250px; padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
                            <option value="">-- Primero seleccioná un cliente --</option>
                        </select>

                        <button id="btn-generar-pdf-garantia" style="background: #104E2E; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-weight: bold; min-width: 180px;">
                            📄 Descargar Certificado
                        </button>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 20px;">
                    
                    <!-- Formulario de Plantillas -->
                    <div class="dashboard-card" style="height: fit-content;">
                        <h3 id="form-titulo" style="margin-bottom: 15px; color: #104E2E;">📜 Nueva Plantilla de Garantía</h3>
                        <form id="form-garantia" style="display: flex; flex-direction: column; gap: 12px;">
                            <input type="hidden" id="garantia-id">
                            
                            <div>
                                <label style="display:block; margin-bottom:5px; font-weight:bold;">Título:</label>
                                <input type="text" id="garantia-titulo" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;" placeholder="Ej: Garantía de Instalación R600a" required>
                            </div>

                            <div>
                                <label style="display:block; margin-bottom:5px; font-weight:bold;">Especialidad / Rubro:</label>
                                <select id="garantia-especialidad" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;" required>
                                    <option value="">Seleccioná un rubro...</option>
                                    <option value="Refrigeración">Refrigeración</option>
                                    <option value="Electricidad">Electricidad</option>
                                    <option value="Construcción Seco">Construcción Seco</option>
                                </select>
                            </div>

                            <div>
                                <label style="display:block; margin-bottom:5px; font-weight:bold;">Duración:</label>
                                <input type="text" id="garantia-duracion" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;" placeholder="Ej: 6 meses / 1 año" required>
                            </div>

                            <div>
                                <label style="display:block; margin-bottom:5px; font-weight:bold;">Texto Completo de la Garantía:</label>
                                <textarea id="garantia-texto" rows="5" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px; font-family:sans-serif;" placeholder="Términos y condiciones de la garantía técnica..." required></textarea>
                            </div>

                            <div style="display:flex; gap:10px;">
                                <button type="submit" style="background:#104E2E; color:white; border:none; padding:10px; border-radius:4px; cursor:pointer; flex:1; font-weight:bold;">Guardar Plantilla</button>
                                <button type="button" id="btn-cancelar" style="background:#6b7280; color:white; border:none; padding:10px; border-radius:4px; cursor:pointer; display:none;">X</button>
                            </div>
                        </form>
                    </div>

                    <!-- Listado de Plantillas -->
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
            </div>
        `;
    },

    renderFilas() {
        if (!this.datos || this.datos.length === 0) {
            return `<tr><td colspan="4" style="padding:20px; text-align:center; color:#6b7280;">No hay plantillas de garantía creadas.</td></tr>`;
        }

        return this.datos.map((g) => {
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
                        <button class="btn-editar" data-id="${g.id}" style="border:none; background:none; cursor:pointer; margin-right:5px;" title="Editar">✏️</button>
                        <button class="btn-eliminar" data-id="${g.id}" style="border:none; background:none; cursor:pointer;" title="Eliminar">🗑</button>
                    </td>
                </tr>
            `;
        }).join("");
    },

    eventos() {
        const selectCliente = document.getElementById("select-cliente-garantia");
        const selectPresupuesto = document.getElementById("select-presupuesto-garantia");
        const btnGenerarPdf = document.getElementById("btn-generar-pdf-garantia");
        const form = document.getElementById("form-garantia");

        // Evento al cambiar de cliente: Filtra el segundo selector
        if (selectCliente) {
            selectCliente.onchange = (e) => {
                this.filtrarPresupuestosPorCliente(e.target.value);
            };
        }

        // Evento para generar el PDF de garantía con el presupuesto y cliente seleccionado
        if (btnGenerarPdf) {
            btnGenerarPdf.onclick = () => {
                const clienteSel = selectCliente ? selectCliente.value : "";
                const presuVal = selectPresupuesto ? selectPresupuesto.value : "";

                if (!clienteSel) {
                    alert("Por favor elegí un Cliente primero.");
                    return;
                }
                if (!presuVal) {
                    alert("Por favor elegí un Presupuesto de la lista.");
                    return;
                }

                const p = this.presupuestos.find(
                    (item) => String(item.id || item.numero) === String(presuVal)
                );

                if (p) {
                    // Garantiza el nombre de cliente y la bandera de garantía
                    exportarPresupuestoPDF({
                        ...p,
                        clienteNombre: clienteSel || p.clienteNombre,
                        forzarGarantia: true
                    });
                } else {
                    alert("No se encontró la información del presupuesto seleccionado.");
                }
            };
        }

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
            this.poblarSelectClientes();
            this.eventos();
        };

        const listaGarantias = document.getElementById("lista-garantias");
        if (listaGarantias) {
            listaGarantias.onclick = async (e) => {
                const btnEditar = e.target.closest(".btn-editar");
                const btnEliminar = e.target.closest(".btn-eliminar");

                if (btnEditar) {
                    const id = btnEditar.dataset.id;
                    const g = this.datos.find((item) => item.id == id);
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
                        this.poblarSelectClientes();
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
};

export default garantias;
