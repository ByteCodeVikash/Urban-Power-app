import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, FlatList, Pressable, TextInput } from 'react-native';
import { Users, UserCheck, ShieldAlert, Search, ChevronRight, UserMinus } from 'lucide-react-native';
import { Typography } from '../../components/Typography';
import { Header } from '../../components/Header';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';

const MOCK_USERS = [
  { id: '1', name: 'Vikash Kumar', role: 'Customer', status: 'Active', joined: 'Oct 2023', bookings: 12 },
  { id: '2', name: 'Ramesh Kumar', role: 'Partner', status: 'Verified', joined: 'Sep 2023', rating: 4.8 },
  { id: '3', name: 'Alok Singh', role: 'Partner', status: 'Blocked', joined: 'Aug 2023', rating: 3.2 },
  { id: '4', name: 'Sneha Rao', role: 'Customer', status: 'Active', joined: 'Oct 2023', bookings: 5 },
];

export default function AdminUserManagementScreen() {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = MOCK_USERS.filter(u => 
    (activeTab === 'All' || u.role === activeTab) &&
    u.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderUserItem = ({ item }: { item: typeof MOCK_USERS[0] }) => (
    <View style={styles.userCard}>
      <View style={styles.avatar}>
         <Typography variant="h3" weight="800" color={Colors.light.white}>{item.name[0]}</Typography>
      </View>
      <View style={{ flex: 1, marginLeft: Spacing.md }}>
         <Typography variant="body1" weight="800">{item.name}</Typography>
         <Typography variant="caption" color={Colors.light.textMuted}>{item.role} • Joined {item.joined}</Typography>
         <View style={styles.badgeRow}>
            <View style={[styles.statusBadge, item.status === 'Active' || item.status === 'Verified' ? styles.activeBadge : styles.blockedBadge]}>
               <Typography variant="tiny" weight="800" color={item.status === 'Blocked' ? Colors.light.danger : Colors.light.success}>
                 {item.status.toUpperCase()}
               </Typography>
            </View>
            {item.role === 'Partner' && (
              <Typography variant="tiny" weight="700" style={{ marginLeft: 8 }}>⭐ {item.rating}</Typography>
            )}
         </View>
      </View>
      <View style={styles.actions}>
         {item.status === 'Blocked' ? (
           <Pressable style={styles.iconAction}><UserCheck size={18} color={Colors.light.success} /></Pressable>
         ) : (
           <Pressable style={styles.iconAction}><UserMinus size={18} color={Colors.light.danger} /></Pressable>
         )}
         <ChevronRight size={18} color={Colors.light.textMuted} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="User Management" showBack />
      
      <View style={styles.searchContainer}>
         <View style={styles.searchBar}>
            <Search size={18} color={Colors.light.textMuted} />
            <TextInput 
              style={styles.searchInput} 
              placeholder="Search Users, Partners, ID..." 
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
         </View>
      </View>

      <View style={styles.tabs}>
         {['All', 'Customer', 'Partner'].map(tab => (
           <Pressable 
             key={tab} 
             onPress={() => setActiveTab(tab)}
             style={[styles.tab, activeTab === tab && styles.activeTab]}
           >
              <Typography variant="body2" weight="700" color={activeTab === tab ? Colors.light.white : Colors.light.textSecondary}>
                {tab}
              </Typography>
           </Pressable>
         ))}
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={renderUserItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
             <ShieldAlert size={60} color={Colors.light.border} />
             <Typography variant="body1" weight="700" style={{ marginTop: Spacing.md }}>No users found</Typography>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.surface },
  searchContainer: { padding: Spacing.lg, backgroundColor: Colors.light.white },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    paddingHorizontal: Spacing.md,
    height: 48,
    borderRadius: BorderRadius.lg,
  },
  searchInput: { flex: 1, marginLeft: Spacing.sm, fontSize: 16 },
  tabs: {
    flexDirection: 'row',
    padding: Spacing.lg,
    gap: Spacing.sm,
    backgroundColor: Colors.light.white,
    borderBottomWidth: 1, borderBottomColor: Colors.light.borderLight,
  },
  tab: {
    paddingHorizontal: 20, paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.light.surface,
  },
  activeTab: { backgroundColor: Colors.light.primary },
  list: { padding: Spacing.lg },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.white,
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.lg,
    ...Shadows.light.sm,
  },
  avatar: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  badgeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  activeBadge: { backgroundColor: '#ECFDF5' },
  blockedBadge: { backgroundColor: '#FEF2F2' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  iconAction: {
    width: 36, height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.surface,
    justifyContent: 'center', alignItems: 'center',
  },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
});
