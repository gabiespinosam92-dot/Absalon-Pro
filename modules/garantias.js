// =========================================================================
// MÓDULO DE GARANTÍAS - ABSALON PRO
// =========================================================================

// Función auxiliar para exportar PDF (por si el import modular falla)
async function obtenerGeneradorPDF() {
    if (typeof window.exportarPresupuestoPDF === 'function') {
        return window.exportarPresupuestoPDF;
    }
    try {
        const modulo = await import('./presupuestoPdf.js');
        return modulo.exportarPresupuestoPDF || modulo.default;
    } catch (e) {
        console.warn("No se pudo cargar dinámicamente presupuestoPdf.js", e);
        return null;
    }
}

// 1. LÓGICA PRINCIPAL DEL MÓDULO
export async function iniciar() {
    const contenedor = document.getElementById('contenido-principal') 
                     || document.getElementById('app') 
                     || document.querySelector('main') 
                     || document.body;

    if (!contenedor) {
        console.error("No se encontró el contenedor principal en el DOM.");
        return;
    }

    // Renderizado de la vista de Garantías
    contenedor.innerHTML = `
        <div style="padding: 24px; max-width: 1200px; margin: 0 auto; font-family: system-ui, -apple-system, sans-serif;">
            <header style="margin-bottom: 24px;">
                <h1 style="font-size: 1.8rem; font-weight: 700; color: #1a1a1a; margin: 0 0 8px 0;">
                    Gestión de Garantías
                </h1>
                <p style="color: #6b7280; font-size: 0.95rem; margin: 0;">
                    Consulta, reimpresión y estado de cobertura de certificados de garantía emitidos.
                </p>
            </header>

            <!-- BÚSQUEDA Y FILTROS -->
            <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 24px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                <input 
                    type="text" 
                    id="input-busqueda-garantia" 
                    placeholder="Buscar por N° de Orden (ej: T-0019) o Nombre del cliente..." 
                    style="width: 100%; padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.95rem; outline: none; box-sizing: border-box;"
                />
            </div>

            <!-- CONTENEDOR DE TARJETAS DE GARANTÍA -->
            <div id="listado-garantias" style="display: grid; gap: 16px; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));">
                <!-- Se puebla dinámicamente -->
            </div>
        </div>
    `;

    // Cargar y mostrar datos
    await renderizarGarantias();

    // Filtro de búsqueda en tiempo real
    const inputBusqueda = document.getElementById('input-busqueda-garantia');
    if (inputBusqueda) {
        inputBusqueda.addEventListener('input', (e) => {
            renderizarGarantias(e.target.value.trim().toLowerCase());
        });
    }
}

// 2. RENDEREADOR DE REGISTROS Y BOTONES
async function renderizarGarantias(filtro = '') {
    const contenedorListado = document.getElementById('listado-garantias');
    if (!contenedorListado) return;

    let registros = [];
    try {
        const dataLocal = localStorage.getItem('absalon_presupuestos') 
                       || localStorage.getItem('presupuestos')
                       || localStorage.getItem('ordenes');
        if (dataLocal) {
            registros = JSON.parse(dataLocal);
        }
    } catch (e) {
        console.error("Error al leer registros para garantías:", e);
    }

    // Filtrar solo las órdenes con prefijo 'T' o estado de finalización
    let garantias = registros.filter(item => {
        const num = String(item.numero || '').toUpperCase();
        return num.startsWith('T') || item.estado === 'Finalizado' || item.esFinalizado;
    });

    if (filtro) {
        garantias = garantias.filter(item => 
            String(item.numero || '').toLowerCase().includes(filtro) ||
            String(item.clienteNombre || '').toLowerCase().includes(filtro)
        );
    }

    if (garantias.length === 0) {
        contenedorListado.innerHTML = `
            <div style="grid-column: 1 / -1; background: #f9fafb; border: 1px dashed #d1d5db; padding: 32px; border-radius: 8px; text-align: center; color: #6b7280;">
                ${filtro ? 'No se encontraron garantías que coincidan con la búsqueda.' : 'No hay órdenes finalizadas con garantía registradas.'}
            </div>
        `;
        return;
    }

    contenedorListado.innerHTML = garantias.map(item => `
        <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 18px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); display: flex; flex-direction: column; justify-content: space-between;">
            <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <span style="font-family: monospace; font-weight: bold; font-size: 1.05rem; color: #0f5132; background: #d1e7dd; padding: 3px 8px; border-radius: 4px;">
                        ${item.numero || 'S/N'}
                    </span>
                    <span style="font-size: 0.85rem; color: #6c757d;">
                        ${item.fecha || ''}
                    </span>
                </div>
                <h3 style="font-size: 1.05rem; font-weight: 600; margin: 0 0 6px 0; color: #212529;">
                    ${item.clienteNombre || 'Cliente sin nombre'}
                </h3>
                <p style="font-size: 0.875rem; color: #6c757d; margin: 0 0 16px 0;">
                    ${item.clienteDireccion ? '📍 ' + item.clienteDireccion : 'Sin dirección especificada'}
                </p>
            </div>

            <button 
                data-id="${item.numero}"
                class="btn-imprimir-garantia"
                style="width: 100%; background: #0f5132; color: #ffffff; border: none; padding: 10px; border-radius: 6px; font-weight: 600; font-size: 0.875rem; cursor: pointer; transition: background 0.2s;"
                onmouseover="this.style.background='#0a3622'" 
                onmouseout="this.style.background='#0f5132'"
            >
                📄 Descargar Certificado de Garantía
            </button>
        </div>
    `).join('');

    // Asignación de eventos de impresión
    const funcionExportar = await obtenerGeneradorPDF();
    document.querySelectorAll('.btn-imprimir-garantia').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const num = e.currentTarget.getAttribute('data-id');
            const orden = garantias.find(g => String(g.numero) === String(num));
            if (orden && funcionExportar) {
                funcionExportar(orden);
            } else if (!funcionExportar) {
                alert("No se pudo cargar el motor PDF. Verifique que 'presupuestoPdf.js' esté disponible.");
            }
        });
    });
}

// =========================================================================
// COMPATIBILIDAD UNIVERSAL CON EL ENRUTADOR DE APP.JS
// =========================================================================

// Exportaciones nombradas
export const load = iniciar;
export const init = iniciar;

// Exportación por defecto
export default {
    iniciar,
    load,
    init
};

// Exposición en la ventana global (soporta scripts tradicionales no-modulares)
if (typeof window !== 'undefined') {
    window.garantiasModule = { iniciar, load, init };
    window.iniciarGarantias = iniciar;
}
