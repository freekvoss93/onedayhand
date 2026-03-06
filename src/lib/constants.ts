export const DAYS = [
  { value: "monday", label: "Maandag" },
  { value: "tuesday", label: "Dinsdag" },
  { value: "wednesday", label: "Woensdag" },
  { value: "thursday", label: "Donderdag" },
  { value: "friday", label: "Vrijdag" },
  { value: "saturday", label: "Zaterdag" },
];

export const TRADE_TYPES = [
  { value: "flooring", label: "Vloerleggen" },
  { value: "painting", label: "Schilderen" },
  { value: "plumbing", label: "Loodgieterswerk" },
  { value: "electrical", label: "Elektra" },
  { value: "carpentry", label: "Timmeren" },
  { value: "roofing", label: "Dakdekken" },
  { value: "general", label: "Algemeen klusbedrijf" },
  { value: "landscaping", label: "Tuinieren / Groenvoorziening" },
  { value: "cleaning", label: "Schoonmaak" },
  { value: "moving", label: "Verhuisbedrijf" },
];

export const INTENSITY_LEVELS = [
  { value: "low", label: "Licht", description: "Zittend/staand werk, geen zware tillen" },
  { value: "medium", label: "Gemiddeld", description: "Actief bewegen, licht tillen" },
  { value: "high", label: "Zwaar", description: "Zwaar tillen, fysiek intensief" },
];

export const COMPENSATION_TYPES = [
  { value: "none", label: "Onbetaald (vrijwillig)" },
  { value: "expenses", label: "Onkostenvergoeding" },
  { value: "daily_rate", label: "Dagvergoeding" },
];

export const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "In behandeling", color: "bg-yellow-100 text-yellow-800" },
  accepted: { label: "Geaccepteerd", color: "bg-green-100 text-green-800" },
  rejected: { label: "Afgewezen", color: "bg-red-100 text-red-800" },
  scheduled: { label: "Ingepland", color: "bg-brand-100 text-brand-700" },
  completed: { label: "Afgerond", color: "bg-gray-100 text-gray-800" },
  cancelled: { label: "Geannuleerd", color: "bg-red-100 text-red-800" },
};

export function getDayLabel(value: string) {
  return DAYS.find((d) => d.value === value)?.label ?? value;
}

export function getTradeLabel(value: string) {
  return TRADE_TYPES.find((t) => t.value === value)?.label ?? value;
}

export function getIntensityLabel(value: string) {
  return INTENSITY_LEVELS.find((i) => i.value === value)?.label ?? value;
}
