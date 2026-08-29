import type { MenuItem } from '@/types';
export type { MenuItem };

export const FALLBACK_MENU: MenuItem[] = [
  // --- COFFEE (10 items) ---
  {
    _id: "m1",
    name: "Espresso",
    description: "Rich and bold shot of pure coffee, brewed to perfection.",
    price: 120,
    category: "Coffee",
    imageUrl: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=500&q=80",
    isAvailable: true
  },
  {
    _id: "m2",
    name: "Cappuccino",
    description: "Equal parts espresso, steamed milk, and milk foam.",
    price: 160,
    category: "Coffee",
    imageUrl: "https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=500&q=80",
    isAvailable: true
  },
  {
    _id: "m3",
    name: "Vanilla Latte",
    description: "Smooth espresso mixed with steamed milk and vanilla.",
    price: 180,
    category: "Coffee",
    imageUrl: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=500&q=80",
    isAvailable: true
  },
  {
    _id: "m4",
    name: "Caramel Macchiato",
    description: "Steamed milk with vanilla marked with espresso & caramel.",
    price: 210,
    category: "Coffee",
    imageUrl: "https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&w=500&q=80",
    isAvailable: true
  },
  {
    _id: "m5",
    name: "Cafe Mocha",
    description: "Espresso blended with rich chocolate and steamed milk.",
    price: 190,
    category: "Coffee",
    imageUrl: "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?auto=format&fit=crop&w=500&q=80",
    isAvailable: true
  },
  {
    _id: "m6",
    name: "Cold Brew Classic",
    description: "Slow-steeped in cool water for 20 hours.",
    price: 150,
    category: "Coffee",
    imageUrl: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=500&q=80",
    isAvailable: true
  },
  {
    _id: "m7",
    name: "Iced Hazelnut Mocha",
    description: "Espresso, chocolate, hazelnut syrup over ice.",
    price: 230,
    category: "Coffee",
    imageUrl: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=500&q=80",
    isAvailable: true
  },
  {
    _id: "m8",
    name: "Irish Cream Latte",
    description: "Velvety espresso with smooth Irish cream flavor.",
    price: 220,
    category: "Coffee",
    imageUrl: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=500&q=80",
    isAvailable: true
  },
  {
    _id: "m9",
    name: "Flat White",
    description: "Double espresso with microfoam steamed milk.",
    price: 170,
    category: "Coffee",
    imageUrl: "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?auto=format&fit=crop&w=500&q=80",
    isAvailable: true
  },
  {
    _id: "m10",
    name: "Affogato Al Caffe",
    description: "Shot of hot espresso poured over vanilla gelato.",
    price: 220,
    category: "Coffee",
    imageUrl: "https://images.unsplash.com/photo-1592663527359-cf6642f54cff?auto=format&fit=crop&w=500&q=80",
    isAvailable: true
  },

  // --- TEA (8 items) ---
  {
    _id: "m11",
    name: "Masala Chai",
    description: "Traditional Indian tea brewed with fragrant spices.",
    price: 80,
    category: "Tea",
    imageUrl: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=500&q=80",
    isAvailable: true
  },
  {
    _id: "m12",
    name: "Ginger Elaichi Chai",
    description: "Fresh crushed ginger and cardamom brewed tea.",
    price: 90,
    category: "Tea",
    imageUrl: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=500&q=80",
    isAvailable: true
  },
  {
    _id: "m13",
    name: "Matcha Green Tea Latte",
    description: "Premium grade matcha green tea with steamed milk.",
    price: 190,
    category: "Tea",
    imageUrl: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=500&q=80",
    isAvailable: true
  },
  {
    _id: "m14",
    name: "Earl Grey Tea",
    description: "Black tea blend infused with citrusy bergamot oil.",
    price: 130,
    category: "Tea",
    imageUrl: "https://images.unsplash.com/photo-1563822249548-9a72b6353cd1?auto=format&fit=crop&w=500&q=80",
    isAvailable: true
  },
  {
    _id: "m15",
    name: "Iced Peach Tea",
    description: "Brewed black tea infused with peach and ice.",
    price: 140,
    category: "Tea",
    imageUrl: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=500&q=80",
    isAvailable: true
  },
  {
    _id: "m16",
    name: "Lemon Honey Ginger Tea",
    description: "Zesty lemon, natural ginger, and raw honey infusion.",
    price: 110,
    category: "Tea",
    imageUrl: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=500&q=80",
    isAvailable: true
  },
  {
    _id: "m17",
    name: "Chamomile Herbal Tea",
    description: "Calming chamomile flowers steeped in hot water.",
    price: 120,
    category: "Tea",
    imageUrl: "https://images.unsplash.com/photo-1571934811356-5cc561b6821f?auto=format&fit=crop&w=500&q=80",
    isAvailable: true
  },
  {
    _id: "m18",
    name: "Rose Hibiscus Green Tea",
    description: "Organic green tea layered with rose petals & hibiscus.",
    price: 130,
    category: "Tea",
    imageUrl: "https://images.unsplash.com/photo-1523920290228-4f34f514f44c?auto=format&fit=crop&w=500&q=80",
    isAvailable: true
  },

  // --- PIZZA (8 items) ---
  {
    _id: "m19",
    name: "Margherita Pizza",
    description: "Fresh tomato sauce, mozzarella, and fresh basil.",
    price: 290,
    category: "Pizza",
    imageUrl: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=500&q=80",
    isAvailable: true
  },
  {
    _id: "m20",
    name: "Paneer Tikka Pizza",
    description: "Spiced marinated paneer, capsicum, and mozzarella.",
    price: 340,
    category: "Pizza",
    imageUrl: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=500&q=80",
    isAvailable: true
  },
  {
    _id: "m21",
    name: "Farmhouse Veggie Pizza",
    description: "Bell peppers, corn, mushrooms, olives & extra cheese.",
    price: 360,
    category: "Pizza",
    imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80",
    isAvailable: true
  },
  {
    _id: "m22",
    name: "Peri Peri Cottage Cheese Pizza",
    description: "Fiery peri peri paneer, jalapenos, and paprika.",
    price: 380,
    category: "Pizza",
    imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=500&q=80",
    isAvailable: true
  },
  {
    _id: "m23",
    name: "Four Cheese Gourmet Pizza",
    description: "Mozzarella, Processed, Cheddar & Cream Cheese.",
    price: 420,
    category: "Pizza",
    imageUrl: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=500&q=80",
    isAvailable: true
  },
  {
    _id: "m24",
    name: "Mexican Corn & Jalapeno Pizza",
    description: "Sweet corn, pickled jalapenos, salsa drizzle & cheese.",
    price: 350,
    category: "Pizza",
    imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=500&q=80",
    isAvailable: true
  },
  {
    _id: "m25",
    name: "Tandoori Mushroom Pizza",
    description: "Smoky tandoori marinated mushrooms with onions.",
    price: 360,
    category: "Pizza",
    imageUrl: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&w=500&q=80",
    isAvailable: true
  },
  {
    _id: "m26",
    name: "Cheesy Garlic Crust Pizza",
    description: "Stuffed garlic butter crust topped with herbs & cheese.",
    price: 330,
    category: "Pizza",
    imageUrl: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&w=500&q=80",
    isAvailable: true
  },

  // --- SANDWICH (8 items) ---
  {
    _id: "m27",
    name: "Bombay Grilled Sandwich",
    description: "Spiced potato mash, mint chutney, and cheese toasted.",
    price: 180,
    category: "Sandwich",
    imageUrl: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=500&q=80",
    isAvailable: true
  },
  {
    _id: "m28",
    name: "Paneer Cheese Club Sandwich",
    description: "Triple-decker toasted sandwich with cottage cheese.",
    price: 220,
    category: "Sandwich",
    imageUrl: "https://images.unsplash.com/photo-1539252554453-80ab65ce3586?auto=format&fit=crop&w=500&q=80",
    isAvailable: true
  },
  {
    _id: "m29",
    name: "Classic Veg Mayo Sandwich",
    description: "Fresh vegetables folded in garlic mayo.",
    price: 150,
    category: "Sandwich",
    imageUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=500&q=80",
    isAvailable: true
  },
  {
    _id: "m30",
    name: "Cheese Garlic Toastie",
    description: "Artisan sourdough with garlic butter & chilies.",
    price: 160,
    category: "Sandwich",
    imageUrl: "https://images.unsplash.com/photo-1619860860774-1e2e17343432?auto=format&fit=crop&w=500&q=80",
    isAvailable: true
  },
  {
    _id: "m31",
    name: "Corn & Cheese Grilled Sandwich",
    description: "Sweet corn kernels smothered in molten cheese sauce.",
    price: 170,
    category: "Sandwich",
    imageUrl: "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=500&q=80",
    isAvailable: true
  },
  {
    _id: "m32",
    name: "Spinach & Mushroom Toastie",
    description: "Sauteed garlic spinach and button mushrooms.",
    price: 190,
    category: "Sandwich",
    imageUrl: "https://images.unsplash.com/photo-1554433607-66b5e9d38c7e?auto=format&fit=crop&w=500&q=80",
    isAvailable: true
  },
  {
    _id: "m33",
    name: "Avocado Mayo Sandwich",
    description: "Smashed avocado and cucumber in multigrain bread.",
    price: 230,
    category: "Sandwich",
    imageUrl: "https://images.unsplash.com/photo-1521305916504-4a1121188589?auto=format&fit=crop&w=500&q=80",
    isAvailable: true
  },
  {
    _id: "m34",
    name: "Nutella Banana Toastie",
    description: "Warm toasted brioche filled with Nutella & fresh banana.",
    price: 180,
    category: "Sandwich",
    imageUrl: "https://images.unsplash.com/photo-1559466273-d95e72debaf8?auto=format&fit=crop&w=500&q=80",
    isAvailable: true
  },

  // --- PASTRIES & DESSERTS (8 items) ---
  {
    _id: "m35",
    name: "Butter Croissant",
    description: "Flaky, buttery, freshly baked daily.",
    price: 130,
    category: "Pastries",
    imageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=500&q=80",
    isAvailable: true
  },
  {
    _id: "m36",
    name: "Chocolate Almond Croissant",
    description: "Flaky croissant filled with chocolate and almonds.",
    price: 170,
    category: "Pastries",
    imageUrl: "https://images.unsplash.com/photo-1530610476181-d83430b64dcd?auto=format&fit=crop&w=500&q=80",
    isAvailable: true
  },
  {
    _id: "m37",
    name: "Belgian Chocolate Waffle",
    description: "Golden waffle drizzled with warm Belgian chocolate.",
    price: 210,
    category: "Pastries",
    imageUrl: "https://images.unsplash.com/photo-1562376552-0d160a2f238d?auto=format&fit=crop&w=500&q=80",
    isAvailable: true
  },
  {
    _id: "m38",
    name: "New York Cheesecake Slice",
    description: "Rich classic baked cheesecake with blueberry compote.",
    price: 260,
    category: "Pastries",
    imageUrl: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=500&q=80",
    isAvailable: true
  },
  {
    _id: "m39",
    name: "Double Chocolate Muffin",
    description: "Moist chocolate muffin with dark chocolate chips.",
    price: 140,
    category: "Pastries",
    imageUrl: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&w=500&q=80",
    isAvailable: true
  },
  {
    _id: "m40",
    name: "Tiramisu Pastry Slice",
    description: "Italian coffee-soaked ladyfingers with mascarpone.",
    price: 250,
    category: "Pastries",
    imageUrl: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=500&q=80",
    isAvailable: true
  },
  {
    _id: "m41",
    name: "Warm Chocolate Fudge Brownie",
    description: "Dense chocolate brownie served warm.",
    price: 180,
    category: "Pastries",
    imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=500&q=80",
    isAvailable: true
  },
  {
    _id: "m42",
    name: "French Vanilla Macaron (Set of 3)",
    description: "Delicate almond meringue cookies with vanilla ganache.",
    price: 240,
    category: "Pastries",
    imageUrl: "https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&w=500&q=80",
    isAvailable: true
  },

  // --- FOOD & MAINS (8 items) ---
  {
    _id: "m43",
    name: "Avocado Sourdough Toast",
    description: "Smashed avocado on sourdough with chili flakes.",
    price: 270,
    category: "Food",
    imageUrl: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&w=500&q=80",
    isAvailable: true
  },
  {
    _id: "m44",
    name: "Loaded Cheese Nachos",
    description: "Tortilla chips with cheese sauce, salsa, and jalapenos.",
    price: 230,
    category: "Food",
    imageUrl: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=500&q=80",
    isAvailable: true
  },
  {
    _id: "m45",
    name: "Classic French Fries",
    description: "Crispy salted golden potato fries served with dip.",
    price: 130,
    category: "Food",
    imageUrl: "https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=500&q=80",
    isAvailable: true
  },
  {
    _id: "m46",
    name: "Cheesy Garlic Breadsticks",
    description: "Freshly baked breadsticks loaded with garlic butter.",
    price: 180,
    category: "Food",
    imageUrl: "https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?auto=format&fit=crop&w=500&q=80",
    isAvailable: true
  },
  {
    _id: "m47",
    name: "Arrabbiata Red Sauce Pasta",
    description: "Penne pasta tossed in spicy tomato, garlic & herb sauce.",
    price: 280,
    category: "Food",
    imageUrl: "https://images.unsplash.com/photo-1621996346565-e3d5d6281273?auto=format&fit=crop&w=500&q=80",
    isAvailable: true
  },
  {
    _id: "m48",
    name: "Crispy Veggie Burger",
    description: "Crispy herb potato patty with lettuce, tomatoes & mayo.",
    price: 190,
    category: "Food",
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80",
    isAvailable: true
  },
  {
    _id: "m49",
    name: "Hummus & Warm Pita Bread",
    description: "Creamy chickpea hummus with extra virgin olive oil & pita.",
    price: 260,
    category: "Food",
    imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=500&q=80",
    isAvailable: true
  },
  {
    _id: "m50",
    name: "Stuffed Mushroom Caps",
    description: "Button mushrooms stuffed with herbs, garlic & baked cheese.",
    price: 270,
    category: "Food",
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=500&q=80",
    isAvailable: true
  }
];
