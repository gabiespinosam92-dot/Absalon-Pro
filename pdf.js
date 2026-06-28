/* ==========================================================
   ABSALON PRO
   modules/pdf.js
   Sprint 8.9 - Formato Profesional con IVA y Logotipo
========================================================== */

export const generar = (presupuesto) => {
    console.log("PDF: Iniciando generación...", presupuesto);

    if (typeof window.jspdf === 'undefined') {
        console.error("jsPDF no está cargado.");
        alert("⚠️ Error: jsPDF no está disponible en el navegador.");
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Función interna para dibujar el contenido después de procesar el logo
    const construirDocumento = (imgBase64 = null) => {
        // --- LOGO Y ENCABEZADO ---
        if (imgBase64) {
            try {
                // Posición del logo (X: 15, Y: 12, Ancho: 30, Alto: 25)
                doc.addImage(imgBase64, 'PNG', 15, 12, 30, 25);
            } catch (e) {
                console.error("Error al renderizar el logo en el PDF:", e);
            }
        }

        // Datos del Emisor (Alineados a la derecha del logo)
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("GABRIEL ABSALON", 50, 20);
        doc.setFontSize(12);
        doc.text("REFRIGERACIÓN", 50, 26);
        
        // Cuadro Tipo "X" / Título de Presupuesto
        doc.setLineWidth(0.5);
        doc.rect(145, 12, 50, 16);
        doc.setFontSize(14);
        doc.text("PRESUPUESTO", 148, 19);
        doc.setFontSize(16);
        doc.text("X", 168, 25);

        // --- DATOS DEL COMPROBANTE Y CLIENTE ---
        doc.setDrawColor(200, 200, 200);
        doc.line(15, 42, 195, 42); // Línea divisoria

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        
        // Fecha invertida a formato tradicional DD/MM/AAAA si viene YYYY-MM-DD
        const fechaFormateada = presupuesto.fecha ? presupuesto.fecha.split("-").reverse().join("/") : "";
        doc.text(`FECHA: ${fechaFormateada}`, 15, 49);
        doc.text(`CLIENTE: ${presupuesto.cliente}`, 15, 55);
        
        // Datos adicionales del cliente provistos por el entorno o por defecto
        const direccionCli = presupuesto.clienteDireccion || "Av. Paraguay 205";
        const telefonoCli = presupuesto.clienteTelefono || "3794544833";
        const cuitCli = presupuesto.clienteCuit || "30-71804533-5";
        
        doc.text(`DIRECCIÓN: ${direccionCli}`, 15, 61);
        doc.text(`TELÉFONO: ${telefonoCli}`, 120, 55);
        doc.text(`CUIL/CUIT: ${cuitCli}`, 120, 61);

        doc.line(15, 67, 195, 67); // Línea divisoria

        // --- TABLA DE ITEMS (Encabezados) ---
        let currentY = 74;
        doc.setFont("helvetica", "bold");
        doc.text("CANTIDAD", 15, currentY);
        doc.text("PRODUCTO / DESCRIPCIÓN", 40, currentY);
        doc.text("PRECIO", 115, currentY);
        doc.text("IVA (21%)", 145, currentY);
        doc.text("TOTAL", 175, currentY);
        
        currentY += 4;
        doc.line(15, currentY, 195, currentY);
        currentY += 6;
        
        doc.setFont("helvetica", "normal");

        let totalIvaAcumulado = 0;
        let totalNetoAcumulado = 0;

        // --- RENDERIZADO DE ITEMS ---
        presupuesto.items.forEach(item => {
            const cantidad = Number(item.cantidad || 1);
            const precioUnitario = Number(item.precio || 0);
            
            // Cálculos basados en la estructura del presupuesto modelo
            const subtotalNeto = precioUnitario * cantidad;
            const ivaItem = subtotalNeto * 0.21;
            const totalConIva = subtotalNeto + ivaItem;

            totalNetoAcumulado += subtotalNeto;
            totalIvaAcumulado += ivaItem;

            doc.text(String(cantidad), 20, currentY, { align: "center" });
            
            // Control de texto largo en descripción para que no se superponga
            const descCorta = item.nombre.length > 38 ? item.nombre.substring(0, 35) + "..." : item.nombre;
            doc.text(descCorta, 40, currentY);
            
            doc.text(`$ ${precioUnitario.toLocaleString("es-AR", { minimumFractionDigits: 0 })}`, 115, currentY);
            doc.text(`$ ${ivaItem.toLocaleString("es-AR", { minimumFractionDigits: 0 })}`, 145, currentY);
            doc.text(`$ ${subtotalNeto.toLocaleString("es-AR", { minimumFractionDigits: 0 })}`, 175, currentY);
            
            currentY += 8;
        });

        doc.line(15, currentY, 195, currentY);
        currentY += 6;

        // --- TOTALES DE TABLA ---
        doc.setFont("helvetica", "bold");
        doc.text("TOTAL", 40, currentY);
        doc.text(`$ ${totalIvaAcumulado.toLocaleString("es-AR", { minimumFractionDigits: 0 })}`, 145, currentY);
        doc.text(`$ ${totalNetoAcumulado.toLocaleString("es-AR", { minimumFractionDigits: 0 })}`, 175, currentY);

        // --- PIE DE PÁGINA COMERCIAL ---
        currentY += 15;
        doc.setFontSize(11);
        doc.text("ALIAS: GABRIEL.ABSALON", 15, currentY);
        
        doc.setFontSize(13);
        const granTotalFinal = totalNetoAcumulado + totalIvaAcumulado;
        doc.text(`TOTAL A PAGAR: $ ${granTotalFinal.toLocaleString("es-AR", { minimumFractionDigits: 0 })}`, 115, currentY);

        // Leyenda legal y de condiciones de contratación
        currentY += 12;
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        const textoCondiciones = "RECUERDE QUE LOS PRESUPUESTOS TIENEN UN PLAZO DE 15 DIAS Y PARA CONFIRMAR SE ABONA UNA SEÑA DEL 50%.";
        // Envoltura de texto por seguridad de márgenes
        const lineasLeyenda = doc.splitTextToSize(textoCondiciones, 175);
        doc.text(lineasLeyenda, 15, currentY);

        // Datos del taller / pie fijo
        currentY += 12;
        doc.setFont("helvetica", "normal");
        doc.text("CARLOS GARDEL 1420", 15, currentY);
        doc.text("CEL: 3624884054", 85, currentY);
        doc.text("RESISTENCIA - CHACO", 145, currentY);

        // Guardar el archivo generado
        doc.save(`Presupuesto_${presupuesto.numero}.pdf`);
    };

    // --- PROCESAMIENTO AUTOMÁTICO DE LA IMAGEN DEL LOGO ---
    const img = new Image();
    img.src = "logo sin fondo.png"; // Referencia exacta al recurso local
    
    img.onload = function() {
        const canvas = document.createElement("canvas");
        canvas.width = this.width;
        canvas.height = this.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(this, 0, 0);
        const dataURL = canvas.toDataURL("image/png");
        construirDocumento(dataURL);
    };

    img.onerror = function() {
        console.warn("No se pudo cargar 'logo sin fondo.png', generando PDF con estructura de texto solamente.");
        construirDocumento(null);
    };
}