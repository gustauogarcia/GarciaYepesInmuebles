type Seccion = {
  id: string;
  titulo: string;
  parrafos: string[];
  tip?: string;
};

const SECCIONES: Seccion[] = [
  {
    id: "general",
    titulo: "Cómo está organizada la app",
    parrafos: [
      "García-Yepes Inmuebles está pensada para administrar varias propiedades desde un solo lugar. Blanco y Negro es la primera y hoy la única, pero cuando registres otro edificio en Propiedades, todo lo demás (Unidades, Inquilinos, Movimientos, Dotación) puede asociarse a ese edificio nuevo sin tocar nada de lo existente.",
      "Todo lo que registras queda guardado en la nube (en la base de datos, no en tu computador), así que puedes entrar desde el navegador de cualquier computador o celular con tu usuario y contraseña, y siempre ves la misma información actualizada.",
    ],
  },
  {
    id: "dashboard",
    titulo: "Dashboard",
    parrafos: [
      "Es el resumen ejecutivo: arriba puedes elegir ver \"Todas las propiedades\" (consolidado) o una propiedad específica.",
      "Ocupación: cuántas unidades están ocupadas sobre el total. Ingresos/Egresos del mes: con la variación en % contra el mes anterior. Saldo de caja: el acumulado histórico de ingresos menos egresos. Recaudo de renta: cuánto de la renta potencial de las unidades ocupadas ya se cobró este mes. Utilidad y Margen YTD (\"year to date\"): lo que va ganado en el año en curso, en pesos y en %. Administración / Jaime Yepes y Pagos a los dueños: cuánto se ha pagado este año (y en total) por esos dos conceptos específicos.",
      "Las alertas rojas y amarillas avisan de: obligaciones vencidas o próximas a vencer, unidades ocupadas sin un ingreso de renta registrado este mes, y contratos que cumplen un año y deben renovarse ajustando el canon por inflación.",
    ],
    tip: "Para que las tarjetas de \"Administración / Jaime Yepes\" y \"Pagos a los dueños\" salgan correctas, al registrar el movimiento en Movimientos escribe el nombre directamente en el Concepto: \"Jaime Yepes\" o \"administración\" para el primero; \"Piedad\", \"Gustauo\" o \"socios\" para el segundo. La app busca esas palabras en el texto que escribas, así que entre más claro el concepto, más preciso el reporte.",
  },
  {
    id: "propiedades-unidades",
    titulo: "Propiedades y Unidades",
    parrafos: [
      "En Propiedades registras cada edificio (nombre, país, % de administración, fecha de corte). En Unidades registras cada apartamento de ese edificio: código, estado (Ocupado/Vacante) y renta vigente.",
      "Para agregar un edificio nuevo en el futuro: créalo primero en Propiedades, luego agrega sus unidades en Unidades — desde ahí ya puedes registrar inquilinos, movimientos y dotación para ese edificio.",
    ],
    tip: "Actualiza el estado de la unidad (Ocupado/Vacante) apenas cambie un inquilino — de ese campo dependen la Ocupación y el Recaudo de renta que muestra el Dashboard.",
  },
  {
    id: "inquilinos",
    titulo: "Inquilinos",
    parrafos: [
      "Cada fila es un contrato de arrendamiento: arrendatario, datos de contacto, codeudor, fecha de inicio del contrato y si sigue activo.",
      "Con la fecha de inicio, la app calcula automáticamente en qué mes (1 a 12) va el ciclo anual del contrato, y muestra una alerta cuando llega al mes 12 — así sabes que toca renovar y ajustar el canon de arrendamiento por inflación antes de que se cumpla el año.",
    ],
    tip: "La fecha de inicio del contrato debe quedar exacta desde el primer día: de ahí sale todo el cálculo del ciclo y la alerta de renovación, tanto en esta pantalla como en Unidades y en el Dashboard.",
  },
  {
    id: "movimientos",
    titulo: "Movimientos",
    parrafos: [
      "Es el libro de caja: cada ingreso y egreso, con fecha, categoría, concepto, comprobante y monto. La tabla muestra también el saldo acumulado después de cada movimiento.",
      "Las categorías de egreso incluyen Nómina y honorarios, Retiros / Socios, Mantenimiento, Mejoras/Remodelación, Reparaciones, Servicios y Reguladores e Impuestos (para catastro, predial, valorización — la pantalla de Impuestos está en pausa, así que eso se registra aquí).",
    ],
    tip: "Escribe el concepto de forma clara y, en lo posible, con las mismas palabras cada vez (por ejemplo siempre \"Renta Apto 302\" o \"Pago administración Jaime Yepes\"). El Dashboard —y cualquier reporte que construyamos más adelante— lee ese texto para clasificar los pagos automáticamente, así que un concepto consistente hace que los números salgan bien sin que tengas que revisar nada a mano.",
  },
  {
    id: "dotacion",
    titulo: "Dotación",
    parrafos: [
      "Muestra qué ítems (gas, cocina, baños, closets, calentador, puertas, etc.) tiene cada unidad, en una tabla de unidad × ítem. Un clic en la celda marca el ítem como disponible o no disponible.",
      "Si necesitas registrar un ítem que no está en la lista estándar, usa el formulario de abajo con la opción \"Otro (especificar)\".",
    ],
  },
  {
    id: "proveedores-cotizaciones",
    titulo: "Proveedores y Cotizaciones",
    parrafos: [
      "En Proveedores llevas el directorio de contactos (plomeros, electricistas, entidades regulatorias, etc.), clasificados por categoría y subcategoría. En Cotizaciones registras las cotizaciones que te envían, con su estado (pendiente, aprobada, rechazada) y el monto.",
    ],
  },
  {
    id: "exportar",
    titulo: "Exportar",
    parrafos: [
      "Descarga cualquier tabla (Propiedades, Unidades, Inquilinos, Movimientos, Dotación, Proveedores, Cotizaciones) en un archivo .csv que Excel abre directamente, con tildes y ñ correctas.",
    ],
    tip: "Exporta periódicamente como respaldo — por ejemplo Movimientos una vez al mes — así siempre tienes una copia tuya de la información además de lo que vive en la nube.",
  },
  {
    id: "buenas-practicas",
    titulo: "Buenas prácticas generales",
    parrafos: [
      "Sé consistente con los nombres y palabras clave que usas en los conceptos de Movimientos (nombres de inquilinos, de Piedad, Gustauo o Jaime Yepes, \"administración\", \"socios\") — de eso depende que el Dashboard y los reportes clasifiquen bien la información sin trabajo manual de tu parte.",
      "Revisa el Dashboard con regularidad (por ejemplo, al empezar el mes) para ver las alertas de renovación de contratos y de obligaciones próximas a vencer.",
      "No compartas tu usuario y contraseña: si alguien más necesita entrar, pídeme crearle su propio usuario en Supabase, así queda claro quién hizo cada cambio.",
    ],
  },
];

export default function AyudaPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
        Ayuda
      </h1>
      <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
        Cómo funciona cada pantalla y algunas recomendaciones para que la información y los
        reportes salgan bien.
      </p>

      <nav className="mt-6 flex flex-wrap gap-x-4 gap-y-1 rounded-xl border border-stone-200 bg-stone-100 p-4 text-sm dark:border-stone-800 dark:bg-stone-900">
        {SECCIONES.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="text-stone-600 underline decoration-stone-300 underline-offset-2 hover:text-stone-950 dark:text-stone-400 dark:decoration-stone-700 dark:hover:text-stone-50"
          >
            {s.titulo}
          </a>
        ))}
      </nav>

      <div className="mt-10 space-y-10">
        {SECCIONES.map((s) => (
          <section key={s.id} id={s.id} className="scroll-mt-20">
            <h2 className="text-lg font-medium text-stone-900 dark:text-stone-50">{s.titulo}</h2>
            <div className="mt-2 space-y-3">
              {s.parrafos.map((p, i) => (
                <p key={i} className="text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                  {p}
                </p>
              ))}
            </div>
            {s.tip && (
              <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
                <span className="font-medium">Recomendación: </span>
                {s.tip}
              </div>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}
