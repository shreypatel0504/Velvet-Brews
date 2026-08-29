import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Coffee, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/store/useCartStore";
import toast from "react-hot-toast";

interface ItemCustomizationModalProps {
  item: {
    id: string;
    name: string;
    price: number;
    description?: string;
    imageUrl: string;
    category?: string;
  } | null;
  onClose: () => void;
}

export const ItemCustomizationModal: React.FC<ItemCustomizationModalProps> = ({ item, onClose }) => {
  const { addItem } = useCartStore();

  const [milk, setMilk] = React.useState({ name: "Whole Milk", price: 0 });
  const [sugar, setSugar] = React.useState("Regular Sugar (100%)");
  const [size, setSize] = React.useState({ name: "Regular (250ml)", price: 0 });
  const [addons, setAddons] = React.useState<{ name: string; price: number }[]>([]);
  const [quantity, setQuantity] = React.useState(1);

  if (!item) return null;

  const isBeverage = !item.category || item.category.toLowerCase().includes("coffee") || item.category.toLowerCase().includes("tea") || item.category.toLowerCase().includes("beverage");

  const milkOptions = [
    { name: "Whole Milk", price: 0 },
    { name: "Almond Milk", price: 30 },
    { name: "Oat Milk", price: 40 },
    { name: "Soy Milk", price: 35 }
  ];

  const sugarOptions = ["Unsweetened (0%)", "Less Sweet (50%)", "Regular Sugar (100%)", "Extra Sweet"];

  const sizeOptions = [
    { name: "Regular (250ml)", price: 0 },
    { name: "Large Iced (450ml)", price: 40 }
  ];

  const addonOptions = [
    { name: "Extra Espresso Shot", price: 50 },
    { name: "Whipped Cream", price: 30 },
    { name: "Caramel Drizzle", price: 25 },
    { name: "Vanilla Syrup", price: 25 }
  ];

  const toggleAddon = (addon: { name: string; price: number }) => {
    if (addons.some((a) => a.name === addon.name)) {
      setAddons(addons.filter((a) => a.name !== addon.name));
    } else {
      setAddons([...addons, addon]);
    }
  };

  const extraTotal = (milk.price + size.price + addons.reduce((sum, a) => sum + a.price, 0));
  const finalUnitPrice = item.price + extraTotal;
  const totalPrice = finalUnitPrice * quantity;

  const handleAddToCart = () => {
    const selectedCustomizations: string[] = [];
    if (isBeverage) {
      if (milk.price > 0) selectedCustomizations.push(`${milk.name} (+₹${milk.price})`);
      else selectedCustomizations.push(milk.name);

      selectedCustomizations.push(sugar);

      if (size.price > 0) selectedCustomizations.push(`${size.name} (+₹${size.price})`);
      else selectedCustomizations.push(size.name);

      addons.forEach((a) => selectedCustomizations.push(`${a.name} (+₹${a.price})`));
    }

    const customKey = `${item.id}-${selectedCustomizations.join("-")}`;

    addItem({
      id: item.id,
      cartItemId: customKey,
      name: item.name,
      price: finalUnitPrice,
      quantity,
      imageUrl: item.imageUrl,
      customizations: selectedCustomizations
    });

    toast.success(`Added ${quantity}x ${item.name} to cart!`);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative max-w-md w-full bg-white rounded-3xl shadow-2xl z-10 overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col justify-between"
        >
          {/* Header */}
          <div className="relative h-48 bg-gray-100 shrink-0">
            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/50 hover:bg-black text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="absolute bottom-3 left-4 right-4 text-white">
              <span className="text-[10px] font-bold bg-[var(--color-cafe-primary)] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Customize Your Order
              </span>
              <h3 className="font-heading text-xl font-bold mt-1">{item.name}</h3>
              <p className="text-xs text-amber-200 font-bold">₹{item.price} base price</p>
            </div>
          </div>

          {/* Scrollable Customization Options */}
          <div className="p-5 space-y-5 overflow-y-auto custom-scrollbar flex-1 text-xs">
            {isBeverage ? (
              <>
                {/* Milk Choice */}
                <div>
                  <h4 className="font-bold text-gray-800 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1">
                    <Coffee className="h-3.5 w-3.5 text-[var(--color-cafe-primary)]" /> Choice of Milk
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {milkOptions.map((opt) => (
                      <button
                        key={opt.name}
                        onClick={() => setMilk(opt)}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                          milk.name === opt.name
                            ? "border-[var(--color-cafe-primary)] bg-amber-50 text-[var(--color-cafe-primary)] font-bold shadow-xs"
                            : "border-gray-200 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <span>{opt.name}</span>
                        <span className="text-[10px] text-gray-500">{opt.price > 0 ? `+₹${opt.price}` : 'Free'}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sweetness */}
                <div>
                  <h4 className="font-bold text-gray-800 uppercase tracking-wider text-[11px] mb-2">
                    Sweetness Level
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {sugarOptions.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSugar(s)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          sugar === s
                            ? "border-[var(--color-cafe-primary)] bg-amber-50 text-[var(--color-cafe-primary)] font-bold shadow-xs"
                            : "border-gray-200 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size & Temp */}
                <div>
                  <h4 className="font-bold text-gray-800 uppercase tracking-wider text-[11px] mb-2">
                    Serving Size & Temp
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {sizeOptions.map((sz) => (
                      <button
                        key={sz.name}
                        onClick={() => setSize(sz)}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                          size.name === sz.name
                            ? "border-[var(--color-cafe-primary)] bg-amber-50 text-[var(--color-cafe-primary)] font-bold shadow-xs"
                            : "border-gray-200 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <span>{sz.name}</span>
                        <span className="text-[10px] text-gray-500">{sz.price > 0 ? `+₹${sz.price}` : 'Free'}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Add-ons */}
                <div>
                  <h4 className="font-bold text-gray-800 uppercase tracking-wider text-[11px] mb-2">
                    Extra Add-ons
                  </h4>
                  <div className="space-y-1.5">
                    {addonOptions.map((ad) => {
                      const isChecked = addons.some((a) => a.name === ad.name);
                      return (
                        <button
                          key={ad.name}
                          onClick={() => toggleAddon(ad)}
                          className={`w-full p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                            isChecked
                              ? "border-emerald-500 bg-emerald-50 text-emerald-900 font-bold"
                              : "border-gray-200 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${isChecked ? 'bg-emerald-600 border-transparent text-white' : 'border-gray-300'}`}>
                              {isChecked && <Check className="h-3 w-3" />}
                            </div>
                            <span>{ad.name}</span>
                          </div>
                          <span className="text-[10px] font-bold text-amber-800">+₹{ad.price}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-100 text-gray-700 space-y-2">
                <p className="font-bold text-gray-900">Freshly Prepared Dish</p>
                <p className="text-gray-600 leading-relaxed">
                  {item.description || "Prepared fresh to order by our master chefs with natural ingredients."}
                </p>
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="p-4 bg-gray-50 border-t border-gray-100 shrink-0 space-y-3">
            <div className="flex items-center justify-between">
              {/* Quantity Counter */}
              <div className="flex items-center border border-gray-200 bg-white rounded-xl">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-l-xl font-bold"
                >
                  -
                </button>
                <span className="px-3 font-bold text-gray-900 text-sm">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-r-xl font-bold"
                >
                  +
                </button>
              </div>

              {/* Price total */}
              <div className="text-right">
                <span className="text-[10px] text-gray-400 font-bold block uppercase">Total Price</span>
                <span className="text-lg font-black text-gray-900">₹{totalPrice}</span>
              </div>
            </div>

            <Button onClick={handleAddToCart} className="w-full gap-2 rounded-xl py-3 font-bold text-sm">
              <Plus className="h-4 w-4" /> Add to Order • ₹{totalPrice}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
