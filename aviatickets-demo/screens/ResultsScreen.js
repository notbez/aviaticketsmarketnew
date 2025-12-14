// screens/ResultsScreen.js
import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, TouchableOpacity, Modal, ScrollView } from 'react-native';
import FlightCard from '../components/FlightCard';
import { useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Dimensions } from 'react-native';

export default function ResultsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const { results = [], from, to, fromName, toName, raw = [] } = route.params || {};
  const [showJson, setShowJson] = useState(false);
  const { width } = Dimensions.get("window");

  const getDisplayName = (code, fullName) => {
    if (fullName) return fullName.split('(')[0].trim();
    const airports = {
      'SVO': 'Москва',
      'DME': 'Москва',
      'VKO': 'Москва',
      'TJM': 'Тюмень',
      'OVB': 'Новосибирск'
    };
    return airports[code] || code;
  };

  return (
    <SafeAreaView style={styles.safe}>

      {/* --- FLOAT BUTTON --- */}
      <TouchableOpacity 
        style={styles.floatingButton}
        onPress={() => setShowJson(true)}
      >
        <MaterialIcons name="code" size={24} color="#fff" />
      </TouchableOpacity>

      {/* --- JSON MODAL --- */}
      <Modal visible={showJson} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Raw response</Text>
              <TouchableOpacity onPress={() => setShowJson(false)}>
                <MaterialIcons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.jsonScroll}>
              <Text style={styles.jsonText}>
                {JSON.stringify(raw.length ? raw : results, null, 2)}
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* --- WAVE BACKGROUND OVER EVERYTHING --- */}
      <View style={styles.waveWrapper}>
        <Svg width="100%" height={330} style={{ position: 'absolute', top: 0 }}>
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
            d={`M0 0 L0 230 Q ${width * 0.5} 330 ${width} 230 L${width} 0 Z`}
            fill="url(#grad)"
          />

          <Path
            d={`M0 60 Q ${width * 0.5} 160 ${width} 120 L${width} 0 L0 0 Z`}
            fill="url(#lightGrad)"
            opacity="0.6"
          />

          <Path
            d={`M0 120 Q ${width * 0.5} 240 ${width} 170 L${width} 0 L0 0 Z`}
            fill="url(#lightGrad)"
            opacity="0.4"
          />
        </Svg>

        {/* --- CONTENT INSIDE WAVE (TITLE + ROUTE + COUNTER) --- */}
        <View style={[styles.waveContent, { paddingTop: insets.top + 20 }]}>
          
          {/* Back */}
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={{ color: '#fff', fontSize: 26 }}>{'<'}</Text>
          </TouchableOpacity>

          {/* Title */}
          <Text style={styles.headerTitle}>Выберите рейс</Text>

          {/* Route */}
          <View style={styles.routeRow}>
            <Text style={styles.routeCity}>{getDisplayName(from, fromName)}</Text>
            <MaterialIcons name="airplanemode-active" size={22} color="#fff" style={{ marginHorizontal: 10 }} />
            <Text style={styles.routeCity}>{getDisplayName(to, toName)}</Text>
          </View>

          <Text style={styles.routeCodes}>{from} — {to}</Text>

          {/* Results counter */}
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsCount}>{results.length} вариантов</Text>
            <Text style={styles.resultsSubtext}>Показаны варианты по заданным критериям</Text>
          </View>
        </View>
      </View>

      {/* --- LIST (CARDS GO UNDER THE WAVE) --- */}
      <FlatList
        data={results}
        keyExtractor={(item, index) =>
          item.providerId || `${item.id}-${index}`
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <FlightCard 
              item={item} 
              onBook={() => navigation.navigate('FlightDetails', { flight: item })}
            />
          </View>
        )}
        contentContainerStyle={{
          paddingTop: 330, // 🚀 всё уходит под волну!
          paddingBottom: 20,
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Рейсы не найдены</Text>
            <Text style={styles.emptySubtitle}>Попробуйте изменить параметры поиска</Text>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Text style={styles.backButtonText}>Изменить поиск</Text>
            </TouchableOpacity>
          </View>
        }
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:{ flex:1, backgroundColor:'#fff' },

  waveWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 330,
    zIndex: 9999,    // ← СИНЯЯ ВОЛНА ПОВЕРХ СПИСКА
    elevation: 20,
  },

  waveContent: {
    paddingHorizontal: 20,
    zIndex: 30,    // ← КОНТЕНТ ПОВЕРХ ВОЛНЫ
  },

  headerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 10,
  },

  routeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },

  routeCity: {
    color: '#fff',
    fontSize: 18,
  },

  routeCodes: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.8,
    textAlign: 'center',
    marginTop: 4,
  },

  resultsHeader: {
    marginTop: 18,
    backgroundColor: '#ffffffdd',
    padding: 12,
    borderRadius: 12,
    alignSelf: 'center',
  },

  resultsCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },

  resultsSubtext: {
    fontSize: 14,
    color: '#666',
  },

  cardWrapper: {
    marginHorizontal: 16,
    marginBottom: 16,
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },

  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },

  backButton: {
    backgroundColor: '#2aa8ff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },

  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0277bd',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
  },

  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },

  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
    paddingTop: 20,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },

  jsonScroll: {
    flex: 1,
    padding: 20,
  },

  jsonText: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
});