import { Product, Category, ProductSize, ProductOptionGroup, ProductOption, Area, Outlet, BlogPost, User } from '../types';
import { PRODUCTS as FALLBACK_PRODUCTS, CATEGORIES as FALLBACK_CATEGORIES } from '../data';
import { STATIC_BANNERS, STATIC_MENU_DATA } from '../data/static_data';

const BASE_URL = 'https://services.broadwaypizza.com.pk';

// ---------------------------------------------------------------------------
// Core HTTP helper — tries the real API first, falls back to CORS proxies
// ---------------------------------------------------------------------------
const apiFetch = async (path: string): Promise<any> => {
  const direct = `${BASE_URL}/${path}`;
  const proxies = [
    direct,
    `https://corsproxy.io/?${encodeURIComponent(direct)}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(direct)}`,
  ];

  for (const url of proxies) {
    try {
      const res = await fetch(url, { next: { revalidate: 300 } } as RequestInit);
      if (res.ok) return await res.json();
    } catch {
      /* try next proxy */
    }
  }
  throw new Error(`All fetches failed for: ${path}`);
};

// ---------------------------------------------------------------------------
// Cities with images (used in LocationModal city picker)
// ---------------------------------------------------------------------------
export interface City {
  name: string;
  imageUrl: string;
  deliveryTax: number;
  deliveryFees: number;
}

export const fetchCities = async (): Promise<City[]> => {
  try {
    const data = await apiFetch('BroadwayAPI.aspx?method=GetCitiesWithImage');
    // Response is a plain array
    if (Array.isArray(data)) {
      return data.map((c: any) => ({
        name: c.Name ?? '',
        imageUrl: c.ImageURL ?? '',
        // API returns delivery_tax as a percentage integer (e.g. 16 for 16%).
        // Divide by 100 so it can be used directly as a decimal multiplier (0.16).
        deliveryTax: parseFloat(c.delivery_tax ?? '0') / 100,
        deliveryFees: parseFloat(c.delivery_fees ?? '0'),
      })).filter(c => c.name);
    }
  } catch { /* fall through */ }
  return [];
};

// ---------------------------------------------------------------------------
// Reverse-geocode: detect city + area from browser coordinates
// ---------------------------------------------------------------------------
export interface GeoCodeResult {
  city: string;
  area: string;
  outletId: string;
  outletName: string;
}

export const fetchGeoCodeArea = async (lat: number, lng: number): Promise<GeoCodeResult> => {
  const data = await apiFetch(
    `BroadwayAPI.aspx?Method=GetAreaFromGeoCode&GeoCode=${lat},${lng}`,
  );
  // ResponseType is a string: "1" = success, "0" = not found
  if (String(data?.ResponseType) !== '1') {
    throw new Error('Location not found');
  }
  return {
    city: data.City ?? '',
    area: data.Area ?? '',
    outletId: data.OutletID ?? '',
    outletName: data.OutletName ?? '',
  };
};

// ---------------------------------------------------------------------------
// Banners
// ---------------------------------------------------------------------------
export const fetchBanners = async (city = 'Karachi'): Promise<string[]> => {
  try {
    const data = await apiFetch(`BroadwayAPI.aspx?Method=GetBanners&City=${encodeURIComponent(city)}`);
    // Response is a plain string array: ["https://...jpg", ...]
    if (Array.isArray(data)) return data.filter((s): s is string => typeof s === 'string' && s.length > 0);
    // Fallback: older shape with Data/Image wrapper
    const image = data?.Data || data?.Image || data?.BannerImage;
    if (typeof image === 'string' && image) return [image];
    if (Array.isArray(image)) return image.filter(Boolean);
  } catch {
    /* fall through */
  }
  return STATIC_BANNERS;
};

// ---------------------------------------------------------------------------
// Areas for delivery (used in LocationModal)
// ---------------------------------------------------------------------------
export const fetchAreas = async (city: string): Promise<Area[]> => {
  const data = await apiFetch(`BroadwayAPI.aspx?method=GetAreasV1&City=${encodeURIComponent(city)}`);
  const raw: any[] = Array.isArray(data) ? data : data?.Data || [];
  return raw
    .filter(Boolean)
    .map((a: any) => {
      // API returns a plain string array
      if (typeof a === 'string') return { id: a, name: a, isOpen: true };
      return {
        id: String(a.ID ?? a.AreaID ?? a.id ?? a.Name ?? a),
        name: String(a.Name ?? a.AreaName ?? a),
        deliveryTime: a.DeliveryTime ?? a.ETAText ?? undefined,
        isOpen: a.Status?.toLowerCase() !== 'closed',
      };
    });
};

// ---------------------------------------------------------------------------
// Outlets for LocationsPage ("Our Outlets" display)
// ---------------------------------------------------------------------------
export const fetchOutlets = async (city: string): Promise<Outlet[]> => {
  const data = await apiFetch(`BroadwayAPI.aspx?method=GetOutletsforLocation&City=${encodeURIComponent(city)}`);
  const raw: any[] = Array.isArray(data) ? data : data?.Data || [];
  return raw.map((o: any, i: number) => ({
    id: String(o.ID ?? o.OutletID ?? o.id ?? i),
    name: String(o.Name ?? o.OutletName ?? ''),
    address: String(o.address ?? o.Address ?? o.OutletAddress ?? ''),
    city: String(o.City ?? city),
    mapLink: o.maplink ?? o.MapLink ?? o.GoogleMapLink ?? undefined,
    phone: o.Phone ?? undefined,
  }));
};

// ---------------------------------------------------------------------------
// Pickup outlets for LocationModal (address page outlet selector)
// ---------------------------------------------------------------------------
export const fetchPickupOutlets = async (city: string): Promise<Outlet[]> => {
  const data = await apiFetch(`BroadwayAPI.aspx?Method=GetOutletsV1&City=${encodeURIComponent(city)}`);
  const raw: any[] = Array.isArray(data) ? data : data?.Data || [];
  return raw.map((o: any, i: number) => {
    // API returns plain strings like "Bahadurabad-KHI (Open at 01 PM)"
    if (typeof o === 'string') {
      return { id: String(i), name: o, address: '', city, mapLink: undefined, phone: undefined };
    }
    return {
      id: String(o.ID ?? o.OutletID ?? o.id ?? i),
      name: String(o.Name ?? o.OutletName ?? ''),
      address: String(o.Address ?? o.address ?? o.OutletAddress ?? ''),
      city: String(o.City ?? city),
      mapLink: o.MapLink ?? o.maplink ?? o.GoogleMapLink ?? undefined,
      phone: o.Phone ?? undefined,
    };
  });
};

