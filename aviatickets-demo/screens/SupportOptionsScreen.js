// screens/SupportOptionsScreen.js
import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SupportOptionsScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.safe}>
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Поддержка</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: 32 + insets.bottom },
        ]}
      >
        {/* INTRO */}
        <View style={styles.intro}>
          <MaterialCommunityIcons
            name="lifebuoy"
            size={42}
            color="#0277bd"
          />
          <Text style={styles.subtitle}>
            Выберите удобный способ получить помощь
          </Text>
        </View>

        {/* OPTIONS */}
        <View style={styles.card}>
          <SupportItem
            icon={
              <MaterialCommunityIcons
                name="help-circle-outline"
                size={26}
                color="#0277bd"
              />
            }
            title="Часто задаваемые вопросы"
            description="Ответы на популярные вопросы"
            onPress={() => navigation.navigate('Faq')}
          />

          <View style={styles.divider} />

          <SupportItem
            icon={
              <MaterialIcons
                name="support-agent"
                size={26}
                color="#0277bd"
              />
            }
            title="Написать в поддержку"
            description="Связаться со службой поддержки"
            onPress={() => navigation.navigate('Support')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ===== UI COMPONENT ===== */

const SupportItem = ({ icon, title, description, onPress }) => (
  <TouchableOpacity style={styles.item} onPress={onPress}>
    <View style={styles.itemIcon}>{icon}</View>

    <View style={styles.itemContent}>
      <Text style={styles.itemTitle}>{title}</Text>
      <Text style={styles.itemDescription}>{description}</Text>
    </View>

    <MaterialIcons
      name="keyboard-arrow-right"
      size={24}
      color="#bdbdbd"
    />
  </TouchableOpacity>
);

/* ===== STYLES ===== */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },

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
    fontWeight: '800',
    color: '#111',
  },

  content: {
    padding: 16,
  },

  intro: {
    alignItems: 'center',
    marginBottom: 24,
  },

  subtitle: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 18,
  },

  itemIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#e3f2fd',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  itemContent: {
    flex: 1,
  },

  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
  },

  itemDescription: {
    fontSize: 13,
    color: '#777',
  },

  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginLeft: 74,
  },
});