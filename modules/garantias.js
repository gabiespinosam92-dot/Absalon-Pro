// modules/garantias.js
import { exportarPresupuestoPDF } from './pdf.js';

// Función interna para construir el HTML de la vista
const renderizarVistaGarantias = (datosClientes, presupuestosTotales) => {
    const contenedor = document.getElementById("contenido") || document.getElementById("app") || document.querySelector("main");
    if (!contenedor) return;

    let html = `
        <div style="padding: 20px; font-family: sans-serif;">
            <h2 style="margin-bottom: 20px; color: #2e7d32;">Gestión de Garantías</h2>
    `;

    const tieneClientes = datosClientes && datosClientes.length > 0;
    const tienePresupuestos = presupuestosTotales && presupuestosTotales.length > 0;

    if (!tieneClientes && !tienePresupuestos) {
        html += `<p style="color: #666;">No hay clientes ni presupuestos registrados en el sistema.</p>`;
    } else {
        // Renderizar por Clientes
        if (tieneClientes) {
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

        // Si existen presupuestos que no se enlazaron con un cliente formal
        const presupuestosHuérfanos = presupuestosTotales.filter(p => {
            if (!tieneClientes) return true;
            return !datosClientes.some(c => c.presupuestos && c.presupuestos.some(cp => cp.numero === p.numero || cp.id === p.id));
        });

        if (presupuestosHuérfanos.length > 0) {
            html += `
                <div style="background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 16px; margin-top: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <h3 style="margin-top: 0; color: #333;">Presupuestos Generales</h3>
                    <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 10px;">
            `;

            presupuestosHuérfanos.forEach(p => {
                const datosJSON = JSON.stringify(p).replace(/'/g, "&apos;");
                const nombreCliente = p.clienteNombre || (p.cliente ? p.cliente.nombre : "Cliente no especificado");
                html += `
                    <div style="display: flex; justify-content: space-between; align-items: center; background: #f9f9f9; padding: 10px 14px; border-radius: 6px; border: 1px solid #eee;">
                        <div>
                            <strong>N° ${p.numero || 'S/N'}</strong> - ${nombreCliente} (${p.fecha || ''})
                            <span style="margin-left: 10px; font-weight: bold; color: #2e7d32;">$ ${(p.total || 0).toLocaleString('es-AR')}</span>
                        </div>
                        <button onclick='window.descargarGarantiaPDF(${datosJSON})' style="background-color: #2e7d32; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 13px;">
                            📄 Generar PDF Garantía
                        </button>
                    </div>
                `;
            });

            html += `</div></div>`;
        }
    }

    html += `</div>`;
    contenedor.innerHTML = html;
};

// Función global para el evento click de descarga
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
        let listaClientes = [];
        let listaPresupuestos = [];

        if (typeof storage !== "undefined" && storage.obtenerClientes) {
            listaClientes = await storage.obtenerClientes();
        } else {
            listaClientes = JSON.parse(localStorage.getItem("clientes") || "[]");
        }

        if (typeof storage !== "undefined" && storage.obtenerPresupuestos) {
            listaPresupuestos = await storage.obtenerPresupuestos();
        } else {
            listaPresupuestos = JSON.parse(localStorage.getItem("presupuestos") || "[]");
        }

        // Cruzar datos de clientes con presupuestos
        const clientesConPresupuestos = listaClientes.map(cliente => {
            const presupuestosDelCliente = listaPresupuestos.filter(p => {
                const coincideId = p.clienteId && String(p.clienteId) === String(cliente.id);
                const coincideNombre = p.clienteNombre && cliente.nombre && p.clienteNombre.trim().toLowerCase() === cliente.nombre.trim().toLowerCase();
                return coincideId || coincideNombre;
            });

            return {
                ...cliente,
                presupuestos: presupuestosDelCliente
            };
        });

        // Renderizar pasando ambas listas
        renderizarVistaGarantias(clientesConPresupuestos, listaPresupuestos);
    } catch (e) {
        console.error("Error al cargar la relación de clientes y presupuestos en garantías:", e);
    }
};

export { exportarPresupuestoPDF };

export default {
    iniciar,
    exportarPresupuestoPDF
};
