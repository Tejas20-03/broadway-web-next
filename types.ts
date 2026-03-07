export interface ProductSize {
  id: string;
  label: string;
  price: number;
  basePrice?: number;
  image?: string;
}

export interface ProductOption {
  id: string;
  name: string;
  price: number;
  image?: string;
}

export interface ProductOptionGroup {
  id: string;
  name: string;
  minSelection: number;
  maxSelection: number;
  options: ProductOption[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number; 
  originalPrice?: number;
  image: string;
  category: string;
  tags?: string[];
  isNew?: boolean;
  rating?: number;
  serves?: number;
  
  // Strict API Structure
  sizes?: ProductSize[];
  optionGroups?: ProductOptionGroup[];
  sizeOptionGroups?: Record<string, ProductOptionGroup[]>;
}

export interface Category {
  id: string;
  label: string;
}

export interface CartItem {
  cartId: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  selectedSize?: ProductSize;
  selectedOptions?: { [groupId: string]: ProductOption[] };
}

// --- Location / Ordering ---

export type OrderType = 'delivery' | 'pickup';

export interface Area {
  id: string;
  name: string;
  deliveryTime?: string;
  isOpen?: boolean;
}

export interface Outlet {
  id: string;
  name: string;
  address: string;
  city: string;
  mapLink?: string;
  phone?: string;
}

export interface LocationState {
  orderType: OrderType;
  city: string;
  area: string;       // delivery area name
  outlet: string;     // pickup outlet name
  outletId: string;
}

// --- User / Auth ---

export interface User {
  name: string;
  phone: string;
  email: string;
  walletCode: string;
}

// --- Blog ---

export interface BlogPost {
  id: string | number;
  title: string;
  slug?: string;
  excerpt: string;
  image: string;
  date: string;
  category: string;
  readTime?: string;
}
