import { getAll, save } from "./storage.js";

export const configuracion = {
    async iniciar() {
        this.render();
        this.eventos();
    },

    render() {
        const workspace = document.getElementById("workspace");
        if (!workspace) return;

        workspace.innerHTML = `
            <div class="workspace">
                <div class="welcome-card" style="border-left: 5px solid #104E2E;">
                    <h2>⚙️ Panel de Configuración</h2>
                    <p>Administrá las copias de seguridad de tu base de datos local para proteger tu trabajo.</p>
                </div>

                <div class="dashboard-card" style="max-width: 600px; margin-top: 20px;">
                    <h3 style="margin-bottom: 15px; color: #104E2E;">💾 Copias de Seguridad (Respaldos)</h3>
                    <p style="margin-bottom: 20px; color: #555;">Descargá un archivo con todos tus datos ingresados para guardarlo de forma segura en tu disco duro.</p>
                    
                    <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                        <button id="btn-exportar" style="background:#104E2E; color:white; border:none; padding:12px 20px; border-radius:6px; font-weight:bold; display:flex; align-items:center; gap:8px;">
                            📥 Exportar Base de Datos (.json)
                        </button>
                        
                        <label style="background:#3b82f6; color:white; padding:12px 20px; border-radius:6px; font-weight:bold; cursor:pointer; display:flex; align-items:center; gap:8px;">
                            📤 Importar Copia de Respaldo
                            <input type="file" id="input-importar" accept=".json" style="display:none;">
                        </label>
                    </div>
                    <div id="status-backup" style="margin-top: 15px; font-weight: bold;"></div>
                </div>
            </div>
        `;
    },

    eventos() {
        // --- EXPORTAR DATOS ---
        const btnExportar = document.getElementById("btn-exportar");
        if (btnExportar) {
            btnExportar.onclick = async () => {
                try {
                    const status = document.getElementById("status-backup");
                    status.style.color = "#104E2E";
                    status.innerText = "Preparando copia...";

                    // Nos traemos todo lo que hay guardado en tus tablas principales
                    const respaldo = {
                        clientes: await getAll("clientes") || [],
                        presupuestos: await getAll("presupuestos") || [],
                        catalogos: await getAll("catalogos") || [],
                        garantias: await getAll("garantias") || []
                    };

                    // Convertimos a texto JSON bonito
                    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(respaldo, null, 2));
                    
                    // Creamos un link fantasma de descarga
                    const downloadAnchor = document.createElement('a');
                    const fecha = new Date().toISOString().slice(0,10);
                    downloadAnchor.setAttribute("href", dataStr);
                    downloadAnchor.setAttribute("download", `AbsalonPro_Respaldo_${fecha}.json`);
                    document.body.appendChild(downloadAnchor);
                    downloadAnchor.click();
                    downloadAnchor.remove();

                    status.innerText = "✔ ¡Copia descargada con éxito en tu PC!";
                } catch (err) {
                    console.error(err);
                    document.getElementById("status-backup").innerText = "❌ Error al exportar.";
                }
            };
        }

        // --- IMPORTAR DATOS ---
        const inputImportar = document.getElementById("input-importar");
        if (inputImportar) {
            inputImportar.onchange = async (e) => {
                const archivo = e.target.files[0];
                if (!archivo) return;

                if (!confirm("¿Estás seguro de que querés importar este archivo? Esto combinará o actualizará tus datos actuales.")) return;

                const lector = new FileReader();
                lector.onload = async (evento) => {
                    try {
                        const datos = JSON.parse(evento.target.result);
                        const status = document.getElementById("status-backup");
                        status.style.color = "#3b82f6";
                        status.innerText = "Cargando datos...";

                        // Guardamos secuencialmente en cada store de IndexedDB
                        if (datos.clientes) {
                            for (let item of datos.clientes) await save("clientes", item);
                        }
                        if (datos.catalogos) {
                            for (let item of datos.catalogos) await save("catalogos", item);
                        }
                        if (datos.garantias) {
                            for (let item of datos.garantias) await save("garantias", item);
                        }
                        if (datos.presupuestos) {
                            for (let item of datos.presupuestos) await save("presupuestos", item);
                        }

                        status.style.color = "#16a34a";
                        status.innerText = "✔ ¡Datos restaurados e indexados correctamente!";
                    } catch (err) {
                        console.error(err);
                        alert("Error al leer el archivo. Asegurate de que sea un respaldo válido.");
                    }
                };
                lector.readAsText(archivo);
            };
        }
    }
};

export default configuracion;