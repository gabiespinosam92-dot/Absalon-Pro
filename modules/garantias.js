// modules/garantias.js
import { exportarPresupuestoPDF } from './pdf.js';

// Función interna para construir el HTML de la vista
const renderizarVistaGarantias = (datosClientes) => {
    const contenedor = document.getElementById("contenido") || document.getElementById("app") || document.querySelector("main");
    if (!contenedor) return;

    let html = `
        <div style="padding: 20px; font-family: sans-serif;">
            <h2 style="margin-bottom: 20px; color: #2e7d32;">Gestión de Garantías</h2>
    `;

    if (!datosClientes || datosClientes.length === 0) {
        html += `<p style="color: #666;">No hay clientes ni presupuestos registrados en el sistema.</p>`;
    } else {
        datosClientes.forEach(cliente => {
            html += `
                <div style="background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 16px; margin-bottom: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <h3 style="margin-top: 0; color: #333;">${cliente.nombre || 'Cliente sin nombre'}</h3>
                    <p style="margin: 4px 0; color: #666; font-size: 14px;">
                        📍 ${cliente.direccion || 'Sin dirección'} | 📞 ${cliente.telefono || 'Sin teléfono'}
                    </p>
                    
                    <h4 style="margin-top: 15px; margin-bottom: 10px; font-size: 14px; color: #555;">Presupuestos y Órdenes Asociadas:</h4>
            `;

            if (cliente.presupuestos && cliente.presupuestos.length > 0) {
                html += `<div style="display: flex; flex-direction: column; gap: 8px;">`;
                cliente.presupuestos.forEach(p => {
                    const datosJSON = JSON.stringify(p).replace(/'/g, "&apos;");
                    html += `
                        <div style="display: flex; justify-content: space-between; align-items: center; background: #f9f9f9; padding: 10px 14px; border-radius: 6px; border: 1px solid #eee;">
                            <div>
                                <strong>N° ${p.numero || 'S/N'}</strong> - ${p.fecha || ''}
                                <span style="margin-left: 10px; font-weight: bold; color: #2e7d32;">$ ${(p.total || 0).toLocaleString('es-AR')}</span>
                            </div>
                            <button onclick='window.descargarGarantiaPDF(${datosJSON})' style="background-color: #2e7d32; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 13px;">
                                📄 Generar PDF Garantía
                            </button>
                        </div>
                    `;
                });
                html += `</div>`;
            } else {
                html += `<p style="font-size: 13px; color: #888; font-style: italic;">No posee presupuestos ni trabajos vinculados.</p>`;
            }

            html += `</div>`;
        });
    }

    html += `</div>`;
    contenedor.innerHTML = html;
};

// Asignar función global para los clics en los botones de PDF
window.descargarGarantiaPDF = (datosPresupuesto) => {
    exportarPresupuestoPDF({
        ...datosPresupuesto,
        esGarantiaDirecta: true
    });
};

// Función de entrada invocada por app.js
export const iniciar = async () => {
    console.log("Iniciando Módulo de Garantías...");

    try {
        const listaClientes = (typeof storage !== "undefined" && storage.obtenerClientes) 
            ? await storage.obtenerClientes() 
            : JSON.parse(localStorage.getItem("clientes") || "[]");

        const listaPresupuestos = (typeof storage !== "undefined" && storage.obtenerPresupuestos) 
            ? await storage.obtenerPresupuestos() 
            : JSON.parse(localStorage.getItem("presupuestos") || "[]");

        // Relación e integración de presupuestos por cada cliente
        const clientesConPresupuestos = listaClientes.map(cliente => {
            const presupuestosDelCliente = listaPresupuestos.filter(p => {
                const coincideId = p.clienteId && String(p.clienteId) === String(cliente.id);
                const coincideNombre = p.clienteNombre && p.clienteNombre.trim().toLowerCase() === (cliente.nombre || "").trim().toLowerCase();
                return coincideId || coincideNombre;
            });

            return {
                ...cliente,
                presupuestos: presupuestosDelCliente
            };
        });

        // Inyección visual en pantalla
        renderizarVistaGarantias(clientesConPresupuestos);
    } catch (e) {
        console.error("Error al cargar la relación de clientes y presupuestos en garantías:", e);
    }
};

export { exportarPresupuestoPDF };

// Exportación por defecto
export default {
    iniciar,
    exportarPresupuestoPDF
};
