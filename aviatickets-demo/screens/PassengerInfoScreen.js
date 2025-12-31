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
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../contexts/AuthContext';
import { KeyboardAvoidingView, Platform } from 'react-native';

/* ================= CONST ================= */

const COUNTRIES = [
  { label: 'Россия', value: 'RU' },
  { label: 'Узбекистан', value: 'UZ' },
];

const GENDERS = [
  { label: 'Мужской', value: 'M' },
  { label: 'Женский', value: 'F' },
];

/* ================= HELPERS ================= */

const normalizeRU = (v = '') =>
  v.replace(/[^А-Яа-яЁё\- ]/g, '').toUpperCase();

const formatISO = (d) => d.toISOString().split('T')[0];

const formatHuman = (iso) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
};

const capitalizeFirst = (v = '') => {
  if (!v) return v;
  return v.charAt(0).toUpperCase() + v.slice(1);
};

const normalizeISODate = (value) => {
  if (!value) return '';

  // Если уже YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  // ISO строка или Date
  const d = new Date(value);
  if (!isNaN(d)) {
    return d.toISOString().split('T')[0];
  }

  return '';
};

/* ================= SCREEN ================= */

export default function PassengerInfoScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { token, user } = useAuth();
  const { flight, flightView } = route.params || {};

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
      document: '',
      passportExpiryDate: '',
    },
  ]);

  console.log('[PassengerInfo] user =', JSON.stringify(user, null, 2));

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

    // ФИО
    if (!p0.lastName || !p0.firstName) {
      const parts = (user.fullName || '')
        .trim()
        .split(/\s+/)      // 🔥 КЛЮЧ
        .filter(Boolean);  // 🔥 КЛЮЧ
          
      next.lastName = p0.lastName || parts[0] || '';
      next.firstName = p0.firstName || parts[1] || '';
      next.middleName = p0.middleName || parts.slice(2).join(' ') || '';
    }

    // Гражданство
    if (!p0.citizenship) {
      next.citizenship = passport?.country || 'RU';
    }

    // Номер документа
    if (!p0.document && passport?.passportNumber) {
      next.document = passport.passportNumber;
    }

    // Срок действия
    if (!p0.passportExpiryDate && passport?.expiryDate) {
      next.passportExpiryDate = normalizeISODate(passport.expiryDate);
    }

    return [next, ...prev.slice(1)];
  });
}, [user]);

  /* ================= UPDATE ================= */

  const updatePassenger = useCallback((i, field, value) => {
    setPassengers((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  }, []);

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
        document: '',
        passportExpiryDate: '',
      },
    ]);
    setExpanded(passengers.length);
  };

  /* ================= CONTINUE ================= */

  const handleContinue = () => {
    const preparedPassengers = passengers.map((p) => {
      if (
        !p.lastName ||
        !p.firstName ||
        !p.gender ||
        !p.citizenship ||
        !p.birthDate ||
        !p.document ||
        !p.passportExpiryDate
      ) {
        throw new Error('Passenger incomplete');
      }

      return {
        lastName: normalizeRU(p.lastName),
        firstName: normalizeRU(p.firstName),
        middleName: normalizeRU(p.middleName || ''),
        gender: p.gender,
        citizenship: p.citizenship,
        dateOfBirth: p.birthDate,
        passportNumber: p.document,
        countryOfIssue: p.citizenship,
        passportExpiryDate: p.passportExpiryDate,
      };
    });

    const contactInfo = {
      firstName: preparedPassengers[0].firstName,
      middleLastName: preparedPassengers[0].lastName,
      phone: '',
      email: '',
    };

    console.log(
  '[PassengerInfo] flight.brandId =',
  flight?.brandId
);

    navigation.navigate('Booking', {
      flight: {
        ...flight, // ⬅️ КРИТИЧНО: не трогаем
        price: flight.price ?? 0,
      },
      flightView, // ⬅️ ПРОСТО ПРОКИДЫВАЕМ
      passengers: preparedPassengers,
      contactInfo,
    });
  };

  /* ================= RENDER ================= */

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
            // ВСЕГДА закрываем пикер
            setPicker(null);
          
            // Нажали "Отмена"
            if (event.type === 'dismissed') {
              return;
            }
          
            // Нажали "OK"
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
                themeVariant="light"      // 🔥 ВАЖНО
                textColor="#000"          // 🔥 ВАЖНО
                style={{ height: 216 }}   // 🔥 ВАЖНО
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

/* ================= CARD ================= */

const PassengerCard = React.memo(
  ({ passenger, expanded, onToggle, index, update, openDropdown, openPicker }) => (
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

          <Field
            label="Номер документа"
            value={passenger.document}
            keyboardType="numeric"
            onChange={(t) =>
              update(index, 'document', t.replace(/\D/g, '').slice(0, 10))
            }
          />

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
        </View>
      )}
    </View>
  )
);

/* ================= UI ================= */

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