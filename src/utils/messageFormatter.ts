export function formatSupportResistanceMessage(
  symbol: string,
  supportLevels: { price: number; volume: number }[],
  insignificantSupportLevels: { price: number; volume: number }[],
  resistanceLevels: { price: number; volume: number }[],
  insignificantResistanceLevels: { price: number; volume: number }[]
): string {
  const supportMsg =
    supportLevels.length > 0
      ? `*Significant support levels (high volume orders that may provide strong support):*
${supportLevels.map((level) => `• Price: *${level.price}*, Volume: *${level.volume.toFixed(2)}*`).join('\n')}
`
      : `*Significant support levels:* No significant support levels found.
`;

  const insignificantSupportMsg = `*Insignificant support levels (lower volume orders that may have weaker impact):*
${insignificantSupportLevels.map((level) => `• Price: _${level.price}_, Volume: _${level.volume.toFixed(2)}_`).join('\n')}
`;

  const resistanceMsg =
    resistanceLevels.length > 0
      ? `*Significant resistance levels (high volume orders that may provide strong resistance):*
${resistanceLevels.map((level) => `• Price: *${level.price}*, Volume: *${level.volume}*`).join('\n')}
`
      : `*Significant resistance levels:* No significant resistance levels found.
`;

  const insignificantResistanceMsg = `*Insignificant resistance levels (lower volume orders that may have weaker impact):*
${insignificantResistanceLevels.map((level) => `• Price: _${level.price}_, Volume: _${level.volume.toFixed(2)}_`).join('\n')}`;

  return `*Support levels for ${symbol.toUpperCase()}*:\n${supportMsg}${insignificantSupportMsg}\n*Resistance levels for ${symbol.toUpperCase()}*:\n${resistanceMsg}${insignificantResistanceMsg}`;
}
