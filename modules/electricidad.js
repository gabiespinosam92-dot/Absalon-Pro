/* ==========================================================
   ABSALON PRO - MÓDULO ELECTRICIDAD (NORMA AEA 90364)
   Actualizado con Pestañas de Configuración Detallada
========================================================== */

import { getAll } from "./storage.js";

export const electricidad = {
    catalogo: [],
    materialesCalculados: [],

    async iniciar() {
        this.render();
        await this.cargarCatalogo();
        this.eventos();
    },

    async cargarCatalogo() {
        try {
            this.catalogo = await getAll("catalogos");
        } catch (error) {
            console.error("Error al cargar el catálogo de electricidad:", error);
        }
    },

    render() {
        document.getElementById("workspace").innerHTML = `
        <div class="card">
            <h2>⚡ Cómputo Métrico de Instalaciones Eléctricas (AEA 90364)</h2>
            <p class="text-muted">Cálculo parametrizado por bocas, cableado de circuitos y Puesta a Tierra (PAT).</p>
            <br>

            <!-- Sistema de Pestañas (Tabs) -->
            <div style="display:flex; gap:10px; border-bottom:2px solid #ddd; margin-bottom:20px;">
                <button type="button" class="tab-btn active" data-tab="tab-bocas" style="padding:10px 20px; background:#eab308; border:none; font-weight:bold; cursor:pointer; border-radius:4px 4px 0 0;">1. Bocas y Circuitos</button>
                <button type="button" class="tab-btn" data-tab="tab-materiales" style="padding:10px 20px; background:#f3f4f6; border:none; font-weight:bold; cursor:pointer; border-radius:4px 4px 0 0;">2. Materiales y Cañerías</button>
            </div>

            <form id="formElectricidad">
                <!-- PESTAÑA 1: BOCAS -->
                <div id="tab-bocas" class="tab-content">
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:15px;">
                        <div>
                            <label><b>Bocas Iluminación (IUG)</b></label><br>
                            <input type="number" id="cantIUG" value="8" min="0" style="width:100%; padding:6px;">
                        </div>
                        <div>
                            <label><b>Bocas Tomacorrientes (TUG)</b></label><br>
                            <input type="number" id="cantTUG" value="12" min="0" style="width:100%; padding:6px;">
                        </div>
                        <div>
                            <label><b>Bocas Uso Especial (TUE)</b></label><br>
                            <input type="number" id="cantTUE" value="2" min="0" style="width:100%; padding:6px;">
                        </div>
                    </div>

                    <hr style="margin:20px 0;">

                    <h4>🔌 Configuración de Tomacorrientes y Cajas</h4>
                    <p class="text-muted" style="font-size: 0.9em;">Define el estándar de armado para las cajas rectangulares (puntos y tomas).</p>
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap:15px; margin-top:10px;">
                        <div>
                            <label>Tipo de Caja Rectangular predominante</label><br>
                            <select id="tipoCajaRectangular" style="width:100%; padding:6px;">
                                <option value="simple">1 Toma / Punto por caja (Standard)</option>
                                <option value="doble" selected>Caja con 2 tomas (Doble módulo)</option>
                                <option value="triple">Caja con 3 tomas (Múltiple)</option>
                            </select>
                        </div>
                        <div>
                            <label>Sección Cable Circuitos TUG / TUE</label><br>
                            <select id="seccionTUG" style="width:100%; padding:6px;">
                                <option value="2.5" selected>2.5 mm² (Normalizado)</option>
                                <option value="4.0">4.0 mm² (Reforzado)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- PESTAÑA 2: CAÑERÍAS Y ACCESORIOS -->
                <div id="tab-materiales" class="tab-content" style="display:none;">
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:15px; margin-top:10px;">
                        <div>
                            <label>Promedio Cañería / Boca (m)</label><br>
                            <input type="number" id="mCañoPorBoca" value="3" step="0.5" style="width:100%; padding:6px;">
                        </div>
                        <div>
                            <label>Tipo de Cañería</label><br>
                            <select id="tipoCaneria" style="width:100%; padding:6px;">
                                <option value="Corrugado PVC Pesado">Caño Corrugado Pesado (K6)</option>
                                <option value="Caño Rígido PVC">Caño Rígido PVC Rosca/Expansión</option>
                                <option value="Caño Acero Galvanizado">Caño Metálico Semipesado</option>
                            </select>
                        </div>
                        <div>
                            <label>Diámetro de Cañería</label><br>
                            <select id="diametroCaneria" style="width:100%; padding:6px;">
                                <option value="3/4" selected>3/4" (Estándar viviendas)</option>
                                <option value="7/8">7/8"</option>
                                <option value="1">1" (Alimentadores / Centralizados)</option>
                            </select>
                        </div>
                        <div>
                            <label>Sección Cable Alimentador (mm²)</label><br>
                            <select id="seccionAlimentador" style="width:100%; padding:6px;">
                                <option value="4">4.0 mm²</option>
                                <option value="6" selected>6.0 mm²</option>
                                <option value="10">10.0 mm²</option>
                            </select>
                        </div>
                        <div>
                            <label>Metros Acometida a Tablero (m)</label><br>
                            <input type="number" id="mAlimentador" value="15" step="1" style="width:100%; padding:6px;">
                        </div>
                    </div>

                    <hr style="margin:20px 0;">

                    <div style="display:flex; align-items:center; gap:10px;">
                        <input type="checkbox" id="incluirCurvas" checked style="transform:scale(1.3);">
                        <label for="incluirCurvas" style="cursor:pointer;">Incluir cálculo automático de Curvas y Conectores (aprox. 2 por boca)</label>
                    </div>
                </div>

                <hr style="margin:20px 0;">

                <div style="display:flex; align-items:center; gap:10px;">
                    <input type="checkbox" id="incluirPAT" checked style="transform:scale(1.3);">
                    <label for="incluirPAT" style="font-weight:bold; cursor:pointer;">¿Incluir Puesta a Tierra (Jabalina + Caja + Cable PAT)?</label>
                </div>

                <br>
                <button type="button" id="btnCalcularElec" style="padding:10px 20px; background:#eab308; color:black; border:none; border-radius:4px; font-weight:bold; cursor:pointer;">⚡ Calcular Materiales</button>
            </form>
        </div>

        <div class="card mt-3" id="cardResultadosElec" style="display:none;">
            <h3>📋 Insumos Computados y Costos Estimados</h3>
            <table id="tablaResumenElectricidad" style="width:100%; margin-top:10px; border-collapse:collapse;">
                <thead>
                    <tr style="text-align:left; border-bottom:2px solid #ddd;">
                        <th>Material / Concepto</th>
                        <th style="width:100px;">Cantidad</th>
                        <th style="width:80px;">Unidad</th>
                        <th style="width:120px;">Precio Unit.</th>
                        <th style="width:120px;">Total</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>

            <div style="text-align:right; margin-top:15px;">
                <h3 id="lblTotalCalculadoElec" style="color:#104E2E;">Total: $ 0,00</h3>
                <button id="btnTransferirElec" style="padding:12px 20px; background:#2196F3; color:white; border:none; border-radius:4px; font-weight:bold; cursor:pointer; margin-top:10px;">🚀 Cargar al Presupuesto</button>
            </div>
        </div>
        `;
    },

    eventos() {
        // Manejo simple de pestañas
        const tabButtons = document.querySelectorAll(".tab-btn");
        tabButtons.forEach(btn => {
            btn.addEventListener("click", (e) => {
                tabButtons.forEach(b => {
                    b.classList.remove("active");
                    b.style.background = "#f3f4f6";
                });
                e.target.classList.add("active");
                e.target.style.background = "#eab308";

                document.querySelectorAll(".tab-content").forEach(content => {
                    content.style.display = "none";
                });
                document.getElementById(e.target.dataset.tab).style.display = "block";
            });
        });

        document.getElementById("btnCalcularElec").addEventListener("click", () => this.calcularElectricidad());
        document.getElementById("btnTransferirElec").addEventListener("click", () => this.enviarAPresupuesto());
    },

    calcularElectricidad() {
        const cantIUG = Number(document.getElementById("cantIUG").value) || 0;
        const cantTUG = Number(document.getElementById("cantTUG").value) || 0;
        const cantTUE = Number(document.getElementById("cantTUE").value) || 0;

        const tipoCajaRect = document.getElementById("tipoCajaRectangular").value;
        const seccionTUGVal = Number(document.getElementById("seccionTUG").value) || 2.5;

        const mCañoPorBoca = Number(document.getElementById("mCañoPorBoca").value) || 3;
        const tipoCaneria = document.getElementById("tipoCaneria").value;
        const diametroCaneria = document.getElementById("diametroCaneria").value;
        const seccionAlim = document.getElementById("seccionAlimentador").value;
        const mAlim = Number(document.getElementById("mAlimentador").value) || 0;
        const incluirCurvas = document.getElementById("incluirCurvas").checked;
        const conPAT = document.getElementById("incluirPAT").checked;

        const totalBocas = cantIUG + cantTUG + cantTUE;

        // 1. CAJAS Y ACCESORIOS CON MULTIPLICADORES SEGÚN CONFIGURACIÓN
        const cajasOctogonales = cantIUG;
        
        // Multiplicador de bastidores/tapas/tomas si elige doble o triple
        let factorModulosCaja = 1;
        if (tipoCajaRect == "doble") factorModulosCaja = 2;
        if (tipoCajaRect == "triple") factorModulosCaja = 3;

        const cajasRectangulares = cantTUG + cantTUE;
        const cantidadModulosTom = cajasRectangulares * factorModulosCaja;

        const conectores = incluirCurvas ? totalBocas * 2 : 0;
        const curvas = incluirCurvas ? Math.ceil(totalBocas * 1.5) : 0;
        const metrosCaño = Math.ceil(totalBocas * mCañoPorBoca);

        // 2. CABLEADO ESTIMADO (Factor 1.15 por retornos/empalmes)
        const mCable15 = Math.ceil((cantIUG * mCañoPorBoca * 2) * 1.15);
        
        // Cable de la sección seleccionada para tomas (2.5mm² o 4mm²) + conductor de protección (PE)
        const mCableTomas = Math.ceil(((cantTUG + cantTUE) * mCañoPorBoca * 2 + totalBocas * mCañoPorBoca) * 1.15);
        const mCableAlim = Math.ceil(mAlim * 2 * 1.05);

        // 3. TABLERO Y PROTECCIONES BÁSICAS
        const disyuntorDiferencial = 1;
        const termicasCircuito = (cantIUG > 0 ? 1 : 0) + (cantTUG > 0 ? 1 : 0) + (cantTUE > 0 ? 1 : 0);

        const resumen = [
            { nombreBusqueda: "Caja Octogonal Chapa/PVC", cantidad: cajasOctogonales, unidad: "Unidad" },
            { nombreBusqueda: "Caja Rectangular 10x5", cantidad: cajasRectangulares, unidad: "Unidad" },
            { nombreBusqueda: `Módulo / Tapa Tomacorriente (Pack x${factorModulosCaja})`, cantidad: cantidadModulosTom, unidad: "Unidad" },
            { nombreBusqueda: `Caño ${tipoCaneria} ${diametroCaneria}`, cantidad: metrosCaño, unidad: "Metro" }
        ];

        if (incluirCurvas) {
            resumen.push(
                { nombreBusqueda: `Conector ${diametroCaneria}`, cantidad: conectores, unidad: "Unidad" },
                { nombreBusqueda: `Curva ${diametroCaneria}`, cantidad: curvas, unidad: "Unidad" }
            );
        }

        resumen.push(
            { nombreBusqueda: "Cable Unipolar 1.5 mm²", cantidad: mCable15, unidad: "Metro" },
            { nombreBusqueda: `Cable Unipolar ${seccionTUGVal} mm²`, cantidad: mCableTomas, unidad: "Metro" },
            { nombreBusqueda: `Cable Unipolar ${seccionAlim} mm²`, cantidad: mCableAlim, unidad: "Metro" },
            { nombreBusqueda: "Disyuntor Diferencial 2x40A", cantidad: disyuntorDiferencial, unidad: "Unidad" },
            { nombreBusqueda: "Llave Termomagnética Bipolar", cantidad: termicasCircuito, unidad: "Unidad" }
        );

        if (conPAT) {
            resumen.push(
                { nombreBusqueda: "Jabalina Acero-Cobre 5/8 x 1.5m", cantidad: 1, unidad: "Unidad" },
                { nombreBusqueda: "Caja Inspección PAT 15x15", cantidad: 1, unidad: "Unidad" },
                { nombreBusqueda: "Tomacable Bronce 5/8", cantidad: 1, unidad: "Unidad" },
                { nombreBusqueda: "Cable Verde/Amarillo 10 mm²", cantidad: Math.ceil(mAlim), unidad: "Metro" }
            );
        }

        this.mostrarResultados(resumen);
    },

    mostrarResultados(resumen) {
        const tbody = document.querySelector("#tablaResumenElectricidad tbody");
        tbody.innerHTML = "";
        this.materialesCalculados = [];
        let totalGeneral = 0;

        resumen.forEach(item => {
            const itemCat = this.catalogo.find(c => 
                (c.concepto || c.nombre || "").toLowerCase().includes(item.nombreBusqueda.toLowerCase())
            );

            const precioUnit = itemCat ? Number(itemCat.precio || itemCat.costo || 0) : 0;
            const subtotal = item.cantidad * precioUnit;
            totalGeneral += subtotal;

            if (itemCat) {
                this.materialesCalculados.push({ id: itemCat.id, cantidad: item.cantidad });
            }

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td style="padding:8px; border-bottom:1px solid #eee;">${item.nombreBusqueda}</td>
                <td style="padding:8px; border-bottom:1px solid #eee;">${item.cantidad}</td>
                <td style="padding:8px; border-bottom:1px solid #eee;">${item.unidad}</td>
                <td style="padding:8px; border-bottom:1px solid #eee;">$ ${precioUnit.toLocaleString("es-AR")}</td>
                <td style="padding:8px; border-bottom:1px solid #eee; font-weight:bold;">$ ${subtotal.toLocaleString("es-AR")}</td>
            `;
            tbody.appendChild(tr);
        });

        document.getElementById("lblTotalCalculadoElec").textContent = `Total Estimado: $ ${totalGeneral.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`;
        document.getElementById("cardResultadosElec").style.display = "block";
    },

    enviarAPresupuesto() {
        if (this.materialesCalculados.length === 0) {
            alert("⚠️ No hay materiales vinculados con el catálogo. Se enviará el listado base.");
        }

        localStorage.setItem("materiales_computados", JSON.stringify(this.materialesCalculados));
        localStorage.setItem("origen_computo", "electricidad");

        alert("✅ Materiales eléctricos cargados. Redirigiendo al generador de presupuestos...");
        
        const btnPresupuesto = document.querySelector('[data-view="presupuestos"]');
        if (btnPresupuesto) btnPresupuesto.click();
    }
};

export default electricidad;
