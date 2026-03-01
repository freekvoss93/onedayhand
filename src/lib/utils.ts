export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("nl-NL", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateShort(date: Date | string): string {
  return new Date(date).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function parseDays(json: string): string[] {
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
}

export function computeMatchScore(params: {
  helperCity: string;
  listingCity: string;
  helperDays: string[];
  listingDays: string[];
  helperIntensity: string;
  listingIntensity: string;
}): number {
  let score = 0;
  if (params.helperCity.toLowerCase() === params.listingCity.toLowerCase()) score += 40;
  const dayOverlap = params.helperDays.filter((d) => params.listingDays.includes(d)).length;
  score += Math.min(dayOverlap * 20, 40);
  if (params.helperIntensity === params.listingIntensity) score += 20;
  else if (
    (params.helperIntensity === "high" && params.listingIntensity === "medium") ||
    (params.helperIntensity === "medium" && params.listingIntensity === "low")
  )
    score += 10;
  return score;
}
