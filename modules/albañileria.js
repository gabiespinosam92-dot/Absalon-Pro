/* ==========================================================
   ABSALON PRO - MÓDULO ALBAÑILERÍA COMPLETO (FÓRMULAS DE OBRA)
========================================================== */
import { getAll } from "./storage.js"; // Como storage.js está en la misma carpeta 'modules'

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
            console.error("Error al cargar catálogo en albañilería:", error);
        }
    },

    render() {
        document.getElementById("workspace").innerHTML = `
        <div class="card">
            <h2>🏗️ Cómputo Métrico de Albañilería y Obra Húmeda</h2>
            <p class="text-muted">Cálculo parametrizado por dosificación y rendimiento de materiales por m² y m³.</p>
            <br>

            <form id="formAlbanileria">
                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:15px;">
                    <div>
                        <label><b>Seleccionar Rubro/Trabajo:</b></label><br>
                        <select id="rubroAlbanileria" style="width:100%; padding:8px; font-weight:bold; margin-top:5px;">
                            <option value="muro_ceramico_12">Muro Ladrillo Cerámico 12x18x33 (Tabique 15cm)</option>
                            <option value="muro_ceramico_18">Muro Ladrillo Cerámico 18x18x33 (Muro 20cm)</option>
                            <option value="muro_comun_15">Muro Ladrillo Común (Espesor 15cm)</option>
                            <option value="revoque_grueso">Revoque Grueso (Espesor 1.5 cm)</option>
                            <option value="revoque_fino">Revoque Fino (Espesor 0.5 cm)</option>
                            <option value="contrapiso">Contrapiso H° Cascote (Espesor 10 cm)</option>
                            <option value="carpeta">Carpeta de Nivelación (Espesor 2.5 cm)</option>
                            <option value="membrana_liquida">Impermeabilización con Membrana Líquida (3 Manos)</option>
                        </select>
                    </div>

                    <div>
                        <label><b>Superficie Total (m²):</b></label><br>
                        <input type="number" id="superficieM2" value="35" step="0.5" min="0.1" style="width:100%; padding:8px; margin-top:5px;">
                    </div>
                </div>

                <hr style="margin:20px 0;">

                <button type="button" id="btnCalcularAlba" style="padding:10px 20px; background:#104E2E; color:white; border:none; border-radius:4px; font-weight:bold; cursor:pointer;">🧱 Calcular Materiales</button>
            </form>
        </div>

        <div class="card mt-3" id="cardResultadosAlba" style="display:none;">
            <h3>📋 Resumen de Insumos Computados</h3>
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
                <h3 id="lblTotalCalculadoAlba" style="color:#104E2E;">Total: $ 0,00</h3>
                <button id="btnTransferirAlba" style="padding:12px 20px; background:#2196F3; color:white; border:none; border-radius:4px; font-weight:bold; cursor:pointer; margin-top:10px;">🚀 Cargar al Presupuesto</button>
            </div>
        </div>
        `;
    },

    eventos() {
        document.getElementById("btnCalcularAlba").addEventListener("click", () => this.calcularAlbanileria());
        document.getElementById("btnTransferirAlba").addEventListener("click", () => this.enviarAPresupuesto());
    },

    calcularAlbanileria() {
        const rubro = document.getElementById("rubroAlbanileria").value;
        const m2 = Number(document.getElementById("superficieM2").value) || 0;

        if (m2 <= 0) {
            alert("⚠️ Por favor ingresá una superficie válida en m².");
            return;
        }

        let resumen = [];

        // -------------------------------------------------------------
        // FÓRMULAS DE DOSIFICACIÓN Y RENDIMIENTO SEGÚN RUBRO
        // -------------------------------------------------------------
        switch (rubro) {
            case "muro_ceramico_12":
                // Ladrillo Cerámico 12x18x33 (16 a 17 un/m2)
                resumen = [
                    { nombreBusqueda: "Ladrillo Cerámico Hueco 12x18x33", cantidad: Math.ceil(m2 * 16.5 * 1.05), unidad: "Unidad" }, // +5% desperdicio
                    { nombreBusqueda: "Cemento", cantidad: Math.ceil(m2 * 3.5), unidad: "Kg" },
                    { nombreBusqueda: "Cal Hidráulica", cantidad: Math.ceil(m2 * 7.0), unidad: "Kg" },
                    { nombreBusqueda: "Arena Gruesa", cantidad: Math.round((m2 * 0.025) * 100) / 100, unidad: "m³" }
                ];
                break;

            case "muro_ceramico_18":
                // Ladrillo Cerámico 18x18x33 (16 a 17 un/m2)
                resumen = [
                    { nombreBusqueda: "Ladrillo Cerámico Hueco 18x18x33", cantidad: Math.ceil(m2 * 16.5 * 1.05), unidad: "Unidad" },
                    { nombreBusqueda: "Cemento", cantidad: Math.ceil(m2 * 5.0), unidad: "Kg" },
                    { nombreBusqueda: "Cal Hidráulica", cantidad: Math.ceil(m2 * 10.0), unidad: "Kg" },
                    { nombreBusqueda: "Arena Gruesa", cantidad: Math.round((m2 * 0.038) * 100) / 100, unidad: "m³" }
                ];
                break;

            case "muro_comun_15":
                // Ladrillo Común espesor 15cm (~60 un/m2)
                resumen = [
                    { nombreBusqueda: "Ladrillo Común", cantidad: Math.ceil(m2 * 60 * 1.07), unidad: "Unidad" }, // +7% rotura/desperdicio
                    { nombreBusqueda: "Cemento", cantidad: Math.ceil(m2 * 7.5), unidad: "Kg" },
                    { nombreBusqueda: "Cal Hidráulica", cantidad: Math.ceil(m2 * 15.0), unidad: "Kg" },
                    { nombreBusqueda: "Arena Gruesa", cantidad: Math.round((m2 * 0.05) * 100) / 100, unidad: "m³" }
                ];
                break;

            case "revoque_grueso":
                // Revoque Grueso 1.5 cm (0.015 m³ mortero/m2)
                resumen = [
                    { nombreBusqueda: "Cemento", cantidad: Math.ceil(m2 * 2.5), unidad: "Kg" },
                    { nombreBusqueda: "Cal Hidráulica", cantidad: Math.ceil(m2 * 6.0), unidad: "Kg" },
                    { nombreBusqueda: "Arena Gruesa", cantidad: Math.round((m2 * 0.018) * 100) / 100, unidad: "m³" }
                ];
                break;

            case "revoque_fino":
                // Revoque Fino 0.5 cm (0.005 m³ mortero/m2)
                resumen = [
                    { nombreBusqueda: "Cal Aérea / Fina", cantidad: Math.ceil(m2 * 2.2), unidad: "Kg" },
                    { nombreBusqueda: "Cemento", cantidad: Math.ceil(m2 * 0.8), unidad: "Kg" },
                    { nombreBusqueda: "Arena Fina", cantidad: Math.round((m2 * 0.006) * 100) / 100, unidad: "m³" }
                ];
                break;

            case "contrapiso":
                // Contrapiso 10 cm espesor
                resumen = [
                    { nombreBusqueda: "Cemento", cantidad: Math.ceil(m2 * 10.5), unidad: "Kg" },
                    { nombreBusqueda: "Cal Hidráulica", cantidad: Math.ceil(m2 * 15.0), unidad: "Kg" },
                    { nombreBusqueda: "Arena Gruesa", cantidad: Math.round((m2 * 0.045) * 100) / 100, unidad: "m³" },
                    { nombreBusqueda: "Cascote / Contrapiso", cantidad: Math.round((m2 * 0.09) * 100) / 100, unidad: "m³" }
                ];
                break;

            case "carpeta":
                // Carpeta de nivelación 2.5 cm (Dosificación 1:3)
                resumen = [
                    { nombreBusqueda: "Cemento", cantidad: Math.ceil(m2 * 9.0), unidad: "Kg" },
                    { nombreBusqueda: "Arena Gruesa / Mediana", cantidad: Math.round((m2 * 0.028) * 100) / 100, unidad: "m³" },
                    { nombreBusqueda: "Hidrófugo Líquido (Ceresita)", cantidad: Math.round((m2 * 0.5) * 10) / 10, unidad: "Kg" }
                ];
                break;

            case "membrana_liquida":
                // Membrana Líquida impermeabilizante (3 Manos: ~1.4 kg por m2)
                const kgMembrana = Math.ceil(m2 * 1.4);
                // Si la lata estándar es de 20kg, se calcula la cantidad de baldes requeridos
                const baldes20kg = Math.ceil(kgMembrana / 20);

                resumen = [
                    { nombreBusqueda: "Membrana Líquida Impermeabilizante 20kg", cantidad: baldes20kg, unidad: "Balde" },
                    { nombreBusqueda: "Malla / Venda Sintética (Refuerzo)", cantidad: Math.ceil(m2 * 1.1), unidad: "Metro" }
                ];
                break;
        }

        this.mostrarResultados(resumen);
    },

    mostrarResultados(resumen) {
        const tbody = document.querySelector("#tablaResumenAlbanileria tbody");
        tbody.innerHTML = "";
        this.materialesCalculados = [];
        let totalGeneral = 0;

        resumen.forEach(item => {
            // Buscamos coincidencia aproximada con el nombre en el catálogo
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

        document.getElementById("lblTotalCalculadoAlba").textContent = `Total Estimado: $ ${totalGeneral.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`;
        document.getElementById("cardResultadosAlba").style.display = "block";
    },

    enviarAPresupuesto() {
        if (this.materialesCalculados.length === 0) {
            alert("⚠️ Algunos materiales no se vincularon automáticamente con el catálogo, pero la lista base se enviará al presupuesto.");
        }

        localStorage.setItem("materiales_computados", JSON.stringify(this.materialesCalculados));
        localStorage.setItem("origen_computo", "albanileria");

        alert("✅ Materiales de albañilería cargados. Redirigiendo al generador de presupuestos...");
        
        const btnPresupuesto = document.querySelector('[data-view="presupuestos"]');
        if (btnPresupuesto) btnPresupuesto.click();
    }
};

export default albanileria;