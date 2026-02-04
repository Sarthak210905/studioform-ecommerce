// Auth Types
export interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  is_active: boolean;
  is_verified: boolean;
  is_superuser: boolean;
  created_at: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  full_name?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  final_price: number;
  savings: number;
  savings_percentage: number;
  category?: string;
  brand?: string;
  images: string[];
  main_image?: string;
  stock: number;
  total_stock: number;
  is_in_stock: boolean;
  has_variants: boolean;
  variants?: ProductVariant[];
  related_product_ids: string[];
  discount_active: boolean;
  discount_percentage: number;
  discount_amount: number;
  discount_starts_at?: string;
  discount_ends_at?: string;
  is_active: boolean;
  is_featured: boolean;
  tags: string[];
  views_count: number;
  sales_count: number;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  sku: string;
  name: string;
  attributes: Record<string, string>;
  price_adjustment: number;
  stock: number;
  image_url?: string;
}

// Cart Types
export interface CartItem {
  id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  image_url: string;
  stock_quantity: number;
  subtotal: number;
}

export interface CartSummary {
  items: CartItem[];
  total_items: number;
  total_price: number;
}

// Wishlist Types
export interface WishlistItem {
  id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  final_price: number;
  discount_percentage: number;
  image_url?: string;
  in_stock: boolean;
  added_at: string;
}

// Order Types
export interface OrderSummary {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  items_count: number;
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  image_url?: string;
  subtotal: number;
}

export interface ShippingAddress {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface OrderResponse {
  id: string;
  order_number: string;
  items: OrderItem[];
  subtotal: number;
  shipping_cost: number;
  tax: number;
  discount_amount: number;
  coupon_code?: string;
  total_amount: number;
  status: string;
  payment_method: string;
  payment_status: string;
  shipping_address: ShippingAddress;
  shipping_zone?: string;
  estimated_delivery?: string;
  created_at: string;
}

// Review Types
export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  title?: string;
  comment?: string;
  is_verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
}

// Address Types
export interface Address {
  id: string;
  label?: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  is_default: boolean;
}

// Coupon Types
export interface Coupon {
  id: string;
  code: string;
  description: string;
  discount_type: 'flat' | 'percentage';
  discount_value: number;
  min_order_amount: number;
  max_discount_amount: number;
  usage_limit: number;
  usage_count: number;
  per_user_limit: number;
  is_active: boolean;
  starts_at: string;
  expires_at: string;
}
// ... keep all existing types and add these:

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface UserUpdate {
  full_name?: string;
  username?: string;
  email?: string;
}

export interface ChangePassword {
  current_password: string;
  new_password: string;
}