// ---------------------------------------------------------------------------
// All outlets (used by live feedback flow)
// ---------------------------------------------------------------------------
export const fetchAllOutlets = async (): Promise<Outlet[]> => {
  const data = await apiFetch('BroadwayAPI.aspx?Method=GetAllOutlets');
  const raw: any[] = Array.isArray(data) ? data : data?.Data || [];
  return raw.map((o: any, i: number) => ({
    id: String(o.Id ?? o.ID ?? o.OutletID ?? i),
    name: String(o.Name ?? o.OutletName ?? ''),
    address: String(o.address ?? o.Address ?? ''),
    city: String(o.City ?? ''),
    mapLink: o.maplink ?? o.MapLink ?? undefined,
    phone: o.Phone ?? undefined,
  }));
};

// ---------------------------------------------------------------------------
// Blog posts
// ---------------------------------------------------------------------------
export const slugifyBlogValue = (value: string): string => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

export const getBlogSlug = (post: Pick<BlogPost, 'id' | 'title' | 'slug'>): string => {
  // Preserve API slug as-is (live site routes with raw Slug), fallback to generated slug when missing.
  if (post.slug && post.slug.trim()) return post.slug.trim();
  return slugifyBlogValue(`${post.title}-${post.id}`);
};

const mapRawBlogPost = (raw: any, fallbackSlug: string): BlogPost => {
  const id = raw.ID ?? raw.BlogID ?? fallbackSlug;
  const title = raw.Title ?? raw.BlogTitle ?? '';
  const slug = String(raw.Slug ?? raw.BlogSlug ?? raw.OldSlug ?? fallbackSlug).trim();
  const rawCategory = raw.Category ?? raw.CategoryName ?? raw.Categories;
  const category = Array.isArray(rawCategory)
    ? String(rawCategory[0] ?? 'General')
    : String(rawCategory ?? 'General');
  const htmlBody = String(raw.Blog ?? raw.Content ?? raw.Description ?? raw.LongDescription ?? raw.Body ?? '');
  const plainBody = htmlBody.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

  return {
    id,
    title,
    slug: slug || slugifyBlogValue(`${title}-${id}`),
    excerpt: String(raw.ShortDescription ?? raw.Excerpt ?? raw.Summary ?? plainBody).trim(),
    content: htmlBody || undefined,
    image: raw.Image ?? raw.BlogImage ?? raw.CoverImage ?? '',
    date: raw.PublishedDate ?? raw.Date ?? raw.CreatedDate ?? '',
    category,
    readTime: raw.ReadTime ?? undefined,
  };
};

export const fetchBlogPosts = async (): Promise<BlogPost[]> => {
  try {
    const data = await apiFetch('BroadwayAPI.aspx?Method=BlogListing');
    const raw: any[] = Array.isArray(data) ? data : data?.Data || data?.Blogs || [];
    return raw.map((b: any, i: number) => mapRawBlogPost(b, String(i)));
  } catch {
    return [];
  }
};

export const fetchBlogPostBySlug = async (slug: string): Promise<BlogPost | null> => {
  const requestedSlug = decodeURIComponent(String(slug ?? '')).trim();
  const trySlugs = Array.from(new Set([requestedSlug, slugifyBlogValue(requestedSlug)].filter(Boolean)));

  try {
    for (const candidate of trySlugs) {
      const data = await apiFetch(`BroadwayAPI.aspx?Method=GetBlogBySlug&BlogSlug=${encodeURIComponent(candidate)}`);
      const raw = data?.Data?.[0] ?? data?.Data ?? data;

      if (raw && (raw.ID || raw.BlogID || raw.Title || raw.BlogTitle)) {
        return mapRawBlogPost(raw, candidate);
      }
    }
  } catch {
    /* fall through to listing fallback */
  }

  const posts = await fetchBlogPosts();
  const normalizedRequested = slugifyBlogValue(requestedSlug);
  return posts.find((post) => {
    const rawPostSlug = String(post.slug ?? '').trim();
    if (rawPostSlug && rawPostSlug.toLowerCase() === requestedSlug.toLowerCase()) return true;
    return slugifyBlogValue(rawPostSlug || `${post.title}-${post.id}`) === normalizedRequested;
  }) ?? null;
};

