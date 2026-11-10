export type MetadataLayanan = {
  kategori: string | null;
  label: string | null;
  deskripsi: string | null;
};

const katalogLayanan: Record<string, MetadataLayanan> = {
  LY001: {
    kategori: "Haircut",
    label: "By Senior Kapster",
    deskripsi:
      "Haircut, Hair wash, Hot towel, Vitamin, Head Message, Styling with Product",
  },
  LY002: {
    kategori: "Haircut",
    label: "By Junior Kapster",
    deskripsi:
      "Haircut, Hair wash, Hot towel, Vitamin, Head Message, Styling with Product",
  },
  LY003: {
    kategori: "Full Service",
    label: null,
    deskripsi:
      "Haircut, Creambath, Beard Trim/Shave, Hair wash, Hot towel, Vitamin, Styling with Product",
  },
  LY004: {
    kategori: "Other Service",
    label: null,
    deskripsi: "Hair Perming (To make hair a curly or wavy)",
  },
  LY005: {
    kategori: "Coloring",
    label: null,
    deskripsi: "Basic or Fashion Color",
  },
};

export function getMetadataLayanan(LayananID: string): MetadataLayanan {
  return (
    katalogLayanan[LayananID] ?? {
      kategori: null,
      label: null,
      deskripsi: null,
    }
  );
}
