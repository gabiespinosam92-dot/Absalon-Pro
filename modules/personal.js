/* ==========================================================
   ABSALON PRO
   PERSONAL.JS - GESTIÓN DE PERSONAL, RUBROS, HORAS Y PAGOS
========================================================== */

import { getAll, add, update, remove } from "./storage.js";

const RUBROS_DISPONIBLES = [
    "Refrigeración",
    "Electricidad",
    "Construcción Seco",
    "Albañilería",
    "Plomería",
    "General / Obra"
];

const Personal = {
    empleados: [],
    registrosHoras: [],
    tabActiva: "equipo", // "equipo" | "horas" | "pagos"
    editandoId: null,

    async iniciar() {
        await this.load();
    },

    async load() {
        const workspace = document.getElementById("workspace");
        if (!workspace) return;

        try {
            this.empleados = (await getAll("personal")) || [];
            this.registrosHoras = (await getAll("horas_personal")) || [];
        } catch (err) {
            console.error("Error cargando datos de personal:", err);
            this.empleados = [];
            this.registrosHoras = [];
        }

        this.renderShell(workspace);
        this.renderTabContent();
    },

    fmtMoney(valor) {
        return Number(valor || 0).toLocaleString("es-AR", {
            style: "currency",
            currency: "ARS",
            minimumFractionDigits: 2
        });
    },

    renderShell(workspace) {
        workspace.innerHTML = `
            <div style="max-width: 960px; margin: 0 auto; font-family: sans-serif;">
                <div class="card" style="margin-bottom: 18px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
                        <div>
                            <h2 style="color:#104E2E; margin:0;">👷 Gestión de Personal, Rubros y Pagos</h2>
                            <p style="color:#64748b; font-size:13px; margin:4px 0 0 0;">
                                Administrá oficiales y ayudantes, sus rubros habilitados, carga de horas y liquidaciones.
                            </p>
                        </div>
                        <div style="display:flex; gap:8px; flex-wrap:wrap;">
                            <button id="tabEquipo" data-tab="equipo" style="padding:9px 14px; border:none; border-radius:6px; cursor:pointer; font-weight:bold; background:${this.tabActiva === "equipo" ? "#104E2E" : "#e2e8f0"}; color:${this.tabActiva === "equipo" ? "#fff" : "#334155"};">
                                👥 Personal (${this.empleados.length})
                            </button>
                            <button id="tabHoras" data-tab="horas" style="padding:9px 14px; border:none; border-radius:6px; cursor:pointer; font-weight:bold; background:${this.tabActiva === "horas" ? "#104E2E" : "#e2e8f0"}; color:${this.tabActiva === "horas" ? "#fff" : "#334155"};">
                                ⏱️ Cargar Horas
                            </button>
                            <button id="tabPagos" data-tab="pagos" style="padding:9px 14px; border:none; border-radius:6px; cursor:pointer; font-weight:bold; background:${this.tabActiva === "pagos" ? "#104E2E" : "#e2e8f0"}; color:${this.tabActiva === "pagos" ? "#fff" : "#334155"};">
                                💰 Pagos y Liquidación
                            </button>
                        </div>
                    </div>
                </div>

                <div id="contenidoTabPersonal"></div>
            </div>
        `;

        ["tabEquipo", "tabHoras", "tabPagos"].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.onclick = () => {
                    this.tabActiva = btn.dataset.tab;
                    this.editandoId = null;
                    this.renderShell(workspace);
                    this.renderTabContent();
                };
            }
        });
    },

    renderTabContent() {
        const container = document.getElementById("contenidoTabPersonal");
        if (!container) return;

        if (this.tabActiva === "equipo") {
            this.renderVistaEquipo(container);
        } else if (this.tabActiva === "horas") {
            this.renderVistaHoras(container);
        } else if (this.tabActiva === "pagos") {
            this.renderVistaPagos(container);
        }
    },

    /* ==========================================================
       1. VISTA EQUIPO (OFICIALES / AYUDANTES Y RUBROS)
    ========================================================== */
    renderVistaEquipo(container) {
        const empEdit = this.editandoId
            ? this.empleados.find(e => Number(e.id) === Number(this.editandoId))
            : null;

        const rubrosSel = empEdit?.rubros || [];
        const checksRubrosHTML = RUBROS_DISPONIBLES.map(r => {
            const checked = rubrosSel.includes(r) ? "checked" : "";
            return `
                <label style="display:flex; align-items:center; gap:6px; background:#f8fafc; padding:6px 10px; border:1px solid #cbd5e1; border-radius:6px; cursor:pointer; font-size:13px;">
                    <input type="checkbox" class="pers-rubro" value="${r}" ${checked}>
                    ${r}
                </label>
            `;
        }).join("");

        container.innerHTML = `
            <div class="card" style="margin-bottom:20px;">
                <h3 style="color:#104E2E; margin-top:0;">
                    ${empEdit ? `✏️ Editar Integrante: ${empEdit.nombre}` : "➕ Registrar Personal"}
                </h3>

                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:14px; margin-bottom:14px;">
                    <div>
                        <label style="font-weight:bold; font-size:13px;">Nombre y Apellido *</label>
                        <input id="persNombre" type="text" value="${empEdit?.nombre || ""}" placeholder="Ej: Nicolás / Bruno" style="width:100%; padding:8px; margin-top:4px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px;">
                    </div>

                    <div>
                        <label style="font-weight:bold; font-size:13px;">Categoría / Puesto *</label>
                        <select id="persCategoria" style="width:100%; padding:8px; margin-top:4px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px; background:#fff;">
                            <option value="Oficial" ${empEdit?.categoria === "Oficial" ? "selected" : ""}>Oficial</option>
                            <option value="Medio Oficial" ${empEdit?.categoria === "Medio Oficial" ? "selected" : ""}>Medio Oficial</option>
                            <option value="Ayudante" ${empEdit?.categoria === "Ayudante" ? "selected" : ""}>Ayudante</option>
                        </select>
                    </div>

                    <div>
                        <label style="font-weight:bold; font-size:13px;">Valor Hora Normal ($)</label>
                        <input id="persValorHora" type="number" step="0.01" min="0" value="${empEdit?.valorHora ?? 0}" style="width:100%; padding:8px; margin-top:4px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px;">
                    </div>

                    <div>
                        <label style="font-weight:bold; font-size:13px;">Valor Hora Extra ($)</label>
                        <input id="persValorExtra" type="number" step="0.01" min="0" value="${empEdit?.valorHoraExtra ?? ""}" placeholder="Vacío = 1.5x hora normal" style="width:100%; padding:8px; margin-top:4px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px;">
                    </div>
                </div>

                <div style="margin-bottom:14px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:6px;">
                        <label style="font-weight:bold; font-size:13px;">Rubros Habilitados</label>
                        <button type="button" id="btnTodosRubros" style="font-size:12px; padding:4px 8px; border:1px solid #104E2E; background:#f0fdf4; color:#104E2E; border-radius:4px; cursor:pointer; font-weight:bold;">
                            ✅ Todos los rubros (Oficial polirubro)
                        </button>
                    </div>
                    <div id="contenedorRubrosPers" style="display:flex; gap:8px; flex-wrap:wrap;">
                        ${checksRubrosHTML}
                    </div>
                </div>

                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:14px; margin-bottom:16px;">
                    <div>
                        <label style="font-weight:bold; font-size:13px;">Teléfono</label>
                        <input id="persTelefono" type="text" value="${empEdit?.telefono || ""}" placeholder="Ej: 3624XXXXXX" style="width:100%; padding:8px; margin-top:4px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px;">
                    </div>
                    <div>
                        <label style="font-weight:bold; font-size:13px;">Notas / Observaciones</label>
                        <input id="persObs" type="text" value="${empEdit?.observaciones || ""}" placeholder="Ej: Matrícula, herramientas propias..." style="width:100%; padding:8px; margin-top:4px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px;">
                    </div>
                </div>

                <div style="display:flex; justify-content:flex-end; gap:10px;">
                    ${empEdit ? `<button id="btnCancelarEdicionPers" style="padding:10px 16px; background:#cbd5e1; color:#1e293b; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">Cancelar</button>` : ""}
                    <button id="btnGuardarPersonal" style="padding:10px 22px; background:#104E2E; color:white; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">
                        ${empEdit ? "🔄 Actualizar" : "💾 Guardar Personal"}
                    </button>
                </div>
            </div>

            <div class="card">
                <h3 style="color:#334155; margin-top:0;">📋 Equipo Registrado</h3>
                <div id="listadoPersonal"></div>
            </div>
        `;

        document.getElementById("btnTodosRubros").onclick = () => {
            document.querySelectorAll(".pers-rubro").forEach(cb => {
                cb.checked = true;
            });
        };

        if (empEdit) {
            document.getElementById("btnCancelarEdicionPers").onclick = () => {
                this.editandoId = null;
                this.renderTabContent();
            };
        }

        document.getElementById("btnGuardarPersonal").onclick = () => this.guardarEmpleado();
        this.renderListadoEmpleados();
    },

    async guardarEmpleado() {
        const nombre = document.getElementById("persNombre").value.trim();
        const categoria = document.getElementById("persCategoria").value;
        const valorHora = Number(document.getElementById("persValorHora").value || 0);
        const rawExtra = document.getElementById("persValorExtra").value.trim();
        const valorHoraExtra = rawExtra === "" ? Number((valorHora * 1.5).toFixed(2)) : Number(rawExtra);
        const telefono = document.getElementById("persTelefono").value.trim();
        const observaciones = document.getElementById("persObs").value.trim();

        const rubros = [];
        document.querySelectorAll(".pers-rubro:checked").forEach(cb => rubros.push(cb.value));

        if (!nombre) {
            alert("Ingresá el nombre del integrante.");
            return;
        }
        if (rubros.length === 0) {
            alert("Seleccioná al menos un rubro.");
            return;
        }

        try {
            if (this.editandoId) {
                const existente = this.empleados.find(e => Number(e.id) === Number(this.editandoId));
                const actualizado = {
                    ...existente,
                    nombre,
                    categoria,
                    rubros,
                    valorHora,
                    valorHoraExtra,
                    telefono,
                    observaciones
                };
                await update("personal", actualizado);
                alert(`✅ "${nombre}" actualizado.`);
                this.editandoId = null;
            } else {
                const ids = this.empleados.map(e => Number(e.id || 0));
                const proximoId = ids.length > 0 ? Math.max(...ids) + 1 : 1;

                const nuevo = {
                    id: proximoId,
                    nombre,
                    categoria,
                    rubros,
                    valorHora,
                    valorHoraExtra,
                    telefono,
                    observaciones,
                    activo: true
                };
                await add("personal", nuevo);
                alert(`🎉 "${nombre}" registrado como ${categoria}.`);
            }

            await this.load();
        } catch (err) {
            console.error("Error guardando personal:", err);
            alert("No se pudo guardar el registro.");
        }
    },

    renderListadoEmpleados() {
        const cont = document.getElementById("listadoPersonal");
        if (!cont) return;

        if (this.empleados.length === 0) {
            cont.innerHTML = `<p style="color:#64748b; font-style:italic;">Aún no cargaste personal (ej. Nicolás como Oficial, Bruno como Ayudante).</p>`;
            return;
        }

        const ordenados = [...this.empleados].sort((a, b) => a.nombre.localeCompare(b.nombre));

        cont.innerHTML = ordenados.map(emp => {
            const esOficial = emp.categoria === "Oficial";
            const badgeBg = esOficial ? "#dcfce7" : (emp.categoria === "Ayudante" ? "#fef9c3" : "#e0f2fe");
            const badgeColor = esOficial ? "#166534" : (emp.categoria === "Ayudante" ? "#854d0e" : "#075985");
            const rubrosTexto = Array.isArray(emp.rubros) && emp.rubros.length > 0 ? emp.rubros.join(" · ") : "Sin rubro";

            return `
                <div style="background:#f8fafc; border-left:4px solid #104E2E; padding:12px 14px; border-radius:6px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                    <div>
                        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                            <strong style="font-size:16px; color:#0f172a;">${emp.nombre}</strong>
                            <span style="background:${badgeBg}; color:${badgeColor}; padding:2px 8px; border-radius:10px; font-size:12px; font-weight:bold;">
                                ${emp.categoria || "Personal"}
                            </span>
                            <span style="font-size:13px; color:#104E2E; font-weight:bold;">
                                ${this.fmtMoney(emp.valorHora)}/h
                            </span>
                            <span style="font-size:12px; color:#64748b;">
                                (Extra: ${this.fmtMoney(emp.valorHoraExtra ?? (emp.valorHora * 1.5))}/h)
                            </span>
                        </div>
                        <div style="font-size:13px; color:#334155; margin-top:4px;">
                            🛠️ <strong>Rubros:</strong> ${rubrosTexto}
                        </div>
                        ${(emp.telefono || emp.observaciones) ? `
                            <div style="font-size:12px; color:#64748b; margin-top:2px;">
                                ${emp.telefono ? `📞 ${emp.telefono}` : ""}
                                ${emp.telefono && emp.observaciones ? " | " : ""}
                                ${emp.observaciones ? `📝 ${emp.observaciones}` : ""}
                            </div>
                        ` : ""}
                    </div>
                    <div style="display:flex; gap:6px;">
                        <button class="btn-editar-pers" data-id="${emp.id}" style="padding:6px 10px; background:#0284c7; color:#fff; border:none; border-radius:4px; cursor:pointer; font-size:12px; font-weight:bold;">✏️ Editar</button>
                        <button class="btn-borrar-pers" data-id="${emp.id}" style="padding:6px 10px; background:#ef4444; color:#fff; border:none; border-radius:4px; cursor:pointer; font-size:12px; font-weight:bold;">🗑️</button>
                    </div>
                </div>
            `;
        }).join("");

        cont.querySelectorAll(".btn-editar-pers").forEach(btn => {
            btn.onclick = () => {
                this.editandoId = Number(btn.dataset.id);
                this.renderTabContent();
            };
        });

        cont.querySelectorAll(".btn-borrar-pers").forEach(btn => {
            btn.onclick = async () => {
                const id = Number(btn.dataset.id);
                if (confirm("¿Eliminar este integrante del personal?")) {
                    await remove("personal", id);
                    await this.load();
                }
            };
        });
    },

    /* ==========================================================
       2. VISTA CARGA DE HORAS
    ========================================================== */
    renderVistaHoras(container) {
        const hoy = new Date().toISOString().split("T")[0];

        if (this.empleados.length === 0) {
            container.innerHTML = `
                <div class="card">
                    <h3 style="color:#104E2E; margin-top:0;">⏱️ Cargar Horas</h3>
                    <p style="color:#64748b;">Primero cargá al menos una persona en la pestaña <strong>Personal</strong>.</p>
                </div>
            `;
            return;
        }

        const opcionesEmp = this.empleados.map(e =>
            `<option value="${e.id}">${e.nombre} (${e.categoria} - ${this.fmtMoney(e.valorHora)}/h)</option>`
        ).join("");

        container.innerHTML = `
            <div class="card" style="margin-bottom:20px;">
                <h3 style="color:#104E2E; margin-top:0;">⏱️ Registrar Jornada / Horas</h3>

                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:14px; margin-bottom:14px;">
                    <div>
                        <label style="font-weight:bold; font-size:13px;">Integrante *</label>
                        <select id="horaEmpleado" style="width:100%; padding:8px; margin-top:4px; border:1px solid #ccc; border-radius:4px; background:#fff;">
                            ${opcionesEmp}
                        </select>
                    </div>

                    <div>
                        <label style="font-weight:bold; font-size:13px;">Fecha *</label>
                        <input id="horaFecha" type="date" value="${hoy}" style="width:100%; padding:8px; margin-top:4px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px;">
                    </div>

                    <div>
                        <label style="font-weight:bold; font-size:13px;">Rubro de la Tarea *</label>
                        <select id="horaRubro" style="width:100%; padding:8px; margin-top:4px; border:1px solid #ccc; border-radius:4px; background:#fff;"></select>
                    </div>
                </div>

                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap:14px; margin-bottom:14px;">
                    <div>
                        <label style="font-weight:bold; font-size:13px;">Horas Normales</label>
                        <input id="horaNormales" type="number" step="0.5" min="0" value="8" style="width:100%; padding:8px; margin-top:4px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px;">
                    </div>

                    <div>
                        <label style="font-weight:bold; font-size:13px;">Horas Extras</label>
                        <input id="horaExtras" type="number" step="0.5" min="0" value="0" style="width:100%; padding:8px; margin-top:4px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px;">
                    </div>

                    <div>
                        <label style="font-weight:bold; font-size:13px;">Adelanto / Descuento ($)</label>
                        <input id="horaDescuento" type="number" step="0.01" min="0" value="0" style="width:100%; padding:8px; margin-top:4px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px;">
                    </div>

                    <div>
                        <label style="font-weight:bold; font-size:13px;">Detalle / Obra</label>
                        <input id="horaDetalle" type="text" placeholder="Ej: Instalación split / pared durlock" style="width:100%; padding:8px; margin-top:4px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px;">
                    </div>
                </div>

                <div style="background:#f0fdf4; border:1px solid #bbf7d0; padding:10px 14px; border-radius:6px; margin-bottom:14px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                    <span style="font-size:13px; color:#166534;"><strong>Importe estimado del registro:</strong></span>
                    <strong id="previewMontoHora" style="font-size:17px; color:#104E2E;">$ 0,00</strong>
                </div>

                <div style="text-align:right;">
                    <button id="btnGuardarHoras" style="padding:10px 22px; background:#104E2E; color:white; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">
                        💾 Guardar Horas
                    </button>
                </div>
            </div>

            <div class="card">
                <h3 style="color:#334155; margin-top:0;">🕒 Últimos Registros de Horas</h3>
                <div id="tablaHorasCargadas" style="overflow-x:auto;"></div>
            </div>
        `;

        const selectEmp = document.getElementById("horaEmpleado");
        const selectRubro = document.getElementById("horaRubro");

        const poblarRubrosEmpleado = () => {
            const emp = this.empleados.find(e => Number(e.id) === Number(selectEmp.value));
            const lista = (emp && Array.isArray(emp.rubros) && emp.rubros.length > 0)
                ? emp.rubros
                : RUBROS_DISPONIBLES;
            selectRubro.innerHTML = lista.map(r => `<option value="${r}">${r}</option>`).join("");
            actualizarPreview();
        };

        const actualizarPreview = () => {
            const emp = this.empleados.find(e => Number(e.id) === Number(selectEmp.value));
            if (!emp) return;
            const hn = Number(document.getElementById("horaNormales").value || 0);
            const he = Number(document.getElementById("horaExtras").value || 0);
            const desc = Number(document.getElementById("horaDescuento").value || 0);
            const vHora = Number(emp.valorHora || 0);
            const vExtra = emp.valorHoraExtra !== undefined && emp.valorHoraExtra !== null
                ? Number(emp.valorHoraExtra)
                : vHora * 1.5;

            const total = Math.max(0, (hn * vHora) + (he * vExtra) - desc);
            document.getElementById("previewMontoHora").textContent = this.fmtMoney(total);
        };

        selectEmp.onchange = poblarRubrosEmpleado;
        ["horaNormales", "horaExtras", "horaDescuento"].forEach(id => {
            document.getElementById(id).oninput = actualizarPreview;
        });

        poblarRubrosEmpleado();

        document.getElementById("btnGuardarHoras").onclick = () => this.guardarRegistroHoras();
        this.renderTablaHoras(document.getElementById("tablaHorasCargadas"));
    },

    async guardarRegistroHoras() {
        const empleadoId = Number(document.getElementById("horaEmpleado").value);
        const fecha = document.getElementById("horaFecha").value;
        const rubro = document.getElementById("horaRubro").value;
        const horasNormales = Number(document.getElementById("horaNormales").value || 0);
        const horasExtras = Number(document.getElementById("horaExtras").value || 0);
        const descuento = Number(document.getElementById("horaDescuento").value || 0);
        const detalle = document.getElementById("horaDetalle").value.trim();

        const emp = this.empleados.find(e => Number(e.id) === empleadoId);
        if (!emp || !fecha) {
            alert("Completá el integrante y la fecha.");
            return;
        }
        if (horasNormales <= 0 && horasExtras <= 0) {
            alert("Ingresá al menos horas normales o extras.");
            return;
        }

        const valorHora = Number(emp.valorHora || 0);
        const valorHoraExtra = emp.valorHoraExtra !== undefined && emp.valorHoraExtra !== null
            ? Number(emp.valorHoraExtra)
            : Number((valorHora * 1.5).toFixed(2));

        const montoTotal = Math.max(0, (horasNormales * valorHora) + (horasExtras * valorHoraExtra) - descuento);

        const ids = this.registrosHoras.map(r => Number(r.id || 0));
        const proximoId = ids.length > 0 ? Math.max(...ids) + 1 : 1;

        const registro = {
            id: proximoId,
            empleadoId,
            nombreEmpleado: emp.nombre,
            categoriaEmpleado: emp.categoria,
            fecha,
            rubro,
            horasNormales,
            horasExtras,
            valorHora,
            valorHoraExtra,
            descuento,
            montoTotal,
            detalle,
            pagado: false
        };

        try {
            await add("horas_personal", registro);
            alert("✅ Horas registradas.");
            await this.load();
        } catch (err) {
            console.error("Error guardando horas:", err);
            alert("No se pudieron guardar las horas.");
        }
    },

    renderTablaHoras(cont) {
        if (!cont) return;
        if (this.registrosHoras.length === 0) {
            cont.innerHTML = `<p style="color:#64748b; font-style:italic;">No hay horas cargadas todavía.</p>`;
            return;
        }

        const recientes = [...this.registrosHoras].sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)) || b.id - a.id);

        cont.innerHTML = `
            <table style="width:100%; border-collapse:collapse; font-size:13px;">
                <thead>
                    <tr style="background:#f1f5f9; color:#334155; text-align:left; border-bottom:2px solid #cbd5e1;">
                        <th style="padding:8px;">Fecha</th>
                        <th style="padding:8px;">Persona</th>
                        <th style="padding:8px;">Rubro</th>
                        <th style="padding:8px;">Hs N / Ext</th>
                        <th style="padding:8px;">Importe</th>
                        <th style="padding:8px;">Estado</th>
                        <th style="padding:8px;"></th>
                    </tr>
                </thead>
                <tbody>
                    ${recientes.map(r => `
                        <tr style="border-bottom:1px solid #e2e8f0;">
                            <td style="padding:8px;">${r.fecha}</td>
                            <td style="padding:8px;"><strong>${r.nombreEmpleado}</strong> <span style="color:#64748b;">(${r.categoriaEmpleado || ""})</span></td>
                            <td style="padding:8px;">${r.rubro || "-"}</td>
                            <td style="padding:8px;">${r.horasNormales || 0}h / ${r.horasExtras || 0}h</td>
                            <td style="padding:8px; font-weight:bold;">${this.fmtMoney(r.montoTotal)}</td>
                            <td style="padding:8px;">
                                <span style="padding:2px 8px; border-radius:8px; font-size:11px; font-weight:bold; background:${r.pagado ? "#dcfce7" : "#fef3c7"}; color:${r.pagado ? "#166534" : "#92400e"};">
                                    ${r.pagado ? "Pagado" : "Pendiente"}
                                </span>
                            </td>
                            <td style="padding:8px; text-align:right;">
                                <button class="btn-del-hora" data-id="${r.id}" style="background:none; border:none; color:#ef4444; cursor:pointer; font-weight:bold;">🗑️</button>
                            </td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        `;

        cont.querySelectorAll(".btn-del-hora").forEach(btn => {
            btn.onclick = async () => {
                if (confirm("¿Borrar este registro de horas?")) {
                    await remove("horas_personal", Number(btn.dataset.id));
                    await this.load();
                }
            };
        });
    },

    /* ==========================================================
       3. VISTA PAGOS Y LIQUIDACIÓN
    ========================================================== */
    renderVistaPagos(container) {
        const opcionesEmp = `<option value="todos">Todos los integrantes</option>` +
            this.empleados.map(e => `<option value="${e.id}">${e.nombre} (${e.categoria})</option>`).join("");

        container.innerHTML = `
            <div class="card" style="margin-bottom:20px;">
                <h3 style="color:#104E2E; margin-top:0;">💰 Cálculo de Pagos y Liquidación</h3>

                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:12px; margin-bottom:14px;">
                    <div>
                        <label style="font-weight:bold; font-size:13px;">Integrante</label>
                        <select id="pagoFiltroEmp" style="width:100%; padding:8px; margin-top:4px; border:1px solid #ccc; border-radius:4px; background:#fff;">
                            ${opcionesEmp}
                        </select>
                    </div>
                    <div>
                        <label style="font-weight:bold; font-size:13px;">Desde</label>
                        <input id="pagoDesde" type="date" style="width:100%; padding:8px; margin-top:4px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px;">
                    </div>
                    <div>
                        <label style="font-weight:bold; font-size:13px;">Hasta</label>
                        <input id="pagoHasta" type="date" style="width:100%; padding:8px; margin-top:4px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px;">
                    </div>
                    <div>
                        <label style="font-weight:bold; font-size:13px;">Estado</label>
                        <select id="pagoEstado" style="width:100%; padding:8px; margin-top:4px; border:1px solid #ccc; border-radius:4px; background:#fff;">
                            <option value="pendientes">Pendientes de pago</option>
                            <option value="todos">Todos</option>
                            <option value="pagados">Ya pagados</option>
                        </select>
                    </div>
                </div>

                <div id="resumenLiquidacion" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap:12px; margin-bottom:14px;"></div>

                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                    <label style="display:flex; align-items:center; gap:6px; font-size:13px; color:#334155; cursor:pointer;">
                        <input type="checkbox" id="chkRegistrarInversion" checked>
                        Registrar pago en Inversiones / Gastos al liquidar[cite: 5]
                    </label>
                    <button id="btnMarcarPagado" style="padding:10px 18px; background:#104E2E; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">
                        ✅ Marcar Filtrados como Pagados
                    </button>
                </div>
            </div>

            <div class="card">
                <h3 style="color:#334155; margin-top:0;">📄 Detalle de Horas para Pago</h3>
                <div id="detalleLiquidacion" style="overflow-x:auto;"></div>
            </div>
        `;

        const refrescarLiquidacion = () => this.calcularYMostrarLiquidacion();

        ["pagoFiltroEmp", "pagoDesde", "pagoHasta", "pagoEstado"].forEach(id => {
            document.getElementById(id).onchange = refrescarLiquidacion;
        });

        document.getElementById("btnMarcarPagado").onclick = () => this.liquidarFiltrados();
        refrescarLiquidacion();
    },

    obtenerHorasFiltradas() {
        const empVal = document.getElementById("pagoFiltroEmp")?.value || "todos";
        const desde = document.getElementById("pagoDesde")?.value || "";
        const hasta = document.getElementById("pagoHasta")?.value || "";
        const estado = document.getElementById("pagoEstado")?.value || "pendientes";

        return this.registrosHoras.filter(r => {
            if (empVal !== "todos" && Number(r.empleadoId) !== Number(empVal)) return false;
            if (desde && r.fecha < desde) return false;
            if (hasta && r.fecha > hasta) return false;
            if (estado === "pendientes" && r.pagado) return false;
            if (estado === "pagados" && !r.pagado) return false;
            return true;
        });
    },

    calcularYMostrarLiquidacion() {
        const filtrados = this.obtenerHorasFiltradas();
        const totalNormales = filtrados.reduce((acc, r) => acc + Number(r.horasNormales || 0), 0);
        const totalExtras = filtrados.reduce((acc, r) => acc + Number(r.horasExtras || 0), 0);
        const totalDescuentos = filtrados.reduce((acc, r) => acc + Number(r.descuento || 0), 0);
        const totalPagar = filtrados.reduce((acc, r) => acc + Number(r.montoTotal || 0), 0);

        const resumen = document.getElementById("resumenLiquidacion");
        if (resumen) {
            resumen.innerHTML = `
                <div style="background:#f8fafc; border-left:4px solid #0284c7; padding:10px; border-radius:6px;">
                    <div style="font-size:11px; color:#64748b; font-weight:bold;">HORAS NORMALES</div>
                    <div style="font-size:17px; font-weight:bold; color:#0f172a;">${totalNormales} hs</div>
                </div>
                <div style="background:#f8fafc; border-left:4px solid #d97706; padding:10px; border-radius:6px;">
                    <div style="font-size:11px; color:#64748b; font-weight:bold;">HORAS EXTRAS</div>
                    <div style="font-size:17px; font-weight:bold; color:#0f172a;">${totalExtras} hs</div>
                </div>
                <div style="background:#f8fafc; border-left:4px solid #ef4444; padding:10px; border-radius:6px;">
                    <div style="font-size:11px; color:#64748b; font-weight:bold;">ADELANTOS / DESC.</div>
                    <div style="font-size:17px; font-weight:bold; color:#ef4444;">${this.fmtMoney(totalDescuentos)}</div>
                </div>
                <div style="background:#f0fdf4; border-left:4px solid #104E2E; padding:10px; border-radius:6px;">
                    <div style="font-size:11px; color:#166534; font-weight:bold;">TOTAL A PAGAR</div>
                    <div style="font-size:18px; font-weight:bold; color:#104E2E;">${this.fmtMoney(totalPagar)}</div>
                </div>
            `;
        }

        const detalle = document.getElementById("detalleLiquidacion");
        if (!detalle) return;

        if (filtrados.length === 0) {
            detalle.innerHTML = `<p style="color:#64748b; font-style:italic;">No hay registros que coincidan con el filtro.</p>`;
            return;
        }

        detalle.innerHTML = `
            <table style="width:100%; border-collapse:collapse; font-size:13px;">
                <thead>
                    <tr style="background:#f1f5f9; color:#334155; text-align:left; border-bottom:2px solid #cbd5e1;">
                        <th style="padding:8px;">Fecha</th>
                        <th style="padding:8px;">Integrante</th>
                        <th style="padding:8px;">Rubro</th>
                        <th style="padding:8px;">Normales</th>
                        <th style="padding:8px;">Extras</th>
                        <th style="padding:8px;">Desc.</th>
                        <th style="padding:8px;">A Pagar</th>
                        <th style="padding:8px;">Estado</th>
                    </tr>
                </thead>
                <tbody>
                    ${filtrados.map(r => `
                        <tr style="border-bottom:1px solid #e2e8f0;">
                            <td style="padding:8px;">${r.fecha}</td>
                            <td style="padding:8px;"><strong>${r.nombreEmpleado}</strong></td>
                            <td style="padding:8px;">${r.rubro || "-"}</td>
                            <td style="padding:8px;">${r.horasNormales || 0} hs</td>
                            <td style="padding:8px;">${r.horasExtras || 0} hs</td>
                            <td style="padding:8px;">${this.fmtMoney(r.descuento || 0)}</td>
                            <td style="padding:8px; font-weight:bold; color:#104E2E;">${this.fmtMoney(r.montoTotal)}</td>
                            <td style="padding:8px;">${r.pagado ? "✅ Pagado" : "⏳ Pendiente"}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        `;
    },

    async liquidarFiltrados() {
        const pendientes = this.obtenerHorasFiltradas().filter(r => !r.pagado);
        if (pendientes.length === 0) {
            alert("No hay horas pendientes en el filtro actual para marcar como pagadas.");
            return;
        }

        const montoTotal = pendientes.reduce((acc, r) => acc + Number(r.montoTotal || 0), 0);
        if (!confirm(`¿Confirmás marcar ${pendientes.length} registro(s) como PAGADOS por un total de ${this.fmtMoney(montoTotal)}?`)) {
            return;
        }

        try {
            const fechaPago = new Date().toISOString().split("T")[0];
            for (const reg of pendientes) {
                await update("horas_personal", {
                    ...reg,
                    pagado: true,
                    fechaPago
                });
            }

            const registrarInv = document.getElementById("chkRegistrarInversion")?.checked;
            if (registrarInv && montoTotal > 0) {
                const inversionesActuales = (await getAll("inversiones")) || [];
                const idsInv = inversionesActuales.map(i => Number(i.id || 0));
                const nextInvId = idsInv.length > 0 ? Math.max(...idsInv) + 1 : 1;

                await add("inversiones", {
                    id: nextInvId,
                    fecha: fechaPago,
                    concepto: `Pago mano de obra / personal (${pendientes.length} reg.)`,
                    categoria: "Mano de Obra",
                    monto: montoTotal
                });
            }

            alert(`💰 Pago liquidado por ${this.fmtMoney(montoTotal)}.`);
            await this.load();
        } catch (err) {
            console.error("Error al liquidar pagos:", err);
            alert("Ocurrió un error al registrar el pago.");
        }
    }
};

export default Personal;
