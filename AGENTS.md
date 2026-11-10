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

