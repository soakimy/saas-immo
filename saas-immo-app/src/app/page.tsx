import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-paper px-6">
      <div className="text-center max-w-md">
        <p className="font-display text-4xl text-ink mb-3">Bureau</p>
        <p className="text-ink/70 mb-8">
          L&apos;assistant qui s&apos;occupe des leads, des biens et des
          relances de votre agence.
        </p>
        <Link
          href="/connexion"
          className="inline-block bg-ink text-paper rounded-md px-6 py-2.5 font-medium hover:bg-ink/90 transition-colors"
        >
          Se connecter
        </Link>
      </div>
    </main>
  );
}
