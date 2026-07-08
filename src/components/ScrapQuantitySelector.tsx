import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, Pressable } from 'react-native';
import { Plus, Minus } from 'lucide-react-native';
import { Colors } from '../constants/Theme';

interface ScrapQuantitySelectorProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onChange: (newQty: number) => void;
  size?: 'sm' | 'lg';
}

export const ScrapQuantitySelector: React.FC<ScrapQuantitySelectorProps> = ({
  quantity,
  onIncrement,
  onDecrement,
  onChange,
  size = 'sm',
}) => {
  const [localText, setLocalText] = useState(quantity.toString());
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setLocalText(quantity.toString());
    }
  }, [quantity, isFocused]);

  const handleTextChange = (text: string) => {
    // Only allow positive integers (digits only)
    const cleanText = text.replace(/[^0-9]/g, '');
    setLocalText(cleanText);

    if (cleanText !== '') {
      const parsed = parseInt(cleanText, 10);
      if (parsed >= 1) {
        onChange(parsed);
      }
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (localText === '' || parseInt(localText, 10) < 1) {
      setLocalText(quantity.toString());
    } else {
      setLocalText(parseInt(localText, 10).toString());
    }
  };

  const isLg = size === 'lg';

  return (
    <View
      style={[styles.container, isLg ? styles.containerLg : styles.containerSm]}
    >
      <Pressable
        style={[styles.btn, isLg ? styles.btnLg : styles.btnSm]}
        onPress={onDecrement}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Minus color={Colors.light.primary} size={isLg ? 20 : 16} />
      </Pressable>

      <TextInput
        style={[
          styles.input,
          isLg ? styles.inputLg : styles.inputSm,
          isFocused && styles.inputFocused,
        ]}
        value={localText}
        onChangeText={handleTextChange}
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
        keyboardType="number-pad"
        selectTextOnFocus
        maxLength={4} // Enforce reasonable maximum quantity (up to 9999 kg)
      />

      <Pressable
        style={[styles.btn, isLg ? styles.btnLg : styles.btnSm]}
        onPress={onIncrement}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Plus color={Colors.light.primary} size={isLg ? 20 : 16} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.white,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    alignSelf: 'center',
  },
  containerSm: {
    borderRadius: 8,
    padding: 2,
  },
  containerLg: {
    borderRadius: 12,
    padding: 4,
    width: '100%',
    justifyContent: 'space-between',
    backgroundColor: Colors.light.surface,
  },
  btn: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnSm: {
    width: 28,
    height: 28,
  },
  btnLg: {
    width: 48,
    height: 48,
  },
  input: {
    textAlign: 'center',
    fontWeight: '700',
    color: Colors.light.text,
    padding: 0, // Reset RN default vertical padding
  },
  inputSm: {
    fontSize: 14,
    width: 36,
    height: 28,
  },
  inputLg: {
    fontSize: 20,
    flex: 1,
    height: 48,
  },
  inputFocused: {
    color: Colors.light.primary,
  },
});
