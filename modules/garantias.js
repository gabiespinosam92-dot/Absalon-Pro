import { exportarPresupuestoPDF } from './presupuestoPdf.js'; // Ajustá la ruta si tu archivo PDF está en otra carpeta

// Función principal que invoca el enrutador de Absalon Pro
export async function iniciar() {
    const contenedor = document.getElementById('contenido-principal') || document.querySelector('main') || document.body;

    contenedor.innerHTML = `
        <div style="padding: 24px; max-width: 1200px; margin: 0 auto; font-family: sans-serif;">
            <header style="margin-bottom: 24px;">
                <h1 style="font-size: 1.8rem; font-weight: bold; color: #1a1a1a; margin: 0 0 8px 0;">
                    Gestión de Garantías
                </h1>
                <p style="color: #666; font-size: 0.95rem; margin: 0;">
                    Consulta, reimpresión y estado de cobertura de garantías emitidas.
                </p>
            </header>

            <!-- BÚSQUEDA Y FILTROS -->
            <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 24px; display: flex; gap: 12px;">
                <input 
                    type="text" 
                    id="input-busqueda-garantia" 
                    placeholder="Buscar por N° de Orden (ej: T-0019) o Nombre del cliente..." 
                    style="flex: 1; padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.95rem; outline: none;"
                />
            </div>

            <!-- CONTENEDOR DE TARJETAS / LISTADO -->
            <div id="listado-garantias" style="display: grid; gap: 16px; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));">
                <!-- Se puebla dinámicamente -->
            </div>
        </div>
    `;

    // Cargar datos al iniciar el módulo
    await renderizarGarantias();

    // Evento de búsqueda en tiempo real
    const inputBusqueda = document.getElementById('input-busqueda-garantia');
    if (inputBusqueda) {
        inputBusqueda.addEventListener('input', (e) => {
            renderizarGarantias(e.target.value.trim().toLowerCase());
        });
    }
}

// Alias por si la app busca 'load' en lugar de 'iniciar'
export const load = iniciar;

// Función para obtener y listar los trabajos finalizados / garantías
async function renderizarGarantias(filtro = '') {
    const contenedorListado = document.getElementById('listado-garantias');
    if (!contenedorListado) return;

    // Obtener historial de presupuestos/ordenes almacenados en localStorage o IndexedDB
    let registros = [];
    try {
        const dataLocal = localStorage.getItem('absalon_presupuestos') || localStorage.getItem('presupuestos');
        if (dataLocal) {
            registros = JSON.parse(dataLocal);
        }
    } catch (e) {
        console.error("Error al leer registros para garantías", e);
    }

    // Filtrar solo las órdenes finalizadas (Prefijo 'T' o estado finalizado)
    let garantias = registros.filter(item => {
        const num = String(item.numero || '').toUpperCase();
        return num.startsWith('T') || item.estado === 'Finalizado' || item.esFinalizado;
    });

    // Aplicar filtro de búsqueda si el usuario escribe
    if (filtro) {
        garantias = garantias.filter(item => 
            String(item.numero || '').toLowerCase().includes(filtro) ||
            String(item.clienteNombre || '').toLowerCase().includes(filtro)
        );
    }

    if (garantias.length === 0) {
        contenedorListado.innerHTML = `
            <div style="grid-column: 1 / -1; background: #f9fafb; border: 1px dashed #d1d5db; padding: 32px; border-radius: 8px; text-align: center; color: #6b7280;">
                ${filtro ? 'No se encontraron garantías que coincidan con la búsqueda.' : 'No hay órdenes finalizadas con garantía registradas hasta el momento.'}
            </div>
        `;
        return;
    }

    contenedorListado.innerHTML = garantias.map(item => `
        <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 18px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); display: flex; flex-direction: column; justify-content: space-between;">
            <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <span style="font-family: monospace; font-weight: bold; font-size: 1.1rem; color: #0f5132; background: #d1e7dd; padding: 2px 8px; border-radius: 4px;">
                        ${item.numero || 'S/N'}
                    </span>
                    <span style="font-size: 0.85rem; color: #6c757d;">
                        ${item.fecha || ''}
                    </span>
                </div>
                <h3 style="font-size: 1.05rem; font-weight: 600; margin: 0 0 6px 0; color: #212529;">
                    ${item.clienteNombre || 'Cliente no especificado'}
                </h3>
                <p style="font-size: 0.875rem; color: #6c757d; margin: 0 0 12px 0;">
                    ${item.clienteDireccion ? '📍 ' + item.clienteDireccion : ''}
                </p>
            </div>

            <button 
                data-id="${item.numero}"
                class="btn-imprimir-garantia"
                style="width: 100%; background: #0f5132; color: #ffffff; border: none; padding: 10px; border-radius: 6px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: background 0.2s;"
                onmouseover="this.style.background='#0a3622'" 
                onmouseout="this.style.background='#0f5132'"
            >
                📄 Descargar Certificado de Garantía
            </button>
        </div>
    `).join('');

    // Asignar los eventos a los botones de descarga
    document.querySelectorAll('.btn-imprimir-garantia').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const num = e.currentTarget.getAttribute('data-id');
            const ordenSeleccionada = garantias.find(g => String(g.numero) === String(num));
            if (ordenSeleccionada) {
                exportarPresupuestoPDF(ordenSeleccionada);
            }
        });
    });
}
