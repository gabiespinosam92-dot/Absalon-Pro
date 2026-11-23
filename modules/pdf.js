/* ==========================================================
   ABSALON PRO - MÓDULO PDF (DOCUMENTOS INDEPENDIENTES)
   - Presupuesto: solo Presupuesto
   - Recibo: solo Recibo
   - Garantía: solo Orden de Trabajo Terminado
========================================================== */

const cargarImagenBase64 = (src) => {
    return new Promise((resolve) => {
        if (!src) return resolve(null);
        if (src.startsWith("data:image")) return resolve(src);

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            try {
                const canvas = document.createElement("canvas");
                canvas.width = img.naturalWidth || img.width;
                canvas.height = img.naturalHeight || img.height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL("image/png"));
            } catch (e) {
                resolve(src);
            }
        };
        img.onerror = () => resolve(null);
        img.src = src;
    });
};

const obtenerJsPDF = async () => {
    if (typeof window.jspdf === "undefined") {
        await import("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
    }
    return window.jspdf.jsPDF;
};

const formato = (n) =>
    Number(n || 0).toLocaleString("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

const crearAyudantesDocumento = async (doc, datos = {}) => {
    const logoData = await cargarImagenBase64(datos.logo || "./logo_083121.png");

    const dibujarLogo = (x = 15, y = 15, w = 46, h = 29) => {
        if (!logoData) return;
        try {
            const formatoImg = logoData.includes("image/jpeg") ? "JPEG" : "PNG";
            doc.addImage(logoData, formatoImg, x, y, w, h);
        } catch (e) {
            console.warn("No se pudo insertar el logo en el PDF:", e);
        }
    };

    const dibujarEncabezadoEmpresa = () => {
        dibujarLogo(15, 15, 46, 29);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text("Servicio Técnico Integral", 15, 47);
        doc.text("Resistencia - Chaco", 15, 51);
    };

    const dibujarPieDePagina = (incluirCondicionesComerciales = false) => {
        const yPie = 260;

        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.25);
        doc.line(15, yPie, 195, yPie);

        if (incluirCondicionesComerciales) {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9);
            doc.setTextColor(0, 0, 0);
            doc.text("CONDICIONES COMERCIALES:", 15, yPie + 5);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(8.5);
            doc.text(
                "RECUERDE QUE LOS PRESUPUESTOS TIENEN UN PLAZO DE 15 DIAS Y PARA CONFIRMAR SE ABONA UNA SEÑA DEL 50%.",
                15,
                yPie + 9
            );

            doc.setLineWidth(0.5);
            doc.line(15, yPie + 14, 195, yPie + 14);
        }

        const offsetFirma = incluirCondicionesComerciales ? 18 : 5;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
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

    return { dibujarEncabezadoEmpresa, dibujarPieDePagina };
};

// ==========================================
// 1. SOLO RECIBO
// ==========================================
export const exportarReciboPDF = async (datos = {}) => {
    try {
        const jsPDF = await obtenerJsPDF();
        const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
        const { dibujarEncabezadoEmpresa, dibujarPieDePagina } = await crearAyudantesDocumento(doc, datos);

        const nroRecibo = String(datos.numero || "S/N").trim();
        const fechaEmision = datos.fecha || "";
        const nombreCliente = String(datos.clienteNombre || "").trim();
        const dirCliente = String(datos.clienteDireccion || "").trim();
        const telCliente = String(datos.clienteTelefono || "").trim();
        const docTipo = datos.clienteTipoDoc || "CUIL/CUIT";
        const docNum = datos.clienteNumDoc || "";

        dibujarEncabezadoEmpresa();

        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(0, 0, 0);
        doc.text("RECIBO", 195, 25, { align: "right" });

        doc.setFont("monospace", "bold");
        doc.setFontSize(13);
        doc.setTextColor(50, 50, 50);
        doc.text(`REF: ${nroRecibo}`, 195, 32, { align: "right" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`FECHA EMISIÓN: ${fechaEmision}`, 195, 40, { align: "right" });

        if (docNum) {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9.5);
            doc.text(`${docTipo}: ${docNum}`, 195, 47, { align: "right" });
        }

        doc.setDrawColor(210, 210, 210);
        doc.setLineWidth(0.3);
        doc.line(15, 55, 195, 55);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(0, 0, 0);
        doc.text("CLIENTE:", 15, 65);
        doc.text("DIRECCIÓN:", 15, 72);
        doc.text("TELÉFONO:", 15, 79);

        doc.setFont("helvetica", "normal");
        doc.text(nombreCliente, 35, 65);
        doc.text(dirCliente, 39, 72);
        doc.text(telCliente, 38, 79);

        const yRecibo = 95;
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
        doc.text("Monto Recibido:", 21, yRecibo + 25);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(14);
        doc.text(`$ ${formato(datos.montoRecibido)}`, 60, yRecibo + 25);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text("Medio de Pago:", 21, yRecibo + 38);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.text(`${datos.medioPago || "Efectivo"}`, 60, yRecibo + 38);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text("Aclaración:", 21, yRecibo + 52);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);

        const lineasAclaracion = doc.splitTextToSize(
            datos.aclaracion || "Sin observaciones adicionales.",
            130
        );
        doc.text(lineasAclaracion, 21, yRecibo + 60);

        dibujarPieDePagina(false);

        const nombreLimpio = (nombreCliente || "Cliente").replace(/\s+/g, "_");
        doc.save(`Recibo_${nroRecibo}_${nombreLimpio}.pdf`);
    } catch (e) {
        console.error("Error al generar el PDF del recibo:", e);
    }
};

