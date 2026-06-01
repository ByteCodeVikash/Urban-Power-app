import React from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Wallet } from 'lucide-react-native';
import { Typography } from '../../components/Typography';
import { Header } from '../../components/Header';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';

export default function WalletScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header 
        title="Wallet" 
        leftComponent={
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft size={24} color={Colors.light.text} />
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.balanceCard}>
           <Typography variant="body2" color={Colors.light.white} style={{ opacity: 0.8 }}>Current Balance</Typography>
           <Typography variant="h1" weight="800" color={Colors.light.white}>₹0.00</Typography>
           <TouchableOpacity style={styles.addBtn}>
              <Typography variant="body2" weight="800" color={Colors.light.primary}>Add Money</Typography>
           </TouchableOpacity>
        </View>

        <View style={styles.section}>
           <Typography variant="h3" weight="800">Recent Transactions</Typography>
           <View style={styles.emptyState}>
              <Typography variant="body1" color={Colors.light.textMuted}>No transactions found.</Typography>
           </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.surface },
  content: { padding: Spacing.lg },
  backButton: { padding: 4 },
  balanceCard: {
    backgroundColor: Colors.light.primary,
    padding: 24,
    borderRadius: BorderRadius.xxl,
    alignItems: 'center',
    gap: 12,
    ...Shadows.light.md,
    marginBottom: Spacing.xl,
  },
  addBtn: {
    backgroundColor: Colors.light.white,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
    marginTop: 8,
  },
  section: {
    gap: Spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
});
