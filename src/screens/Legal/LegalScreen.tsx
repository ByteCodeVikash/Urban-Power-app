/**
 * LegalScreen — Shared base component for all legal pages.
 * Pass `title`, `lastUpdated`, and `sections` to render a consistent,
 * scrollable legal document screen.
 */
import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { Typography } from '../../components/Typography';
import { Header } from '../../components/Header';
import { Colors, Spacing, BorderRadius } from '../../constants/Theme';

export interface LegalSection {
  heading: string;
  body: string | string[]; // string for single paragraph, string[] for multiple
}

interface LegalScreenProps {
  title: string;
  lastUpdated: string;
  intro?: string;
  sections: LegalSection[];
}

export default function LegalScreen({
  title,
  lastUpdated,
  intro,
  sections,
}: LegalScreenProps) {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={title}
        leftComponent={
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            hitSlop={8}
          >
            <ChevronLeft size={24} color={Colors.light.text} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Last Updated Badge */}
        <View style={styles.updatedBadge}>
          <Typography
            variant="caption"
            color={Colors.light.primary}
            weight="600"
          >
            Last Updated: {lastUpdated}
          </Typography>
        </View>

        {/* Page Title */}
        <Typography variant="h2" weight="800" style={styles.pageTitle}>
          {title}
        </Typography>

        {/* Intro paragraph */}
        {intro ? (
          <Typography
            variant="body1"
            color={Colors.light.textSecondary}
            style={styles.intro}
          >
            {intro}
          </Typography>
        ) : null}

        {/* Divider */}
        <View style={styles.divider} />

        {/* Sections */}
        {sections.map((section, index) => (
          <View key={index} style={styles.section}>
            {/* Section number + heading */}
            <View style={styles.headingRow}>
              <View style={styles.numberBadge}>
                <Typography
                  variant="tiny"
                  color={Colors.light.white}
                  weight="800"
                >
                  {index + 1}
                </Typography>
              </View>
              <Typography
                variant="h4"
                weight="700"
                style={styles.sectionHeading}
              >
                {section.heading}
              </Typography>
            </View>

            {/* Body — supports single string or array of paragraphs */}
            {Array.isArray(section.body) ? (
              section.body.map((paragraph, pIndex) => (
                <Typography
                  key={pIndex}
                  variant="body2"
                  color={Colors.light.textSecondary}
                  style={[
                    styles.sectionBody,
                    pIndex < section.body.length - 1 && styles.paragraphGap,
                  ]}
                >
                  {paragraph}
                </Typography>
              ))
            ) : (
              <Typography
                variant="body2"
                color={Colors.light.textSecondary}
                style={styles.sectionBody}
              >
                {section.body}
              </Typography>
            )}
          </View>
        ))}

        {/* Footer */}
        <View style={styles.footer}>
          <Typography
            variant="caption"
            color={Colors.light.textMuted}
            align="center"
          >
            © {new Date().getFullYear()} Urban Power. All rights reserved.
          </Typography>
          <Typography
            variant="caption"
            color={Colors.light.textMuted}
            align="center"
            style={{ marginTop: 4 }}
          >
            Urban Power Services Pvt. Ltd., India
          </Typography>
        </View>
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
    paddingBottom: 60,
  },
  backButton: {
    padding: 4,
  },
  updatedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.light.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.md,
  },
  pageTitle: {
    marginBottom: Spacing.sm,
    color: Colors.light.text,
  },
  intro: {
    lineHeight: 24,
    marginBottom: Spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginVertical: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  numberBadge: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
    flexShrink: 0,
  },
  sectionHeading: {
    flex: 1,
    color: Colors.light.text,
  },
  sectionBody: {
    lineHeight: 22,
  },
  paragraphGap: {
    marginBottom: Spacing.sm,
  },
  footer: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
});
