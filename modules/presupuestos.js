/* ==========================================================
   ABSALON PRO
   modules/presupuestos.js
   Sprint 8.0, 8.1 y 8.2 - Gestión de Trabajos y Seguimiento
   Sprint 8.9 - Corrección de Exportación de PDFGenerator e Integración Completa
========================================================== */

import asistentes from "./asistentes.js";
// Cambiamos la importación por el módulo directo
import * as PDFGenerator from "./pdf.js"; 
import {
    getAll,
    add,
    getById,
    update
} from "./storage.js";

/* =====================================================
   CONSTANTE DE ESTADOS (ACTUALIZADO OBRAS REALES)
===================================================== */
const ESTADOS = {
    BORRADOR: "Borrador",
    ENVIADO: "Enviado",
    APROBADO: "Aprobado",
    PROGRAMADO: "Programado",
    EN_EJECUCION: "En ejecución",
    FINALIZADO: "Finalizado",
    FACTURADO: "Facturado",
    EN_GARANTIA: "En garantía",
    CERRADO: "Cerrado"
};

function colorEstado(estado){
    switch(estado){
        case ESTADOS.BORRADOR: return "#7f8c8d";
        case ESTADOS.ENVIADO: return "#2196F3";
        case ESTADOS.APROBADO: return "#2ecc71";
        case ESTADOS.PROGRAMADO: return "#9b59b6";
        case ESTADOS.EN_EJECUCION: return "#e67e22";
        case ESTADOS.FINALIZADO: return "#1abc9c";
        case ESTADOS.FACTURADO: return "#9C27B0";
        case ESTADOS.EN_GARANTIA: return "#f1c40f";
        case ESTADOS.CERRADO: return "#27ae60";
        default: return "#7f8c8d";
    }
}

export default class Presupuestos {

    constructor() {
        this.workspace = document.getElementById("workspace");
        this.items = [];
    }

    async load(id = null) {
        if (id) {
            const p = await getById("presupuestos", Number(id));
            if (p) {
                this.items = p.items || [];
                await this.renderForm(p);
                return;
            }
        }
        await this.renderListado();
    }

    async renderListado() {
        const registros = await getAll("presupuestos");
        
        this.workspace.innerHTML = `
        <div class="card">
            <div class="toolbar">
                <div>
                    <h2>📄 Órdenes y Presupuestos</h2>
                    <p>Historial y seguimiento de estados de obra.</p>
                </div>
                <button id="btnNuevoPresupuesto" class="primary">+ Nueva Orden</button>
            </div>
        </div>
        <div id="listadoPresupuestos" class="mt-3"></div>
        `;

        const contenedor = document.getElementById("listadoPresupuestos");
        if (registros.length === 0) {
            contenedor.innerHTML = `<p class="text-muted text-center card">No hay órdenes ni presupuestos registrados.</p>`;
        } else {
            let html = "";
            registros.sort((a, b) => b.numero - a.numero).forEach(p => {
                html += `
                <div class="card mt-2" style="border-left: 5px solid ${colorEstado(p.estado)}">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                        <div>
                            <h3>Nº ${p.numero} - ${p.clienteNombre || "Cliente General"}</h3>
                            <small class="text-muted">Fecha: ${p.fecha ? p.fecha.split("-").reverse().join("/") : "-"}</small>
                        </div>
                        <div style="text-align: right;">
                            <span style="background: ${colorEstado(p.estado)}; color: #fff; padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: bold; text-transform: uppercase;">${p.estado}</span>
                            <strong style="display: block; margin-top: 5px; font-size: 1.1rem;">$ ${Number(p.total || 0).toLocaleString("es-AR", { minimumFractionDigits: 2 })}</strong>
                        </div>
                    </div>
                    <div class="mt-3" style="display: flex; gap: 8px; justify-content: flex-end;">
                        <button class="btn btnEditar" data-id="${p.id}">✏️ Gestionar</button>
                    </div>
                </div>
                `;
            });
            contenedor.innerHTML = html;
        }

        this.bindListadoEvents();
    }

    bindListadoEvents() {
        const btnNuevo = document.getElementById("btnNuevoPresupuesto");
        if (btnNuevo) {
            btnNuevo.onclick = () => this.renderForm();
        }

        document.querySelectorAll(".btnEditar").forEach(btn => {
            btn.onclick = (e) => this.load(Number(e.target.dataset.id));
        });
    }

