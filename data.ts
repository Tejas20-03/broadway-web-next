import { Product, Category, ProductOption, ProductOptionGroup } from './types';

export const CATEGORIES: Category[] = [
  { id: 'trending', label: 'Trending' },
  { id: 'promotions', label: 'Deals' },
  { id: 'premium', label: 'Premium' },
  { id: 'classic', label: 'Classic' },
  { id: 'sidelines', label: 'Sidelines' },
  { id: 'pastas', label: 'Pastas' },
  { id: 'sandwiches', label: 'Sandwiches' },
  { id: 'desserts', label: 'Desserts' },
  { id: 'beverages', label: 'Beverages' },
];

// Reusable Options
const PIZZA_SIZES = [
  { id: 'sm', label: 'Small (6")', price: 599 },
  { id: 'md', label: 'Medium (10")', price: 1299 },
  { id: 'lg', label: 'Large (13")', price: 1899 },
  { id: 'xl', label: 'Jumbo (16")', price: 2499 },
];

const PIZZA_CRUSTS_OPTIONS: ProductOption[] = [
  { id: 'pan', name: 'Pan (Thick)', price: 0 },
  { id: 'thin', name: 'Italian Thin', price: 0 },
  { id: 'stuffed', name: 'Cheese Stuffed', price: 250 },
  { id: 'kebab', name: 'Kebab Crust', price: 350 },
];

const ADDONS_OPTIONS: ProductOption[] = [
  { id: 'cheese', name: 'Extra Cheese', price: 150, image: 'https://cdn-icons-png.flaticon.com/512/814/814278.png' },
  { id: 'dip', name: 'Garlic Dip', price: 80, image: 'https://cdn-icons-png.flaticon.com/512/184/184564.png' },
  { id: 'drink', name: 'Soft Drink (500ml)', price: 120, image: 'https://cdn-icons-png.flaticon.com/512/2722/2722527.png' },
];

// Option Groups
const PIZZA_OPTION_GROUPS: ProductOptionGroup[] = [
  {
    id: 'crust',
    name: 'Choose Crust',
    minSelection: 1,
    maxSelection: 1,
    options: PIZZA_CRUSTS_OPTIONS
  },
  {
    id: 'addons',
    name: 'Addons',
    minSelection: 0,
    maxSelection: 10,
    options: ADDONS_OPTIONS
  }
];

const ONLY_ADDONS_GROUP: ProductOptionGroup[] = [
  {
    id: 'addons',
    name: 'Addons',
    minSelection: 0,
    maxSelection: 10,
    options: ADDONS_OPTIONS
  }
];

