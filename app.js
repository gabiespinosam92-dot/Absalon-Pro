/* ==========================================================
   ABSALON PRO
   app.js
   Manejador Principal de la Aplicación (Sprint 8.3 Integrado)
========================================================== */

import { initDB } from "./modules/storage.js";
import dashboard from "./modules/dashboard.js";

const App = {

    currentView: "dashboard",
    presupuestosInstance: null, // Guardamos la referencia para no perder estados en cargas externas

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

        this.initDarkMode();
        this.initMenu();
        this.registerServiceWorker();

        // Carga inicial del Dashboard directo (Sprint 8.3)
        await dashboard.load();

    },

    /* =====================================================
       MENÚ
    ===================================================== */
    initMenu() {
        // Vinculamos la barra inferior
        const navButtons = document.querySelectorAll(".bottom-nav button");
        
        navButtons.forEach(btn => {
            btn.addEventListener("click", async () => {
                const modulo = btn.dataset.module;
                this.activarBoton(modulo);
                // Aquí llamarías a la carga de tu módulo, ej:
                // await this.loadModule(modulo); 
            });
        });
    },

    activarBoton(modulo) {
        document.querySelectorAll(".bottom-nav button").forEach(btn => {
            btn.classList.remove("active");
            if (btn.dataset.module === modulo) {
                btn.classList.add("active");
            }
        });
    },

    /* =====================================================
       ENRUTADOR DINÁMICO DE VISTAS (CAMBIO DE PESTAÑA)
    ===================================================== */
/* =====================================================
       ENRUTADOR DINÁMICO DE VISTAS (CAMBIO DE PESTAÑA)
    ===================================================== */
    async changeView(view) {

        this.currentView = view;

        // Limpieza visual rápida de tarjetas de métricas si no estamos en el dashboard principal
        const welcome = document.querySelector(".welcome-card");
        const grid = document.querySelector(".cards-grid");

        if (view === "dashboard") {
            if (welcome) welcome.style.display = "block";
            if (grid) grid.style.display = "grid";
            await dashboard.load();
            return;
        } else {
            if (welcome) welcome.style.display = "none";
            if (grid) grid.style.display = "none";
        }

        // Enrutamiento e importación bajo demanda de módulos
        switch (view) {

            case "clientes":
            case "catalogos":
            case "historial":
            case "garantias":
                console.log(`ENTRÉ AL MÓDULO ${view.toUpperCase()}`);
                const module = await import(`./modules/${view}.js`);
                
                // BLINDAJE DEFINITIVO: Detecta si es una clase pura o un objeto ya instanciado
                let instance;
                if (typeof module.default === "function") {
                    instance = new module.default(); 
                } else {
                    instance = module.default; // Si ya es un objeto, lo usa directo sin hacer 'new'
                }
                
                await instance.load();
                break;

            case "presupuestos":
                console.log("ENTRÉ AL MÓDULO PRESUPUESTOS");
                const presupuestosModule = await import("./modules/presupuestos.js");
                
                // Aplicamos el mismo blindaje por seguridad en presupuestos
                if (typeof presupuestosModule.default === "function") {
                    this.presupuestosInstance = new presupuestosModule.default();
                } else {
                    this.presupuestosInstance = presupuestosModule.default;
                }
                
                await this.presupuestosInstance.load();
                break;

            default:
                document.getElementById("workspace").innerHTML = `
                    <div class="card">
                        <h2>${view}</h2>
                        <p>Disponible próximamente.</p>
                    </div>
                `;
        }

    },

    /* =====================================================
       MODO OSCURO
    ===================================================== */
    initDarkMode() {

        const button = document.getElementById("btnDarkMode");
        const enabled = localStorage.getItem("darkMode");

        if(enabled === "true"){
            document.body.classList.add("dark");
        }

        button.addEventListener("click", () => {

            document.body.classList.toggle("dark");
            localStorage.setItem(
                "darkMode",
                document.body.classList.contains("dark")
            );

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
   INICIO
========================================================== */
window.addEventListener("DOMContentLoaded", async () => {

    await App.init();

});
if ("serviceWorker" in navigator) {

    window.addEventListener("load", () => {

        navigator.serviceWorker.register("./sw.js")

            .then(() => {

                console.log("✔ Service Worker registrado");

            })

            .catch(err => {

                console.error(err);

            });

    });

}