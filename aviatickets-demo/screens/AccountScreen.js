import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

const COUNTRIES = [
  { label: 'Россия', value: 'RU' },
  { label: 'Узбекистан', value: 'UZ' },
];

/**
 * Date formatting utilities
 */
const formatISO = (d) => d.toISOString().split('T')[0];

const formatHuman = (iso) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
};

/**
 * Phone number formatting for Russian format: +7 (999) 888-23-23
 */
const formatPhone = (value) => {
  const digits = value.replace(/\D/g, '');

  let d = digits;
  if (d.startsWith('8')) d = '7' + d.slice(1);
  if (!d.startsWith('7')) d = '7' + d;

  const p = d.slice(1);

  let res = '+7';
  if (p.length > 0) res += ` (${p.slice(0, 3)}`;
  if (p.length >= 3) res += ')';
  if (p.length > 3) res += ` ${p.slice(3, 6)}`;
  if (p.length > 6) res += `-${p.slice(6, 8)}`;
  if (p.length > 8) res += `-${p.slice(8, 10)}`;

  return res;
};

const onlyDigitsPhone = (value) => {
  const d = value.replace(/\D/g, '');
  if (d.startsWith('7')) return d;
  if (d.startsWith('8')) return '7' + d.slice(1);
  return '7' + d;
};

/**
 * User profile management screen
 * Handles personal information, passport data, and contact details
 * TODO: Add photo upload functionality and form validation
 */
