import React from 'react';
import { View, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/Types';
import { Header } from '../../components/Header';
import { Typography } from '../../components/Typography';
import { Button } from '../../components/Button';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';
import { Hourglass, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ComingSoonScreen() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Coming Soon" showBack />
      <View style={styles.container}>
        <View style={styles.cardContainer}>
          {/* Decorative Back Light / Glow effect */}
          <View style={styles.glowBg} />

          {/* Illustration Container */}
          <LinearGradient
            colors={['#8B5CF6', '#6D28D9']}
            style={styles.illustrationContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.iconCircle}>
              <Hourglass
                color={Colors.light.white}
                size={50}
                strokeWidth={1.5}
              />
            </View>
            <View style={styles.sparkle1}>
              <Sparkles color="#FBBF24" size={24} />
            </View>
            <View style={styles.sparkle2}>
              <Sparkles color="#34D399" size={16} />
            </View>
          </LinearGradient>

          {/* Texts */}
          <Typography
            variant="h2"
            weight="800"
            color={Colors.light.text}
            align="center"
            style={styles.title}
          >
            Coming Soon
          </Typography>

          <Typography
            variant="body1"
            weight="500"
            color={Colors.light.textSecondary}
            align="center"
            style={styles.description}
          >
            This service will be available soon. Stay tuned for future updates.
          </Typography>

          {/* Action Button */}
          <Button
            title="Back"
            onPress={() => navigation.goBack()}
            variant="primary"
            size="lg"
            style={styles.button}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.surface,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  cardContainer: {
    width: '100%',
    maxWidth: width - 48,
    backgroundColor: Colors.light.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    ...Shadows.light.md,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  glowBg: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#C084FC',
    opacity: 0.15,
  },
  illustrationContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    position: 'relative',
    ...Shadows.light.sm,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  sparkle1: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  sparkle2: {
    position: 'absolute',
    bottom: 15,
    left: 10,
  },
  title: {
    marginBottom: Spacing.sm,
    color: '#1F2937',
  },
  description: {
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.sm,
    color: '#4B5563',
    lineHeight: 22,
  },
  button: {
    width: '100%',
    borderRadius: BorderRadius.lg,
  },
});