    async renderForm(p = null) {
        const clientes = await getAll("clientes");
        const proximoNumero = p ? p.numero : (await this.generarProximoNumero());
        const fechaActual = p ? p.fecha : new Date().toISOString().split("T")[0];

        this.workspace.innerHTML = `
        <div class="card">
            <h2>${p ? "✏️ Editar Orden" : "📄 Nueva Orden de Trabajo / Presupuesto"}</h2>
            <p class="text-muted">Establecé los materiales, mano de obra y estados de seguimiento.</p>
        </div>

        <div class="card mt-3">
            <form id="formPresupuesto">
                <input type="hidden" id="idPresupuesto" value="${p ? p.id : ""}">
                
                <div style="display: flex; gap: 15px; flex-wrap: wrap; margin-bottom: 15px;">
                    <div style="flex: 1; min-width: 150px;">
                        <label>Número de Orden</label>
                        <input type="number" id="numeroPresupuesto" class="input" value="${proximoNumero}" readonly style="background: rgba(255,255,255,0.05);">
                    </div>
                    <div style="flex: 1; min-width: 150px;">
                        <label>Fecha de Emisión</label>
                        <input type="date" id="fechaPresupuesto" class="input" value="${fechaActual}">
                    </div>
                    <div style="flex: 1; min-width: 200px;">
                        <label>Estado Operativo de la Obra</label>
                        <select id="estadoPresupuesto" class="input">
                            ${Object.values(ESTADOS).map(e => `<option value="${e}" ${p && p.estado === e ? "selected" : ""}>${e}</option>`).join("")}
                        </select>
                    </div>
                </div>

                <div style="margin-bottom: 15px;">
                    <label>Asignar Cliente</label>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <select id="clientePresupuesto" class="input" style="flex: 1;" required>
                            <option value="">-- Seleccionar un Cliente --</option>
                            ${clientes.map(c => `<option value="${c.id}" data-nombre="${c.nombre}" ${p && p.clienteId === c.id ? "selected" : ""}>${c.nombre} (📍 ${c.direccion || "Sin dirección"})</option>`).join("")}
                        </select>
                        <button type="button" id="btnAltaRapidaCliente" class="primary" style="padding: 10px 15px; white-space: nowrap;" title="Crear nuevo cliente al instante">+ Nuevo</button>
                    </div>
                </div>

                <div style="background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <h4 style="margin-top:0; margin-bottom:10px;">🕒 Fechas de Seguimiento y Control de Hitos</h4>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <div style="flex:1; min-width: 130px;">
                            <label style="font-size:0.8rem; color:#aaa;">Seguimiento</label>
                            <input type="date" id="fechaSeguimiento" class="input" value="${p && p.fechaSeguimiento ? p.fechaSeguimiento : ""}">
                        </div>
                        <div style="flex:1; min-width: 130px;">
                            <label style="font-size:0.8rem; color:#aaa;">Aprobación</label>
                            <input type="date" id="fechaAprobacion" class="input" value="${p && p.fechaAprobacion ? p.fechaAprobacion : ""}">
                        </div>
                        <div style="flex:1; min-width: 130px;">
                            <label style="font-size:0.8rem; color:#aaa;">Finalización</label>
                            <input type="date" id="fechaFinalizacion" class="input" value="${p && p.fechaFinalizacion ? p.fechaFinalizacion : ""}">
                        </div>
                    </div>
                </div>

                <div style="margin-bottom: 15px;">
                    <label>Observaciones / Diagnóstico de Entrada</label>
                    <textarea id="observaciones" class="input" rows="3" placeholder="Detalles específicos del equipo, falla encontrada o requerimientos de obra...">${p && p.observaciones ? p.observaciones : ""}</textarea>
                </div>

                <div style="margin-top: 25px; border-bottom: 1px dashed var(--border); padding-bottom: 8px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                    <h3 style="margin: 0;">🛠 Ítems cargados (Materiales / Mano de Obra)</h3>
                    <button type="button" id="btnAgregarItemManual" class="primary" style="padding: 5px 12px; font-size: 0.85rem;">+ Agregar Ítem</button>
                </div>
                
                <div id="contenedorItems" class="mt-2"></div>

                <div style="margin-top: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                    <button type="button" id="btnAsistentePrecios" class="secondary">🧠 Asistente Inteligente de Precios</button>
                    <div style="text-align: right;">
                        <h4 style="margin: 0; color:#aaa;">Monto Total Estimado:</h4>
                        <h2 id="totalPresupuestoHtml" style="color: var(--primary); margin: 0; font-size: 1.6rem;">$ 0,00</h2>
                    </div>
                </div>

                <div style="margin-top: 30px; display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end; border-top: 1px solid var(--border); padding-top: 20px;">
                    <button type="button" id="btnCancelarPresupuesto" class="btn">Volver</button>
                    ${p ? `<button type="button" id="btnImprimirPDF" class="secondary">📥 Guardar PDF</button>` : ""}
                    <button type="submit" class="primary">💾 Guardar Registro</button>
                </div>
            </form>
        </div>
        `;

        this.renderItems();
        this.bindFormEvents();
    }

