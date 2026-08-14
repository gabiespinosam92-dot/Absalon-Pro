/* ==========================================================
   ABSALON PRO - MÓDULO REFRIGERACIÓN Y CLIMATIZACIÓN (HVAC)
========================================================== */
import { getAll } from "./storage.js"; // Como storage.js está en la misma carpeta 'modules'

export const refrigeracion = {
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
            console.error("Error al cargar el catálogo de refrigeración:", error);
        }
    },

    render() {
        document.getElementById("workspace").innerHTML = `
        <div class="card">
            <h2>❄️ Cálculo de Equipos e Instalación HVAC / Refrigeración</h2>
            <p class="text-muted">Balance térmico express + cómputo métrico de cañerías e insumos de montaje.</p>
            <br>

            <form id="formRefrigeracion">
                <h4>📐 Balance Térmico del Ambiente</h4>
                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:15px; margin-top:10px;">
                    <div>
                        <label>Largo (m)</label><br>
                        <input type="number" id="hvacLargo" value="4" step="0.5" style="width:100%; padding:6px;">
                    </div>
                    <div>
                        <label>Ancho (m)</label><br>
                        <input type="number" id="hvacAncho" value="4" step="0.5" style="width:100%; padding:6px;">
                    </div>
                    <div>
                        <label>Alto (m)</label><br>
                        <input type="number" id="hvacAlto" value="2.6" step="0.1" style="width:100%; padding:6px;">
                    </div>
                    <div>
                        <label>Personas en ambiente</label><br>
                        <input type="number" id="hvacPersonas" value="2" min="1" style="width:100%; padding:6px;">
                    </div>
                </div>

                <div style="margin-top:10px; display:flex; gap:20px;">
                    <label><input type="checkbox" id="orientacionOeste"> Ventanal o Techo a Rayo de Sol (Oeste/Norte)</label>
                </div>

                <hr style="margin:20px 0;">

                <h4>🛠️ Materiales de Instalación y Montaje</h4>
                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:15px; margin-top:10px;">
                    <div>
                        <label>Metros de Cañería (m)</label><br>
                        <input type="number" id="mCaneria" value="3" step="0.5" style="width:100%; padding:6px;">
                    </div>
                    <div>
                        <label>Gas Refrigerante</label><br>
                        <select id="tipoGas" style="width:100%; padding:6px;">
                            <option value="R410A">R-410A</option>
                            <option value="R32">R-32</option>
                            <option value="R22">R-22</option>
                        </select>
                    </div>
                    <div>
                        <label>Tamaño Ménsula Ext.</label><br>
                        <select id="tamMensula" style="width:100%; padding:6px;">
                            <option value="40">40 cm (Hasta 3000 frig)</option>
                            <option value="50">50 cm (Hasta 4500 frig)</option>
                            <option value="60">60 cm (+6000 frig)</option>
                        </select>
                    </div>
                </div>

                <br>
                <button type="button" id="btnCalcularHVAC" style="padding:10px 20px; background:#0284c7; color:white; border:none; border-radius:4px; font-weight:bold; cursor:pointer;">❄️ Calcular Selección e Insumos</button>
            </form>
        </div>

        <div class="card mt-3" id="cardResultadosHVAC" style="display:none;">
            <div style="background:#e0f2fe; padding:15px; border-radius:6px; border-left:5px solid #0284c7; margin-bottom:15px;">
                <h3 style="margin:0; color:#0369a1;" id="lblCapacidadSugerida">Capacidad Recomendada: ---</h3>
            </div>

            <h3>📋 Desglose de Insumos e Instalación</h3>
            <table id="tablaResumenHVAC" style="width:100%; margin-top:10px; border-collapse:collapse;">
                <thead>
                    <tr style="text-align:left; border-bottom:2px solid #ddd;">
                        <th>Insumo / Concepto</th>
                        <th style="width:100px;">Cantidad</th>
                        <th style="width:80px;">Unidad</th>
                        <th style="width:120px;">Precio Unit.</th>
                        <th style="width:120px;">Total</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>

            <div style="text-align:right; margin-top:15px;">
                <h3 id="lblTotalCalculadoHVAC" style="color:#104E2E;">Total: $ 0,00</h3>
                <button id="btnTransferirHVAC" style="padding:12px 20px; background:#2196F3; color:white; border:none; border-radius:4px; font-weight:bold; cursor:pointer; margin-top:10px;">🚀 Cargar al Presupuesto</button>
            </div>
        </div>
        `;
    },

    eventos() {
        document.getElementById("btnCalcularHVAC").addEventListener("click", () => this.calcularHVAC());
        document.getElementById("btnTransferirHVAC").addEventListener("click", () => this.enviarAPresupuesto());
    },

    calcularHVAC() {
        const largo = Number(document.getElementById("hvacLargo").value) || 0;
        const ancho = Number(document.getElementById("hvacAncho").value) || 0;
        const alto = Number(document.getElementById("hvacAlto").value) || 0;
        const personas = Number(document.getElementById("hvacPersonas").value) || 1;
        const solDirecto = document.getElementById("orientacionOeste").checked;

        const mCaneria = Number(document.getElementById("mCaneria").value) || 3;
        const tipoGas = document.getElementById("tipoGas").value;
        const tamMensula = document.getElementById("tamMensula").value;

        // 1. BALANCE TÉRMICO
        const volM3 = largo * ancho * alto;
        let frigBase = volM3 * 50; // 50 Frigorías por m³
        if (personas > 2) frigBase += (personas - 2) * 150;
        if (solDirecto) frigBase += 500;

        // Selección comercial más cercana
        let equipoRecomendado = "2250 Frig (2.5 kW)";
        let diamAlta = "1/4";
        let diamBaja = "3/8";

        if (frigBase > 2500 && frigBase <= 3500) {
            equipoRecomendado = "3000 Frig (3.5 kW)";
            diamAlta = "1/4"; diamBaja = "1/2";
        } else if (frigBase > 3500 && frigBase <= 5000) {
            equipoRecomendado = "4500 Frig (5.2 kW)";
            diamAlta = "1/4"; diamBaja = "1/2";
        } else if (frigBase > 5000) {
            equipoRecomendado = "6000 Frig (6.4 kW)";
            diamAlta = "3/8"; diamBaja = "5/8";
        }

        document.getElementById("lblCapacidadSugerida").textContent = `Calculado: ${Math.round(frigBase)} Frig/h ➔ Equipo Recomendado: Split ${equipoRecomendado}`;

        // 2. CÓMPUTO DE MATERIALES
        const aislaflexMetros = Math.ceil(mCaneria * 2); // Un aislante por caño
        const cintaEmpaque = Math.ceil(mCaneria / 4);
        const cableInterconexion = Math.ceil(mCaneria + 1.5);
        
        // Carga extra de gas si supera los 5 metros precargados de fábrica
        let kgGasExtra = 0;
        if (mCaneria > 5) {
            kgGasExtra = Math.round(((mCaneria - 5) * 0.02) * 100) / 100; // 20g por metro extra
        }

        const resumen = [
            { nombreBusqueda: `Caño de Cobre ${diamAlta}"`, cantidad: mCaneria, unidad: "Metro" },
            { nombreBusqueda: `Caño de Cobre ${diamBaja}"`, cantidad: mCaneria, unidad: "Metro" },
            { nombreBusqueda: "Aislante Térmico Aislaflex", cantidad: aislaflexMetros, unidad: "Metro" },
            { nombreBusqueda: "Cinta PVC Venceflex / Empaque", cantidad: cintaEmpaque, unidad: "Rollo" },
            { nombreBusqueda: "Cable Taller 5x1.5 mm²", cantidad: cableInterconexion, unidad: "Metro" },
            { nombreBusqueda: "Manguera Condensado Ø 5/8", cantidad: Math.ceil(mCaneria), unidad: "Metro" },
            { nombreBusqueda: `Juego Ménsulas ${tamMensula}cm`, cantidad: 1, unidad: "Juego" },
            { nombreBusqueda: "Tacos Antivibratorios Goma", cantidad: 4, unidad: "Unidad" },
            { nombreBusqueda: "Tirafondos con Tarugos N°10", cantidad: 6, unidad: "Unidad" }
        ];

        if (kgGasExtra > 0) {
            resumen.push({ nombreBusqueda: `Refrigerante ${tipoGas}`, cantidad: kgGasExtra, unidad: "Kg" });
        }

        this.mostrarResultados(resumen);
    },

    mostrarResultados(resumen) {
        const tbody = document.querySelector("#tablaResumenHVAC tbody");
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

        document.getElementById("lblTotalCalculadoHVAC").textContent = `Total Estimado: $ ${totalGeneral.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`;
        document.getElementById("cardResultadosHVAC").style.display = "block";
    },

    enviarAPresupuesto() {
        if (this.materialesCalculados.length === 0) {
            alert("⚠️ No se encontraron algunos ítems en el catálogo central.");
        }

        localStorage.setItem("materiales_computados", JSON.stringify(this.materialesCalculados));
        localStorage.setItem("origen_computo", "refrigeracion");

        alert("✅ Insumos de refrigeración cargados. Redirigiendo al generador de presupuestos...");
        
        const btnPresupuesto = document.querySelector('[data-view="presupuestos"]');
        if (btnPresupuesto) btnPresupuesto.click();
    }
};

export default refrigeracion;