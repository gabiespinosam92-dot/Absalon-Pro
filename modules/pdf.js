export const exportarPresupuestoPDF = async (datos) => {
    // 1. Carga de la librería jsPDF
    if (typeof window.jspdf === "undefined") {
        try {
            await import("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
        } catch (e) {
            console.error("No se pudo cargar la librería jsPDF", e);
            return;
        }
    }

    const { jsPDF } = window.jspdf;
    
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
    });

    const formato = (n) =>
        Number(n || 0).toLocaleString("es-AR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

    // Mapeo de variables
    const nroPresupuesto = datos.numero || "S/N";
    const fechaPresupuesto = datos.fecha || "";
    const nombreCliente = datos.clienteNombre || "";
    const dirCliente = datos.clienteDireccion || "";
    const telCliente = datos.clienteTelefono || "";
    const docTipo = datos.clienteTipoDoc || "CUIL/CUIT";
    const docNum = datos.clienteNumDoc || "";

    const prefijo = String(nroPresupuesto).toUpperCase().charAt(0);
    const esFinalizado = prefijo === "T";
    const esFactura = datos.esFactura || false;

    // Cálculo de IVA
    const aplicarIva = datos.incluirIva !== undefined ? datos.incluirIva : true;
    const matNeto = Number(datos.totalMaterialesNeto || 0);
    const matIva = aplicarIva ? Number(datos.ivaMateriales || (matNeto * 0.21)) : 0;
    const matTotal = matNeto + matIva;

    const columnaTotalNeto = Number(datos.columnaTotalNeto || 0);
    const columnaTotalIva = aplicarIva ? Number(datos.columnaTotalIva || 0) : 0;
    const granTotalFinal = columnaTotalNeto + columnaTotalIva;

    // =========================================================================
    // PÁGINA 1: ENCABEZADO DE PRESUPUESTO / FACTURA
    // =========================================================================
    if (datos.logo) {
        try {
            doc.addImage(datos.logo, "PNG", 15, 15, 46, 29);
        } catch (e) {
            console.warn("No se pudo cargar el logo", e);
        }
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
        doc.setFontSize(24);
        doc.setTextColor(0, 0, 0); 
        doc.text("PRESUPUESTO", 195, 25, { align: "right" });
    }

    doc.setFont("monospace", "bold");
    doc.setFontSize(14);
    doc.setTextColor(50, 50, 50);
    doc.text(String(nroPresupuesto), 195, 32, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`FECHA: ${fechaPresupuesto}`, 195, 40, { align: "right" });

    doc.setDrawColor(210, 210, 210);
    doc.setLineWidth(0.3);
    doc.line(15, 55, 195, 55);

    // DATOS CLIENTE
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
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

    // TABLA DE ITEMS
    let y = 83;

    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.25);
    doc.setFillColor(239, 239, 239);
    doc.rect(15, y, 180, 7.5, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("CANT.", 17, y + 5);
    doc.text("PRODUCTO / DESCRIPCIÓN", 32, y + 5);
    doc.text("PRECIO", 125, y + 5, { align: "right" });
    doc.text("IVA (21%)", 158, y + 5, { align: "right" });
    doc.text("TOTAL", 192, y + 5, { align: "right" });

    const agregarFilaTabla = (cant, descripcion, neto, iva, total) => {
        y += 7.5;
        doc.setFillColor(255, 255, 255);
        doc.rect(15, y, 180, 7.5, "S");
        
        doc.setFont("helvetica", "normal");
        doc.text(String(cant), 21, y + 5, { align: "center" });
        
        const descTexto = String(descripcion).length > 48 
            ? String(descripcion).substring(0, 45) + "..." 
            : String(descripcion);
            
        doc.text(descTexto, 32, y + 5);
        doc.text(neto ? `$ ${formato(neto)}` : "", 125, y + 5, { align: "right" });
        
        const textoIva = aplicarIva ? (iva ? `$ ${formato(iva)}` : "$ 0,00") : "$ 0,00";
        doc.text(textoIva, 158, y + 5, { align: "right" });
        
        doc.text(total ? `$ ${formato(total)}` : "", 192, y + 5, { align: "right" });
    };

    if (matNeto > 0) {
        agregarFilaTabla("1", "Materiales", matNeto, matIva, matTotal);
    }

    const moItems = datos.manoObraItems || [];
    if (moItems.length > 0) {
        moItems.forEach(item => {
            const itemNeto = Number(item.total || 0);
            const itemIva = aplicarIva ? (itemNeto * 0.21) : 0;
            const itemTotal = itemNeto + itemIva;
            
            const cantMostrar = `${item.cantidad || 1}`;
            const descMostrar = `${item.concepto || item.descripcion}`;

            agregarFilaTabla(cantMostrar, descMostrar, itemNeto, itemIva, itemTotal);
        });
    } else if (matNeto === 0) {
        agregarFilaTabla("1", "Servicios Técnicos / Mano de Obra", 0, 0, 0);
    }

    // Fila Totales
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
        doc.line(colX, 83, colX, y + 7.5);
    });

    // TIEMPO Y TOTAL A PAGAR
    y += 12;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    
    const tCant = datos.tiempoCant || "1";
    const tTexto = datos.tiempoUnidadTexto || "uno";
    const tPlural = datos.tiempoUnidadPlural || "DIA";
    doc.text(`EL TIEMPO DE EJECUCION SERIA DE ${tCant} (${tTexto}) ${tPlural}.`.toUpperCase(), 15, y);

    y += 5;
    doc.setLineWidth(0.35);
    doc.rect(15, y, 180, 15);
    doc.setFontSize(13);
    doc.text(`TOTAL A PAGAR: $ ${formato(granTotalFinal)}`, 19, y + 6);
    doc.setFontSize(10);
    doc.text("ALIAS: GABI.ESPINOSAM (MERCADO PAGO)", 19, y + 11.5);

    // ==========================================
    // MODIFICACIÓN PRINCIPAL EN EL PRESUPUESTO:
    // RECUADRO DE OBSERVACIONES Y CONDICIONES TÉCNICAS
    // ==========================================
    y += 20;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text("OBSERVACIONES Y CONDICIONES DEL SERVICIO:", 15, y);

    y += 3;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);

    const textoObs = datos.observaciones || 
        "• Validez de esta cotización: 15 días corridos a partir de la fecha de emisión.\n" +
        "• Para el inicio de los trabajos se requiere la entrega de una seña equivalente al 50% del total.\n" +
        "• La provisión de insumos y materiales quedan sujetos a disponibilidad de acopio en corralón/proveedor.";

    const lineasObs = doc.splitTextToSize(textoObs, 175);
    doc.text(lineasObs, 15, y + 4);

    // Pie de página PÁGINA 1
    const dibujarPieDePagina = () => {
        const yPie = 260; 

        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.25);
        doc.line(15, yPie, 195, yPie);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text("CONDICIONES COMERCIALES:", 15, yPie + 5);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.text("RECUERDE QUE LOS PRESUPUESTOS TIENEN UN PLAZO DE 15 DIAS Y PARA CONFIRMAR SE ABONA UNA SEÑA DEL 50%.", 15, yPie + 9);

        doc.setLineWidth(0.5);
        doc.line(15, yPie + 14, 195, yPie + 14);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("GABRIEL ABSALON", 15, yPie + 20);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        doc.text("Servicios Técnicos Integrales", 15, yPie + 24);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(0, 0, 0);
        doc.text("CEL: 3624884054", 195, yPie + 20, { align: "right" });
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text("Carlos Gardel 1420 - Resistencia Chaco", 195, yPie + 24, { align: "right" });
    };

    dibujarPieDePagina();

    // =========================================================================
    // PÁGINA 2: GARANTÍAS Y EXCLUSIONES (SEPARADAS)
    // =========================================================================
    if (esFinalizado || esFactura) {
        doc.addPage();

        // Encabezado idéntico al de Lista de Compras
        if (datos.logo) {
            try {
                doc.addImage(datos.logo, "PNG", 15, 15, 46, 29);
            } catch (e) {
                console.warn("No se pudo cargar el logo en pág 2", e);
            }
        }

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text("RESPONSABLE OPERATIVO:", 15, 47);
        doc.text("Técnico: Gabriel Absalon | M.M.O.", 15, 51);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.setTextColor(0, 0, 0); 
        doc.text("GARANTÍAS Y COBERTURA", 195, 25, { align: "right" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(`ASOCIADO A: ${nroPresupuesto}`, 195, 32, { align: "right" });
        doc.text(`FECHA EMISIÓN: ${fechaPresupuesto}`, 195, 38, { align: "right" });
        doc.text(`CLIENTE: ${nombreCliente}`, 195, 44, { align: "right" });

        doc.setDrawColor(210, 210, 210);
        doc.setLineWidth(0.3);
        doc.line(15, 55, 195, 55);

        let yGarantia = 65;

        // SECCIÓN APLICA
        doc.setFillColor(239, 239, 239);
        doc.rect(15, yGarantia, 180, 7.5, "FD");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text("1. APLICACIÓN Y COBERTURA DE LA GARANTÍA", 19, yGarantia + 5);

        yGarantia += 12;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);

        const textoAplica = datos.garantiaAplica || 
            "La presente garantía cubre fallas de ejecución, defectos de instalación o vicios ocultos derivados exclusivamente de la mano de obra aplicada en los trabajos especificados en el comprobante principal.\n\n" +
            "• Cobertura de mano de obra: 12 meses a partir de la entrega de obra.\n" +
            "• Vicios ocultos o fallas estructurales directas derivadas de la ejecución realizada por el equipo técnico.";

        const lineasAplica = doc.splitTextToSize(textoAplica, 172);
        doc.text(lineasAplica, 19, yGarantia);

        // SECCIÓN EXCLUSIONES
        yGarantia += (lineasAplica.length * 4.5) + 10;

        doc.setFillColor(239, 239, 239);
        doc.rect(15, yGarantia, 180, 7.5, "FD");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("2. EXCLUSIONES Y PÉRDIDA DE COBERTURA", 19, yGarantia + 5);

        yGarantia += 12;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);

        const textoExclusiones = datos.garantiaExclusiones || 
            "La garantía perderá validez de forma automática bajo las siguientes condiciones:\n\n" +
            "• Intervención, reparación o modificación de las instalaciones por parte de terceros no autorizados.\n" +
            "• Daños derivados de mal uso, falta de mantenimiento preventivo, sobrecargas en la red eléctrica o factores climáticos extraordinarios.\n" +
            "• Fallas de fabricación, vicios de origen o deterioro natural de materiales/equipos provistos directamente por el cliente o terceros.";

        const lineasExclusiones = doc.splitTextToSize(textoExclusiones, 172);
        doc.text(lineasExclusiones, 19, yGarantia);

        dibujarPieDePagina();
    }

    const nombreFinalArchivo = `${esFactura ? 'Factura' : 'Presupuesto'}_${nroPresupuesto}_${nombreCliente.replace(/\s+/g, '_')}.pdf`;
    doc.save(nombreFinalArchivo);
};
