// modules/garantias.js

export const exportarPresupuestoPDF = async (datos) => {
    if (typeof window.jspdf === "undefined") {
        try {
            await new Promise((resolve, reject) => {
                const script = document.createElement("script");
                script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        } catch (e) {
            console.error("No se pudo cargar jsPDF:", e);
            return;
        }
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    const formato = (n) =>
        Number(n || 0).toLocaleString("es-AR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

    const nroPresupuesto = datos.numero || "S/N";
    const fechaPresupuesto = datos.fecha || new Date().toLocaleDateString("es-AR");
    const nombreCliente = datos.clienteNombre || (datos.cliente ? datos.cliente.nombre : "") || "";
    const dirCliente = datos.clienteDireccion || (datos.cliente ? datos.cliente.direccion : "") || "";
    const telCliente = datos.clienteTelefono || (datos.cliente ? datos.cliente.telefono : "") || "";
    const docTipo = datos.clienteTipoDoc || "CUIL/CUIT";
    const docNum = datos.clienteNumDoc || "";

    const prefijo = String(nroPresupuesto).toUpperCase().charAt(0);
    const esFinalizado = prefijo === "T" || Boolean(datos.esGarantiaDirecta);
    const esFactura = Boolean(datos.esFactura);
    const esSoloGarantia = Boolean(datos.esGarantiaDirecta);

    const dibujarPieDePagina = () => {
        const yPie = 258;
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.25);
        doc.line(15, yPie, 195, yPie);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(0, 0, 0);
        doc.text("CONDICIONES COMERCIALES Y COBERTURA:", 15, yPie + 4.5);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.text("RECUERDE QUE LOS PRESUPUESTOS TIENEN UN PLAZO DE 15 DIAS Y PARA CONFIRMAR SE ABONA UNA SEÑA DEL 50%.", 15, yPie + 8.5);

        doc.setLineWidth(0.4);
        doc.line(15, yPie + 12.5, 195, yPie + 12.5);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("GABRIEL ABSALON", 15, yPie + 18);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(80, 80, 80);
        doc.text("Servicios Técnicos Integrales", 15, yPie + 22);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        doc.text("CEL: 3624884054", 195, yPie + 18, { align: "right" });
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.text("Carlos Gardel 1420 - Resistencia Chaco", 195, yPie + 22, { align: "right" });
    };

    if (esSoloGarantia) {
        if (datos.logo) {
            try { doc.addImage(datos.logo, "PNG", 15, 15, 46, 29); } catch (e) {}
        }

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text("Servicio Técnico Integral", 15, 47);
        doc.text("Resistencia - Chaco", 15, 51);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(15);
        doc.setTextColor(0, 0, 0);
        doc.text("ORDEN DE TRABAJO TERMINADO", 195, 24, { align: "right" });

        doc.setFont("courier", "bold");
        doc.setFontSize(10.5);
        doc.setTextColor(50, 50, 50);
        doc.text(`NÚMERO DE PRESUPUESTO: ${nroPresupuesto}`, 195, 31, { align: "right" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(0, 0, 0);
        doc.text(`FECHA EMISIÓN: ${fechaPresupuesto}`, 195, 38, { align: "right" });

        doc.setDrawColor(210, 210, 210);
        doc.setLineWidth(0.3);
        doc.line(15, 55, 195, 55);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text("CLIENTE:", 15, 63);
        doc.text("DIRECCIÓN:", 15, 69);
        doc.text("TELÉFONO:", 15, 75);

        doc.setFont("helvetica", "normal");
        doc.text(String(nombreCliente), 35, 63);
        doc.text(String(dirCliente), 39, 69);
        doc.text(String(telCliente), 38, 75);

        if (docNum) {
            doc.setFont("helvetica", "bold");
            doc.text(`${docTipo}:`, 130, 63);
            doc.setFont("helvetica", "normal");
            doc.text(String(docNum), 152, 63);
        }

        let yGarantia = 86;

        doc.setFillColor(239, 239, 239);
        doc.rect(15, yGarantia, 180, 7.5, "FD");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(0, 0, 0);
        doc.text("1. ALCANCE Y CONDICIONES DE APLICACIÓN DE LA GARANTÍA", 19, yGarantia + 5);

        yGarantia += 11;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);

        const textoAplica = datos.garantiaAplica || 
            "La presente garantía cubre fallas de ejecución, defectos de ensamblado o vicios ocultos derivados exclusivamente de la mano de obra aplicada en los trabajos detallados en la orden de trabajo. Esta cobertura posee una validez según los términos acordados a partir de la fecha de entrega y conformidad.";

        const lineasAplica = doc.splitTextToSize(textoAplica, 172);
        doc.text(lineasAplica, 19, yGarantia);

        yGarantia += (lineasAplica.length * 4.5) + 8;

        doc.setFillColor(239, 239, 239);
        doc.rect(15, yGarantia, 180, 7.5, "FD");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.text("2. EXCLUSIONES Y PÉRDIDA DE COBERTURA", 19, yGarantia + 5);

        yGarantia += 11;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);

        const textoExclusiones = datos.garantiaExclusiones || 
            "Quedan expresamente excluidas de la garantía las siguientes situaciones:\n" +
            "• Intervención o modificación de las instalaciones por parte de terceros no autorizados.\n" +
            "• Daños provocados por mal uso, sobrecargas eléctricas, humedad ajena a la estructura o factores climáticos extremos.\n" +
            "• Desgaste natural de insumos y materiales provistos directamente por el cliente.";

        const lineasExclusiones = doc.splitTextToSize(textoExclusiones, 172);
        doc.text(lineasExclusiones, 19, yGarantia);

        dibujarPieDePagina();

        const nombreArchivo = `Garantia_${nroPresupuesto}_${nombreCliente.replace(/[^\w\s-]/gi, '').replace(/\s+/g, '_')}.pdf`;
        doc.save(nombreArchivo);
        return;
    }

    const aplicarIva = datos.incluirIva !== undefined ? Boolean(datos.incluirIva) : true;
    const matNeto = Number(datos.totalMaterialesNeto || 0);
    const matIva = aplicarIva ? Number(datos.ivaMateriales || (matNeto * 0.21)) : 0;
    const matTotal = matNeto + matIva;

    const columnaTotalNeto = Number(datos.columnaTotalNeto || datos.total || 0);
    const columnaTotalIva = aplicarIva ? Number(datos.columnaTotalIva || 0) : 0;
    const granTotalFinal = columnaTotalNeto + columnaTotalIva;

    if (datos.logo) {
        try { doc.addImage(datos.logo, "PNG", 15, 15, 46, 29); } catch (e) {}
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text("Servicio Técnico Integral", 15, 47);
    doc.text("Resistencia - Chaco", 15, 51);

    if (esFactura) {
        doc.setLineWidth(0.5);
        doc.setDrawColor(0, 0, 0);
        doc.rect(100, 15, 10, 12);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text("C", 103.2, 23);

        doc.setFontSize(22);
        doc.text("FACTURA", 195, 25, { align: "right" });
    } else {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(0, 0, 0); 
        doc.text("PRESUPUESTO", 195, 25, { align: "right" });
    }

    doc.setFont("courier", "bold");
    doc.setFontSize(13);
    doc.setTextColor(50, 50, 50);
    doc.text(String(nroPresupuesto), 195, 32, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(0, 0, 0);
    doc.text(`FECHA: ${fechaPresupuesto}`, 195, 40, { align: "right" });

    doc.setDrawColor(210, 210, 210);
    doc.setLineWidth(0.3);
    doc.line(15, 55, 195, 55);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("CLIENTE:", 15, 63);
    doc.text("DIRECCIÓN:", 15, 69);
    doc.text("TELÉFONO:", 15, 75);

    doc.setFont("helvetica", "normal");
    doc.text(String(nombreCliente), 35, 63);
    doc.text(String(dirCliente), 39, 69);
    doc.text(String(telCliente), 38, 75);

    if (docNum) {
        doc.setFont("helvetica", "bold");
        doc.text(`${docTipo}:`, 130, 63);
        doc.setFont("helvetica", "normal");
        doc.text(String(docNum), 152, 63);
    }

    let y = 83;
    const yInicioTabla = y;

    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.25);
    doc.setFillColor(239, 239, 239);
    doc.rect(15, y, 180, 7.5, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text("CANT.", 17, y + 5);
    doc.text("PRODUCTO / DESCRIPCIÓN", 32, y + 5);
    doc.text("PRECIO", 125, y + 5, { align: "right" });
    doc.text("IVA (21%)", 158, y + 5, { align: "right" });
    doc.text("TOTAL", 192, y + 5, { align: "right" });

    const agregarFilaTabla = (cant, descripcion, neto, iva, total) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        
        const lineasDesc = doc.splitTextToSize(String(descripcion), 88);
        const altoFila = Math.max(7.5, lineasDesc.length * 4.5 + 2);

        y += 7.5;
        doc.setFillColor(255, 255, 255);
        doc.rect(15, y, 180, altoFila, "S");
        
        doc.text(String(cant), 21, y + 5, { align: "center" });
        doc.text(lineasDesc, 32, y + 5);
        doc.text(neto ? `$ ${formato(neto)}` : "", 125, y + 5, { align: "right" });
        
        const textoIva = aplicarIva ? (iva ? `$ ${formato(iva)}` : "$ 0,00") : "$ 0,00";
        doc.text(textoIva, 158, y + 5, { align: "right" });
        doc.text(total ? `$ ${formato(total)}` : "", 192, y + 5, { align: "right" });

        y += (altoFila - 7.5);
    };

    if (matNeto > 0) {
        agregarFilaTabla("1", "Materiales", matNeto, matIva, matTotal);
    }

    const moItems = datos.manoObraItems || datos.items || [];
    if (moItems.length > 0) {
        moItems.forEach(item => {
            const itemNeto = Number(item.total || item.precioUnitario || 0);
            const itemIva = aplicarIva ? (itemNeto * 0.21) : 0;
            const itemTotal = itemNeto + itemIva;
            const cantMostrar = `${item.cantidad || 1}`;
            const descMostrar = `${item.concepto || item.descripcion || 'Servicio Técnico'}`;

            agregarFilaTabla(cantMostrar, descMostrar, itemNeto, itemIva, itemTotal);
        });
    } else if (matNeto === 0) {
        agregarFilaTabla("1", "Servicios Técnicos / Mano de Obra", 0, 0, 0);
    }

    y += 7.5;
    doc.setFillColor(248, 248, 248);
    doc.rect(15, y, 180, 7.5, "FD");
    doc.setFont("helvetica", "bold");
    doc.text("TOTALES", 32, y + 5);
    doc.text(`$ ${formato(columnaTotalNeto)}`, 125, y + 5, { align: "right" });
    doc.text(`$ ${formato(columnaTotalIva)}`, 158, y + 5, { align: "right" });
    doc.text(`$ ${formato(granTotalFinal)}`, 192, y + 5, { align: "right" });

    const limitesColumnas = [30, 128, 161];
    limitesColumnas.forEach(colX => {
        doc.line(colX, yInicioTabla, colX, y + 7.5);
    });

    y += 11;
    const tCant = datos.tiempoCant || "1";
    const tTexto = datos.tiempoUnidadTexto || "uno";
    const tPlural = datos.tiempoUnidadPlural || "DÍA";
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(`EL TIEMPO DE EJECUCIÓN SERÍA DE ${tCant} (${tTexto}) ${tPlural}.`.toUpperCase(), 15, y);

    y += 4;
    doc.setLineWidth(0.35);
    doc.rect(15, y, 180, 14);
    doc.setFontSize(12);
    doc.text(`TOTAL A PAGAR: $ ${formato(granTotalFinal)}`, 19, y + 5.5);
    doc.setFontSize(9.5);
    doc.text("ALIAS: GABI.ESPINOSAM (MERCADO PAGO)", 19, y + 10.5);

    dibujarPieDePagina();

    if (esFinalizado || esFactura) {
        doc.addPage();

        if (datos.logo) {
            try { doc.addImage(datos.logo, "PNG", 15, 15, 46, 29); } catch (e) {}
        }

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text("RESPONSABLE OPERATIVO:", 15, 47);
        doc.text("Técnico: Gabriel Absalon | M.M.O.", 15, 51);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0); 
        doc.text("GARANTÍAS Y COBERTURA", 195, 25, { align: "right" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.text(`NÚMERO DE PRESUPUESTO: ${nroPresupuesto}`, 195, 32, { align: "right" });
        doc.text(`FECHA EMISIÓN: ${fechaPresupuesto}`, 195, 38, { align: "right" });
        doc.text(`CLIENTE: ${nombreCliente}`, 195, 44, { align: "right" });

        doc.setDrawColor(210, 210, 210);
        doc.setLineWidth(0.3);
        doc.line(15, 55, 195, 55);

        let yGarantia = 65;

        doc.setFillColor(239, 239, 239);
        doc.rect(15, yGarantia, 180, 7.5, "FD");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(0, 0, 0);
        doc.text("1. ALCANCE Y CONDICIONES DE APLICACIÓN DE LA GARANTÍA", 19, yGarantia + 5);

        yGarantia += 11;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);

        const textoAplica = datos.garantiaAplica || 
            "La presente garantía cubre fallas de ejecución, defectos de ensamblado o vicios ocultos derivados exclusivamente de la mano de obra aplicada en los trabajos detallados en el comprobante principal. Esta cobertura posee una validez de 12 meses a partir de la fecha de entrega y conformidad de la obra.";

        const lineasAplica = doc.splitTextToSize(textoAplica, 172);
        doc.text(lineasAplica, 19, yGarantia);

        yGarantia += (lineasAplica.length * 4.5) + 8;

        doc.setFillColor(239, 239, 239);
        doc.rect(15, yGarantia, 180, 7.5, "FD");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.text("2. EXCLUSIONES Y PÉRDIDA DE COBERTURA", 19, yGarantia + 5);

        yGarantia += 11;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);

        const textoExclusiones = datos.garantiaExclusiones || 
            "Quedan expresamente excluidas de la garantía las siguientes situaciones:\n" +
            "• Intervención o modificación de las instalaciones por parte de terceros no autorizados.\n" +
            "• Daños provocados por mal uso, sobrecargas eléctricas, humedad ajena a la estructura o factores climáticos extremos.\n" +
            "• Desgaste natural de insumos y materiales provistos directamente por el cliente.";

        const lineasExclusiones = doc.splitTextToSize(textoExclusiones, 172);
        doc.text(lineasExclusiones, 19, yGarantia);

        dibujarPieDePagina();
    }

    const nombreFinalArchivo = `${esFactura ? 'Factura' : 'Presupuesto'}_${nroPresupuesto}_${nombreCliente.replace(/[^\w\s-]/gi, '').replace(/\s+/g, '_')}.pdf`;
    doc.save(nombreFinalArchivo);
};

// Función interna para construir el HTML de la vista
const renderizarVistaGarantias = (datosClientes) => {
    // Detecta el contenedor principal de la App
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

export default {
    iniciar,
    exportarPresupuestoPDF
};