    renderItems() {
        const contenedor = document.getElementById("contenedorItems");
        if (this.items.length === 0) {
            contenedor.innerHTML = `<p class="text-muted" style="font-style: italic; padding: 10px 0;">No hay materiales ni mano de obra asignada a esta orden.</p>`;
            document.getElementById("totalPresupuestoHtml").innerText = "$ 0,00";
            return;
        }

        let html = `
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 0.9rem;">
            <thead>
                <tr style="border-bottom: 2px solid var(--border); text-align: left;">
                    <th style="padding: 8px;">Detalle</th>
                    <th style="padding: 8px; width: 80px; text-align: center;">Cant.</th>
                    <th style="padding: 8px; width: 120px; text-align: right;">P. Unitario</th>
                    <th style="padding: 8px; width: 120px; text-align: right;">Subtotal</th>
                    <th style="padding: 8px; width: 50px; text-align: center;"></th>
                </tr>
            </thead>
            <tbody>
        `;

        let suma = 0;
        this.items.forEach((item, index) => {
            const subtotal = Number(item.precio || 0) * Number(item.cantidad || 1);
            suma += subtotal;
            html += `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                <td style="padding: 8px;"><strong>${item.nombre}</strong></td>
                <td style="padding: 8px; text-align: center;">${item.cantidad}</td>
                <td style="padding: 8px; text-align: right;">$ ${Number(item.precio).toLocaleString("es-AR", { minimumFractionDigits: 2 })}</td>
                <td style="padding: 8px; text-align: right; color: var(--primary);"><strong>$ ${subtotal.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</strong></td>
                <td style="padding: 8px; text-align: center;">
                    <button type="button" class="btnEliminarItem danger" data-index="${index}" style="padding: 2px 6px; font-size: 0.75rem; cursor: pointer;">❌</button>
                </td>
            </tr>
            `;
        });

        html += `</tbody></table>`;
        contenedor.innerHTML = html;

        document.getElementById("totalPresupuestoHtml").innerText = `$ ${suma.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`;

        document.querySelectorAll(".btnEliminarItem").forEach(btn => {
            btn.onclick = (e) => {
                const idx = Number(e.target.dataset.index);
                this.items.splice(idx, 1);
                this.renderItems();
            };
        });
    }

