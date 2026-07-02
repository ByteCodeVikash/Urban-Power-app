import React from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { User, Mail, Phone, Shield, Edit3 } from 'lucide-react-native';
import { Typography } from '../../components/Typography';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';
import { useAuthStore } from '../../store/useAuthStore';

export default function AccountDetailScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'Admin':
        return Colors.light.error; // Red
      case 'Technician':
        return Colors.light.primary; // Indigo/Purple
      default:
        return Colors.light.success; // Green for Customer
    }
  };

  const getRoleBg = (role?: string) => {
    switch (role) {
      case 'Admin':
        return '#FEE2E2'; // Very light red
      case 'Technician':
        return Colors.light.primaryLight; // Very light purple
      default:
        return '#ECFDF5'; // Very light green
    }
  };

  const detailItems = [
    {
      id: 'name',
      label: 'Full Name',
      value: user?.name || 'Not provided',
      icon: User,
    },
    {
      id: 'email',
      label: 'Email Address',
      value: user?.email || 'Not provided',
      icon: Mail,
    },
    {
      id: 'phone',
      label: 'Phone Number',
      value: user?.phone ? `+91 ${user.phone}` : 'Not provided',
      icon: Phone,
    },
    {
      id: 'role',
      label: 'Account Role',
      value: user?.role || 'Customer',
      icon: Shield,
      isRole: true,
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Account Details"
        showBack={true}
        rightComponent={
          <Button
            title=""
            onPress={() => navigation.navigate('EditProfile')}
            variant="ghost"
            icon={<Edit3 size={20} color={Colors.light.primary} />}
            style={styles.headerEditBtn}
          />
        }
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            {user?.profileImage ? (
              <Image
                source={{ uri: user.profileImage }}
                style={styles.avatar}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <User size={50} color={Colors.light.primary} />
              </View>
            )}
          </View>
          <Typography variant="h2" weight="800" style={styles.userName}>
            {user?.name || 'User Name'}
          </Typography>
          <View
            style={[
              styles.roleBadge,
              { backgroundColor: getRoleBg(user?.role) },
            ]}
          >
            <Typography
              variant="caption"
              weight="800"
              color={getRoleColor(user?.role)}
            >
              {user?.role?.toUpperCase() || 'CUSTOMER'}
            </Typography>
          </View>
        </View>

        {/* Details Card */}
        <View style={styles.card}>
          {detailItems.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.detailRow,
                index === detailItems.length - 1 && styles.lastRow,
              ]}
            >
              <View style={styles.iconContainer}>
                <item.icon size={22} color={Colors.light.textSecondary} />
              </View>
              <View style={styles.infoContainer}>
                <Typography variant="caption" color={Colors.light.textMuted}>
                  {item.label}
                </Typography>
                <Typography
                  variant="body1"
                  weight="600"
                  style={styles.valueText}
                >
                  {item.value}
                </Typography>
              </View>
            </View>
          ))}
        </View>

        {/* Action Button */}
        <Button
          title="Edit Profile"
          onPress={() => navigation.navigate('EditProfile')}
          variant="primary"
          size="lg"
          style={styles.editButton}
          icon={<Edit3 size={18} color={Colors.light.white} />}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.surface,
  },
  content: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  headerEditBtn: {
    padding: 0,
    height: 'auto',
    backgroundColor: 'transparent',
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  avatarWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.light.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.light.md,
    borderWidth: 4,
    borderColor: Colors.light.white,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.primaryLight,
  },
  userName: {
    marginTop: Spacing.md,
    color: Colors.light.text,
  },
  roleBadge: {
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs - 2,
    borderRadius: BorderRadius.full,
  },
  card: {
    width: '100%',
    backgroundColor: Colors.light.white,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    ...Shadows.light.sm,
    marginBottom: Spacing.xl,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.light.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  infoContainer: {
    flex: 1,
  },
  valueText: {
    color: Colors.light.text,
    marginTop: 2,
  },
  editButton: {
    width: '100%',
    borderRadius: BorderRadius.lg,
  },
});
