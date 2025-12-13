// screens/PassengerInfoScreen.js
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function PassengerInfoScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const { flight, selectedFare } = route.params || {};
  const [expandedPassenger, setExpandedPassenger] = useState(0);
  const [showDOBPicker, setShowDOBPicker] = useState(null);
  const [showExpiryPicker, setShowExpiryPicker] = useState(null);
  const COUNTRIES = ['Россия', 'Узбекистан'];
  const [countryDropdownIndex, setCountryDropdownIndex] = useState(null);
  const [passengers, setPassengers] = useState([
    {
      lastName: '',
      firstName: '',
      middleName: '',
      gender: '',
      citizenship: 'RU',
      dateOfBirth: '',
      passportNumber: '',
      countryOfIssue: 'RU',
      passportExpiryDate: '',
    }
  ]);
  const [contactInfo, setContactInfo] = useState({
    firstName: '',
    middleLastName: '',
    phone: '',
    email: '',
  });

  const togglePassenger = (index) => {
    setExpandedPassenger(expandedPassenger === index ? -1 : index);
  };

  const updatePassenger = (index, field, value) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);
  };

  const addPassenger = () => {
    setPassengers([
      ...passengers,
      {
        lastName: '',
        firstName: '',
        middleName: '',
        citizenship: 'RU',
        gender: '',
        dateOfBirth: '',
        passportNumber: '',
        countryOfIssue: 'RU',
        passportExpiryDate: '',
      },
    ]);
  };

  const toggleGender = (index) => {
    const genders = ['Мужской', 'Женский'];
    const currentIndex = genders.indexOf(passengers[index].gender);
    const nextGender = genders[(currentIndex + 1) % genders.length];
    updatePassenger(index, 'gender', nextGender);
  };

  const handleContinue = () => {
    // Если пользователь уже авторизован, переходим сразу на бронирование
    if (token) {
      navigation.navigate('Booking', {
        flight,
        selectedFare,
        passengers,
        contactInfo,
      });
    } else {
      // Если не авторизован, переходим на экран входа
      navigation.navigate('Login', {
        returnTo: 'Booking',
        bookingData: {
          flight,
          passengers,
          contactInfo,
        }
      });
    }
  };
  const formatDateISO = (d) => {
    if (!d) return '';
    return d.toISOString().split('T')[0];
    };

    const normalizeRu = (value) => {
      if (!value) return '';
      return value
        .replace(/[^А-Яа-яЁё\- ]/g, '')
        .toUpperCase();
    };

    const COUNTRY_MAP = {
      Россия: 'RU',
      Узбекистан: 'UZ',
    };

    const GENDER_MAP = {
      Мужской: 'M',
      Женский: 'F',
    };

    const COUNTRY_LABEL = {
      RU: 'Россия',
      UZ: 'Узбекистан',
    };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Данные пассажира</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Passengers */}
          {passengers.map((passenger, index) => (
            <View key={index} style={styles.passengerCard}>
              <TouchableOpacity
                style={styles.passengerHeader}
                onPress={() => togglePassenger(index)}
              >
                <Text style={styles.passengerTitle}>
                  Пассажир {index + 1} - Взрослый
                </Text>
                <MaterialIcons
                  name={
                    expandedPassenger === index
                      ? 'keyboard-arrow-up'
                      : 'keyboard-arrow-down'
                  }
                  size={24}
                  color="#0277bd"
                />
              </TouchableOpacity>

              {expandedPassenger === index && (
                <View style={styles.passengerForm}>
                  <Text style={styles.label}>Фамилия</Text>
<TextInput
  value={passenger.lastName}
  onChangeText={(t) =>
    updatePassenger(index, 'lastName', normalizeRu(t))
    }
  style={styles.input}
  placeholder="Фамилия"
/>

<Text style={styles.label}>Имя</Text>
<TextInput
  value={passenger.firstName}
  onChangeText={(t) =>
    updatePassenger(index, 'firstName', normalizeRu(t))
    }
  style={styles.input}
  placeholder="Имя"
/>

<Text style={styles.label}>Отчество (если есть)</Text>
<TextInput
  value={passenger.middleName}
  onChangeText={(t) =>
    updatePassenger(index, 'middleName', normalizeRu(t))
    }
  style={styles.input}
  placeholder="Отчество"
/>

                  <Text style={styles.label}>Дата рождения</Text>
                  <TouchableOpacity
  style={styles.input}
  onPress={() => setShowDOBPicker(index)}
>
  <Text style={styles.placeholderText}>
    {passenger.dateOfBirth || 'Выберите дату'}
  </Text>
  <MaterialIcons name="date-range" size={20} color="#666" />
</TouchableOpacity>

<Text style={styles.label}>Пол</Text>

<TouchableOpacity
  style={styles.input}
  onPress={() =>
    setCountryDropdownIndex(
      countryDropdownIndex === `gender-${index}` ? null : `gender-${index}`
    )
  }
>
  <Text style={styles.placeholderText}>
    {passenger.gender || 'Выберите пол'}
  </Text>
  <MaterialIcons name="keyboard-arrow-down" size={20} color="#666" />
</TouchableOpacity>

{countryDropdownIndex === `gender-${index}` && (
  <View style={styles.dropdown}>
    {['Мужской', 'Женский'].map((g) => (
      <TouchableOpacity
        key={g}
        style={styles.dropdownItem}
        onPress={() => {
          updatePassenger(index, 'gender', GENDER_MAP[g]);
          setCountryDropdownIndex(null);
        }}
      >
        <Text style={styles.dropdownText}>{g}</Text>
      </TouchableOpacity>
    ))}
  </View>
)}

                  <Text style={styles.label}>Гражданство</Text>

<TouchableOpacity
  style={styles.input}
  onPress={() =>
    setCountryDropdownIndex(
      countryDropdownIndex === `cit-${index}` ? null : `cit-${index}`
    )
  }
>
  <Text style={styles.placeholderText}>
  {COUNTRY_LABEL[passenger.citizenship] || 'Выберите страну'}
  </Text>
  <MaterialIcons name="keyboard-arrow-down" size={20} color="#666" />
</TouchableOpacity>

{countryDropdownIndex === `cit-${index}` && (
  <View style={styles.dropdown}>
    {['Россия', 'Узбекистан'].map((c) => (
      <TouchableOpacity
        key={c}
        style={styles.dropdownItem}
        onPress={() => {
          updatePassenger(index, 'citizenship', COUNTRY_MAP[c]);
          setCountryDropdownIndex(null);
        }}
      >
        <Text style={styles.dropdownText}>{c}</Text>
      </TouchableOpacity>
    ))}
  </View>
)}

<Text style={styles.label}>Серия и номер документа</Text>
<TextInput
  value={passenger.passportNumber}
  onChangeText={(t) =>
    updatePassenger(
      index,
      'passportNumber',
      t.replace(/\D/g, '').slice(0, 10)
    )
  }
  style={styles.input}
  placeholder="1234567890"
  keyboardType="numeric"
/>

                  <Text style={styles.label}>Страна выдачи</Text>
                  <TouchableOpacity
  style={styles.input}
  onPress={() =>
    setCountryDropdownIndex(
      countryDropdownIndex === index ? null : index
    )
  }
>
  <Text style={styles.placeholderText}>
    {passenger.countryOfIssue || 'Выберите страну'}
  </Text>
  <MaterialIcons name="keyboard-arrow-down" size={20} color="#666" />
</TouchableOpacity>

{countryDropdownIndex === index && (
  <View style={styles.dropdown}>
    {['Россия', 'Узбекистан'].map((c) => (
      <TouchableOpacity
        key={c}
        style={styles.dropdownItem}
        onPress={() => {
          updatePassenger(index, 'countryOfIssue', COUNTRY_MAP[c]);
          setCountryDropdownIndex(null);
        }}
      >
        <Text style={styles.dropdownText}>{c}</Text>
      </TouchableOpacity>
    ))}
  </View>
)}

                  <Text style={styles.label}>Срок действия паспорта</Text>
                  <TouchableOpacity
  style={styles.input}
  onPress={() => setShowExpiryPicker(index)}
>
  <Text style={styles.placeholderText}>
    {passenger.passportExpiryDate || 'Выберите дату'}
  </Text>
  <MaterialIcons name="date-range" size={20} color="#666" />
</TouchableOpacity>
                </View>
              )}
            </View>
          ))}

          {passengers.length < 5 && (
            <TouchableOpacity
              style={styles.addPassengerButton}
              onPress={addPassenger}
            >
              <MaterialIcons name="add" size={20} color="#0277bd" />
              <Text style={styles.addPassengerText}>Добавить пассажира</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <View style={styles.continueButtonContent}>
              <View>
                <Text style={styles.continueButtonLabel}>Итого:</Text>
                <Text style={styles.continueButtonAmount}>
                  {(flight?.price || 950).toLocaleString('ru-RU')} ₽
                </Text>
              </View>
              <Text style={styles.continueButtonText}>Продолжить</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
        {showDOBPicker !== null && (
  <DateTimePicker
    value={new Date()}
    mode="date"
    display="default"
    onChange={(e, selected) => {
      setShowDOBPicker(null);
      if (selected)
        updatePassenger(
          showDOBPicker,
          'dateOfBirth',
          formatDateISO(selected)
        );
    }}
  />
)}

{showExpiryPicker !== null && (
  <DateTimePicker
    value={new Date()}
    mode="date"
    display="default"
    onChange={(e, selected) => {
      setShowExpiryPicker(null);
      if (selected)
        updatePassenger(
          showExpiryPicker,
          'passportExpiryDate',
          formatDateISO(selected)
        );
    }}
  />
)}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
  },
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  passengerCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  passengerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  passengerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0277bd',
  },
  passengerForm: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  contactCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginTop: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginBottom: 16,
  },
  label: {
    color: '#9ea7b3',
    marginTop: 12,
    marginBottom: 6,
    fontSize: 13,
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    fontSize: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 15,
    color: '#999',
  },
  genderSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  genderText: {
    fontSize: 15,
    color: '#222',
  },
  addPassengerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: '#0277bd',
    borderStyle: 'dashed',
    borderRadius: 12,
    marginBottom: 12,
  },
  addPassengerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0277bd',
    marginLeft: 8,
  },
  continueButton: {
    backgroundColor: '#0277bd',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  continueButtonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  continueButtonLabel: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
  },
  continueButtonAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    marginTop: 4,
    overflow: 'hidden',
  },
  dropdownItem: {
    padding: 14,
  },
  dropdownText: {
    fontSize: 15,
    color: '#333',
  },
});

