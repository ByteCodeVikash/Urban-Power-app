import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Pressable,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {
  Filter,
  Truck,
  Wrench,
  ChevronRight,
  Clock,
} from 'lucide-react-native';
import { Typography } from '../../components/Typography';
import { Header } from '../../components/Header';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';
import { api } from '../../services/api';

export default function AdminOrderListScreen() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const response = await api.admin.getOrders();
      if (response && response.items) {
        setOrders(response.items);
      }
    } catch (error) {
      console.error('Error fetching admin orders:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const filteredOrders = orders.filter(o => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Kabadi') return o.booking_type === 'scrap';
    if (activeFilter === 'Service')
      return (
        o.booking_type === 'maintenance' || o.booking_type === 'beautician'
      );
    return false;
  });

  const getStatusColor = (status: string) => {
    const s = status ? status.toLowerCase() : '';
    switch (s) {
      case 'completed':
        return Colors.light.success;
      case 'in_progress':
      case 'assigned':
        return Colors.light.primary;
      case 'pending':
      case 'requested':
      case 'confirmed':
      case 'accepted':
      case 'processing':
        return Colors.light.warning;
      case 'cancelled':
        return Colors.light.danger;
      default:
        return Colors.light.textMuted;
    }
  };

  const renderOrderItem = ({ item }: { item: any }) => {
    const uiType = item.booking_type === 'scrap' ? 'Kabadi' : 'Service';
    const timeStr = item.created_at
      ? new Date(item.created_at).toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '';

    return (
      <Pressable style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View
            style={[
              styles.typeBadge,
              {
                backgroundColor: uiType === 'Service' ? '#DBEAFE' : '#ECFDF5',
              },
            ]}
          >
            {uiType === 'Service' ? (
              <Wrench size={14} color="#1E40AF" />
            ) : (
              <Truck size={14} color="#047857" />
            )}
            <Typography
              variant="tiny"
              weight="800"
              color={uiType === 'Service' ? '#1E40AF' : '#047857'}
              style={{ marginLeft: 6 }}
            >
              {uiType.toUpperCase()}
            </Typography>
          </View>
          <Typography variant="caption" color={Colors.light.textMuted}>
            {timeStr}
          </Typography>
        </View>

        <View style={styles.cardBody}>
          <View style={{ flex: 1 }}>
            <Typography variant="body1" weight="800">
              {item.service_name || 'General scrap pickup'}
            </Typography>
            <Typography variant="body2" color={Colors.light.textSecondary}>
              Customer: {item.customer_name || 'Customer'} • Ref:{' '}
              {item.booking_reference}
            </Typography>
          </View>
          <Typography variant="h4" weight="900" color={Colors.light.primary}>
            ₹{item.price || 0}
          </Typography>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.statusRow}>
            <Clock size={12} color={getStatusColor(item.status)} />
            <Typography
              variant="tiny"
              weight="800"
              color={getStatusColor(item.status)}
              style={{ marginLeft: 6 }}
            >
              {item.status.toUpperCase()}
            </Typography>
          </View>
          <Pressable style={styles.detailsLink}>
            <Typography
              variant="tiny"
              weight="800"
              color={Colors.light.primary}
            >
              ORDER DETAILS
            </Typography>
            <ChevronRight size={14} color={Colors.light.primary} />
          </Pressable>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="All Orders" showBack />

      <View style={styles.filterBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {['All', 'Service', 'Kabadi'].map(filter => (
            <Pressable
              key={filter}
              onPress={() => setActiveFilter(filter)}
              style={[
                styles.filterChip,
                activeFilter === filter && styles.activeChip,
              ]}
            >
              <Typography
                variant="body2"
                weight="700"
                color={
                  activeFilter === filter
                    ? Colors.light.white
                    : Colors.light.textSecondary
                }
              >
                {filter}
              </Typography>
            </Pressable>
          ))}
        </ScrollView>
        <Pressable style={styles.iconBtn}>
          <Filter size={20} color={Colors.light.textMuted} />
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={item => item.booking_id}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Typography variant="body1" color={Colors.light.textMuted}>
                No orders found
              </Typography>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.surface },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { padding: Spacing.xl, alignItems: 'center' },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.white,
    paddingVertical: Spacing.md,
    paddingLeft: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  filterScroll: { paddingRight: Spacing.xl, gap: Spacing.sm },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
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
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.light.surface,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  detailsLink: { flexDirection: 'row', alignItems: 'center' },
});
