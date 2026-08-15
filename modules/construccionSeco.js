/* ==========================================================
   ABSALON PRO - CONSTRUCCIÓN EN SECO (INTEGRACIÓN TOTAL)
   modules/construccionSeco.js
========================================================== */

const construccionSeco = {
    // Lista temporal para guardar el último cálculo realizado
    ultimoCalculo: [],

    coeficientes: {
        cielorrasoJuntaTomada: {
            nombre: "Cielorraso Junta Tomada (35mm)",
            desperdicio: 1.08,
            items: [
                { id: "solera35", desc: "Solera de 35 mm", uni: "perfil", c: 0.55 },
                { id: "montante35", desc: "Montante de 35 mm", uni: "perfil", c: 1.34 },
                { id: "placa95", desc: "Placa de 9,5 mm", uni: "placa", c: 0.36 },
                { id: "masillaPasta", desc: "Masilla en Pasta", uni: "Comercial", c: 0.5, tipoEspecial: "masillaPasta" },
                { id: "masillaPolvo", desc: "Masilla en Polvo", uni: "Comercial", c: 0.6, tipoEspecial: "masillaPolvo" },
                { id: "cintaPapel", desc: "Cinta de Papel", uni: "Comercial", c: 2.01, tipoEspecial: "cinta" },
                { id: "tarugo8", desc: "Tarugos nº 8", uni: "unidad", c: 5.0 },
                { id: "tornillo8", desc: "Tornillos nº 8", uni: "unidad", c: 5.0 },
                { id: "tornilloT1A", desc: "Tornillos T1 punta aguja", uni: "unidad", c: 12.0 },
                { id: "tornilloT2A", desc: "Tornillos T2 punta aguja", uni: "unidad", c: 24.0 }
            ]
        },
        tabiqueJuntaTomada: {
            nombre: "Tabique Junta Tomada (70mm)",
            desperdicio: 1.05,
            items: [
                { id: "solera70", desc: "Solera de 70 mm", uni: "perfil", c: 0.6 },
                { id: "montante70", desc: "Montante de 70 mm", uni: "perfil", c: 0.95 },
                { id: "placa125", desc: "Placa de 12,5 mm", uni: "placa", c: 0.7 },
                { id: "masillaPasta", desc: "Masilla en Pasta", uni: "Comercial", c: 1.0, tipoEspecial: "masillaPasta" },
                { id: "masillaPolvo", desc: "Masilla en Polvo", uni: "Comercial", c: 1.2, tipoEspecial: "masillaPolvo" },
                { id: "cintaPapel", desc: "Cinta de Papel", uni: "Comercial", c: 4.16, tipoEspecial: "cinta" },
                { id: "tarugo8", desc: "Tarugos nº 8", uni: "unidad", c: 3.5 },
                { id: "tornillo8", desc: "Tornillos nº 8", uni: "unidad", c: 3.5 },
                { id: "tornilloT1A", desc: "Tornillos T1 punta aguja", uni: "unidad", c: 7.5 },
                { id: "tornilloT2A", desc: "Tornillos T2 punta aguja", uni: "unidad", c: 47.0 }
            ]
        },
        cielorrasoDesmontable60: {
            nombre: "Cielorraso Desmontable 60x60",
            desperdicio: 1.05,
            items: [
                { id: "perimetral3", desc: "Perimetrales de 3 mts", uni: "perfil", c: 0.48 },
                { id: "larguero366", desc: "Largueros de 3,66 mts", uni: "perfil", c: 0.52 },
                { id: "travesano060", desc: "Travesaños de 0,60 mts", uni: "perfil", c: 2.7 },
                { id: "anguloAjuste", desc: "Ángulo de ajuste", uni: "perfil", c: 0.48 },
                { id: "placaNebula60", desc: "Placa Nebula 60x1,20", uni: "placa", c: 1.46 },
                { id: "tarugo8", desc: "Tarugos nº 8", uni: "unidad", c: 5.0 },
                { id: "tornillo8", desc: "Tornillos nº 8", uni: "unidad", c: 5.0 },
                { id: "tornilloT1M", desc: "Tornillos T1 punta mecha", uni: "unidad", c: 2.0 },
                { id: "tornilloT1A", desc: "Tornillos T1 punta aguja", uni: "unidad", c: 2.0 }
            ]
        },
        cielorrasoDesmontable120: {
            nombre: "Cielorraso Desmontable 120x60",
            desperdicio: 1.05,
            items: [
                { id: "perimetral3", desc: "Perimetrales de 3 mts", uni: "perfil", c: 0.48 },
                { id: "larguero366", desc: "Largueros de 3,66 mts", uni: "perfil", c: 0.52 },
                { id: "travesano060", desc: "Travesaños de 0,60 mts", uni: "perfil", c: 1.4 },
                { id: "anguloAjuste", desc: "Ángulo de ajuste", uni: "perfil", c: 0.48 },
                { id: "placaNebula60", desc: "Placa Nebula 60x1,20", uni: "placa", c: 1.46 },
                { id: "tarugo8", desc: "Tarugos nº 8", uni: "unidad", c: 5.0 },
                { id: "tornillo8", desc: "Tornillos nº 8", uni: "unidad", c: 5.0 },
                { id: "tornilloT1M", desc: "Tornillos T1 punta mecha", uni: "unidad", c: 2.0 },
                { id: "tornilloT1A", desc: "Tornillos T1 punta aguja", uni: "unidad", c: 2.0 }
            ]
        },
        revestimientoOmega: {
            nombre: "Revestimiento Perfil Omega",
            desperdicio: 1.05,
            items: [
                { id: "perfilOmega", desc: "Perfil Omega", uni: "perfil", c: 0.88 },
                { id: "placa125", desc: "Placa de 12,5 mm", uni: "placa", c: 0.39 },
                { id: "masillaPasta", desc: "Masilla en Pasta", uni: "Comercial", c: 0.5, tipoEspecial: "masillaPasta" },
                { id: "masillaPolvo", desc: "Masilla en Polvo", uni: "Comercial", c: 0.6, tipoEspecial: "masillaPolvo" },
                { id: "cintaPapel", desc: "Cinta de Papel", uni: "Comercial", c: 2.01, tipoEspecial: "cinta" },
                { id: "tarugo8", desc: "Tarugos nº 8", uni: "unidad", c: 9.0 },
                { id: "tornillo8", desc: "Tornillos nº 8", uni: "unidad", c: 9.0 },
                { id: "tornilloT1A", desc: "Tornillos T1 punta aguja", uni: "unidad", c: 3.0 },
                { id: "tornilloT2A", desc: "Tornillos T2 punta aguja", uni: "unidad", c: 24.0 }
            ]
        },
        cielorrasoPVC: {
            nombre: "Cielorraso Tablillas PVC",
            desperdicio: 1.02,
            items: [
                { id: "solera35", desc: "Solera de 35 mm", uni: "perfil", c: 0.715 },
                { id: "montante34", desc: "Montante de 34 mm", uni: "perfil", c: 0.89 },
                { id: "machPVC", desc: "Mach PVC 14mm 20*200*3.00 Mts", uni: "placa", c: 1.78 },
                { id: "bordeJ", desc: "Borde 'J'", uni: "ml", c: 0.22 },
                { id: "tarugo8", desc: "Tarugos nº 8", uni: "unidad", c: 2.97 },
                { id: "tornillo8", desc: "Tornillos nº 8", uni: "unidad", c: 2.97 },
                { id: "tornilloT1M", desc: "Tornillos T1 punta mecha", uni: "unidad", c: 2.97 },
                { id: "tornilloT1A", desc: "Tornillos T1 punta aguja", uni: "unidad", c: 20.05 },
                { id: "tornilloT2A", desc: "Tornillos T2 punta aguja", uni: "unidad", c: 3.71 }
            ]
        }
    },

    /* Redondeos comerciales */
    calcularCinta(m) {
        if (m <= 75) return { cant: 1, texto: "1 rollo x 75m" };
        if (m <= 150) return { cant: 1, texto: "1 rollo x 150m" };
        let b150 = Math.floor(m / 150); let r = m % 150;
        if (r === 0) return { cant: b150, texto: `${b150} rollo(s) x 150m` };
        if (r <= 75) return { cant: b150 + 1, texto: `${b150} rollo(s) x 150m + 1 x 75m` };
        return { cant: b150 + 1, texto: `${b150 + 1} rollo(s) x 150m` };
    },

    calcularMasillaPasta(k) {
        if (k <= 7) return { cant: 1, texto: "1 balde x 7kg" };
        if (k <= 15) return { cant: 1, texto: "1 balde x 15kg" };
        if (k <= 32) return { cant: 1, texto: "1 balde x 32kg" };
        let b32 = Math.floor(k / 32); let r = k % 32;
        if (r === 0) return { cant: b32, texto: `${b32} balde(s) x 32kg` };
        if (r <= 7) return { cant: b32 + 1, texto: `${b32} balde(s) x 32kg + 1 x 7kg` };
        if (r <= 15) return { cant: b32 + 1, texto: `${b32} balde(s) x 32kg + 1 x 15kg` };
        return { cant: b32 + 1, texto: `${b32 + 1} balde(s) x 32kg` };
    },

    calcularMasillaPolvo(k) {
        let b = Math.ceil(k / 10);
        return { cant: b, texto: `${b} bolsa(s) x 10kg` };
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
                <div class="welcome-card" style="border-left: 5px solid #16a34a;">
                    <h2>📐 Cómputo Métrico de Construcción en Seco</h2>
                    <p>Calculá los materiales necesarios y exportalos directamente a tus presupuestos activos.</p>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 20px; margin-top: 20px;">
                    <div class="dashboard-card" style="height: fit-content;">
                        <h3 style="margin-bottom: 15px; color: #16a34a;">🛠️ Nueva Estimación</h3>
                        <div style="display: flex; flex-direction: column; gap: 15px;">
                            <div>
                                <label style="display:block; margin-bottom:5px; font-weight:bold;">Tipo de Estructura:</label>
                                <select id="seco-tipo" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:4px;">
                                    <option value="cielorrasoJuntaTomada">Cielorraso Junta Tomada (35mm)</option>
                                    <option value="tabiqueJuntaTomada">Tabique Junta Tomada (70mm)</option>
                                    <option value="cielorrasoDesmontable60">Cielorraso Desmontable 60x60</option>
                                    <option value="cielorrasoDesmontable120">Cielorraso Desmontable 120x60</option>
                                    <option value="revestimientoOmega">Revestimiento Perfil Omega</option>
                                    <option value="cielorrasoPVC">Cielorraso Tablillas PVC</option>
                                </select>
                            </div>

                            <div>
                                <label style="display:block; margin-bottom:5px; font-weight:bold;">Superficie a cubrir (M²):</label>
                                <input type="number" id="seco-m2" min="1" step="0.1" value="10" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:4px;">
                            </div>

                            <button id="btn-calcular-seco" style="background:#16a34a; color:white; border:none; padding:12px; border-radius:4px; cursor:pointer; font-weight:bold; font-size:14px;">🧮 Calcular Materiales</button>
                        </div>
                    </div>

                    <div class="dashboard-card">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 15px;">
                            <h3 id="resultado-titulo" style="margin:0;">📋 Desglose de Insumos</h3>
                            <button id="btn-exportar-presupuesto" style="background:#0284c7; color:white; border:none; padding:8px 15px; border-radius:4px; cursor:pointer; font-weight:bold; display:none;">💼 Exportar a Presupuesto</button>
                        </div>
                        <div style="overflow-x: auto;">
                            <table style="width:100%; border-collapse: collapse; text-align: left;">
                                <thead>
                                    <tr style="border-bottom: 2px solid #e5e7eb; background:#f9fafb;">
                                        <th style="padding:12px;">Material</th>
                                        <th style="padding:12px;">Unidad</th>
                                        <th style="padding:12px; text-align:right; color:#16a34a;">Pedido Comercial Sugerido</th>
                                    </tr>
                                </thead>
                                <tbody id="tabla-materiales-seco">
                                    <tr>
                                        <td colspan="3" style="padding:20px; text-align:center; color:#6b7280;">Ingresá los metros cuadrados y hacé clic en Calcular.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
        this.ejecutarCalculo();
    },

    vincularEventos() {
        document.getElementById("btn-calcular-seco")?.addEventListener("click", () => this.ejecutarCalculo());
        document.getElementById("btn-exportar-presupuesto")?.addEventListener("click", () => this.exportarAPresupuesto());
    },

    ejecutarCalculo() {
        const tipoKey = document.getElementById("seco-tipo").value;
        const m2 = parseFloat(document.getElementById("seco-m2").value) || 0;
        const tabla = document.getElementById("tabla-materiales-seco");
        const titulo = document.getElementById("resultado-titulo");
        const btnExportar = document.getElementById("btn-exportar-presupuesto");

        if (m2 <= 0) {
            tabla.innerHTML = `<tr><td colspan="3" style="padding:20px; text-align:center; color:red;">Ingresá una superficie válida.</td></tr>`;
            btnExportar.style.display = "none";
            return;
        }

        const config = this.coeficientes[tipoKey];
        titulo.innerHTML = `📋 Desglose para ${config.nombre} (${m2} M²)`;
        
        this.ultimoCalculo = []; // Reseteamos lista
        let html = "";

        config.items.forEach(item => {
            const neto = item.c * m2;
            const totalConDesperdicio = neto * config.desperdicio;
            
            let celdaTexto = "";
            let cantidadFinal = 0;

            if (item.tipoEspecial === "cinta") {
                let res = this.calcularCinta(totalConDesperdicio);
                celdaTexto = res.texto; 
                cantidadFinal = res.cant;
            } else if (item.tipoEspecial === "masillaPasta") {
                let res = this.calcularMasillaPasta(totalConDesperdicio);
                celdaTexto = res.texto; 
                cantidadFinal = res.cant;
            } else if (item.tipoEspecial === "masillaPolvo") {
                let res = this.calcularMasillaPolvo(totalConDesperdicio);
                celdaTexto = res.texto; 
                cantidadFinal = res.cant;
            } else {
                cantidadFinal = Math.ceil(totalConDesperdicio);
                celdaTexto = `${cantidadFinal} ${item.uni}(s)`;
            }

            // Guardamos la estructura limpia para enviar a Presupuestos
            this.ultimoCalculo.push({
                id: item.id,
                concepto: item.desc,
                cantidad: cantidadFinal,
                detalleComercial: celdaTexto
            });

            html += `
                <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding:12px;"><b>${item.desc}</b></td>
                    <td style="padding:12px;"><span style="background:#e0f2fe; color:#0369a1; padding:2px 6px; border-radius:4px; font-size:12px;">${item.uni}</span></td>
                    <td style="padding:12px; text-align:right; font-weight:bold; color:#16a34a; font-size:15px;">${celdaTexto}</td>
                </tr>
            `;
        });

        tabla.innerHTML = html;
        btnExportar.style.display = "block"; // Activamos botón exportar
    },

    async exportarAPresupuesto() {
        if (this.ultimoCalculo.length === 0) return;

        // Guardamos en localStorage especificando que el origen es 'construccion_seco'
        localStorage.setItem("materiales_computados", JSON.stringify(this.ultimoCalculo));
        localStorage.setItem("origen_computo", "construccion_seco");

        alert("¡Materiales exportados! Te estamos redirigiendo al módulo de presupuestos para que agregues el cliente y la mano de obra.");

        // Redireccionamos a presupuestos
        const btnPresupuestos = document.querySelector('[data-view="presupuestos"]');
        if (btnPresupuestos) {
            btnPresupuestos.click();
        }
    }
};

export default construccionSeco;
