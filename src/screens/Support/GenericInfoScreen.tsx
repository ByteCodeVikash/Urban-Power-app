import React from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft, Info } from 'lucide-react-native';
import { Typography } from '../../components/Typography';
import { Header } from '../../components/Header';
import { Colors, Spacing } from '../../constants/Theme';

export default function GenericInfoScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Format route name to Title Case
  const title = route.name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header 
        title={title} 
        leftComponent={
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft size={24} color={Colors.light.text} />
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.center}>
           <Info size={48} color={Colors.light.primary} />
           <Typography variant="h3" weight="800" style={{ marginTop: 16 }}>{title}</Typography>
           <Typography variant="body1" color={Colors.light.textSecondary} align="center" style={{ marginTop: 8 }}>
             This section is coming soon. We are working hard to bring you more features!
           </Typography>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.surface },
  content: { flexGrow: 1, justifyContent: 'center', padding: Spacing.xl },
  backButton: { padding: 4 },
  center: { alignItems: 'center' },
});
