import React from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Calendar } from 'lucide-react-native';
import { Typography } from '../../components/Typography';
import { Header } from '../../components/Header';
import { Colors, Spacing, BorderRadius } from '../../constants/Theme';

export default function MyBookingsScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header 
        title="My Bookings" 
        leftComponent={
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft size={24} color={Colors.light.text} />
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.emptyState}>
           <Calendar size={60} color={Colors.light.textMuted} />
           <Typography variant="h3" weight="800">No Bookings Yet</Typography>
           <Typography variant="body1" color={Colors.light.textSecondary} align="center">
             You haven't booked any services yet. Start exploring our services today!
           </Typography>
           <TouchableOpacity 
             style={styles.bookBtn}
             onPress={() => navigation.navigate('Home' as any)}
           >
              <Typography variant="body1" weight="800" color={Colors.light.white}>Book a Service</Typography>
           </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.surface },
  content: { flexGrow: 1, justifyContent: 'center' },
  backButton: { padding: 4 },
  emptyState: {
    padding: Spacing.xl,
    alignItems: 'center',
    gap: 16,
  },
  bookBtn: {
    marginTop: Spacing.xl,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: BorderRadius.full,
  },
});
