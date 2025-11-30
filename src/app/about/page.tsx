import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          <div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-12 leading-none">
              SOBRE <br /> MÍ.
            </h1>
            <div className="prose prose-invert prose-lg text-gray-400">
              <p className="mb-6 text-xl text-white font-medium">
                Soy Leonardo Guzman, Promotor Oficial de Automotores Mega,
                concesionario oficial Mercedes-Benz.
              </p>
              <p className="mb-6">
                Mi compromiso es brindar una experiencia de compra excepcional,
                guiando a cada cliente hacia el vehículo que mejor se adapta a
                sus necesidades y estilo de vida. Con años de experiencia en el
                sector automotriz de lujo, entiendo que adquirir un
                Mercedes-Benz no es solo comprar un auto, es invertir en
                excelencia, seguridad y prestigio.
              </p>
              <p className="mb-12">
                En Automotores Mega, nos enorgullecemos de ofrecer el mejor
                servicio post-venta y atención personalizada. Estoy aquí para
                asesorarte en cada paso del camino.
              </p>

              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 font-bold text-sm tracking-widest hover:bg-mb-blue hover:text-white transition-colors duration-300"
              >
                PONERSE EN CONTACTO <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          <div className="relative aspect-[3/4] bg-zinc-900 overflow-hidden">
            {/* Placeholder for Leonardo's photo */}
            <div className="absolute inset-0 flex items-center justify-center text-zinc-600">
              <span>Foto de Leonardo Guzman</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
