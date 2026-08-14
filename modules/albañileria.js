/* ==========================================================
   ABSALON PRO - MÓDULO ALBAÑILERÍA / ESTRUCTURAS
========================================================== */

import { getAll } from "./storage.js";

export const albanileria = {
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
            console.error("Error al cargar el catálogo:", error);
        }
    },

    render() {
        document.getElementById("workspace").innerHTML = `
        <div class="card">
            <h2>🧱 Cómputo Métrico y Estructuras - Albañilería</h2>
            <p class="text-muted">Cálculo de Vigas de Hormigón Armado, Acero y Excavación.</p>
            <br>

            <form id="formViga">
                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:15px;">
                    <div>
                        <label><b>Ancho Viga (cm)</b></label><br>
                        <input type="number" id="vigaAncho" value="20" style="width:100%; padding:6px;">
                    </div>
                    <div>
                        <label><b>Alto Viga (cm)</b></label><br>
                        <input type="number" id="vigaAlto" value="40" style="width:100%; padding:6px;">
                    </div>
                    <div>
                        <label><b>Largo / Metros Lineales (m)</b></label><br>
                        <input type="number" id="vigaLargo" value="10" step="0.1" style="width:100%; padding:6px;">
                    </div>
                </div>

                <hr style="margin:20px 0;">

                <h4>🔨 Armadura de Hierros y Estribos</h4>
                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:15px; margin-top:10px;">
                    <div>
                        <label>Hierro Superior (Cant. y Ø)</label><br>
                        <div style="display:flex; gap:5px;">
                            <input type="number" id="cantSup" value="2" style="width:60px; padding:6px;">
                            <select id="diamSup" style="flex:1; padding:6px;">
                                <option value="6">Ø6 mm</option>
                                <option value="8">Ø8 mm</option>
                                <option value="10" selected>Ø10 mm</option>
                                <option value="12">Ø12 mm</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label>Hierro Inferior (Cant. y Ø)</label><br>
                        <div style="display:flex; gap:5px;">
                            <input type="number" id="cantInf" value="2" style="width:60px; padding:6px;">
                            <select id="diamInf" style="flex:1; padding:6px;">
                                <option value="6">Ø6 mm</option>
                                <option value="8">Ø8 mm</option>
                                <option value="10">Ø10 mm</option>
                                <option value="12" selected>Ø12 mm</option>
                                <option value="16">Ø16 mm</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label>Estribos (Ø y Separación)</label><br>
                        <div style="display:flex; gap:5px;">
                            <select id="diamEstribo" style="width:90px; padding:6px;">
                                <option value="6" selected>Ø6 mm</option>
                                <option value="8">Ø8 mm</option>
                            </select>
                            <input type="number" id="sepEstribo" value="15" placeholder="Separación cm" style="flex:1; padding:6px;"> <span style="align-self:center;">cm</span>
                        </div>
                    </div>
                </div>

                <hr style="margin:20px 0;">

                <div style="display:flex; align-items:center; gap:10px;">
                    <input type="checkbox" id="incluirExcavacion" id="incluirExcavacion" style="transform:scale(1.3);">
                    <label for="incluirExcavacion" style="font-weight:bold; cursor:pointer;">¿Incluir Cómputo de Excavación?</label>
                </div>

                <br>
                <button type="button" id="btnCalcularViga" style="padding:10px 20px; background:#104E2E; color:white; border:none; border-radius:4px; font-weight:bold; cursor:pointer;">⚡ Calcular Materiales</button>
            </form>
        </div>

        <div class="card mt-3" id="cardResultados" style="display:none;">
            <h3>📋 Materiales Computados y Costos Estimados</h3>
            <table id="tablaResumenAlbanileria" style="width:100%; margin-top:10px; border-collapse:collapse;">
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
                <h3 id="lblTotalCalculado" style="color:#104E2E;">Total: $ 0,00</h3>
                <button id="btnTransferirPresupuesto" style="padding:12px 20px; background:#2196F3; color:white; border:none; border-radius:4px; font-weight:bold; cursor:pointer; margin-top:10px;">🚀 Cargar al Presupuesto</button>
            </div>
        </div>
        `;
    },

    eventos() {
        document.getElementById("btnCalcularViga").addEventListener("click", () => this.calcularViga());
        
        document.getElementById("btnTransferirPresupuesto").addEventListener("click", () => {
            this.enviarAPresupuesto();
        });
    },

    calcularViga() {
        const anchoM = Number(document.getElementById("vigaAncho").value) / 100;
        const altoM = Number(document.getElementById("vigaAlto").value) / 100;
        const largoM = Number(document.getElementById("vigaLargo").value);

        const cantSup = Number(document.getElementById("cantSup").value);
        const diamSup = document.getElementById("diamSup").value;

        const cantInf = Number(document.getElementById("cantInf").value);
        const diamInf = document.getElementById("diamInf").value;

        const diamEstribo = document.getElementById("diamEstribo").value;
        const sepEstriboM = Number(document.getElementById("sepEstribo").value) / 100;

        const conExcavacion = document.getElementById("incluirExcavacion").checked;

        // 1. CÓMPUTO DE HORMIGÓN (Volumen m³)
        const volHormigon = anchoM * altoM * largoM;

        // Dosificación estándar Hormigón H17/H21 por m³ (350kg Cemento, 0.65m³ Arena, 0.65m³ Piedra)
        const kgCemento = volHormigon * 350;
        const bolsasCemento = Math.ceil(kgCemento / 50); // Bolsas de 50kg
        const m3Arena = Math.round((volHormigon * 0.65) * 100) / 100;
        const m3Piedra = Math.round((volHormigon * 0.65) * 100) / 100;

        // 2. CÓMPUTO DE ACERO (Peso por metro según diámetro)
        const pesosMetro = { "6": 0.222, "8": 0.395, "10": 0.617, "12": 0.888, "16": 1.578 };

        // Hierros longitudinales (con recubrimiento y desperdicio ~10%)
        const metrosHierroSup = cantSup * largoM * 1.1;
        const kgHierroSup = metrosHierroSup * pesosMetro[diamSup];

        const metrosHierroInf = cantInf * largoM * 1.1;
        const kgHierroInf = metrosHierroInf * pesosMetro[diamInf];

        // Estribos (Perímetro descontando 2.5cm de recubrimiento por lado)
        const perimetroEstribo = 2 * ((anchoM - 0.05) + (altoM - 0.05)) + 0.10; // +10cm de patillas
        const cantEstribos = Math.ceil(largoM / sepEstriboM) + 1;
        const metrosEstribos = cantEstribos * perimetroEstribo;
        const kgEstribos = metrosEstribos * pesosMetro[diamEstribo];

        // 3. EXCAVACIÓN
        let m3Excavacion = 0;
        if (conExcavacion) {
            m3Excavacion = volHormigon; // Volumen aproximado de zanja
        }

        // Armamos la lista de ítems para buscar en el catálogo
        const resumen = [
            { nombreBusqueda: "Cemento 50kg", cantidad: bolsasCemento, unidad: "Bolsa" },
            { nombreBusqueda: "Arena", cantidad: m3Arena, unidad: "m³" },
            { nombreBusqueda: "Piedra Partida", cantidad: m3Piedra, unidad: "m³" },
            { nombreBusqueda: `Hierro del Ø${diamSup}`, cantidad: Math.ceil(kgHierroSup), unidad: "Kg" },
            { nombreBusqueda: `Hierro del Ø${diamInf}`, cantidad: Math.ceil(kgHierroInf), unidad: "Kg" },
            { nombreBusqueda: `Hierro del Ø${diamEstribo}`, cantidad: Math.ceil(kgEstribos), unidad: "Kg" }
        ];

        if (conExcavacion) {
            resumen.push({ nombreBusqueda: "Excavación de Zanja", cantidad: Math.round(m3Excavacion * 100) / 100, unidad: "m³" });
        }

        this.mostrarResultados(resumen);
    },

    mostrarResultados(resumen) {
        const tbody = document.querySelector("#tablaResumenAlbanileria tbody");
        tbody.innerHTML = "";
        this.materialesCalculados = [];
        let totalGeneral = 0;

        resumen.forEach(item => {
            // Se busca coincidencia en el catálogo del sistema por nombre/concepto
            const itemCat = this.catalogo.find(c => 
                (c.concepto || c.nombre || "").toLowerCase().includes(item.nombreBusqueda.toLowerCase())
            );

            const precioUnit = itemCat ? Number(itemCat.precio || itemCat.costo || 0) : 0;
            const subtotal = item.cantidad * precioUnit;
            totalGeneral += subtotal;

            const idItem = itemCat ? itemCat.id : null;

            if (idItem) {
                this.materialesCalculados.push({
                    id: idItem,
                    cantidad: item.cantidad
                });
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

        document.getElementById("lblTotalCalculado").textContent = `Total Estimado: $ ${totalGeneral.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`;
        document.getElementById("cardResultados").style.display = "block";
    },

    enviarAPresupuesto() {
        if (this.materialesCalculados.length === 0) {
            alert("⚠️ No hay materiales reconocidos en el catálogo para transferir.");
            return;
        }

        // Guarda en localStorage con la misma estructura que usa Construcción en Seco
        localStorage.setItem("materiales_computados", JSON.stringify(this.materialesCalculados));

        alert("✅ Materiales cargados. Serás redirigido al generador de presupuestos.");
        
        // Simula clic en el menú o redirección de vista
        const btnPresupuesto = document.querySelector('[data-view="presupuestos"]');
        if (btnPresupuesto) {
            btnPresupuesto.click();
        }
    }
};

export default albanileria;