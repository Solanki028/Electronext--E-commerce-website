export const SORT_OPTIONS = [
  { label: 'Newest First', value: '-createdAt' },
  { label: 'Price: Low to High', value: 'price' },
  { label: 'Price: High to Low', value: '-price' },
  { label: 'Top Rated', value: '-averageRating' },
  { label: 'Best Selling', value: '-soldCount' },
];

export const ORDER_STATUSES = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
  processing: { label: 'Processing', color: 'bg-indigo-100 text-indigo-800' },
  shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
  returned: { label: 'Returned', color: 'bg-slate-100 text-slate-800' },
};

export const PAYMENT_METHODS = [
  { label: 'Cash on Delivery', value: 'cod' },
  { label: 'Online Payment', value: 'online' },
  { label: 'Wallet', value: 'wallet' },
];

export const ITEMS_PER_PAGE = 12;
export const ADMIN_ITEMS_PER_PAGE = 15;

export const MAX_IMAGES_PER_PRODUCT = 8;
export const MAX_FILE_SIZE_MB = 5;

export const ROUTES = {
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCT: (slug) => `/product/${slug}`,
  CATEGORY: (slug) => `/category/${slug}`,
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDERS: '/orders',
  ORDER: (id) => `/orders/${id}`,
  WISHLIST: '/wishlist',
  PROFILE: '/profile',
  LOGIN: '/login',
  REGISTER: '/register',
  ADMIN: '/admin',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_COUPONS: '/admin/coupons',
  ADMIN_BANNERS: '/admin/banners',
  ADMIN_USERS: '/admin/users',
};
