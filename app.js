/* ==========================================================
   ABSALON PRO
   app.js - COMPLETAMENTE REPARADO (ENRUTADOR SPA, MODO OSCURO Y ESTADÍSTICAS)
========================================================== */

import { initDB } from "./modules/storage.js";
import dashboard from "./modules/dashboard.js"; 

const App = {

    currentView: "dashboard",
    presupuestosInstance: null,

    async init() {

        console.log("================================");
        console.log("ABSALON PRO");
        console.log("Versión 2.0.0");
        console.log("Build 001");
        console.log("================================");

        try {
            await initDB();
            console.log("✔ Base de datos iniciada.");
        } catch (error) {
            console.error(error);
        }

        this.initMenu();
        this.initDarkMode(); // Único punto de inicio para el Modo Oscuro
        this.registerServiceWorker();

        // Carga inicial del Dashboard directo
        await dashboard.load();

    },

    /* =====================================================
       MENÚ DE NAVEGACIÓN
    ===================================================== */
  /* =====================================================
       MENÚ DE NAVEGACIÓN
    ===================================================== */
   initMenu() {
        // Seleccionamos tanto los botones de PC (.menu-item) como los de celular (.bottom-item)
        document.querySelectorAll(".menu-item, .bottom-item").forEach(btn => {
            btn.addEventListener("click", async () => {
                const view = btn.getAttribute("data-view");
                if(!view) return;

                // Quitamos la clase active de TODOS los botones
                document.querySelectorAll(".menu-item, .bottom-item").forEach(b => b.classList.remove("active"));
                
                // Le ponemos la clase active a los botones que apunten a esta misma vista (sincroniza PC y celular)
                document.querySelectorAll(`[data-view="${view}"]`).forEach(b => b.classList.add("active"));

                this.currentView = view;
                await this.cargarVista(view); 
            });
        });
    },/* =====================================================
       MENÚ DE NAVEGACIÓN
    ===================================================== */
  /* =====================================================
       MENÚ DE NAVEGACIÓN
    ===================================================== */
   initMenu() {
        // Selecciona tanto los botones de PC (.menu-item) como los de celular (.bottom-item)
        document.querySelectorAll(".menu-item, .bottom-item").forEach(btn => {
            btn.addEventListener("click", async () => {
                const view = btn.getAttribute("data-view");
                if(!view) return;

                // Quita la clase active de todos los botones
                document.querySelectorAll(".menu-item, .bottom-item").forEach(b => b.classList.remove("active"));
                
                // Activa el botón clickeado
                btn.classList.add("active");

                this.currentView = view;
                await this.cargarVista(view); 
            });
        });
    },
    /* =====================================================
       MANEJADOR DE VISTAS (SPA) - REPARADO PARA ENTRAR A TODO
    ===================================================== */
    async cargarVista(view) {
        console.log(`Cargando vista: ${view}`);

        // Aseguramos que el contenedor base "mainContent" tenga el "workspace" listo
        const mainContent = document.getElementById("mainContent");
        if (mainContent) {
            mainContent.innerHTML = `<div id="workspace"></div>`;
        }

        switch (view) {
            case "dashboard":
                await dashboard.load();
                break;

            // COPIÁ Y PEGÁ ESTO AQUÍ: Caso para cargar el módulo de Agenda
            case "agenda":
                try {
                    const { default: agendaMod } = await import("./modules/agenda.js");
                    if (agendaMod && typeof agendaMod.iniciar === "function") await agendaMod.iniciar();
                } catch (err) {
                    console.error("Error al cargar la agenda:", err);
                }
                break;

            case "presupuestos":
                if(!this.presupuestosInstance){
                    const { default: pMod } = await import("./modules/presupuestos.js");
                    this.presupuestosInstance = pMod;
                }
                await this.presupuestosInstance.iniciar();
                break;

            case "clientes":
                try {
                    const { default: cMod } = await import("./modules/clientes.js");
                    if (cMod && typeof cMod.iniciar === "function") await cMod.iniciar();
                    else if (cMod && typeof cMod.load === "function") await cMod.load();
                } catch (err) {
                    console.error("Error al cargar clientes:", err);
                }
                break;

            case "catalogos":
                try {
                    const { default: catMod } = await import("./modules/catalogos.js");
                    if (catMod && typeof catMod.iniciar === "function") await catMod.iniciar();
                    else if (catMod && typeof catMod.load === "function") await catMod.load();
                } catch (err) {
                    console.error("Error al cargar catálogos:", err);
                }
                break;
                

            case "construccionSeco":
            case "seco":
                try {
                    const { default: secoMod } = await import("./modules/construccionSeco.js");
                    if (secoMod && typeof secoMod.iniciar === "function") await secoMod.iniciar();
                    else if (secoMod && typeof secoMod.load === "function") await secoMod.load();
                } catch (err) {
                    console.error("Error al cargar Cómputo Seco:", err);
                }
                break;
                case "albañileria":
                try {
                    const { default: albaMod } = await import("./modules/albañileria.js");
                    if (albaMod && typeof albaMod.iniciar === "function") await albaMod.iniciar();
                } catch (err) {
                    console.error("Error al cargar Albañilería:", err);
                }
                break;

            case "electricidad":
                try {
                    const { default: elecMod } = await import("./modules/electricidad.js");
                    if (elecMod && typeof elecMod.iniciar === "function") await elecMod.iniciar();
                } catch (err) {
                    console.error("Error al cargar Electricidad:", err);
                }
                break;

            case "refrigeracion":
                try {
                    const { default: refMod } = await import("./modules/refrigeracion.js");
                    if (refMod && typeof refMod.iniciar === "function") await refMod.iniciar();
                } catch (err) {
                    console.error("Error al cargar Refrigeración:", err);
                }
                break;

            case "garantias":
                try {
                    const { garantias } = await import("./modules/garantias.js");
                    await garantias.iniciar();
                } catch (err) {
                    console.error("Error al cargar garantías:", err);
                }
                break;

            case "historial":
                try {
                    const { default: hMod } = await import("./modules/historial.js");
                    if (hMod && typeof hMod.iniciar === "function") await hMod.iniciar();
                    else if (hMod && typeof hMod.load === "function") await hMod.load();
                } catch (err) {
                    console.error("Error al cargar historial:", err);
                }
                break;

            case "configuracion":
                try {
                    const { default: configMod } = await import("./modules/configuracion.js");
                    if (configMod && typeof configMod.iniciar === "function") await configMod.iniciar();
                    else if (configMod && typeof configMod.load === "function") await configMod.load();
                } catch (err) {
                    console.error("Error al cargar configuración:", err);
                }
                break;

            case "estadisticas":
                try {
                    const workspace = document.getElementById("workspace");
                    if (workspace) {
                        workspace.innerHTML = `
                            <div class="card welcome-card" style="margin-bottom: 20px;">
                                <h2 style="color: #104E2E; margin-bottom: 10px;">📊 Panel de Control y Rendimiento Integral</h2>
                                <p style="color: #4b5563; font-size: 14px;">Seguimiento mensual de presupuestos, actividad de clientes y flujos financieros.</p>
                                
                                <div style="display: flex; gap: 10px; margin-top: 15px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
                                    <button id="btnSubMetricas" class="menu-item active" style="padding: 8px 16px; border-radius: 4px; font-weight: bold; cursor: pointer;">📈 Actividad Mensual</button>
                                    <button id="btnSubFinanzas" class="menu-item" style="padding: 8px 16px; border-radius: 4px; font-weight: bold; cursor: pointer; background: #475569; color: white;">💵 Control Financiero</button>
                                </div>
                            </div>

                            <div id="vistaMetricasOperativas">
                                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 25px;">
                                    <div class="dashboard-card" style="border-left: 4px solid #f59e0b; padding: 15px; background: #fff; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                                        <p style="font-size: 12px; color: #64748b; font-weight: bold; text-transform: uppercase;">📝 En Borrador (B)</p>
                                        <h3 id="cantBorrador" style="font-size: 24px; color: #1e293b; margin-top: 5px;">0</h3>
                                    </div>
                                    <div class="dashboard-card" style="border-left: 4px solid #3b82f6; padding: 15px; background: #fff; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                                        <p style="font-size: 12px; color: #64748b; font-weight: bold; text-transform: uppercase;">📩 Enviados (E)</p>
                                        <h3 id="cantEnviado" style="font-size: 24px; color: #1e293b; margin-top: 5px;">0</h3>
                                    </div>
                                    <div class="dashboard-card" style="border-left: 4px solid #104E2E; padding: 15px; background: #fff; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                                        <p style="font-size: 12px; color: #64748b; font-weight: bold; text-transform: uppercase;">✅ Aceptados / Terminados (T)</p>
                                        <h3 id="cantTerminado" style="font-size: 24px; color: #1e293b; margin-top: 5px;">0</h3>
                                    </div>
                                </div>

                                <div class="card" style="background: #fff; padding: 20px; border-radius: 4px;">
                                    <h4 style="color: #104E2E; margin-bottom: 15px; font-size: 14px; font-weight: bold;">🔄 HISTORIAL DE ACTIVIDAD POR CLIENTE (Último Presupuesto)</h4>
                                    <table style="width: 100%; border-collapse: collapse; font-size: 13px;" id="tablaClientesActividad">
                                        <thead>
                                            <tr style="background: #f1f5f9; text-align: left; border-bottom: 2px solid #cbd5e1;">
                                                <th style="padding: 10px;">Cliente</th>
                                                <th style="padding: 10px;">Última Fecha</th>
                                                <th style="padding: 10px;">Último Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody></tbody>
                                    </table>
                                </div>
                            </div>

                            <div id="vistaFinanzas" style="display: none;">
                                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px; margin-bottom: 25px;">
                                    <div class="dashboard-card" style="border-left: 4px solid #104E2E; padding: 15px; background: #fff;">
                                        <p style="font-size: 12px; color: #64748b; font-weight: bold; text-transform: uppercase;">💰 Presupuestos Aprobados</p>
                                        <h3 id="finAprobados" style="font-size: 22px; color: #104E2E; margin-top: 5px;">$0,00</h3>
                                    </div>
                                    <div class="dashboard-card" style="border-left: 4px solid #16a34a; padding: 15px; background: #fff;">
                                        <p style="font-size: 12px; color: #64748b; font-weight: bold; text-transform: uppercase;">📈 Ganancias Netas</p>
                                        <h3 id="finGanancias" style="font-size: 22px; color: #16a34a; margin-top: 5px;">$0,00</h3>
                                    </div>
                                    <div class="dashboard-card" style="border-left: 4px solid #0284c7; padding: 15px; background: #fff;">
                                        <p style="font-size: 12px; color: #64748b; font-weight: bold; text-transform: uppercase;">🐷 Ahorros Guardados</p>
                                        <h3 id="finAhorro" style="font-size: 22px; color: #0284c7; margin-top: 5px;">$0,00</h3>
                                    </div>
                                    <div class="dashboard-card" style="border-left: 4px solid #6366f1; padding: 15px; background: #fff;">
                                        <p style="font-size: 12px; color: #64748b; font-weight: bold; text-transform: uppercase;">🚀 Inversiones / Materiales</p>
                                        <h3 id="finInversiones" style="font-size: 22px; color: #6366f1; margin-top: 5px;">$0,00</h3>
                                    </div>
                                </div>
                            </div>
                        `;
                    }

                    const moduloEstadisticas = (await import("./modules/estadisticas.js")).default;
                    await moduloEstadisticas.iniciar();
                } catch (err) {
                    console.error("Error crítico al inicializar el módulo analítico:", err);
                }
                break;

                case "fotos":
                try {
                    const { default: fotosMod } = await import("./modules/fotos.js");
                    await fotosMod.iniciar();
                } catch (err) {
                    console.error("Error al cargar módulo de fotos:", err);
                }
                break;

            default:
                if (document.getElementById("workspace")) {
                    document.getElementById("workspace").innerHTML = `
                        <div class="welcome-card">
                            <h2>${view.toUpperCase()}</h2>
                            <p>Disponible próximamente.</p>
                        </div>
                    `;
                }
        }
    },

    /* =====================================================
       MODO OSCURO
    ===================================================== */
    initDarkMode() {
        const button = document.getElementById("btnDarkMode");
        if (!button) return; 

        const enabled = localStorage.getItem("darkMode");
        if (enabled === "true") {
            document.body.classList.add("dark");
        } else {
            document.body.classList.remove("dark");
        }

        button.replaceWith(button.cloneNode(true)); 
        const nuevoBoton = document.getElementById("btnDarkMode");

        nuevoBoton.addEventListener("click", () => {
            document.body.classList.toggle("dark");
            const esDark = document.body.classList.contains("dark");
            localStorage.setItem("darkMode", esDark);
        });
    },

    /* =====================================================
       SERVICE WORKER
    ===================================================== */
    registerServiceWorker(){
        if("serviceWorker" in navigator){
            navigator.serviceWorker.register("./sw.js");
        }
    }
};

/* ==========================================================
   INICIO ÚNICO DE LA APLICACIÓN
========================================================== */
window.addEventListener("DOMContentLoaded", async () => {
    await App.init();
});
