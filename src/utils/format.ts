export function formatInr(amount: number): string {
  return '₹' + Math.round(amount).toLocaleString('en-IN');
}

export function formatInrFull(amount: number): string {
  return amount.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });
}

export function formatNumber(n: number): string {
  return n.toLocaleString('en-IN');
}

export function formatPct(n: number, decimals = 2): string {
  return `${n.toFixed(decimals)}%`;
}
