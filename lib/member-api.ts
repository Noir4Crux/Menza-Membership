export function calculateMemberOrder(
  subtotalCents: number,
  saldoPoin: number,
  statusMembership: string,
  gunakanPoin: boolean,
) {
  const aktif = statusMembership === "Aktif";
  const poinDitukar =
    aktif && gunakanPoin
      ? Math.min(saldoPoin, Math.floor(subtotalCents / 10_000))
      : 0;
  const diskon = poinDitukar * 100;

  return {
    subtotal: subtotalCents / 100,
    saldoPoin,
    poinDitukar,
    diskon,
    total: (subtotalCents - diskon * 100) / 100,
    poinDiperoleh: aktif ? 5 : 0,
    aktif,
  };
}