    bindFormEvents() {
        const form = document.getElementById("formPresupuesto");
        form.onsubmit = async (e) => {
            e.preventDefault();
            await this.guardarPresupuesto();
        };

        const btnCancelar = document.getElementById("btnCancelarPresupuesto");
        if (btnCancelar) {
            btnCancelar.onclick = () => this.volverAListado();
        }

        const btnPDF = document.getElementById("btnImprimirPDF");
        if (btnPDF) {
            btnPDF.onclick = () => this.generarPDF();
        }

        const btnAltaCliente = document.getElementById("btnAltaRapidaCliente");
        if (btnAltaCliente) {
            btnAltaCliente.onclick = () => {
                const modalCliente = document.createElement("div");
                modalCliente.id = "modalAltaRapidaCliente";
                modalCliente.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:99999; padding:15px;";

                modalCliente.innerHTML = `
                <div class="card" style="width:100%; max-width:400px; background: #1e1e1e; border: 1px solid var(--border); padding: 20px; border-radius:8px;">
                    <h3 style="margin-top:0; margin-bottom:15px; border-bottom: 1px dashed var(--border); padding-bottom:8px;">👤 Alta Rápida de Cliente</h3>
                    
                    <div style="margin-bottom: 12px;">
                        <label style="font-size:0.85rem; color:#aaa;">Nombre Completo / Razón Social</label>
                        <input type="text" id="modalCliNombre" class="input" style="width:100%; margin-top:4px;" placeholder="Ej: Juan Pérez" required>
                    </div>

                    <div style="margin-bottom: 12px;">
                        <label style="font-size:0.85rem; color:#aaa;">Teléfono de Contacto</label>
                        <input type="text" id="modalCliTelefono" class="input" style="width:100%; margin-top:4px;" placeholder="Ej: 3624XXXXXX">
                    </div>

                    <div style="margin-bottom: 20px;">
                        <label style="font-size:0.85rem; color:#aaa;">Dirección / Ubicación de la Obra</label>
                        <input type="text" id="modalCliDireccion" class="input" style="width:100%; margin-top:4px;" placeholder="Ej: Av. Alberdi 450">
                    </div>

                    <div style="display:flex; gap:10px; justify-content:flex-end; border-top: 1px solid var(--border); padding-top:15px;">
                        <button type="button" id="btnCerrarModalCli" class="btn" style="padding:6px 12px;">Cancelar</button>
                        <button type="button" id="btnGuardarModalCli" class="primary" style="padding:6px 15px;">Guardar Cliente</button>
                    </div>
                </div>
                `;

                document.body.appendChild(modalCliente);
                document.getElementById("btnCerrarModalCli").onclick = () => modalCliente.remove();

                document.getElementById("btnGuardarModalCli").onclick = async () => {
                    const nombre = document.getElementById("modalCliNombre").value.trim();
                    const telefono = document.getElementById("modalCliTelefono").value.trim();
                    const direccion = document.getElementById("modalCliDireccion").value.trim();

                    if (!nombre) {
                        alert("⚠️ El nombre del cliente es obligatorio.");
                        return;
                    }

                    const nuevoCliente = {
                        id: Date.now(),
                        nombre: nombre,
                        telefono: telefono,
                        direccion: direccion
                    };

                    await add("clientes", nuevoCliente);

                    const selectCliente = document.getElementById("clientePresupuesto");
                    const nuevaOpcion = document.createElement("option");
                    nuevaOpcion.value = nuevoCliente.id;
                    nuevaOpcion.text = `${nuevoCliente.nombre} (📍 ${nuevoCliente.direccion || "Sin dirección"})`;
                    nuevaOpcion.dataset.nombre = nuevoCliente.nombre;
                    nuevaOpcion.selected = true;

                    selectCliente.add(nuevaOpcion);
                    modalCliente.remove();
                };
            };
        }

        const btnAgregarItem = document.getElementById("btnAgregarItemManual");
        if (btnAgregarItem) {
            btnAgregarItem.onclick = async () => {
                let catalogoCompleto = await getAll("catalogos");
                if (!catalogoCompleto || catalogoCompleto.length === 0) {
                    catalogoCompleto = await getAll("catalogo") || [];
                }

                if (catalogoCompleto.length === 0) {
                    alert("⚠️ No hay elementos cargados en el Catálogo todavía. Verificalo en la sección Catálogos.");
                    return;
                }

                const categoriasUnicas = [...new Set(catalogoCompleto.map(i => i.categoria).filter(Boolean))];

                const modal = document.createElement("div");
                modal.id = "modalSelectorCatalogo";
                modal.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:99999; padding:15px;";

                modal.innerHTML = `
                <div class="card" style="width:100%; max-width:450px; background: #1e1e1e; border: 1px solid var(--border); padding: 20px; border-radius:8px;">
                    <h3 style="margin-top:0; margin-bottom:15px; border-bottom: 1px dashed var(--border); padding-bottom:8px;">📦 Seleccionar desde Catálogo</h3>
                    
                    <div style="margin-bottom: 12px;">
                        <label style="font-size:0.85rem; color:#aaa;">1. Seleccionar Categoría</label>
                        <select id="modalSelectRubro" class="input" style="width:100%; margin-top:4px;">
                            <option value="">-- Seleccioná una Categoría --</option>
                            ${categoriasUnicas.map(c => `<option value="${c}">${c}</option>`).join("")}
                        </select>
                    </div>

                    <div style="margin-bottom: 12px;">
                        <label style="font-size:0.85rem; color:#aaa;">2. Seleccionar Subcategoría</label>
                        <select id="modalSelectSubcat" class="input" style="width:100%; margin-top:4px;" disabled>
                            <option value="">-- Primero elegí Categoría --</option>
                        </select>
                    </div>

                    <div style="margin-bottom: 15px;">
                        <label style="font-size:0.85rem; color:#aaa;">3. Seleccionar Elemento / Material</label>
                        <select id="modalSelectElemento" class="input" style="width:100%; margin-top:4px;" disabled>
                            <option value="">-- Primero elegí Subcategoría --</option>
                        </select>
                    </div>

                    <div style="display: flex; gap:10px; margin-bottom:15px;">
                        <div style="flex:1;">
                            <label style="font-size:0.85rem; color:#aaa;">Cantidad</label>
                            <input type="number" id="modalCantidad" class="input" value="1" min="1" style="width:100%; margin-top:4px;">
                        </div>
                        <div style="flex:1;">
                            <label style="font-size:0.85rem; color:#aaa;">Precio Unitario ($)</label>
                            <input type="number" id="modalPrecio" class="input" value="0" step="any" style="width:100%; margin-top:4px;">
                        </div>
                    </div>

                    <div style="display:flex; gap:10px; justify-content:flex-end; border-top: 1px solid var(--border); padding-top:15px;">
                        <button type="button" id="btnCerrarModalCat" class="btn" style="padding:6px 12px;">Cancelar</button>
                        <button type="button" id="btnAceptarModalCat" class="primary" style="padding:6px 15px;" disabled>Añadir a la Orden</button>
                    </div>
                </div>
                `;

                document.body.appendChild(modal);

                const selectCat = document.getElementById("modalSelectRubro");
                const selectSubcat = document.getElementById("modalSelectSubcat");
                const selectElemento = document.getElementById("modalSelectElemento");
                const inputPrecio = document.getElementById("modalPrecio");
                const inputCantidad = document.getElementById("modalCantidad");
                const btnAceptar = document.getElementById("btnAceptarModalCat");

                selectCat.onchange = () => {
                    const catSel = selectCat.value;
                    selectElemento.innerHTML = '<option value="">-- Primero elegí Subcategoría --</option>';
                    selectElemento.disabled = true;
                    inputPrecio.value = 0;
                    btnAceptar.disabled = true;

                    if (!catSel) {
                        selectSubcat.innerHTML = '<option value="">-- Primero elegí Categoría --</option>';
                        selectSubcat.disabled = true;
                        return;
                    }

                    const subcats = [...new Set(catalogoCompleto.filter(i => i.categoria === catSel).map(i => i.subcategoria).filter(Boolean))];
                    selectSubcat.innerHTML = `
                        <option value="">-- Seleccioná una Subcategoría --</option>
                        ${subcats.map(s => `<option value="${s}">${s}</option>`).join("")}
                    `;
                    selectSubcat.disabled = false;
                };

                selectSubcat.onchange = () => {
                    const catSel = selectCat.value;
                    const subcatSel = selectSubcat.value;
                    inputPrecio.value = 0;
                    btnAceptar.disabled = true;

                    if (!subcatSel) {
                        selectElemento.innerHTML = '<option value="">-- Primero elegí Subcategoría --</option>';
                        selectElemento.disabled = true;
                        return;
                    }

                    const elementosFiltrados = catalogoCompleto.filter(i => i.categoria === catSel && i.subcategoria === subcatSel);
                    selectElemento.innerHTML = `
                        <option value="">-- Seleccioná el Elemento --</option>
                        ${elementosFiltrados.map(i => `<option value="${i.id}" data-precio="${i.precio || 0}" data-nombre="${i.nombre}">${i.nombre}</option>`).join("")}
                    `;
                    selectElemento.disabled = false;
                };

                selectElemento.onchange = () => {
                    const opt = selectElemento.options[selectElemento.selectedIndex];
                    if (!selectElemento.value) {
                        inputPrecio.value = 0;
                        btnAceptar.disabled = true;
                        return;
                    }
                    inputPrecio.value = opt.dataset.precio || 0;
                    btnAceptar.disabled = false;
                };

                document.getElementById("btnCerrarModalCat").onclick = () => modal.remove();

                btnAceptar.onclick = () => {
                    const opt = selectElemento.options[selectElemento.selectedIndex];
                    const nombreFinal = opt.dataset.nombre;
                    const cantidadFinal = Number(inputCantidad.value) || 1;
                    const precioFinal = Number(inputPrecio.value) || 0;

                    this.items.push({
                        nombre: nombreFinal,
                        cantidad: cantidadFinal,
                        precio: precioFinal
                    });

                    this.renderItems();
                    modal.remove();
                };
            };
        }

        const btnAsistente = document.getElementById("btnAsistentePrecios");
        if (btnAsistente) {
            btnAsistente.onclick = () => {
                let fnAsistente = null;
                if (asistentes && typeof asistentes.abrirAsistente === "function") {
                    fnAsistente = asistentes.abrirAsistente;
                } else if (asistentes && asistentes.default && typeof asistentes.default.abrirAsistente === "function") {
                    fnAsistente = asistentes.default.abrirAsistente;
                } else if (typeof asistentes === "function") {
                    try {
                        const instanciaAsis = new asistentes();
                        if (typeof instanciaAsis.abrirAsistente === "function") {
                            fnAsistente = instanciaAsis.abrirAsistente.bind(instanciaAsis);
                        }
                    } catch(err) {}
                }

                if (fnAsistente) {
                    fnAsistente(this.items, () => this.renderItems());
                } else {
                    console.error("No se pudo extraer abrirAsistente de los exports de asistentes.js", asistentes);
                    alert("⚠️ El Asistente no se pudo mapear automáticamente. Cargá el ítem usando el botón '+ Agregar Ítem'.");
                }
            };
        }
    }

