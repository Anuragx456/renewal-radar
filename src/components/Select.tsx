import React, { useState, useCallback } from "react";
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { borderRadius, colors, spacing, typography } from "@/theme/tokens";

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  label?: string;
  value: string | null;
  options: SelectOption[];
  onSelect: (value: string) => void;
  placeholder?: string;
  error?: string;
  accessibilityLabel?: string;
}

export function Select({
  label,
  value,
  options,
  onSelect,
  placeholder = "Select...",
  error,
  accessibilityLabel,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = useCallback(() => setIsOpen(true), []);
  const handleClose = useCallback(() => setIsOpen(false), []);

  const handleSelect = useCallback(
    (selectedValue: string) => {
      onSelect(selectedValue);
      handleClose();
    },
    [onSelect, handleClose],
  );

  const selectedOption = options.find((opt) => opt.value === value);
  const hasError = error !== undefined && error.length > 0;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Pressable
        onPress={handleOpen}
        style={({ pressed }) => [
          styles.trigger,
          pressed && styles.triggerPressed,
          hasError && styles.triggerError,
        ]}
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityRole="combobox"
      >
        <Text
          style={[styles.triggerText, !selectedOption && styles.triggerPlaceholder]}
          numberOfLines={1}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Text style={styles.arrow}>▼</Text>
      </Pressable>
      {hasError && <Text style={styles.error}>{error}</Text>}

      <Modal visible={isOpen} transparent animationType="fade" onRequestClose={handleClose}>
        <Pressable style={styles.overlay} onPress={handleClose}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => handleSelect(item.value)}
                  style={({ pressed }) => [
                    styles.option,
                    item.value === value && styles.optionSelected,
                    pressed && styles.optionPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: item.value === value }}
                >
                  <Text
                    style={[styles.optionText, item.value === value && styles.optionTextSelected]}
                  >
                    {item.label}
                  </Text>
                  {item.value === value && <Text style={styles.checkmark}>✓</Text>}
                </Pressable>
              )}
              style={styles.list}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.captionBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs + 2,
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  triggerPressed: {
    borderColor: colors.primary,
  },
  triggerError: {
    borderColor: colors.danger,
  },
  triggerText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  triggerPlaceholder: {
    color: colors.textTertiary,
  },
  arrow: {
    fontSize: 10,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  error: {
    ...typography.small,
    color: colors.danger,
    marginTop: spacing.xs,
  },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: "60%",
    paddingBottom: spacing.xxxxl,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  list: {
    paddingHorizontal: spacing.lg,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
  },
  optionSelected: {
    backgroundColor: colors.primary + "12",
  },
  optionPressed: {
    backgroundColor: colors.border,
  },
  optionText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: "600",
  },
  checkmark: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "700",
  },
});
