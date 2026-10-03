import { getAll, save, remove } from "./storage.js";
import { exportarPresupuestoPDF } from "./pdf.js";

export const garantias = {
    datos: [],
    presupuestos: [],

    async iniciar() {
        await this.cargarGarantias();
        await this.cargarPresupuestos();
        this.render();
        this.eventos();
    },

    async cargarGarantias() {
        try {
            this.datos = await getAll("garantias") || [];
        } catch (error) {
            console.error("Error al cargar las garantías:", error);
            this.datos = [];
        }
    },

    async cargarPresupuestos() {
        try {
            this.presupuestos = await getAll("presupuestos") || [];
        } catch (error) {
            console.error("Error al cargar presupuestos en garantías:", error);
            this.presupuestos = [];
        }
    },

    render() {
        const main = document.getElementById("workspace");
        if (!main) return;

        main.innerHTML = `
            <div class="workspace">
                <div class="welcome-card" style="border-left: 5px solid #104E2E;">
                    <h2>🛡️ Gestión y Certificados de Garantía</h2>
                    <p>Emití certificados de garantía exclusivos para tus clientes y administrá plantillas por rubro técnico.</p>
                </div>

                <!-- EMISIÓN RÁPIDA DE GARANTÍAS (SOLO PÁGINA DE GARANTÍA CON LOGO) -->
                <div class="dashboard-card" style="margin-top: 20px; border-top: 4px solid #104E2E;">
                    <h3 style="margin-bottom: 10px; color: #104E2E;">📄 Emitir Certificado de Garantía</h3>
                    <p style="font-size: 13px; color: #666; margin-bottom: 15px;">Seleccioná un trabajo finalizado o presupuesto para generar la Hoja Oficial de Garantía con tu identidad de marca.</p>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <select id="select-presupuesto-garantia" style="flex: 1; min-width: 250px; padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
                            <option value="">-- Seleccioná un presupuesto o trabajo --</option>
                            ${this.presupuestos.map(p => `<option value="${p.id \vert{}\vert{} p.numero}">${p.numero || 'S/N'} - ${p.clienteNombre \vert{}\vert{} 'Sin nombre'} (${p.fecha || '-'})</option>`).join('')}
                        </select>
                        <button id="btn-generar-pdf-garantia" style="background: #104E2E; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-weight: bold;">
                            📄 Descargar Certificado
                        </button>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 20px;">
                    
                    <!-- Formulario de Alta de Plantillas -->
                    <div class="dashboard-card" style="height: fit-content;">
                        <h3 id="form-titulo" style="margin-bottom: 15px; color: #104E2E;">📜 Nueva Plantilla de Garantía</h3>
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
                                </select>
                            </div>

                            <div>
                                <label style="display:block; margin-bottom:5px; font-weight:bold;">Duración:</label>
                                <input type="text" id="garantia-duracion" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;" placeholder="Ej: 6 meses / 1 año" required>
                            </div>

                            <div>
                                <label style="display:block; margin-bottom:5px; font-weight:bold;">Texto Completo de la Garantía:</label>
                                <textarea id="garantia-texto" rows="5" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px; font-family:sans-serif;" placeholder="Detallá los términos de cobertura técnica..." required></textarea>
                            </div>

                            <div style="display:flex; gap:10px;">
                                <button type="submit" class="menu-item" style="background:#104E2E; color:white; border:none; padding:10px; border-radius:4px; cursor:pointer; flex:1; justify-content:center;">Guardar Plantilla</button>
                                <button type="button" id="btn-cancelar" style="background:#6b7280; color:white; border:none; padding:10px; border-radius:4px; cursor:pointer; display:none;">X</button>
                            </div>
                        </form>
                    </div>

                    <!-- Listado de Garantías y Descarga Directa por Plantilla -->
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
                        <button class="btn-imprimir-plantilla" data-id="${g.id}" title="Imprimir esta garantía" style="border:none; background:none; cursor:pointer; margin-right:5px;">📄</button>
                        <button class="btn-editar" data-id="${g.id}" style="border:none; background:none; cursor:pointer; margin-right:5px;">✏️</button>
                        <button class="btn-eliminar" data-id="${g.id}" style="border:none; background:none; cursor:pointer;">🗑</button>
                    </td>
                </tr>
            `;
        }).join("");
    },

    eventos() {
        const form = document.getElementById("form-garantia");
        const btnGenerarPdf = document.getElementById("btn-generar-pdf-garantia");

        if (btnGenerarPdf) {
            btnGenerarPdf.onclick = () => {
                const val = document.getElementById("select-presupuesto-garantia").value;
                if (!val) {
                    alert("Por favor seleccioná un presupuesto de la lista.");
                    return;
                }
                const p = this.presupuestos.find(item => String(item.id || item.numero) === String(val));
                if (p) {
                    exportarPresupuestoPDF({ ...p, forzarGarantia: true });
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
            await this.cargarGarantias();
            this.render();
            this.eventos();
        };

        document.getElementById("lista-garantias").onclick = async (e) => {
            const btnImprimir = e.target.closest(".btn-imprimir-plantilla");
            const btnEditar = e.target.closest(".btn-editar");
            const btnEliminar = e.target.closest(".btn-eliminar");

            if (btnImprimir) {
                const id = btnImprimir.dataset.id;
                const g = this.datos.find(item => item.id == id);
                if (g) {
                    exportarPresupuestoPDF({
                        numero: `GAR-${g.id}`,
                        clienteNombre: "Cliente General",
                        garantiaAplica: g.textoGarantia,
                        forzarGarantia: true
                    });
                }
            }

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
                    await this.cargarGarantias();
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
