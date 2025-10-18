"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => setLoggedIn(!!user));
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-duoc-blue text-white shadow-md z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 h-20">
        <Link href="/home" className="flex items-center gap-2">
          <Image src="/images/dllogolight.png" alt="Duoc Link" width={160} height={40} />
        </Link>

        <div className="hidden md:flex items-center gap-5">
          <Link href="/apuntes" className="hover:text-duoc-yellow">Apuntes</Link>
          <Link href="/viajes" className="hover:text-duoc-yellow">Viajes</Link>
          <Link href="/home#tutoring" className="hover:text-duoc-yellow">Ayudantías</Link>
          {loggedIn ? (
            <button
              onClick={handleLogout}
              className="ml-4 px-4 py-2 rounded-lg bg-duoc-yellow text-duoc-blue font-semibold hover:bg-white transition"
            >
              Cerrar sesión
            </button>
          ) : (
            <Link
              href="/login"
              className="ml-4 px-4 py-2 rounded-lg bg-duoc-yellow text-duoc-blue font-semibold hover:bg-white transition"
            >
              Iniciar sesión
            </Link>
          )}
        </div>

        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} aria-label="Abrir menú">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-duoc-blue px-4 pb-4 flex flex-col gap-2">
          <Link href="/apuntes" className="hover:text-duoc-yellow">Apuntes</Link>
          <Link href="/viajes" className="hover:text-duoc-yellow">Viajes</Link>
          <Link href="/home#tutoring" className="hover:text-duoc-yellow">Ayudantías</Link>
          {loggedIn ? (
            <button
              onClick={handleLogout}
              className="mt-2 px-4 py-2 rounded-lg bg-duoc-yellow text-duoc-blue font-semibold transition text-left"
            >
              Cerrar sesión
            </button>
          ) : (
            <Link
              href="/login"
              className="mt-2 px-4 py-2 rounded-lg bg-duoc-yellow text-duoc-blue font-semibold transition"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
