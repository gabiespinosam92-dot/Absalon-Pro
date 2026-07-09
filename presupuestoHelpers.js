import {
    ESTADOS,
    colorEstado,
    calcularTotal
} from "./presupuestoHelpers.js";

export const ESTADOS = {
    BORRADOR: "Borrador",
    ENVIADO: "Enviado",
    APROBADO: "Aprobado",
    PROGRAMADO: "Programado",
    EN_EJECUCION: "En ejecución",
    FINALIZADO: "Finalizado",
    FACTURADO: "Facturado",
    EN_GARANTIA: "En garantía",
    CERRADO: "Cerrado"
};

export function colorEstado(estado){

    switch(estado){

        case ESTADOS.BORRADOR:
            return "#7f8c8d";

        case ESTADOS.ENVIADO:
            return "#2196F3";

        case ESTADOS.APROBADO:
            return "#2ecc71";

        case ESTADOS.PROGRAMADO:
            return "#9b59b6";

        case ESTADOS.EN_EJECUCION:
            return "#e67e22";

        case ESTADOS.FINALIZADO:
            return "#1abc9c";

        case ESTADOS.FACTURADO:
            return "#9C27B0";

        case ESTADOS.EN_GARANTIA:
            return "#f1c40f";

        case ESTADOS.CERRADO:
            return "#27ae60";

        default:
            return "#7f8c8d";
    }

}

export function calcularTotal(items=[]){

    return items.reduce(
        (total,item)=>
            total+
            (Number(item.precio||0)*Number(item.cantidad||1)),
        0
    );

}