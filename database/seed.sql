-- Jalankan setelah schema.sql untuk data demo lokal.
-- Password demo untuk semua user: admin123
insert into users (email, password_hash, role)
values
  ('admin@warung.local', crypt('admin123', gen_salt('bf')), 'admin'),
  ('dapur@warung.local', crypt('admin123', gen_salt('bf')), 'kitchen')
on conflict (email) do nothing;

insert into tables (table_number)
values (1), (2), (3), (4), (5)
on conflict (table_number) do nothing;

insert into menu_items (name, description, category, price, image_url)
values
  ('Nasi Goreng Spesial', 'Nasi goreng dengan telur, ayam suwir, dan kerupuk.', 'makanan', 28000, 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80'),
  ('Ayam Geprek Sambal Bawang', 'Ayam crispy dengan sambal bawang pedas gurih.', 'makanan', 26000, 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=800&q=80'),
  ('Es Teh Manis', 'Teh manis dingin segar.', 'minuman', 8000, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&q=80'),
  ('Kopi Susu Gula Aren', 'Kopi susu creamy dengan gula aren.', 'minuman', 18000, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=800&q=80'),
  ('Puding Coklat', 'Puding lembut dengan saus coklat.', 'dessert', 15000, 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80')
on conflict do nothing;
