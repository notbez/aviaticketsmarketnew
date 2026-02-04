import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Animated,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../contexts/AuthContext';

const COUNTRIES = [
  { label: 'Россия', value: 'RU' },
  { label: 'Узбекистан', value: 'UZ' },
];

const GENDERS = [
  { label: 'Мужской', value: 'M' },
  { label: 'Женский', value: 'F' },
];

const DOCUMENT_TYPES = {
  RU_PASSPORT: 'Паспорт РФ',
  INTERNATIONAL_PASSPORT: 'Загранпаспорт',
  BIRTH_CERT: 'Свидетельство о рождении',
};

const RUSSIAN_AIRPORTS = ['SVO', 'DME', 'VKO', 'LED', 'AER', 'KZN', 'SVX'];

/**
 * Format date to ISO string (YYYY-MM-DD)
 */
const formatISO = (d) => d.toISOString().split('T')[0];

/**
 * Format ISO date to human readable format (DD.MM.YYYY)
 */
const formatHuman = (iso) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
};

/**
 * Capitalize first letter of string
 */
const capitalizeFirst = (v = '') => {
  if (!v) return v;
  return v.charAt(0).toUpperCase() + v.slice(1);
};

/**
 * Normalize date value to ISO format
 */
const normalizeISODate = (value) => {
  if (!value) return '';

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const d = new Date(value);
  if (!isNaN(d)) {
    return d.toISOString().split('T')[0];
  }

  return '';
};

/**
 * Get available document types based on age and flight type
 */
const getDocumentOptions = (birthDate, isDomestic) => {
  const age = birthDate
    ? Math.floor(
        (Date.now() - new Date(birthDate)) / (365.25 * 24 * 3600 * 1000)
      )
    : 99;

  if (!isDomestic) {
    return [
      { label: DOCUMENT_TYPES.INTERNATIONAL_PASSPORT, value: 'INTERNATIONAL_PASSPORT' },
    ];
  }

  if (age < 14) {
    return [
      { label: DOCUMENT_TYPES.BIRTH_CERT, value: 'BIRTH_CERT' },
      { label: DOCUMENT_TYPES.INTERNATIONAL_PASSPORT, value: 'INTERNATIONAL_PASSPORT' },
    ];
  }

  return [
    { label: DOCUMENT_TYPES.RU_PASSPORT, value: 'RU_PASSPORT' },
    { label: DOCUMENT_TYPES.INTERNATIONAL_PASSPORT, value: 'INTERNATIONAL_PASSPORT' },
  ];
};

/**
 * Passenger information collection screen
 * Handles multiple passengers with document validation
 * TODO: Add passport scanning functionality
 * TODO: Implement passenger data persistence
 */
