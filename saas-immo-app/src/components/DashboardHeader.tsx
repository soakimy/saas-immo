import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";

export default function DashboardHeader({
  agencyName,
}: {
  agencyName: string;
}) {
  return (
    <header className="border-b border-line bg-white">
      <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div>
            <p className="font-display text-xl text-ink">Bureau</p>
            <p className="text-sm text-ink/50">{agencyName}</p>
          </div>
          <nav className="flex gap-5 text-sm">
            <Link href="/dashboard" className="text-ink/70 hover:text-ink transition-colors">
              Vue d&apos;ensemble
            </Link>
            <Link href="/dashboard/biens" className="text-ink/70 hover:text-ink transition-colors">
              Biens
            </Link>
          </nav>
        </div>
        <SignOutButton />
      </div>
    </header>
  );
}
