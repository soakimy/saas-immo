"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

export default function AccountMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/connexion");
    router.refresh();
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        aria-label="Menu du compte"
        className="w-9 h-9 rounded-full bg-paper border border-line flex items-center justify-center text-ink/60 hover:text-ink hover:border-clay/50 transition-colors"
      >
        ⚙
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-line rounded-md shadow-lg py-1 z-30">
          <Link
            href="/dashboard/abonnement"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-ink hover:bg-paper transition-colors"
          >
            Abonnement
          </Link>
          <button
            onClick={handleSignOut}
            className="block w-full text-left px-4 py-2 text-sm text-ink hover:bg-paper transition-colors"
          >
            Se déconnecter
          </button>
        </div>
      )}
    </div>
  );
}
