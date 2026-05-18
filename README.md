# Warung QR Order

Aplikasi web responsive untuk rumah makan/restoran: pelanggan scan QR di meja, memilih menu, checkout dari HP, lalu admin dan dapur memantau pesanan secara realtime.

## Stack
- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express + TypeScript
- Database: Supabase PostgreSQL
- Realtime: Supabase Realtime channel pada tabel `orders`
- Auth: JWT untuk admin/dapur

## Struktur Project
```text
.
├── frontend/              # React customer, admin, kitchen UI
├── backend/               # Express API
├── database/schema.sql    # Struktur database Supabase
├── database/seed.sql      # Data demo opsional
├── docs/architecture.md
└── .env.example
```

## Setup Lokal

### 1. Install dependency
```bash
npm install
```

> Catatan: di environment agent saat ini akses npm registry diblokir proxy/policy (`403 Forbidden`). Di mesin lokal normal, perintah ini akan mengunduh dependency workspace frontend dan backend.

### 2. Buat project Supabase
1. Buat project baru di Supabase.
2. Buka **SQL Editor**.
3. Jalankan `database/schema.sql`.
4. Opsional untuk data demo: jalankan `database/seed.sql`.
5. Aktifkan Realtime untuk tabel `orders`, `order_items`, dan `call_waiter_logs` melalui **Database > Replication**.

### 3. Konfigurasi environment
```bash
cp .env.example .env
```

Isi nilai berikut di `.env`:
```env
VITE_API_URL=http://localhost:4000/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
NODE_ENV=development
PORT=4000
JWT_SECRET=change-this-super-secret-min-16-chars
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
APP_BASE_URL=http://localhost:5173
```

### 4. Jalankan aplikasi
```bash
npm run dev
```

- Frontend: <http://localhost:5173>
- Backend API: <http://localhost:4000/api/health>

## Cara Pakai Demo

### Customer
1. Buka URL QR meja, contoh: <http://localhost:5173/menu?table=1>.
2. Cari/filter menu, tambah ke keranjang, atur jumlah dan catatan.
3. Klik checkout.
4. Status pesanan akan tampil dan diperbarui realtime jika Supabase Realtime aktif.
5. Klik **Panggil Pelayan** untuk membuat log panggilan pelayan.

### Admin
1. Buka <http://localhost:5173/admin>.
2. Jika menjalankan `database/seed.sql`, login dengan:
   - Email: `admin@warung.local`
   - Password: `admin123`
3. Pantau pesanan, ubah status, lihat ringkasan laporan harian, menu, dan meja.

### Dapur
1. Login admin/kitchen terlebih dahulu agar token tersimpan di browser.
2. Buka <http://localhost:5173/kitchen>.
3. Tandai pesanan sebagai **Sedang Dimasak** atau **Selesai**.

## Endpoint Utama
- `POST /api/auth/login`
- `GET /api/public/menus`
- `GET /api/public/tables/:tableNumber`
- `POST /api/public/call-waiter`
- `POST /api/orders`
- `GET /api/orders/table/:tableId`
- `GET /api/admin/orders`
- `PATCH /api/admin/orders/:id/status`
- `GET /api/admin/reports/sales?range=daily|weekly|monthly`
- `GET/POST/PUT/DELETE /api/management/menus`
- `POST /api/management/menus/upload`
- `GET/POST/DELETE /api/management/tables`

## Generate QR Code Meja
Endpoint admin `POST /api/management/tables` otomatis membuat QR data URL dengan target:

```text
{APP_BASE_URL}/menu?table={table_number}
```

Simpan/print nilai `qr_url` dari response untuk ditempel di meja.

## Catatan Production
- Ganti `JWT_SECRET` dengan secret kuat.
- Jangan expose `SUPABASE_SERVICE_ROLE_KEY` ke frontend.
- Upload foto menu saat ini disimpan lokal di `backend/uploads`; untuk production gunakan Supabase Storage/S3.
- Aktifkan RLS policy sesuai role sebelum go-live.
