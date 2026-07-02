import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  User,
  Mail,
  Phone,
  Link,
  Save,
  X,
  AlertCircle,
} from 'lucide-react-native';
import { Typography } from '../../components/Typography';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';
import { useAuthStore } from '../../store/useAuthStore';

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const { user, updateProfile } = useAuthStore();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        newErrors.email = 'Please enter a valid email address';
      }
    } else {
      newErrors.email = 'Email address is required';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(phone.trim())) {
        newErrors.phone = 'Phone number must be a 10-digit number';
      }
    }

    if (profileImage.trim()) {
      const urlRegex = /^(http|https):\/\/[^ "]+$/;
      if (!urlRegex.test(profileImage.trim())) {
        newErrors.profileImage =
          'Please enter a valid image URL starting with http:// or https://';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    updateProfile({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      profileImage: profileImage.trim(),
    });

    navigation.goBack();
  };

  // Check if image URL looks valid enough to attempt rendering in preview
  const isValidImageUrl =
    profileImage.trim() &&
    (profileImage.trim().startsWith('http://') ||
      profileImage.trim().startsWith('https://'));

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Edit Profile"
        showBack={true}
        rightComponent={
          <Button
            title=""
            onPress={() => navigation.goBack()}
            variant="ghost"
            icon={<X size={20} color={Colors.light.textSecondary} />}
            style={styles.headerCloseBtn}
          />
        }
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* Avatar Preview */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              {isValidImageUrl ? (
                <Image
                  source={{ uri: profileImage.trim() }}
                  style={styles.avatar}
                  key={profileImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <User size={50} color={Colors.light.primary} />
                </View>
              )}
            </View>
            <Typography
              variant="caption"
              color={Colors.light.textSecondary}
              style={{ marginTop: Spacing.sm }}
            >
              Image Preview
            </Typography>
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
            {/* Full Name Field */}
            <View style={styles.fieldContainer}>
              <Typography
                variant="body2"
                weight="700"
                color={Colors.light.textSecondary}
                style={styles.label}
              >
                Full Name
              </Typography>
              <View
                style={[
                  styles.inputWrapper,
                  errors.name ? styles.inputErrorBorder : null,
                ]}
              >
                <User
                  size={20}
                  color={Colors.light.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter full name"
                  value={name}
                  onChangeText={text => {
                    setName(text);
                    if (errors.name) {
                      setErrors(prev => ({ ...prev, name: '' }));
                    }
                  }}
                  placeholderTextColor={Colors.light.textMuted}
                />
              </View>
              {errors.name ? (
                <View style={styles.errorContainer}>
                  <AlertCircle size={14} color={Colors.light.error} />
                  <Typography
                    variant="caption"
                    color={Colors.light.error}
                    style={styles.errorText}
                  >
                    {errors.name}
                  </Typography>
                </View>
              ) : null}
            </View>

            {/* Email Field */}
            <View style={styles.fieldContainer}>
              <Typography
                variant="body2"
                weight="700"
                color={Colors.light.textSecondary}
                style={styles.label}
              >
                Email Address
              </Typography>
              <View
                style={[
                  styles.inputWrapper,
                  errors.email ? styles.inputErrorBorder : null,
                ]}
              >
                <Mail
                  size={20}
                  color={Colors.light.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter email address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={text => {
                    setEmail(text);
                    if (errors.email) {
                      setErrors(prev => ({ ...prev, email: '' }));
                    }
                  }}
                  placeholderTextColor={Colors.light.textMuted}
                />
              </View>
              {errors.email ? (
                <View style={styles.errorContainer}>
                  <AlertCircle size={14} color={Colors.light.error} />
                  <Typography
                    variant="caption"
                    color={Colors.light.error}
                    style={styles.errorText}
                  >
                    {errors.email}
                  </Typography>
                </View>
              ) : null}
            </View>

            {/* Phone Field */}
            <View style={styles.fieldContainer}>
              <Typography
                variant="body2"
                weight="700"
                color={Colors.light.textSecondary}
                style={styles.label}
              >
                Phone Number
              </Typography>
              <View
                style={[
                  styles.inputWrapper,
                  errors.phone ? styles.inputErrorBorder : null,
                ]}
              >
                <Phone
                  size={20}
                  color={Colors.light.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter 10-digit mobile number"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phone}
                  onChangeText={text => {
                    setPhone(text);
                    if (errors.phone) {
                      setErrors(prev => ({ ...prev, phone: '' }));
                    }
                  }}
                  placeholderTextColor={Colors.light.textMuted}
                />
              </View>
              {errors.phone ? (
                <View style={styles.errorContainer}>
                  <AlertCircle size={14} color={Colors.light.error} />
                  <Typography
                    variant="caption"
                    color={Colors.light.error}
                    style={styles.errorText}
                  >
                    {errors.phone}
                  </Typography>
                </View>
              ) : null}
            </View>

            {/* Profile Image URL Field */}
            <View style={styles.fieldContainer}>
              <Typography
                variant="body2"
                weight="700"
                color={Colors.light.textSecondary}
                style={styles.label}
              >
                Profile Image URL
              </Typography>
              <View
                style={[
                  styles.inputWrapper,
                  errors.profileImage ? styles.inputErrorBorder : null,
                ]}
              >
                <Link
                  size={20}
                  color={Colors.light.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter image URL (http://... or https://...)"
                  autoCapitalize="none"
                  value={profileImage}
                  onChangeText={text => {
                    setProfileImage(text);
                    if (errors.profileImage) {
                      setErrors(prev => ({ ...prev, profileImage: '' }));
                    }
                  }}
                  placeholderTextColor={Colors.light.textMuted}
                />
              </View>
              {errors.profileImage ? (
                <View style={styles.errorContainer}>
                  <AlertCircle size={14} color={Colors.light.error} />
                  <Typography
                    variant="caption"
                    color={Colors.light.error}
                    style={styles.errorText}
                  >
                    {errors.profileImage}
                  </Typography>
                </View>
              ) : null}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.btnRow}>
            <Button
              title="Cancel"
              onPress={() => navigation.goBack()}
              variant="outline"
              size="lg"
              style={styles.actionBtn}
            />
            <Button
              title="Save Changes"
              onPress={handleSave}
              variant="primary"
              size="lg"
              style={[styles.actionBtn, styles.saveBtn]}
              icon={<Save size={18} color={Colors.light.white} />}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  },
  headerCloseBtn: {
    padding: 0,
    height: 'auto',
    backgroundColor: 'transparent',
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  avatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.light.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.light.sm,
    borderWidth: 3,
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
  form: {
    gap: Spacing.lg,
  },
  fieldContainer: {},
  label: {
    marginBottom: Spacing.xs,
    marginLeft: 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.white,
    borderRadius: BorderRadius.lg,
    height: 54,
    borderWidth: 1,
    borderColor: Colors.light.border,
    paddingHorizontal: Spacing.md,
  },
  inputErrorBorder: {
    borderColor: Colors.light.error,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    height: '100%',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
    marginLeft: 2,
    gap: 4,
  },
  errorText: {
    flex: 1,
  },
  btnRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  actionBtn: {
    flex: 1,
    borderRadius: BorderRadius.lg,
  },
  saveBtn: {},
});
