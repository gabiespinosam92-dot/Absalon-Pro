/* ==========================================================
   ABSALON PRO - MÓDULO PDF UNIFICADO (PRESUPUESTOS, GARANTÍAS Y RECIBOS)
========================================================== */

export const exportarPresupuestoPDF = async (datos) => {
    if (typeof window.jspdf === "undefined") {
        try {
            await import("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
        } catch (e) {
            console.error("No se pudo cargar la librería jsPDF", e);
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
    const fechaPresupuesto = datos.fecha || "";
    const nombreCliente = datos.clienteNombre || "";
    const dirCliente = datos.clienteDireccion || "";
    const telCliente = datos.clienteTelefono || "";
    const docTipo = datos.clienteTipoDoc || "CUIL/CUIT";
    const docNum = datos.clienteNumDoc || "";

    const esRecibo = datos.esRecibo || false;

    // ==========================================
    // PIE DE PÁGINA (CONFIGURABLE SEGÚN RECIBO)
    // ==========================================
    const dibujarPieDePagina = (esDocumentoRecibo = false) => {
        const yPie = 260; 

        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.25);
        doc.line(15, yPie, 195, yPie);

        if (!esDocumentoRecibo) {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9);
            doc.text("CONDICIONES COMERCIALES:", 15, yPie + 5);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(8.5);
            doc.text("RECUERDE QUE LOS PRESUPUESTOS TIENEN UN PLAZO DE 15 DIAS Y PARA CONFIRMAR SE ABONA UNA SEÑA DEL 50%.", 15, yPie + 9);

            doc.setLineWidth(0.5);
            doc.line(15, yPie + 14, 195, yPie + 14);
        }

        const offsetFirma = esDocumentoRecibo ? 5 : 18;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("GABRIEL ABSALON", 15, yPie + offsetFirma);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        doc.text("Servicios Técnicos Integrales", 15, yPie + offsetFirma + 4);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(0, 0, 0);
        doc.text("CEL: 3624884054", 195, yPie + offsetFirma, { align: "right" });
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text("Carlos Gardel 1420 - Resistencia Chaco", 195, yPie + offsetFirma + 4, { align: "right" });
    };

    // ==========================================
    // DISEÑO ESPECÍFICO PARA RECIBO DE DINERO
    // ==========================================
    if (esRecibo) {
        if (datos.logo) {
            try { doc.addImage(datos.logo, "PNG", 15, 15, 46, 29); } catch (e) {}
        }

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text("Servicio Técnico Integral", 15, 47);
        doc.text("Resistencia - Chaco", 15, 51);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(0, 0, 0); 
        doc.text("RECIBO", 195, 25, { align: "right" });

        doc.setFont("monospace", "bold");
        doc.setFontSize(13);
        doc.setTextColor(50, 50, 50);
        doc.text(`REF: ${nroPresupuesto}`, 195, 32, { align: "right" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`FECHA EMISIÓN: ${fechaPresupuesto}`, 195, 40, { align: "right" });

        doc.setDrawColor(210, 210, 210);
        doc.setLineWidth(0.3);
        doc.line(15, 55, 195, 55);

        // Datos del cliente
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.text("CLIENTE:", 15, 65);
        doc.text("DIRECCIÓN:", 15, 72);
        doc.text("TELÉFONO:", 15, 79);

        doc.setFont("helvetica", "normal");
        doc.text(String(nombreCliente), 35, 65);
        doc.text(String(dirCliente), 39, 72);
        doc.text(String(telCliente), 38, 79);

        if (docNum) {
            doc.setFont("helvetica", "bold");
            doc.text(`${docTipo}:`, 130, 65);
            doc.setFont("helvetica", "normal");
            doc.text(String(docNum), 152, 65);
        }

        // Bloque central del Recibo
        let yRecibo = 95;
        doc.setFillColor(245, 247, 245);
        doc.rect(15, yRecibo, 180, 85, "FD");
        doc.setDrawColor(200, 200, 200);
        doc.rect(15, yRecibo, 180, 85, "S");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(16, 78, 46);
        doc.text("COMPROBANTE DE PAGO", 21, yRecibo + 10);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text(`Monto Recibido:`, 21, yRecibo + 25);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(14);
        doc.text(`$ ${formato(datos.montoRecibido)}`, 60, yRecibo + 25);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(`Medio de Pago:`, 21, yRecibo + 38);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.text(`${datos.medioPago}`, 60, yRecibo + 38);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(`Aclaración:`, 21, yRecibo + 52);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        
        const lineasAclaracion = doc.splitTextToSize(datos.aclaracion || "Sin observaciones adicionales.", 130);
        doc.text(lineasAclaracion, 21, yRecibo + 60);

        dibujarPieDePagina(true);

        const nombreArchivoRecibo = `Recibo_${nroPresupuesto}_${nombreCliente.replace(/\s+/g, '_')}.pdf`;
        doc.save(nombreArchivoRecibo);
        return;
    }

    // ==========================================
    // FLUJO ESTÁNDAR (PRESUPUESTO / ORDEN / FACTURA)
    // ==========================================
    const esFinalizado = prefijo === "T";
    const esFactura = datos.esFactura || false;
    const aplicarIva = datos.incluirIva !== undefined ? datos.incluirIva : true;

    const matNeto = Number(datos.totalMaterialesNeto || 0);
    const matIva = aplicarIva ? Number(datos.ivaMateriales || (matNeto * 0.21)) : 0;
    const matTotal = matNeto + matIva;

    const columnaTotalNeto = Number(datos.columnaTotalNeto || 0);
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

    y += 12;
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

    dibujarPieDePagina(false);

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

        doc.setFillColor(239, 239, 239);
        doc.rect(15, yGarantia, 180, 7.5, "FD");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text("1. ALCANCE Y CONDICIONES DE APLICACIÓN DE LA GARANTÍA", 19, yGarantia + 5);

        yGarantia += 12;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);

        const textoAplica = datos.garantiaAplica || 
            "La presente garantía cubre fallas de ejecución, defectos de ensamblado o vicios ocultos derivados exclusivamente de la mano de obra aplicada en los trabajos detallados en el comprobante principal. Esta cobertura posee una validez de 12 meses a partir de la fecha de entrega y conformidad de la obra.";

        const lineasAplica = doc.splitTextToSize(textoAplica, 172);
        doc.text(lineasAplica, 19, yGarantia);

        yGarantia += (lineasAplica.length * 5) + 12;

        doc.setFillColor(239, 239, 239);
        doc.rect(15, yGarantia, 180, 7.5, "FD");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("2. EXCLUSIONES Y PÉRDIDA DE COBERTURA", 19, yGarantia + 5);

        yGarantia += 12;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);

        const textoExclusiones = datos.garantiaExclusiones || 
            "Quedan expresamente excluidas de la garantía las siguientes situaciones:\n" +
            "• Intervención o modificación de las instalaciones por parte de terceros no autorizados.\n" +
            "• Daños provocados por mal uso, sobrecargas eléctricas, humedad ajena a la estructura o factores climáticos extremos.\n" +
            "• Desgaste natural de insumos y materiales provistos directamente por el cliente.";

        const lineasExclusiones = doc.splitTextToSize(textoExclusiones, 172);
        doc.text(lineasExclusiones, 19, yGarantia);

        dibujarPieDePagina(false);
    }

    const nombreFinalArchivo = `${esFactura ? 'Factura' : 'Presupuesto'}_${nroPresupuesto}_${nombreCliente.replace(/\s+/g, '_')}.pdf`;
    doc.save(nombreFinalArchivo);
};
