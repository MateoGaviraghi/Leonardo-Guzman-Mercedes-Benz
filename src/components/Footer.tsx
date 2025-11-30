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
          </div>
          <div className="flex space-x-6">
            {/* Add social icons here later */}
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <span className="sr-only">Instagram</span>
              Instagram
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <span className="sr-only">LinkedIn</span>
              LinkedIn
            </a>
            <a
              href="#"
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
