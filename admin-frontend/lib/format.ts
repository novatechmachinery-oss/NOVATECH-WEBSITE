const machinePriceFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

const adminDateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

export function formatMachinePrice(value: number) {
  return `$${machinePriceFormatter.format(value)}`;
}

export function formatAdminDate(value: string | null, fallback: string) {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return adminDateFormatter.format(date);
}
