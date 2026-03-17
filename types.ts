export interface ProductSize {
  id: string;
  label: string;
  price: number;         // delivery price (or discounted delivery price)
  takeAwayPrice?: number; // pickup/takeaway price (may differ from delivery)
  basePrice?: number;    // undiscounted base price
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
  basePrice: number;       // takeaway price (or discounted price) — primary display price
  deliveryBasePrice?: number; // delivery price when different from takeaway price
  originalPrice?: number;
  minimumDelivery?: number;   // minimum order amount required for this product
  image: string;
  category: string;
  tags?: string[];
  isNew?: boolean;
  rating?: number;
  serves?: number;
  ItemImage?: string;
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
  category?: string;         // CategoryName sent in orderdata (from product.category)
  selectedSize?: ProductSize;
  selectedOptions?: { [groupId: string]: ProductOption[] };
  selectedOptionGroupNames?: { [groupId: string]: string }; // groupId → groupName for OptionGroupName in payload
  minimumDelivery?: number; // min order amount required for this item (from API MinimumDelivery)
  discountGiven?: number;   // per-item discount (ActualPrice - sellingPrice), for display
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
  deliveryFee: number;
  deliveryTax: number; // as decimal, e.g. 0.16 for 16%
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
  content?: string;
  image: string;
  date: string;
  category: string;
  readTime?: string;
}
