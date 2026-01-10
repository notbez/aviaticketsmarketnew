// components/FlightCard.js
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { getAirlineLogo } from '../utils/airlineLogos';

export default function FlightCard({ item, onBook }) {
  const outbound = item?.outbound;
  const inbound = item?.inbound;

  // ===== GUARD =====
  if (!outbound || !Array.isArray(outbound.segments)) {
    return null;
  }

  // ===== OUTBOUND SEGMENTS =====
  const outboundSegments = outbound.segments;

  const firstOutboundSegment = outboundSegments[0];
  const lastOutboundSegment =
    outboundSegments[outboundSegments.length - 1];

  const firstOutboundFlight =
    firstOutboundSegment?.flights?.[0] || null;

  const lastOutboundFlight =
    lastOutboundSegment?.flights?.[
      lastOutboundSegment.flights.length - 1
    ] || null;

  // ===== FORMATTERS =====
  const formatTime = (iso) => {
    if (!iso) return '-';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '-';
    return d.toISOString().substring(11, 16);
  };

  const calcDuration = (start, end) => {
    if (!start || !end) return '—';
    const diff = new Date(end) - new Date(start);
    if (isNaN(diff)) return '—';

    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return `${h}ч ${m}м`;
  };

  // ===== DATA =====
  const airline =
    firstOutboundFlight?.marketingAirline || 'Авиакомпания';

  const flightNumber =
    firstOutboundFlight?.flightNumber || '—';

  const stops = Math.max(0, outboundSegments.length - 1);

  const availableSeats =
    firstOutboundFlight?.availableSeats ??
    lastOutboundFlight?.availableSeats ??
    null;

  // ===== RENDER =====
  return (
    <View style={styles.cardWrapper}>
      <View style={styles.card}>

        {/* HEADER */}
        <View style={styles.headerRow}>
          <View style={styles.airlineRow}>
            <Image
              source={getAirlineLogo(firstOutboundFlight?.airlineCode)}
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
          </View>
        </View>

        {/* OUTBOUND */}
        <View style={styles.routeRow}>
          <View>
            <Text style={styles.time}>
              {formatTime(outbound.departTime)}
            </Text>
            <Text style={styles.code}>{outbound.from}</Text>
          </View>

          <View style={styles.routeCenter}>
            <Text style={styles.duration}>
              {calcDuration(
                outbound.departTime,
                outbound.arrivalTime
              )}
            </Text>
            <View style={styles.line} />
            <Text style={styles.stops}>
              {stops === 0
                ? 'Без пересадок'
                : `${stops} пересадки`}
            </Text>
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.time}>
              {formatTime(outbound.arrivalTime)}
            </Text>
            <Text style={styles.code}>{outbound.to}</Text>
          </View>
        </View>

        {/* INBOUND */}
        {inbound && Array.isArray(inbound.segments) && (
          <View style={[styles.routeRow, { marginTop: 14 }]}>
            <View>
              <Text style={styles.time}>
                {formatTime(inbound.departTime)}
              </Text>
              <Text style={styles.code}>{inbound.from}</Text>
            </View>

            <View style={styles.routeCenter}>
              <Text style={styles.duration}>
                {calcDuration(
                  inbound.departTime,
                  inbound.arrivalTime
                )}
              </Text>
              <View style={styles.line} />
              <Text style={styles.stops}>
                {Math.max(0, inbound.segments.length - 1) === 0
                  ? 'Без пересадок'
                  : `${inbound.segments.length - 1} пересадки`}
              </Text>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.time}>
                {formatTime(inbound.arrivalTime)}
              </Text>
              <Text style={styles.code}>{inbound.to}</Text>
            </View>
          </View>
        )}

        {/* FOOTER */}
        <View style={styles.footerRow}>
          {availableSeats !== null && availableSeats <= 5 && (
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