// ==========================================
// 2. SOLO ORDEN DE TRABAJO TERMINADO (GARANTÍA)
// ==========================================
export const exportarGarantiaPDF = async (datos = {}) => {
    try {
        const jsPDF = await obtenerJsPDF();
        const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
        const { dibujarEncabezadoEmpresa, dibujarPieDePagina } = await crearAyudantesDocumento(doc, datos);

        const nroReferencia = String(datos.numero || "S/N").trim();
        const fechaEmision = datos.fecha || "";
        const nombreCliente = String(datos.clienteNombre || "").trim();
        const dirCliente = String(datos.clienteDireccion || "").trim();
        const telCliente = String(datos.clienteTelefono || "").trim();
        const docTipo = datos.clienteTipoDoc || "CUIL/CUIT";
        const docNum = datos.clienteNumDoc || "";

        dibujarEncabezadoEmpresa();

        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text("ORDEN DE TRABAJO TERMINADO", 195, 25, { align: "right" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(`NÚMERO DE PRESUPUESTO: ${nroReferencia}`, 195, 32, { align: "right" });
        doc.text(`FECHA EMISIÓN: ${fechaEmision}`, 195, 38, { align: "right" });
        if (datos.fechaCaducidad) {
            doc.text(`FECHA CADUCIDAD: ${datos.fechaCaducidad}`, 195, 44, { align: "right" });
        }
        if (docNum) {
            doc.text(`${docTipo}: ${docNum}`, 195, datos.fechaCaducidad ? 50 : 44, { align: "right" });
        }

        doc.setDrawColor(210, 210, 210);
        doc.setLineWidth(0.3);
        doc.line(15, 55, 195, 55);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(0, 0, 0);
        doc.text("CLIENTE:", 15, 62);
        doc.text("DIRECCIÓN:", 15, 68);
        doc.text("TELÉFONO:", 15, 74);

        doc.setFont("helvetica", "normal");
        doc.text(nombreCliente, 35, 62);
        doc.text(dirCliente, 39, 68);
        doc.text(telCliente, 38, 74);

        let yGarantia = 83;

        doc.setFillColor(239, 239, 239);
        doc.rect(15, yGarantia, 180, 7.5, "FD");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text("1. ALCANCE Y CONDICIONES DE APLICACIÓN DE LA GARANTÍA", 19, yGarantia + 5);

        yGarantia += 12;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);

        const textoAplica =
            datos.garantiaAplica ||
            "La presente garantía cubre exclusivamente los trabajos de reparación, mantenimiento o instalación ejecutados sobre el equipo por un período de 6 (seis) meses a partir de la fecha de entrega/finalización del servicio.\n" +
                "Condiciones de Anulación:\n" +
                "La garantía perderá validez de forma inmediata e irrevocable si el equipo es intervenido, desarmado, reparado o modificado por personal técnico ajeno a nuestra empresa o por el propio usuario durante el período de vigencia. Asimismo, quedan excluidas las fallas ocasionadas por fluctuaciones extremas de tensión eléctrica, mal uso o causas ajenas al trabajo realizado.";

        const lineasAplica = doc.splitTextToSize(textoAplica, 172);
        doc.text(lineasAplica, 19, yGarantia);

        yGarantia += lineasAplica.length * 4.5 + 10;

        doc.setFillColor(239, 239, 239);
        doc.rect(15, yGarantia, 180, 7.5, "FD");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("2. EXCLUSIONES Y PÉRDIDA DE COBERTURA", 19, yGarantia + 5);

        yGarantia += 12;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);

        const textoExclusiones =
            datos.garantiaExclusiones ||
            "Quedan expresamente excluidas de la garantía las siguientes situaciones:\n" +
                "• Intervención o modificación de las instalaciones por parte de terceros no autorizados.\n" +
                "• Daños provocados por mal uso, sobrecargas eléctricas, humedad ajena a la estructura o factores climáticos extremos.\n" +
                "• Desgaste natural de insumos y materiales provistos directamente por el cliente.";

        const lineasExclusiones = doc.splitTextToSize(textoExclusiones, 172);
        doc.text(lineasExclusiones, 19, yGarantia);

        dibujarPieDePagina(false);

        const nombreLimpio = (nombreCliente || "Cliente").replace(/\s+/g, "_");
        doc.save(`Garantia_${nroReferencia}_${nombreLimpio}.pdf`);
    } catch (e) {
        console.error("Error al generar el PDF de garantía:", e);
    }
};

