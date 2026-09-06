import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirigir?: string }>;
}) {
  const { redirigir } = await searchParams;

  return (
    <main className="mx-auto flex max-w-sm flex-col justify-center px-6 py-24">
      <h1 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
        Iniciar sesión
      </h1>
      <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
        Administración de propiedades — García-Yepes Inmuebles.
      </p>

      <div className="mt-8">
        <LoginForm redirigir={redirigir && redirigir.startsWith("/") ? redirigir : "/"} />
      </div>
    </main>
  );
}
