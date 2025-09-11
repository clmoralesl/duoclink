import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="bg-duoc-gray text-duoc-blue">
      {/* Hero Section */}
      <section
        className="flex flex-col items-center justify-center bg-duoc-yellow text-duoc-blue px-6 text-center"
        style={{ minHeight: "calc(100vh - 80px)" }}
      >
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold flex flex-col md:flex-row items-center gap-3 text-center">
          Bienvenido a
          <Image
            src="/images/dllogo.png"
            alt="Duoc Link Logo"
            width={300}
            height={300}
            className="drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]"
          />
        </h1>
        <p className="mt-4 text-lg sm:text-xl md:text-2xl max-w-2xl">
          Conecta, comparte y colabora con tus compañeros de Duoc UC
        </p>
      </section>

      {/* Ayudantías Section */}
      <section className="flex flex-col md:flex-row items-center justify-between px-6 md:px-10 py-20
        bg-gradient-to-b from-duoc-yellow to-duoc-white text-duoc-blue">
        <div className="md:w-1/2">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ayudantías</h2>
          <p className="text-base sm:text-lg md:text-xl">
            ¿Necesitas ayuda con una materia? Solicita una ayudantía o
            conviértete en tutor y ayuda a tus compañeros.
          </p>
        </div>
        <div className="md:w-1/2 flex justify-center mt-6 md:mt-0">
          <Image
            src="/images/tutoring.jpg"
            alt="Tutoring"
            width={400}
            height={250}
            className="object-cover rounded-xl shadow-lg"
          />
        </div>
      </section>

      {/* Apuntes Section */}
      <section className="flex flex-col md:flex-row-reverse items-center justify-between px-6 md:px-10 py-20
        bg-gradient-to-b from-duoc-white to-duoc-gray text-duoc-blue">
        <div className="md:w-1/2">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Apuntes y Recursos</h2>
          <p className="text-base sm:text-lg md:text-xl">
            Comparte y descarga apuntes, videos o archivos importantes para tu
            carrera. Comenta y vota el mejor contenido.
          </p>
        </div>
        <div className="md:w-1/2 flex justify-center mt-6 md:mt-0">
          <Image
            src="/images/notes.jpeg"
            alt="Notes"
            width={400}
            height={250}
            className="object-cover rounded-xl shadow-lg"
          />
        </div>
      </section>

      {/* Transporte Section */}
      <section className="flex flex-col md:flex-row items-center justify-between px-6 md:px-10 py-20
        bg-gradient-to-b from-duoc-gray to-duoc-blue text-white">
        <div className="md:w-1/2">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Movilización Compartida</h2>
          <p className="text-base sm:text-lg md:text-xl">
            Publica tus rutas en auto y ofrece transporte a tus compañeros.
            ¡Conecta con quienes comparten tu camino!
          </p>
        </div>
        <div className="md:w-1/2 flex justify-center mt-6 md:mt-0">
          <Image
            src="/images/carpool.jpg"
            alt="Carpooling"
            width={400}
            height={250}
            className="object-cover rounded-xl shadow-lg"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="flex flex-col items-center justify-center py-20 bg-duoc-blue text-duoc-white text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
          ¿Listo para comenzar?
        </h2>
        <Link href="/register" className="w-full sm:w-auto">
          <button className="px-6 py-3 bg-duoc-white text-duoc-blue font-semibold rounded-lg shadow-md
            hover:bg-duoc-yellow hover:text-duoc-blue transition w-full sm:w-auto">
            Empezar
          </button>
        </Link>
      </section>
    </main>
  );
}
