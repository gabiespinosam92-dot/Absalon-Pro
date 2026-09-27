/* ==========================================================
   ABSALON PRO - CATÁLOGO GENERAL DE MATERIALES Y MANO DE OBRA
   modules/catalogo.js
========================================================== */

const catalogo = {
    // Lista completa de insumos, materiales y servicios precargados
    items: [
        // ==========================================================
        // 1. REFRIGERACIÓN (AGREGADO NUEVO)
        // ==========================================================
        { id: "ref-nitro", concepto: "Insumo Nitrógeno Seco (Presurización / Estanqueidad)", rubro: "Refrigeración", unidad: "Unidad", precio: 15000 },
        { id: "ref-mo-vacio", concepto: "Mano de Obra Detección de Fuga y Vacío de Sistema", rubro: "Refrigeración", unidad: "Servicio", precio: 150000 },
        { id: "ref-gas-r410a", concepto: "Refrigerante R410a", rubro: "Refrigeración", unidad: "Kg", precio: 18000 },
        { id: "ref-gas-r22", concepto: "Refrigerante R22", rubro: "Refrigeración", unidad: "Kg", precio: 22000 },
        { id: "ref-gas-r32", concepto: "Refrigerante R32", rubro: "Refrigeración", unidad: "Kg", precio: 25000 },
        { id: "ref-ovulo", concepto: "Reemplazo de Óvulo / Núcleo de Válvula", rubro: "Refrigeración", unidad: "Unidad", precio: 3500 },
        { id: "ref-mo-instalacion", concepto: "Mano de Obra Instalación Básica Split", rubro: "Refrigeración", unidad: "Servicio", precio: 120000 },
        { id: "ref-mo-electrica", concepto: "Adicional Alimentación y Conexión Eléctrica", rubro: "Refrigeración", unidad: "Servicio", precio: 45000 },

        // ==========================================================
        // 2. CONSTRUCCIÓN EN SECO
        // ==========================================================
        { id: "solera35", concepto: "Solera de 35 mm", rubro: "Construcción en Seco", unidad: "Perfil", precio: 4800 },
        { id: "montante35", concepto: "Montante de 35 mm", rubro: "Construcción en Seco", unidad: "Perfil", precio: 5200 },
        { id: "solera70", concepto: "Solera de 70 mm", rubro: "Construcción en Seco", unidad: "Perfil", precio: 6100 },
        { id: "montante70", concepto: "Montante de 70 mm", rubro: "Construcción en Seco", unidad: "Perfil", precio: 6800 },
        { id: "perimetral3", concepto: "Perimetral de 3 mts (Desmontable)", rubro: "Construcción en Seco", unidad: "Perfil", precio: 4200 },
        { id: "larguero366", concepto: "Larguero de 3,66 mts (Desmontable)", rubro: "Construcción en Seco", unidad: "Perfil", precio: 7500 },
        { id: "travesano060", concepto: "Travesaño de 0,60 mts (Desmontable)", rubro: "Construcción en Seco", unidad: "Perfil", precio: 2100 },
        { id: "anguloAjuste", concepto: "Ángulo de ajuste", rubro: "Construcción en Seco", unidad: "Perfil", precio: 3100 },
        { id: "perfilOmega", concepto: "Perfil Omega", rubro: "Construcción en Seco", unidad: "Perfil", precio: 4500 },
        { id: "montante34", concepto: "Montante de 34 mm", rubro: "Construcción en Seco", unidad: "Perfil", precio: 5000 },

        { id: "placa95", concepto: "Placa de 9,5 mm", rubro: "Construcción en Seco", unidad: "Placa", precio: 12500 },
        { id: "placa125", concepto: "Placa de 12,5 mm", rubro: "Construcción en Seco", unidad: "Placa", precio: 14200 },
        { id: "placaNebula60", concepto: "Placa Nebula 60x1,20 (Desmontable)", rubro: "Construcción en Seco", unidad: "Placa", precio: 8900 },
        { id: "machPVC", concepto: "Mach PVC 14mm 20*200*3.00 Mts", rubro: "Construcción en Seco", unidad: "Placa", precio: 9800 },
        { id: "bordeJ", concepto: "Borde 'J' PVC", rubro: "Construcción en Seco", unidad: "ML", precio: 1800 },

        { id: "masillaPasta", concepto: "Masilla en Pasta", rubro: "Construcción en Seco", unidad: "Comercial", precio: 28000 },
        { id: "masillaPolvo", concepto: "Masilla en Polvo", rubro: "Construcción en Seco", unidad: "Comercial", precio: 11500 },
        { id: "cintaPapel", concepto: "Cinta de Papel", rubro: "Construcción en Seco", unidad: "Comercial", precio: 8500 },

        { id: "tarugo8", concepto: "Tarugos nº 8", rubro: "Construcción en Seco", unidad: "Unidad", precio: 80 },
        { id: "tornillo8", concepto: "Tornillos nº 8", rubro: "Construcción en Seco", unidad: "Unidad", precio: 90 },
        { id: "tornilloT1A", concepto: "Tornillos T1 punta aguja", rubro: "Construcción en Seco", unidad: "Unidad", precio: 45 },
        { id: "tornilloT2A", concepto: "Tornillos T2 punta aguja", rubro: "Construcción en Seco", unidad: "Unidad", precio: 50 },
        { id: "tornilloT1M", concepto: "Tornillos T1 punta mecha", rubro: "Construcción en Seco", unidad: "Unidad", precio: 55 },

        // ==========================================================
        // 3. ALBAÑILERÍA
        // ==========================================================
        { id: "alb-cemento", concepto: "Cemento Avellaneda / Loma Negra (50kg)", rubro: "Albañilería", unidad: "Bolsa", precio: 9500 },
        { id: "alb-cal", concepto: "Cal Hidratada (25kg)", rubro: "Albañilería", unidad: "Bolsa", precio: 4200 },
        { id: "alb-arena", concepto: "Arena Gruesa", rubro: "Albañilería", unidad: "M3", precio: 18000 },
        { id: "alb-piedra", concepto: "Piedra Partida", rubro: "Albañilería", unidad: "M3", precio: 26000 },
        { id: "alb-ladrillo-12", concepto: "Ladrillo Hueco 12x18x25", rubro: "Albañilería", unidad: "Unidad", precio: 680 },
        { id: "alb-ladrillo-18", concepto: "Ladrillo Hueco 18x18x25", rubro: "Albañilería", unidad: "Unidad", precio: 920 },
        { id: "alb-ladrillo-comun", concepto: "Ladrillo Común", rubro: "Albañilería", unidad: "Unidad", precio: 220 },
        { id: "alb-hierro-8", concepto: "Hierro Aletado del 8mm", rubro: "Albañilería", unidad: "Barra 12m", precio: 12800 },
        { id: "alb-hierro-10", concepto: "Hierro Aletado del 10mm", rubro: "Albañilería", unidad: "Barra 12m", precio: 19500 },

        // ==========================================================
        // 4. ELECTRICIDAD
        // ==========================================================
        { id: "elec-cable-15", concepto: "Cable Unipolar 1.5 mm²", rubro: "Electricidad", unidad: "Rollo 100m", precio: 32000 },
        { id: "elec-cable-25", concepto: "Cable Unipolar 2.5 mm²", rubro: "Electricidad", unidad: "Rollo 100m", precio: 48000 },
        { id: "elec-cable-40", concepto: "Cable Unipolar 4.0 mm²", rubro: "Electricidad", unidad: "Rollo 100m", precio: 75000 },
        { id: "elec-termica-20", concepto: "Llave Térmica Bipolar 20A", rubro: "Electricidad", unidad: "Unidad", precio: 14500 },
        { id: "elec-disyuntor", concepto: "Disyuntor Diferencial 40A 30mA", rubro: "Electricidad", unidad: "Unidad", precio: 38000 },
        { id: "elec-caja-octogonal", concepto: "Caja Octogonal Chapa", rubro: "Electricidad", unidad: "Unidad", precio: 1200 },
        { id: "elec-caño-corrugado", concepto: "Caño Corrugado Blanco 3/4\"", rubro: "Electricidad", unidad: "Rollo 25m", precio: 11200 }
    ],

    iniciar() {
        this.cargarDesdeStorage();
        this.render();
        this.vincularEventos();
    },

    cargarDesdeStorage() {
        const guardados = localStorage.getItem("absalon_catalogo");
        if (guardados) {
            try {
                this.items = JSON.parse(guardados);
            } catch (e) {
                console.error("Error al cargar el catálogo desde localStorage:", e);
            }
        } else {
            this.guardarEnStorage();
        }
    },

    guardarEnStorage() {
        localStorage.setItem("absalon_catalogo", JSON.stringify(this.items));
    },

    render() {
        const main = document.getElementById("workspace");
        if (!main) return;

        main.innerHTML = `
            <div class="workspace">
                <div class="welcome-card" style="border-left: 5px solid #0284c7;">
                    <h2>🏷️ Catálogo de Precios e Insumos</h2>
                    <p>Administrá los costos base de materiales y mano de obra para todos los módulos de cómputo.</p>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 20px; margin-top: 20px;">
                    
                    <!-- Formulario de Agregar / Editar Ítem -->
                    <div class="dashboard-card" style="height: fit-content;">
                        <h3 style="margin-bottom: 15px; color: #0284c7;">➕ Nuevo Insumo / Servicio</h3>
                        <form id="form-catalogo" style="display: flex; flex-direction: column; gap: 12px;">
                            <div>
                                <label style="display:block; font-size:12px; font-weight:bold; margin-bottom:4px;">Concepto / Descripción:</label>
                                <input type="text" id="cat-concepto" required style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;">
                            </div>

                            <div>
                                <label style="display:block; font-size:12px; font-weight:bold; margin-bottom:4px;">Rubro / Categoría:</label>
                                <select id="cat-rubro" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;">
                                    <option value="Construcción en Seco">Construcción en Seco</option>
                                    <option value="Refrigeración">Refrigeración</option>
                                    <option value="Albañilería">Albañilería</option>
                                    <option value="Electricidad">Electricidad</option>
                                    <option value="General">General</option>
                                </select>
                            </div>

                            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                                <div>
                                    <label style="display:block; font-size:12px; font-weight:bold; margin-bottom:4px;">Unidad:</label>
                                    <input type="text" id="cat-unidad" placeholder="Perfil, Bolsa, Kg, ML..." required style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;">
                                </div>
                                <div>
                                    <label style="display:block; font-size:12px; font-weight:bold; margin-bottom:4px;">Precio ($):</label>
                                    <input type="number" id="cat-precio" min="0" step="10" required style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;">
                                </div>
                            </div>

                            <button type="submit" style="background:#0284c7; color:white; border:none; padding:10px; border-radius:4px; cursor:pointer; font-weight:bold; margin-top:10px;">💾 Guardar en Catálogo</button>
                        </form>
                    </div>

                    <!-- Tabla de Lista de Precios -->
                    <div class="dashboard-card">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 15px;">
                            <h3 style="margin:0;">📋 Lista de Insumos Registrados</h3>
                            <input type="text" id="cat-buscar" placeholder="🔍 Buscar..." style="padding:6px 12px; border:1px solid #ccc; border-radius:4px; font-size:13px;">
                        </div>

                        <div style="overflow-x: auto;">
                            <table style="width:100%; border-collapse: collapse; text-align: left;">
                                <thead>
                                    <tr style="border-bottom: 2px solid #e5e7eb; background:#f9fafb;">
                                        <th style="padding:10px;">Rubro</th>
                                        <th style="padding:10px;">Concepto</th>
                                        <th style="padding:10px;">Unidad</th>
                                        <th style="padding:10px; text-align:right;">Precio ($)</th>
                                        <th style="padding:10px; text-align:center;">Acción</th>
                                    </tr>
                                </thead>
                                <tbody id="tabla-catalogo">
                                    <!-- Carga dinámica -->
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        `;

        this.renderTabla();
    },

    renderTabla(filtro = "") {
        const tbody = document.getElementById("tabla-catalogo");
        if (!tbody) return;

        const itemsFiltrados = this.items.filter(item => 
            item.concepto.toLowerCase().includes(filtro.toLowerCase()) ||
            item.rubro.toLowerCase().includes(filtro.toLowerCase())
        );

        if (itemsFiltrados.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="padding:20px; text-align:center; color:#6b7280;">No se encontraron elementos.</td></tr>`;
            return;
        }

        let html = "";
        itemsFiltrados.forEach(item => {
            html += `
                <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding:10px;"><span style="background:#f3f4f6; color:#374151; padding:2px 6px; border-radius:4px; font-size:11px; font-weight:bold;">${item.rubro}</span></td>
                    <td style="padding:10px;"><b>${item.concepto}</b></td>
                    <td style="padding:10px; color:#6b7280; font-size:13px;">${item.unidad}</td>
                    <td style="padding:10px; text-align:right; font-weight:bold; color:#15803d;">$ ${Number(item.precio).toLocaleString("es-AR")}</td>
                    <td style="padding:10px; text-align:center;">
                        <button onclick="catalogo.eliminarItem('${item.id}')" style="background:#ef4444; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:12px;">🗑️</button>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
    },

    vincularEventos() {
        document.getElementById("form-catalogo")?.addEventListener("submit", (e) => {
            e.preventDefault();
            this.agregarItem();
        });

        document.getElementById("cat-buscar")?.addEventListener("input", (e) => {
            this.renderTabla(e.target.value);
        });
    },

    agregarItem() {
        const concepto = document.getElementById("cat-concepto").value.trim();
        const rubro = document.getElementById("cat-rubro").value;
        const unidad = document.getElementById("cat-unidad").value.trim();
        const precio = parseFloat(document.getElementById("cat-precio").value) || 0;

        if (!concepto || !unidad) return;

        const nuevo = {
            id: `cat-${Date.now()}`,
            concepto,
            rubro,
            unidad,
            precio
        };

        this.items.push(nuevo);
        this.guardarEnStorage();
        this.renderTabla();

        document.getElementById("form-catalogo").reset();
    },

    eliminarItem(id) {
        if (!confirm("¿Seguro que querés eliminar este ítem del catálogo?")) return;
        this.items = this.items.filter(item => item.id !== id);
        this.guardarEnStorage();
        this.renderTabla();
    }
};

export default catalogo;
