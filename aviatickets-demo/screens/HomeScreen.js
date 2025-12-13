// screens/HomeScreen.js
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import LoadingOverlay from '../components/LoadingOverlay';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Dimensions } from "react-native";
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api'; // <- используем твой api wrapper

export default function HomeScreen() {
  const nav = useNavigation();
  const insets = useSafeAreaInsets();

  const [fromCode, setFromCode] = useState('SVO');
  const [toCode, setToCode] = useState('');
  const [fromName, setFromName] = useState('Москва (Шереметьево)');
  const [toName, setToName] = useState('Выберите направление');

  const [departureDate, setDepartureDate] = useState(new Date());
  const [returnDate, setReturnDate] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('departure'); // 'departure' | 'return'

  const [passengers, setPassengers] = useState('1');
  const [showPassengers, setShowPassengers] = useState(false);

  const [cls, setCls] = useState('Эконом');
  const [showClass, setShowClass] = useState(false);
  const [isRoundTrip, setIsRoundTrip] = useState(false);

  // тарифы — значения Onelya (ключ) -> русская метка (value)
  const TARIFFS = [
    { value: 'Standard', label: 'Стандартный' },
    { value: 'Subsidized', label: 'Субсидированный' },
    { value: 'DfoRegion', label: 'Тариф ДФО' },
    { value: 'TrilateralAgreement', label: 'Трилатеральное соглашение' },
    { value: 'KaliningradRegion', label: 'Калининградский тариф' },
    { value: 'KaliningradRegionStudent', label: 'Калининградский — студенческий' },
    // В документации может быть больше типов — если появятся, добавь их сюда.
  ];

  const [tariff, setTariff] = useState(TARIFFS[0].value);
  const [showTariff, setShowTariff] = useState(false);

  const [loading, setLoading] = useState(false);
  const bottomSheetRef = useRef(null);
  const [bottomSheetContent, setBottomSheetContent] = useState(null);

  const { user } = useAuth();
  const username = user?.firstName || 'Гость';

  const { width } = Dimensions.get("window");

  const formatDateForUI = (d) =>
    `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}.${d.getFullYear()}`;

  const openBottomSheet = (content) => {
    setBottomSheetContent(content);
    bottomSheetRef.current?.expand?.();
  };

  const closeBottomSheet = () => {
    bottomSheetRef.current?.close?.();
  };

  const onSearch = async () => {
    if (!fromCode || !toCode) {
      alert('Пожалуйста, выберите города отправления и назначения');
      return;
    }

    setLoading(true);

    try {
      // Формируем тело запроса строго под документацию Onelya.
      // Backend ожидает поля в своём формате; мы передаём понятные значения,
      // бэкенд затем должен построить RoutePricingRequest.
      const body = {
        origin: fromCode,
        destination: toCode,
        // отправляем ISO — backend должен привести в требуемый формат с московским временем
        departureDate: departureDate ? departureDate.toISOString() : null,
        returnDate: isRoundTrip && returnDate ? returnDate.toISOString() : null,
        passengers: Number(passengers) || 1,
        // ServiceClass: 'Economic' или 'Business' (строго как в документации)
        serviceClass: cls === 'Эконом' ? 'Economic' : 'Business',
        // Tariff — строго значение из документации (мы его берем из TARIFFS)
        tariff,
        tripType: isRoundTrip ? 'roundtrip' : 'oneway',
      };

      const response = await api('/flights/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      setLoading(false);

      // ожидаем response.results (массив карточек), response.Routes (сырой ответ Onelya)
      nav.navigate('Results', {
        from: fromCode,
        to: toCode,
        fromName,
        toName,
        results: response?.results || [],
        raw: response?.Routes || [],
      });
    } catch (err) {
      console.error('Search error', err);
      alert('Ошибка поиска рейсов: ' + (err?.message || err));
      setLoading(false);
    }
  };

  const Field = ({ label, icon, value, onPress }) => (
    <View style={{ marginBottom: 18 }}>
      <Text style={styles.fieldLabel}>{label}</Text>

      <TouchableOpacity style={styles.fieldBox} onPress={onPress}>
        <MaterialCommunityIcons
          name={icon}
          size={22}
          color="#0277bd"
          style={{ marginRight: 10 }}
        />
        <Text style={styles.fieldValue}>{value}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBackground}>
        <Svg width={width} height={300} style={{ position: 'absolute', top: 0 }}>
          <Defs>
            <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#1EA6FF" stopOpacity="1" />
              <Stop offset="1" stopColor="#1EA6FF" stopOpacity="0.65" />
            </LinearGradient>

            <LinearGradient id="lightGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#5FCFFF" stopOpacity="0.3" />
              <Stop offset="1" stopColor="#1EA6FF" stopOpacity="0" />
            </LinearGradient>
          </Defs>

          <Path
            d={`
              M0 0
              L0 200
              Q ${width * 0.5} 300 ${width} 200
              L${width} 0 Z
            `}
            fill="url(#grad)"
          />

          <Path
            d={`
              M0 60
              Q ${width * 0.5} 140 ${width} 100
              L${width} 0 L0 0 Z
            `}
            fill="url(#lightGrad)"
            opacity="0.6"
          />

          <Path
            d={`
              M0 110
              Q ${width * 0.5} 200 ${width} 150
              L${width} 0 L0 0 Z
            `}
            fill="url(#lightGrad)"
            opacity="0.4"
          />
        </Svg>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        onScrollBeginDrag={() => {
          setShowPassengers(false);
          setShowClass(false);
          setShowTariff(false);
        }}
      >
        {/* HEADER */}
        <View
          style={[
            styles.header,
            { paddingTop: insets.top > 20 ? insets.top - 10 : 10 },
          ]}
        >
          <Text style={styles.welcomeText}>Привет, {username}</Text>
          <Text style={styles.headerTitle}>Найди свой рейс</Text>
        </View>

        {/* CARD */}
        <View style={styles.card}>
          {/* TABS */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, !isRoundTrip && styles.tabActive]}
              onPress={() => setIsRoundTrip(false)}
            >
              <Text style={[styles.tabText, !isRoundTrip && styles.tabTextActive]}>
                В одну сторону
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, isRoundTrip && styles.tabActive]}
              onPress={() => setIsRoundTrip(true)}
            >
              <Text style={[styles.tabText, isRoundTrip && styles.tabTextActive]}>
                Туда-обратно
              </Text>
            </TouchableOpacity>
          </View>

          {/* FIELDS */}
          <View style={{ position: 'relative', marginBottom: 18 }}>
            <Field
              label="Откуда"
              icon="airplane-takeoff"
              value={fromName}
              onPress={() =>
                nav.navigate('SelectCity', {
                  target: 'from',
                  onSelect: (code, name) => {
                    setFromCode(code);
                    setFromName(name);
                  },
                })
              }
            />

            {/* SWAP BUTTON */}
            <View
              style={{
                position: 'absolute',
                right: width * 0.05,
                top: '50%',
                transform: [{ translateY: -31 }],
                zIndex: 10,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  const oldCode = fromCode;
                  const oldName = fromName;
                  setFromCode(toCode);
                  setFromName(toName);
                  setToCode(oldCode);
                  setToName(oldName);
                }}
                style={{
                  width: 62,
                  height: 62,
                  borderRadius: 31,
                  backgroundColor: '#0277bd',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MaterialCommunityIcons name="swap-vertical" size={28} color="#fff" />
              </TouchableOpacity>
            </View>

            <Field
              label="Куда"
              icon="airplane-landing"
              value={toName}
              onPress={() =>
                nav.navigate('SelectCity', {
                  target: 'to',
                  onSelect: (code, name) => {
                    setToCode(code);
                    setToName(name);
                  },
                })
              }
            />
          </View>

          <Field
            label="Дата вылета"
            icon="calendar"
            value={formatDateForUI(departureDate)}
            onPress={() => {
              setPickerMode('departure');
              setShowPicker(true);
            }}
          />

          {/* Return date (если roundtrip) */}
          {isRoundTrip && (
            <Field
              label="Дата обратного вылета"
              icon="calendar-range"
              value={returnDate ? formatDateForUI(returnDate) : 'Выберите дату'}
              onPress={() => {
                setPickerMode('return');
                setShowPicker(true);
              }}
            />
          )}

          {/* PASSENGERS + CLASS + TARIFF */}
          <View style={{ flexDirection: 'row', gap: 14, marginBottom: 18 }}>
            <View style={{ flex: 1, position: 'relative' }}>
              <Text style={styles.fieldLabel}>Пассажиры</Text>

              <TouchableOpacity
                style={styles.fieldBox}
                onPress={() => {
                  setShowClass(false);
                  setShowPassengers(!showPassengers);
                }}
              >
                <MaterialCommunityIcons
                  name="account-group"
                  size={22}
                  color="#0277bd"
                  style={{ marginRight: 10 }}
                />
                <Text style={styles.fieldValue}>{passengers}</Text>
              </TouchableOpacity>

              {showPassengers && (
                <View style={styles.dropdown}>
                  {[1, 2, 3, 4].map((n) => (
                    <TouchableOpacity
                      key={n}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setPassengers(n.toString());
                        setShowPassengers(false);
                      }}
                    >
                      <Text style={styles.dropdownText}>{n}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={{ flex: 1, position: 'relative' }}>
              <Text style={styles.fieldLabel}>Класс</Text>

              <TouchableOpacity
                style={styles.fieldBox}
                onPress={() => {
                  setShowPassengers(false);
                  setShowClass(!showClass);
                }}
              >
                <MaterialCommunityIcons
                  name="seat-recline-normal"
                  size={22}
                  color="#0277bd"
                  style={{ marginRight: 10 }}
                />
                <Text style={styles.fieldValue}>{cls}</Text>
              </TouchableOpacity>

              {showClass && (
                <View style={styles.dropdown}>
                  {['Эконом', 'Бизнес'].map((c) => (
                    <TouchableOpacity
                      key={c}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setCls(c);
                        setShowClass(false);
                      }}
                    >
                      <Text style={styles.dropdownText}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* ТАРИФ */}
          <View style={{ marginBottom: 8 }}>
            <Text style={styles.fieldLabel}>Тариф</Text>
            <TouchableOpacity
              style={styles.fieldBox}
              onPress={() => setShowTariff(!showTariff)}
            >
              <MaterialCommunityIcons
                name="ticket-confirmation"
                size={22}
                color="#0277bd"
                style={{ marginRight: 10 }}
              />
              <Text style={styles.fieldValue}>
                {TARIFFS.find(t => t.value === tariff)?.label || tariff}
              </Text>
            </TouchableOpacity>

            {showTariff && (
              <View style={styles.dropdown}>
                {TARIFFS.map((t) => (
                  <TouchableOpacity
                    key={t.value}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setTariff(t.value);
                      setShowTariff(false);
                    }}
                  >
                    <Text style={styles.dropdownText}>{t.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* SEARCH BUTTON */}
          <TouchableOpacity style={styles.searchBtn} onPress={onSearch}>
            <Text style={styles.searchTxt}>Поиск рейса</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* DATE PICKER */}
      {showPicker && (
        <DateTimePicker
          value={pickerMode === 'departure' ? departureDate : (returnDate || new Date())}
          mode="date"
          display="default"
          onChange={(e, selected) => {
            setShowPicker(false);
            if (!selected) return;
            if (pickerMode === 'departure') {
              setDepartureDate(selected);
              // если был ранее returnDate раньше чем новая departureDate — сбросим returnDate
              if (returnDate && selected > returnDate) setReturnDate(null);
            } else {
              setReturnDate(selected);
            }
          }}
        />
      )}

      {loading && <LoadingOverlay />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  headerTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#fff',
  },

  card: {
    backgroundColor: '#fff',
    width: '92%',
    alignSelf: 'center',
    marginTop: -10,
    borderRadius: 26,
    padding: 20,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },

  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },

  tabActive: {
    borderBottomColor: '#0277bd',
  },

  tabText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },

  tabTextActive: {
    color: '#0277bd',
    fontWeight: '700',
  },

  fieldLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    marginLeft: 4,
  },

  fieldBox: {
    backgroundColor: '#F3F3F3',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  fieldValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },

  dropdown: {
    position: 'absolute',
    top: 58,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 10,
  },

  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },

  dropdownText: {
    fontSize: 16,
    color: '#333',
  },

  searchBtn: {
    marginTop: 10,
    backgroundColor: '#0277bd',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },

  searchTxt: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  topBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 260,
  },
  welcomeText: {
    fontSize: 16,
    color: '#E6F7FF',
    marginBottom: 4,
    fontWeight: '500',
    textAlign: 'center',
  },

  headerTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
  },
});