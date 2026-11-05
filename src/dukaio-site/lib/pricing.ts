/** Dukaio takes a flat commission on each sale. No subscription. */
export const COMMISSION_RATE = 0.1;

export function payout(price: number, sales = 1) {
  const gross = Math.max(0, price) * Math.max(0, sales);
  const fee = Math.round(gross * COMMISSION_RATE);
  return { gross, fee, net: gross - fee };
}

export const fcfa = (n: number) => `${String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} F`;
