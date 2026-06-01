import React from 'react';
import { View, StyleSheet, ScrollView, Pressable, TouchableOpacity, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { 
  ChevronRight, 
  Mail, 
  Phone, 
  MessageCircle, 
  BookOpen, 
  CreditCard, 
  Crown, 
  ShieldCheck, 
  Wrench,
  UserCheck
} from 'lucide-react-native';
import { Typography } from '../../components/Typography';
import { Header } from '../../components/Header';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';

export default function HelpSupportScreen() {
  const navigation = useNavigation<any>();

  const supportActions = [
    { 
      id: 'email', 
      title: 'Email', 
      icon: Mail, 
      action: () => Linking.openURL('mailto:support@urbanpower.com')
    },
    { 
      id: 'call', 
      title: 'Call / Message', 
      icon: Phone, 
      action: () => Linking.openURL('tel:+919876543210')
    },
    { 
      id: 'chat', 
      title: 'Chat with Us', 
      icon: MessageCircle, 
      action: () => Linking.openURL('whatsapp://send?phone=+919876543210')
    },
  ];

  const helpTopics = [
    { id: 'account', title: 'Account Detail', icon: UserCheck, route: 'AccountDetail' },
    { id: 'started', title: 'Getting Started with App', icon: BookOpen, route: 'GettingStarted' },
    { id: 'payment', title: 'Payment & UPI Credits', icon: CreditCard, route: 'PaymentUPICredits' },
    { id: 'membership', title: 'UPI Plus Membership', icon: Crown, route: 'UPIPlusMembership' },
    { id: 'safety', title: 'VIP Safety', icon: ShieldCheck, route: 'VIPSafety' },
    { id: 'warranty', title: 'Claim Warranty', icon: Wrench, route: 'ClaimWarranty' },
  ];

  return (
    <View style={styles.safeArea}>
      <Header title="Help & Support" />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.contactSection}>
          <Typography variant="h3" weight="700" style={styles.sectionTitle}>Contact Us</Typography>
          <View style={styles.actionGrid}>
            {supportActions.map((item) => (
              <TouchableOpacity key={item.id} style={styles.actionCard} onPress={item.action}>
                <View style={styles.iconCircle}>
                   <item.icon size={24} color={Colors.light.primary} />
                </View>
                <Typography variant="body2" weight="700">{item.title}</Typography>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.topicsSection}>
          <Typography variant="h3" weight="700" style={styles.sectionTitle}>Help Topics</Typography>
          <View style={styles.topicsList}>
            {helpTopics.map((item) => (
              <Pressable 
                key={item.id} 
                style={styles.topicItem}
                onPress={() => navigation.navigate(item.route)}
              >
                <View style={styles.topicLeft}>
                  <item.icon size={22} color={Colors.light.text} />
                  <Typography variant="body1" weight="700">{item.title}</Typography>
                </View>
                <ChevronRight size={20} color={Colors.light.textMuted} />
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.infoBox}>
           <Typography variant="body2" color={Colors.light.textSecondary} align="center">
              Our support team is available 24/7 to help you with any issues or queries.
           </Typography>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.surface },
  content: { padding: Spacing.lg, paddingBottom: 100 },
  sectionTitle: { marginBottom: Spacing.lg },
  contactSection: { marginBottom: Spacing.xl },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  actionCard: {
    flex: 1,
    backgroundColor: Colors.light.white,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    gap: 8,
    ...Shadows.light.sm,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  topicsSection: { marginBottom: Spacing.xl },
  topicsList: {
    gap: Spacing.sm,
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    backgroundColor: Colors.light.white,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    ...Shadows.light.sm,
  },
  topicLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  infoBox: {
    padding: Spacing.xl,
    backgroundColor: Colors.light.white,
    borderRadius: BorderRadius.xl,
    marginTop: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
});
