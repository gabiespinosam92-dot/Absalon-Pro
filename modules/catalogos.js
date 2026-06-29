/* ==========================================================
   ABSALON PRO
   modules/catalogos.js
   Sprint 3 - Subcategorías Dinámicas e Inteligentes
========================================================== */

import { getAll, add, getById, update } from "./storage.js";

export default class Catalogos {

    constructor() {
        this.workspace = document.getElementById("workspace");
        this.productoActual = null;

        // MAPEO DE SUBCATEGORÍAS EN UN SOLO LUGAR
        this.subcategorias = {
            "Construcción en Seco": [
                "Placas",
                "Perfiles",
                "Masillas",
                "Tornillos",
                "Cintas",
                "Aislaciones",
                "Accesorios"
            ],
            "Electricidad": [
                "Cables",
                "Caños",
                "Tableros",
                "Térmicas",
                "Disyuntores",
                "Iluminación",
                "Tomacorrientes",
                "Llaves",
                "Accesorios"
            ],
            "Refrigeración": [
                "Aires Acondicionados",
                "Cañerías",
                "Soportes",
                "Bombas",
                "Gas Refrigerante",
                "Aislación",
                "Herramientas",
                "Accesorios"
            ],
            "Albañilería": [
                "Cementos y Cales",
                "Ladrillos",
                "Arenas y Áridos",
                "Hierros y Mallas",
                "Aditivos y Capas Aisladoras",
                "Herramientas Manuales"
            ]
        };
    }

    async load() {
        await this.renderListado();
    }

    async renderListado() {
        const productos = await getAll("catalogos") || [];

        this.workspace.innerHTML = `
        <div class="card">
            <div class="toolbar">
                <div>
                    <h2>📚 Catálogo de Precios</h2>
                    <p>Materiales, repuestos y mano de obra.</p>
                </div>
                <button id="btnNuevoProducto" class="primary">+ Nuevo Artículo</button>
            </div>
        </div>

        <div id="contenedorFormulario"></div>

        <div class="card mt-3">
            <h3>📋 Lista de Precios Persistida</h3>
            <div id="listaProductos" class="grid-catalog mt-3"></div>
        </div>
        `;

        document.getElementById("btnNuevoProducto").onclick = () => this.mostrarFormulario();
        this.renderTarjetas(productos);
    }

    renderTarjetas(productos) {
        const contenedor = document.getElementById("listaProductos");
        if (productos.length === 0) {
            contenedor.innerHTML = `<p class="text-muted">El catálogo está vacío. Cargá tu primer ítem arriba.</p>`;
            return;
        }

        let html = "";
        productos.forEach(producto => {
            html += `
            <div class="catalog-card">
                <div class="d-flex justify-content-between align-items-start">
                    <span class="badge-category">${producto.categoria}</span>
                    <span class="text-muted" style="font-size:0.85rem;">${producto.unidad || "u"}</span>
                </div>
                <h4 class="mt-2">${producto.nombre}</h4>
                
                <p class="mt-2" style="margin-bottom: 2px;"><strong>Categoría:</strong> ${producto.categoria}</p>
                <p style="margin-top: 0; margin-bottom: 8px; color: #555;"><strong>Subcategoría:</strong> ${producto.subcategoria}</p>

                <div class="d-flex justify-content-between align-items-center mt-3" style="border-top: 1px dashed #ccc; padding-top: 10px;">
                    <div>
                        <small class="text-muted" style="display:block;">Venta</small>
                        <strong style="color: var(--success); font-size: 1.2rem;">$ ${producto.precio.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</strong>
                    </div>
                    <button class="secondary btnEditarProducto" data-id="${producto.id}" style="padding: 4px 8px; font-size: 0.85rem;">✏️ Editar</button>
                </div>
            </div>
            `;
        });

        contenedor.innerHTML = html;

        document.querySelectorAll(".btnEditarProducto").forEach(btn => {
            btn.onclick = async (e) => {
                const id = Number(e.target.dataset.id);
                const prod = await getById("catalogos", id);
                if (prod) this.mostrarFormulario(prod);
            };
        });
    }

