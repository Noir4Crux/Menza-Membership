CREATE TABLE IF NOT EXISTS "Supplier" (
  "SupplierID"   varchar(10) PRIMARY KEY,
  "NamaSupplier" varchar(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS "Produk" (
  "ProdukID"    varchar(10) PRIMARY KEY,
  "NamaProduk"  varchar(50) NOT NULL,
  "Satuan"      varchar(15) NOT NULL,
  "Stok"        integer NOT NULL DEFAULT 0 CHECK ("Stok" >= 0),
  "HargaSatuan" numeric(10,2) NOT NULL CHECK ("HargaSatuan" >= 0)
);

CREATE TABLE IF NOT EXISTS "Pesanan_Produk" (
  "PesananID"      varchar(10) PRIMARY KEY,
  "ProdukID"       varchar(10) NOT NULL REFERENCES "Produk"("ProdukID"),
  "BarberID"       varchar(10) NOT NULL REFERENCES "Barber"("BarberID"),
  "SupplierID"     varchar(10) NOT NULL REFERENCES "Supplier"("SupplierID"),
  "Jumlah"         integer NOT NULL CHECK ("Jumlah" > 0),
  "HargaSatuan"    numeric(10,2) NOT NULL,
  "Catatan"        varchar(200),
  "Status"         varchar(20) NOT NULL DEFAULT 'Belum dikirim'
                   CHECK ("Status" IN ('Belum dikirim','Pengemasan','Dalam pengiriman','Diterima')),
  "TanggalPesan"   date NOT NULL DEFAULT CURRENT_DATE,
  "TanggalTerima"  date,
  "JumlahDiterima" integer
);

CREATE TABLE IF NOT EXISTS "Status_Layanan" (
  "TransaksiID"  varchar(10) PRIMARY KEY REFERENCES "Transaksi"("TransaksiID") ON DELETE CASCADE,
  "Status"       varchar(20) NOT NULL DEFAULT 'Menunggu'
                 CHECK ("Status" IN ('Menunggu','Sedang Dikerjakan','Selesai')),
  "Catatan"      varchar(300),
  "WaktuMulai"   timestamp,
  "WaktuSelesai" timestamp
);

CREATE TABLE IF NOT EXISTS "Notifikasi" (
  "NotifikasiID" serial PRIMARY KEY,
  "Penerima"     varchar(10) NOT NULL,
  "Jenis"        varchar(30) NOT NULL,
  "Pesan"        varchar(300) NOT NULL,
  "Tanggal"      timestamp NOT NULL DEFAULT now()
);
ALTER TABLE "Notifikasi" ADD COLUMN IF NOT EXISTS "Dibaca" boolean NOT NULL DEFAULT false;

INSERT INTO "Supplier" VALUES ('SUP001','Switzal') ON CONFLICT DO NOTHING;

INSERT INTO "Produk" VALUES
 ('PRD001','Pomade','Jar',3,80000),
 ('PRD002','Hair Tonic','Botol',7,60000),
 ('PRD003','Hair Wax','Jar',0,50000),
 ('PRD004','Shampoo','Botol',5,50000)
ON CONFLICT DO NOTHING;

INSERT INTO "Pesanan_Produk"
 ("PesananID","ProdukID","BarberID","SupplierID","Jumlah","HargaSatuan","Catatan","Status","TanggalPesan","TanggalTerima","JumlahDiterima") VALUES
 ('ORD-001','PRD004','BRB001','SUP001',1,50000,NULL,'Belum dikirim','2026-10-25',NULL,NULL),
 ('ORD-002','PRD002','BRB001','SUP001',4,60000,NULL,'Diterima','2026-10-11','2026-10-14',4),
 ('ORD-003','PRD001','BRB002','SUP001',2,80000,'Mohon dikemas rapi','Pengemasan','2026-11-03',NULL,NULL)
ON CONFLICT DO NOTHING;

INSERT INTO "Status_Layanan" ("TransaksiID","Status","Catatan","WaktuMulai","WaktuSelesai") VALUES
 ('TK0000001','Selesai','Layanan selesai tanpa kendala.','2026-08-08 10:00','2026-08-08 10:40'),
 ('TK0000002','Selesai','Layanan selesai tanpa kendala.','2026-09-11 11:00','2026-09-11 11:35'),
 ('TK0000003','Selesai','Layanan selesai tanpa kendala.','2026-10-26 14:00','2026-10-26 15:10')
ON CONFLICT DO NOTHING;

UPDATE "Transaksi" SET "OwnerID" = 'OWN001' WHERE "OwnerID" IS NULL;

INSERT INTO "Notifikasi" ("Penerima","Jenis","Pesan") VALUES
 ('SUP001','Pesanan Produk','Pesanan baru ORD-001 dari Menza Barbershop: Shampoo x1.'),
 ('OWN001','Laporan Bulanan','Admin toko telah mengirimkan dokumen rekapan bulan Oktober.');