export default function PassengerInfoScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { token, user } = useAuth();
  const { flight, flightView } = route.params || {};

  const isDomestic =
    RUSSIAN_AIRPORTS.includes(flightView?.from) &&
    RUSSIAN_AIRPORTS.includes(flightView?.to);

  const [expanded, setExpanded] = useState(0);
  const [picker, setPicker] = useState(null);
  const [dropdown, setDropdown] = useState(null);
  const [passengers, setPassengers] = useState([
    {
      lastName: '',
      firstName: '',
      middleName: '',
      gender: '',
      citizenship: '',
      birthDate: '',
      documentType: '',
      document: '',
      passportExpiryDate: '',
    },
  ]);

  /**
   * Auto-fill first passenger data from user profile
   */
  useEffect(() => {
    if (!user) return;

    const passport =
      user.passport ||
      (user.passportNumber
        ? {
            passportNumber: user.passportNumber,
            country: user.passportCountry,
            expiryDate: user.passportExpiryDate,
          }
        : null);

    setPassengers((prev) => {
      const p0 = prev[0];
      const next = { ...p0 };

      if (!p0.lastName || !p0.firstName) {
        const parts = (user.fullName || '')
          .trim()
          .split(/\s+/)
          .filter(Boolean);

        next.lastName = p0.lastName || parts[0] || '';
        next.firstName = p0.firstName || parts[1] || '';
        next.middleName = p0.middleName || parts.slice(2).join(' ') || '';
      }

      if (!p0.citizenship) {
        next.citizenship = passport?.country || 'RU';
      }

      if (!p0.document && passport?.passportNumber) {
        next.document = passport.passportNumber;
      }

      if (!p0.passportExpiryDate && passport?.expiryDate) {
        next.passportExpiryDate = normalizeISODate(passport.expiryDate);
      }

      return [next, ...prev.slice(1)];
    });
  }, [user]);

  /**
   * Update specific passenger field
   */
  const updatePassenger = useCallback((i, field, value) => {
    setPassengers((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  }, []);

  /**
   * Add new passenger to the list
   */
  const addPassenger = () => {
    setPassengers((p) => [
      ...p,
      {
        lastName: '',
        firstName: '',
        middleName: '',
        gender: '',
        citizenship: '',
        birthDate: '',
        documentType: '',
        document: '',
        passportExpiryDate: '',
      },
    ]);
    setExpanded(passengers.length);
  };

  /**
   * Validate passenger data and navigate to booking
   */
  const handleContinue = () => {
    try {
      const preparedPassengers = passengers.map((p, index) => {
        if (!p.documentType) {
          throw new Error('Выберите тип документа');
        }

        if (!p.lastName.trim() || !p.firstName.trim()) {
          throw new Error(`Пассажир ${index + 1}: укажите имя и фамилию`);
        }

        if (
          !p.lastName ||
          !p.firstName ||
          !p.gender ||
          !p.citizenship ||
          !p.birthDate ||
          !p.document ||
          (p.documentType !== 'BIRTH_CERT' && !p.passportExpiryDate)
        ) {
          throw new Error(`Пассажир ${index + 1}: заполните все поля`);
        }

        if (p.documentType === 'INTERNATIONAL_PASSPORT') {
          if (!/^\d{9}$/.test(p.document)) {
            throw new Error('Загранпаспорт должен содержать 9 цифр');
          }
        }

        if (p.documentType === 'RU_PASSPORT') {
          if (!/^\d{10}$/.test(p.document)) {
            throw new Error('Паспорт РФ должен содержать 10 цифр');
          }
        }

        return {
          lastName: p.lastName.trim(),
          firstName: p.firstName.trim(),
          middleName: p.middleName?.trim() || null,
          gender: p.gender,
          citizenship: p.citizenship,
          dateOfBirth: p.birthDate,
          passportNumber: p.document,
          passportExpiryDate: p.passportExpiryDate,
          documentType: p.documentType,
        };
      });

      const contactInfo = {
        firstName: preparedPassengers[0].firstName,
        middleLastName: preparedPassengers[0].lastName,
        phone: '',
        email: '',
      };

      navigation.navigate('Booking', {
        flight: {
          ...flight,
          price: flight.price ?? 0,
        },
        flightView,
        passengers: preparedPassengers,
        contactInfo,
      });
    } catch (e) {
      Alert.alert('Ошибка', e.message);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Данные пассажира</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 64 : 0}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: 32 },
          ]}
        >
        {passengers.map((p, i) => (
          <PassengerCard
            key={i}
            index={i}
            passenger={p}
            expanded={expanded === i}
            isDomestic={isDomestic}
            onToggle={() => setExpanded(expanded === i ? -1 : i)}
            update={updatePassenger}
            openDropdown={setDropdown}
            openPicker={setPicker}
          />
        ))}

        <TouchableOpacity style={styles.addBtn} onPress={addPassenger}>
          <MaterialIcons name="add" size={22} color="#0277bd" />
          <Text style={styles.addText}>Добавить пассажира</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.continue} onPress={handleContinue}>
          <Text style={styles.continueText}>Продолжить</Text>
        </TouchableOpacity>
        </ScrollView>
</KeyboardAvoidingView>

      {/* DATE PICKER */}
      {picker && Platform.OS === 'android' && (
        <DateTimePicker
          value={
            picker.value
              ? new Date(picker.value)
              : new Date()
          }
          mode="date"
          display="default"
          locale="ru-RU"
          onChange={(event, date) => {
            setPicker(null);

            if (event.type === 'dismissed') {
              return;
            }

            if (event.type === 'set' && date) {
              updatePassenger(
                picker.index,
                picker.field,
                formatISO(date)
              );
            }
          }}
        />
      )}


      {picker && Platform.OS === 'ios' && (
        <Modal transparent animationType="fade">
          <View style={styles.modal}>
            <View style={styles.modalCard}>
              <DateTimePicker
                value={
                  picker.value
                    ? new Date(picker.value)
                    : new Date()
                }
                mode="date"
                display="spinner"
                locale="ru-RU"
                themeVariant="light"
                textColor="#000"
                style={{ height: 216 }}
                onChange={(e, date) => {
                  if (date) {
                    updatePassenger(
                      picker.index,
                      picker.field,
                      formatISO(date)
                    );
                  }
                }}
              />
      
              <TouchableOpacity
                style={styles.modalBtn}
                onPress={() => setPicker(null)}
              >
                <Text style={styles.modalText}>Готово</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {dropdown && (
        <Dropdown
          {...dropdown}
          onClose={() => setDropdown(null)}
          onSelect={(v) => {
            updatePassenger(dropdown.index, dropdown.field, v);
            setDropdown(null);
          }}
        />
      )}
    </SafeAreaView>
  );
}



