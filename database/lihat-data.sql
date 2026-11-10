ISI TABEL

-- Barber
SELECT * FROM "Barber" ORDER BY "BarberID";

-- Owner
SELECT * FROM "Owner" ORDER BY "OwnerID";

-- Admin
SELECT * FROM "Admin" ORDER BY "AdminID";

-- Membership
SELECT * FROM "Membership" ORDER BY "StatusMembership";

-- Member
SELECT * FROM "Member" ORDER BY "MemberID";

-- Layanan
SELECT * FROM "Layanan" ORDER BY "LayananID";

-- Transaksi
SELECT * FROM "Transaksi" ORDER BY "TransaksiID";

-- Detail Transaksi
SELECT * FROM "Detail_Transaksi" ORDER BY "TransaksiID";

-- Tabel pendukung (hapus tanda -- di depan kalau tabelnya sudah dibuat)
-- SELECT * FROM "Member_Info" ORDER BY "MemberID";
-- SELECT * FROM "Notifikasi" ORDER BY "NotifikasiID";

-- Saldo poin tiap member
SELECT m."MemberID", m."NamaMember",
       COALESCE(SUM(t."PoinDiperoleh"),0) - COALESCE(SUM(t."PoinDigunakan"),0) AS saldo_poin
FROM "Member" m
LEFT JOIN "Transaksi" t ON t."MemberID" = m."MemberID"
GROUP BY m."MemberID", m."NamaMember"
ORDER BY m."MemberID";

-- Riwayat transaksi lengkap (gabungan beberapa tabel)
SELECT t."TransaksiID", t."TanggalTransaksi", m."NamaMember", b."NamaBarber",
       l."NamaLayanan", d."HargaSaatTransaksi", t."TotalTransaksi",
       t."PoinDiperoleh", t."PoinDigunakan"
FROM "Transaksi" t
JOIN "Member" m ON m."MemberID" = t."MemberID"
JOIN "Barber" b ON b."BarberID" = t."BarberID"
JOIN "Detail_Transaksi" d ON d."TransaksiTransaksiID" = t."TransaksiID"
JOIN "Layanan" l ON l."LayananID" = d."LayananID"
ORDER BY t."TransaksiID";
