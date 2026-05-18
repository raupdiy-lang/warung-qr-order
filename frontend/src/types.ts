export type Category = 'makanan' | 'minuman' | 'dessert';
export type MenuItem = { id: string; name: string; category: Category; description?: string; price: number; image_url?: string };
export type TableInfo = { id: string; table_number: number; qr_url?: string };
export type CartItem = { menu: MenuItem; quantity: number; note?: string };