    async generarProximoNumero() {
        const todos = await getAll("presupuestos");
        if (todos.length === 0) return 1001;
        const numeros = todos.map(p => Number(p.numero || 0));
        return Math.max(...numeros) + 1;
    }

    async guardarPresupuesto() {
        const idExistente = document.getElementById("idPresupuesto").value;
        const numero = document.getElementById("numeroPresupuesto").value;
        const selectCliente = document.getElementById("clientePresupuesto");
        const opcionSeleccionada = selectCliente.options[selectCliente.selectedIndex];

        const clienteId = Number(selectCliente.value);
        const clienteNombre = opcionSeleccionada.dataset.nombre || "";

        const totalCalculado = this.items.reduce((t, i) => t + (Number(i.precio || 0) * Number(i.cantidad || 1)), 0);

        const fechaSeguimiento = document.getElementById("fechaSeguimiento").value;
        const fechaAprobacion = document.getElementById("fechaAprobacion").value;
        const fechaFinalizacion = document.getElementById("fechaFinalizacion").value;

        const datosPresupuesto = {
            numero: Number(numero),
            fecha: document.getElementById("fechaPresupuesto").value,
            estado: document.getElementById("estadoPresupuesto").value,
            clienteId: clienteId,
            clienteNombre: clienteNombre,
            observaciones: document.getElementById("observaciones").value,
            items: this.items,
            total: totalCalculado
        };

        if (fechaSeguimiento) datosPresupuesto.fechaSeguimiento = fechaSeguimiento;
        if (fechaAprobacion) datosPresupuesto.fechaAprobacion = fechaAprobacion;
        if (fechaFinalizacion) datosPresupuesto.fechaFinalizacion = fechaFinalizacion;

        if (idExistente) {
            datosPresupuesto.id = Number(idExistente);
            await update("presupuestos", datosPresupuesto);
            alert(`✅ Registro Nº ${numero} actualizado con éxito.`);
        } else {
            await add("presupuestos", datosPresupuesto);
            alert(`✅ Registro Nº ${numero} guardado correctamente.`);
        }

        this.volverAListado();
    }

