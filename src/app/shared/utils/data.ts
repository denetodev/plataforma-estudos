/** `YYYY-MM-DD` → Date no fuso local (new Date(iso) usaria UTC e deslocaria o dia). */
export function isoParaData(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const [ano, mes, dia] = iso.split('-').map(Number);
  return new Date(ano, mes - 1, dia);
}

/** Date → `YYYY-MM-DD` usando o dia local (toISOString converteria para UTC). */
export function dataParaIso(data: Date | null | undefined): string | null {
  if (!data || Number.isNaN(data.getTime())) return null;
  const mm = String(data.getMonth() + 1).padStart(2, '0');
  const dd = String(data.getDate()).padStart(2, '0');
  return `${data.getFullYear()}-${mm}-${dd}`;
}