export const PRODUCTS: Product[] = [
  // --- Trending ---
  {
    id: '1',
    name: 'Cheesy Wedding',
    description: 'A match made in heaven. Creamy cheese base with tikka chunks and onions.',
    basePrice: 599,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800',
    category: 'trending',
    tags: ['Best Seller'],
    isNew: true,
    rating: 4.8,
    serves: 2,
    sizes: PIZZA_SIZES,
    optionGroups: PIZZA_OPTION_GROUPS
  },
  {
    id: '2',
    name: 'Hearty Valentine',
    description: 'Heart shaped special edition deep pan loaded with pepperoni and love.',
    basePrice: 1499,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=800',
    category: 'trending',
    tags: ['Limited Time'],
    rating: 4.9,
    serves: 2,
    sizes: [{ id: 'regular', label: 'Regular Heart', price: 1499 }],
    optionGroups: ONLY_ADDONS_GROUP
  },
  
  // --- Promotions ---
  {
    id: '3',
    name: 'Midnight Deal 1',
    description: '1 Small Pizza + 500ml Drink. Valid from 12 AM to 3 AM.',
    basePrice: 650,
    originalPrice: 800,
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&q=80&w=800',
    category: 'promotions',
    tags: ['Save 18%'],
    serves: 1
  },
  {
    id: '4',
    name: 'Family Feast',
    description: '2 Large Pizzas + 1.5L Drink + Garlic Bread.',
    basePrice: 3999,
    originalPrice: 4800,
    image: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&q=80&w=800',
    category: 'promotions',
    tags: ['Best Value'],
    serves: 6
  },

  // --- Premium ---
  {
    id: '5',
    name: 'Creamy Tikka',
    description: 'Tikka chunks on a white creamy sauce base.',
    basePrice: 599,
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&q=80&w=800',
    category: 'premium',
    rating: 4.5,
    sizes: PIZZA_SIZES,
    optionGroups: PIZZA_OPTION_GROUPS
  },
  {
    id: '6',
    name: 'Sriracha Spicy',
    description: 'For the heat lovers. Sriracha sauce, jalapenos, and spicy chicken.',
    basePrice: 599,
    image: 'https://images.unsplash.com/photo-1593560708920-631629e9d11b?auto=format&fit=crop&q=80&w=800',
    category: 'premium',
    tags: ['Spicy'],
    sizes: PIZZA_SIZES,
    optionGroups: PIZZA_OPTION_GROUPS
  },
  {
    id: '7',
    name: 'Ranch Special',
    description: 'Our signature ranch sauce drizzled over fajita chicken.',
    basePrice: 599,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=800',
    category: 'premium',
    sizes: PIZZA_SIZES,
    optionGroups: PIZZA_OPTION_GROUPS
  },

  // --- Classic ---
  {
    id: '8',
    name: 'Chicken Tikka',
    description: 'The classic Pakistani flavor.',
    basePrice: 499,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&q=80&w=800',
    category: 'classic',
    sizes: PIZZA_SIZES,
    optionGroups: PIZZA_OPTION_GROUPS
  },
  {
    id: '9',
    name: 'Chicken Fajita',
    description: 'Mexican style chicken with onions and capsicum.',
    basePrice: 499,
    image: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&q=80&w=800',
    category: 'classic',
    sizes: PIZZA_SIZES,
    optionGroups: PIZZA_OPTION_GROUPS
  },

  // --- Sidelines ---
  {
    id: '10',
    name: 'Garlic Bread',
    description: '4 pcs of toasted baguette with garlic butter.',
    basePrice: 299,
    image: 'https://images.unsplash.com/photo-1573140247632-f84660f67126?auto=format&fit=crop&q=80&w=800',
    category: 'sidelines'
  },
  {
    id: '11',
    name: 'Chicken Wings',
    description: '6 pcs oven baked wings.',
    basePrice: 550,
    image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&q=80&w=800',
    category: 'sidelines',
    optionGroups: [
      {
        id: 'sauce',
        name: 'Flavor',
        minSelection: 1,
        maxSelection: 1,
        options: [
          { id: 'bbq', name: 'BBQ Sauce', price: 0 },
          { id: 'hot', name: 'Hot Sauce', price: 0 },
          { id: 'honey', name: 'Honey Mustard', price: 50 },
        ]
      }
    ]
  },
  {
    id: '12',
    name: 'Mozzarella Sticks',
    description: '4 pcs of cheesy goodness.',
    basePrice: 450,
    image: 'https://images.unsplash.com/photo-1531749668029-2db88e4276c7?auto=format&fit=crop&q=80&w=800',
    category: 'sidelines'
  },

  // --- Pastas ---
  {
    id: '13',
    name: 'Chicken Lasagna',
    description: 'Layers of pasta, meat sauce and cheese.',
    basePrice: 899,
    image: 'https://images.unsplash.com/photo-1574868233977-455e6e7a3dce?auto=format&fit=crop&q=80&w=800',
    category: 'pastas'
  },
  {
    id: '14',
    name: 'Fettuccine Alfredo',
    description: 'Creamy white sauce pasta with grilled chicken.',
    basePrice: 950,
    image: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&q=80&w=800',
    category: 'pastas'
  },

  // --- Sandwiches ---
  {
    id: '15',
    name: 'Pizza Sandwich',
    description: 'Pizza fillings inside a calzone style bread.',
    basePrice: 650,
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=800',
    category: 'sandwiches'
  },

  // --- Desserts ---
  {
    id: '16',
    name: 'Choco Lava Cake',
    description: 'Warm cake with a molten chocolate center.',
    basePrice: 399,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476d?auto=format&fit=crop&q=80&w=800',
    category: 'desserts'
  },
  {
    id: '17',
    name: 'Brownie',
    description: 'Fudgy walnut brownie.',
    basePrice: 250,
    image: 'https://images.unsplash.com/photo-1606312619070-d48b706521bf?auto=format&fit=crop&q=80&w=800',
    category: 'desserts'
  }
];