// ---------------------------------------------------------------------------
// Menu (categories + products)
// ---------------------------------------------------------------------------
export const fetchMenuData = async (
  city = 'Karachi',
  area = 'Bahadurabad',
  outlet?: string,
): Promise<{ categories: Category[]; products: Product[] }> => {
  try {
    let data: any;
    try {
      const query = outlet
        ? `BroadwayAPI.aspx?method=getmenu&city=${encodeURIComponent(city)}&OutletName=${encodeURIComponent(outlet)}&StudentID=&Platform=Web`
        : `BroadwayAPI.aspx?method=getmenu&city=${encodeURIComponent(city)}&area=${encodeURIComponent(area)}&Platform=Web`;
      data = await apiFetch(query);
    } catch {
      // API unreachable — use embedded static data as fallback
      console.warn('Menu API unavailable, using static data');
      data = STATIC_MENU_DATA;
    }
    // Check for Mobile Menu structure specifically as requested
    const mobileData = data.Data?.NestedMenuForMobile?.[0];
    const rawCategories = mobileData?.MenuCategoryList || [];

    if (!Array.isArray(rawCategories)) {
      throw new Error('Invalid data structure');
    }

    const mappedCategories: Category[] = [];
    const mappedProducts: Product[] = [];

    rawCategories.forEach((cat: any, index: number) => {
      // 1. Create Category
      const categoryId = cat.ID?.toString() || cat.CategoryID?.toString() || `cat-${index}`;
      const categoryLabel = cat.Name || cat.CategoryName || 'Special';
      
      const rawProducts = cat.MenuItemsList || cat.Products || [];

      if (!Array.isArray(rawProducts) || rawProducts.length === 0) return;

      mappedCategories.push({
        id: categoryId,
        label: categoryLabel,
        startTime: cat.StartTime || cat.Start || undefined,
        endTime: cat.EndTime || cat.End || undefined,
      });

      // 2. Process Products - STRICT MAPPING
      rawProducts.forEach((item: any) => {
        const productId = item.ID?.toString() || item.ProductID?.toString() || `prod-${Math.random()}`;
        const name = item.Name || item.ProductName || 'Unknown Item';
        const description = item.Description || item.SpecialDealText || '';
        
        // Price logic: TakeawayPrice is the primary (pickup/takeaway) price.
        // MinDeliveryPrice holds the delivery price for single-size items (> 0 when set).
        // DiscountedPrice overrides both when active (items with a special deal).
        const takeawayPrice = parseFloat(item.TakeawayPrice || item.Price || '0');
        const deliveryItemPrice = parseFloat(item.MinDeliveryPrice || '0');
        const discountedPrice = item.DiscountedPrice && item.DiscountedPrice > 0
          ? parseFloat(item.DiscountedPrice)
          : 0;
        const basePrice = discountedPrice > 0 ? discountedPrice : takeawayPrice;
        const deliveryBasePrice = discountedPrice > 0
          ? discountedPrice
          : (deliveryItemPrice > 0 ? deliveryItemPrice : takeawayPrice);
        // Original (undiscounted) price for strike-through display on card
        const originalPrice = deliveryItemPrice > 0 && deliveryItemPrice > basePrice
          ? deliveryItemPrice
          : undefined;

        const image = item.ImageBase64 || item.ProductImage || item.ItemImage || ''; 
        const minimumDelivery = parseFloat(item.MinimumDelivery || '0');

        // 3. Map Sizes
        let sizes: ProductSize[] = [];
        if (Array.isArray(item.MenuSizesList) && item.MenuSizesList.length > 0) {
          sizes = item.MenuSizesList.map((s: any) => ({
            id: s.ID?.toString() || s.SizeID?.toString(),
            label: s.Name || s.SizeName || 'Regular',
            price: (s.DiscountedPrice && s.DiscountedPrice > 0) ? parseFloat(s.DiscountedPrice) : parseFloat(s.Price || s.TakeawayPrice || '0'),
            takeAwayPrice: (s.DiscountedPrice && s.DiscountedPrice > 0) ? parseFloat(s.DiscountedPrice) : parseFloat(s.TakeawayPrice || s.Price || '0'),
            basePrice: parseFloat(s.Price || s.TakeawayPrice || '0')
          }));
        } else {
            // Default size is the item itself
            sizes = [{
                id: item.SizeID?.toString() || 'def-size',
                label: 'Regular',
                price: deliveryBasePrice,
                takeAwayPrice: basePrice,
                basePrice: deliveryBasePrice,
            }];
        }

        // 4. Map Option Groups
        let optionGroups: ProductOptionGroup[] = [];
        const rawGroups = item.MenuOptionGroups || item.OptionGroups || []; 
        
        if (Array.isArray(rawGroups)) {
            optionGroups = rawGroups.map((g: any) => ({
                id: g.ID?.toString() || g.GroupID?.toString(),
                name: g.Name || g.GroupName || 'Options',
                minSelection: parseInt(g.MinSelection || '0'),
                maxSelection: parseInt(g.MaxSelection || '0'),
                options: (Array.isArray(g.Options) ? g.Options : []).map((opt: any) => ({
                    id: opt.ID?.toString() || opt.OptionID?.toString(),
                    name: opt.Name || opt.OptionName,
                    price: parseFloat(opt.Price || opt.AdditionalPrice || '0'),
                    image: opt.Image || opt.OptionImage || '' // Capture image if available
                }))
            }));
        }

        mappedProducts.push({
          id: productId,
          name: name,
          description: description,
          basePrice: basePrice,
          deliveryBasePrice: deliveryBasePrice !== basePrice ? deliveryBasePrice : undefined,
          originalPrice: originalPrice,
          minimumDelivery: minimumDelivery > 0 ? minimumDelivery : undefined,
          image: image,
          category: categoryId,
          tags: item.IsNewItem ? ['New'] : [],
          isNew: item.IsNewItem,
          sizes: sizes,
          optionGroups: optionGroups
        });
      });
    });

    return { categories: mappedCategories, products: mappedProducts };

  } catch (error) {
    console.error("Data processing failed", error);
    return { categories: FALLBACK_CATEGORIES, products: FALLBACK_PRODUCTS };
  }
};

// ---------------------------------------------------------------------------
// Auth: Check number (step 1 — sends OTP)
// ---------------------------------------------------------------------------
export const checkNumber = async (phone: string): Promise<{ success: boolean; isNewCustomer?: boolean; message?: string }> => {
  try {
    const data = await apiFetch(`BroadwayAPI.aspx?method=CheckNumber&Number=${encodeURIComponent(phone)}`);
    // API returns responseType as a string e.g. "1"
    if (String(data?.responseType ?? data?.ResponseType) === '1') {
      return { success: true, isNewCustomer: String(data?.NewCustomer) === 'true' };
    }
    return { success: false, message: data?.Message ?? 'Could not send OTP. Please try again.' };
  } catch {
    return { success: false, message: 'Network error. Please check your connection.' };
  }
};

// ---------------------------------------------------------------------------
// Auth: Verify OTP (step 2 — validates code, returns walletCode)
// ---------------------------------------------------------------------------
export const verifyCode = async (
  name: string,
  phone: string,
  email: string,
  code: string,
): Promise<{ success: boolean; walletCode?: string; message?: string }> => {
  try {
    const params = new URLSearchParams({
      method: 'CheckVerificationCode',
      Name: name,
      Number: phone,
      Email: email,
      StudentID: '',
      Code: code,
    });
    const data = await apiFetch(`BroadwayAPI.aspx?${params.toString()}`);
    // API returns responseType as a string e.g. "1"
    if (String(data?.responseType ?? data?.ResponseType) === '1') {
      return { success: true, walletCode: data.WalletVerificationCode ?? '', message: data?.Message };
    }
    return { success: false, message: data?.Message ?? 'Invalid code. Please try again.' };
  } catch {
    return { success: false, message: 'Network error. Please check your connection.' };
  }
};

