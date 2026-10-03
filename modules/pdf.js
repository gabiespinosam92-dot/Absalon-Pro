// pdf.js - Generador unificado de Presupuestos, Órdenes de Trabajo y Garantías
import { jsPDF } from "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";

export async function exportarPresupuestoPDF(datos) {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
    });

    // Detectar si es una Garantía o una Orden de Trabajo Finalizada
    const esGarantiaOFinalizado = datos.forzarGarantia || 
        ['finalizado', 'terminado', 't', 'aceptado'].includes(String(datos.estado || '').toLowerCase());

    // -------------------------------------------------------------------------
    // HOJA 1: PRESUPUESTO / ORDEN DE TRABAJO TERMINADO
    // -------------------------------------------------------------------------

    // 1. ENCABEZADO Y LOGO
    doc.setFillColor(16, 78, 46); // Verde Absalon (#104E2E)
    doc.rect(10, 10, 190, 25, "F");

    // Render del Logo / Isologo
    try {
        const logoData = datos.logoUrl || localStorage.getItem("absalon_logo_base64");
        if (logoData) {
            doc.addImage(logoData, "PNG", 14, 12, 20, 20);
        } else {
            doc.setFillColor(255, 255, 255);
            doc.roundedRect(14, 12, 20, 20, 2, 2, "F");
            doc.setTextColor(16, 78, 46);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);
            doc.text("GA", 19, 24);
        }
    } catch (e) {
        console.warn("No se pudo cargar el logo:", e);
    }

    // Texto Encabezado
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text("GABRIEL ABSALON", 38, 20);
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");
    doc.text("Servicios Técnicos Integrales | Resistencia - Chaco", 38, 26);

    // Título según el contexto del documento
    const tituloDoc = esGarantiaOFinalizado ? "ORDEN DE TRABAJO TERMINADO" : "PRESUPUESTO";
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(tituloDoc, 195, 20, { align: "right" });
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");
    doc.text(`N° ${datos.numero || datos.id || '---'}`, 195, 26, { align: "right" });

    // 2. DATOS DEL CLIENTE Y FECHA
    let y = 40;
    doc.setLineWidth(0.3);
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.rect(10, y, 190, 22, "FD");

    doc.setTextColor(51, 65, 85);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("CLIENTE:", 14, y + 7);
    doc.text("DIRECCIÓN:", 14, y + 15);

    doc.setFont("helvetica", "normal");
    doc.text(String(datos.clienteNombre || "Sin Nombre"), 34, y + 7);
    doc.text(String(datos.clienteDireccion || "-"), 34, y + 15);

    doc.setFont("helvetica", "bold");
    doc.text("TELÉFONO:", 118, y + 7);
    doc.text("FECHA:", 118, y + 15);

    doc.setFont("helvetica", "normal");
    doc.text(String(datos.clienteTelefono || "-"), 140, y + 7);
    doc.text(String(datos.fecha || new Date().toISOString().split("T")[0]), 140, y + 15);

    // 3. TABLA DE ÍTEMS Y TRABAJOS
    y += 27;
    doc.setFillColor(16, 78, 46);
    doc.rect(10, y, 190, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text("CANT.", 13, y + 5.5);
    doc.text("PRODUCTO / DESCRIPCIÓN", 32, y + 5.5);
    doc.text("PRECIO UNT.", 145, y + 5.5, { align: "right" });
    doc.text("TOTAL", 195, y + 5.5, { align: "right" });

    y += 8;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 41, 59);

    // Detección flexible de ítems (soporta distintas estructuras de presupuestos)
    const listaItems = (datos.items && datos.items.length > 0) ? datos.items :
                      (datos.detalles && datos.detalles.length > 0) ? datos.detalles :
                      (datos.conceptos && datos.conceptos.length > 0) ? datos.conceptos :
                      [{ cantidad: 1, descripcion: "Servicios Técnicos / Mano de Obra", precio: datos.totalGeneral || datos.total || 0 }];

    let sumaTotal = 0;

    listaItems.forEach((item, idx) => {
        const cant = Number(item.cantidad || item.cant || 1);
        const desc = String(item.descripcion || item.concepto || item.item || "Trabajo Realizado");
        const precioUnit = Number(item.precio || item.unitario || item.precioUnitario || 0);
        const subtotal = item.subtotal ? Number(item.subtotal) : (cant * precioUnit);
        sumaTotal += subtotal;

        if (idx % 2 === 0) {
            doc.setFillColor(248, 250, 252);
            doc.rect(10, y, 190, 7, "F");
        }

        doc.text(String(cant), 13, y + 5);
        doc.text(desc.substring(0, 65), 32, y + 5);
        doc.text(`$ ${precioUnit.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`, 145, y + 5, { align: "right" });
        doc.text(`$ ${subtotal.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`, 195, y + 5, { align: "right" });

        y += 7;
    });

    const totalCalculado = (datos.totalGeneral || datos.total) ? Number(datos.totalGeneral || datos.total) : sumaTotal;

    doc.setDrawColor(226, 232, 240);
    doc.line(10, y, 200, y);

    // 4. TOTALES
    y += 4;
    doc.setFillColor(241, 245, 249);
    doc.rect(115, y, 85, 11, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(16, 78, 46);
    doc.text("TOTAL A PAGAR:", 118, y + 7.5);
    doc.text(`$ ${totalCalculado.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`, 195, y + 7.5, { align: "right" });

    // 5. PIE DE PÁGINA DUAL
    y += 18;
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);

    if (esGarantiaOFinalizado) {
        // Modo Orden de Trabajo / Trabajo Terminado
        doc.setFont("helvetica", "bold");
        doc.text("ESTADO DEL SERVICIO:", 10, y);
        doc.setFont("helvetica", "normal");
        doc.text("Trabajo finalizado y cancelado en su totalidad.", 10, y + 5);
        y += 10;
    } else {
        // Modo Presupuesto Convencional
        doc.setFont("helvetica", "bold");
        doc.text("CONDICIONES COMERCIALES:", 10, y);
        doc.setFont("helvetica", "normal");
        doc.text("Recuerde que los presupuestos tienen un plazo de 15 días y para confirmar se abona una seña del 50%.", 10, y + 5);
        y += 10;
    }

    doc.setFont("helvetica", "bold");
    doc.text("DATOS DE CONTACTO Y PAGO:", 10, y);
    doc.setFont("helvetica", "normal");
    doc.text("ALIAS: GABI.ESPINOSAM (MERCADO PAGO)", 10, y + 5);
    doc.text("CEL: 3624884054 | Carlos Gardel 1420 - Resistencia Chaco", 10, y + 10);

    // -------------------------------------------------------------------------
    // HOJA 2: HOJA DE COBERTURA / GARANTÍA (SI CORRESPONDE)
    // -------------------------------------------------------------------------
    if (datos.garantiaAplica || datos.forzarGarantia) {
        doc.addPage();

        // Encabezado Hoja 2
        doc.setFillColor(16, 78, 46);
        doc.rect(10, 10, 190, 22, "F");

        // Isologo Hoja 2
        try {
            const logoData = datos.logoUrl || localStorage.getItem("absalon_logo_base64");
            if (logoData) {
                doc.addImage(logoData, "PNG", 14, 11, 18, 18);
            } else {
                doc.setFillColor(255, 255, 255);
                doc.roundedRect(14, 11, 18, 18, 2, 2, "F");
                doc.setTextColor(16, 78, 46);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(11);
                doc.text("GA", 18.5, 22);
            }
        } catch (e) {}

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("GABRIEL ABSALON", 36, 19);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text("Servicios Técnicos Integrales", 36, 25);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text("CERTIFICADO DE GARANTÍA", 195, 22, { align: "right" });

        // Ficha de Vinculación
        y = 37;
        doc.setFillColor(248, 250, 252);
        doc.rect(10, y, 190, 18, "F");
        doc.setDrawColor(226, 232, 240);
        doc.rect(10, y, 190, 18, "S");

        doc.setTextColor(51, 65, 85);
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "bold");
        doc.text("RESPONSABLE OPERATIVO:", 14, y + 6);
        doc.text("ASOCIADO A PRESUPUESTO / OT:", 14, y + 12);

        doc.setFont("helvetica", "normal");
        doc.text("Gabriel Absalon | M.M.O.", 60, y + 6);
        doc.text(String(datos.numero || datos.id || "---"), 65, y + 12);

        doc.setFont("helvetica", "bold");
        doc.text("CLIENTE:", 120, y + 6);
        doc.text("FECHA EMISIÓN:", 120, y + 12);

        doc.setFont("helvetica", "normal");
        doc.text(String(datos.clienteNombre || "Sin Nombre"), 137, y + 6);
        doc.text(String(datos.fecha || new Date().toISOString().split("T")[0]), 148, y + 12);

        // Bloque 1: Alcance
        y += 24;
        doc.setFillColor(16, 78, 46);
        doc.rect(10, y, 190, 6, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.text("1. ALCANCE Y CONDICIONES DE APLICACIÓN DE LA GARANTÍA", 13, y + 4.2);

        y += 9;
        doc.setTextColor(30, 41, 59);
        doc.setFont("helvetica", "normal");
        const lineasAplica = doc.splitTextToSize(datos.garantiaAplica || "Sin especificaciones de alcance.", 185);
        doc.text(lineasAplica, 12, y);

        y += (lineasAplica.length * 4.5) + 6;

        // Bloque 2: Exclusiones
        doc.setFillColor(16, 78, 46);
        doc.rect(10, y, 190, 6, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.text("2. EXCLUSIONES Y PÉRDIDA DE COBERTURA", 13, y + 4.2);

        y += 9;
        doc.setTextColor(30, 41, 59);
        doc.setFont("helvetica", "normal");
        const lineasExclusiones = doc.splitTextToSize(datos.garantiaExclusiones || "Sin exclusiones registradas.", 185);
        doc.text(lineasExclusiones, 12, y);

        // Pie Hoja 2
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text("GABRIEL ABSALON - Servicios Técnicos Integrales | CEL: 3624884054 | Carlos Gardel 1420 - Resistencia Chaco", 10, 285);
    }

    // Nombre de archivo según tipo de documento
    const nombreLimpio = String(datos.clienteNombre || "Cliente").replace(/[^a-zA-Z0-9]/g, "_");
    const prefijoArchivo = esGarantiaOFinalizado ? "Orden_Trabajo" : "Presupuesto";
    doc.save(`${prefijoArchivo}_${datos.numero || datos.id || '00'}_${nombreLimpio}.pdf`);
}
