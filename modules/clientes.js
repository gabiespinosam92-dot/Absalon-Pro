/* ==========================================================
   ABSALON PRO
   CLIENTES.JS - SPRINT 11.3 (DISEÑO UNIFICADO Y MODERNO)
========================================================== */

import { getAll, add } from "./storage.js";

const Clientes = {

    async load() {
        const workspace = document.getElementById("workspace");

        workspace.innerHTML = `
            <div class="card" style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #104E2E; margin-top:0; display:flex; align-items:center; gap:10px;">👤 Registrar Nuevo Cliente</h2>
                <p style="color: gray; font-size: 13px; margin-bottom:20px;">Completá los datos para agregarlo a la base de datos central.</p>
                
                <label style="font-weight:bold; font-size:14px;">Nombre y Apellido</label><br>
                <input id="cliNombre" type="text" style="width:100%; padding:8px; margin-top:4px; margin-bottom:15px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px;"><br>

                <div style="display:flex; gap:15px; margin-bottom:15px;">
                    <div style="flex:1;">
                        <label style="font-weight:bold; font-size:14px;">📍 Referencia (Zona/Localidad)</label><br>
                        <select id="cliReferencia" style="width:100%; padding:8px; margin-top:4px; border:1px solid #ccc; border-radius:4px; background: white;">
                            <option value="Resistencia">Resistencia</option>
                            <option value="Fontana">Fontana</option>
                            <option value="Barranqueras">Barranqueras</option>
                            <option value="Puerto Vilelas">Puerto Vilelas</option>
                            <option value="Particular">Particular (Sin Zona)</option>
                            <option value="Interior Chaco">Interior / Chaco</option>
                        </select>
                    </div>
                    <div style="flex:1;">
                        <label style="font-weight:bold; font-size:14px;">🏢 Tipo Documento</label><br>
                        <select id="cliTipo" style="width:100%; padding:8px; margin-top:4px; border:1px solid #ccc; border-radius:4px; background: white;">
                            <option value="X">🏠 Particular (Consumidor Final / X)</option>
                            <option value="CUIT">🏭 Comercio (CUIT)</option>
                            <option value="CUIL">💼 Profesional / Empleado (CUIL)</option>
                        </select>
                    </div>
                </div>

                <label style="font-weight:bold; font-size:14px;">Teléfono</label><br>
                <input id="cliTelefono" type="text" placeholder="Ej: 3624XXXXXX" style="width:100%; padding:8px; margin-top:4px; margin-bottom:15px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px;"><br>

                <label style="font-weight:bold; font-size:14px;">Dirección</label><br>
                <input id="cliDireccion" type="text" style="width:100%; padding:8px; margin-top:4px; margin-bottom:15px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px;"><br>

                <label style="font-weight:bold; font-size:14px;">Número de Documento / CUIT</label><br>
                <input id="cliNumero" type="text" value="X" placeholder="Escribí el número o X si no tiene" style="width:100%; padding:8px; margin-top:4px; margin-bottom:15px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px;"><br>

                <label style="font-weight:bold; font-size:14px;">Observaciones</label><br>
                <textarea id="cliObs" rows="2" style="width:100%; padding:8px; margin-top:4px; margin-bottom:20px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px; resize:vertical;"></textarea><br>

                <div style="text-align: right;">
                    <button id="btnGuardarCliente" style="padding:12px 25px; background:#104E2E; color:white; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-size:15px;">💾 Guardar Cliente</button>
                </div>
            </div>

            <div class="card mt-3" style="max-width: 600px; margin: 20px auto 0 auto; font-family: sans-serif;">
                <h3 style="color: #333; margin-top: 0; margin-bottom: 15px;">📋 Listado de Clientes Registrados</h3>
                <div id="listaClientes" style="display: flex; flex-direction: column; gap: 10px;"></div>
            </div>
        `;

        // Enganchamos el evento automático del tipo de documento (X)
        document.getElementById("cliTipo").addEventListener("change", e => {
            const campoNum = document.getElementById("cliNumero");
            if (e.target.value === "X") {
                campoNum.value = "X";
            } else if (campoNum.value === "X") {
                campoNum.value = "";
            }
        });

        // Evento del botón guardar
        document.getElementById("btnGuardarCliente").onclick = () => this.guardar();

        // Listamos los clientes abajo
        await this.listar();
    },

    async guardar() {
        const nombre = document.getElementById("cliNombre").value.trim();
        const referencia = document.getElementById("cliReferencia").value;
        const telefono = document.getElementById("cliTelefono").value.trim();
        const direccion = document.getElementById("cliDireccion").value.trim();
        const tipoDocumento = document.getElementById("cliTipo").value;
        const numeroDocumento = document.getElementById("cliNumero").value.trim();
        const observaciones = document.getElementById("cliObs").value.trim();

        if (nombre === "") {
            alert("Ingrese el nombre del cliente.");
            return;
        }

        try {
            const clientesActuales = await getAll("clientes");
            let proximoId = 1;
            if (clientesActuales.length > 0) {
                const ids = clientesActuales.map(c => Number(c.id || 0));
                proximoId = Math.max(...ids) + 1;
            }

            const cliente = {
                id: proximoId,
                nombre: nombre,
                referencia: referencia,
                telefono: telefono,
                direccion: direccion,
                tipoDocumento: tipoDocumento,
                numeroDocumento: numeroDocumento,
                observaciones: observaciones
            };

            await add("clientes", cliente);
            alert(`🎉 Cliente "${nombre}" registrado con éxito.`);
            await this.load(); // Recarga la vista completa de la sección
        } catch(err) {
            console.error(err);
            alert("No se pudo guardar el cliente.");
        }
    },

    async listar() {
        const clientes = await getAll("clientes");
        const lista = document.getElementById("listaClientes");

        if (clientes.length === 0) {
            lista.innerHTML = "<p style='color:gray; font-style:italic;'>No hay clientes registrados aún.</p>";
            return;
        }

        // Ordenamos alfabéticamente para mayor comodidad
        clientes.sort((a, b) => a.nombre.localeCompare(b.nombre));

        lista.innerHTML = clientes.map(cliente => `
            <div style="background: #f9f9f9; padding: 12px; border-left: 4px solid #104E2E; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <strong style="color: #104E2E; font-size: 16px;">${cliente.nombre}</strong>
                    <span style="font-size: 12px; background: #e8f5e9; color: #104E2E; padding: 2px 8px; border-radius: 10px; font-weight: bold;">
                        ${cliente.referencia || "Particular"}
                    </span>
                </div>
                <div style="font-size: 13px; color: #555; margin-top: 5px;">
                    ${cliente.telefono ? `📞 <strong>Tel:</strong> ${cliente.telefono}` : ''} 
                    ${cliente.direccion ? ` | 📍 <strong>Dir:</strong> ${cliente.direccion}` : ''}
                </div>
                <div style="font-size: 12px; color: #777; margin-top: 2px;">
                    📄 <strong>${cliente.tipoDocumento || 'Doc'}:</strong> ${cliente.numeroDocumento || 'X'}
                    ${cliente.observaciones ? ` | 📝 <em>${cliente.observaciones}</em>` : ''}
                </div>
            </div>
        `).join("");
    }
};

export default Clientes;
