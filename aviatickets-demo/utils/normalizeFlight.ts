export function normalizeFlight(raw) {
  if (!raw) return null;

  return {
    ...raw,

    // 🔥 приводим к единому виду
    departureAt:
      raw.departureAt ||
      raw.departTime ||
      raw.departureDateTime ||
      null,

    arrivalAt:
      raw.arrivalAt ||
      raw.arrivalTime ||
      raw.arrivalDateTime ||
      null,

    price: Number(raw.price) || 0,
  };

  console.log(
  '[normalizeFlight]',
  raw.departureAt,
  raw.arrivalAt
);
}