// ---------------------------------------------------------------------------
// Orders: Place order (POST)
// ---------------------------------------------------------------------------
export interface OrderPayload {
  customerNumberVerification?: null | string;
  fullname: string;
  phone: string;
  email?: string;
  // Delivery-only fields (area-based). NOT sent for pickup.
  customerEmail?: string;
  Area?: string;
  cityname?: string;
  customeraddress?: string;
  Landmark?: string;
  // Delivery with geolocation (sent instead of Area/cityname when outlet resolved from coords)
  lat?: number;
  lng?: number;
  // Pickup-only field. NOT sent for delivery.
  Outlet?: string;
  ordertype: 'Delivery' | 'Pickup';
  Remarks?: string;
  paymenttype: 'Cash' | 'Card';
  orderamount: number;        // unrounded pre-tax subtotal
  taxamount: number;          // unrounded tax amount
  tax: number;                // same value as taxamount — Cordova sends both
  deliverytime: string;       // "YYYY-MM-DD HH:MM:SS"
  totalamount: number;
  deliverycharges: number;
  discountamount?: number | string;  // string "0" when no discount (Cordova convention)
  Voucher?: string;
  orderdata: any[];
  WalletVerificationCode?: string;
  platform?: string;
  AppVersion?: number | string;
  DeviceSignalID?: string;
}

export const placeOrder = async (
  payload: OrderPayload,
): Promise<{
  success: boolean;
  orderId?: string;
  encOrderId?: string;
  deliveryTime?: string;   // approx. minutes as string, e.g. "30"
  orderAmount?: number;
  paymentUrl?: string;     // non-empty when card/online payment → redirect here
  message?: string;
}> => {
  const url = `${BASE_URL}/BroadwayAPI.aspx?Method=ProcessOrder&Phone=${encodeURIComponent(payload.phone)}`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data?.ResponseType === 1 || data?.responseType === 1 || data?.OrderID) {
      const orderId = String(data.OrderID ?? data.orderId ?? '');
      const encOrderId = String(data.EncOrderID ?? '');
      const deliveryTime = String(data.DeliveryTime ?? '');
      const orderAmount = data.OrderAmount ?? undefined;
      // Cordova: if data.URL != '' → redirect to payment gateway (card payments)
      if (data?.URL && String(data.URL).trim().length > 5) {
        return { success: true, orderId, encOrderId, deliveryTime, orderAmount, paymentUrl: String(data.URL) };
      }
      return { success: true, orderId, encOrderId, deliveryTime, orderAmount };
    }
    return { success: false, message: data?.Message ?? data?.message ?? 'Order failed. Please try again.' };
  } catch {
    return { success: false, message: 'Network error. Please check your connection.' };
  }
};

// ---------------------------------------------------------------------------
// Birthday Deals
// ---------------------------------------------------------------------------
export interface BirthdayDeal {
  id: string;
  name: string;
  price: string;
  image: string;
  description: string;
}

export const fetchBirthdayDeals = async (): Promise<BirthdayDeal[]> => {
  try {
    const data = await apiFetch('BroadwayAPI.aspx?Method=GetBirthdayDeals');
    const raw: any[] = Array.isArray(data) ? data : data?.Data || data?.Deals || [];
    if (raw.length > 0) {
      return raw.map((d: any, i: number) => ({
        id: String(d.ID ?? d.DealID ?? i),
        name: d.Name ?? d.DealName ?? `Deal ${i + 1}`,
        price: String(d.Price ?? d.DealPrice ?? ''),
        image: d.Image ?? d.DealImage ?? '',
        description: d.Description ?? d.Details ?? '',
      }));
    }
  } catch {
    /* fall through to static */
  }
  // Static fallback (real deal images from admin server)
  return [
    { id: 'deal1', name: 'Deal 1', price: '8,499', image: 'https://admin.broadwaypizza.com.pk/Images/BirthdayDeals/Deal-1.jpg', description: '10 x 6" Regular Pizzas, 5 X 8" Star Pizza, 12 Pcs Chicken Mega Bites, 2 X Large Drinks, 4 Dip Sauces, 5 X Kids Puzzle, 5 x Slice Juice' },
    { id: 'deal2', name: 'Deal 2', price: '10,499', image: 'https://admin.broadwaypizza.com.pk/Images/BirthdayDeals/Deal-2.jpg', description: '3 X Medium Pizza, 3 X Creamy Pasta, 3 x Square Sandwich, 2 X Appetizer Platter, 3 X Large Drinks, 4 Dip Sauces' },
    { id: 'deal3', name: 'Deal 3', price: '15,199', image: 'https://admin.broadwaypizza.com.pk/Images/BirthdayDeals/Deal-3.jpg', description: '16 x Slices Of 20" XXXL Pizza, 6 X 8" Star Pizza, 24 Pcs Chicken Mega Bites, 4 X Large Drinks, 8 x Dip Sauces, 6 X Kids Puzzle, 6 x Slice Juice' },
    { id: 'deal4', name: 'Deal 4', price: '15,199', image: 'https://admin.broadwaypizza.com.pk/Images/BirthdayDeals/Deal-4.jpg', description: '4 X Large Pizza, 4 X Creamy Pastas, 4 X Calzones, 24 x Garlic Breads, 5 X Large Drinks, 8 Dip Sauces' },
  ];
};

// ---------------------------------------------------------------------------
// Hot Deals
// ---------------------------------------------------------------------------
export interface HotDeal {
  id: string;
  name: string;
  description: string;
  originalPrice: number;
  dealPrice: number;
  image: string;
  remainingSeconds: number;
  stockPercent: number;
}

