// Genera CSV separado por punto y coma (";"), que es lo que Excel en español
// (configuración regional Colombia) espera abrir directamente sin pedir
// "Datos > Texto en columnas". Incluye BOM UTF-8 para que las tildes y la ñ
// se vean bien al abrir en Excel.

type Celda = string | number | boolean | null | undefined;

function celdaCSV(valor: Celda): string {
  if (valor === null || valor === undefined) return "";
  const texto = typeof valor === "boolean" ? (valor ? "Sí" : "No") : String(valor);
  if (/[",;\n]/.test(texto)) {
    return '"' + texto.replace(/"/g, '""') + '"';
  }
  return texto;
}

export function generarCSV(encabezados: string[], filas: Celda[][]): string {
  const BOM = "﻿";
  const lineas = [encabezados, ...filas].map((fila) => fila.map(celdaCSV).join(";"));
  return BOM + lineas.join("\r\n");
}
