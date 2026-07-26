import React from "react";
import { Pressable, StyleSheet, View, ViewStyle } from "react-native";
import { borderRadius, colors, shadows, spacing } from "@/theme/tokens";

interface CardProps {
  children: React.ReactNode;
  variant?: "default" | "elevated";
  onPress?: () => void;
  style?: ViewStyle;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  accessibilityLabel?: string;
}

export function Card({
  children,
  variant = "default",
  onPress,
  style,
  header,
  footer,
  accessibilityLabel,
}: CardProps) {
  const containerStyle = [
    styles.base,
    variant === "elevated" && shadows.md,
    variant === "elevated" && styles.elevated,
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        style={({ pressed }) => [...containerStyle, pressed && styles.pressed]}
      >
        {header && <View style={styles.header}>{header}</View>}
        <View style={styles.body}>{children}</View>
        {footer && <View style={styles.footer}>{footer}</View>}
      </Pressable>
    );
  }

  return (
    <View style={containerStyle}>
      {header && <View style={styles.header}>{header}</View>}
      <View style={styles.body}>{children}</View>
      {footer && <View style={styles.footer}>{footer}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  elevated: {
    borderColor: "transparent",
  },
  pressed: {
    opacity: 0.94,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  body: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
});
