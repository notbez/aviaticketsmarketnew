// screen/ResualtsScreen.js
import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, Image, TouchableOpacity, Modal, ScrollView } from 'react-native';
import FlightCard from '../components/FlightCard';
import { useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';


export default function ResultsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const { results = [], from, to, fromName, toName } = route.params || {};
  const [showJson, setShowJson] = useState(false);
  
  const codeJson = require('../code.json');
  
  // Получаем названия аэропортов
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

  const renderHeader = () => (
    <>
      {/* 🔧 FIX: добавили paddingTop здесь */}
      <View style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Выберите рейс</Text>
        <View style={{width:24}} />
      </View>

      <View style={styles.routeBox}>
        <Text style={styles.city}>{getDisplayName(from, fromName)}</Text>
        <Text style={styles.code}>{from}</Text>
        <Image source={require('../assets/plane.png')} style={styles.planeIcon} />
        <Text style={styles.city}>{getDisplayName(to, toName)}</Text>
        <Text style={styles.code}>{to}</Text>
      </View>

      {results.length > 0 && (
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            Найдено {results.length} рейс{results.length === 1 ? '' : results.length < 5 ? 'а' : 'ов'}
          </Text>
          <Text style={styles.resultsSubtext}>
            Выберите подходящий вариант
          </Text>
        </View>
      )}

      <View style={{ height: 10 }} /> 
    </>
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Плавающая кнопка */}
      <TouchableOpacity 
        style={styles.floatingButton}
        onPress={() => setShowJson(true)}
      >
        <MaterialIcons name="code" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Модальное окно с JSON */}
      <Modal
        visible={showJson}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowJson(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>code.json</Text>
              <TouchableOpacity onPress={() => setShowJson(false)}>
                <MaterialIcons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.jsonScroll}>
              <Text style={styles.jsonText}>
                {JSON.stringify(codeJson, null, 2)}
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <FlightCard 
              item={item} 
              onBook={() => navigation.navigate('FlightDetails', { flight: item })}
            />
          </View>
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Рейсы не найдены</Text>
            <Text style={styles.emptySubtitle}>
              Попробуйте изменить параметры поиска
            </Text>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => navigation.goBack()}
            >
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

  // 🔧 FIX: убран paddingTop отсюда
  topBar:{ 
    backgroundColor:'#2aa8ff',
    flexDirection:'row', 
    alignItems:'center', 
    justifyContent:'space-between', 
    paddingHorizontal:16,
    paddingBottom:12
  },

  back:{ fontSize:24, color:'#fff' },
  title:{ fontSize:20, fontWeight:'700', color:'#fff' },

  routeBox:{ 
    backgroundColor:'#2aa8ff',
    padding:20, 
    alignItems:'center',
    borderBottomLeftRadius:20,
    borderBottomRightRadius:20,
  },

  city:{ color:'#fff', fontSize:16 },
  code:{ color:'#fff', fontSize:22, fontWeight:'700' },
  planeIcon:{ width:40, height:40, marginVertical:8 },

  cardWrapper: {
    marginHorizontal: 16,
    marginBottom: 16,
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
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
    textAlign: 'center',
    marginBottom: 20,
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

  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
  },

  resultsCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },

  resultsSubtext: {
    fontSize: 14,
    color: '#666',
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
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },

  jsonScroll: {
    flex: 1,
    padding: 20,
  },

  jsonText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#333',
  },
});