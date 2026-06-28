/* ==========================================================
   ABSALON PRO
   modules/clientes.js
   Sprint 7.1 - Integración con Ficha de Cliente Detalle
========================================================== */

import { getAll, add } from "./storage.js";

export default class Clientes {

    constructor(){
        this.workspace = document.getElementById("workspace");
    }

    /* ======================================================
       CARGAR MÓDULO
    ====================================================== */
    async load(){
        await this.render();
        this.bindEvents();
    }

    /* ======================================================
       INTERFAZ
    ====================================================== */
    async render(){
        const clientes = await getAll("clientes") || [];

        this.workspace.innerHTML = `
        <div class="card">
            <div class="toolbar">
                <div>
                    <h2>👥 Clientes</h2>
                    <p>Administración de clientes.</p>
                </div>
                <button id="btnNuevoCliente" class="primary">
                    + Nuevo Cliente
                </button>
            </div>
        </div>
        <div class="card mt-3">
            <input id="buscarCliente" class="input" placeholder="Buscar cliente...">
        </div>
        <div id=\"clientesListado\" class=\"mt-3\"></div>
        `;

        await this.renderListado(clientes);
    }

    async renderListado(clientes){
        const listado = document.getElementById("clientesListado");
        if(!listado) return;

        if(!clientes || clientes.length === 0){
            listado.innerHTML = `
            <div class="card">
                <h3>Todavía no hay clientes.</h3>
                <p class="mt-2">Presioná "Nuevo Cliente" para comenzar.</p>
            </div>
            `;
            return;
        }

        let html = "";
        clientes.forEach(cliente => {
            html += `
            <div class="card cliente-card" style="margin-top: 10px;">
                <div class="cliente-header" style="display: flex; justify-content: space-between; align-items: center;">
                    <h3>${cliente.nombre}</h3>
                    <div style="display: flex; gap: 8px;">
                        <button class="btn btnVerDetalle" data-id="${cliente.id}" style="padding: 5px 12px; font-size: 0.85rem; cursor: pointer;">
                            👁 Detalle
                        </button>
                        <button class="danger btnEliminarCliente" data-id="${cliente.id}" style="padding: 5px 12px; font-size: 0.85rem; cursor: pointer;">
                            Eliminar
                        </button>
                    </div>
                </div>
                <p class="mt-2">📞 ${cliente.telefono || "-"}</p>
                <p>📍 ${cliente.direccion || "-"}</p>
            </div>
            `;
        });

        listado.innerHTML = html;
        this.bindCardActions();
    }

    /* ======================================================
       ACCIONES Y CAPTURA DE FORMULARIO CON VALIDACIONES (PARTE 2)
    ====================================================== */
    bindEvents(){
        const btnNuevo = document.getElementById("btnNuevoCliente");
        const inputBuscar = document.getElementById("buscarCliente");

        if(btnNuevo){
            btnNuevo.onclick = () => this.showForm();
        }

        if(inputBuscar){
            inputBuscar.oninput = async () => {
                const query = inputBuscar.value.toLowerCase().trim();
                const todos = await getAll("clientes") || [];
                const filtrados = todos.filter(c => 
                    c.nombre.toLowerCase().includes(query) || 
                    (c.telefono && c.telefono.includes(query))
                );
                this.renderListado(filtrados);
            };
        }
    }

    showForm(){
        const nombre = prompt("Nombre del cliente:");
        if (nombre === null) return; // Canceló el prompt
        
        if (nombre.trim() === "") {
            alert("Ingrese el nombre del cliente.");
            return;
        }

        const telefono = prompt("Teléfono:");
        if (telefono === null) return;

        if (telefono.trim() === "") {
            alert("Ingrese un teléfono.");
            return;
        }

        // Remover espacios para contar solo caracteres numéricos reales
        if (telefono.replace(/\s+/g, '').length < 8) {
            alert("El teléfono parece incorrecto.");
            return;
        }

        const direccion = prompt("Dirección:") || "";

        this.saveCliente({
            nombre: nombre.trim(),
            telefono: telefono.trim(),
            direccion: direccion.trim()
        });
    }

    async saveCliente(cliente){
        cliente.id = Date.now();
        await add("clientes", cliente);
        alert(`👤 Cliente "${cliente.nombre}" guardado.`);
        await this.load();
    }

    bindCardActions(){
        document.querySelectorAll(".btnVerDetalle").forEach(btn => {
            btn.onclick = async (e) => {
                const id = e.target.dataset.id;
                // Redirección dinámica hacia la ficha avanzada
                const moduloDetalle = await import("./clienteDetalle.js");
                await moduloDetalle.default.load(Number(id));
            };
        });

        document.querySelectorAll(".btnEliminarCliente").forEach(btn => {
            btn.onclick = async (e) => {
                const id = e.target.dataset.id;
                if(confirm("¿Seguro que desea eliminar este cliente? Se borrará del listado.")){
                    // Para simplificar usamos la base nativa vía import
                    const { deleteRecord } = await import("./storage.js");
                    await deleteRecord("clientes", Number(id));
                    await this.load();
                }
            };
        });
    }
}