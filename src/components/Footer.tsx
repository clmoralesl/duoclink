import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-duoc-blue text-duoc-white py-4 mt-0">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Marca */}
        <div>
          <h2 className="text-2xl font-bold">Duoc Link</h2>
          <p className="mt-2 text-duoc-gray">
            Conecta, aprende y comparte con tu comunidad estudiantil.
          </p>
        </div>

        {/* Navegación */}
        <div>
          <h3 className="font-semibold mb-3">Explora</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/viajes" className="hover:text-duoc-yellow">
                Transporte
              </Link>
            </li>
            <li>
              <Link href="/apuntes" className="hover:text-duoc-yellow">
                Apuntes
              </Link>
            </li>
            <li>
              <Link href="/home#tutoring" className="hover:text-duoc-yellow">
                Ayudantías
              </Link>
            </li>
          </ul>
        </div>

        {/* Redes */}
        <div>
          <h3 className="font-semibold mb-3">Síguenos</h3>
          <div className="flex gap-4">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">📘</a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">🐦</a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">📸</a>
          </div>
        </div>
      </div>
      <p className="text-center mt-8 text-sm text-duoc-gray">
        © {new Date().getFullYear()} Duoc Link. No tenemos ningún derecho reservado. Por favor no demandar.
      </p>
    </footer>
  );
}