const PassengerCard = React.memo(
  ({ passenger, expanded, onToggle, index, update, openDropdown, openPicker, isDomestic }) => (
    <View style={styles.card}>
      <TouchableOpacity style={styles.cardHeader} onPress={onToggle}>
        <Text style={styles.cardTitle}>Пассажир {index + 1}</Text>
        <MaterialIcons
          name={expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
          size={24}
          color="#0277bd"
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.form}>
          <Field
            label="Фамилия"
            value={passenger.lastName}
            onChange={(t) => update(index, 'lastName', capitalizeFirst(t))}
          />
          <Field
            label="Имя"
            value={passenger.firstName}
            onChange={(t) => update(index, 'firstName', capitalizeFirst(t))}
          />
          <Field
            label="Отчество (при наличии)"
            placeholder="Отчество"
            value={passenger.middleName}
            onChange={(t) => update(index, 'middleName', capitalizeFirst(t))}
          />

          <Select label="Пол"
            value={GENDERS.find(g => g.value === passenger.gender)?.label}
            onPress={(y) =>
              openDropdown({ y, index, field: 'gender', options: GENDERS })
            }
          />

          <Select label="Гражданство"
            value={COUNTRIES.find(c => c.value === passenger.citizenship)?.label}
            onPress={(y) =>
              openDropdown({ y, index, field: 'citizenship', options: COUNTRIES })
            }
          />

                    <Select label="Дата рождения"
            value={formatHuman(passenger.birthDate)}
            onPress={() =>
              openPicker({ index, field: 'birthDate', value: new Date() })
            }
          />

          <Select
  label="Тип документа"
  value={DOCUMENT_TYPES[passenger.documentType]}
  onPress={(y) =>
    openDropdown({
      y,
      index,
      field: 'documentType',
      options: getDocumentOptions(passenger.birthDate, isDomestic),
    })
  }
/>


          <Field
  label="Номер документа"
  value={passenger.document}
  onChange={(t) =>
    update(index, 'document', t.replace(/\s/g, '').toUpperCase())
  }
  autoCapitalize="characters"
/>


{passenger.documentType !== 'BIRTH_CERT' && (
          <Select
            label="Срок действия документа"
            value={formatHuman(passenger.passportExpiryDate)}
            onPress={() =>
              openPicker({
                index,
                field: 'passportExpiryDate',
                value: new Date(),
              })
            }
          />
          )}
        </View>
      )}
    </View>
  )
);



const Field = ({ label, value, onChange, placeholder, onBlur, ...props }) => (
  <>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChange}
      onBlur={onBlur}
      autoCorrect={false}
      autoCapitalize="none"
      placeholder={placeholder ?? label}
      placeholderTextColor="#999"
      {...props}
    />
  </>
);

const Select = ({ label, value, onPress }) => {
  const ref = useRef(null);

  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        ref={ref}
        style={styles.input}
        onPress={() => {
          ref.current?.measureInWindow((x, y, w, h) => {
            onPress(y + h);
          });
        }}
      >
        <View style={styles.selectRow}>
          <Text style={[styles.selectText, !value && { color: '#999' }]}>
            {value || 'Выберите'}
          </Text>
          <MaterialIcons name="keyboard-arrow-down" size={22} color="#666" />
        </View>
      </TouchableOpacity>
    </>
  );
};

/* ================= DROPDOWN ================= */

const Dropdown = ({ y, options, onSelect, onClose }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 160,
      useNativeDriver: true,
    }).start();
  }, []);

  const close = () => {
    Animated.timing(anim, {
      toValue: 0,
      duration: 120,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  return (
    <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={close}>
      <Animated.View
        style={[
          styles.dropdown,
          {
            top: y + 6,
            opacity: anim,
            transform: [
              {
                translateY: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-6, 0],
                }),
              },
            ],
          },
        ]}
      >
        {options.map((o) => (
          <TouchableOpacity
            key={o.value}
            style={styles.dropdownItem}
            onPress={() => {
              onSelect(o.value);
              close();
            }}
          >
            <Text style={styles.dropdownText}>{o.label}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>
    </TouchableOpacity>
  );
};

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  content: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#0277bd' },
  form: { padding: 16, borderTopWidth: 1, borderTopColor: '#eee' },
  label: { fontSize: 13, color: '#9ea7b3', marginTop: 12, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
  },
  selectRow: { flexDirection: 'row', justifyContent: 'space-between' },
  selectText: { fontSize: 15, color: '#333' },
  addBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0277bd',
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
  },
  addText: { marginLeft: 8, fontSize: 15, fontWeight: '700', color: '#0277bd' },
  continue: {
    marginTop: 16,
    backgroundColor: '#0277bd',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  continueText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  overlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 },
  dropdown: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 18,
    elevation: 8,
  },
  dropdownItem: { padding: 16 },
  dropdownText: { fontSize: 15 },
  modal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    width: '85%',
  },
  modalBtn: { marginTop: 12, alignItems: 'center' },
  modalText: { color: '#0277bd', fontSize: 16, fontWeight: '700' },
});