export default function AccountScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { token, user, updateUser } = useAuth();

  const [picker, setPicker] = useState(null);
  const [dropdown, setDropdown] = useState(null);

  const [profile, setProfile] = useState({
    lastName: '',
    firstName: '',
    middleName: '',
    fullName: '',
    email: '',
    phone: '',
    passportNumber: '',
    passportCountry: '',
    passportExpiryDate: '',
  });

  const [savedProfile, setSavedProfile] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    const changed =
      profile.fullName !== savedProfile.fullName ||
      profile.phone !== savedProfile.phone ||
      profile.passportNumber !== savedProfile.passportNumber ||
      profile.passportCountry !== savedProfile.passportCountry ||
      profile.passportExpiryDate !== savedProfile.passportExpiryDate;

    setIsDirty(changed);
  }, [profile, savedProfile]);

  /**
   * Load user profile data from API
   */
  const loadProfile = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const data = await api('/me');

      const expiryDate = data.passport?.expiryDate
        ? new Date(data.passport.expiryDate).toISOString().split('T')[0]
        : '';

      const parts = (data.fullName || '')
        .trim()
        .split(/\s+/)
        .filter(Boolean);

      const profileData = {
        lastName: parts[0] || '',
        firstName: parts[1] || '',
        middleName: parts.slice(2).join(' ') || '',
        fullName: data.fullName || '',
        email: data.email || '',
        phone: data.phone || '',
        passportNumber: data.passport?.passportNumber || '',
        passportCountry: data.passport?.country || '',
        passportExpiryDate: expiryDate,
      };

      setProfile(profileData);
      setSavedProfile(profileData);
      updateUser?.({ ...user, ...data });
    } catch {
      Alert.alert('Ошибка', 'Не удалось загрузить профиль');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update full name when individual name fields change
   */
  const updateFullName = (p) =>
    [p.lastName, p.firstName, p.middleName].filter(Boolean).join(' ');

  const onChange = (key, value) =>
    setProfile((p) => {
      const next = { ...p, [key]: value };
      next.fullName = updateFullName(next);
      return next;
    });

  /**
   * Save profile changes to API
   */
  const onSave = async () => {
    if (!token) return;

    try {
      setSaving(true);

      const updateData = {
        fullName: profile.fullName,
        phone: profile.phone,
        passport: {
          passportNumber: profile.passportNumber,
          country: profile.passportCountry,
          expiryDate: profile.passportExpiryDate
            ? new Date(profile.passportExpiryDate)
            : null,
        },
      };

      const updatedUser = await api('/me', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      setSavedProfile(profile);
      setIsDirty(false);
      updateUser?.({ ...user, ...updatedUser });

      Alert.alert('Успешно', 'Данные сохранены');
    } catch {
      Alert.alert('Ошибка', 'Не удалось сохранить данные');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Профиль</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: 120 + insets.bottom },
          ]}
        >
          <View style={styles.profileCard}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>
                {(profile.fullName || 'W')[0]}
              </Text>
            </View>

            <View style={{ marginLeft: 14 }}>
              <Text style={styles.profileName}>{profile.fullName}</Text>
              <Text style={styles.profileEmail}>{profile.email}</Text>
            </View>
          </View>

          {loading ? (
            <ActivityIndicator size="large" />
          ) : (
            <>
              <View style={styles.card}>
                <Field label="Фамилия">
                  <TextInput
                    value={profile.lastName}
                    onChangeText={(v) => onChange('lastName', v)}
                    style={styles.input}
                  />
                </Field>

                <Field label="Имя">
                  <TextInput
                    value={profile.firstName}
                    onChangeText={(v) => onChange('firstName', v)}
                    style={styles.input}
                  />
                </Field>

                <Field label="Отчество (необязательно)">
                  <TextInput
                    value={profile.middleName}
                    onChangeText={(v) => onChange('middleName', v)}
                    style={styles.input}
                  />
                </Field>

                <Field label="Телефон">
                  <TextInput
                    keyboardType="phone-pad"
                    value={formatPhone(profile.phone)}
                    onChangeText={(v) =>
                      onChange('phone', onlyDigitsPhone(v))
                    }
                    style={styles.input}
                  />
                </Field>
              </View>

              <View style={styles.card}>
                <Field label="Номер документа">
                  <TextInput
                    value={profile.passportNumber}
                    onChangeText={(v) =>
                      onChange('passportNumber', v.replace(/\D/g, ''))
                    }
                    style={styles.input}
                  />
                </Field>

                <Select
                  label="Страна выдачи"
                  value={
                    COUNTRIES.find(
                      (c) => c.value === profile.passportCountry
                    )?.label
                  }
                  onPress={(y) =>
                    setDropdown({
                      y,
                      field: 'passportCountry',
                      options: COUNTRIES,
                    })
                  }
                />

                <Select
                  label="Срок действия"
                  value={formatHuman(profile.passportExpiryDate)}
                  onPress={() =>
                    setPicker({
                      field: 'passportExpiryDate',
                      value: profile.passportExpiryDate,
                    })
                  }
                />
              </View>
            </>
          )}
        </ScrollView>

        {isDirty && (
          <View style={[styles.saveWrap, { bottom: insets.bottom + 16 }]}>
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={onSave}
              disabled={saving}
            >
              <Text style={styles.saveText}>
                {saving ? 'Сохранение…' : 'Сохранить'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {picker && Platform.OS === 'ios' && (
          <Modal transparent animationType="fade">
            <View style={styles.modal}>
              <View style={styles.modalCard}>
                <DateTimePicker
                  value={picker.value ? new Date(picker.value) : new Date()}
                  mode="date"
                  display="spinner"
                  textColor="#000"
                  onChange={(e, d) =>
                    d && onChange(picker.field, formatISO(d))
                  }
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/**
 * Reusable form field component
 */
const Field = ({ label, children }) => (
  <>
    <Text style={styles.label}>{label}</Text>
    {children}
  </>
);

/**
 * Dropdown select component
 */
const Select = ({ label, value, onPress }) => {
  const ref = useRef(null);

  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        ref={ref}
        style={styles.input}
        onPress={() =>
          ref.current?.measureInWindow((x, y, w, h) => onPress(y + h))
        }
      >
        <View style={styles.selectRow}>
          <Text style={!value && { color: '#999' }}>
            {value || 'Выберите'}
          </Text>
          <MaterialIcons name="keyboard-arrow-down" size={22} />
        </View>
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16 },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  content: { padding: 16 },
  profileCard: { flexDirection: 'row', marginBottom: 16 },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0277bd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { color: '#fff', fontSize: 24, fontWeight: '800' },
  profileName: { fontSize: 16, fontWeight: '700' },
  profileEmail: { color: '#777' },
  card: { marginBottom: 16 },
  label: { marginTop: 12, marginBottom: 6, color: '#777' },
  input: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    padding: 14,
  },
  selectRow: { flexDirection: 'row', justifyContent: 'space-between' },
  saveWrap: { position: 'absolute', left: 16, right: 16 },
  saveBtn: {
    backgroundColor: '#0277bd',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontWeight: '700' },
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
  modalText: { color: '#0277bd', fontWeight: '700' },
});