export const fetchHotDeals = async (city: string = 'Karachi'): Promise<HotDeal[]> => {
  try {
    const url = `https://bwapi.broadwaypizza.com.pk/BroadwayAPI.aspx?Method=GetMenu&Platform=Web&City=${encodeURIComponent(city || 'Karachi')}&Featured=true`;
    const res = await fetch(url, { next: { revalidate: 60 } } as RequestInit);
    const data = await res.json();

    const categories: any[] = data?.Data?.NestedMenuForMobile?.[0]?.MenuCategoryList ?? [];
    const items: any[] = categories.flatMap((cat: any) => cat?.MenuItemsList ?? []);

    if (items.length > 0) {
      return items.map((d: any, i: number) => {
        const dealPrice = parseFloat(String(d.DiscountedPrice ?? d.TakeawayPrice ?? d.MinDeliveryPrice ?? 0));
        const fallbackOriginal = dealPrice + parseFloat(String(d.Discount ?? 0));
        const originalPrice = parseFloat(String(d.MinDeliveryPrice ?? d.TakeawayPrice ?? fallbackOriginal ?? dealPrice));

        return {
          id: String(d.ID ?? d.ItemID ?? i),
          name: d.Name ?? d.DealName ?? `Featured Deal ${i + 1}`,
          description: d.Description ?? d.SpecialDealText ?? d.Details ?? '',
          originalPrice: Number.isFinite(originalPrice) ? originalPrice : dealPrice,
          dealPrice: Number.isFinite(dealPrice) ? dealPrice : 0,
          image: d.ImageBase64 ?? d.Image ?? d.DealImage ?? d.ItemImage ?? '',
          remainingSeconds: parseInt(d.RemainingSeconds ?? d.TimerSeconds ?? '3600', 10),
          stockPercent: parseInt(d.StockPercent ?? d.Availability ?? '50', 10),
        };
      });
    }
  } catch {
    /* fall through to static */
  }
  // Static fallback
  return [
    { id: 'hd1', name: 'Midnight Flash Deal', description: '1 Large Pizza + 1.5L Drink + 6 Pcs Wings. Limited availability!', originalPrice: 2800, dealPrice: 1499, image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&q=80&w=800', remainingSeconds: 3420, stockPercent: 12 },
    { id: 'hd2', name: 'The Beast Mode', description: '20" XXXL Pizza at half price. One per customer.', originalPrice: 4500, dealPrice: 2250, image: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&q=80&w=800', remainingSeconds: 1240, stockPercent: 5 },
    { id: 'hd3', name: 'Duo Dynamite', description: '2 Medium Pizzas + 2 Dips. Best value of the hour.', originalPrice: 2600, dealPrice: 1699, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800', remainingSeconds: 2100, stockPercent: 45 },
    { id: 'hd4', name: 'Pasta Party', description: 'Buy 1 Get 1 Free on all Gourmet Pastas.', originalPrice: 1900, dealPrice: 950, image: 'https://images.unsplash.com/photo-1574868233977-455e6e7a3dce?auto=format&fit=crop&q=80&w=800', remainingSeconds: 850, stockPercent: 8 },
    { id: 'hd5', name: 'Lava Explosion', description: '4 Choco Lava Cakes for the price of 2.', originalPrice: 1600, dealPrice: 800, image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476d?auto=format&fit=crop&q=80&w=800', remainingSeconds: 3100, stockPercent: 28 },
    { id: 'hd6', name: 'Corporate Crunch', description: '3 Large Pizzas + 2 Sidelines. Feed the whole team.', originalPrice: 6500, dealPrice: 4299, image: 'https://images.unsplash.com/photo-1593560708920-631629e9d11b?auto=format&fit=crop&q=80&w=800', remainingSeconds: 1500, stockPercent: 19 },
  ];
};

// ---------------------------------------------------------------------------
// Account: My Orders
// ---------------------------------------------------------------------------
export interface Order {
  id: string;
  encId: string;
  amount: number;
  date: string;
  outletName: string;
  status: 'Confirmed' | 'Pending' | 'Rejected' | string;
  feedbackUrl?: string;
}

export const fetchMyOrders = async (phone: string): Promise<Order[]> => {
  try {
    const data = await apiFetch(`BroadwayAPI.aspx?method=MyOrders&Number=${encodeURIComponent(phone)}`);
    if (String(data?.ResponseType) === '1' && Array.isArray(data?.Data)) {
      return data.Data.map((o: any) => ({
        id: String(o.ID ?? o.OrderID ?? ''),
        encId: String(o.EncOrderID ?? o.ID ?? ''),
        amount: parseFloat(o.OrderAmount ?? '0'),
        date: o.Created ?? '',
        outletName: o.OutletName ?? '',
        status: o.Status ?? 'Pending',
        feedbackUrl: o.FeedbackURL ?? '',
      }));
    }
  } catch { /* fall through */ }
  return [];
};

// ---------------------------------------------------------------------------
// Account: My Wallet
// ---------------------------------------------------------------------------
export const fetchMyWallet = async (phone: string): Promise<number> => {
  try {
    const data = await apiFetch(`BroadwayAPI.aspx?Method=MyWallet&Number=${encodeURIComponent(phone)}`);
    const balance = data?.Data?.[0]?.walletbalance ?? data?.Data?.[0]?.WalletBalance ?? 0;
    return parseFloat(String(balance)) || 0;
  } catch { return 0; }
};

// ---------------------------------------------------------------------------
// Account: Get & Update Customer Info
// ---------------------------------------------------------------------------
export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  walletBalance: number;
  totalOrders: number;
  memberSince: string;
}

export const fetchCustomerInfo = async (phone: string): Promise<CustomerInfo | null> => {
  try {
    const data = await apiFetch(`BroadwayAPI.aspx?method=GetCustomerInfo&Phone=${encodeURIComponent(phone)}`);
    if (String(data?.ResponseType) === '1' && data?.Data?.[0]) {
      const d = data.Data[0];
      return {
        name: d.Name ?? '',
        email: d.Email ?? '',
        phone: d.Mobile ?? phone,
        walletBalance: parseFloat(d.WalletBalance ?? '0'),
        totalOrders: parseInt(d.Orders ?? '0', 10),
        memberSince: d.Created ?? '',
      };
    }
  } catch { /* fall through */ }
  return null;
};

export const updateCustomerInfo = async (name: string, email: string, phone: string): Promise<boolean> => {
  try {
    const res = await fetch(`${BASE_URL}/BroadwayAPI.aspx?Method=AddCustomerInfo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Name: name, Email: email, Mobile: phone }),
    });
    const data = await res.json();
    return String(data?.responseType) === '1';
  } catch { return false; }
};

// ---------------------------------------------------------------------------
// Account: Delete Account
// ---------------------------------------------------------------------------
export const deleteAccount = async (phone: string): Promise<boolean> => {
  try {
    const data = await apiFetch(`BroadwayAPI.aspx?method=DeleteAccount&Phone=${encodeURIComponent(phone)}`);
    return String(data?.responseType ?? data?.ResponseType) === '1';
  } catch { return false; }
};

// ---------------------------------------------------------------------------
// Saved Addresses (GetAddress / DeleteAddress)
// ---------------------------------------------------------------------------
export interface SavedAddress {
  id: string;
  address: string;
  area: string;
  city: string;
  nearestLandmark: string;
  gst: number;
  latitude: string;
  longitude: string;
  type: string;
}

export const fetchSavedAddresses = async (phone: string): Promise<SavedAddress[]> => {
  try {
    const data = await apiFetch(`BroadwayAPI.aspx?Method=GetAddress&CustomerMobile=${encodeURIComponent(phone)}`);
    if (String(data?.ResponseType) !== '1' || !Array.isArray(data?.Data)) return [];

    return data.Data.map((a: any, i: number) => ({
      id: String(a.ID ?? i),
      address: String(a.Address ?? ''),
      area: String(a.Area ?? ''),
      city: String(a.City ?? ''),
      nearestLandmark: String(a.NearestLandmark ?? ''),
      gst: parseFloat(a.GST ?? a.delivery_tax ?? '0') || 0,
      latitude: String(a.Latitude ?? ''),
      longitude: String(a.Longitude ?? ''),
      type: String(a.Type ?? ''),
    }));
  } catch {
    return [];
  }
};

export const deleteSavedAddress = async (addressId: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const data = await apiFetch(`BroadwayAPI.aspx?Method=DeleteAddress&AddressID=${encodeURIComponent(addressId)}`);
    const success = String(data?.responseType ?? data?.ResponseType) === '1';
    return { success, message: data?.message ?? data?.Message };
  } catch {
    return { success: false, message: 'Could not delete address.' };
  }
};

// ---------------------------------------------------------------------------
// Pending Orders (track active orders)
// ---------------------------------------------------------------------------
export interface PendingOrder {
  id: string;
  encId: string;
  amount: number;
  status: string;
}

export const fetchPendingOrders = async (phone: string): Promise<PendingOrder[]> => {
  try {
    const data = await apiFetch(`BroadwayAPI.aspx?Method=MyPendingOrders&Number=${encodeURIComponent(phone)}`);
    if (String(data?.ResponseType) === '1' && Array.isArray(data?.Data)) {
      return data.Data.map((o: any) => ({
        id: String(o.ID ?? ''),
        encId: String(o.EncOrderID ?? ''),
        amount: parseFloat(o.OrderAmount ?? '0'),
        status: o.Status ?? 'Pending',
      }));
    }
  } catch { /* fall through */ }
  return [];
};

// ---------------------------------------------------------------------------
// Suggestive Items (upsell in cart)
// ---------------------------------------------------------------------------
export interface SuggestiveItem {
  itemId: string;
  name: string;
  description: string;
  image: string;
  price: number;
  categoryName: string;
}

export const fetchSuggestiveItems = async (city: string, area: string): Promise<SuggestiveItem[]> => {
  try {
    const data = await apiFetch(
      `BroadwayAPI.aspx?Method=GetSuggestiveItems&City=${encodeURIComponent(city)}&Area=${encodeURIComponent(area)}`
    );
    if (String(data?.ResponseType) === '1' && Array.isArray(data?.Data)) {
      return data.Data.map((d: any) => ({
        itemId: String(d.ItemID ?? ''),
        name: d.ItemName ?? '',
        description: d.ItemDescription ?? '',
        image: d.ItemImage ?? '',
        price: parseFloat(d.price ?? '0'),
        categoryName: d.CategoryName ?? '',
      }));
    }
  } catch { /* fall through */ }
  return [];
};

// ---------------------------------------------------------------------------
// Product Options (getoptions — sizes + customization groups per product)
// ---------------------------------------------------------------------------
export const fetchProductOptions = async (
  itemId: string | number,
  city: string = 'Karachi',
  area: string = '',
): Promise<Partial<Product>> => {
  try {
    const data = await apiFetch(
      `BroadwayAPI.aspx?Method=getoptions&ItemId=${itemId}&City=${encodeURIComponent(city)}&Area=${encodeURIComponent(area)}`,
    );
    if (String(data?.ResponseType) !== '1' || !data?.Data) return {};

    const rawSizes: any[] = data.Data.MenuSizesList ?? [];
    if (rawSizes.length === 0) return {};

    const mapGroups = (flavourList: any[]): ProductOptionGroup[] => {
      if (!Array.isArray(flavourList)) return [];
      return flavourList
        .filter((g: any) => g.IsActive !== false)
        .sort((a: any, b: any) => (a.SortOrder ?? 0) - (b.SortOrder ?? 0))
        .map((g: any) => ({
          id: String(g.ID),
          name: g.Name ?? '',
          minSelection: g.IsMultiple ? 0 : 1,
          maxSelection: g.IsMultiple ? 99 : 1,
          options: (g.OptionsList ?? [])
            .filter((o: any) => o.IsActive !== false)
            .map((o: any) => ({
              id: String(o.ID),
              name: o.Name ?? '',
              price: parseFloat(o.Price ?? 0),
              image: o.ItemImage ?? '',
            })),
        }));
    };

    // Single entry with empty/placeholder Size = no size selector, groups at item level
    // '-' and '.' are both used by the API as placeholder values meaning "no real size"
    const PLACEHOLDER_SIZES = ['.', '-'];
    const noSizeItem =
      rawSizes.length === 1 && (!rawSizes[0].Size || PLACEHOLDER_SIZES.includes(rawSizes[0].Size.trim()));
    if (noSizeItem) {
      return {
        sizes: [],
        optionGroups: mapGroups(rawSizes[0].FlavourAndToppingsList ?? []),
        sizeOptionGroups: undefined,
      };
    }

    // Multiple sizes (or single named size): build per-size groups.
    // Store both delivery and takeaway prices so ProductModal can pick the
    // correct one based on the active order type (matching Cordova behaviour).
    const sizes: ProductSize[] = rawSizes.map((s: any) => ({
      id: String(s.ID),
      label: s.Size ?? '',
      price: s.DiscountedPrice > 0 ? parseFloat(s.DiscountedPrice) : parseFloat(s.DeliveryPrice ?? 0),
      takeAwayPrice: s.DiscountedPrice > 0 ? parseFloat(s.DiscountedPrice) : parseFloat(s.TakeAwayPrice ?? s.TakeawayPrice ?? s.DeliveryPrice ?? 0),
      basePrice: parseFloat(s.DeliveryPrice ?? 0),
      image: s.SizeImage ?? '',
    }));

    const sizeOptionGroups: Record<string, ProductOptionGroup[]> = {};
    rawSizes.forEach((s: any) => {
      sizeOptionGroups[String(s.ID)] = mapGroups(s.FlavourAndToppingsList ?? []);
    });

    return { sizes, sizeOptionGroups, optionGroups: undefined };
  } catch {
    return {};
  }
};

// ---------------------------------------------------------------------------
// Voucher: validate and get discount amount
// Cordova: POST https://beta.broadwaypizza.com.pk/BroadwayAPI.aspx?Method=CheckVoucherV2
// ---------------------------------------------------------------------------
export interface VoucherResult {
  valid: boolean;
  amount: number;
  code: string;
  message?: string;
}

export const checkVoucher = async (
  voucherCode: string,
  locationData: { ordertype: string | null; city: string | null; area: string | null; outlet: string | null },
  cartData: any[],
): Promise<VoucherResult> => {
  try {
    const res = await fetch(`${BASE_URL}/BroadwayAPI.aspx?Method=CheckVoucherV2`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voucherCode, locationData, cartData }),
    });
    const data = await res.json();
    if (data?.responseType) {
      if (data.VoucherAmount === 0 || !data.VoucherAmount) {
        return { valid: false, amount: 0, code: voucherCode, message: data.Message ?? 'Invalid voucher.' };
      }
      return { valid: true, amount: +data.VoucherAmount, code: voucherCode };
    }
    return { valid: false, amount: 0, code: voucherCode, message: data?.Message ?? 'Could not validate voucher.' };
  } catch {
    return { valid: false, amount: 0, code: voucherCode, message: 'Network error. Please try again.' };
  }
};

// ---------------------------------------------------------------------------
// Contact Us: submit contact form
// Live parity: POST BroadwayAPI.aspx?Method=ContactUs with JSON { Name, Phone, Remarks }
// ---------------------------------------------------------------------------
export interface ContactUsPayload {
  Name: string;
  Phone?: string;
  Remarks?: string;
}

export const submitContactUs = async (
  payload: ContactUsPayload,
): Promise<{ success: boolean; message?: string }> => {
  try {
    const res = await fetch(`${BASE_URL}/BroadwayAPI.aspx?Method=ContactUs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    const ok = Boolean(data?.responseType ?? data?.ResponseType);
    if (ok) {
      return {
        success: true,
        message:
          data?.message ??
          data?.Message ??
          'Your information has been sent to our team, You will get a callback from us to assist you accordingly.',
      };
    }
    return {
      success: false,
      message: data?.message ?? data?.Message ?? 'Could not submit your message. Please try again.',
    };
  } catch {
    return { success: false, message: 'Network error. Please check your connection and try again.' };
  }
};

// ---------------------------------------------------------------------------
// Birthday Event: submit birthday inquiry form
// Live parity: POST BroadwayAPI.aspx?Method=AddBirthdayEvent
// ---------------------------------------------------------------------------
export interface BirthdayEventPayload {
  birthday_deal: string;
  Name: string;
  Phone: string;
  Email: string;
  NoofPerson: string;
  date_time: string;
  location: string;
  Instructions?: string;
}

export const submitBirthdayEvent = async (
  payload: BirthdayEventPayload,
): Promise<{ success: boolean; message?: string }> => {
  try {
    const res = await fetch(`${BASE_URL}/BroadwayAPI.aspx?Method=AddBirthdayEvent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    const ok = Boolean(data?.responseType ?? data?.ResponseType);
    if (ok) {
      return {
        success: true,
        message:
          data?.message ??
          data?.Message ??
          'Your information has been sent to our team, You will get a callback from us to assist you accordingly.',
      };
    }
    return {
      success: false,
      message: data?.message ?? data?.Message ?? 'Could not submit your birthday inquiry. Please try again.',
    };
  } catch {
    return { success: false, message: 'Network error. Please check your connection and try again.' };
  }
};

// ---------------------------------------------------------------------------
// Catering Event: submit catering lead form
// Live parity: POST BroadwayAPI.aspx?Method=AddCateringEvent
// ---------------------------------------------------------------------------
export interface CateringEventPayload {
  Name: string;
  Phone: string;
  Email: string;
  NoofPerson: string;
  date_time: string;
  Location: string;
  Instructions?: string;
}

export const submitCateringEvent = async (
  payload: CateringEventPayload,
): Promise<{ success: boolean; message?: string }> => {
  try {
    const res = await fetch(`${BASE_URL}/BroadwayAPI.aspx?Method=AddCateringEvent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    const ok = Boolean(data?.responseType ?? data?.ResponseType);
    if (ok) {
      return {
        success: true,
        message:
          data?.message ??
          data?.Message ??
          'Your information has been sent to our team, You will get a callback from us to assist you accordingly.',
      };
    }
    return {
      success: false,
      message: data?.message ?? data?.Message ?? 'Could not submit your catering request. Please try again.',
    };
  } catch {
    return { success: false, message: 'Network error. Please check your connection and try again.' };
  }
};

// ---------------------------------------------------------------------------
// Corporate Event: submit corporate lead form
// Live parity: POST BroadwayAPI.aspx?Method=AddCorporateEvent
// ---------------------------------------------------------------------------
export interface CorporateEventPayload {
  Name: string;
  Phone: string;
  Email: string;
  Organization: string;
  Query?: string;
}

export const submitCorporateEvent = async (
  payload: CorporateEventPayload,
): Promise<{ success: boolean; message?: string }> => {
  try {
    const res = await fetch(`${BASE_URL}/BroadwayAPI.aspx?Method=AddCorporateEvent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    const ok = Boolean(data?.responseType ?? data?.ResponseType);
    if (ok) {
      return {
        success: true,
        message:
          data?.message ??
          data?.Message ??
          'Your information has been sent to our team, You will get a callback from us to assist you accordingly.',
      };
    }
    return {
      success: false,
      message: data?.message ?? data?.Message ?? 'Could not submit your corporate request. Please try again.',
    };
  } catch {
    return { success: false, message: 'Network error. Please check your connection and try again.' };
  }
};

// ---------------------------------------------------------------------------
// Franchise Request: submit franchise lead form
// Live parity: POST BroadwayAPI.aspx?Method=franchiserequestv1
// ---------------------------------------------------------------------------
export interface FranchiseRequestPayload {
  firstName: string;
  contact?: string;
  Email?: string;
  occupation: string;
  city: string;
  own_other_franchises: string;
  own_property?: 'Yes' | 'No' | string;
  hearAbout?: string;
  totalLiquidAssets?: string;
  regions: string;
}

export const submitFranchiseRequest = async (
  payload: FranchiseRequestPayload,
): Promise<{ success: boolean; message?: string }> => {
  try {
    const res = await fetch(`${BASE_URL}/BroadwayAPI.aspx?Method=franchiserequestv1`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    const ok = Boolean(data?.responseType ?? data?.ResponseType);
    if (ok) {
      return {
        success: true,
        message:
          data?.message ??
          data?.Message ??
          'Your information has been sent to our team, You will get a callback from us to assist you accordingly.',
      };
    }
    return {
      success: false,
      message: data?.message ?? data?.Message ?? 'Could not submit your franchise request. Please try again.',
    };
  } catch {
    return { success: false, message: 'Network error. Please check your connection and try again.' };
  }
};

// ---------------------------------------------------------------------------
// Order Status: poll live status after order placed
// Cordova: GET BroadwayAPI.aspx?Method=CheckOrderStatusV1&OrderID=
// ---------------------------------------------------------------------------
export type OrderStatusPhase = 'Pending' | 'Confirmed' | 'Preparing' | 'Out for Delivery' | 'Delivered' | 'Ready for Pickup' | 'Rejected';

function normalizeOrderId(orderId: string): string {
  const raw = String(orderId ?? '').trim();
  return raw;
}

export interface OrderStatus {
  id: string;
  status: OrderStatusPhase | string;
  deliveryTime: string;  // ETA in minutes
  orderAmount: number;
  created: string;
  orderType: string;
  riderName?: string;
  riderPhone?: string;
  branchId?: string;
}

export const fetchOrderStatus = async (orderId: string): Promise<OrderStatus | null> => {
  try {
    const normalizedOrderId = normalizeOrderId(orderId);
    const data = await apiFetch(`BroadwayAPI.aspx?Method=CheckOrderStatusV1&OrderID=${normalizedOrderId}`);
    if (!data?.Data?.[0]) return null;
    const d = data.Data[0];
    return {
      id: String(d.id ?? normalizedOrderId),
      status: d.status ?? 'Pending',
      deliveryTime: String(d.deliverytime ?? '30'),
      orderAmount: parseFloat(d.orderamount ?? '0'),
      created: d.created ?? '',
      orderType: d.ordertype ?? '',
      riderName: d.RiderName ?? d.ridername ?? undefined,
      riderPhone: d.RiderPhone ?? d.riderphone ?? undefined,
      branchId: d.branchId ?? undefined,
    };
  } catch {
    return null;
  }
};

// ---------------------------------------------------------------------------
// ReOrder: fetch order details for "Order Again" and track page
// Cordova: GET BroadwayAPI.aspx?Method=ReOrderV1&OrderID=
// ---------------------------------------------------------------------------
export interface ReOrderDetails {
  customerName: string;
  customerMobile: string;
  email: string;
  paymentType: string;
  orderType: string;
  userArea: string;
  outlet: string;
  outletId: string;
  city: string;
  deliveryAddress: string;
  remarks: string;
  deliveryTax: number;
  subTotal: number;
  taxAmount: number;
  deliveryFee: number;
  orderAmount: number;
  tax: string;           // GST percentage label e.g. "15"
  riderName: string;
  riderPhone: string;
  products: any[];       // raw items from Data[]
}

export const fetchReOrderDetails = async (orderId: string): Promise<ReOrderDetails | null> => {
  try {
    const normalizedOrderId = normalizeOrderId(orderId);
    const data = await apiFetch(`BroadwayAPI.aspx?Method=ReOrderV1&OrderID=${normalizedOrderId}`);
    if (!data || data.ResponseType === 0) return null;
    return {
      customerName: data.CustomerName ?? '',
      customerMobile: data.CustomerMobile ?? '',
      email: data.Email ?? '',
      paymentType: data.PaymentType ?? '',
      orderType: data.OrderType ?? '',
      userArea: data.UserArea ?? '',
      outlet: data.Outlet ?? '',
      outletId: data.OutletID ?? '',
      city: data.City ?? '',
      deliveryAddress: data.DeliveryAddress ?? '',
      remarks: data.Remarks ?? '',
      deliveryTax: parseFloat(data.DeliveryTax ?? '0'),
      subTotal: parseFloat(data.SubTotal ?? '0'),
      taxAmount: parseFloat(data.TaxAmount ?? '0'),
      deliveryFee: parseFloat(data.DeliveryFee ?? '0'),
      orderAmount: parseFloat(data.OrderAmount ?? '0'),
      tax: String(data.Tax ?? ''),
      riderName: data.RiderName ?? '',
      riderPhone: data.RiderPhone ?? '',
      products: Array.isArray(data.Data) ? data.Data : [],
    };
  } catch {
    return null;
  }
};