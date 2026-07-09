/* ==========================================================
   ABSALON PRO
   MÓDULO EXPORTADOR: LISTA DE COMPRAS PDF (PAGINACIÓN Y DISEÑO PURO)
========================================================== */

export const exportarListaComprasPDF = async (datos) => {
    // 1. Carga limpia de la librería jsPDF (Igual a tu pdf.js)
    if (typeof window.jspdf === "undefined") {
        try {
            await import("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
        } catch (e) {
            console.error("No se pudo cargar la librería jsPDF", e);
            alert("⚠️ Error: No se pudo cargar el motor jsPDF.");
            return;
        }
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
    });

    const fechaFormateada = datos.fecha ? datos.fecha.split("-").reverse().join("/") : new Date().toLocaleDateString("es-AR");
    const clienteNombre = datos.clienteNombre || "Particular";
    const clienteDireccion = datos.clienteDireccion || "S/D";
    const clienteTelefono = datos.clienteTelefono || "S/D";
    const listaMateriales = datos.materiales || [];
    const listaManoObra = datos.manoObra || [];

    // ==========================================
    // ENCABEZADO CORPORATIVO
    // ==========================================
    doc.setFillColor(16, 78, 46); // Verde Absalon
    doc.rect(0, 0, 210, 8, "F");

    // Intentar pintar el logo si existe, si no, deja el espacio limpio
    try {
        doc.addImage("./logo_2.png", "PNG", 15, 15, 25, 15);
    } catch (e) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(16, 78, 46);
        doc.text("GABRIEL ABSALON", 15, 23);
    }

    // Título del reporte técnico
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(16, 78, 46);
    doc.text("LISTA DE COMPRAS Y MATERIALES", 110, 22);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Fecha Emisión: ${fechaFormateada}`, 110, 27);

    // Línea divisoria superior
    doc.setDrawColor(16, 78, 46);
    doc.setLineWidth(0.5);
    doc.line(15, 33, 195, 33);

    // ==========================================
    // BLOQUE DE DATOS COMERCIALES / OBRA
    // ==========================================
    doc.setFillColor(248, 250, 252);
    doc.rect(15, 37, 85, 22, "F");
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.rect(15, 37, 85, 22, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(16, 78, 46);
    doc.text("RESPONSABLE OPERATIVO:", 18, 41);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 41, 59);
    doc.text("Técnico: Gabriel Absalon", 18, 45);
    doc.text("M.M.O. / Climatización", 18, 49);
    doc.text("Resistencia, Chaco", 18, 53);
    doc.text("Cel: 362-4884054 o 362-4800993", 18, 57); 

    // Bloque Cliente/Obra
    doc.setFillColor(248, 250, 252);
    doc.rect(110, 37, 85, 22, "F");
    doc.rect(110, 37, 85, 22, "S");

    doc.setFont("helvetica", "bold");
    doc.setTextColor(16, 78, 46);
    doc.text("DESTINO / ASOCIADO A:", 113, 41);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 41, 60);
    doc.text(`Cliente: ${clienteNombre}`, 113, 47);
    doc.text(`Obra: ${clienteDireccion}`, 113, 51);
   
    let y = 68;

    // ==========================================
    // TABLA 1: MATERIALES E INSUMOS
    // ==========================================
    doc.setFillColor(16, 78, 46);
    doc.rect(15, y, 180, 6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(" MATERIALES REQUERIDOS PARA ACOPIO O CORRALÓN", 18, y + 4.5);

    y += 6;
    
    // Encabezados de tabla
    doc.setFillColor(241, 245, 249);
    doc.rect(15, y, 180, 6, "F");
    doc.setFont("helvetica", "bold");
    doc.setTextColor(51, 65, 85);
    doc.text("[ ]", 18, y + 4);
    doc.text("Cant.", 28, y + 4);
    doc.text("Descripción detallada del Insumo", 48, y + 4);

    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);

    if (listaMateriales.length === 0) {
        doc.text("No se encontraron líneas de materiales cargadas.", 20, y + 5);
        y += 8;
    } else {
        listaMateriales.forEach(m => {
            if (y > 250) { doc.addPage(); y = 20; } // Control de salto de página
            doc.text("O", 18, y + 5); // Casilla de verificación visual simplificada
            doc.setFont("helvetica", "bold");
            doc.text(String(m.cantidad), 28, y + 5);
            doc.setFont("helvetica", "normal");
            doc.text(String(m.concepto), 48, y + 5);
            
            doc.setDrawColor(241, 245, 249);
            doc.setLineWidth(0.1);
            doc.line(15, y + 7, 195, y + 7);
            y += 8;
        });
    }

    y += 4;

    // ==========================================
    // TABLA 2: TAREAS OPERATIVAS / PLAN DE TRABAJO
    // ==========================================
    if (y > 240) { doc.addPage(); y = 20; }
    
    doc.setFillColor(71, 85, 105); // Gris azulado institucional
    doc.rect(15, y, 180, 6, "F");
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text(" RENDIMIENTO OPERATIVO Y UNIDADES DE ACTIVIDAD", 18, y + 4.5);

    y += 6;

    doc.setFillColor(241, 245, 249);
    doc.rect(15, y, 180, 6, "F");
    doc.setFont("helvetica", "bold");
    doc.setTextColor(51, 65, 85);
    doc.text("[ ]", 18, y + 4);
    doc.text("Vol.", 28, y + 4);
    doc.text("Unidad", 43, y + 4);
    doc.text("Actividad / Rubro Técnico", 63, y + 4);

    y += 6;
    doc.setFont("helvetica", "normal");

    if (listaManoObra.length === 0) {
        doc.text("No se registraron rubros de mano de obra en este presupuesto.", 20, y + 5);
        y += 8;
    } else {
        listaManoObra.forEach(mo => {
            if (y > 250) { doc.addPage(); y = 20; }
            doc.text("O", 18, y + 5);
            doc.setFont("helvetica", "bold");
            doc.text(String(mo.cantidad), 28, y + 5);
            doc.setFont("helvetica", "normal");
            doc.text(String(mo.unidad), 43, y + 5);
            doc.text(String(mo.concepto), 63, y + 5);
            
            doc.setDrawColor(241, 245, 249);
            doc.setLineWidth(0.1);
            doc.line(15, y + 7, 195, y + 7);
            y += 8;
        });
    }

    // ==========================================
    // PIE DE PÁGINA REPORTE TÉCNICO
    // ==========================================
    const yPie = 265;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(15, yPie, 195, yPie);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text("* Documento estrictamente operativo para control de acopio logístico y materiales críticos estimados en obra. Omite valores monetarios.", 15, yPie + 4);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text("GABRIEL ABSALON - Servicio Técnico Integral", 15, yPie + 9);

    // Descarga directa del archivo
    doc.save(`Lista_Insumos_${clienteNombre.split(' ')[0]}.pdf`);
};