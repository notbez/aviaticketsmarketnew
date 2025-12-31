// screens/SignUpScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Modal,
  Animated,
} from 'react-native';
import Input from '../components/Input';
import PrimaryButton from '../components/PrimaryButton';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import DateTimePicker from '@react-native-community/datetimepicker';


/* ================= CONST (КАК В PassengerInfoScreen) ================= */

const COUNTRIES = [
  { label: 'Россия', value: 'RU' },
  { label: 'Узбекистан', value: 'UZ' },
];

/* ================= HELPERS ================= */

const formatISO = (d) => d.toISOString().split('T')[0];

const formatHuman = (iso) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
};


const formatPhoneRU = (value = '') => {
  // оставляем только цифры
  let digits = value.replace(/\D/g, '');

  // если начали с 8 — заменяем на 7
  if (digits.startsWith('8')) {
    digits = '7' + digits.slice(1);
  }

  // если ввели без кода — считаем что это РФ
  if (digits.length && !digits.startsWith('7')) {
    digits = '7' + digits;
  }

  const d = digits.slice(0, 11);

  let formatted = '+7';

  if (d.length > 1) {
    formatted += ' (' + d.slice(1, 4);
  }
  if (d.length >= 5) {
    formatted += ') ' + d.slice(4, 7);
  }
  if (d.length >= 8) {
    formatted += '-' + d.slice(7, 9);
  }
  if (d.length >= 10) {
    formatted += '-' + d.slice(9, 11);
  }

  return formatted;
};

const normalizePhoneRU = (value = '') =>
  '+' + value.replace(/\D/g, '').slice(0, 11);
/* ================= SCREEN ================= */

