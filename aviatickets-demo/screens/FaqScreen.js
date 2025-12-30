// screens/FaqScreen.js
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../lib/api';

const categories = [
  { id: 'all', name: 'Все' },
  { id: 'payments', name: 'Оплата' },
  { id: 'baggage', name: 'Багаж' },
  { id: 'refunds', name: 'Возвраты' },
  { id: 'checkin', name: 'Регистрация' },
  { id: 'general', name: 'Общее' },
];

export default function FaqScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const [faqs, setFaqs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [loading, setLoading] = useState(true);

  /* ===== LOAD FAQ ONCE ===== */
  useEffect(() => {
    loadFaqs();
  }, []);

  const loadFaqs = async () => {
    try {
      setLoading(true);
      const data = await api('/faq');
      setFaqs(Array.isArray(data) ? data : []);
    } catch (e) {
      setFaqs([]);
    } finally {
      setLoading(false);
    }
  };

  /* ===== FILTER ===== */
  const filteredFaqs = useMemo(() => {
    let result = [...faqs];

    if (selectedCategory !== 'all') {
      result = result.filter((f) => f.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (f) =>
          f.question?.toLowerCase().includes(q) ||
          f.answer?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [faqs, selectedCategory, searchQuery]);

  const toggleItem = (id) => {
    const next = new Set(expandedItems);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpandedItems(next);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Часто задаваемые вопросы</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* SEARCH */}
      <View style={styles.search}>
        <MaterialCommunityIcons name="magnify" size={20} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск по вопросам"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {!!searchQuery && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialCommunityIcons name="close-circle" size={18} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* CATEGORIES (НЕ ЛОМАЕМ ПОЛОЧКУ) */}
      <View style={styles.tabs}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((c) => (
            <TouchableOpacity
              key={c.id}
              onPress={() => setSelectedCategory(c.id)}
              style={[
                styles.tab,
                selectedCategory === c.id && styles.tabActive,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedCategory === c.id && styles.tabTextActive,
                ]}
              >
                {c.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* LIST */}
      <ScrollView style={styles.list}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#0277bd" />
          </View>
        ) : filteredFaqs.length === 0 ? (
          <View style={styles.center}>
            <MaterialCommunityIcons
              name="help-circle-outline"
              size={56}
              color="#ccc"
            />
            <Text style={styles.empty}>Вопросы не найдены</Text>
          </View>
        ) : (
          filteredFaqs.map((faq) => {
            const id = faq._id || faq.id;
            const open = expandedItems.has(id);

            return (
              <View key={id} style={styles.card}>
                <TouchableOpacity
                  style={styles.question}
                  onPress={() => toggleItem(id)}
                >
                  <Text style={styles.questionText}>{faq.question}</Text>
                  <MaterialCommunityIcons
                    name={open ? 'chevron-up' : 'chevron-down'}
                    size={22}
                    color="#777"
                  />
                </TouchableOpacity>

                {open && (
                  <View style={styles.answer}>
                    <Text style={styles.answerText}>{faq.answer}</Text>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ===== STYLES ===== */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '800',
  },

  search: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#f5f5f5',
    gap: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 15,
  },

  tabs: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingHorizontal: 12,
  },

  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },

  tabActive: {
    borderBottomColor: '#0277bd',
  },

  tabText: {
    color: '#999',
    fontWeight: '500',
  },

  tabTextActive: {
    color: '#0277bd',
    fontWeight: '700',
  },

  list: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  question: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },

  questionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    marginRight: 10,
  },

  answer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    padding: 16,
  },

  answerText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },

  center: {
    alignItems: 'center',
    paddingVertical: 60,
  },

  empty: {
    marginTop: 12,
    color: '#999',
  },
});