export function formatDate(iso: string | null): string {
  if (!iso) return "-";
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function daysBetween(from: Date, to: Date): number {
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / MS_PER_DAY);
}

export type RegistrationStatus = {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
};

export function getRegistrationStatus(
  start: string | null,
  end: string | null,
): RegistrationStatus | null {
  if (!start || !end) return null;

  const today = new Date();
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (daysBetween(today, startDate) > 0) {
    return { label: "모집예정", variant: "outline" };
  }

  const daysLeft = daysBetween(today, endDate);
  if (daysLeft >= 0) {
    return {
      label: `모집중 D-${daysLeft}`,
      variant: daysLeft <= 3 ? "destructive" : "default",
    };
  }

  return { label: "모집마감", variant: "secondary" };
}

export function getDurationWeeks(
  start: string | null,
  end: string | null,
): number | null {
  if (!start || !end) return null;
  const days = daysBetween(new Date(start), new Date(end));
  if (days < 0) return null;
  return Math.max(1, Math.ceil((days + 1) / 7));
}
