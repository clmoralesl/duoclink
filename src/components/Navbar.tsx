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
    <nav className="fixed top-0 left-0 w-full bg-white dark:bg-duoc-blue shadow-md z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 h-20">
        {/* Logo */}
        <Link href="/home" className="flex items-center gap-2">
          <Image
            src="/images/dllogolight.png"
            alt="Duoc Link"
            width={200}
            height={200}
          />
        </Link>

        {/* Menú de escritorio */}
        <div className="hidden md:flex items-center gap-5">
          <Link href="/apuntes" className="!text-duoc-white hover:!text-duoc-yellow">Apuntes</Link>
          <Link href="/viajes" className="!text-duoc-white hover:!text-duoc-yellow">Viajes</Link>
          <Link href="/home#tutoring" className="!text-duoc-white hover:!text-duoc-yellow">Ayudantías</Link>

          {loggedIn ? (
            <button
              onClick={handleLogout}
              className="ml-4 px-4 py-2 rounded-lg bg-duoc-yellow text-duoc-blue font-semibold hover:bg-duoc-white hover:text-duoc-blue transition cursor-pointer"
            >
              Cerrar sesión
            </button>
          ) : (
            <Link
              href="/login"
              className="ml-4 px-4 py-2 rounded-lg bg-duoc-yellow text-duoc-blue font-semibold hover:bg-duoc-white hover:text-duoc-blue transition"
            >
              Iniciar sesión
            </Link>
          )}
        </div>

        {/* Botón hamburguesa móvil */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)}>
            <svg
              className="w-6 h-6 text-black dark:text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Menú móvil desplegable */}
      {isOpen && (
        <div className="flex flex-col md:hidden bg-white dark:bg-duoc-blue px-4 pb-4 gap-2">
          <Link href="/apuntes" className="!text-duoc-white hover:!text-duoc-yellow">Apuntes</Link>
          <Link href="/viajes" className="!text-duoc-white hover:!text-duoc-yellow">Viajes</Link>
          <Link href="/home#tutoring" className="!text-duoc-white hover:!text-duoc-yellow">Ayudantías</Link>

          {loggedIn ? (
            <button
              onClick={handleLogout}
              className="mt-2 px-4 py-2 rounded-lg bg-duoc-yellow text-duoc-blue font-semibold hover:bg-duoc-white hover:text-duoc-blue transition cursor-pointer text-left"
            >
              Cerrar sesión
            </button>
          ) : (
            <Link
              href="/login"
              className="mt-2 px-4 py-2 rounded-lg bg-duoc-yellow text-duoc-blue font-semibold hover:bg-duoc-white hover:text-duoc-blue transition"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
