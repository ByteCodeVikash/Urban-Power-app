import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, FlatList, Pressable } from 'react-native';
import { Filter, ShoppingBag, Truck, Wrench, ChevronRight, Clock } from 'lucide-react-native';
import { Typography } from '../../components/Typography';
import { Header } from '../../components/Header';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';

const MOCK_ORDERS = [
  { id: '101', type: 'Service', item: 'Electrician (Switch Repair)', customer: 'Amit K.', amount: '450', status: 'In-Progress', time: '2m ago' },
  { id: '102', type: 'Shop', item: 'Professional Cleaning Kit', customer: 'Priya S.', amount: '1200', status: 'Shipped', time: '15m ago' },
  { id: '103', type: 'Kabadi', item: 'Metal & Paper Scrap', customer: 'Rohit T.', amount: '320', status: 'Scheduled', time: '1h ago' },
  { id: '104', type: 'Service', item: 'AC Deep Cleaning', customer: 'Suresh L.', amount: '2500', status: 'Completed', time: '3h ago' },
  { id: '105', type: 'Shop', item: 'Eco-friendly Paint 5L', customer: 'Meera G.', amount: '2499', status: 'Processing', time: '5h ago' },
];

export default function AdminOrderListScreen() {
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredOrders = MOCK_ORDERS.filter(o => activeFilter === 'All' || o.type === activeFilter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return Colors.light.success;
      case 'In-Progress': return Colors.light.primary;
      case 'Pending': case 'Processing': return Colors.light.warning;
      case 'Cancelled': return Colors.light.danger;
      default: return Colors.light.textMuted;
    }
  };

  const renderOrderItem = ({ item }: { item: typeof MOCK_ORDERS[0] }) => (
    <Pressable style={styles.orderCard}>
      <View style={styles.orderHeader}>
         <View style={[styles.typeBadge, { backgroundColor: item.type === 'Service' ? '#DBEAFE' : item.type === 'Shop' ? '#FDF2F8' : '#ECFDF5' }]}>
            {item.type === 'Service' ? <Wrench size={14} color="#1E40AF" /> : item.type === 'Shop' ? <ShoppingBag size={14} color="#9D174D" /> : <Truck size={14} color="#047857" />}
            <Typography variant="tiny" weight="800" color={item.type === 'Service' ? '#1E40AF' : item.type === 'Shop' ? '#9D174D' : '#047857'} style={{ marginLeft: 6 }}>
               {item.type.toUpperCase()}
            </Typography>
         </View>
         <Typography variant="caption" color={Colors.light.textMuted}>{item.time}</Typography>
      </View>

      <View style={styles.cardBody}>
         <View style={{ flex: 1 }}>
            <Typography variant="body1" weight="800">{item.item}</Typography>
            <Typography variant="body2" color={Colors.light.textSecondary}>Customer: {item.customer} • ID: #{item.id}</Typography>
         </View>
         <Typography variant="h4" weight="900" color={Colors.light.primary}>₹{item.amount}</Typography>
      </View>

      <View style={styles.cardFooter}>
         <View style={styles.statusRow}>
            <Clock size={12} color={getStatusColor(item.status)} />
            <Typography variant="tiny" weight="800" color={getStatusColor(item.status)} style={{ marginLeft: 6 }}>
               {item.status.toUpperCase()}
            </Typography>
         </View>
         <Pressable style={styles.detailsLink}>
            <Typography variant="tiny" weight="800" color={Colors.light.primary}>ORDER DETAILS</Typography>
            <ChevronRight size={14} color={Colors.light.primary} />
         </Pressable>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="All Orders" showBack />
      
      <View style={styles.filterBar}>
         <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {['All', 'Service', 'Shop', 'Kabadi'].map(filter => (
              <Pressable 
                key={filter} 
                onPress={() => setActiveFilter(filter)}
                style={[styles.filterChip, activeFilter === filter && styles.activeChip]}
              >
                 <Typography variant="body2" weight="700" color={activeFilter === filter ? Colors.light.white : Colors.light.textSecondary}>
                   {filter}
                 </Typography>
              </Pressable>
            ))}
         </ScrollView>
         <Pressable style={styles.iconBtn}>
            <Filter size={20} color={Colors.light.textMuted} />
         </Pressable>
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.surface },
  filterBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: Colors.light.white,
    paddingVertical: Spacing.md,
    paddingLeft: Spacing.lg,
    borderBottomWidth: 1, borderBottomColor: Colors.light.borderLight,
  },
  filterScroll: { paddingRight: Spacing.xl, gap: Spacing.sm },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.light.surface,
  },
  activeChip: { backgroundColor: Colors.light.primary },
  iconBtn: { padding: Spacing.md, marginRight: Spacing.sm },
  list: { padding: Spacing.lg },
  orderCard: {
    backgroundColor: Colors.light.white,
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.lg,
    ...Shadows.light.sm,
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  typeBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  cardBody: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 1, borderTopColor: Colors.light.surface,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  detailsLink: { flexDirection: 'row', alignItems: 'center' },
});
