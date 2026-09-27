/* ==========================================================
   ABSALON PRO - MÓDULO REFRIGERACIÓN Y CLIMATIZACIÓN
   Calculador Modular de Instalación, Eléctrica y Reparaciones
========================================================== */

import { getAll, save } from "./storage.js";

export const refrigeracion = {
    catalogos: [],
    itemsCalculadosActuales: [],

    async iniciar() {
        await this.cargarCatalogos();
        this.renderEstructura();
        this.registrarEventos();
    },

    async cargarCatalogos() {
        try {
            this.catalogos = await getAll("catalogos");
        } catch (error) {
            console.error("Error cargando catálogo para refrigeración:", error);
            this.catalogos = [];
        }
    },

    renderEstructura() {
        const workspace = document.getElementById("workspace");
        workspace.innerHTML = `
        <div class="refrigeracion-container" style="padding: 15px; max-width: 1100px; margin: auto;">
            <div class="card" style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <h2>❄️ Calculador de Servicios de Refrigeración</h2>
                <p style="color: gray; font-size: 14px;">Elegí y combiná solo los módulos que vas a realizar para tu presupuesto.</p>
                <hr style="margin: 15px 0;">

                <!-- SECCIÓN 1: INSTALACIÓN BÁSICA DE SPLIT -->
                <div style="background: #f9f9f9; padding: 15px; border-radius: 6px; margin-bottom: 20px; border-left: 4px solid #0284c7;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <h3 style="margin:0; color: #0284c7;">1. Instalación Básica de Split</h3>
                        <label style="cursor:pointer; font-weight:bold;">
                            <input type="checkbox" id="chkAgregarInstalacion" checked> Incluir Instalación Básica
                        </label>
                    </div>

                    <div id="panelInstalacion" style="display: grid; margin-top: 15px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px;">
                        <div>
                            <label><b>Capacidad del Equipo:</b></label>
                            <select id="refCapacidad" style="width: 100%; padding: 8px; margin-top: 5px;">
                                <option value="3200">Hasta 3200 frig / 3500W</option>
                                <option value="4500">Hasta 4500 frig / 5200W</option>
                                <option value="6000">Hasta 6000 frig / 7000W</option>
                            </select>
                        </div>
                        <div>
                            <label><b>Metros de Cañería (Cobre):</b></label>
                            <input type="number" id="refMetroCano" value="3" min="1" step="0.5" style="width: 100%; padding: 8px; margin-top: 5px;">
                        </div>
                        <div>
                            <label><b>Soportes / Ménsulas:</b></label>
                            <select id="refSoporte" style="width: 100%; padding: 8px; margin-top: 5px;">
                                <option value="soporte_split_40">Ménsulas 40 cm (Hasta 3000 frig)</option>
                                <option value="soporte_split_50">Ménsulas 50 cm (Hasta 4500 frig)</option>
                                <option value="soporte_split_60">Ménsulas 60 cm (+6000 frig)</option>
                                <option value="ninguno">Sin Ménsulas (Piso / Piso Técnico)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- SECCIÓN 2: ADICIONAL ADAPTACIÓN / CONEXIÓN ELÉCTRICA -->
                <div style="background: #f9f9f9; padding: 15px; border-radius: 6px; margin-bottom: 20px; border-left: 4px solid #104E2E;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <h3 style="margin:0; color: #104E2E;">2. Adicional Alimentación y Conexión Eléctrica</h3>
                        <label style="cursor:pointer; font-weight:bold;">
                            <input type="checkbox" id="chkAgregarElectrica"> Incluir Trabajo Eléctrico
                        </label>
                    </div>

                    <div id="panelElectrica" style="display: none; margin-top: 15px; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                        <div>
                            <label><b>Metros de Cable Tipo Taller:</b></label>
                            <input type="number" id="elecMetrosCable" value="5" min="0" step="1" style="width: 100%; padding: 8px; margin-top: 5px;">
                        </div>
                        <div>
                            <label><b>Metros de Cablecanal:</b></label>
                            <input type="number" id="elecMetrosCablecanal" value="0" min="0" step="1" style="width: 100%; padding: 8px; margin-top: 5px;">
                        </div>
                        <div>
                            <label><b>Tomacorriente / Caja Externa:</b></label>
                            <select id="elecTomaTipo" style="width: 100%; padding: 8px; margin-top: 5px;">
                                <option value="ninguno">Ninguno (Ya existe toma)</option>
                                <option value="toma_exterior_20a">Caja Exterior + Toma 20A</option>
                                <option value="toma_embutir">Módulo Toma 20A Embutir</option>
                            </select>
                        </div>
                        <div>
                            <label><b>Protección en Tablero:</b></label>
                            <select id="elecTermica" style="width: 100%; padding: 8px; margin-top: 5px;">
                                <option value="ninguno">Ninguna</option>
                                <option value="termica_2x16">Térmica Bipolar 16A / 20A</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- SECCIÓN 3: DETECCIÓN DE FUGAS, REPARACIÓN Y CARGA DE GAS -->
                <div style="background: #f9f9f9; padding: 15px; border-radius: 6px; margin-bottom: 20px; border-left: 4px solid #d97706;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <h3 style="margin:0; color: #d97706;">3. Diagnóstico, Fuga y Carga de Refrigerante</h3>
                        <label style="cursor:pointer; font-weight:bold;">
                            <input type="checkbox" id="chkAgregarFuga"> Incluir Reparación / Carga
                        </label>
                    </div>

                    <div id="panelFuga" style="display: none; margin-top: 15px; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                        <div>
                            <label><b>Presurización con Nitrógeno:</b></label>
                            <select id="fugaNitrogeno" style="width: 100%; padding: 8px; margin-top: 5px;">
                                <option value="si">Sí (Prueba de fuga + Nitrógeno)</option>
                                <option value="no">No</option>
                            </select>
                        </div>
                        <div>
                            <label><b>Tipo de Refrigerante:</b></label>
                            <select id="fugaTipoGas" style="width: 100%; padding: 8px; margin-top: 5px;">
                                <option value="gas_r410a">R410a</option>
                                <option value="gas_r22">R22</option>
                                <option value="gas_r32">R32</option>
                            </select>
                        </div>
                        <div>
                            <label><b>Cantidad de Gas (Kg):</b></label>
                            <input type="number" id="fugaCantGas" value="1.0" min="0.1" step="0.1" style="width: 100%; padding: 8px; margin-top: 5px;">
                        </div>
                        <div>
                            <label><b>Cambio de Óvulos / Válvulas:</b></label>
                            <input type="number" id="fugaOvulos" value="0" min="0" step="1" style="width: 100%; padding: 8px; margin-top: 5px;">
                        </div>
                    </div>
                </div>

                <div style="display: flex; gap: 10px; margin-top: 15px;">
                    <button id="btnCalcularRef" style="flex: 1; padding: 12px; font-size: 16px; font-weight: bold; background: #0284c7; color: white; border: none; border-radius: 5px; cursor: pointer;">🧮 Calcular en Pantalla</button>
                    <button id="btnGuardarPresupuesto" style="flex: 1; padding: 12px; font-size: 16px; font-weight: bold; background: #104E2E; color: white; border: none; border-radius: 5px; cursor: pointer; display: none;">💾 Guardar en Presupuestos</button>
                </div>

                <!-- RESULTADOS -->
                <div id="resultadoCalculo" style="margin-top: 25px; display: none;">
                    <h3>📋 Desglose de Cómputo y Presupuesto</h3>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                        <thead>
                            <tr style="background: #eee; text-align: left;">
                                <th style="padding: 8px;">Concepto / Insumo</th>
                                <th style="padding: 8px;">Cantidad</th>
                                <th style="padding: 8px;">Precio U. ($)</th>
                                <th style="padding: 8px; text-align: right;">Subtotal ($)</th>
                            </tr>
                        </thead>
                        <tbody id="tbodyResultado"></tbody>
                    </table>
                    <div style="text-align: right; margin-top: 15px; font-size: 18px;">
                        <b>Total Materiales + Mano de Obra: <span id="totalGeneral" style="color: #104E2E;">$ 0.00</span></b>
                    </div>
                </div>

            </div>
        </div>
        `;
    },

    registrarEventos() {
        const chkInstalacion = document.getElementById("chkAgregarInstalacion");
        const panelInstalacion = document.getElementById("panelInstalacion");

        const chkElectrica = document.getElementById("chkAgregarElectrica");
        const panelElectrica = document.getElementById("panelElectrica");
        
        const chkFuga = document.getElementById("chkAgregarFuga");
        const panelFuga = document.getElementById("panelFuga");

        chkInstalacion.onchange = () => {
            panelInstalacion.style.display = chkInstalacion.checked ? "grid" : "none";
        };

        chkElectrica.onchange = () => {
            panelElectrica.style.display = chkElectrica.checked ? "grid" : "none";
        };

        chkFuga.onchange = () => {
            panelFuga.style.display = chkFuga.checked ? "grid" : "none";
        };

        document.getElementById("btnCalcularRef").onclick = () => {
            this.calcularPresupuesto();
            if (this.itemsCalculadosActuales.length > 0) {
                document.getElementById("btnGuardarPresupuesto").style.display = "block";
            } else {
                document.getElementById("btnGuardarPresupuesto").style.display = "none";
            }
        };

        document.getElementById("btnGuardarPresupuesto").onclick = async () => {
            if (!this.itemsCalculadosActuales || this.itemsCalculadosActuales.length === 0) return;

            const nombreCliente = prompt("Ingresá el nombre o referencia del cliente para este presupuesto:") || "Cliente Sin Nombre";
            
            const totalPresupuesto = this.itemsCalculadosActuales.reduce((acc, item) => acc + (item.cant * item.precio), 0);

            const nuevoPresupuesto = {
                id: String(Date.now()),
                fecha: new Date().toLocaleDateString("es-AR"),
                cliente: nombreCliente,
                rubro: "Refrigeración",
                items: this.itemsCalculadosActuales,
                total: totalPresupuesto,
                estado: "Pendiente"
            };

            try {
                await save("presupuestos", nuevoPresupuesto);
                alert("✅ Presupuesto guardado exitosamente en el módulo de Presupuestos.");
            } catch (error) {
                console.error("Error al guardar presupuesto:", error);
                alert("❌ Hubo un error al intentar guardar el presupuesto.");
            }
        };
    },

    obtenerPrecioCatalogo(idItem, precioDefecto = 0) {
        const encontrado = this.catalogos.find(i => i.id === idItem);
        return encontrado ? (encontrado.precio || precioDefecto) : precioDefecto;
    },

    calcularPresupuesto() {
        const items = [];

        // 1. CÁLCULO INSTALACIÓN BÁSICA (SI ESTÁ SELECCIONADA)
        if (document.getElementById("chkAgregarInstalacion").checked) {
            const capacidad = document.getElementById("refCapacidad").value;
            const metrosCano = parseFloat(document.getElementById("refMetroCano").value) || 0;
            const idSoporte = document.getElementById("refSoporte").value;

            // Mano de Obra Instalación
            const idMOInst = capacidad === "3200" ? "mo_inst_split_3200" : (capacidad === "4500" ? "mo_inst_split_4500" : "mo_inst_split_6000");
            const precioMOInst = this.obtenerPrecioCatalogo(idMOInst, 140000);
            items.push({ concepto: `Mano de Obra Instalación Split (${capacidad} frig)`, cant: 1, precio: precioMOInst });

            // Caños y Materiales de Interconexión
            const precioCano14 = this.obtenerPrecioCatalogo("caño_cobre_14", 6500);
            const precioCano38 = this.obtenerPrecioCatalogo("caño_cobre_38", 8900);
            const precioAislante = this.obtenerPrecioCatalogo("aislant_fita", 1200);
            const precioCinta = this.obtenerPrecioCatalogo("cinta_empaque", 2800);

            items.push({ concepto: 'Caño de Cobre 1/4"', cant: metrosCano, precio: precioCano14 });
            items.push({ concepto: 'Caño de Cobre 3/8"', cant: metrosCano, precio: precioCano38 });
            items.push({ concepto: "Aislante Térmico (Metro)", cant: metrosCano * 2, precio: precioAislante });
            items.push({ concepto: "Cinta PVC de Empaque (Rollos)", cant: Math.ceil(metrosCano / 3), precio: precioCinta });

            if (idSoporte !== "ninguno") {
                const precioSoporte = this.obtenerPrecioCatalogo(idSoporte, 8500);
                items.push({ concepto: "Juego Ménsulas / Soportes Exterior", cant: 1, precio: precioSoporte });
            }
        }

        // 2. CÁLCULO TRABAJO ELÉCTRICO ADICIONAL
        if (document.getElementById("chkAgregarElectrica").checked) {
            const metrosCable = parseFloat(document.getElementById("elecMetrosCable").value) || 0;
            const metrosCablecanal = parseFloat(document.getElementById("elecMetrosCablecanal").value) || 0;
            const tipoToma = document.getElementById("elecTomaTipo").value;
            const tipoTermica = document.getElementById("elecTermica").value;

            if (metrosCable > 0) {
                const precioCable = this.obtenerPrecioCatalogo("cable_taller_5x15", 2400);
                items.push({ concepto: "Cable Alimentación Eléctrica (Metro)", cant: metrosCable, precio: precioCable });
            }

            if (metrosCablecanal > 0) {
                const precioCablecanal = this.obtenerPrecioCatalogo("cablecanal_2010", 3200);
                items.push({ concepto: "Cablecanal Rígido 20x10 (Metro)", cant: metrosCablecanal, precio: precioCablecanal });
            }

            if (tipoToma !== "ninguno") {
                const precioToma = this.obtenerPrecioCatalogo(tipoToma, 4500);
                items.push({ concepto: "Caja Exterior / Módulo Tomacorriente 20A", cant: 1, precio: precioToma });
            }

            if (tipoTermica !== "ninguno") {
                const precioTermica = this.obtenerPrecioCatalogo(tipoTermica, 7500);
                items.push({ concepto: "Protección Térmica Bipolar 16A/20A", cant: 1, precio: precioTermica });
            }

            // Mano de obra acometida eléctrica
            const precioMOElec = this.obtenerPrecioCatalogo("mo_punto_caja", 8500);
            items.push({ concepto: "Mano de Obra Acometida y Cableado Eléctrico", cant: 1, precio: precioMOElec * 2 });
        }

        // 3. CÁLCULO DE DETECCIÓN DE FUGA Y CARGA DE GAS
        if (document.getElementById("chkAgregarFuga").checked) {
            const presurizaNitrogeno = document.getElementById("fugaNitrogeno").value === "si";
            const tipoGas = document.getElementById("fugaTipoGas").value;
            const cantGas = parseFloat(document.getElementById("fugaCantGas").value) || 0;
            const cantOvulos = parseInt(document.getElementById("fugaOvulos").value) || 0;

            if (presurizaNitrogeno) {
                const precioNitrogeno = this.obtenerPrecioCatalogo("carga_nitrogeno", 15000);
                items.push({ concepto: "Insumo Nitrógeno Seco (Presurización / Estanqueidad)", cant: 1, precio: precioNitrogeno });

                const precioMODet = this.obtenerPrecioCatalogo("mo_deteccion_fuga_carga", 150000);
                items.push({ concepto: "Mano de Obra Detección de Fuga y Vacío de Sistema", cant: 1, precio: precioMODet });
            }

            if (cantGas > 0) {
                const precioGas = this.obtenerPrecioCatalogo(tipoGas, 18000);
                items.push({ concepto: `Refrigerante (${tipoGas.replace('gas_', '').toUpperCase()}) - Kg`, cant: cantGas, precio: precioGas });
            }

            if (cantOvulos > 0) {
                const precioOvulo = this.obtenerPrecioCatalogo("orring_robinete", 3500);
                items.push({ concepto: "Reemplazo de Óvulo / Núcleo de Válvula", cant: cantOvulos, precio: precioOvulo });
            }
        }

        // GUARDAR LISTA EN PROPIEDAD LOCAL
        this.itemsCalculadosActuales = items;

        // MOSTRAR TABLA DE RESULTADOS
        const tbody = document.getElementById("tbodyResultado");
        tbody.innerHTML = "";

        if (items.length === 0) {
            alert("Seleccioná al menos uno de los 3 módulos (Instalación, Eléctrica o Reparación) para poder calcular.");
            document.getElementById("resultadoCalculo").style.display = "none";
            return [];
        }

        let totalGeneral = 0;

        items.forEach(item => {
            const subtotal = item.cant * item.precio;
            totalGeneral += subtotal;

            const tr = document.createElement("tr");
            tr.style.borderBottom = "1px solid #ddd";
            tr.innerHTML = `
                <td style="padding: 8px;">${item.concepto}</td>
                <td style="padding: 8px;">${item.cant}</td>
                <td style="padding: 8px;">$ ${item.precio.toLocaleString("es-AR")}</td>
                <td style="padding: 8px; text-align: right; font-weight: bold;">$ ${subtotal.toLocaleString("es-AR")}</td>
            `;
            tbody.appendChild(tr);
        });

        document.getElementById("totalGeneral").textContent = `$ ${totalGeneral.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`;
        document.getElementById("resultadoCalculo").style.display = "block";

        return items;
    }
};

export default refrigeracion;