export default function SignUpScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { login, user } = useAuth();
  const { returnTo, params } = route.params || {};

  /* ===== STATE ===== */
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [documentNumber, setDocumentNumber] = useState('');
  const [documentCountry, setDocumentCountry] = useState('');
  const [documentExpiryDate, setDocumentExpiryDate] = useState('');

  const [picker, setPicker] = useState(null);
  const [dropdown, setDropdown] = useState(null);

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [notificationsAccepted, setNotificationsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ===== VALIDATION ===== */
  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePhone = (phone) =>
    phone.replace(/\D/g, '').length >= 10;

  /* ===== SUBMIT ===== */
  const handleSignUp = async () => {
    if (!lastName.trim() || !firstName.trim()) {
      Alert.alert('Ошибка', 'Введите фамилию и имя');
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert('Ошибка', 'Введите корректный email');
      return;
    }
    if (!validatePhone(phone)) {
      Alert.alert('Ошибка', 'Введите корректный номер телефона');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Ошибка', 'Пароль должен быть не менее 6 символов');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Ошибка', 'Пароли не совпадают');
      return;
    }
    if (!termsAccepted) {
      Alert.alert('Ошибка', 'Необходимо принять пользовательское соглашение');
      return;
    }

    const fullName = `${lastName} ${firstName}${middleName ? ' ' + middleName : ''}`;

    setLoading(true);
    try {
      const body = {
        fullName,
        email: email.trim().toLowerCase(),
        phone,
        password,
        ...(documentNumber ? { passportNumber: documentNumber } : {}),
        ...(documentCountry ? { passportCountry: documentCountry } : {}),
        ...(documentExpiryDate ? { passportExpiryDate: documentExpiryDate } : {}),
        termsAccepted,
        notificationsAccepted,
      };

      const data = await api('/auth/register', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      await login(data.accessToken, data.user);

    if (returnTo) {
      navigation.replace(returnTo, params);
    } else {
      navigation.replace('MainTabs');
    }
    } catch (e) {
      Alert.alert('Ошибка', e.message || 'Не удалось зарегистрироваться');
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          {/* HEADER */}
          <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
            <View style={styles.logo}>
              <MaterialCommunityIcons name="airplane" size={28} color="#0277bd" />
            </View>
            <Text style={styles.title}>Регистрация</Text>
            <Text style={styles.sub}>Создайте аккаунт для бронирования рейсов</Text>
          </View>

          <View style={styles.card}>
            <Input label="Фамилия" placeholder="Иванов" value={lastName} onChangeText={setLastName} />
            <Input label="Имя" placeholder="Иван" value={firstName} onChangeText={setFirstName} />
            <Input label="Отчество (необязательно)" placeholder="Иванович" value={middleName} onChangeText={setMiddleName} />

            <Input label="Email" placeholder="example@mail.com" value={email} onChangeText={setEmail} />
            <Input label="Телефон" placeholder="+7 (999) 888-77-66" keyboardType="phone-pad" value={formatPhoneRU(phone)} onChangeText={(t) => setPhone(normalizePhoneRU(t))} />

            <Input label="Пароль" placeholder="Минимум 6 символов" secureTextEntry value={password} onChangeText={setPassword} />
            <Input label="Подтвердите пароль" placeholder="Повторите пароль" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />

            <Text style={styles.section}>Данные документа</Text>

            <Input
              label="Номер документа"
              placeholder="1234567890"
              keyboardType="numeric"
              value={documentNumber}
              onChangeText={(t) => setDocumentNumber(t.replace(/\D/g, '').slice(0, 10))}
            />

            <Select
              label="Страна выдачи"
              value={COUNTRIES.find(c => c.value === documentCountry)?.label}
              onPress={(y) =>
                setDropdown({ y, field: 'country', options: COUNTRIES })
              }
            />

            <Select
              label="Срок действия документа"
              value={formatHuman(documentExpiryDate)}
              onPress={() =>
                setPicker({ field: 'expiry', value: documentExpiryDate })
              }
            />

            <TouchableOpacity style={styles.checkbox} onPress={() => setTermsAccepted(!termsAccepted)}>
              <View style={[styles.checkboxBox, termsAccepted && styles.checkboxChecked]} />
              <Text style={styles.checkboxText}>Принимаю пользовательское соглашение</Text>
            </TouchableOpacity>

            <PrimaryButton title="Зарегистрироваться" onPress={handleSignUp} disabled={loading} />
          </View>
        </ScrollView>

        {/* DATE PICKER */}
        {picker && Platform.OS === 'android' && (
          <DateTimePicker
            value={picker.value ? new Date(picker.value) : new Date()}
            mode="date"
            display="default"
            locale="ru-RU"
            onChange={(e, d) => {
              setPicker(null);
              if (e.type === 'set' && d) {
                setDocumentExpiryDate(formatISO(d));
              }
            }}
          />
        )}

        {picker && Platform.OS === 'ios' && (
          <Modal transparent animationType="fade">
            <View style={styles.modal}>
              <View style={styles.modalCard}>
                <DateTimePicker
                  value={picker.value ? new Date(picker.value) : new Date()}
                  mode="date"
                  display="spinner"
                  locale="ru-RU"
                  themeVariant="light"
                  textColor="#000"
                  style={{ height: 216 }}
                  onChange={(e, d) => {
                    if (d) setDocumentExpiryDate(formatISO(d));
                  }}
                />
                <TouchableOpacity style={styles.modalBtn} onPress={() => setPicker(null)}>
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
              setDocumentCountry(v);
              setDropdown(null);
            }}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ================= SELECT + DROPDOWN (ОДИН В ОДИН) ================= */

const Select = ({ label, value, onPress }) => {
  const ref = useRef(null);

  return (
    <>
      <Text style={styles.fakeLabel}>{label}</Text>
      <TouchableOpacity
        ref={ref}
        style={styles.fakeInput}
        onPress={() => {
          ref.current?.measureInWindow((x, y, w, h) => {
            onPress(y + h);
          });
        }}
      >
        <View style={styles.selectRow}>
          <Text style={[styles.fakeValue, !value && { color: '#999' }]}>
            {value || 'Выберите'}
          </Text>
          <MaterialIcons name="keyboard-arrow-down" size={22} color="#666" />
        </View>
      </TouchableOpacity>
    </>
  );
};

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
    }).start(onClose);
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
          <TouchableOpacity key={o.value} style={styles.dropdownItem} onPress={() => onSelect(o.value)}>
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
  container: { padding: 20, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 20 },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e3f2fd',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: { fontSize: 22, fontWeight: '800', color: '#111' },
  sub: { fontSize: 14, color: '#777', marginTop: 6 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  section: { fontSize: 15, fontWeight: '700', marginTop: 12, marginBottom: 6 },

  checkbox: { flexDirection: 'row', alignItems: 'center', marginVertical: 14 },
  checkboxBox: { width: 20, height: 20, borderWidth: 2, borderColor: '#0277bd', marginRight: 10 },
  checkboxChecked: { backgroundColor: '#0277bd' },
  checkboxText: { fontSize: 14 },

  fakeLabel: { fontSize: 12, color: '#777', marginBottom: 4 },
  fakeInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  fakeValue: { fontSize: 15, color: '#111' },
  selectRow: { flexDirection: 'row', justifyContent: 'space-between' },

  overlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 },
  dropdown: {
    position: 'absolute',
    left: 20,
    right: 20,
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