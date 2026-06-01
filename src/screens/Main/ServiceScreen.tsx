import React from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, Pressable, Image } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Typography } from '../../components/Typography';
import { Header } from '../../components/Header';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';
import { Button } from '../../components/Button';
import { ChevronRight, Star, Clock, ShieldCheck } from 'lucide-react-native';

export default function ServiceScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { categoryId, categoryName } = route.params || { categoryId: 'c1', categoryName: 'Service' };

  const mockServices = [
    { id: 's1', title: `Standard ${categoryName}`, price: '₹499', rating: 4.8, time: '60 min' },
    { id: 's2', title: `Premium ${categoryName}`, price: '₹899', rating: 4.9, time: '90 min' },
    { id: 's3', title: `Deep ${categoryName}`, price: '₹1299', rating: 4.7, time: '120 min' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title={categoryName} />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.heroSection}>
          <Typography variant="h2" weight="800" style={styles.title}>
            Professional {categoryName} Services
          </Typography>
          <Typography variant="body1" color={Colors.light.textSecondary} style={styles.subtitle}>
            Book top-rated professionals for your home needs.
          </Typography>
        </View>

        <View style={styles.trustSection}>
          <View style={styles.trustItem}>
            <Star size={20} color="#F59E0B" fill="#F59E0B" />
            <Typography variant="tiny" weight="700" style={{ marginTop: 4 }}>4.8+ Rated</Typography>
          </View>
          <View style={styles.trustItem}>
            <ShieldCheck size={20} color="#10B981" />
            <Typography variant="tiny" weight="700" style={{ marginTop: 4 }}>Verified</Typography>
          </View>
          <View style={styles.trustItem}>
            <Clock size={20} color="#6366F1" />
            <Typography variant="tiny" weight="700" style={{ marginTop: 4 }}>Fast Booking</Typography>
          </View>
        </View>

        <View style={styles.servicesList}>
          {mockServices.map((service) => (
            <Pressable 
              key={service.id} 
              style={styles.serviceCard}
              onPress={() => navigation.navigate('ServiceBookingScreen', { categoryId, categoryName })}
            >
              <View style={styles.serviceInfo}>
                <Typography variant="h4" weight="800">{service.title}</Typography>
                <View style={styles.serviceMeta}>
                  <Typography variant="body2" color={Colors.light.textSecondary}>{service.time} • {service.rating} ★</Typography>
                </View>
                <Typography variant="h4" color={Colors.light.primary} weight="900" style={{ marginTop: 8 }}>
                  {service.price}
                </Typography>
              </View>
              <Button 
                title="Add" 
                variant="outline" 
                size="sm" 
                onPress={() => navigation.navigate('ServiceBookingScreen', { categoryId, categoryName })}
                style={styles.addButton}
              />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.white },
  content: { paddingBottom: 40 },
  heroSection: { padding: Spacing.xl, backgroundColor: Colors.light.surfaceAlt },
  title: { marginBottom: Spacing.xs },
  subtitle: { opacity: 0.8 },
  trustSection: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  trustItem: { alignItems: 'center' },
  servicesList: { padding: Spacing.lg },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.white,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.md,
    ...Shadows.light.sm,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  serviceInfo: { flex: 1 },
  serviceMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  addButton: { width: 80 },
});
