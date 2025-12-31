// stores/FlightViewStore.js
const flightViewMap = new Map();

export const saveFlightView = (bookingId, flightView) => {
  if (bookingId && flightView) {
    flightViewMap.set(bookingId, flightView);
  }
};

export const getFlightView = (bookingId) => {
  return flightViewMap.get(bookingId) || null;
};