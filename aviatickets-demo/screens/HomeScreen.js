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
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Dimensions } from "react-native";
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import CityPickerSheet from '../components/CityPickerSheet';
import { CITIES } from '../data/cities';
import DateWheelSheet from '../components/DateWheelSheet';
import PassengersSheet from '../components/PassengersSheet';

/**
 * Main flight search screen with form inputs and search functionality
 * Handles city selection, date picking, passenger counts, and search execution
 * TODO: Add search history and favorite routes functionality
 */
export default function HomeScreen() {
  const nav = useNavigation();
  const insets = useSafeAreaInsets();

  const [fromCode, setFromCode] = useState('SVO');
  const [toCode, setToCode] = useState('');
  const [fromName, setFromName] = useState('Москва (Шереметьево)');
  const [toName, setToName] = useState('Выберите направление');

  const [departureDate, setDepartureDate] = useState(new Date());
  const [returnDate, setReturnDate] = useState(null);
  const [pickerMode, setPickerMode] = useState('departure');

  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  
  const [passengersSheetVisible, setPassengersSheetVisible] = useState(false);
  const [cls, setCls] = useState('Эконом');
  const [showClass, setShowClass] = useState(false);
  const [isRoundTrip, setIsRoundTrip] = useState(false);

  const [cityTarget, setCityTarget] = useState(null);
  const [cityPickerVisible, setCityPickerVisible] = useState(false);
  const [showDateSheet, setShowDateSheet] = useState(false);

  const TARIFFS = [
    { value: 'Standard', label: 'Стандартный' },
    { value: 'Subsidized', label: 'Субсидированный' },
    { value: 'DfoRegion', label: 'Тариф ДФО' },
    { value: 'TrilateralAgreement', label: 'Трилатеральное соглашение' },
    { value: 'KaliningradRegion', label: 'Калининградский тариф' },
    { value: 'KaliningradRegionStudent', label: 'Калининградский — студенческий' },
  ];

  const [tariff, setTariff] = useState(TARIFFS[0].value);
  const [showTariff, setShowTariff] = useState(false);
  const [loading, setLoading] = useState(false);
  const bottomSheetRef = useRef(null);
  const [bottomSheetContent, setBottomSheetContent] = useState(null);

  const { user } = useAuth();
  const username = user?.firstName || 'Гость';
  const { width } = Dimensions.get("window");

  /**
   * Date formatting utilities
   */
  const formatDateForUI = (d) =>
    `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}.${d.getFullYear()}`;

  const formatDateForApi = (date) => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const openBottomSheet = (content) => {
    setBottomSheetContent(content);
    bottomSheetRef.current?.expand?.();
  };

  const closeBottomSheet = () => {
    bottomSheetRef.current?.close?.();
  };

  /**
   * Execute flight search with form validation and API call
   */
  const onSearch = async () => {
    if (!fromCode || !toCode) {
      alert('Пожалуйста, выберите города отправления и назначения');
      return;
    }

    setLoading(true);

    try {
      const body = {
        origin: fromCode,
        destination: toCode,
        departureDate: formatDateForApi(departureDate),
        returnDate: isRoundTrip ? formatDateForApi(returnDate) : null,
        passengers: {
          adults,
          children,
          infants,
        },
        serviceClass: cls === 'Эконом' ? 'Economic' : 'Business',
        tariff,
        tripType: isRoundTrip ? 'roundtrip' : 'oneway',
      };

      const response = await api('/flights/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      setLoading(false);

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

  /**
   * Reusable form field component
   */
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
              <Stop offset="1" stopColor="#1EA6FF" stopOpacity="1" />
            </LinearGradient>
            <LinearGradient id="lightGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.18" />
              <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
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
            d={`M0 60 Q ${width / 2} 160 ${width} 120 L${width} 0 L0 0 Z`}
            fill="url(#lightGrad)"
          />
          <Path
            d={`M0 60 Q ${width / 2} 160 ${width} 120 L${width} 0 L0 0 Z`}
            fill="url(#lightGrad)"
          />
        </Svg>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        onScrollBeginDrag={() => {
          setShowClass(false);
          setShowTariff(false);
        }}
      >
        <View
          style={[
            styles.header,
            { paddingTop: insets.top > 20 ? insets.top - 10 : 10 },
          ]}
        >
          <Text style={styles.headerTitle}>Найди свой рейс</Text>
        </View>

        <View style={styles.card}>
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

          <View style={{ position: 'relative', marginBottom: 18 }}>
            <Field
              label="Откуда"
              icon="airplane-takeoff"
              value={fromName}
              onPress={() => {
                setCityTarget('from');
                setCityPickerVisible(true);
              }}
            />

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
              onPress={() => {
                setCityTarget('to');
                setCityPickerVisible(true);
              }}
            />
          </View>

          <Field
            label="Дата вылета"
            icon="calendar"
            value={formatDateForUI(departureDate)}
            onPress={() => {
              setPickerMode('departure');
              setShowDateSheet(true);
            }}
          />

          {isRoundTrip && (
            <Field
              label="Дата обратного вылета"
              icon="calendar-range"
              value={returnDate ? formatDateForUI(returnDate) : 'Выберите дату'}
              onPress={() => {
                setPickerMode('return');
                setShowDateSheet(true);
              }}
            />
          )}

          <View style={{ flexDirection: 'row', gap: 14, marginBottom: 18 }}>
            <View style={{ flex: 1, position: 'relative' }}>
              <Text style={styles.fieldLabel}>Пассажиры</Text>
              <TouchableOpacity
                style={styles.fieldBox}
                onPress={() => {
                  setShowClass(false);
                  setPassengersSheetVisible(true);
                }}
              >
                <MaterialCommunityIcons
                  name="account-group"
                  size={22}
                  color="#0277bd"
                  style={{ marginRight: 10 }}
                />
                <Text style={styles.fieldValue}>
                  {adults + children + infants}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ flex: 1, position: 'relative' }}>
              <Text style={styles.fieldLabel}>Класс</Text>
              <TouchableOpacity
                style={styles.fieldBox}
                onPress={() => {
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

          <TouchableOpacity style={styles.searchBtn} onPress={onSearch}>
            <Text style={styles.searchTxt}>Поиск рейса</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {loading && <LoadingOverlay />}

      <CityPickerSheet
        visible={cityPickerVisible}
        cities={CITIES}
        onClose={() => setCityPickerVisible(false)}
        onSelect={(city) => {
          if (cityTarget === 'from') {
            setFromCode(city.code);
            setFromName(city.name);
          } else {
            setToCode(city.code);
            setToName(city.name);
          }
        }}
      />

      <PassengersSheet
        visible={passengersSheetVisible}
        adults={adults}
        children={children}
        infants={infants}
        onClose={() => setPassengersSheetVisible(false)}
        onChange={({ adults, children, infants }) => {
          setAdults(adults);
          setChildren(children);
          setInfants(infants);
        }}
      />

      <DateWheelSheet
        visible={showDateSheet}
        initialDate={
          pickerMode === 'departure'
            ? departureDate
            : returnDate || departureDate
        }
        onClose={() => setShowDateSheet(false)}
        onConfirm={(date) => {
          if (pickerMode === 'departure') {
            setDepartureDate(date);
            if (returnDate && date > returnDate) setReturnDate(null);
          } else {
            setReturnDate(date);
          }
        }}
      />
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