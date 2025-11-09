import Image from "next/image";
import Link from "next/link";
import BotonCorazonFlotante from "@/components/BotonCorazonFlotante";

export default function Home() {
  return (
    <main className="bg-duoc-gray text-duoc-blue">

      <section
        className="relative flex flex-col items-center justify-center bg-duoc-yellow text-duoc-blue px-6 text-center"
        style={{ minHeight: "calc(100vh - 80px)" }}
      >

        <div className="absolute top-6 right-6 flex gap-4 items-center">
          <Link
            href="/login"
            className="px-4 py-2 bg-duoc-blue !text-white font-semibold rounded-lg shadow-md hover:bg-white hover:!text-duoc-blue transition w-full sm:w-auto"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 bg-duoc-blue !text-white font-semibold rounded-lg shadow-md hover:bg-white hover:!text-duoc-blue transition w-full sm:w-auto"
          >
            Registrarse
          </Link>


          <BotonCorazonFlotante />
        </div>

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

    </main>
  );
}