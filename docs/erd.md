# ERD Menza Membership


```mermaid
erDiagram
    Membership ||--o{ Member : "StatusMembership"
    Membership ||--o{ Transaksi : "StatusMembership"
    Member ||--o{ Transaksi : "MemberID"
    Member |o--o{ Transaksi : "MemberMemberID"
    Admin ||--o{ Transaksi : "AdminID"
    Owner |o--o{ Transaksi : "OwnerID"
    Barber ||--o{ Transaksi : "BarberID"
    Transaksi ||--o{ Detail_Transaksi : "TransaksiTransaksiID"
    Layanan ||--o{ Detail_Transaksi : "LayananID"
    Member ||--o| Member_Info : "MemberID"

    Admin {
        string AdminID PK "varchar(10)"
        string NamaAdmin "varchar(50)"
    }

    Barber {
        string BarberID PK "varchar(10)"
        string NamaBarber "varchar(50)"
    }

    Owner {
        string OwnerID PK "varchar(10)"
        string NamaOwner "varchar(50)"
    }

    Membership {
        string StatusMembership PK "varchar(15)"
        string Benefit "varchar(100), nullable"
    }

    Member {
        string MemberID PK "varchar(10)"
        string NamaMember "varchar(50)"
        string StatusMembership FK "varchar(15)"
    }

    Layanan {
        string LayananID PK "varchar(5)"
        string NamaLayanan "varchar(50)"
        decimal HargaLayanan "decimal(10,2)"
    }

    Transaksi {
        string TransaksiID PK "varchar(10)"
        date TanggalTransaksi
        string MemberID FK "varchar(10)"
        string StatusMembership FK "varchar(15)"
        decimal TotalTransaksi "decimal(10,2)"
        int PoinDiperoleh "nullable"
        int PoinDigunakan "nullable"
        string Benefit "varchar(20), nullable"
        string AdminID FK "varchar(10)"
        string OwnerID FK "varchar(10), nullable"
        string BarberID FK "varchar(10)"
        string MemberMemberID FK "varchar(10), nullable"
    }

    Detail_Transaksi {
        string TransaksiID PK "varchar(10)"
        string LayananID FK "varchar(5)"
        decimal HargaSaatTransaksi "decimal(10,2)"
        string TransaksiTransaksiID FK "varchar(10)"
    }

    Member_Info {
        string MemberID PK, FK "varchar(10)"
        string NomorHP "varchar(15), nullable"
        date TanggalDaftar
        date MasaBerlaku "nullable"
        string Catatan "varchar(200), nullable"
    }

    Notifikasi {
        int NotifikasiID PK
        string Penerima "varchar(10)"
        string Jenis "varchar(30)"
        string Pesan "varchar(300)"
        timestamp Tanggal
    }
```

| Nama tabel | Primary key | Foreign key |
|---|---|---|
| `Admin` | `AdminID` | — |
| `Barber` | `BarberID` | — |
| `Owner` | `OwnerID` | — |
| `Membership` | `StatusMembership` | — |
| `Member` | `MemberID` | `StatusMembership` → `Membership.StatusMembership` |
| `Layanan` | `LayananID` | — |
| `Transaksi` | `TransaksiID` | `MemberID` → `Member.MemberID`; `MemberMemberID` → `Member.MemberID` (opsional); `StatusMembership` → `Membership.StatusMembership`; `AdminID` → `Admin.AdminID`; `OwnerID` → `Owner.OwnerID` (opsional); `BarberID` → `Barber.BarberID` |
| `Detail_Transaksi` | `TransaksiID` | `LayananID` → `Layanan.LayananID`; `TransaksiTransaksiID` → `Transaksi.TransaksiID` |
| `Member_Info` | `MemberID` | `MemberID` → `Member.MemberID` |
| `Notifikasi` | `NotifikasiID` | — |
