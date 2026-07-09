/* ==========================================================
   ABSALON PRO - modules/fotos.js (Filtro por Cliente y Prefijos B, E, T)
========================================================== */
import { getAll } from "./storage.js";

class ModuloFotos {
    constructor() {
        this.workspace = null;
        this.clientes = [];
        this.presupuestos = [];
        
        // Estado de la selección actual
        this.clienteSeleccionado = null;
        this.presupuestoSeleccionado = null;
        this.categoriaSeleccionada = null; // 'comprobante' o 'obra'
        
        // Base de datos local para archivos de fotos y PDFs
        this.fotosDB = JSON.parse(localStorage.getItem("absalon_fotos_db")) || [];
    }

    async iniciar() {
        this.workspace = document.getElementById("workspace");
        if (!this.workspace) return;

        // Cargar datos actuales de la app
        this.clientes = await getAll("clientes") || [];
        this.presupuestos = await getAll("presupuestos") || [];

        this.render();
    }

    render() {
        this.workspace.innerHTML = `
            <div style="padding: 20px; font-family: sans-serif; background: #f8fafc; min-height: 100vh;">
                <h2 style="color: #104E2E; margin: 0 0 20px 0; font-size: 22px; font-weight: bold;">📸 Galería de Obras y Comprobantes</h2>
                
                <div style="display: flex; flex-wrap: wrap; gap: 20px;">
                    <!-- COLUMNA IZQUIERDA: SELECCIÓN Y BÚSQUEDA RÁPIDA -->
                    <div style="flex: 1; min-width: 320px; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); max-height: 85vh; overflow-y: auto;">
                        
                        <h3 style="color: #104E2E; margin-top: 0; font-size: 16px; font-weight: bold; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">🔍 Buscador Integrado</h3>
                        <p style="font-size: 12px; color: #64748b; margin-top: -5px; margin-bottom: 10px;">Buscá por <strong>Nombre de Cliente</strong> o por N° de Presupuesto con prefijos (<strong>B-</strong>, <strong>E-</strong>, <strong>T-</strong>).</p>
                        <input type="text" id="buscarPresupuestoRapido" placeholder="Ej: Juan, B-10, E-123, T-15..." style="width: 100%; padding: 10px 12px; border: 2px solid #104E2E; border-radius: 6px; margin-bottom: 15px; box-sizing: border-box; font-weight: bold; font-size: 15px;">
                        
                        <div id="listaPresupuestosFiltrados" style="display: flex; flex-direction: column; gap: 8px; max-height: 250px; overflow-y: auto; margin-bottom: 20px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 15px;">
                            <p style="color: #94a3b8; font-size: 13px; text-align: center; margin: 10px 0;">Ingresá un cliente o código numérico para desplegar resultados.</p>
                        </div>

                        <!-- Info del Cliente Vinculado -->
                        <div id="infoClienteVinculado" style="display: none; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px; border-radius: 6px; margin-bottom: 20px;">
                            <span style="font-size: 11px; color: #16a34a; font-weight: bold; display: block; text-transform: uppercase;">Cliente Vinculado</span>
                            <strong id="txtNombreClienteVinculado" style="color: #104E2E; font-size: 15px;">-</strong>
                        </div>

                        <!-- Selector de Categorías -->
                        <div id="seccionCategorias" style="display: none;">
                            <h3 style="color: #104E2E; font-size: 16px; font-weight: bold; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">📍 Tipo de Registro</h3>
                            <div style="display: flex; flex-direction: column; gap: 10px;">
                                <button id="btnCatComprobante" style="width: 100%; padding: 12px; border: 2px solid #cbd5e1; border-radius: 6px; background: white; cursor: pointer; font-weight: bold; color: #475569; text-align: left; display: flex; justify-content: space-between;">
                                    <span>💵 Comprobante de Pago</span> ➔
                                </button>
                                <button id="btnCatObra" style="width: 100%; padding: 12px; border: 2px solid #cbd5e1; border-radius: 6px; background: white; cursor: pointer; font-weight: bold; color: #475569; text-align: left; display: flex; justify-content: space-between;">
                                    <span>📐 Obras y Proyectos</span> ➔
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- COLUMNA DERECHA: VISUALIZADOR Y SUBIDA -->
                    <div style="flex: 2; min-width: 350px; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                        <div id="vistaVaciaFotos" style="text-align: center; padding: 60px 20px; color: #64748b;">
                            <span style="font-size: 50px;">🖼️</span>
                            <p style="margin-top: 15px; font-weight: bold;">Buscá y seleccioná un presupuesto de la lista para gestionar sus archivos.</p>
                        </div>

                        <div id="panelContenidoFotos" style="display: none;">
                            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #104E2E; padding-bottom: 10px; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
                                <h3 id="tituloPanelFotos" style="margin: 0; color: #104E2E; font-size: 18px; font-weight: bold;">-</h3>
                                
                                <label style="background: #104E2E; color: white; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 14px;">
                                    ➕ Adjuntar Foto / PDF
                                    <input type="file" id="inputSubirFoto" accept="image/*,application/pdf" style="display: none;">
                                </label>
                            </div>

                            <div id="grillaFotos" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 15px; margin-bottom: 25px;"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.initEventos();
    }

    initEventos() {
        const buscadorP = document.getElementById("buscarPresupuestoRapido");
        if (buscadorP) {
            buscadorP.oninput = () => this.filtrarPresupuestosPorNumero();
        }

        const btnComp = document.getElementById("btnCatComprobante");
        const btnObra = document.getElementById("btnCatObra");

        if (btnComp && btnObra) {
            btnComp.onclick = () => this.seleccionarCategoria("comprobante", btnComp, btnObra);
            btnObra.onclick = () => this.seleccionarCategoria("obra", btnObra, btnComp);
        }

        const inputFoto = document.getElementById("inputSubirFoto");
        if (inputFoto) {
            inputFoto.onchange = (e) => this.procesarNuevoArchivo(e);
        }
    }

    filtrarPresupuestosPorNumero() {
        const contenedor = document.getElementById("listaPresupuestosFiltrados");
        const buscador = document.getElementById("buscarPresupuestoRapido");
        if (!contenedor) return;

        let filtro = buscador ? buscador.value.toLowerCase().trim() : "";
        contenedor.innerHTML = "";

        if (filtro === "") {
            contenedor.innerHTML = `<p style="color: #94a3b8; font-size: 13px; text-align: center; margin: 10px 0;">Ingresá un cliente o código numérico para desplegar resultados.</p>`;
            return;
        }

        // 🚀 DETECCIÓN INTELIGENTE DE PREFIJOS (Admite B-, E-, T-)
        let prefijoDetectado = null;
        let busquedaLimpia = filtro;

        if (filtro.startsWith("b-")) {
            busquedaLimpia = filtro.replace("b-", "");
            prefijoDetectado = "Borrador";
        } else if (filtro.startsWith("e-")) {
            busquedaLimpia = filtro.replace("e-", "");
            prefijoDetectado = "Enviado";
        } else if (filtro.startsWith("t-")) {
            busquedaLimpia = filtro.replace("t-", "");
            prefijoDetectado = "Finalizado";
        }

        // 🔍 FILTRADO MULTI-VARIABLE (Número o Nombre del Cliente)
        const filtrados = this.presupuestos.filter(p => {
            const clienteDueno = this.clientes.find(c => c.id === p.clienteId || c.id === p.cliente);
            const nombreCliente = clienteDueno ? clienteDueno.nombre.toLowerCase() : "";
            
            // Verifica si coincide el número o el nombre del cliente
            const coincideNumero = p.numero && String(p.numero).toLowerCase().includes(busquedaLimpia);
            const coincideCliente = nombreCliente.includes(filtro); // El filtro completo si busca por texto puro

            // Si el usuario usó un prefijo explícito (Ej: B-), filtramos estrictamente por estado y número
            if (prefijoDetectado) {
                const estadoLower = p.estado ? p.estado.toLowerCase() : "";
                if (prefijoDetectado === "Borrador" && !estadoLower.includes("borrador")) return false;
                if (prefijoDetectado === "Enviado" && !estadoLower.includes("enviado")) return false;
                if (prefijoDetectado === "Finalizado" && (!estadoLower.includes("finalizado") && !estadoLower.includes("terminado"))) return false;
                return coincideNumero;
            }

            // Si es texto libre, puede coincidir el número puro o el nombre del cliente
            return coincideNumero || coincideCliente;
        });

        if (filtrados.length === 0) {
            contenedor.innerHTML = `<p style="padding: 10px; color: #ef4444; margin: 0; font-size: 13px; font-weight: bold; text-align: center;">⚠️ No se encontraron coincidencias.</p>`;
            return;
        }

        filtrados.forEach(p => {
            const clienteDueno = this.clientes.find(c => c.id === p.clienteId || c.id === p.cliente);
            const nombreCliente = clienteDueno ? clienteDueno.nombre : "Cliente Desconocido";

            // Definir qué prefijo mostrar visualmente según el estado real del registro
            let prefijoVisual = "B-"; 
            if (p.estado && p.estado.toLowerCase().includes("enviado")) prefijoVisual = "E-";
            if (p.estado && (p.estado.toLowerCase().includes("finalizado") || p.estado.toLowerCase().includes("terminado"))) prefijoVisual = "T-";

            const btnP = document.createElement("button");
            btnP.style = `width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 6px; background: white; text-align: left; cursor: pointer; font-size: 13px; color: #334155; transition: all 0.15s; display: flex; flex-direction: column; gap: 2px;`;
            
            if (this.presupuestoSeleccionado && this.presupuestoSeleccionado.id === p.id) {
                btnP.style.background = "#eff6ff";
                btnP.style.borderColor = "#3b82f6";
            }

            btnP.innerHTML = `
                <span style="font-size: 14px; color: #104E2E;"><strong>N° ${prefijoVisual}${p.numero || 'S/N'}</strong></span>
                <span style="font-size: 12px; color: #475569;">👤 ${nombreCliente}</span>
                <span style="font-size: 11px; color: #94a3b8;">Estado actual: <strong>${p.estado || 'Borrador'}</strong></span>
            `;
            
            btnP.onclick = () => {
                this.presupuestoSeleccionado = p;
                this.clienteSeleccionado = clienteDueno || { id: p.clienteId || p.cliente, nombre: nombreCliente };
                
                this.filtrarPresupuestosPorNumero();
                
                document.getElementById("infoClienteVinculado").style.display = "block";
                document.getElementById("txtNombreClienteVinculado").innerText = nombreCliente;
                
                document.getElementById("seccionCategorias").style.display = "block";
                document.getElementById("panelContenidoFotos").style.display = "none";
                document.getElementById("vistaVaciaFotos").style.display = "block";
            };
            contenedor.appendChild(btnP);
        });
    }

    seleccionarCategoria(categoria, btnActivo, btnInactivo) {
        this.categoriaSeleccionada = categoria;
        
        btnActivo.style.background = "#104E2E";
        btnActivo.style.color = "white";
        btnActivo.style.borderColor = "#104E2E";

        btnInactivo.style.background = "white";
        btnInactivo.style.color = "#475569";
        btnInactivo.style.borderColor = "#cbd5e1";

        document.getElementById("vistaVaciaFotos").style.display = "none";
        document.getElementById("panelContenidoFotos").style.display = "block";
        
        let prefijoVisual = "B-";
        if (this.presupuestoSeleccionado.estado && this.presupuestoSeleccionado.estado.toLowerCase().includes("enviado")) prefijoVisual = "E-";
        if (this.presupuestoSeleccionado.estado && (this.presupuestoSeleccionado.estado.toLowerCase().includes("finalizado") || this.presupuestoSeleccionado.estado.toLowerCase().includes("terminado"))) prefijoVisual = "T-";

        const tipoTexto = categoria === 'comprobante' ? '💵 Comprobantes de Pago' : '📐 Obras y Proyectos';
        document.getElementById("tituloPanelFotos").innerText = `${tipoTexto} - Presupuesto N° ${prefijoVisual}${this.presupuestoSeleccionado.numero || 'S/N'}`;

        this.cargarGrillaFotos();
    }

    cargarGrillaFotos() {
        const grilla = document.getElementById("grillaFotos");
        if (!grilla) return;
        grilla.innerHTML = "";

        const filtradas = this.fotosDB.filter(f => 
            f.presupuestoId === this.presupuestoSeleccionado.id &&
            f.categoria === this.categoriaSeleccionada
        );

        if (filtradas.length === 0) {
            grilla.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #94a3b8; font-size: 14px;">
                    No hay ningún archivo o comprobante cargado para este presupuesto.
                </div>`;
            return;
        }

        filtradas.forEach(f => {
            const card = document.createElement("div");
            card.style = `background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; display: flex; flex-direction: column; position: relative; box-shadow: 0 1px 2px rgba(0,0,0,0.05);`;
            
            let previewHTML = f.tipo === "application/pdf" ? `
                <div style="width: 100%; height: 130px; background: #fef2f2; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer;" onclick="window.open('${f.src}', '_blank')">
                    <span style="font-size: 40px;">📄</span>
                    <span style="font-size: 11px; color: #dc2626; font-weight: bold; margin-top: 5px;">VER COMPROBANTE PDF</span>
                </div>` : `
                <div style="width: 100%; height: 130px; background: #e2e8f0; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                    <img src="${f.src}" style="width: 100%; height: 100%; object-fit: cover; cursor: pointer;" onclick="window.open('${f.src}', '_blank')">
                </div>`;

            let inputsCuerpoHTML = this.categoriaSeleccionada === "comprobante" ? `
                <div style="display: flex; flex-direction: column; gap: 4px; background: #fff; padding: 6px; border-radius: 4px;">
                    <label style="font-size: 12px; display: flex; align-items: center; gap: 4px; color: #334155; cursor:pointer;">
                        <input type="checkbox" id="chkEfe_${f.id}" ${f.pagoMetodo?.efectivo ? 'checked' : ''}> Efectivo
                    </label>
                    <label style="font-size: 12px; display: flex; align-items: center; gap: 4px; color: #334155; cursor:pointer;">
                        <input type="checkbox" id="chkTaj_${f.id}" ${f.pagoMetodo?.tarjeta ? 'checked' : ''}> Tarjeta
                    </label>
                    <label style="font-size: 12px; display: flex; align-items: center; gap: 4px; color: #334155; cursor:pointer;">
                        <input type="checkbox" id="chkQr_${f.id}" ${f.pagoMetodo?.qr ? 'checked' : ''}> Transferencia o QR
                    </label>
                    <button onclick="window.moduloFotos.guardarMetodoPago('${f.id}')" 
                        style="width: 100%; background: #104E2E; color: white; border: none; padding: 5px; border-radius: 4px; font-size: 11px; cursor: pointer; font-weight: bold; margin-top: 5px; text-align: center;">💾 Confirmar Pago</button>
                </div>` : `
                <input type="text" value="${f.nota || ''}" placeholder="Detalle técnico de obra..." 
                    style="width: 100%; border: none; background: #fff; font-size: 12px; color: #334155; padding: 5px; border: 1px solid #e2e8f0; border-radius: 4px; box-sizing: border-box;"
                    onchange="window.moduloFotos.actualizarNotaObra('${f.id}', this.value)">`;

            card.innerHTML = `
                ${previewHTML}
                <div style="padding: 10px; display: flex; flex-direction: column; gap: 6px; background: white; flex: 1;">
                    <span style="font-size: 10px; color: #94a3b8; font-weight: bold;">📅 Subido: ${f.fecha}</span>
                    ${inputsCuerpoHTML}
                </div>
                <button onclick="window.moduloFotos.eliminarArchivo('${f.id}')" 
                    style="position: absolute; top: 5px; right: 5px; background: rgba(239, 68, 68, 0.9); color: white; border: none; border-radius: 4px; padding: 2px 6px; font-size: 11px; cursor: pointer; font-weight: bold; z-index: 10;">✕</button>
            `;
            grilla.appendChild(card);
        });
    }

    procesarNuevoArchivo(evento) {
        const file = evento.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const nuevoItem = {
                id: 'file_' + Date.now(),
                clienteId: this.clienteSeleccionado.id,
                presupuestoId: this.presupuestoSeleccionado.id,
                categoria: this.categoriaSeleccionada,
                tipo: file.type,
                src: e.target.result,
                fecha: new Date().toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" }),
                nota: "",
                pagoMetodo: { efectivo: false, tarjeta: false, qr: false }
            };

            this.fotosDB.push(nuevoItem);
            localStorage.setItem("absalon_fotos_db", JSON.stringify(this.fotosDB));
            this.cargarGrillaFotos();
            evento.target.value = ""; 
        };
        reader.readAsDataURL(file);
    }

    guardarMetodoPago(idArchivo) {
        const item = this.fotosDB.find(f => f.id === idArchivo);
        if (item) {
            const efe = document.getElementById(`chkEfe_${idArchivo}`).checked;
            const taj = document.getElementById(`chkTaj_${idArchivo}`).checked;
            const qr = document.getElementById(`chkQr_${idArchivo}`).checked;

            item.pagoMetodo = { efectivo: efe, tarjeta: taj, qr: qr };
            localStorage.setItem("absalon_fotos_db", JSON.stringify(this.fotosDB));
            alert("✅ ¡Método de pago confirmado y guardado!");
            this.cargarGrillaFotos();
        }
    }

    actualizarNotaObra(idArchivo, texto) {
        const item = this.fotosDB.find(f => f.id === idArchivo);
        if (item) {
            item.nota = texto;
            localStorage.setItem("absalon_fotos_db", JSON.stringify(this.fotosDB));
        }
    }

    eliminarArchivo(idArchivo) {
        if (confirm("¿Estás seguro de eliminar este registro?")) {
            this.fotosDB = this.fotosDB.filter(f => f.id !== idArchivo);
            localStorage.setItem("absalon_fotos_db", JSON.stringify(this.fotosDB));
            this.cargarGrillaFotos();
        }
    }
}

const instancia = new ModuloFotos();
window.moduloFotos = instancia;
export default instancia;
