import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full h-20 bg-white dark:bg-duoc-blue shadow-md z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 h-full">
        {/* Logo */}
        <Link href="/home" className="flex items-center gap-2">
          <Image
            src="/images/dllogolight.png"
            alt="Duoc Link"
            width={150}
            height={150}
          />
        </Link>

        {/* Menú de escritorio */}
        <div className="hidden md:flex items-center gap-5">
          <Link href="#carpool" className="!text-duoc-white hover:!text-duoc-yellow">Transporte</Link>
          <Link href="#notes" className="!text-duoc-white hover:!text-duoc-yellow">Apuntes</Link>
          <Link href="#tutoring" className="!text-duoc-white hover:!text-duoc-yellow">Ayudantías</Link>
          <button className="bg-duoc-white text-black px-4 py-2 rounded-lg font-semibold hover:bg-duoc-yellow transition ml-2 cursor-pointer">
            Ingresar
          </button>
        </div>

        {/* Botón hamburguesa */}
        <div className="md:hidden flex items-center">
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

      {/* Menú móvil */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-duoc-blue shadow-md px-4 py-4">
          <Link href="#carpool" className="block py-2 hover:text-duoc-yellow">Transporte</Link>
          <Link href="#notes" className="block py-2 hover:text-duoc-yellow">Apuntes</Link>
          <Link href="#tutoring" className="block py-2 hover:text-duoc-yellow">Ayudantías</Link>
          <button className="w-full bg-duoc-white text-black px-4 py-2 rounded-lg font-semibold hover:bg-duoc-gray transition mt-2">
            Ingresar
          </button>
        </div>
      )}
    </nav>
  );
}
