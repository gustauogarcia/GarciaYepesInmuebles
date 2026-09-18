"use client";

// Selector de propiedad en forma de "chips", igual al que ya usa el
// Dashboard. Cada sección (Unidades, Inquilinos, Movimientos, etc.) lo usa
// para mostrar los datos de una sola propiedad a la vez — nunca mezcladas.
// Solo el Dashboard combina todas las propiedades (con su propio botón
// "Todas las propiedades"); aquí no existe esa opción a propósito.

function chipClase(activo: boolean) {
  return (
    "rounded-full px-3 py-1.5 text-sm font-medium transition " +
    (activo
      ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
      : "bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-900 dark:text-stone-400 dark:hover:bg-stone-800")
  );
}

export function SelectorPropiedad({
  edificios,
  seleccionId,
  onSeleccionar,
}: {
  edificios: { id: string; nombre: string }[];
  seleccionId: string;
  onSeleccionar: (id: string) => void;
}) {
  if (edificios.length <= 1) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {edificios.map((e) => (
        <button
          key={e.id}
          type="button"
          className={chipClase(e.id === seleccionId)}
          onClick={() => onSeleccionar(e.id)}
        >
          {e.nombre}
        </button>
      ))}
    </div>
  );
}

// Misma idea, pero como enlaces reales (navegación con ?propiedad=… en la
// URL) para páginas que filtran del lado del servidor en vez de en el
// navegador — hoy solo Movimientos, porque su consulta trae únicamente los
// últimos movimientos de la propiedad elegida en vez de traer todo.
export function SelectorPropiedadEnlace({
  edificios,
  seleccionId,
  hrefPara,
}: {
  edificios: { id: string; nombre: string }[];
  seleccionId: string;
  hrefPara: (id: string) => string;
}) {
  if (edificios.length <= 1) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {edificios.map((e) => (
        <a key={e.id} href={hrefPara(e.id)} className={chipClase(e.id === seleccionId)}>
          {e.nombre}
        </a>
      ))}
    </div>
  );
}
