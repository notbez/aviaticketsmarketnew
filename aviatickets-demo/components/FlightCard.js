// components/FlightCard.js
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';

export default function FlightCard({ item, onBook }) {
  const firstSegment = item?.segments?.[0];
  const lastSegment = item?.segments?.[item.segments.length - 1];

  const firstFlight = firstSegment?.flights?.[0] || null;
  const lastFlight =
    lastSegment?.flights?.[lastSegment.flights.length - 1] || null;

  const formatTime = (iso) => {
    if (!iso) return '-';
    try {
      const d = new Date(iso);
      return d.toISOString().substring(11, 16);
    } catch {
      return iso;
    }
  };

  const airline = firstFlight?.marketingAirline || 'Авиакомпания';
  const flightNumber = firstFlight?.flightNumber || '—';

  const departTime = formatTime(item.departTime);
  const arrivalTime = formatTime(item.arrivalTime);

  const stops = item.stopsCount || 0;
  const availableSeats =
    firstFlight?.availableSeats ?? lastFlight?.availableSeats ?? null;

  return (
    <View style={styles.cardWrapper}>
      <View style={styles.card}>

        {/* ===== HEADER ===== */}
        <View style={styles.headerRow}>
          <View style={styles.airlineRow}>
            <Image
              source={require('../assets/plane.png')}
              style={styles.logo}
            />
            <View>
              <Text style={styles.airline}>{airline}</Text>
              <Text style={styles.flightNumber}>
                Рейс {flightNumber}
              </Text>
            </View>
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.price}>
              {item.price?.toLocaleString('ru-RU')} ₽
            </Text>

            {item.fares && item.fares.length > 1 && (
              <Text style={styles.tariffCount}>
                {item.fares.length} тарифа
              </Text>
            )}
          </View>
        </View>

        {/* ===== ROUTE ===== */}
        <View style={styles.routeRow}>
          <View>
            <Text style={styles.time}>{departTime}</Text>
            <Text style={styles.code}>{item.from}</Text>
          </View>

          <View style={styles.routeCenter}>
            <Text style={styles.duration}>
              {item.duration || firstFlight?.duration || '—'}
            </Text>
            <View style={styles.line} />
            <Text style={styles.stops}>
              {stops === 0 ? 'Без пересадок' : `${stops} пересадки`}
            </Text>
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.time}>{arrivalTime}</Text>
            <Text style={styles.code}>{item.to}</Text>
          </View>
        </View>

        {/* ===== TEAR LINE ===== */}
        <View style={styles.tearRow}>
          <View style={styles.cutLeft} />
          <View style={styles.dashedLine} />
          <View style={styles.cutRight} />
        </View>

        {/* ===== FOOTER ===== */}
        <View style={styles.footerRow}>
          {(availableSeats !== null && availableSeats <= 5) && (
            <Text style={styles.warningText}>
              Осталось мест: {availableSeats}
            </Text>
          )}

          <TouchableOpacity
            style={styles.bookButton}
            onPress={() => onBook(item)}
          >
            <Text style={styles.bookButtonText}>
    Забронировать
  </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: 28,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  airlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },

  airline: {
    fontSize: 16,
    fontWeight: '700',
  },

  flightNumber: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },

  price: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0277bd',
  },

  tariffCount: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },

  routeRow: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  time: {
    fontSize: 18,
    fontWeight: '700',
  },

  code: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },

  routeCenter: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 12,
  },

  duration: {
    fontSize: 12,
    color: '#777',
    marginBottom: 6,
  },

  line: {
    height: 1,
    width: '100%',
    backgroundColor: '#ccc',
  },

  stops: {
    fontSize: 12,
    color: '#777',
    marginTop: 6,
  },

  tearRow: {
    marginVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },

  cutLeft: {
    width: 24,
    height: 24,
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    marginLeft: -30,
  },

  cutRight: {
    width: 24,
    height: 24,
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    marginRight: -30,
  },

  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  warningText: {
    fontSize: 12,
    color: '#ff6b35',
    fontWeight: '600',
  },

  button: {
    backgroundColor: '#29A9E0',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },

  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },

  bookButton: {
  marginTop: 16,
  width: '100%',
  backgroundColor: '#0277bd',
  paddingVertical: 14,
  borderRadius: 14,
  alignItems: 'center',
},

bookButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '700',
},

dashedLine: {
  flex: 1,
  borderBottomWidth: 1,
  borderColor: '#ccc',
  borderStyle: 'dashed',
}
});