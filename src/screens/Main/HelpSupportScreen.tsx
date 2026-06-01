import React from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, Pressable, TextInput } from 'react-native';
import { HelpCircle, MessageCircle, Phone, Mail, ChevronRight, Search, FileText } from 'lucide-react-native';
import { Typography } from '../../components/Typography';
import { Header } from '../../components/Header';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';
import { useRoute } from '@react-navigation/native';

const FAQ_CATEGORIES = [
  { title: 'Home Services', icon: <HelpCircle size={20} color={Colors.light.primary} /> },
  { title: 'Shopping & Returns', icon: <FileText size={20} color={Colors.light.primary} /> },
  { title: 'Payments & Wallet', icon: <Search size={20} color={Colors.light.primary} /> },
  { title: 'Kabadi Pickup', icon: <HelpCircle size={20} color={Colors.light.primary} /> },
];

export default function HelpSupportScreen() {
  const route = useRoute<any>();
  const isTab = route.params?.isTab;

  return (
    <SafeAreaView style={styles.safeArea}>
      {!isTab && <Header title="Help & Support" showBack />}
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchBar}>
           <Search size={20} color={Colors.light.textMuted} />
           <TextInput placeholder="How can we help you?" style={styles.searchInput} />
        </View>

        {/* Contact Options */}
        <View style={styles.section}>
           <Typography variant="h4" weight="800" style={{ marginBottom: Spacing.lg }}>Contact Us</Typography>
           <View style={styles.contactGrid}>
              <Pressable style={styles.contactCard}>
                 <MessageCircle size={24} color="#25D366" />
                 <Typography variant="body2" weight="700" style={{ marginTop: 8 }}>WhatsApp</Typography>
              </Pressable>
              <Pressable style={styles.contactCard}>
                 <Phone size={24} color={Colors.light.primary} />
                 <Typography variant="body2" weight="700" style={{ marginTop: 8 }}>Call Us</Typography>
              </Pressable>
              <Pressable style={styles.contactCard}>
                 <Mail size={24} color="#EA4335" />
                 <Typography variant="body2" weight="700" style={{ marginTop: 8 }}>Email</Typography>
              </Pressable>
           </View>
        </View>

        {/* FAQ Categories */}
        <View style={styles.section}>
           <Typography variant="h4" weight="800" style={{ marginBottom: Spacing.lg }}>FAQ Categories</Typography>
           {FAQ_CATEGORIES.map((cat, index) => (
             <Pressable key={index} style={styles.faqRow}>
                <View style={styles.catIcon}>{cat.icon}</View>
                <Typography variant="body1" weight="700" style={{ flex: 1, marginLeft: Spacing.md }}>{cat.title}</Typography>
                <ChevronRight size={18} color={Colors.light.textMuted} />
             </Pressable>
           ))}
        </View>

        {/* Live Support Banner */}
        <View style={styles.supportBanner}>
           <View style={{ flex: 1 }}>
              <Typography variant="h4" weight="800" color={Colors.light.white}>Talk to a Human</Typography>
              <Typography variant="body2" color={Colors.light.white} style={{ opacity: 0.8, marginTop: 4 }}>
                Available Mon-Sat, 9 AM - 8 PM
              </Typography>
           </View>
           <Pressable style={styles.chatBtn}>
              <Typography variant="body2" weight="800" color={Colors.light.primary}>CHAT NOW</Typography>
           </Pressable>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.surface },
  content: { padding: Spacing.lg },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.white,
    paddingHorizontal: Spacing.md,
    height: 54,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.xl,
    ...Shadows.light.sm,
  },
  searchInput: { flex: 1, marginLeft: Spacing.sm, fontSize: 16 },
  section: {
    backgroundColor: Colors.light.white,
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.lg,
    ...Shadows.light.sm,
  },
  contactGrid: { flexDirection: 'row', gap: Spacing.md },
  contactCard: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.xl,
  },
  faqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.surface,
  },
  catIcon: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center', alignItems: 'center',
  },
  supportBanner: {
    backgroundColor: Colors.light.primary,
    padding: Spacing.xl,
    borderRadius: BorderRadius.xxl,
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadows.light.md,
  },
  chatBtn: {
    backgroundColor: Colors.light.white,
    paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: BorderRadius.lg,
  },
});
