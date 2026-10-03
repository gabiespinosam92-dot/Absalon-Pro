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

    // Detectamos si es una emisión explícita de Garantía
    const esGarantia = Boolean(datos.forzarGarantia);

    // ==========================================
    // 1. ENCABEZADO E IDENTIDAD VISUAL (MEMBRETE)
    // ==========================================
    
    // Isologotipo / Marca institucional
    doc.setFillColor(16, 78, 46); // Verde Institucional #104E2E
    
    // Si tenés el logo cargado en Base64 o preferís renderizar el isotipo vectorizado
    if (datos.logoBase64) {
        try {
            doc.addImage(datos.logoBase64, 'PNG', 14, 10, 50, 22);
        } catch (e) {
            dibujarIsotipoVectorial(doc, 14, 10);
        }
    } else {
        dibujarIsotipoVectorial(doc, 14, 10);
    }

    // Texto de la Empresa
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("GABRIEL ABSALON", 50, 18);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("Servicio Técnico Integral", 50, 24);
    doc.text("Resistencia - Chaco", 50, 29);

    // Línea divisora verde bajo membrete
    doc.setDrawColor(16, 78, 46);
    doc.setLineWidth(1);
    doc.line(14, 33, 196, 33);

    // ==========================================
    // 2. BLOQUE DE CLIENTE Y DOCUMENTO
    // ==========================================
    let yPos = 40;

    // Caja de datos del Cliente y Documento
    doc.setFillColor(245, 247, 245);
    doc.rect(14, yPos, 182, 28, "F");
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.2);
    doc.rect(14, yPos, 182, 28, "S");

    // Nombre del Cliente obligatorio
    const clienteNombre = datos.clienteNombre || datos.cliente || "Cliente No Especificado";

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(16, 78, 46);
    doc.text("CLIENTE:", 18, yPos + 7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(clienteNombre.toUpperCase(), 38, yPos + 7);

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(16, 78, 46);
    doc.text("DIRECCIÓN:", 18, yPos + 14);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(datos.clienteDireccion || datos.direccion || "-", 38, yPos + 14);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(16, 78, 46);
    doc.text("TELÉFONO:", 18, yPos + 21);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(datos.clienteTelefono || datos.telefono || "-", 38, yPos + 21);

    // Datos del comprobante a la derecha
    const numComprobante = datos.numero || `OT-${Date.now().toString().slice(-6)}`;
    const fechaEmision = datos.fecha || new Date().toLocaleDateString("es-AR");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(16, 78, 46);
    doc.text(esGarantia ? "CERTIFICADO DE GARANTÍA" : "PRESUPUESTO", 192, yPos + 8, { align: "right" });
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`N° ${numComprobante}`, 192, yPos + 14, { align: "right" });
    
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(`FECHA: ${fechaEmision}`, 192, yPos + 20, { align: "right" });

    yPos += 35;

    // ==========================================
    // 3. CONTENIDO: GARANTÍA O PRESUPUESTO
    // ==========================================
    if (esGarantia) {
        // RENDERIZADO EXCLUSIVO DE CERTIFICADO DE GARANTÍA
        doc.setFillColor(16, 78, 46);
        doc.rect(14, yPos, 182, 8, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.text("TERMINOS Y COBERTURA TÉCNICA DE LA GARANTÍA", 18, yPos + 5.5);

        yPos += 14;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(40, 40, 40);

        const textoGarantia = datos.garantiaAplica || datos.textoGarantia || 
            `La presente garantía cubre la mano de obra aplicada y/o instalación realizada para el cliente ${clienteNombre}, bajo las condiciones y especificaciones de las normas técnicas vigentes. Validez de cobertura según la hoja de trabajo.`;

        const lineasTexto = doc.splitTextToSize(textoGarantia, 178);
        doc.text(lineasTexto, 16, yPos);
        yPos += (lineasTexto.length * 5) + 10;

        // Cuadro de exclusiones
        doc.setFillColor(250, 250, 250);
        doc.setDrawColor(200, 200, 200);
        doc.rect(14, yPos, 182, 35, "FD");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(180, 40, 40);
        doc.text("EXCLUSIONES Y PÉRDIDA DE COBERTURA:", 18, yPos + 7);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(60, 60, 60);
        doc.text("• Intervención o modificación de las instalaciones por parte de terceros no autorizados.", 18, yPos + 14);
        doc.text("• Daños provocados por mal uso, sobrecargas eléctricas o factores climáticos extremos.", 18, yPos + 20);
        doc.text("• Desgaste natural de insumos o materiales provistos directamente por el cliente.", 18, yPos + 26);

        yPos += 45;

    } else {
        // RENDERIZADO DE TABLA DE PRESUPUESTO CONVENCIONAL
        doc.setFillColor(16, 78, 46);
        doc.rect(14, yPos, 182, 7, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(255, 255, 255);
        doc.text("CANT.", 16, yPos + 5);
        doc.text("PRODUCTO / DESCRIPCIÓN", 35, yPos + 5);
        doc.text("PRECIO", 130, yPos + 5, { align: "right" });
        doc.text("TOTAL", 192, yPos + 5, { align: "right" });

        yPos += 9;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);

        const items = datos.items || datos.detalles || [];
        items.forEach((item) => {
            doc.text(String(item.cantidad || 1), 16, yPos);
            doc.text(String(item.descripcion || item.producto || ""), 35, yPos);
            doc.text(`$ ${formato(item.precio || item.precioUnitario)}`, 130, yPos, { align: "right" });
            doc.text(`$ ${formato(item.total || (item.cantidad * item.precio))}`, 192, yPos, { align: "right" });
            yPos += 6;
        });

        // Totales
        yPos += 5;
        doc.setLineWidth(0.5);
        doc.line(14, yPos, 196, yPos);
        yPos += 6;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(`TOTAL A PAGAR: $ ${formato(datos.total)}`, 192, yPos, { align: "right" });
        yPos += 15;
    }

    // ==========================================
    // 4. PIE DE PÁGINA Y FIRMA TÉCNICA
    // ==========================================
    const pageHeight = doc.internal.pageSize.height;
    const pieY = pageHeight - 30;

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(14, pieY, 196, pieY);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(16, 78, 46);
    doc.text("CONDICIONES Y RESPONSABILIDAD TÉCNICA:", 14, pieY + 5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text("TRABAJOS EJECUTADOS BAJO NORMAS TÉCNICAS VIGENTES Y COBERTURA DE GARANTÍA SEGÚN TÉRMINOS.", 14, pieY + 9);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text("GABRIEL ABSALON", 14, pieY + 16);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text("Servicios Técnicos Integrales | M.M.O.", 14, pieY + 20);
    doc.text("CEL: 3624884054  |  Carlos Gardel 1420 - Resistencia Chaco", 14, pieY + 24);

    // Guardar archivo con nombre personalizado
    const nombreLimpio = clienteNombre.toLowerCase().replace(/[^a-z0-9]/g, "_");
    const prefijo = esGarantia ? "Garantia" : "Presupuesto";
    doc.save(`${prefijo}_${numComprobante}_${nombreLimpio}.pdf`);
};

// Función auxiliar para dibujar la casa/isologotipo si no se pasa imagen Base64
function dibujarIsotipoVectorial(doc, x, y) {
    doc.setFillColor(16, 78, 46);
    // Polígono del techo / estructura de la casa
    doc.triangle(x + 12, y, x, y + 10, x + 24, y + 10, "F");
    doc.rect(x + 3, y + 10, 18, 12, "F");
    doc.setFillColor(255, 255, 255);
    // Cruz interior blanca estilo M.M.O. / arquitectura
    doc.rect(x + 11, y + 10, 2, 12, "F");
    doc.rect(x + 3, y + 15, 18, 2, "F");
}

export default exportarPresupuestoPDF;
