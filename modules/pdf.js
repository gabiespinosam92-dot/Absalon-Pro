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

    // Mapeo seguro con los nombres exactos que envía tu presupuestos.js
    const nroPresupuesto = datos.numero || "S/N";
    const fechaPresupuesto = datos.fecha || "";
    const nombreCliente = datos.clienteNombre || "";
    const dirCliente = datos.clienteDireccion || "";
    const telCliente = datos.clienteTelefono || "";
    const docTipo = datos.clienteTipoDoc || "CUIL/CUIT";
    const docNum = datos.clienteNumDoc || "";

    // Identificación del prefijo de estado
    const prefijo = String(nroPresupuesto).toUpperCase().charAt(0);
    const esFinalizado = prefijo === "T";
    const esEnviado = prefijo === "E";
    const esBorrador = prefijo === "B";

    // =========================================================================
    // ASIGNACIÓN DE VALORES (Extraídos directo de las cuentas de presupuestos.js)
    // =========================================================================
    const matNeto = Number(datos.totalMaterialesNeto || 0);
    const matIva = Number(datos.ivaMateriales || (matNeto * 0.21));
    const matTotal = matNeto + matIva;

    // Totales acumulados generales
    const columnaTotalNeto = Number(datos.columnaTotalNeto || 0);
    const columnaTotalIva = Number(datos.columnaTotalIva || 0);
    const granTotalFinal = Number(datos.totalAPagarFinal || (columnaTotalNeto + columnaTotalIva));

    // ==========================================
    // 1. ENCABEZADO
    // ==========================================
    if (datos.logo) {
        try {
            doc.addImage(datos.logo, "PNG", 15, 15, 46, 29);
        } catch (e) {
            console.warn("No se pudo cargar el logo en el PDF", e);
        }
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text("Servicio Técnico Integral", 15, 47);
    doc.text("Resistencia - Chaco", 15, 51);

    // Título y número del presupuesto (Derecha) - Negro Pleno
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(0, 0, 0); 
    doc.text("PRESUPUESTO", 195, 25, { align: "right" });

    doc.setFont("monospace", "bold");
    doc.setFontSize(14);
    doc.setTextColor(50, 50, 50);
    doc.text(String(nroPresupuesto), 195, 32, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`FECHA: ${fechaPresupuesto}`, 195, 40, { align: "right" });

    // Línea de separación superior
    doc.setDrawColor(210, 210, 210);
    doc.setLineWidth(0.3);
    doc.line(15, 55, 195, 55);

    // ==========================================
    // 2. RECUADRO DE DATOS DEL CLIENTE
    // ==========================================
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

    // ==========================================
    // 3. TABLA DE ITEMS DIBUJADA EN EL CUERPO
    // ==========================================
    let y = 83;

    // Encabezados de la tabla
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

    // Generador dinámico de filas
    const agregarFilaTabla = (cant, descripcion, neto, iva, total) => {
        y += 7.5;
        doc.setFillColor(255, 255, 255);
        doc.rect(15, y, 180, 7.5, "S");
        
        doc.setFont("helvetica", "normal");
        doc.text(String(cant), 21, y + 5, { align: "center" });
        
        // Truncar descripción si es muy larga para evitar montados
        const descTexto = String(descripcion).length > 48 
            ? String(descripcion).substring(0, 45) + "..." 
            : String(descripcion);
            
        doc.text(descTexto, 32, y + 5);
        
        doc.text(neto ? `$ ${formato(neto)}` : "", 125, y + 5, { align: "right" });
        doc.text(iva ? `$ ${formato(iva)}` : "", 158, y + 5, { align: "right" });
        doc.text(total ? `$ ${formato(total)}` : "", 192, y + 5, { align: "right" });
    };

    // 1. Agregamos fila general de Materiales si existe
    if (matNeto > 0) {
        agregarFilaTabla("1", "Materiales", matNeto, matIva, matTotal);
    }

    // 2. DETALLE DINÁMICO DE SERVICIOS TÉCNICOS / MANO DE OBRA
    const moItems = datos.manoObraItems || [];
    if (moItems.length > 0) {
        moItems.forEach(item => {
            const itemNeto = Number(item.total || 0);
            const itemIva = itemNeto * 0.21;
            const itemTotal = itemNeto + itemIva;
            
            // Muestra la cantidad + unidad + nombre exacto (Ej: "17 Metro - Mano de Obra Revestimiento Omega")
            const cantMostrar = `${item.cantidad || 1}`;
            const descMostrar = `${item.concepto || item.descripcion}`;

            agregarFilaTabla(cantMostrar, descMostrar, itemNeto, itemIva, itemTotal);
        });
    } else if (matNeto === 0) {
        // En caso de que no haya ni materiales ni tareas cargadas
        agregarFilaTabla("1", "Servicios Técnicos / Mano de Obra", 0, 0, 0);
    }

    // Fila de Totales generales
    y += 7.5;
    doc.setFillColor(248, 248, 248);
    doc.rect(15, y, 180, 7.5, "FD");
    doc.setFont("helvetica", "bold");
    doc.text("TOTALES", 32, y + 5);
    doc.text(`$ ${formato(columnaTotalNeto)}`, 125, y + 5, { align: "right" });
    doc.text(`$ ${formato(columnaTotalIva)}`, 158, y + 5, { align: "right" });
    doc.text(`$ ${formato(granTotalFinal)}`, 192, y + 5, { align: "right" });

    // Líneas divisorias de columnas internas
    const limitesColumnas = [30, 128, 161];
    limitesColumnas.forEach(colX => {
        doc.line(colX, 83, colX, y + 7.5);
    });

    // ==========================================
    // 4. TIEMPO DE EJECUCIÓN Y RECUADRO DE PAGO
    // ==========================================
    y += 12;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    
    const tCant = datos.tiempoCant || "1";
    const tTexto = datos.tiempoUnidadTexto || "uno";
    const tPlural = datos.tiempoUnidadPlural || "DIA";
    doc.text(`EL TIEMPO DE EJECUCION SERIA DE ${tCant} (${tTexto}) ${tPlural}.`.toUpperCase(), 15, y);

    // Contenedor destacado del total definitivo
    y += 5;
    doc.setLineWidth(0.35);
    doc.rect(15, y, 180, 15);
    doc.setFontSize(13);
    doc.text(`TOTAL A PAGAR: $ ${formato(granTotalFinal)}`, 19, y + 6);
    doc.setFontSize(10);
    doc.text("ALIAS: GABI.ESPINOSAM (MERCADO PAGO)", 19, y + 11.5);

    // =========================================================================
    // 5. SECCIÓN DINÁMICA DE OBSERVACIONES / GARANTÍAS / VACÍO POR BORRADOR
    // =========================================================================
    let yDinamica = y + 25;

    if (esFinalizado) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text("OBSERVACIONES Y GARANTÍAS", 15, yDinamica);
        
        doc.setLineWidth(0.25);
        doc.rect(15, yDinamica + 3, 180, 20);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        const textoGarantia = datos.garantiaTexto || datos.observaciones || "Trabajo finalizado de conformidad. Este servicio cuenta con la correspondiente garantía técnica de ejecución sobre las tareas detalladas.";
        
        const lineasGarantia = doc.splitTextToSize(textoGarantia, 172);
        doc.text(lineasGarantia, 19, yDinamica + 9);

    } else if (esEnviado) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text("DETALLES / OBSERVACIONES DEL ENVÍO", 15, yDinamica);
        
        doc.setLineWidth(0.25);
        doc.rect(15, yDinamica + 3, 180, 20);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        const textoEnvio = datos.observaciones || "Escribí aquí términos de validez, aclaraciones del servicio o formas de pago...";
        
        const lineasEnvio = doc.splitTextToSize(textoEnvio, 172);
        doc.text(lineasEnvio, 19, yDinamica + 9);

    } else if (esBorrador) {
        console.log("Estado Borrador detectado: Espacio intermedio limpio.");
    }

    // ==========================================
    // 6. PIE DE PÁGINA ABSOLUTO
    // ==========================================
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

    doc.setDrawColor(0, 0, 0);
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

    // Descarga directa del archivo
    const nombreFinalArchivo = `Presupuesto_${nroPresupuesto}_${nombreCliente.replace(/\s+/g, '_')}.pdf`;
    doc.save(nombreFinalArchivo);
};