// ==========================================
// 3. SOLO PRESUPUESTO (O FACTURA SI APLICA)
// ==========================================
export const exportarPresupuestoPDF = async (datos = {}) => {
    if (datos.esRecibo) {
        return exportarReciboPDF(datos);
    }

    try {
        const jsPDF = await obtenerJsPDF();
        const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
        const { dibujarEncabezadoEmpresa, dibujarPieDePagina } = await crearAyudantesDocumento(doc, datos);

        const nroPresupuesto = String(datos.numero || "S/N").trim();
        const fechaPresupuesto = datos.fecha || "";
        const nombreCliente = String(datos.clienteNombre || "").trim();
        const dirCliente = String(datos.clienteDireccion || "").trim();
        const telCliente = String(datos.clienteTelefono || "").trim();
        const docTipo = datos.clienteTipoDoc || "CUIL/CUIT";
        const docNum = datos.clienteNumDoc || "";

        const esFactura = Boolean(datos.esFactura);
        const aplicarIva = datos.incluirIva !== undefined ? Boolean(datos.incluirIva) : true;

        const matNeto = Number(datos.totalMaterialesNeto || 0);
        const matIva = aplicarIva ? Number(datos.ivaMateriales ?? (matNeto * 0.21)) : 0;
        const matTotal = matNeto + matIva;

        const columnaTotalNeto = Number(datos.columnaTotalNeto || 0);
        const columnaTotalIva = aplicarIva ? Number(datos.columnaTotalIva || 0) : 0;
        const granTotalFinal =
            datos.totalAPagarFinal !== undefined
                ? Number(datos.totalAPagarFinal)
                : columnaTotalNeto + columnaTotalIva;

        dibujarEncabezadoEmpresa();

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
        doc.text(nroPresupuesto, 195, 32, { align: "right" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`FECHA: ${fechaPresupuesto}`, 195, 40, { align: "right" });

        if (docNum) {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9.5);
            doc.text(`${docTipo}: ${docNum}`, 195, 47, { align: "right" });
        }

        doc.setDrawColor(210, 210, 210);
        doc.setLineWidth(0.3);
        doc.line(15, 55, 195, 55);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(0, 0, 0);
        doc.text("CLIENTE:", 15, 63);
        doc.text("DIRECCIÓN:", 15, 69);
        doc.text("TELÉFONO:", 15, 75);

        doc.setFont("helvetica", "normal");
        doc.text(nombreCliente, 35, 63);
        doc.text(dirCliente, 39, 69);
        doc.text(telCliente, 38, 75);

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

            const descTexto =
                String(descripcion).length > 48
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
            moItems.forEach((item) => {
                const itemNeto = Number(item.total || 0);
                const itemIva = aplicarIva ? itemNeto * 0.21 : 0;
                const itemTotal = itemNeto + itemIva;
                const cantMostrar = `${item.cantidad || 1}`;
                const descMostrar = `${item.concepto || item.descripcion || ""}`;

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
        limitesColumnas.forEach((colX) => {
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

        if (datos.observaciones) {
            y += 20;
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9.5);
            doc.text("OBSERVACIONES Y CONDICIONES DEL SERVICIO:", 15, y);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            const lineasObs = doc.splitTextToSize(String(datos.observaciones).toUpperCase(), 180);
            doc.text(lineasObs, 15, y + 5);
        }

        dibujarPieDePagina(true);

        const nombreLimpio = (nombreCliente || "Cliente").replace(/\s+/g, "_");
        const nombreFinalArchivo = `${esFactura ? "Factura" : "Presupuesto"}_${nroPresupuesto}_${nombreLimpio}.pdf`;
        doc.save(nombreFinalArchivo);
    } catch (e) {
        console.error("Error al generar el PDF del presupuesto:", e);
    }
};
