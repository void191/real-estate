/**
 * Format price according to property location:
 * - Erbil / Middle East prime properties format in USD ($)
 * - UK / London properties format in GBP (£)
 */
export function formatPropertyPrice(amount: number, address?: string): string {
  const isErbil =
    address &&
    (address.toLowerCase().includes('erbil') ||
      address.toLowerCase().includes('iraq') ||
      address.toLowerCase().includes('gulan') ||
      address.toLowerCase().includes('ankawa') ||
      address.toLowerCase().includes('dream city') ||
      address.toLowerCase().includes('empire'));

  if (isErbil) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(amount);
}