    mostrarFormulario(producto = null) {
        this.productoActual = producto;
        const contenedor = document.getElementById("contenedorFormulario");

        let opcionesCategorias = `<option value="">-- Seleccionar Categoría --</option>`;
        Object.keys(this.subcategorias).forEach(cat => {
            const sel = producto && producto.categoria === cat ? "selected" : "";
            opcionesCategorias += `<option value="${cat}" ${sel}>${cat}</option>`;
        });

        contenedor.innerHTML = `
        <div class="card mt-3 border-primary fade-in">
            <h3>${producto ? "✏️ Editar Artículo" : "🆕 Cargar Nuevo Artículo / Mano de Obra"}</h3>
            <form id="formProducto" onsubmit="return false;" class="mt-2">
                <div class="grid-3">
                    <div class="form-group">
                        <label>Categoría Madre</label>
                        <select id="prodCategoria" required>${opcionesCategorias}</select>
                    </div>
                    <div class="form-group">
                        <label>Subcategoría</label>
                        <select id="prodSubcategoria" ${producto ? "" : "disabled"}>
                            <option value="">-- Primero Categoría --</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Unidad de Medida</label>
                        <input type="text" id="prodUnidad" placeholder="Ej: Unidad, Metros, Global" value="${producto ? producto.unidad : 'Unidad'}">
                    </div>
                </div>

                <div class="grid-2 mt-2">
                    <div class="form-group">
                        <label>Nombre del Producto / Descripción del Servicio</label>
                        <input type="text" id="prodNombre" placeholder="Ej: Cable unipolar 2.5mm" value="${producto ? producto.nombre : ''}">
                    </div>
                    <div class="form-group">
                        <label>Precio de Lista ($)</label>
                        <input type="number" id="prodPrecio" step="0.01" placeholder="0.00" value="${producto ? producto.precio : ''}">
                    </div>
                </div>

                <div class="mt-3 text-end">
                    <button type="button" id="btnCancelarProd" class="btn-secondary" style="margin-right:10px;">Cancelar</button>
                    <button type="button" id="btnGuardarProd" class="primary">💾 Guardar en Catálogo</button>
                </div>
            </form>
        </div>
        `;

        const selectCat = document.getElementById("prodCategoria");
        const selectSub = document.getElementById("prodSubcategoria");

        selectCat.onchange = () => {
            const cat = selectCat.value;
            selectSub.innerHTML = `<option value="">-- Seleccionar Subcategoría --</option>`;
            if (!cat) {
                selectSub.disabled = true;
                return;
            }
            this.subcategorias[cat].forEach(sub => {
                selectSub.innerHTML += `<option value="${sub}">${sub}</option>`;
            });
            selectSub.disabled = false;
        };

        if (producto) {
            selectCat.dispatchEvent(new Event("change"));
            selectSub.value = producto.subcategoria;
        }

        document.getElementById("btnCancelarProd").onclick = () => { contenedor.innerHTML = ""; };
        document.getElementById("btnGuardarProd").onclick = () => this.guardarProducto();
    }

    /* ======================================================
       GUARDADO CON FILTRO DE VALIDACIÓN COMPLETO (PARTE 3)
    ====================================================== */
    async guardarProducto() {
        const categoria = document.getElementById("prodCategoria").value;
        const subcategoria = document.getElementById("prodSubcategoria").value;
        const unidad = document.getElementById("prodUnidad").value.trim();
        const nombre = document.getElementById("prodNombre").value;
        const precio = document.getElementById("prodPrecio").value;

        // VALIDACIONES PARTE 3
        if (categoria === "") {
            alert("Seleccione una categoría.");
            return;
        }

        if (subcategoria === "") {
            alert("Seleccione una subcategoría.");
            return;
        }

        if (nombre.trim() === "") {
            alert("Ingrese un producto.");
            return;
        }

        if (precio === "" || isNaN(precio) || Number(precio) <= 0) {
            alert("Ingrese un precio válido.");
            return;
        }

        const datos = {
            categoria,
            subcategoria,
            unidad,
            nombre: nombre.trim(),
            precio: Number(precio)
        };

        if (this.productoActual) {
            datos.id = this.productoActual.id;
            await update("catalogos", datos);
            alert("✅ Artículo actualizado en el catálogo.");
        } else {
            datos.id = Date.now();
            await add("catalogos", datos);
            alert("✅ Nuevo artículo guardado con éxito.");
        }

        await this.renderListado();
    }
}