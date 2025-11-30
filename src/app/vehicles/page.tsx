import VehicleCard from "@/components/VehicleCard";
import Link from "next/link";

export default async function VehiclesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const category =
    typeof resolvedSearchParams.category === "string"
      ? resolvedSearchParams.category
      : "all";

  const vehicles = [
    {
      id: "1",
      name: "Clase A Hatchback",
      category: "auto",
      image:
        "https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=2070&auto=format&fit=crop",
      price: "Consultar",
    },
    {
      id: "2",
      name: "Clase C Sedán",
      category: "auto",
      image:
        "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=2070&auto=format&fit=crop",
      price: "Consultar",
    },
    {
      id: "3",
      name: "GLA SUV",
      category: "suv",
      image:
        "https://images.unsplash.com/photo-1609521263047-f8f205293f24?q=80&w=2070&auto=format&fit=crop",
      price: "Consultar",
    },
    {
      id: "4",
      name: "GLC SUV",
      category: "suv",
      image:
        "https://images.unsplash.com/photo-1506015391300-4802dc74de2e?q=80&w=2159&auto=format&fit=crop",
      price: "Consultar",
    },
    {
      id: "5",
      name: "Sprinter Furgón",
      category: "sprinter",
      image:
        "https://images.unsplash.com/photo-1566008885218-90abf9200ddb?q=80&w=2000&auto=format&fit=crop",
      price: "Consultar",
    },
    {
      id: "6",
      name: "Actros",
      category: "trucks",
      image:
        "https://images.unsplash.com/photo-1591768793355-74d04bb6608f?q=80&w=2072&auto=format&fit=crop",
      price: "Consultar",
    },
    {
      id: "7",
      name: "Vito Furgón",
      category: "vans",
      image:
        "https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?q=80&w=2072&auto=format&fit=crop",
      price: "Consultar",
    },
    {
      id: "8",
      name: "GLE SUV",
      category: "suv",
      image:
        "https://images.unsplash.com/photo-1605218427368-35b019b8a394?q=80&w=1974&auto=format&fit=crop",
      price: "Consultar",
    },
  ];

  const filteredVehicles =
    category === "all"
      ? vehicles
      : vehicles.filter((v) => v.category === category);

  const categories = [
    { id: "all", name: "Todos" },
    { id: "auto", name: "Autos" },
    { id: "suv", name: "SUVs" },
    { id: "vans", name: "Vans" },
    { id: "sprinter", name: "Sprinter" },
    { id: "trucks", name: "Trucks" },
    { id: "usados", name: "Usados" },
  ];

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="mb-16">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8">
            Nuestros Vehículos
          </h1>

          {/* Minimalist Filter */}
          <div className="flex flex-wrap gap-8 border-b border-white/20 pb-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/vehicles?category=${cat.id}`}
                className={`text-sm font-bold tracking-widest uppercase transition-colors hover:text-mb-blue ${
                  category === cat.id
                    ? "text-white border-b-2 border-white pb-4 -mb-4.5"
                    : "text-gray-500"
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
          {filteredVehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              title={vehicle.name}
              category={vehicle.category}
              href={`/vehicles/${vehicle.id}`} // Assuming individual vehicle pages exist or will exist
              image={vehicle.image}
            />
          ))}
        </div>

        {filteredVehicles.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            No se encontraron vehículos en esta categoría.
          </div>
        )}
      </div>
    </div>
  );
}
