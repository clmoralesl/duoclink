"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

type User = {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  email?: string;
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Se observa el estado de autenticación
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        setLoggedIn(true);

        // Se combina información de Firebase y localStorage
        const raw = localStorage.getItem("duocUser");
        const localData = raw ? JSON.parse(raw) : {};
        setUser({
          email: fbUser.email ?? "",
          avatarUrl: localData.avatarUrl ?? fbUser.photoURL ?? "",
          firstName: localData.firstName ?? "",
          lastName: localData.lastName ?? "",
        });
      } else {
        setLoggedIn(false);
        setUser(null);
      }
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  // Genera iniciales si no hay imagen de perfil
  const initials =
    (user?.firstName?.[0] ?? "") + (user?.lastName?.[0] ?? "") || "DU";

  return (
    <nav className="fixed top-0 left-0 w-full bg-duoc-blue text-white shadow-md z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 h-20">
        <Link href="/home" className="flex items-center gap-2">
          <Image
            src="/images/dllogolight.png"
            alt="Duoc Link"
            width={160}
            height={40}
          />
        </Link>

        {/* Menú Desktop */}
        <div className="hidden md:flex items-center gap-5">
          <Link href="/apuntes" className="hover:text-duoc-yellow">
            Apuntes
          </Link>
          <Link href="/viajes" className="hover:text-duoc-yellow">
            Viajes
          </Link>
          <Link href="/perfil" className="hover:text-duoc-yellow">
            Perfil
          </Link>
          <Link href="/home#tutoring" className="hover:text-duoc-yellow">
            Ayudantías
          </Link>

          {loggedIn && user && (
            <div className="flex items-center gap-3 ml-4">
              {/* Imagen de perfil o iniciales */}
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-duoc-yellow bg-white flex items-center justify-center text-duoc-blue font-semibold">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{initials.toUpperCase()}</span>
                )}
              </div>

              {/* Botón de cerrar sesión */}
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-duoc-yellow text-duoc-blue font-semibold hover:bg-white transition"
              >
                Cerrar sesión
              </button>
            </div>
          )}

          {!loggedIn && (
            <Link
              href="/login"
              className="ml-4 px-4 py-2 rounded-lg bg-duoc-yellow text-duoc-blue font-semibold hover:bg-white transition"
            >
              Iniciar sesión
            </Link>
          )}
        </div>

        {/* Menú Móvil */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} aria-label="Abrir menú">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  isOpen
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Menú desplegable móvil */}
      {isOpen && (
        <div className="md:hidden bg-duoc-blue px-4 pb-4 flex flex-col gap-2">
          <Link href="/apuntes" className="hover:text-duoc-yellow">
            Apuntes
          </Link>
          <Link href="/viajes" className="hover:text-duoc-yellow">
            Viajes
          </Link>
          <Link href="/perfil" className="hover:text-duoc-yellow">
            Perfil
          </Link>
          <Link href="/home#tutoring" className="hover:text-duoc-yellow">
            Ayudantías
          </Link>

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