/* ==========================================================
   ABSALON PRO - MÓDULO REFRIGERACIÓN
   modules/refrigeracion.js
========================================================== */

const refrigeracion = {
    // Estado interno para almacenar la última cotización generada
    itemsCalculadosActuales: [],

    // Precios de referencia base (se pueden ajustar según necesidad)
    precios: {
        nitrógeno: 15000,
        manoObraDeteccionVacio: 150000,
        refrigeranteR410a: 18000, // Precio por Kg
        ovuloValvula: 3500
    },

    iniciar() {
        this.render();
        this.vincularEventos();
    },

    render() {
        const main = document.getElementById("workspace");
        if (!main) return;

        main.innerHTML = `
            <div class="workspace">
                <div class="welcome-card" style="border-left: 5px solid #0284c7;">
                    <h2>❄️ Calculador de Servicios de Refrigeración</h2>
                    <p>Elegí y combiná los módulos para calcular costos de instalación, mantenimiento o carga de gas.</p>
                </div>

                <div style="display: grid; grid-template-columns: 1fr; gap: 20px; margin-top: 20px;">
                    
                    <!-- Opción 1: Instalación Básica -->
                    <div class="dashboard-card" style="border: 1px solid #e5e7eb;">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <h3 style="color:#0284c7; margin:0;">1. Instalación Básica de Split</h3>
                            <label style="font-weight:bold; cursor:pointer;">
                                <input type="checkbox" id="chk-instalacion-basica"> Incluir Instalación Básica
                            </label>
                        </div>
                    </div>

                    <!-- Opción 2: Adicional Eléctrico -->
                    <div class="dashboard-card" style="border: 1px solid #e5e7eb;">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <h3 style="color:#16a34a; margin:0;">2. Adicional Alimentación y Conexión Eléctrica</h3>
                            <label style="font-weight:bold; cursor:pointer;">
                                <input type="checkbox" id="chk-instalacion-electrica"> Incluir Trabajo Eléctrico
                            </label>
                        </div>
                    </div>

                    <!-- Opción 3: Diagnóstico, Fuga y Carga -->
                    <div class="dashboard-card" style="border: 1px solid #e5e7eb;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                            <h3 style="color:#ea580c; margin:0;">3. Diagnóstico, Fuga y Carga de Refrigerante</h3>
                            <label style="font-weight:bold; cursor:pointer;">
                                <input type="checkbox" id="chk-reparacion-carga" checked> Incluir Reparación / Carga
                            </label>
                        </div>

                        <div id="panel-reparacion" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:15px; background:#f9fafb; padding:15px; border-radius:6px;">
                            <div>
                                <label style="display:block; font-size:12px; font-weight:bold; margin-bottom:4px;">Presurización con Nitrógeno:</label>
                                <select id="ref-presurizacion" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;">
                                    <option value="si">Sí (Prueba de fuga + Nitrógeno)</option>
                                    <option value="no">No</option>
                                </select>
                            </div>

                            <div>
                                <label style="display:block; font-size:12px; font-weight:bold; margin-bottom:4px;">Tipo de Refrigerante:</label>
                                <select id="ref-tipo-gas" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;">
                                    <option value="R410a">R410a</option>
                                    <option value="R22">R22</option>
                                    <option value="R32">R32</option>
                                </select>
                            </div>

                            <div>
                                <label style="display:block; font-size:12px; font-weight:bold; margin-bottom:4px;">Cantidad de Gas (Kg):</label>
                                <input type="number" id="ref-cant-gas" step="0.1" value="1.5" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;">
                            </div>

                            <div>
                                <label style="display:block; font-size:12px; font-weight:bold; margin-bottom:4px;">Cambio de Óvulos / Válvulas:</label>
                                <input type="number" id="ref-cant-ovulos" value="1" min="0" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;">
                            </div>
                        </div>
                    </div>

                    <!-- Botones de Acción -->
                    <div style="display:flex; gap:15px; justify-content:flex-end;">
                        <button id="btnCalcularPantalla" style="background:#0284c7; color:white; border:none; padding:12px 20px; border-radius:6px; cursor:pointer; font-weight:bold;">📊 Calcular en Pantalla</button>
                        <button id="btnGuardarPresupuesto" style="background:#15803d; color:white; border:none; padding:12px 20px; border-radius:6px; cursor:pointer; font-weight:bold;">💼 Exportar a Presupuesto</button>
                    </div>

                    <!-- Tabla de Desglose -->
                    <div class="dashboard-card" style="margin-top:10px;">
                        <h3 style="margin-bottom:15px;">📄 Desglose de Cómputo y Presupuesto</h3>
                        <div style="overflow-x:auto;">
                            <table style="width:100%; border-collapse:collapse; text-align:left;">
                                <thead>
                                    <tr style="border-bottom:2px solid #e5e7eb; background:#f9fafb;">
                                        <th style="padding:10px;">Concepto / Insumo</th>
                                        <th style="padding:10px; text-align:center;">Cantidad</th>
                                        <th style="padding:10px; text-align:right;">Precio U. ($)</th>
                                        <th style="padding:10px; text-align:right;">Subtotal ($)</th>
                                    </tr>
                                </thead>
                                <tbody id="tabla-desglose-refrigeracion">
                                    <tr>
                                        <td colspan="4" style="padding:20px; text-align:center; color:#6b7280;">Hacé clic en "Calcular en Pantalla" para generar el desglose.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div style="text-align:right; margin-top:15px; font-size:18px; font-weight:bold; color:#15803d;">
                            Total Materiales + Mano de Obra: $<span id="lbl-total-refrigeracion">0.00</span>
                        </div>
                    </div>

                </div>
            </div>
        `;

        this.ejecutarCalculo();
    },

    vincularEventos() {
        document.getElementById("btnCalcularPantalla")?.addEventListener("click", () => this.ejecutarCalculo());
        document.getElementById("btnGuardarPresupuesto")?.addEventListener("click", () => this.exportarAPresupuesto());
        
        document.getElementById("chk-reparacion-carga")?.addEventListener("change", (e) => {
            const panel = document.getElementById("panel-reparacion");
            if (panel) panel.style.display = e.target.checked ? "grid" : "none";
        });
    },

    ejecutarCalculo() {
        this.itemsCalculadosActuales = [];
        let totalGeneral = 0;

        const chkReparacion = document.getElementById("chk-reparacion-carga")?.checked;

        if (chkReparacion) {
            const presurizacion = document.getElementById("ref-presurizacion")?.value;
            const cantGas = parseFloat(document.getElementById("ref-cant-gas")?.value) || 0;
            const cantOvulos = parseInt(document.getElementById("ref-cant-ovulos")?.value) || 0;
            const tipoGas = document.getElementById("ref-tipo-gas")?.value || "R410a";

            if (presurizacion === "si") {
                this.itemsCalculadosActuales.push({
                    concepto: "Insumo Nitrógeno Seco (Presurización / Estanqueidad)",
                    cantidad: 1,
                    precioUnitario: this.precios.nitrógeno,
                    subtotal: this.precios.nitrógeno
                });
            }

            // Mano de obra básica
            this.itemsCalculadosActuales.push({
                concepto: "Mano de Obra Detección de Fuga y Vacío de Sistema",
                cantidad: 1,
                precioUnitario: this.precios.manoObraDeteccionVacio,
                subtotal: this.precios.manoObraDeteccionVacio
            });

            if (cantGas > 0) {
                const subTotalGas = cantGas * this.precios.refrigeranteR410a;
                this.itemsCalculadosActuales.push({
                    concepto: `Refrigerante (${tipoGas}) - Kg`,
                    cantidad: cantGas,
                    precioUnitario: this.precios.refrigeranteR410a,
                    subtotal: subTotalGas
                });
            }

            if (cantOvulos > 0) {
                const subTotalOvulos = cantOvulos * this.precios.ovuloValvula;
                this.itemsCalculadosActuales.push({
                    concepto: "Reemplazo de Óvulo / Núcleo de Válvula",
                    cantidad: cantOvulos,
                    precioUnitario: this.precios.ovuloValvula,
                    subtotal: subTotalOvulos
                });
            }
        }

        this.renderTablaResultados();
    },

    renderTablaResultados() {
        const tbody = document.getElementById("tabla-desglose-refrigeracion");
        const lblTotal = document.getElementById("lbl-total-refrigeracion");

        if (!tbody) return;

        if (this.itemsCalculadosActuales.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="padding:20px; text-align:center; color:#6b7280;">No hay ítems seleccionados.</td></tr>`;
            if (lblTotal) lblTotal.textContent = "0.00";
            return;
        }

        let html = "";
        let sumaTotal = 0;

        this.itemsCalculadosActuales.forEach(item => {
            sumaTotal += item.subtotal;
            html += `
                <tr style="border-bottom:1px solid #e5e7eb;">
                    <td style="padding:10px;"><b>${item.concepto}</b></td>
                    <td style="padding:10px; text-align:center;">${item.cantidad}</td>
                    <td style="padding:10px; text-align:right;">$ ${item.precioUnitario.toLocaleString("es-AR")}</td>
                    <td style="padding:10px; text-align:right; font-weight:bold;">$ ${item.subtotal.toLocaleString("es-AR")}</td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
        if (lblTotal) lblTotal.textContent = sumaTotal.toLocaleString("es-AR");
    },

    exportarAPresupuesto() {
        if (!this.itemsCalculadosActuales || this.itemsCalculadosActuales.length === 0) {
            alert("Primero calculá los ítems antes de exportar.");
            return;
        }

        // 1. Guardamos la lista en localStorage exactamente igual a Construcción en Seco
        localStorage.setItem("materiales_computados", JSON.stringify(this.itemsCalculadosActuales));
        localStorage.setItem("origen_computo", "refrigeracion");

        // 2. Redirigimos automáticamente al módulo de Presupuestos
        const btnPresupuestos = document.querySelector('[data-view="presupuestos"]') || 
                                document.querySelector('[data-module="presupuestos"]') ||
                                document.getElementById("nav-presupuestos");

        if (btnPresupuestos) {
            btnPresupuestos.click();
        } else {
            alert("Insumos exportados con éxito. Abrí el menú 'Presupuestos' para editarlos.");
        }
    }
};

export default refrigeracion;
