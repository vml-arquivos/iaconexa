import { useState } from "react";
import { Package, Search, ShoppingCart, Check, AlertCircle } from "lucide-react";

interface MaterialItem {
  id: string;
  name: string;
  category: string;
  icon: string;
  available: number;
  unit: string;
}

const mockMaterials: MaterialItem[] = [
  { id: "1", name: "Fralda G", category: "HIGIENE", icon: "🧷", available: 150, unit: "un" },
  { id: "2", name: "Lenço Umedecido", category: "HIGIENE", icon: "🧻", available: 200, unit: "pct" },
  { id: "3", name: "Papel A4", category: "PEDAGOGICO", icon: "📄", available: 5000, unit: "fls" },
  { id: "4", name: "Lápis de Cor", category: "PEDAGOGICO", icon: "✏️", available: 500, unit: "un" },
  { id: "5", name: "Tinta Guache", category: "PEDAGOGICO", icon: "🎨", available: 80, unit: "un" },
  { id: "6", name: "Leite sem Lactose", category: "ALIMENTACAO", icon: "🥛", available: 5, unit: "L" },
  { id: "7", name: "Suco Natural", category: "ALIMENTACAO", icon: "🧃", available: 30, unit: "L" },
  { id: "8", name: "Biscoito Integral", category: "ALIMENTACAO", icon: "🍪", available: 100, unit: "pct" },
];

export default function MaterialRequest() {
  const [selectedClass, setSelectedClass] = useState("Berçário 1");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("TODOS");
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const categories = ["TODOS", "HIGIENE", "PEDAGOGICO", "ALIMENTACAO"];

  const filteredMaterials = mockMaterials.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "TODOS" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (itemId: string) => {
    setCart((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const newCart = { ...prev };
      if (newCart[itemId] > 1) {
        newCart[itemId]--;
      } else {
        delete newCart[itemId];
      }
      return newCart;
    });
  };

  const getTotalItems = () => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  };

  const handleSubmitRequest = () => {
    // Aqui seria a chamada à API
    console.log("Pedido enviado:", { class: selectedClass, items: cart });
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setCart({});
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="w-6 h-6 text-blue-600" />
              Requisição de Materiais
            </h1>
            <div className="text-xs text-gray-500 font-medium">
              Sistema <span className="font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">CONEXA</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-1">Solicite materiais para sua turma</p>
        </div>

        {/* Class Selector */}
        <div className="px-4 pb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Turma</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option>Berçário 1</option>
            <option>Berçário 2</option>
            <option>Maternal 1</option>
            <option>Maternal 2</option>
            <option>Pré 1</option>
          </select>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar material..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="px-4 pb-4 overflow-x-auto">
          <div className="flex gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Materials Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filteredMaterials.map((item) => {
            const inCart = cart[item.id] || 0;
            const isLowStock = item.available < 20;

            return (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                {/* Icon */}
                <div className="text-4xl mb-2 text-center">{item.icon}</div>

                {/* Name */}
                <h3 className="text-sm font-semibold text-gray-900 text-center mb-1 line-clamp-2">
                  {item.name}
                </h3>

                {/* Stock Info */}
                <div className="text-center mb-3">
                  <span
                    className={`text-xs font-medium ${
                      isLowStock ? "text-red-600" : "text-gray-600"
                    }`}
                  >
                    {item.available} {item.unit}
                  </span>
                  {isLowStock && (
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3 text-red-600" />
                      <span className="text-xs text-red-600">Estoque baixo</span>
                    </div>
                  )}
                </div>

                {/* Add/Remove Buttons */}
                {inCart === 0 ? (
                  <button
                    onClick={() => addToCart(item.id)}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Solicitar
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
                    >
                      −
                    </button>
                    <span className="text-lg font-bold text-gray-900 min-w-[30px] text-center">
                      {inCart}
                    </span>
                    <button
                      onClick={() => addToCart(item.id)}
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Cart Button */}
      {getTotalItems() > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg">
          <button
            onClick={handleSubmitRequest}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Enviar Pedido ({getTotalItems()} itens)</span>
          </button>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center animate-fade-in">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Pedido Enviado!</h3>
            <p className="text-gray-600">
              Seu pedido foi registrado e será processado em breve.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
