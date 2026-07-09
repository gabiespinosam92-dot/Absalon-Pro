import { getAll, save, remove } from "./storage.js";

export const garantias = {
    datos: [],

    async iniciar() {
        await this.cargarGarantias();
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

   render() {
        // Cambiado a "workspace" para unificar con el enrutador de app.js
        const main = document.getElementById("workspace");
        if (!main) return;

        main.innerHTML = `
            <div class="workspace">
                <div class="welcome-card" style="border-left: 5px solid #104E2E;">
                    <h2>🛡️ Plantillas de Garantía</h2>
                    <p>Configurá y administrá los textos de tus garantías por rubro técnico.</p>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 20px;">
                    
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
            
            // Si estamos editando, le pasamos el ID numérico real de IndexedDB
            if (idInput) {
                nuevaGarantia.id = Number(idInput);
            }

            await save("garantias", nuevaGarantia);
            await this.cargarGarantias();
            this.render();
            this.eventos();
        };

        document.getElementById("lista-garantias").onclick = async (e) => {
            const btnEditar = e.target.closest(".btn-editar");
            const btnEliminar = e.target.closest(".btn-eliminar");

            if (btnEditar) {
                const id = btnEditar.dataset.id;
                // Buscamos comparando tanto string como número por seguridad
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