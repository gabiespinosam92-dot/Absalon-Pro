/* ==========================================================
   ABSALON PRO - MÓDULO ELECTRICIDAD (NORMA AEA 90364)
========================================================== */

import { getAll } from "./storage.js"; // Como storage.js está en la misma carpeta 'modules'

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

            <form id="formElectricidad">
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

                <h4>🔌 Cableado y Puesta a Tierra (PAT)</h4>
                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:15px; margin-top:10px;">
                    <div>
                        <label>Promedio Cañería / Boca (m)</label><br>
                        <input type="number" id="mCañoPorBoca" value="3" step="0.5" style="width:100%; padding:6px;">
                    </div>
                    <div>
                        <label>Sección Cable Principal (mm²)</label><br>
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
        document.getElementById("btnCalcularElec").addEventListener("click", () => this.calcularElectricidad());
        document.getElementById("btnTransferirElec").addEventListener("click", () => this.enviarAPresupuesto());
    },

    calcularElectricidad() {
        const cantIUG = Number(document.getElementById("cantIUG").value) || 0;
        const cantTUG = Number(document.getElementById("cantTUG").value) || 0;
        const cantTUE = Number(document.getElementById("cantTUE").value) || 0;

        const mCañoPorBoca = Number(document.getElementById("mCañoPorBoca").value) || 3;
        const seccionAlim = document.getElementById("seccionAlimentador").value;
        const mAlim = Number(document.getElementById("mAlimentador").value) || 0;
        const conPAT = document.getElementById("incluirPAT").checked;

        const totalBocas = cantIUG + cantTUG + cantTUE;

        // 1. CAJAS Y CAÑERÍAS
        const cajasOctogonales = cantIUG;
        const cajasRectangulares = cantTUG + cantTUE;
        const conectores = totalBocas * 2;
        const metrosCaño = Math.ceil(totalBocas * mCañoPorBoca);

        // 2. CABLEADO ESTIMADO (Factor 1.15 por retornos/empalmes)
        // IUG: 1.5mm² (2 hilos) | TUG: 2.5mm² (2 hilos) | PE (Protección): 2.5mm² por boca
        const mCable15 = Math.ceil((cantIUG * mCañoPorBoca * 2) * 1.15);
        const mCable25 = Math.ceil(((cantTUG + cantTUE) * mCañoPorBoca * 2 + totalBocas * mCañoPorBoca) * 1.15); // Incluye PE de circuito
        const mCableAlim = Math.ceil(mAlim * 2 * 1.05);

        // 3. TABLERO Y PROTECCIONES BÁSICAS
        const disyuntorDiferencial = 1;
        const termicasCircuito = (cantIUG > 0 ? 1 : 0) + (cantTUG > 0 ? 1 : 0) + (cantTUE > 0 ? 1 : 0);

        const resumen = [
            { nombreBusqueda: "Caja Octogonal Chapa/PVC", cantidad: cajasOctogonales, unidad: "Unidad" },
            { nombreBusqueda: "Caja Rectangular 10x5", cantidad: cajasRectangulares, unidad: "Unidad" },
            { nombreBusqueda: "Conector 3/4", cantidad: conectores, unidad: "Unidad" },
            { nombreBusqueda: "Caño Corrugado / Rígido 3/4", cantidad: metrosCaño, unidad: "Metro" },
            { nombreBusqueda: "Cable Unipolar 1.5 mm²", cantidad: mCable15, unidad: "Metro" },
            { nombreBusqueda: "Cable Unipolar 2.5 mm²", cantidad: mCable25, unidad: "Metro" },
            { nombreBusqueda: `Cable Unipolar ${seccionAlim} mm²`, cantidad: mCableAlim, unidad: "Metro" },
            { nombreBusqueda: "Disyuntor Diferencial 2x40A", cantidad: disyuntorDiferencial, unidad: "Unidad" },
            { nombreBusqueda: "Llave Termomagnética Bipolar", cantidad: termicasCircuito, unidad: "Unidad" }
        ];

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