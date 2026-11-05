INSERT INTO "Membership" VALUES
 ('Aktif','Diskon, poin, prioritas antrean, promo khusus'),
 ('Menunggu','Menunggu verifikasi admin'),
 ('Ditolak','Data tidak valid'),
 ('Kadaluarsa','Masa berlaku berakhir');

INSERT INTO "Admin"  VALUES ('ADM001','Administrator Menza');
INSERT INTO "Owner"  VALUES ('OWN001','Owner Menza');
INSERT INTO "Barber" VALUES ('BRB001','Barber Senior'), ('BRB002','Barber Junior');

INSERT INTO "Layanan" VALUES
 ('LY001','Haircut by Senior Kapster',  80000),
 ('LY002','Haircut by Junior Kapster',  60000),
 ('LY003','Coloring',                  150000),
 ('LY004','Full Service',              300000);

INSERT INTO "Member" VALUES
 ('MBR001','Andi','Aktif'),
 ('MBR002','Faiz','Aktif'),
 ('MBR003','Rani','Menunggu');

INSERT INTO "Transaksi"
 ("TransaksiID","TanggalTransaksi","MemberID","StatusMembership","TotalTransaksi",
  "PoinDiperoleh","PoinDigunakan","Benefit","AdminID","OwnerID","BarberID","MemberMemberID") VALUES
 ('TK0000001','2026-08-08','MBR001','Aktif', 80000,5,0,NULL,'ADM001',NULL,'BRB001',NULL),
 ('TK0000002','2026-09-11','MBR001','Aktif', 60000,5,0,NULL,'ADM001',NULL,'BRB002',NULL),
 ('TK0000003','2026-10-26','MBR002','Aktif',300000,5,0,NULL,'ADM001',NULL,'BRB001',NULL);

INSERT INTO "Detail_Transaksi" VALUES
 ('DT00000001','LY001', 80000,'TK0000001'),
 ('DT00000002','LY002', 60000,'TK0000002'),
 ('DT00000003','LY004',300000,'TK0000003');
