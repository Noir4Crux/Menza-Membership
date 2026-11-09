CREATE TABLE IF NOT EXISTS "Member_Info" (
  "MemberID"      varchar(10) PRIMARY KEY REFERENCES "Member"("MemberID") ON DELETE CASCADE,
  "NomorHP"       varchar(15),
  "TanggalDaftar" date NOT NULL DEFAULT CURRENT_DATE,
  "MasaBerlaku"   date,
  "Catatan"       varchar(200)
);

CREATE TABLE IF NOT EXISTS "Notifikasi" (
  "NotifikasiID" serial PRIMARY KEY,
  "Penerima"     varchar(10) NOT NULL,
  "Jenis"        varchar(30) NOT NULL,
  "Pesan"        varchar(300) NOT NULL,
  "Tanggal"      timestamp NOT NULL DEFAULT now()
);

INSERT INTO "Member_Info" ("MemberID","NomorHP","TanggalDaftar","MasaBerlaku") VALUES
 ('MBR001','081234567801','2026-01-15','2026-11-27'),
 ('MBR002','081234567802','2026-02-10','2027-10-28'),
 ('MBR003','081234567803','2026-11-05',NULL)
ON CONFLICT DO NOTHING;

INSERT INTO "Notifikasi" ("Penerima","Jenis","Pesan") VALUES
 ('MBR001','Masa Berlaku','Masa berlaku membership Anda akan berakhir pada 27/11/2026.');
