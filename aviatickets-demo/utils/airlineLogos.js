export const AIRLINE_LOGOS = {
  S7: require('../assets/airlines/S7.png'),
  SU: require('../assets/airlines/SU.png'),
  DP: require('../assets/airlines/DP.png'),
  U6: require('../assets/airlines/U6.png'),
};

export const getAirlineLogo = (code) => {
  if (!code) return require('../assets/airlines/default.png');
  return AIRLINE_LOGOS[code] || require('../assets/airlines/default.png');
};