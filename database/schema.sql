DROP TABLE IF EXISTS "Detail_Transaksi", "Transaksi", "Member", "Layanan",
  "Membership", "Admin", "Owner", "Barber" CASCADE;

CREATE TABLE "Barber" (
  "BarberID"   varchar(10) PRIMARY KEY,
  "NamaBarber" varchar(50) NOT NULL
);

CREATE TABLE "Owner" (
  "OwnerID"   varchar(10) PRIMARY KEY,
  "NamaOwner" varchar(50) NOT NULL
);

CREATE TABLE "Admin" (
  "AdminID"   varchar(10) PRIMARY KEY,
  "NamaAdmin" varchar(50) NOT NULL
);

CREATE TABLE "Membership" (
  "StatusMembership" varchar(15) PRIMARY KEY,
  "Benefit"          varchar(100)
);

CREATE TABLE "Layanan" (
  "LayananID"    varchar(5)    PRIMARY KEY,
  "NamaLayanan"  varchar(50)   NOT NULL,
  "HargaLayanan" numeric(10,2) NOT NULL CHECK ("HargaLayanan" >= 0)
);

CREATE TABLE "Member" (
  "MemberID"         varchar(10) PRIMARY KEY,
  "NamaMember"       varchar(50) NOT NULL,
  "StatusMembership" varchar(15) NOT NULL
    REFERENCES "Membership"("StatusMembership")
    ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE "Transaksi" (
  "TransaksiID"      varchar(10) PRIMARY KEY,
  "TanggalTransaksi" date NOT NULL DEFAULT CURRENT_DATE,
  "MemberID"         varchar(10) NOT NULL REFERENCES "Member"("MemberID"),
  "StatusMembership" varchar(15) NOT NULL REFERENCES "Membership"("StatusMembership") ON UPDATE CASCADE,
  "TotalTransaksi"   numeric(10,2) NOT NULL CHECK ("TotalTransaksi" >= 0),
  "PoinDiperoleh"    integer DEFAULT 0 CHECK ("PoinDiperoleh" >= 0),
  "PoinDigunakan"    integer DEFAULT 0 CHECK ("PoinDigunakan" >= 0),
  "Benefit"          varchar(20),
  "AdminID"          varchar(10) NOT NULL REFERENCES "Admin"("AdminID"),
  "OwnerID"          varchar(10) REFERENCES "Owner"("OwnerID"),
  "BarberID"         varchar(10) NOT NULL REFERENCES "Barber"("BarberID"),
  "MemberMemberID"   varchar(10) REFERENCES "Member"("MemberID")
);

CREATE TABLE "Detail_Transaksi" (
  "TransaksiID"          varchar(10) PRIMARY KEY,
  "LayananID"            varchar(5)  NOT NULL REFERENCES "Layanan"("LayananID"),
  "HargaSaatTransaksi"   numeric(10,2) NOT NULL CHECK ("HargaSaatTransaksi" >= 0),
  "TransaksiTransaksiID" varchar(10) NOT NULL
    REFERENCES "Transaksi"("TransaksiID") ON DELETE CASCADE
);

CREATE INDEX idx_transaksi_member  ON "Transaksi"("MemberID");
CREATE INDEX idx_transaksi_tanggal ON "Transaksi"("TanggalTransaksi");
CREATE INDEX idx_detail_transaksi  ON "Detail_Transaksi"("TransaksiTransaksiID");
