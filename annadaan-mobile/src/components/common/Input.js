import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import Colors from '../../utils/colors';

const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  error,
  multiline = false,
  numberOfLines = 1,
  editable = true,
  style,
  inputStyle,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          error && styles.inputError,
          multiline && { height: numberOfLines * 24 + 24, textAlignVertical: 'top' },
          !editable && styles.inputDisabled,
          inputStyle,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={numberOfLines}
        editable={editable}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: Colors.textPrimary,
    backgroundColor: Colors.surface,
  },
  inputFocused: {
    borderColor: Colors.primary,
    borderWidth: 1.5,
  },
  inputError: {
    borderColor: Colors.danger,
  },
  inputDisabled: {
    backgroundColor: Colors.divider,
    color: Colors.textSecondary,
  },
  errorText: {
    fontSize: 12,
    color: Colors.danger,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default Input;
