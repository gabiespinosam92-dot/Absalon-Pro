/* ==========================================================
   ABSALON PRO
   MÓDULO PRESUPUESTOS - SPRINT 11.4 (OPTIMIZACIÓN Y FILTRADO DE CATÁLOGO)
========================================================== */

import { getAll, save, update, getNextNumero, getById } from "./storage.js";

export const presupuestos = {
    materiales: [],
    manoObraItems: [], 
    catalogo: [],
    garantiasDisponibles: [],

    async iniciar() { await this.load(); },
    
    async load(idPresupuesto = null) {
        this.render();
        await this.cargarClientes();
        await this.cargarCatalogo();
        await this.cargarGarantias();
        this.eventos();

        // 🚀 ENGANCHE INTELIGENTE DEL CÓMPUTO MÉTRICO (Si viene desde Construcción en Seco)
        if (!idPresupuesto) {
            this.verificarMaterialesComputados();
        }

        if (idPresupuesto) {
            try {
                const p = await getById("presupuestos", Number(idPresupuesto));

                if (p) {
                    document.getElementById("fecha").value = p.fecha || "";
                    document.getElementById("estado").value = p.estado || "Borrador";
                    this.manejarCambioEstado(p.estado);
                    
                    if (p.cliente) {
                        document.getElementById("cliente").value = p.cliente;
                    }

                    if (p.especialidades) {
                        document.querySelectorAll(".especialidad").forEach(cb => {
                            cb.checked = p.especialidades.includes(cb.value);
                        });
                    }

                    if (p.estado === "Enviado" && document.getElementById("descripcionTrabajo")) {
                        document.getElementById("descripcionTrabajo").value = p.descripcionTrabajo || "";
                    } else if (p.estado === "Finalizado" && document.getElementById("garantiaVinculada")) {
                        document.getElementById("garantiaVinculada").value = p.garantíaId || "";
                    }

                    if (p.materiales && p.materiales.length > 0) {
                        const tbodyMat = document.querySelector("#tablaMateriales tbody");
                        tbodyMat.innerHTML = "";
                        p.materiales.forEach(mat => {
                            this.crearFilaMaterial();
                            const ultimaFila = tbodyMat.lastElementChild;
                            if (ultimaFila) {
                                ultimaFila.querySelector(".cantidad").value = mat.cantidad || 1;
                                const combo = ultimaFila.querySelector(".concepto");
                                combo.value = mat.idConcepto || "";
                                ultimaFila.querySelector(".precio").value = mat.precio || 0;
                                ultimaFila.querySelector(".total").value = mat.total || 0;
                            }
                        });
                    }

                    if (p.manoObraDetalle && p.manoObraDetalle.length > 0) {
                        const tbodyMO = document.querySelector("#tablaManoObra tbody");
                        tbodyMO.innerHTML = "";
                        p.manoObraDetalle.forEach(mo => {
                            this.crearFilaManoObra();
                            const ultimaFila = tbodyMO.lastElementChild;
                            if (ultimaFila) {
                                ultimaFila.querySelector(".mo-cantidad").value = mo.cantidad || 1;
                                ultimaFila.querySelector(".mo-unidad").value = mo.unidad || "-";
                                const comboMO = ultimaFila.querySelector(".mo-concepto");
                                comboMO.value = mo.idConcepto || "";
                                ultimaFila.querySelector(".mo-precio").value = mo.precio || 0;
                                ultimaFila.querySelector(".mo-total").value = mo.total || 0;
                            }
                        });
                    }

                    if (p.tiempo) {
                        document.getElementById("tiempoCantidad").value = p.tiempo.cantidad || 1;
                        document.getElementById("tiempoUnidad").value = p.tiempo.unidad || "Horas";
                    }

                    const btnGuardar = document.getElementById("btnGuardar");
                    btnGuardar.textContent = "🔄 Actualizar Presupuesto";
                    btnGuardar.replaceWith(btnGuardar.cloneNode(true));
                    
                    document.getElementById("btnGuardar").addEventListener("click", async () => {
                        const estadoSel = document.getElementById("estado").value;
                        let prefijoLetra = "B";
                        if (estadoSel === "Enviado") prefijoLetra = "E";
                        if (estadoSel === "Finalizado") prefijoLetra = "T";

                        const especs = [];
                        document.querySelectorAll(".especialidad:checked").forEach(cb => especs.push(cb.value));

                        const datosActualizados = {
                            ...p,
                            fecha: document.getElementById("fecha").value,
                            estado: estadoSel,
                            prefijo: prefijoLetra,
                            numeroFormat: `${prefijoLetra}-${p.id}`,
                            cliente: Number(document.getElementById("cliente").value),
                            especialidades: especs,
                            descripcionTrabajo: document.getElementById("descripcionTrabajo") ? document.getElementById("descripcionTrabajo").value.trim() : "",
                            garantíaId: document.getElementById("garantiaVinculada") ? document.getElementById("garantiaVinculada").value : "",
                            materiales: [],
                            manoObraDetalle: [],
                            tiempo: {
                                cantidad: Number(document.getElementById("tiempoCantidad").value),
                                unidad: document.getElementById("tiempoUnidad").value
                            }
                        };

                        document.querySelectorAll("#tablaMateriales tbody tr").forEach(fila => {
                            const comboSel = fila.querySelector(".concepto");
                            if(comboSel && comboSel.value) {
                                datosActualizados.materiales.push({
                                    amount: Number(fila.querySelector(".cantidad").value),
                                    cantidad: Number(fila.querySelector(".cantidad").value),
                                    idConcepto: comboSel.value,
                                    descripcion: comboSel.selectedOptions[0].text,
                                    precio: Number(fila.querySelector(".precio").value),
                                    total: Number(fila.querySelector(".total").value)
                                });
                            }
                        });

                        document.querySelectorAll("#tablaManoObra tbody tr").forEach(fila => {
                            const comboSel = fila.querySelector(".mo-concepto");
                            if(comboSel && comboSel.value) {
                                datosActualizados.manoObraDetalle.push({
                                    cantidad: Number(fila.querySelector(".mo-cantidad").value),
                                    unidad: fila.querySelector(".mo-unidad").value,
                                    idConcepto: comboSel.value,
                                    descripcion: comboSel.selectedOptions[0].text,
                                    precio: Number(fila.querySelector(".mo-precio").value),
                                    total: Number(fila.querySelector(".mo-total").value)
                                });
                            }
                        });

                        await update("presupuestos", datosActualizados);
                        alert("📝 ¡Presupuesto actualizado correctamente!");
                        const btnHistorial = document.querySelector('[data-view="historial"]');
                        if (btnHistorial) btnHistorial.click();
                    });

                    this.recalcularTotales();
                }
            } catch (err) {
                console.error("Error en edición:", err);
            }
        }
    },

    verificarMaterialesComputados() {
        const guardados = localStorage.getItem("materiales_computados");
        if (!guardados) return;

        try {
            const listaMateriales = JSON.parse(guardados);
            if (listaMateriales.length === 0) return;

            document.querySelectorAll(".especialidad").forEach(cb => {
                if (cb.value === "Construcción Seco") cb.checked = true;
            });

            const tbodyMat = document.querySelector("#tablaMateriales tbody");
            if (tbodyMat) tbodyMat.innerHTML = "";

            listaMateriales.forEach(mat => {
                this.crearFilaMaterial();
                const fila = tbodyMat.lastElementChild;
                if (!fila) return;

                const combo = fila.querySelector(".concepto");
                const inputCantidad = fila.querySelector(".cantidad");
                const inputPrecio = fila.querySelector(".precio");
                const inputTotal = fila.querySelector(".total");

                const itemCatalogo = this.catalogo.find(item => String(item.id) === String(mat.id));

                inputCantidad.value = mat.cantidad;

                if (itemCatalogo) {
                    combo.value = itemCatalogo.id;
                    const precioActual = Number(itemCatalogo.precio || itemCatalogo.costo || 0);
                    inputPrecio.value = precioActual;
                    inputTotal.value = mat.cantidad * precioActual;
                } else {
                    inputPrecio.value = 0;
                    inputTotal.value = 0;
                    console.warn(`El material con ID "${mat.id}" no se encontró en el catálogo.`);
                }
            });

            this.recalcularTotales();
            localStorage.removeItem("materiales_computados");

        } catch (error) {
            console.error("Error al procesar materiales computados:", error);
        }
    },

    render() {
        document.getElementById("workspace").innerHTML = `
        <div class="card">
            <h2>Nuevo Presupuesto</h2>
            <br>
            
            <div style="display:flex; gap:20px;">
                <div style="flex:1;">
                    <label>Fecha</label><br>
                    <input type="date" id="fecha" style="width:100%;">
                </div>
                <div style="flex:1;">
                    <label>Estado del Presupuesto</label><br>
                    <select id="estado" style="width:100%;">
                        <option value="Borrador">Borrador (B-)</option>
                        <option value="Enviado">Enviado (E-)</option>
                        <option value="Finalizado">Finalizado (T-)</option>
                    </select>
                </div>
            </div>

            <br>
            <label>Cliente</label>
            <div style="display:flex; gap:10px;">
                <select id="cliente" style="flex:1;">
                    <option value="">Seleccione un cliente...</option>
                </select>
                <button id="btnNuevoCliente" style="cursor:pointer; font-weight:bold; background:#104E2E; color:white; border:none; padding:5px 10px; border-radius:4px;">+ Registrar Cliente</button>
            </div>
            
            <br>
            <label>Especialidades Requeridas</label><br>
            <div style="display:flex; gap:15px; margin-top:5px;">
                <label><input type="checkbox" class="especialidad" value="Refrigeración"> Refrigeración</label>
                <label><input type="checkbox" class="especialidad" value="Electricidad"> Electricidad</label>
                <label><input type="checkbox" class="especialidad" value="Construcción Seco"> Construcción Seco</label>
            </div>
        </div>

        <div id="contenedorDinamicoEstado"></div>

        <div class="card mt-3">
            <h3>📦 Cómputo de Materiales</h3>
            <table id="tablaMateriales" style="width:100%; margin-top:10px;">
                <thead>
                    <tr style="text-align:left;">
                        <th style="width:80px;">Cant.</th>
                        <th>Concepto / Material</th>
                        <th style="width:120px;">Precio Unit.</th>
                        <th style="width:120px;">Total</th>
                        <th style="width:40px;"></th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
            <button id="btnFilaMaterial" class="mt-2" style="cursor:pointer;">+ Añadir Fila</button>
        </div>

        <div class="card mt-3">
            <h3>🛠️ Mano de Obra Detallada</h3>
            <table id="tablaManoObra" style="width:100%; margin-top:10px;">
                <thead>
                    <tr style="text-align:left;">
                        <th style="width:80px;">Cant.</th>
                        <th style="width:100px;">Unidad</th>
                        <th>Concepto de Trabajo (Catálogo)</th>
                        <th style="width:120px;">Precio Unit.</th>
                        <th style="width:120px;">Total</th>
                        <th style="width:40px;"></th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
            <button id="btnFilaManoObra" class="mt-2" style="cursor:pointer;">+ Añadir Fila de Trabajo</button>
        </div>

        <div class="card mt-3">
            <h3>⏱️ Tiempos de Ejecución Estimados</h3>
            <div style="display:flex; gap:10px; margin-top:10px;">
                <input type="number" id="tiempoCantidad" value="1" style="width:80px;">
                <select id="tiempoUnidad">
                    <option value="Horas">Horas</option>
                    <option value="Días">Días</option>
                    <option value="Semanas">Semanas</option>
                </select>
            </div>
        </div>

        <div class="card mt-3 text-right" style="display:flex; justify-content:space-between; align-items:center; background:#e8f5e9;">
            <h2 style="color:#1b5e20; margin:0;">TOTAL GENERAL:</h2>
            <h1 id="totalGeneralLabel" style="color:#1b5e20; margin:0;">$ 0,00</h1>
        </div>

        <!-- BOTONERA DE EXPORTACIÓN MODIFICADA SIN TOCAR LO EXISTENTE -->
        <div class="mt-3" style="margin-bottom:30px; text-align:right; display:flex; justify-content:flex-end; gap:12px; flex-wrap: wrap;">
            <button id="btnListaCompras" style="padding:12px 20px; font-size:15px; background:#475569; color:white; border:none; border-radius:4px; font-weight:bold; cursor:pointer;">📋 Lista de Compras</button>
            <button id="btnPDF" style="padding:12px 25px; font-size:16px; background:#b71c1c; color:white; border:none; border-radius:4px; font-weight:bold; cursor:pointer;">📄 Crear PDF</button>
            <button id="btnGuardar" style="padding:12px 25px; font-size:16px; background:#104E2E; color:white; border:none; border-radius:4px; font-weight:bold; cursor:pointer;">💾 Guardar Presupuesto</button>
        </div>
        `;
        
        document.getElementById("fecha").value = new Date().toISOString().split('T')[0];
        this.manejarCambioEstado("Borrador");
    },

    async cargarClientes() {
        const select = document.getElementById("cliente");
        if (!select) return;
        try {
            const lista = await getAll("clientes");
            select.innerHTML = '<option value="">Seleccione un cliente...</option>';
            lista.sort((a,b) => a.nombre.localeCompare(b.nombre));
            lista.forEach(c => {
                const doc = c.numeroDocumento || "S/D";
                const ref = c.referencia || "Particular";
                const option = document.createElement("option");
                option.value = c.id;
                option.textContent = `${c.nombre} (${ref} - ${doc})`;
                select.appendChild(option);
            });
        } catch (e) { console.error(e); }
    },

    async cargarCatalogo() {
        try { this.catalogo = await getAll("catalogos"); } catch(e){ console.error(e); }
    },

    async cargarGarantias() {
        try { this.garantiasDisponibles = await getAll("garantias"); } catch(e){ console.error(e); }
    },

    manejarCambioEstado(estadoActual) {
        const contenedor = document.getElementById("contenedorDinamicoEstado");
        if (!contenedor) return;

        if (estadoActual === "Enviado") {
            contenedor.innerHTML = `
            <div class="card mt-3" style="border-left:5px solid #2196F3;">
                <h3>📝 Detalles / Observaciones del Envío</h3>
                <textarea id="descripcionTrabajo" rows="4" placeholder="Escribí aquí términos de validez, aclaraciones del servicio o formas de pago..." style="width:100%; margin-top:10px; padding:8px; box-sizing:border-box;"></textarea>
            </div>`;
        } else if (estadoActual === "Finalizado") {
            const especialidadesSeleccionadas = [];
            document.querySelectorAll(".especialidad:checked").forEach(cb => {
                especialidadesSeleccionadas.push(cb.value);
            });

            const garantiasFiltradas = this.garantiasDisponibles.filter(g => {
                if (especialidadesSeleccionadas.length === 0) return true;
                return especialidadesSeleccionadas.includes(g.especialidad);
            });

            let opcionesGarantia = garantiasFiltradas.map(g => 
                `<option value="${g.id}">${g.titulo || g.nombre} (${g.duracion || 'S/D'})</option>`
            ).join("");

            contenedor.innerHTML = `
            <div class="card mt-3" style="border-left:5px solid #616161;">
                <h3>📜 Vincular Certificado de Garantía</h3>
                <p class="text-muted">Garantías filtradas según las especialidades del trabajo requeridas.</p>
                <select id="garantiaVinculada" style="width:100%; margin-top:10px; padding:8px;">
                    <option value="">Ninguna garantía asociada...</option>
                    ${opcionesGarantia}
                </select>
            </div>`;
        } else {
            contenedor.innerHTML = "";
        }
    },

    eventos() {
        document.getElementById("estado").addEventListener("change", (e) => {
            this.manejarCambioEstado(e.target.value);
        });

        document.getElementById("btnNuevoCliente").onclick = () => this.abrirModalCliente();
        document.getElementById("btnFilaMaterial").onclick = () => this.crearFilaMaterial();
        document.getElementById("btnFilaManoObra").onclick = () => this.crearFilaManoObra();
        document.getElementById("btnGuardar").onclick = () => this.guardarPresupuesto();
        document.getElementById("btnPDF").onclick = () => this.generarPDF();
        
        // Asignación del nuevo evento para Lista de Compras mudo
        document.getElementById("btnListaCompras").onclick = () => this.generarPDFListaCompras();

        document.querySelectorAll(".especialidad").forEach(cb => {
            cb.addEventListener("change", () => {
                const estadoActual = document.getElementById("estado").value;
                if (estadoActual === "Finalizado") {
                    this.manejarCambioEstado("Finalizado");
                }
            });
        });
    },

    crearFilaMaterial() {
        const tbody = document.querySelector("#tablaMateriales tbody");
        const tr = document.createElement("tr");

        let opcionesHTML = `<option value="">-- Seleccionar Material --</option>`;
        const materialesSolo = this.catalogo.filter(item => item.tipo === "material");
        
        materialesSolo.forEach(item => {
            opcionesHTML += `<option value="${item.id}" data-precio="${item.precio || item.costo || 0}">${item.concepto || item.nombre}</option>`;
        });

        tr.innerHTML = `
            <td><input type="number" class="cantidad" value="1" style="width:70px;"></td>
            <td><select class="concepto" style="width:100%;">${opcionesHTML}</select></td>
            <td><input type="number" class="precio" value="0" style="width:110px;"></td>
            <td><input type="number" class="total" value="0" style="width:110px;" disabled></td>
            <td><button class="btnBorrarFila" style="color:red; background:none; border:none; font-weight:bold; cursor:pointer;">❌</button></td>
        `;

        const combo = tr.querySelector(".concepto");
        const inputPrecio = tr.querySelector(".precio");
        const inputCantidad = tr.querySelector(".cantidad");
        const inputTotal = tr.querySelector(".total");

        combo.addEventListener("change", () => {
            const selected = combo.selectedOptions[0];
            const precio = selected ? (selected.dataset.precio || 0) : 0;
            inputPrecio.value = precio;
            inputTotal.value = precio * Number(inputCantidad.value);
            this.recalcularTotales();
        });

        inputPrecio.addEventListener("input", () => {
            inputTotal.value = Number(inputPrecio.value) * Number(inputCantidad.value);
            this.recalcularTotales();
        });

        inputCantidad.addEventListener("input", () => {
            inputTotal.value = Number(inputPrecio.value) * Number(inputCantidad.value);
            this.recalcularTotales();
        });

        tr.querySelector(".btnBorrarFila").onclick = () => {
            tr.remove();
            this.recalcularTotales();
        };

        tbody.appendChild(tr);
    },

    crearFilaManoObra() {
        const tbody = document.querySelector("#tablaManoObra tbody");
        const tr = document.createElement("tr");

        let opcionesHTML = `<option value="">-- Seleccionar Tarea / Servicio --</option>`;
        const manoObraSolo = this.catalogo.filter(item => item.tipo === "mano_obra");
        
        manoObraSolo.forEach(item => {
            opcionesHTML += `<option value="${item.id}" data-precio="${item.precio || item.costo || 0}">${item.concepto || item.nombre}</option>`;
        });

        tr.innerHTML = `
            <td><input type="number" class="mo-cantidad" value="1" style="width:70px;"></td>
            <td>
                <select class="mo-unidad" style="width:100%;">
                    <option value="Global">Global</option>
                    <option value="Hora">Hora</option>
                    <option value="Metro">Metro</option>
                    <option value="Unidad">Unidad</option>
                </select>
            </td>
            <td><select class="mo-concepto" style="width:100%;">${opcionesHTML}</select></td>
            <td><input type="number" class="mo-precio" value="0" style="width:110px;"></td>
            <td><input type="number" class="mo-total" value="0" style="width:110px;" disabled></td>
            <td><button class="btnBorrarMO" style="color:red; background:none; border:none; font-weight:bold; cursor:pointer;">❌</button></td>
        `;

        const comboMO = tr.querySelector(".mo-concepto");
        const inputCantidad = tr.querySelector(".mo-cantidad");
        const inputPrecio = tr.querySelector(".mo-precio");
        const inputTotal = tr.querySelector(".mo-total");

        const calcularFila = () => {
            inputTotal.value = Number(inputCantidad.value) * Number(inputPrecio.value);
            this.recalcularTotales();
        };

        comboMO.addEventListener("change", () => {
            const selected = comboMO.selectedOptions[0];
            const precio = selected ? (selected.dataset.precio || 0) : 0;
            inputPrecio.value = precio;
            calcularFila();
        });

        inputCantidad.addEventListener("input", calcularFila);
        inputPrecio.addEventListener("input", calcularFila);

        tr.querySelector(".btnBorrarMO").onclick = () => {
            tr.remove();
            this.recalcularTotales();
        };

        tbody.appendChild(tr);
    },

    recalcularTotales() {
        let totalMat = 0;
        document.querySelectorAll("#tablaMateriales tbody tr").forEach(tr => {
            totalMat += Number(tr.querySelector(".total").value || 0);
        });

        let totalMO = 0;
        document.querySelectorAll("#tablaManoObra tbody tr").forEach(tr => {
            totalMO += Number(tr.querySelector(".mo-total").value || 0);
        });

        const totalGral = totalMat + totalMO;
        document.getElementById("totalGeneralLabel").textContent = `$ ${totalGral.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`;
    },

    // 🛠️ EXPORTADOR EXCLUSIVO PARA LISTA DE COMPRAS (SIN PRECIOS NI TOTALES)
    // 🛠️ EXPORTADOR CORREGIDO: LISTA DE COMPRAS SIN CORTES RENTABLES CON LOGO Y PIE DE PÁGINA
   async generarPDFListaCompras() {
        const idCliente = document.getElementById("cliente").value;
        if (!idCliente) {
            alert("⚠️ Por favor, seleccione un cliente antes de exportar la Lista de Compras.");
            return;
        }

        const clienteSelect = document.getElementById("cliente");
        const clienteNombreText = clienteSelect.options[clienteSelect.selectedIndex].text;

        // 1. Buscamos los datos extendidos del cliente guardado
        const { getById } = await import("./storage.js");
        const clienteData = await getById("clientes", Number(idCliente)) || {};

        // 2. Extraemos los materiales activos cargados en la tabla actual de la pantalla
        const materialesParaExportar = [];
        document.querySelectorAll("#tablaMateriales tbody tr").forEach(fila => {
            const combo = fila.querySelector(".concepto");
            if(combo && combo.value) {
                materialesParaExportar.push({
                    cantidad: fila.querySelector(".cantidad").value,
                    concepto: combo.selectedOptions[0].text
                });
            }
        });

        // 3. Extraemos las tareas operativas cargadas en la tabla actual de la pantalla
        const manoObraParaExportar = [];
        document.querySelectorAll("#tablaManoObra tbody tr").forEach(fila => {
            const combo = fila.querySelector(".mo-concepto");
            if(combo && combo.value) {
                manoObraParaExportar.push({
                    cantidad: fila.querySelector(".mo-cantidad").value,
                    unidad: fila.querySelector(".mo-unidad").value,
                    concepto: combo.selectedOptions[0].text
                });
            }
        });

        // 4. Invocamos al módulo aislado tirando los datos limpios de la interfaz
        try {
            const { exportarListaComprasPDF } = await import("./listaComprasPdf.js");
            
            await exportarListaComprasPDF({
                fecha: document.getElementById("fecha").value,
                clienteNombre: clienteData.nombre || clienteNombreText,
                clienteDireccion: clienteData.direccion || "S/D",
                clienteTelefono: clienteData.telefono || "S/D",
                materiales: materialesParaExportar,
                manoObra: manoObraParaExportar
            });
        } catch (err) {
            console.error("Error al ejecutar el módulo aislado de lista de compras:", err);
            alert("❌ No se pudo descargar la lista de compras de forma aislada.");
        }
    },

    async guardarPresupuesto() {
        const idCliente = document.getElementById("cliente").value;
        if (!idCliente) {
            alert("Por favor, selecciona un cliente.");
            return;
        }

        const proxId = await getNextNumero();
        const estadoSel = document.getElementById("estado").value;

        let prefijoLetra = "B";
        if (estadoSel === "Enviado") prefijoLetra = "E";
        if (estadoSel === "Finalizado") prefijoLetra = "T";

        const numeroPresupuestoConLetra = `${prefijoLetra}-${proxId}`;
        const specs = [];
        document.querySelectorAll(".especialidad:checked").forEach(cb => specs.push(cb.value));

        let totalMat = 0;
        document.querySelectorAll("#tablaMateriales tbody tr").forEach(tr => { totalMat += Number(tr.querySelector(".total").value || 0); });
        let totalMO = 0;
        document.querySelectorAll("#tablaManoObra tbody tr").forEach(tr => { totalMO += Number(tr.querySelector(".mo-total").value || 0); });

        const datos = {
            id: proxId,
            numero: proxId,
            numeroFormat: numeroPresupuestoConLetra,
            fecha: document.getElementById("fecha").value,
            estado: estadoSel,
            cliente: Number(idCliente),
            especialidades: specs,
            descripcionTrabajo: document.getElementById("descripcionTrabajo") ? document.getElementById("descripcionTrabajo").value.trim() : "",
            garantíaId: document.getElementById("garantiaVinculada") ? document.getElementById("garantiaVinculada").value : "",
            materiales: [],
            manoObraDetalle: [],
            totalGeneral: totalMat + totalMO,
            tiempo: { 
                cantidad: Number(document.getElementById("tiempoCantidad").value),
                unidad: document.getElementById("tiempoUnidad").value
            }
        };

        document.querySelectorAll("#tablaMateriales tbody tr").forEach(fila => {
            const comboSel = fila.querySelector(".concepto");
            if(comboSel && comboSel.value) {
                datos.materiales.push({
                    amount: Number(fila.querySelector(".cantidad").value),
                    cantidad: Number(fila.querySelector(".cantidad").value),
                    idConcepto: comboSel.value,
                    descripcion: comboSel.selectedOptions[0].text,
                    precio: Number(fila.querySelector(".precio").value),
                    total: Number(fila.querySelector(".total").value)
                });
            }
        });

        document.querySelectorAll("#tablaManoObra tbody tr").forEach(fila => {
            const comboSel = fila.querySelector(".mo-concepto");
            if(comboSel && comboSel.value) {
                datos.manoObraDetalle.push({
                    cantidad: Number(fila.querySelector(".mo-cantidad").value),
                    unidad: fila.querySelector(".mo-unidad").value,
                    idConcepto: comboSel.value,
                    descripcion: comboSel.selectedOptions[0].text,
                    precio: Number(fila.querySelector(".mo-precio").value),
                    total: Number(fila.querySelector(".mo-total").value)
                });
            }
        });

        try {
            await save("presupuestos", datos);
            alert(`✅ Presupuesto guardado con éxito: ${numeroPresupuestoConLetra}`);
            this.load();
        } catch (error) {
            console.error(error);
            alert("No se pudo guardar el presupuesto.");
        }
    }, 

    cargarLibreriaPDF() {
        return new Promise((resolve) => {
            if (typeof html2pdf !== "undefined") return resolve();
            const script = document.createElement("script");
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
            script.onload = () => resolve();
            document.head.appendChild(script);
        });
    },
    async generarPDF() {
        const idCliente = document.getElementById("cliente").value;
        if (!idCliente) {
            alert("⚠️ Seleccioná un cliente antes de exportar el PDF.");
            return;
        }

        const { getById, getAll } = await import("./storage.js");
        const { exportarPresupuestoPDF } = await import("./pdf.js");

        const presupuestosExistentes = await getAll("presupuestos");
        const proxNumero = presupuestosExistentes.length + 1;
        const estadoSel = document.getElementById("estado") ? document.getElementById("estado").value : "Borrador";
        let letra = "B";
        if (estadoSel === "Enviado") letra = "E";
        if (estadoSel === "Finalizado") letra = "T";
        const numeroRealPresupuesto = `${letra}-${String(proxNumero).padStart(4, '0')}`;

        const clienteData = await getById("clientes", Number(idCliente)) || {};

        let totalMaterialesNeto = 0;
        document.querySelectorAll("#tablaMateriales tbody tr").forEach(tr => {
            const inputTotal = tr.querySelector(".total");
            if (inputTotal) totalMaterialesNeto += Number(inputTotal.value || 0);
        });

        let totalManoObraNeto = 0;
        document.querySelectorAll("#tablaManoObra tbody tr").forEach(tr => {
            const inputMoTotal = tr.querySelector(".mo-total");
            if (inputMoTotal) totalManoObraNeto += Number(inputMoTotal.value || 0);
        });

        const ivaMateriales = totalMaterialesNeto * 0.21;
        const ivaManoObra = totalManoObraNeto * 0.21;

        const columnaTotalNeto = totalMaterialesNeto + totalManoObraNeto;
        const columnaTotalIva = ivaMateriales + ivaManoObra;
        const totalAPagarFinal = columnaTotalNeto + columnaTotalIva;

        const fechaInput = document.getElementById("fecha").value.split("-").reverse().join("/");
        const tiempoCant = document.getElementById("tiempoCantidad").value || "1";
        const tiempoUnidad = document.getElementById("tiempoUnidad").value || "Días";
        const observacionesInput = document.getElementById("descripcionTrabajo") ? document.getElementById("descripcionTrabajo").value.trim() : "";
        const logoPath  = "./logo_083121.png";
        const paqueteDatos = {
            numero: numeroRealPresupuesto,
            fecha: fechaInput,
            clienteNombre: clienteData.nombre || '',
            clienteDireccion: clienteData.direccion || '',
            clienteTelefono: clienteData.telefono || '',
            clienteTipoDoc: clienteData.tipoDocumento || 'CUIL/CUIT',
            clienteNumDoc: clienteData.numeroDocumento || '',
            totalMaterialesNeto: totalMaterialesNeto,
            totalManoObraNeto: totalManoObraNeto,
            ivaMateriales: ivaMateriales,
            ivaManoObra: ivaManoObra,
            columnaTotalNeto: columnaTotalNeto,
            columnaTotalIva: columnaTotalIva,
            totalAPagarFinal: totalAPagarFinal,
            tiempoCant: tiempoCant,
            tiempoUnidadTexto: tiempoUnidad === 'Días' ? 'uno' : tiempoCant,
            tiempoUnidadPlural: tiempoUnidad === 'Días' ? (Number(tiempoCant) === 1 ? 'DIA' : 'DIAS') : tiempoUnidad.toUpperCase(),
            logo: logoPath,
            observaciones: observacionesInput
        };

        await exportarPresupuestoPDF(paqueteDatos);
    },

    abrirModalCliente() {
        const modalContainer = document.createElement("div");
        modalContainer.id = "dynamicModalContainer";
        Object.assign(modalContainer.style, {
            position: "fixed",
            top: "0",
            left: "0",
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: "99999"
        });

        modalContainer.innerHTML = `
        <div style="background: white; padding: 25px; border-radius: 8px; width: 500px; max-width: 90%; max-height: 85vh; overflow-y: auto; box-shadow: 0px 4px 10px rgba(0,0,0,0.3); font-family: sans-serif;">
            <h2 style="color: #104E2E; margin-top:0; display:flex; align-items:center; gap:10px;">👤 Registrar Nuevo Cliente</h2>
            <p style="color: gray; font-size: 13px; margin-bottom:20px;">Los datos se guardarán directamente en tu base de datos central.</p>
            
            <label style="font-weight:bold; font-size:14px;">Nombre y Apellido</label><br>
            <input id="cliNombre" type="text" style="width:100%; padding:8px; margin-top:4px; margin-bottom:15px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px;"><br>

            <div style="display:flex; gap:15px; margin-bottom:15px;">
                <div style="flex:1;">
                    <label style="font-weight:bold; font-size:14px;">📍 Referencia (Zona/Localidad)</label><br>
                    <select id="cliReferencia" style="width:100%; padding:8px; margin-top:4px; border:1px solid #ccc; border-radius:4px;">
                        <option value="Resistencia">Resistencia</option>
                        <option value="Fontana">Fontana</option>
                        <option value="Barranqueras">Barranqueras</option>
                        <option value="Puerto Vilelas">Puerto Vilelas</option>
                        <option value="Particular">Particular (Sin Zona)</option>
                        <option value="Interior Chaco">Interior / Chaco</option>
                    </select>
                </div>
                <div style="flex:1;">
                    <label style="font-weight:bold; font-size:14px;">🏢 Tipo Documento</label><br>
                    <select id="cliTipo" style="width:100%; padding:8px; margin-top:4px; border:1px solid #ccc; border-radius:4px;">
                        <option value="X">🏠 Particular (Consumidor Final / X)</option>
                        <option value="CUIT">🏭 Comercio (CUIT)</option>
                        <option value="CUIL">💼 Profesional / Empleado (CUIL)</option>
                    </select>
                </div>
            </div>

            <label style="font-weight:bold; font-size:14px;">Teléfono</label><br>
            <input id="cliTelefono" type="text" placeholder="Ej: 3624XXXXXX" style="width:100%; padding:8px; margin-top:4px; margin-bottom:15px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px;"><br>

            <label style="font-weight:bold; font-size:14px;">Dirección</label><br>
            <input id="cliDireccion" type="text" style="width:100%; padding:8px; margin-top:4px; margin-bottom:15px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px;"><br>

            <label style="font-weight:bold; font-size:14px;">Número de Documento / CUIT</label><br>
            <input id="cliNumero" type="text" value="X" placeholder="Escribí el número o X si no tiene" style="width:100%; padding:8px; margin-top:4px; margin-bottom:15px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px;"><br>

            <label style="font-weight:bold; font-size:14px;">Observaciones</label><br>
            <textarea id="cliObs" rows="2" style="width:100%; padding:8px; margin-top:4px; margin-bottom:20px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px; resize:vertical;"></textarea><br>

            <div style="display:flex; justify-content: flex-end; gap:10px;">
                <button id="cancelarCliente" style="padding:10px 15px; background:#ccc; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">Cancelar</button>
                <button id="guardarCliente" style="padding:10px 15px; background:#104E2E; color:white; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">💾 Guardar Cliente</button>
            </div>
        </div>
        `;

        document.body.appendChild(modalContainer);

        document.getElementById("cliTipo").addEventListener("change", e => {
            const campoNum = document.getElementById("cliNumero");
            if (e.target.value === "X") {
                campoNum.value = "X";
            } else if (campoNum.value === "X") {
                campoNum.value = "";
            }
        });

        document.getElementById("cancelarCliente").onclick = () => {
            modalContainer.remove();
        };

        document.getElementById("guardarCliente").onclick = async () => {
            const nombre = document.getElementById("cliNombre").value.trim();
            const referencia = document.getElementById("cliReferencia").value;
            const telefono = document.getElementById("cliTelefono").value.trim();
            const direccion = document.getElementById("cliDireccion").value.trim();
            const tipoDocumento = document.getElementById("cliTipo").value;
            const numeroDocumento = document.getElementById("cliNumero").value.trim();
            const observaciones = document.getElementById("cliObs").value.trim();

            if (!nombre) {
                alert("Ingrese el nombre del cliente.");
                return;
            }

            try {
                const clientesActuales = await getAll("clientes");
                let proximoId = 1;
                if (clientesActuales.length > 0) {
                    const ids = clientesActuales.map(c => Number(c.id || 0));
                    proximoId = Math.max(...ids) + 1;
                }

                const nuevoCliente = {
                    id: proximoId,
                    nombre: nombre,
                    referencia: referencia,
                    telefono: telefono,
                    direccion: direccion,
                    tipoDocumento: tipoDocumento,
                    numeroDocumento: numeroDocumento,
                    observaciones: observaciones
                };

                await save("clientes", nuevoCliente);
                alert(`🎉 Cliente "${nombre}" registrado con éxito.`);
                modalContainer.remove();
                await this.cargarClientes();
                document.getElementById("cliente").value = nuevoCliente.id;
            } catch(err) { 
                console.error("Error al guardar cliente:", err); 
                alert("Ocurrió un error al intentar registrar el cliente.");
            }
        };
    }
}
export default presupuestos;