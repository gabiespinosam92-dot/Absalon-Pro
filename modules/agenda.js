// modules/agenda.js

const AgendaModule = {
    async iniciar() {
        const workspace = document.getElementById("workspace");
        if (!workspace) return;

        // HTML Base de la Agenda
        workspace.innerHTML = `
            <div class="card welcome-card" style="margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                    <div>
                        <h2 style="color: #104E2E; margin-bottom: 5px;">📅 Agenda de Obras</h2>
                        <p style="color: #4b5563; font-size: 14px;">Vinculá tus trabajos con presupuestos existentes o cargalos de forma directa.</p>
                    </div>
                    <button id="btnAgendarObra" style="background: #104E2E; color: white; border: none; padding: 10px 18px; border-radius: 6px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                        <span>➕</span> Agendar Trabajo
                    </button>
                </div>
            </div>

            <div class="card" style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <h3 style="color: #104E2E; margin-bottom: 15px; font-size: 16px;">📋 Próximas Obras y Servicios Agendados</h3>
                <div id="listaObrasAgendadas" style="display: flex; flex-direction: column; gap: 12px;">
                    <p style="color: #6b7280; text-align: center; padding: 20px;">No hay trabajos agendados.</p>
                </div>
            </div>

            <div id="modalAgenda" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 1000; justify-content: center; align-items: center; padding: 15px; box-sizing: border-box;">
                <div style="background: white; padding: 25px; border-radius: 8px; width: 100%; max-width: 500px; position: relative; max-height: 90vh; overflow-y: auto;">
                    <span id="closeModalAgenda" style="position: absolute; top: 15px; right: 15px; cursor: pointer; font-size: 24px; color: #6b7280;">&times;</span>
                    
                    <h3 style="color: #104E2E; margin-top: 0; margin-bottom: 20px; display: flex; align-items: center; gap: 8px;">
                        📅 Programar Trabajo
                    </h3>

                    <form id="formAgendaObra">
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 6px; font-weight: bold; font-size: 13px; color: #374151;">Vincular con Presupuesto (Opcional):</label>
                            <select id="agendaSelectPresupuesto" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">
                                <option value="manual">-- Cargar de forma manual (Sin Presupuesto) --</option>
                            </select>
                            <small style="color: #6b7280; display: block; margin-top: 4px;">Si elegís carga manual, podés escribir libremente abajo.</small>
                        </div>

                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 6px; font-weight: bold; font-size: 13px; color: #374151;">Cliente:</label>
                            <input type="text" id="agendaCliente" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;" required placeholder="Nombre del cliente">
                        </div>

                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 6px; font-weight: bold; font-size: 13px; color: #374151;">Tipo de Obra / Especialidad / Tarea:</label>
                            <input type="text" id="agendaEspecialidad" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;" required placeholder="Ej: Cielorraso Durlock, Service Split, etc.">
                        </div>

                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 6px; font-weight: bold; font-size: 13px; color: #374151;">Tiempo Estimado de Ejecución:</label>
                            <input type="text" id="agendaTiempo" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;" required placeholder="Ej: 2 días, 4 horas, etc.">
                        </div>

                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 6px; font-weight: bold; font-size: 13px; color: #374151;">Fecha y Hora de Inicio:</label>
                            <input type="datetime-local" id="agendaFechaInicio" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;" required>
                        </div>

                        <button type="submit" style="width: 100%; background: #104E2E; color: white; border: none; padding: 12px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 14px;">
                            Confirmar Fecha y Guardar
                        </button>
                    </form>
                </div>
            </div>
        `;

        await this.cargarPresupuestosAprobados();
        this.renderListaObras();
        this.setupEventos();
    },

    async cargarPresupuestosAprobados() {
        const select = document.getElementById("agendaSelectPresupuesto");
        if (!select) return;

        try {
            let lista = [];
            const dbRequest = window.indexedDB.databases ? await window.indexedDB.databases() : [];
            const dbInfo = dbRequest.find(d => d.name.toLowerCase().includes("absalon"));
            
            if (dbInfo) {
                lista = await new Promise((resolve) => {
                    const req = window.indexedDB.open(dbInfo.name);
                    req.onsuccess = (e) => {
                        const db = e.target.result;
                        try {
                            const transaction = db.transaction(["presupuestos"], "readonly");
                            const store = transaction.objectStore("presupuestos");
                            const getAll = store.getAll();
                            getAll.onsuccess = () => resolve(getAll.result || []);
                            getAll.onerror = () => resolve([]);
                        } catch { resolve([]); }
                    };
                    req.onerror = () => resolve([]);
                });
            }

            if (!lista || lista.length === 0) {
                lista = JSON.parse(localStorage.getItem("presupuestos")) || [];
            }

            this.presupuestosCache = lista;

            lista.forEach(p => {
                const opt = document.createElement("option");
                opt.value = p.id || p.idPresupuesto;
                opt.textContent = `N° ${p.id || p.idPresupuesto} - ${p.clienteName || p.cliente || "Cliente a designar"}`;
                select.appendChild(opt);
            });
        } catch (e) {
            console.error("Error al cargar presupuestos:", e);
        }
    },

    setupEventos() {
        const modal = document.getElementById("modalAgenda");
        const btnAbrir = document.getElementById("btnAgendarObra");
        const btnCerrar = document.getElementById("closeModalAgenda");
        const selectPresupuesto = document.getElementById("agendaSelectPresupuesto");
        const form = document.getElementById("formAgendaObra");

        btnAbrir?.addEventListener("click", () => {
            this.limpiarFormulario(true);
            modal.style.display = "flex";
        });
        
        btnCerrar?.addEventListener("click", () => modal.style.display = "none");

        selectPresupuesto?.addEventListener("change", (e) => {
            const idSeleccionado = e.target.value;
            
            if (idSeleccionado === "manual" || !idSeleccionado) {
                this.limpiarFormulario(true);
                return;
            }

            const encontrado = this.presupuestosCache?.find(p => String(p.id || p.idPresupuesto) === String(idSeleccionado));
            if (encontrado) {
                const inputCliente = document.getElementById("agendaCliente");
                const inputEspecialidad = document.getElementById("agendaEspecialidad");
                const inputTiempo = document.getElementById("agendaTiempo");

                inputCliente.value = encontrado.clienteName || encontrado.cliente || "";
                inputEspecialidad.value = encontrado.especialidad || encontrado.obraTipo || "";
                inputTiempo.value = encontrado.tiempoEstimado || encontrado.duracionObra || "";

                inputCliente.readOnly = true;
                inputEspecialidad.readOnly = true;
                inputTiempo.readOnly = true;
                inputCliente.style.backgroundColor = "#f3f4f6";
                inputEspecialidad.style.backgroundColor = "#f3f4f6";
                inputTiempo.style.backgroundColor = "#f3f4f6";
            }
        });

        form?.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const fechaHoraVal = document.getElementById("agendaFechaInicio").value;

            const nuevaObra = {
                id: Date.now(),
                presupuestoId: selectPresupuesto.value === "manual" ? "Manual" : selectPresupuesto.value,
                cliente: document.getElementById("agendaCliente").value,
                especialidad: document.getElementById("agendaEspecialidad").value,
                tiempo: document.getElementById("agendaTiempo").value,
                fecha: fechaHoraVal
            };

            const obrasGuardadas = JSON.parse(localStorage.getItem("agenda_obras")) || [];
            obrasGuardadas.push(nuevaObra);
            localStorage.setItem("agenda_obras", JSON.stringify(obrasGuardadas));

            modal.style.display = "none";
            form.reset();
            this.renderListaObras();
            
            if (document.getElementById("widgetAgendaDashboard")) {
                this.renderWidgetDashboard();
            }

            // Opcional: Preguntar si quiere abrir Google Calendar directamente al guardar
            if (confirm("¿Querés agregar la alarma de este trabajo en tu Google Calendar / Celular?")) {
                this.abrirGoogleCalendar(nuevaObra);
            }
        });
    },

    limpiarFormulario(habilitarEdicion = false) {
        const inputCliente = document.getElementById("agendaCliente");
        const inputEspecialidad = document.getElementById("agendaEspecialidad");
        const inputTiempo = document.getElementById("agendaTiempo");

        if (!inputCliente) return;

        inputCliente.value = "";
        inputEspecialidad.value = "";
        inputTiempo.value = "";

        if (habilitarEdicion) {
            inputCliente.readOnly = false;
            inputEspecialidad.readOnly = false;
            inputTiempo.readOnly = false;
            inputCliente.style.backgroundColor = "#ffffff";
            inputEspecialidad.style.backgroundColor = "#ffffff";
            inputTiempo.style.backgroundColor = "#ffffff";
        }
    },

    renderListaObras() {
        const contenedor = document.getElementById("listaObrasAgendadas");
        if (!contenedor) return;

        const obras = JSON.parse(localStorage.getItem("agenda_obras")) || [];

        if (obras.length === 0) {
            contenedor.innerHTML = `<p style="color: #6b7280; text-align: center; padding: 20px;">No hay trabajos agendados para los próximos días.</p>`;
            return;
        }

        obras.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

        contenedor.innerHTML = obras.map(o => `
            <div style="border-left: 5px solid #104E2E; background: #f9fafb; padding: 15px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.02);">
                <div>
                    <h4 style="margin: 0 0 5px 0; color: #111827; font-size: 15px;">👤 ${o.cliente}</h4>
                    <p style="margin: 0; font-size: 13px; color: #4b5563;">
                        🛠 <strong>${o.especialidad}</strong> | 📄 Presupuesto: ${o.presupuestoId}
                    </p>
                    <p style="margin: 3px 0 0 0; font-size: 12px; color: #6b7280;">
                        ⏱ Tiempo estimado: ${o.tiempo}
                    </p>
                </div>
                <div style="text-align: right; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                    <span style="background: #e1f5fe; color: #0288d1; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: bold;">
                        📅 ${this.formatearFecha(o.fecha)}
                    </span>
                    <button class="btnCal" data-id="${o.id}" style="background: #4285F4; color: white; border: none; padding: 6px 10px; border-radius: 4px; font-size: 12px; font-weight: bold; cursor: pointer;" title="Agendar en Google Calendar">🔔 Agendar</button>
                    <button class="btnEliminarObra" data-id="${o.id}" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 14px;" title="Eliminar">🗑</button>
                </div>
            </div>
        `).join("");

        // Listener para eliminar
        document.querySelectorAll(".btnEliminarObra").forEach(btn => {
            btn.addEventListener("click", (e) => {
                this.eliminarObra(e.target.getAttribute("data-id"));
            });
        });

        // Listener para abrir Google Calendar
        document.querySelectorAll(".btnCal").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const id = e.target.getAttribute("data-id");
                const obra = obras.find(o => String(o.id) === String(id));
                if (obra) this.abrirGoogleCalendar(obra);
            });
        });
    },

    // Genera el enlace dinámico a Google Calendar
    abrirGoogleCalendar(obra) {
        const titulo = encodeURIComponent(`Obra / Servicio: ${obra.cliente}`);
        const detalles = encodeURIComponent(`Tarea: ${obra.especialidad}\nTiempo estimado: ${obra.tiempo}\nPresupuesto N°: ${obra.presupuestoId}`);
        
        // Manejar Fecha / Hora ISO
        let inicioISO = "";
        let finISO = "";

        if (obra.fecha.includes("T")) {
            const fechaObj = new Date(obra.fecha);
            inicioISO = fechaObj.toISOString().replace(/-|:|\.\d\d\d/g, "");
            
            // Asignamos 2 horas de duración por defecto para la alerta
            const fechaFinObj = new Date(fechaObj.getTime() + (2 * 60 * 60 * 1000));
            finISO = fechaFinObj.toISOString().replace(/-|:|\.\d\d\d/g, "");
        } else {
            // Si solo hay fecha sin hora
            const f = obra.fecha.replace(/-/g, "");
            inicioISO = `${f}T080000Z`;
            finISO = `${f}T100000Z`;
        }

        const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${titulo}&details=${detalles}&dates=${inicioISO}/${finISO}`;
        window.open(url, "_blank");
    },

    renderWidgetDashboard() {
        const contenedorWidget = document.getElementById("widgetAgendaDashboard");
        if (!contenedorWidget) return;

        const obras = JSON.parse(localStorage.getItem("agenda_obras")) || [];

        if (obras.length === 0) {
            contenedorWidget.innerHTML = `<p style="color: #6b7280; font-size: 14px;">No hay obras próximas programadas.</p>`;
            return;
        }

        obras.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        const proximas = obras.slice(0, 3);

        contenedorWidget.innerHTML = proximas.map(o => `
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f3f4f6; padding: 10px 0; gap: 10px;">
                <div>
                    <span style="font-weight: bold; font-size: 14px; color: #111827;">${o.cliente}</span>
                    <span style="display: block; font-size: 12px; color: #6b7280;">🛠 ${o.especialidad} (Presupuesto: ${o.presupuestoId})</span>
                </div>
                <span style="background: #104E2E; color: white; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; white-space: nowrap;">
                    ${this.formatearFecha(o.fecha)}
                </span>
            </div>
        `).join("");
    },

    eliminarObra(id) {
        if (!confirm("¿Estás seguro de quitar esta obra de la agenda?")) return;
        let obras = JSON.parse(localStorage.getItem("agenda_obras")) || [];
        obras = obras.filter(o => String(o.id) !== String(id));
        localStorage.setItem("agenda_obras", JSON.stringify(obras));
        this.renderListaObras();
        if (document.getElementById("widgetAgendaDashboard")) this.renderWidgetDashboard();
    },

    formatearFecha(fechaStr) {
        if (!fechaStr) return "";
        if (fechaStr.includes("T")) {
            const [f, h] = fechaStr.split("T");
            const [anio, mes, dia] = f.split("-");
            return `${dia}/${mes}/${anio} ${h} hs`;
        }
        const [anio, mes, dia] = fechaStr.split("-");
        return `${dia}/${mes}/${anio}`;
    }
};

export default AgendaModule;
