export default function Footer() {
  return (
    <footer className="bg-black text-white border-t border-mb-gray/20 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0 text-center md:text-left">
            <h3 className="text-lg font-bold">LEONARDO GUZMAN</h3>
            <p className="text-sm text-mb-silver">
              Promotor Oficial Automotores Mega
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Concesionario Oficial Mercedes-Benz
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Acceso Norte República de Entre Ríos 5660
              <br />
              E3100 Paraná, Entre Ríos
            </p>
          </div>
          <div className="flex space-x-6">
            <a
              href="https://www.instagram.com/leoguzmanmbenz/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <span className="sr-only">Instagram</span>
              Instagram
            </a>
            <a
              href="https://wa.me/5493425037000"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <span className="sr-only">WhatsApp</span>
              WhatsApp
            </a>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-800 pt-8 text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} Leonardo Guzman. All rights
          reserved.
        </div>
      </div>
    </footer>
  );
}
