-- 1. Daftar tabel dan jumlah baris sebenarnya
SELECT table_name AS tabel,
       (xpath('/row/c/text()', query_to_xml(format('select count(*) as c from %I.%I', table_schema, table_name), false, true, '')))[1]::text::int AS jumlah_baris
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. Kolom, tipe data, boleh kosong, nilai default
SELECT c.relname AS tabel, a.attnum AS no, a.attname AS kolom,
       format_type(a.atttypid, a.atttypmod) AS tipe_data,
       CASE WHEN a.attnotnull THEN 'NOT NULL' ELSE 'boleh kosong' END AS kosong,
       pg_get_expr(d.adbin, d.adrelid) AS nilai_default
FROM pg_attribute a
JOIN pg_class c ON c.oid = a.attrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
LEFT JOIN pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum
WHERE n.nspname = 'public' AND c.relkind = 'r' AND a.attnum > 0 AND NOT a.attisdropped
ORDER BY c.relname, a.attnum;

-- 3. Primary key, foreign key, CHECK, UNIQUE
SELECT conrelid::regclass AS tabel, conname AS nama_constraint,
       CASE contype WHEN 'p' THEN 'PRIMARY KEY' WHEN 'f' THEN 'FOREIGN KEY'
                    WHEN 'c' THEN 'CHECK' WHEN 'u' THEN 'UNIQUE' END AS jenis,
       pg_get_constraintdef(oid) AS definisi
FROM pg_constraint
WHERE connamespace = 'public'::regnamespace
ORDER BY conrelid::regclass::text, contype;

-- 4. Relasi antar tabel (anak menunjuk induk)
SELECT c.conrelid::regclass AS tabel_anak, a.attname AS kolom_fk,
       c.confrelid::regclass AS tabel_induk, af.attname AS kolom_pk
FROM pg_constraint c
JOIN pg_attribute a  ON a.attrelid  = c.conrelid  AND a.attnum  = ANY(c.conkey)
JOIN pg_attribute af ON af.attrelid = c.confrelid AND af.attnum = ANY(c.confkey)
WHERE c.contype = 'f' AND c.connamespace = 'public'::regnamespace
ORDER BY 1, 2;

-- 5. Indeks
SELECT tablename AS tabel, indexname AS indeks, indexdef AS definisi
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
