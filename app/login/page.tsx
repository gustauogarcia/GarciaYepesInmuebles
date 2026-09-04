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
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Iniciar sesión
      </h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Administración del edificio Blanco y Negro.
      </p>

      <div className="mt-8">
        <LoginForm redirigir={redirigir && redirigir.startsWith("/") ? redirigir : "/"} />
      </div>
    </main>
  );
}
