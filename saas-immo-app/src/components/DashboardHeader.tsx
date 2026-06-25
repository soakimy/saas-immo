import Link from "next/link";
import AccountMenu from "@/components/AccountMenu";

const NAV_ITEMS = [
  { href: "/dashboard/biens", label: "Biens" },
  { href: "/dashboard/contacts", label: "Contacts" },
  { href: "/dashboard/rendez-vous", label: "Rendez-vous" },
];

export default function DashboardHeader({ agencyName }: { agencyName?: string }) {
  return (
    <header className="border-b border-line bg-white sticky top-0 z-20">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="font-display text-xl text-ink flex-shrink-0">
            Bureau
          </Link>
          <nav className="hidden sm:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-ink/70 hover:text-ink hover:bg-paper px-3 py-2 rounded-md transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {agencyName && (
            <span className="hidden sm:inline text-sm text-ink/40">{agencyName}</span>
          )}
          <AccountMenu />
        </div>
      </div>

      {/* Navigation mobile : barre horizontale scrollable sous l'en-tête */}
      <nav className="sm:hidden flex items-center gap-1 px-4 pb-3 overflow-x-auto">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-sm text-ink/70 hover:text-ink bg-paper px-3 py-1.5 rounded-md whitespace-nowrap transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

