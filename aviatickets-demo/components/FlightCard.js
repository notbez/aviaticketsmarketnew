// components/FlightCard.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

export default function FlightCard({ item, onBook }) {
  const firstSegment = item?.segments?.[0];
  const lastSegment = item?.segments?.[item.segments.length - 1];

  const firstFlight = firstSegment?.flights?.[0] || null;
  const lastFlight =
    lastSegment?.flights?.[lastSegment.flights.length - 1] || null;

  // форматируем время
  const formatTime = (iso) => {
    if (!iso) return '-';
    try {
      const d = new Date(iso);
      return d.toISOString().substring(11, 16); // HH:mm
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
        {/* Верхняя строка: авиакомпания + цена */}
        <View style={styles.headerRow}>
          <View style={styles.airlineRow}>
            <Image
              source={require('../assets/plane.png')}
              style={styles.logo}
            />
            <Text style={styles.airline}>{airline}</Text>
          </View>

          <View style={{ alignItems: 'flex-end' }}>
  <Text style={styles.price}>
    {item.price?.toLocaleString('ru-RU')} ₽
  </Text>

  {/* Показываем тарифы: например "3 тарифа" */}
  {item.fares && item.fares.length > 1 && (
    <Text style={styles.tariffCount}>
      {item.fares.length} тарифа
    </Text>
  )}
</View>
        </View>

        {/* FROM → TO */}
        <View style={styles.routeArcBlock}>
          <Text style={styles.code}>{item.from}</Text>

          <View style={styles.arcLine}>
            <View style={styles.dash} />
            <Image
              source={require('../assets/plane.png')}
              style={styles.plane}
            />
            <View style={styles.dash} />
          </View>

          <Text style={styles.code}>{item.to}</Text>
        </View>

        {/* Страны (убираем или оставляем как есть?) */}
        <View style={styles.countryRow}>
          <Text style={styles.country}>{firstSegment?.originCountry || ''}</Text>
          <Text style={styles.country}>{lastSegment?.destinationCountry || ''}</Text>
        </View>

        {/* Блок инфо №1 */}
        <View style={styles.infoRow}>
          <View>
            <Text style={styles.label}>Вылет</Text>
            <Text style={styles.value}>{departTime}</Text>
          </View>

          <View>
            <Text style={styles.label}>Рейс</Text>
            <Text style={styles.value}>{flightNumber}</Text>
          </View>
        </View>

        {/* Блок инфо №2 */}
        <View style={styles.infoRow}>
          <View>
            <Text style={styles.label}>Длительность</Text>
            <Text style={styles.value}>
              {item.duration || firstFlight?.duration || '—'}
            </Text>
          </View>

          <View>
            <Text style={styles.label}>Класс</Text>
            <Text style={styles.value}>{firstFlight?.serviceClass || '—'}</Text>
          </View>
        </View>

        {/* Доп. инфо */}
        {(stops > 0 || (availableSeats !== null && availableSeats <= 5)) && (
          <View style={styles.additionalInfo}>
            {stops > 0 && (
              <Text style={styles.warningText}>🔄 {stops} пересадки</Text>
            )}

            {availableSeats !== null && availableSeats <= 5 && (
              <Text style={styles.warningText}>
                ⚠️ Осталось мест: {availableSeats}
              </Text>
            )}
          </View>
        )}

        {/* Разделитель */}
        <View style={styles.dashedSeparator} />

        {/* Кнопка */}
        <TouchableOpacity style={styles.button} onPress={() => onBook(item)}>
          <Text style={styles.buttonText}>Забронировать</Text>
        </TouchableOpacity>
      </View>

      {/* Вырезы */}
      <View style={styles.cutLeft} />
      <View style={styles.cutRight} />
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: 28,
    position: 'relative',
  },

  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },

  cutLeft: {
    position: 'absolute',
    left: -12,
    top: '75%',
    width: 24,
    height: 24,
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
  },

  cutRight: {
    position: 'absolute',
    right: -12,
    top: '75%',
    width: 24,
    height: 24,
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
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
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 10,
  },

  airline: {
    fontSize: 18,
    fontWeight: '600',
  },

  price: {
    fontSize: 22,
    fontWeight: '800',
  },

  routeArcBlock: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  code: {
    fontSize: 20,
    fontWeight: '700',
    maxWidth: 80,
    textAlign: 'center',
  },

  arcLine: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  dash: {
    width: 40,
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#999',
  },

  plane: {
    width: 26,
    height: 26,
    marginHorizontal: 6,
    tintColor: '#29A9E0',
  },

  countryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },

  country: {
    color: '#7a7a7a',
    fontSize: 14,
    maxWidth: 90,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },

  label: {
    color: '#9ea7b3',
    fontSize: 14,
  },

  value: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 3,
  },

  additionalInfo: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },

  warningText: {
    fontSize: 12,
    color: '#ff6b35',
    fontWeight: '500',
  },

  dashedSeparator: {
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#ccc',
    marginTop: 25,
    marginBottom: 25,
  },

  button: {
    backgroundColor: '#29A9E0',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  tariffCount: {
    fontSize: 12,
    color: '#7a7a7a',
    marginTop: 2,
  },
});