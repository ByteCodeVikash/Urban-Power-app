import React from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/Types';
import {
  ChevronLeft,
  ChevronRight,
  Bell,
  Lock,
  Globe,
  Moon,
  Trash2,
} from 'lucide-react-native';
import { Typography } from '../../components/Typography';
import { Header } from '../../components/Header';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';

export default function SettingsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Settings"
        leftComponent={
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ChevronLeft size={24} color={Colors.light.text} />
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        {/* General section */}
        <View style={styles.section}>
          <Typography variant="h3" weight="800" style={styles.sectionTitle}>
            General
          </Typography>
          <View style={styles.card}>
            <SettingItem icon={Bell} title="Notifications" value={true} />
            <SettingItem icon={Moon} title="Dark Mode" value={false} />
            <SettingItem icon={Globe} title="Language" detail="English" />
            <SettingItem
              icon={Lock}
              title="Privacy Policy"
              last
              onPress={() => navigation.navigate('PrivacyPolicy')}
            />
          </View>
        </View>

        {/* Account section */}
        <View style={styles.section}>
          <Typography variant="h3" weight="800" style={styles.sectionTitle}>
            Account
          </Typography>
          <View style={styles.card}>
            <SettingItem
              icon={Trash2}
              title="Delete My Account"
              danger
              last
              onPress={() => navigation.navigate('DeleteAccount')}
            />
          </View>
          <Typography
            variant="caption"
            color={Colors.light.textMuted}
            style={styles.dangerNote}
          >
            Permanently deletes your account and associated data. This cannot be
            undone.
          </Typography>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface SettingItemProps {
  icon: React.ElementType;
  title: string;
  value?: boolean;
  detail?: string;
  last?: boolean;
  danger?: boolean;
  onPress?: () => void;
}

function SettingItem({
  icon: Icon,
  title,
  value,
  detail,
  last,
  danger,
  onPress,
}: SettingItemProps) {
  const isInteractive = !!onPress || value !== undefined;
  const color = danger ? Colors.light.error : Colors.light.text;

  const content = (
    <View style={[styles.item, last && { borderBottomWidth: 0 }]}>
      <View style={styles.itemLeft}>
        <Icon size={20} color={color} />
        <Typography variant="body1" weight="700" color={color}>
          {title}
        </Typography>
      </View>
      {value !== undefined ? (
        <Switch value={value} />
      ) : onPress ? (
        <ChevronRight size={18} color={Colors.light.textMuted} />
      ) : (
        <Typography variant="body2" color={Colors.light.textSecondary}>
          {detail || ''}
        </Typography>
      )}
    </View>
  );

  if (isInteractive && onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
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
  dangerNote: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    lineHeight: 18,
  },
});