    // LLAMADA DIRECTA REFACTORIZADA
    generarPDF() {
        const selectCliente = document.getElementById("clientePresupuesto");
        const cliente = selectCliente.options[selectCliente.selectedIndex].dataset.nombre;

        if (!cliente) {
            alert("¡Error! Debe seleccionar un cliente antes de generar el PDF.");
            return;
        }

        if (this.items.length === 0) {
            alert("Agregá productos para generar el PDF.");
            return;
        }

        const presupuesto = {
            numero: document.getElementById("numeroPresupuesto").value,
            fecha: document.getElementById("fechaPresupuesto").value,
            cliente: cliente,
            items: this.items,
            observaciones: document.getElementById("observaciones").value,
            total: this.items.reduce((t, i) => t + (Number(i.precio || 0) * Number(i.cantidad || 1)), 0)
        };

        // Ejecución limpia del import directo sin condicionales raros
        try {
            PDFGenerator.generar(presupuesto);
        } catch (error) {
            console.error("Error crítico al ejecutar PDFGenerator.generar:", error);
            alert("⚠️ Ocurrió un error al compilar el documento PDF.");
        }
    }

    volverAListado() {
        const btnMenu = document.querySelector('[data-view="historial"]');
        if (btnMenu) btnMenu.click();
    }
}