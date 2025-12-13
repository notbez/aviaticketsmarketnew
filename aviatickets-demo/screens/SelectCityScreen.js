// screens/SelectCityScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Извлекаем города из code.json
const getAirportsFromCodeJson = () => {
  try {
    const codeData = require('../code.json');
    const airportCodes = new Set();
    
    codeData.Routes?.forEach(route => {
      route.Segments?.forEach(segment => {
        segment.Flights?.forEach(flight => {
          if (flight.OriginAirportCode) airportCodes.add(flight.OriginAirportCode);
          if (flight.DestinationAirportCode) airportCodes.add(flight.DestinationAirportCode);
        });
      });
    });
    
    const cityNames = {
      'SVO': 'Москва (Шереметьево)',
      'DME': 'Москва (Домодедово)', 
      'VKO': 'Москва (Внуково)',
      'TJM': 'Тюмень',
      'OVB': 'Новосибирск',
      'SVX': 'Екатеринбург (Кольцово)',
'LED': 'Санкт-Петербург (Пулково)',
'AER': 'Сочи (Адлер)',
'KZN': 'Казань',
'IKT': 'Иркутск',
'PEE': 'Пермь',
'GOJ': 'Нальчик',
'MCX': 'Махачкала',
'MRV': 'Минеральные Воды',
'AAQ': 'Анапа',
'ROS': 'Ростов-на-Дону (Платов)',
'CEK': 'Челябинск',
'BTK': 'Братск',
'GDX': 'Магадан',
'YKS': 'Якутск',
'PKC': 'Петропавловск-Камчатский (Елизово)',
'UFA': 'Уфа',
'ASB': 'Астрахань',
'NOJ': 'Ноябрьск',
'OMS': 'Омск',
'TOF': 'Томск',
'PES': 'Петрозаводск',
'SKS': 'Сургут',
'GRV': 'Грозный',
'VOG': 'Волгоград',
'RTW': 'Саратов',
'PEZ': 'Пенза',
'PKV': 'Псков',
'KJA': 'Красноярск',
'REN': 'Оренбург'
    };
    
    return Array.from(airportCodes).map(code => ({
      code,
      city: cityNames[code] || code
    }));
  } catch (error) {
    console.error('Error loading airports from code.json:', error);
    return [];
  }
};

const AIRPORTS_FROM_CODE = getAirportsFromCodeJson();

export default function SelectCityScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation();
  const route = useRoute();

  const target = route.params?.target || 'from';
  const [query, setQuery] = useState('');
  const [list, setList] = useState(AIRPORTS_FROM_CODE);

  useEffect(() => {
    setList(
      AIRPORTS_FROM_CODE.filter(a => {
        if (!query) return true;
        const q = query.toLowerCase();
        return (
          a.code.toLowerCase().startsWith(q) ||
          a.city.toLowerCase().includes(q)
        );
      })
    );
  }, [query]);

  const pick = (airport) => {
    if (route.params?.onSelect) route.params.onSelect(airport.code, airport.city);
    nav.goBack();
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 10 }]}>
      <Text style={styles.title}>
        Выберите город ({target === 'from' ? 'Откуда' : 'Куда'})
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Поиск города или код"
        value={query}
        onChangeText={setQuery}
      />

      <FlatList
        data={list}
        keyExtractor={(i) => i.code}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => pick(item)}>
            <Text style={styles.code}>{item.code}</Text>
            <Text style={styles.city}>{item.city}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,   // ← ЭТО ДОБАВЛЕНО (боковые отступы)
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },

  input: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },

  item: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
  },

  code: {
    width: 64,
    fontWeight: '700',
    fontSize: 16,
  },

  city: {
    color: '#555',
    fontSize: 16,
  },
});