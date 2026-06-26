import Link from "next/link";

export default function HomePage() {
  return (
    <main className="bg-paper">
      {/* HEADER */}
      <header className="border-b border-line">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <p className="font-display text-xl text-ink">Bureau</p>
          <Link
            href="/connexion"
            className="text-sm text-ink/70 hover:text-ink transition-colors"
          >
            Se connecter
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm text-clay font-medium mb-4">Pour les agences immobilières</p>
            <h1 className="font-display text-4xl sm:text-5xl text-ink leading-tight mb-6">
              Le prospect que vous
              <br />
              n&apos;avez pas rappelé
              <br />
              à temps.
            </h1>
            <p className="text-ink/70 text-lg mb-8 max-w-md">
              Bureau qualifie vos prospects, vous dit qui relancer aujourd&apos;hui,
              et rédige vos emails à votre place — pour qu&apos;aucun dossier
              ne se perde dans la pile.
            </p>
            <Link
              href="#contact"
              className="inline-block bg-ink text-paper rounded-md px-6 py-3 font-medium hover:bg-ink/90 transition-colors"
            >
              Nous contacter
            </Link>
          </div>

          {/* Élément signature : une carte de prospect qui s'efface visuellement */}
          <div className="relative h-72 hidden lg:block" aria-hidden="true">
            <FadingProspectCard />
          </div>
        </div>
      </section>

      {/* PREUVE CHIFFRÉE */}
      <section className="border-y border-line bg-white">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <p className="font-display text-2xl sm:text-3xl text-ink max-w-2xl">
            <span className="text-clay">67 % des agences</span> suivent encore leurs
            mandats sur Excel — et perdent en moyenne{" "}
            <span className="text-clay">3 mandats par trimestre</span> et par
            négociateur à cause de relances oubliées.
          </p>
        </div>
      </section>

      {/* BÉNÉFICES */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <Benefit
            title="Plus aucun oubli"
            description="Bureau repère les prospects sans nouvelles depuis trop longtemps et vous les remet devant les yeux chaque matin."
          />
          <Benefit
            title="La qualification, déjà faite"
            description="Notes, budget, urgence : Bureau résume chaque prospect en quelques lignes et vous dit la prochaine action à faire."
          />
          <Benefit
            title="Les relances, rédigées"
            description="Un email personnalisé généré en quelques secondes, que vous relisez et envoyez en un clic."
          />
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="border-t border-line bg-white">
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <h2 className="font-display text-2xl text-ink mb-3">
            Envie de l&apos;essayer avec votre équipe ?
          </h2>
          <p className="text-ink/60 mb-8">
            Parlons de votre agence et de vos prospects.
          </p>
          <a
            href="mailto:VOTRE-EMAIL@exemple.fr"
            className="inline-block bg-ink text-paper rounded-md px-6 py-3 font-medium hover:bg-ink/90 transition-colors"
          >
            Nous contacter
          </a>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between text-sm text-ink/40">
          <p>Bureau</p>
          <Link href="/connexion" className="hover:text-ink/70 transition-colors">
            Se connecter
          </Link>
        </div>
      </footer>
    </main>
  );
}

function Benefit({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h3 className="font-display text-lg text-ink mb-2">{title}</h3>
      <p className="text-ink/60 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

/**
 * Élément signature : une carte de prospect qui s'efface progressivement,
 * comme une métaphore visuelle directe du problème que Bureau résout —
 * le contact qui se perd faute de suivi, jusqu'à devenir illisible.
 */
function FadingProspectCard() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative w-72">
        <div
          className="bg-white border border-line rounded-lg p-6 shadow-sm"
          style={{
            opacity: 0.35,
            filter: "blur(1.5px)",
          }}
        >
          <p className="text-xs text-ink/30 mb-1">Dernier contact : 23 jours</p>
          <p className="font-display text-lg text-ink/40 mb-1">Marc Dubreuil</p>
          <p className="text-sm text-ink/30">Budget 380-420k€ · 3 chambres</p>
        </div>

        <div className="absolute -top-4 -right-4 bg-white border border-line rounded-lg p-4 shadow-md w-56">
          <p className="text-xs text-sage font-medium mb-1">✓ Relancé aujourd&apos;hui</p>
          <p className="font-display text-base text-ink mb-0.5">Camille Laurent</p>
          <p className="text-xs text-ink/50">Budget 350-400k€ · Score 82</p>
        </div>
      </div>
    </div>
  );
}
