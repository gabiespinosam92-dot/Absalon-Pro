/* ==========================================================
   ABSALON PRO
   MÓDULO CATÁLOGOS - SEMBRADO FORZADO POR ID (RESOLUCIÓN DE REGISTROS)
========================================================== */

import { getAll, save } from "./storage.js";

export const catalogos = {
    articulos: [],
    pestanaActual: "material", // Puede ser 'material' o 'mano_obra'
    itemEditandoId: null,      // Para saber si estamos creando uno nuevo o editando
    itemPreCargado: null,

    async iniciar() { await this.load(); },

    async load() {
        this.renderEstructura();
        await this.verificarYPrecargarInsumos(); // 🚀 Revisa uno por uno e inyecta los faltantes
        await this.cargarArticulos();
        this.registrarEventosMódulo();
    },

    // 🛠️ SEMBRADO SEGURO: Si el ID del material no existe en el catálogo, lo inserta directamente
    async verificarYPrecargarInsumos() {
        try {
            const existentes = await getAll("catalogos");
            // Creamos un Set con los IDs que ya tenés guardados para buscar más rápido
            const idsExistentes = new Set(existentes.map(item => item.id));

            console.log("🌱 Verificando insumos base de Construcción en Seco en el Catálogo...");

            const insumosDurlock = [
                { id: "solera35", nombre: "Solera de 35 mm Perfil Galvanizado", precio: 1000, tipo: "material", especialidad: "Construcción Seco", unidad: "perfil", descripcion: "Perfil guía para estructura de cielorraso junta tomada" },
                { id: "montante35", nombre: "Montante de 35 mm Perfil Galvanizado", precio: 1000, tipo: "material", especialidad: "Construcción Seco", unidad: "perfil", descripcion: "Perfil montante estructural para cielorraso" },
                { id: "solera70", nombre: "Solera de 70 mm Perfil Galvanizado", precio: 1000, tipo: "material", especialidad: "Construcción Seco", unidad: "perfil", descripcion: "Perfil guía para estructura de tabique" },
                { id: "montante70", nombre: "Montante de 70 mm Perfil Galvanizado", precio: 1000, tipo: "material", especialidad: "Construcción Seco", unidad: "perfil", descripcion: "Perfil montante estructural para tabique" },
                { id: "perimetral3", nombre: "Perfil Perimetral de 3 mts", precio: 1000, tipo: "material", especialidad: "Construcción Seco", unidad: "perfil", descripcion: "Perfil perimetral para cielorraso desmontable" },
                { id: "larguero366", nombre: "Perfil Larguero de 3,66 mts", precio: 1000, tipo: "material", especialidad: "Construcción Seco", unidad: "perfil", descripcion: "Componente estructural desmontable principal" },
                { id: "travesano060", nombre: "Perfil Travesaño de 0,60 mts", precio: 1000, tipo: "material", especialidad: "Construcción Seco", unidad: "perfil", descripcion: "Perfil travesaño para modulación 60x60" },
                { id: "anguloAjuste", nombre: "Ángulo de ajuste estructural", precio: 1000, tipo: "material", especialidad: "Construcción Seco", unidad: "perfil", descripcion: "Ángulo de terminación y ajuste" },
                { id: "perfilOmega", nombre: "Perfil Omega Galvanizado", precio: 1000, tipo: "material", especialidad: "Construcción Seco", unidad: "perfil", descripcion: "Perfil omega para revestimiento directo de paredes" },
                { id: "montante34", nombre: "Montante de 34 mm (PVC / Estructural)", precio: 1000, tipo: "material", especialidad: "Construcción Seco", unidad: "perfil", descripcion: "Perfil montante para soporte de tablillas" },
                { id: "placa95", nombre: "Placa de Yeso 9,5 mm (Cielorraso)", precio: 1000, tipo: "material", especialidad: "Construcción Seco", unidad: "placa", descripcion: "Placa estándar durlock para cielorrasos junta tomada" },
                { id: "placa125", nombre: "Placa de Yeso 12,5 mm (Tabique/Revestimiento)", precio: 1000, tipo: "material", especialidad: "Construcción Seco", unidad: "placa", descripcion: "Placa estándar durlock de alta resistencia para tabiques" },
                { id: "placaNebula60", nombre: "Placa Nebula Desmontable 60x1,20", precio: 1000, tipo: "material", especialidad: "Construcción Seco", unidad: "placa", descripcion: "Placa acústica/térmica para cielorraso desmontable" },
                { id: "machPVC", nombre: "Machimbre PVC 14mm (20x200x3000 Mts)", precio: 1000, tipo: "material", especialidad: "Construcción Seco", unidad: "placa", descripcion: "Tablilla plástica para cielorraso PVC galerías" },
                { id: "bordeJ", nombre: "Perfil de terminación Borde 'J'", precio: 1000, tipo: "material", especialidad: "Construcción Seco", unidad: "ml", descripcion: "Perfil J plástico de terminación para placas de PVC" },
                { id: "masillaPasta", nombre: "Masilla en Pasta (Baldes Comerciales)", precio: 1000, tipo: "material", especialidad: "Construcción Seco", unidad: "Comercial", descripcion: "Masilla lista para usar tomado de juntas y pegado de cinta" },
                { id: "masillaPolvo", nombre: "Masilla en Polvo (Bolsas Comerciales)", precio: 1000, tipo: "material", especialidad: "Construcción Seco", unidad: "Comercial", descripcion: "Masilla de secado rápido en polvo para preparación" },
                { id: "cintaPapel", nombre: "Cinta de Papel Microperforada (Rollos)", precio: 1000, tipo: "material", especialidad: "Construcción Seco", unidad: "Comercial", descripcion: "Cinta de celulosa de alta resistencia para uniones de placas" },
                { id: "tarugo8", nombre: "Tarugos N° 8 con tope (Fijación Estructura)", precio: 1000, tipo: "material", especialidad: "Construcción Seco", unidad: "unidad", descripcion: "Tarugo expansivo de nylon para fijación en losa/pared" },
                { id: "tornillo8", nombre: "Tornillos de Fijación N° 8", precio: 1000, tipo: "material", especialidad: "Construcción Seco", unidad: "unidad", descripcion: "Tornillo de rosca madera/tarugo para fijar soleras" },
                { id: "tornilloT1A", nombre: "Tornillos T1 Punta Aguja", precio: 1000, tipo: "material", especialidad: "Construcción Seco", unidad: "unidad", descripcion: "Tornillo extra chato fijación metal con metal entre perfiles" },
                { id: "tornilloT1M", nombre: "Tornillos T1 Punta Mecha", precio: 1000, tipo: "material", especialidad: "Construcción Seco", unidad: "unidad", descripcion: "Tornillo punta mecha autoperforante estructural pesado" },
                { id: "tornilloT2A", nombre: "Tornillos T2 Punta Aguja", precio: 1000, tipo: "material", especialidad: "Construcción Seco", unidad: "unidad", descripcion: "Tornillo aguja para fijar placa durlock a perfiles" }
            ];

            let nuevosCargados = 0;
            for (const insumo of insumosDurlock) {
                // Si el ID no está registrado en la base de datos, lo guarda
                if (!idsExistentes.has(insumo.id)) {
                    await save("catalogos", insumo);
                    nuevosCargados++;
                }
            }
            
            if (nuevosCargados > 0) {
                console.log(`✅ Se sembraron ${nuevosCargados} materiales nuevos que faltaban en el catálogo.`);
            }
            
        } catch (error) {
            console.error("Error sembrando insumos base:", error);
        }
    },

    renderEstructura() {
        const workspace = document.getElementById("workspace");
        workspace.innerHTML = `
        <div class="catalogos-container" style="padding: 10px;">
            <div class="card">
                <h2>📚 Gestión de Catálogos</h2>
                <p style="color: gray; font-size: 14px;">Administrá tus materiales, repuestos y tarifas de mano de obra por especialidad.</p>
                <br>
                
                <div class="tabs-catalogo" style="display: flex; gap: 10px; margin-bottom: 20px;">
                    <button id="tabMateriales" class="btn-tab activo" style="flex: 1; padding: 12px; font-weight: bold; cursor: pointer;">📦 Materiales y Repuestos</button>
                    <button id="tabManoObra" class="btn-tab" style="flex: 1; padding: 12px; font-weight: bold; cursor: pointer;">🛠️ Tarifas Mano de Obra</button>
                </div>

                <div style="text-align: right; margin-bottom: 15px;">
                    <button id="btnAgregarItem" style="padding: 10px 20px; font-weight: bold; background: #104E2E; color: white; border: none; border-radius: 4px; cursor: pointer;">+ Nuevo Artículo</button>
                </div>

                <table id="tablaArticulos" style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f4f4f4; text-align: left; border-bottom: 2px solid #ccc;">
                            <th style="padding: 10px;">Nombre / Concepto</th>
                            <th style="padding: 10px;">Especialidad</th>
                            <th style="padding: 10px;">Unidad</th>
                            <th style="padding: 10px;">Precio ($)</th>
                            <th style="padding: 10px; text-align: center;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </div>

        <div id="modalContainer" style="position: fixed; top:0; left:0; width:100vw; height:100vh; background: rgba(0,0,0,0.5); display: none; justify-content: center; align-items: center; z-index: 10000;">
            <div class="card" style="width: 450px; background: white; padding: 25px; border-radius: 6px; box-shadow: 0px 4px 10px rgba(0,0,0,0.3);">
                <h3 id="modalTitulo">Agregar Artículo</h3>
                <br>
                
                <label><b>Nombre del Artículo / Tarea</b></label><br>
                <input type="text" id="artNombre" style="width: 100%; padding: 8px; margin-top: 5px; margin-bottom: 15px;"><br>

                <div style="display: flex; gap: 15px;">
                    <div style="flex: 1;">
                        <label><b>Tipo</b></label><br>
                        <select id="artTipo" style="width: 100%; padding: 8px; margin-top: 5px; margin-bottom: 15px;">
                            <option value="material">📦 Material</option>
                            <option value="mano_obra">🛠️ Mano de Obra</option>
                        </select>
                    </div>
                    <div style="flex: 1;">
                        <label><b>Unidad</b></label><br>
                      <select id="artUnidad" style="width:100%; padding:8px; margin-top:4px;">
                         <option value="M2">M2 (Metro Cuadrado)</option>
                         <option value="Perfil">Perfil</option>
                         <option value="Placa">Placa</option>
                         <option value="Bulto Comercial">Bulto Comercial</option>
                         <option value="Unidad">Unidad</option>
                         <option value="Metro Lineal">Metro Lineal</option>
                         <option value="Global">Global</option>
                    </select>
                    </div>
                </div>

                <div style="display: flex; gap: 15px;">
                    <div style="flex: 1;">
                        <label><b>Especialidad</b></label><br>
                        <select id="artEspecialidad" style="width: 100%; padding: 8px; margin-top: 5px; margin-bottom: 15px;">
                            <option value="Construcción Seco">Construcción Seco</option>
                            <option value="Refrigeración">Refrigeración</option>
                            <option value="Electricidad">Electricidad</option>
                        </select>
                    </div>
                    <div style="flex: 1;">
                        <label><b>Precio de Venta ($)</b></label><br>
                        <input type="number" id="artPrecio" step="0.01" style="width: 100%; padding: 8px; margin-top: 5px; margin-bottom: 15px;">
                    </div>
                </div>

                <label><b>Descripción Breve / Notas</b></label><br>
                <textarea id="artDescripcion" rows="2" style="width: 100%; padding: 8px; margin-top: 5px; margin-bottom: 20px;"></textarea><br>

                <div style="text-align: right; display: flex; justify-content: flex-end; gap: 10px;">
                    <button id="btnCancelarModal" style="padding: 8px 15px; background: #ccc; border: none; cursor: pointer; font-weight: bold; border-radius:4px;">Cancelar</button>
                    <button id="btnGuardarArticulo" style="padding: 8px 15px; background: #104E2E; color: white; border: none; cursor: pointer; font-weight: bold; border-radius:4px;">💾 Guardar</button>
                </div>
            </div>
        </div>
        `;
    },

    async cargarArticulos() {
        const tbody = document.querySelector("#tablaArticulos tbody");
        if (!tbody) return;

        try {
            const todos = await getAll("catalogos");
            this.articulos = todos.filter(item => item.tipo === this.pestanaActual);

            if (this.articulos.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" style="padding: 20px; text-align: center; color: gray;">No hay ítems registrados en este sector.</td></tr>`;
                return;
            }

            tbody.innerHTML = "";
            this.articulos.forEach(item => {
                const tr = document.createElement("tr");
                tr.style.borderBottom = "1px solid #ddd";

                tr.innerHTML = `
                    <td style="padding: 10px;"><b>${item.nombre}</b><br><small style="color:gray;">${item.descripcion || ''}</small></td>
                    <td style="padding: 10px;"><span style="background:#f0f0f0; padding:2px 6px; border-radius:4px; font-size:12px;">${item.especialidad}</span></td>
                    <td style="padding: 10px; text-transform: capitalize;">${item.unidad || 'unidad'}</td>
                    <td style="padding: 10px; font-weight: bold; color: #104E2E;">$ ${(item.precio || 0).toLocaleString("es-AR", { minimumFractionDigits: 2 })}</td>
                    <td style="padding: 10px; text-align: center;">
                        <button class="btn-editar" style="background:#0284c7; color:white; border:none; padding:4px 8px; border-radius:3px; cursor:pointer; font-weight:bold;">✏️ Editar</button>
                    </td>
                `;

                tr.querySelector(".btn-editar").onclick = () => this.abrirModalEdicion(item);
                tbody.appendChild(tr);
            });

        } catch (error) {
            console.error("Error cargando artículos:", error);
        }
    },

    registrarEventosMódulo() {
        const tabMat = document.getElementById("tabMateriales");
        const tabMO = document.getElementById("tabManoObra");
        const modal = document.getElementById("modalContainer");

        tabMat.onclick = async () => {
            tabMat.classList.add("activo");
            tabMO.classList.remove("activo");
            this.pestanaActual = "material";
            await this.cargarArticulos();
        };

        tabMO.onclick = async () => {
            tabMO.classList.add("activo");
            tabMat.classList.remove("activo");
            this.pestanaActual = "mano_obra";
            await this.cargarArticulos();
        };

        document.getElementById("btnAgregarItem").onclick = () => {
            this.itemEditandoId = null;
            this.itemPreCargado = null;
            document.getElementById("modalTitulo").textContent = "Agregar Artículo";
            document.getElementById("artNombre").value = "";
            document.getElementById("artPrecio").value = "";
            document.getElementById("artDescripcion").value = "";
            document.getElementById("artTipo").value = this.pestanaActual;
            modal.style.display = "flex";
        };

        document.getElementById("btnCancelarModal").onclick = () => {
            modal.style.display = "none";
        };

        document.getElementById("btnGuardarArticulo").onclick = async () => {
            const nombre = document.getElementById("artNombre").value.trim();
            const precio = parseFloat(document.getElementById("artPrecio").value) || 0;
            const tipo = document.getElementById("artTipo").value;
            const especialidad = document.getElementById("artEspecialidad").value;
            const descripcion = document.getElementById("artDescripcion").value.trim();
            const unidad = document.getElementById("artUnidad").value;

            if (!nombre || precio <= 0) {
                alert("Por favor, completá el nombre y un precio válido mayor a 0.");
                return;
            }

            const datosItem = {
                id: this.itemEditandoId ? this.itemEditandoId : String(Date.now()),
                nombre,
                descripcion,
                tipo,
                especialidad,
                unidad,
                precio
            };

            try {
                await save("catalogos", datosItem);
                alert(this.itemEditandoId ? "✅ Ítem actualizado con éxito." : "✅ Ítem agregado al catálogo con éxito.");
                modal.style.display = "none";
                await this.cargarArticulos();
            } catch (err) {
                console.error(err);
                alert("No se pudo guardar el artículo.");
            }
        };
    },

    abrirModalEdicion(item) {
        this.itemEditandoId = item.id;
        this.itemPreCargado = item;
        
        document.getElementById("modalTitulo").textContent = "✏️ Editar Precio / Datos";
        document.getElementById("artNombre").value = item.nombre;
        document.getElementById("artPrecio").value = item.precio;
        document.getElementById("artTipo").value = item.tipo;
        document.getElementById("artEspecialidad").value = item.especialidad;
        document.getElementById("artUnidad").value = item.unidad || "unidad";
        document.getElementById("artDescripcion").value = item.descripcion || "";
        
        document.getElementById("modalContainer").style.display = "flex";
    }
};

export default catalogos;
