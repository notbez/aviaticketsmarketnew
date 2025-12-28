import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import WheelPickerExpo from 'react-native-wheel-picker-expo';

const YEARS = Array.from({ length: 5 }, (_, i) => `${2025 + i}`);
const MONTHS = [
  'Январь','Февраль','Март','Апрель','Май','Июнь',
  'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'
];

export default function DateWheelSheet({
  visible,
  initialDate = new Date(),
  onConfirm,
  onClose,
}) {
  const [day, setDay] = useState(initialDate.getDate());
  const [month, setMonth] = useState(initialDate.getMonth());
  const [year, setYear] = useState(initialDate.getFullYear());

  useEffect(() => {
    if (visible) {
      setDay(initialDate.getDate());
      setMonth(initialDate.getMonth());
      setYear(initialDate.getFullYear());
    }
  }, [visible]);

  const daysInMonth = useMemo(() => {
    return new Date(year, month + 1, 0).getDate();
  }, [month, year]);

  const DAYS = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.overlay} onPress={onClose} />

      <View style={styles.sheet}>
        <View style={styles.grabber} />

        <Text style={styles.title}>Выберите дату</Text>

        <View style={styles.pickers}>
          <WheelPickerExpo
            height={160}
            width={70}
            initialSelectedIndex={day - 1}
            items={DAYS.map(d => ({ label: d, value: d }))}
            onChange={({ index }) => setDay(index + 1)}
          />

          <WheelPickerExpo
            height={160}
            width={140}
            initialSelectedIndex={month}
            items={MONTHS.map(m => ({ label: m, value: m }))}
            onChange={({ index }) => setMonth(index)}
          />

          <WheelPickerExpo
            height={160}
            width={90}
            initialSelectedIndex={YEARS.indexOf(String(year))}
            items={YEARS.map(y => ({ label: y, value: y }))}
            onChange={({ item }) => setYear(Number(item.value))}
          />
        </View>

        <Pressable
          style={styles.confirmBtn}
          onPress={() => {
            const d = new Date(year, month, day);
            onConfirm(d);
            onClose();
          }}
        >
          <Text style={styles.confirmText}>Готово</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },

  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingTop: 10,
    paddingBottom: 24,
    alignItems: 'center',
  },

  grabber: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ccc',
    marginBottom: 10,
  },

  title: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 16,
    color: '#222',
  },

  pickers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  confirmBtn: {
    marginTop: 20,
    backgroundColor: '#0277bd',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 14,
  },

  confirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});