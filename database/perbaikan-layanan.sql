UPDATE "Layanan" SET "NamaLayanan"='Full Service', "HargaLayanan"=150000 WHERE "LayananID"='LY003';
UPDATE "Layanan" SET "NamaLayanan"='Other Service', "HargaLayanan"=250000 WHERE "LayananID"='LY004';
INSERT INTO "Layanan" VALUES ('LY005','Coloring',300000) ON CONFLICT DO NOTHING;
UPDATE "Detail_Transaksi" SET "LayananID"='LY005' WHERE "TransaksiID"='DT00000003';
UPDATE "Transaksi" SET "PoinDiperoleh"=250 WHERE "TransaksiID"='TK0000003';
UPDATE "Member_Info" SET "TanggalDaftar"='2026-01-01', "MasaBerlaku"='2027-01-01' WHERE "MemberID"='MBR002';
