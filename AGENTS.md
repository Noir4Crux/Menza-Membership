<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## API Admin
Login: ID + password demo (DEMO_PASSWORD di .env), sesi cookie menza_session.
Tabel pendukung di luar ERD: Member_Info (NomorHP, TanggalDaftar, MasaBerlaku) dan Notifikasi.
Poin: +5 per transaksi untuk member Aktif, 1 poin = Rp100 diskon.
Endpoint admin: /api/admin/member, verifikasi, masa-berlaku, notifikasi, transaksi, laporan, dashboard.
Endpoint member: /api/member/layanan, me, hitung, pembayaran, transaksi, transaksi/[id]. Pembayaran member hanya membuat notifikasi ke ADM001, bukan Transaksi.

## Barber, Owner, Supplier
Tabel pendukung di luar ERD: Supplier, Produk, Pesanan_Produk, Status_Layanan, Notifikasi (kolom Dibaca).
Status layanan: Menunggu, Sedang Dikerjakan, Selesai. Status pesanan: Belum dikirim, Pengemasan, Dalam pengiriman, Diterima.
Status stok: Habis (0), Menipis (1 sampai 4), Tersedia (5 atau lebih).
Owner hanya melihat transaksi yang OwnerID-nya terisi (dikirim Admin).
Akun demo: BRB001/rafising123@gmail.com, OWN001/zahra123@gmail.com, SUP001/amiflow123@gmail.com, password DEMO_PASSWORD.


## Deployment
Database produksi: Neon (Postgres, Singapore). Skema dibuat dengan prisma db push (alamat direct). Vercel memakai alamat pooled.
Variabel lingkungan: DATABASE_URL, SESSION_SECRET, DEMO_PASSWORD.
Constraint CHECK dipulihkan lewat SQL Editor Neon karena tidak dibawa db push.


## Prompt penting (ringkasan)
1. Kerangka layout: "Baca frame Figma lewat Figma MCP, buat Sidebar, Topbar, dan StatCard yang dipakai ulang semua role."
2. Halaman per role: "Implementasikan frame Figma ini sebagai app/<role>/<halaman>/page.tsx dengan data contoh."
3. Landing, login, dan animasi: "Buat halaman Masuk Sebagai dan Login, tambahkan animasi pembuka dengan library motion."
4. Perbaikan hydration error: "Samakan hasil render server dan client pada Topbar, Sidebar, dan template."
5. Login dan sesi: "Buat login berbasis cookie bertanda tangan, akun demo email ke ID, password dari .env."
6. API Admin: "Buat route handler untuk member, verifikasi, masa berlaku, notifikasi, transaksi, laporan, dan dashboard."
7. Hubungkan halaman Admin ke API, termasuk pilihan Barber yang harus bisa diklik.
8. Tabel pendukung serta fitur Barber, Supplier, dan Owner (API dan halaman).
9. Alur Member: pilih layanan, ringkasan poin, konfirmasi pembayaran yang mengirim notifikasi ke Admin.
10. Perbaikan error: "Cari penyebab kesalahan server atau build gagal, perbaiki tanpa mengubah tampilan."

## AI Log

| Tanggal | Tujuan | Prompt Ringkas | Keputusan | Verifikasi |
|---|---|---|---|---|
| 06/11/2026 | Membuat kerangka navigasi dan komponen statistik bersama untuk semua peran. | "Buat Sidebar, Topbar, dan StatCard yang dapat dipakai ulang." | Dipakai [konfirmasi] | [isi cara verifikasi] |
| 06/11/2026 | Mengimplementasikan halaman peran dengan data contoh berdasarkan rancangan. | "Implementasikan halaman tiap peran dengan data contoh." | Dipakai [konfirmasi] | [isi cara verifikasi] |
| 06/11/2026 | Menambahkan landing, login, dan animasi transisi. | "Buat halaman pemilihan peran dan login dengan animasi." | Dipakai [konfirmasi] | [isi cara verifikasi] |
| [isi tanggal] | Memperbaiki ketidaksesuaian render server dan client. | "Samakan hasil render server dan client." | Dipakai [konfirmasi] | [isi cara verifikasi] |
| 09/11/2026 | Mengimplementasikan autentikasi sesi bertanda tangan dan akun demo. | "Buat login cookie bertanda tangan dengan akun demo." | Dipakai [konfirmasi] | [isi cara verifikasi] |
| 10/11/2026 | Menambahkan API administrasi untuk member, transaksi, notifikasi, dan laporan. | "Buat route handler untuk fitur administrasi." | Dipakai [konfirmasi] | [isi cara verifikasi] |
| 10/11/2026 | Menghubungkan halaman Admin ke API dan menyediakan pemilihan Barber. | "Hubungkan halaman Admin ke API dan aktifkan pilihan Barber." | Dipakai [konfirmasi] | [isi cara verifikasi] |
| 10/11/2026 | Mengimplementasikan fitur serta tabel pendukung Barber, Supplier, dan Owner. | "Tambahkan tabel pendukung serta fitur Barber, Supplier, dan Owner." | Dipakai [konfirmasi] | [isi cara verifikasi] |
| 10/11/2026 | Membuat alur layanan dan pembayaran member yang memberi notifikasi ke Admin. | "Buat alur pilih layanan dan konfirmasi pembayaran member." | Dipakai [konfirmasi] | [isi cara verifikasi] |
| [isi tanggal] | Mendiagnosis dan memperbaiki error server atau build tanpa mengubah tampilan. | "Perbaiki error server atau build tanpa mengubah tampilan." | Dipakai [konfirmasi] | [isi cara verifikasi] |
