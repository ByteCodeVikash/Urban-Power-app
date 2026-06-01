import React from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Bell, Lock, Globe, Moon } from 'lucide-react-native';
import { Typography } from '../../components/Typography';
import { Header } from '../../components/Header';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';

export default function SettingsScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header 
        title="Settings" 
        leftComponent={
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft size={24} color={Colors.light.text} />
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Typography variant="h3" weight="800" style={styles.sectionTitle}>General</Typography>
          <View style={styles.card}>
            <SettingItem icon={Bell} title="Notifications" value={true} />
            <SettingItem icon={Moon} title="Dark Mode" value={false} />
            <SettingItem icon={Globe} title="Language" detail="English" />
            <SettingItem icon={Lock} title="Privacy Policy" last />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingItem({ icon: Icon, title, value, detail, last }: any) {
  return (
    <View style={[styles.item, last && { borderBottomWidth: 0 }]}>
      <View style={styles.itemLeft}>
        <Icon size={20} color={Colors.light.text} />
        <Typography variant="body1" weight="700">{title}</Typography>
      </View>
      {value !== undefined ? (
        <Switch value={value} />
      ) : (
        <Typography variant="body2" color={Colors.light.textSecondary}>{detail || ''}</Typography>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.surface },
  content: { padding: Spacing.lg },
  backButton: { padding: 4 },
  section: { marginBottom: Spacing.xl },
  sectionTitle: { marginBottom: Spacing.md },
  card: {
    backgroundColor: Colors.light.white,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.light.sm,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
