import { Text, View, StyleSheet } from "react-native";
import { colors, typography } from "@/theme/tokens";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Renewal Radar</Text>
      <Text style={styles.subtitle}>Track your subscriptions and renewals</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    padding: 20,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
