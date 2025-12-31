// utils/normalizeFlightView.js
export const normalizeFlightView = (fv) => {
  if (!fv) return {};

  // from / to могут быть строками ИЛИ объектами
  const from =
    typeof fv.from === 'string'
      ? fv.from
      : fv.from?.code || fv.origin || fv.cityFrom;

  const to =
    typeof fv.to === 'string'
      ? fv.to
      : fv.to?.code || fv.destination || fv.cityTo;

  // дата + время могут быть раздельно
  let departureAt = fv.departureAt || fv.departureTime;
  let arrivalAt = fv.arrivalAt || fv.arrivalTime;

  // если время отдельно от даты
  if (!departureAt && fv.departureDate && fv.departureTime) {
    departureAt = `${fv.departureDate}T${fv.departureTime}`;
  }

  if (!arrivalAt && fv.departureDate && fv.arrivalTime) {
    arrivalAt = `${fv.departureDate}T${fv.arrivalTime}`;
  }

  return {
    from: from || null,
    to: to || null,
    departureAt: departureAt || null,
    arrivalAt: arrivalAt || null,
    cabinClass: fv.cabinClass || fv.class || 'Economy',
    price: fv.price,
  };
};