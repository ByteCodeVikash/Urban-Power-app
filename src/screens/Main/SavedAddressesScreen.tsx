import React from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, Pressable, FlatList } from 'react-native';
import { MapPin, Plus, MoreVertical, Home, Briefcase, Map } from 'lucide-react-native';
import { Typography } from '../../components/Typography';
import { Header } from '../../components/Header';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';

const MOCK_ADDRESSES = [
  { id: '1', type: 'Home', details: 'Flat 402, Green Valley Apartments, HSR Layout, Sector 2, Bangalore, 560102', isDefault: true },
  { id: '2', type: 'Work', details: 'Techno Park, Tower B, 4th Floor, Electronic City Ph 1, Bangalore, 560100', isDefault: false },
  { id: '3', type: 'Other', details: 'House No 12, Lane 4, Indiranagar, Bangalore, 560038', isDefault: false },
];

export default function SavedAddressesScreen() {
  const renderAddressItem = ({ item }: { item: typeof MOCK_ADDRESSES[0] }) => (
    <View style={styles.addressCard}>
      <View style={styles.addressIcon}>
         {item.type === 'Home' ? <Home size={20} color={Colors.light.primary} /> : 
          item.type === 'Work' ? <Briefcase size={20} color={Colors.light.primary} /> : 
          <MapPin size={20} color={Colors.light.primary} />}
      </View>
      <View style={{ flex: 1, marginLeft: Spacing.md }}>
         <View style={styles.cardHeader}>
            <Typography variant="body1" weight="800">{item.type}</Typography>
            {item.isDefault && (
              <View style={styles.defaultBadge}>
                 <Typography variant="tiny" weight="800" color={Colors.light.success}>DEFAULT</Typography>
              </View>
            )}
         </View>
         <Typography variant="body2" color={Colors.light.textSecondary} style={{ marginTop: 4 }}>
            {item.details}
         </Typography>
         
         <View style={styles.cardActions}>
            <Pressable style={styles.actionLink}><Typography variant="body2" weight="700" color={Colors.light.primary}>Edit</Typography></Pressable>
            <Pressable style={[styles.actionLink, { marginLeft: Spacing.xl }]}><Typography variant="body2" weight="700" color={Colors.light.danger}>Delete</Typography></Pressable>
         </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Saved Addresses" showBack />
      
      <View style={styles.container}>
         <Pressable style={styles.addNew}>
            <View style={styles.plusIcon}>
               <Plus size={24} color={Colors.light.primary} />
            </View>
            <Typography variant="body1" weight="800" color={Colors.light.primary}>Add New Address</Typography>
         </Pressable>

         <FlatList
           data={MOCK_ADDRESSES}
           keyExtractor={(item) => item.id}
           renderItem={renderAddressItem}
           contentContainerStyle={styles.list}
           showsVerticalScrollIndicator={false}
         />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.surface },
  container: { flex: 1, padding: Spacing.lg },
  addNew: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.white,
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.light.primary,
  },
  plusIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center', alignItems: 'center',
    marginRight: Spacing.md,
  },
  list: { paddingBottom: 40 },
  addressCard: {
    flexDirection: 'row',
    backgroundColor: Colors.light.white,
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.lg,
    ...Shadows.light.sm,
  },
  addressIcon: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: Colors.light.surface,
    justifyContent: 'center', alignItems: 'center',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  defaultBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 4,
  },
  cardActions: { flexDirection: 'row', marginTop: Spacing.lg },
  actionLink: { paddingVertical: 4 },
});
