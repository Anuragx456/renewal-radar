import React, { useCallback } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { borderRadius, colors, spacing, typography } from "@/theme/tokens";

type ButtonVariant = "primary" | "secondary" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  accessibilityLabel?: string;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon,
  accessibilityLabel,
}: ButtonProps) {
  const handlePress = useCallback(() => {
    if (!loading && !disabled) {
      onPress();
    }
  }, [loading, disabled, onPress]);

  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      style={({ pressed }) => [
        styles.base,
        styles[`variant_${variant}`],
        styles[`size_${size}`],
        pressed && !isDisabled && styles[`pressed_${variant}`],
        isDisabled && styles.disabled,
      ]}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === "secondary" ? colors.primary : colors.textInverse}
          />
        ) : (
          <>
            {icon && <View style={styles.icon}>{icon}</View>}
            <Text
              style={[
                styles[`text_${variant}`],
                styles[`textSize_${size}`],
                isDisabled && styles.textDisabled,
              ]}
            >
              {title}
            </Text>
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: borderRadius.md,
  },

  // Variants
  variant_primary: {
    backgroundColor: colors.primary,
  },
  variant_secondary: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  variant_danger: {
    backgroundColor: colors.danger,
  },

  // Pressed states
  pressed_primary: {
    backgroundColor: colors.primaryDark,
  },
  pressed_secondary: {
    backgroundColor: colors.primary + "0F", // 6% opacity
  },
  pressed_danger: {
    backgroundColor: colors.dangerLight,
  },

  // Sizes
  size_sm: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    minHeight: 32,
  },
  size_md: {
    paddingVertical: spacing.md - 2,
    paddingHorizontal: spacing.lg,
    minHeight: 44,
  },
  size_lg: {
    paddingVertical: spacing.lg - 2,
    paddingHorizontal: spacing.xl,
    minHeight: 52,
  },

  // Disabled
  disabled: {
    opacity: 0.5,
  },

  // Content layout
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  icon: {
    marginRight: spacing.xs,
  },

  // Text variants
  text_primary: {
    color: colors.textInverse,
    fontWeight: "600",
  },
  text_secondary: {
    color: colors.primary,
    fontWeight: "600",
  },
  text_danger: {
    color: colors.textInverse,
    fontWeight: "600",
  },

  // Text sizes
  textSize_sm: {
    ...typography.captionBold,
  },
  textSize_md: {
    ...typography.bodyBold,
  },
  textSize_lg: {
    fontSize: 17,
    fontWeight: "600",
    lineHeight: 22,
  },

  textDisabled: {
    opacity: 0.7,
  },
});
