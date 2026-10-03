export const exportarPresupuestoPDF = async (datos) => {
    // 1. Carga limpia de la librería jsPDF
    if (typeof window.jspdf === "undefined") {
        try {
            await import("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
        } catch (e) {
            console.error("No se pudo cargar la librería jsPDF", e);
            return;
        }
    }

    const { jsPDF } = window.jspdf;
    
    // Creación del lienzo A4 en milímetros
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
    });

    // Formateador local de moneda argentina
    const formato = (n) =>
        Number(n || 0).toLocaleString("es-AR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

    // Mapeo de datos recibidos
    const nroPresupuesto = datos.numero || "S/N";
    const fechaPresupuesto = datos.fecha || "";
    const nombreCliente = datos.clienteNombre || "";
    const dirCliente = datos.clienteDireccion || "";
    const telCliente = datos.clienteTelefono || "";
    const docTipo = datos.clienteTipoDoc || "CUIL/CUIT";
    const docNum = datos.clienteNumDoc || "";

    // Identificación del prefijo de estado
    const prefijo = String(nroPresupuesto).toUpperCase().charAt(0);
    const esFinalizado = prefijo === "T" || datos.forzarGarantia === true;
    const esFactura = datos.esFactura || false;

    // Obtención prioritaria del Logo (del objeto o del almacenamiento local)
    const logoData = datos.logo || localStorage.getItem("absalon_logo_base64") || localStorage.getItem("logo_base64");

    // Función global para el pie de página
    const dibujarPieDePagina = () => {
        const yPie = 260; 

        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.25);
        doc.line(15, yPie, 195, yPie);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        doc.text("CONDICIONES Y RESPONSABILIDAD TÉCNICA:", 15, yPie + 5);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.text("TRABAJOS EJECUTADOS BAJO NORMAS TÉCNICAS VIGENTES Y COBERTURA DE GARANTÍA SEGÚN TÉRMINOS.", 15, yPie + 9);

        doc.setLineWidth(0.5);
        doc.line(15, yPie + 14, 195, yPie + 14);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("GABRIEL ABSALON", 15, yPie + 20);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        doc.text("Servicios Técnicos Integrales | M.M.O.", 15, yPie + 24);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(0, 0, 0);
        doc.text("CEL: 3624884054", 195, yPie + 20, { align: "right" });
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text("Carlos Gardel 1420 - Resistencia Chaco", 195, yPie + 24, { align: "right" });
    };

    // =========================================================================
    // CASO A: SÓLO CERTIFICADO DE GARANTÍA (PARA TERMINADOS 'T' O GARANTÍAS)
    // =========================================================================
    if (esFinalizado) {
        // --- LOGO DESTACADO EN GARANTÍA ---
        if (logoData) {
            try {
                doc.addImage(logoData, "PNG", 15, 12, 46, 29);
            } catch (e) {
                console.warn("Error al renderizar el logo en la garantía:", e);
            }
        } else {
            // Isotipo fallback en verde corporativo
            doc.setFillColor(16, 78, 46);
            doc.roundedRect(15, 12, 22, 22, 2, 2, "F");
            doc.setTextColor(255, 255, 255);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);
            doc.text("GA", 20, 26);
        }

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text("RESPONSABLE OPERATIVO:", 15, 47);
        doc.text("Técnico: Gabriel Absalon | M.M.O.", 15, 51);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.setTextColor(16, 78, 46); 
        doc.text("CERTIFICADO DE GARANTÍA", 195, 25, { align: "right" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`N° TRABAJO / OT: ${nroPresupuesto}`, 195, 32, { align: "right" });
        doc.text(`FECHA EMISIÓN: ${fechaPresupuesto || new Date().toISOString().split("T")[0]}`, 195, 38, { align: "right" });
        doc.text(`CLIENTE: ${nombreCliente || 'Sin Especificar'}`, 195, 44, { align: "right" });

        doc.setDrawColor(210, 210, 210);
        doc.setLineWidth(0.3);
        doc.line(15, 55, 195, 55);

        // --- CUERPO DE GARANTÍA ---
        let yGarantia = 65;

        // SECCIÓN 1: ALCANCE
        doc.setFillColor(239, 239, 239);
        doc.rect(15, yGarantia, 180, 7.5, "FD");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text("1. ALCANCE Y CONDICIONES DE APLICACIÓN DE LA GARANTÍA", 19, yGarantia + 5);

        yGarantia += 12;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);

        const textoAplica = datos.garantiaAplica || datos.textoGarantia ||
            "La presente garantía cubre fallas de ejecución, defectos de ensamblado o vicios ocultos derivados exclusivamente de la mano de obra aplicada en los trabajos detallados en el comprobante principal. Esta cobertura posee una validez de 12 meses a partir de la fecha de entrega y conformidad de la obra.";

        const lineasAplica = doc.splitTextToSize(textoAplica, 172);
        doc.text(lineasAplica, 19, yGarantia);

        // SECCIÓN 2: EXCLUSIONES
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

        dibujarPieDePagina();

        doc.save(`Garantia_${nroPresupuesto}_${nombreCliente.replace(/\s+/g, '_')}.pdf`);
        return; // Salimos para que no genere la hoja de presupuesto
    }

    // =========================================================================
    // CASO B: PRESUPUESTOS (BORRADOR 'B' Y ENVIADO 'E')
    // =========================================================================
    const aplicarIva = datos.incluirIva !== undefined ? datos.incluirIva : true;

    const matNeto = Number(datos.totalMaterialesNeto || 0);
    const matIva = aplicarIva ? Number(datos.ivaMateriales || (matNeto * 0.21)) : 0;
    const matTotal = matNeto + matIva;

    const columnaTotalNeto = Number(datos.columnaTotalNeto || 0);
    const columnaTotalIva = aplicarIva ? Number(datos.columnaTotalIva || 0) : 0;
    const granTotalFinal = columnaTotalNeto + columnaTotalIva;

    // LOGO PRESUPUESTO
    if (logoData) {
        try {
            doc.addImage(logoData, "PNG", 15, 15, 46, 29);
        } catch (e) {
            console.warn("No se pudo cargar el logo en el PDF", e);
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

    // TABLA
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

    // Totales
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

    dibujarPieDePagina();

    const nombreFinalArchivo = `${esFactura ? 'Factura' : 'Presupuesto'}_${nroPresupuesto}_${nombreCliente.replace(/\s+/g, '_')}.pdf`;
    doc.save(nombreFinalArchivo);
};
