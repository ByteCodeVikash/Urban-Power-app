import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Pressable,
  Platform,
  Dimensions,
} from 'react-native';
import { Colors, Spacing, BorderRadius } from '../constants/Theme';
import { Typography } from './Typography';

interface OtpInputProps {
  value: string;
  onChangeText: (text: string) => void;
  length: number;
  error?: boolean;
  disabled?: boolean;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  value,
  onChangeText,
  length,
  error = false,
  disabled = false,
}) => {
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);

  // Blinking cursor effect
  useEffect(() => {
    if (!isFocused || disabled) return;
    const interval = setInterval(() => {
      setCursorVisible(prev => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, [isFocused, disabled]);

  const handlePress = () => {
    if (disabled) return;
    inputRef.current?.focus();
  };

  const codeDigitsArray = new Array(length).fill(0);

  const renderDigitBox = (_: any, index: number) => {
    const char = value[index] || '';
    const isCurrent = index === value.length;
    const isLast = index === length - 1;
    const isCompleted = value.length === length;

    // Focused box style rule: if input is focused and this is the active index,
    // or if the code is completed and we're on the last digit.
    const isBoxFocused = isFocused && (isCurrent || (isLast && isCompleted));

    return (
      <View
        key={index}
        style={[
          styles.digitBox,
          isBoxFocused && styles.digitBoxFocused,
          error && styles.digitBoxError,
          disabled && styles.digitBoxDisabled,
        ]}
      >
        <Typography
          variant="h2"
          weight="700"
          color={
            error
              ? Colors.light.error
              : disabled
                ? Colors.light.textMuted
                : isBoxFocused
                  ? Colors.light.primary
                  : Colors.light.text
          }
          style={styles.digitText}
        >
          {char}
        </Typography>
        {isBoxFocused && !char && cursorVisible && (
          <View style={styles.cursor} />
        )}
      </View>
    );
  };

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      <View style={styles.boxesRow}>{codeDigitsArray.map(renderDigitBox)}</View>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={text => {
          // Only allow digits
          const cleanedText = text.replace(/[^0-9]/g, '');
          onChangeText(cleanedText);
        }}
        maxLength={length}
        keyboardType="number-pad"
        returnKeyType="done"
        textContentType="oneTimeCode" // iOS Autofill
        autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'} // Android Autofill
        importantForAutofill="yes"
        autoFocus={true}
        style={styles.hiddenTextInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        editable={!disabled}
        caretHidden={true}
        selectTextOnFocus={false}
      />
    </Pressable>
  );
};

const { width } = Dimensions.get('window');
const boxSize = Math.min((width - 64 - Spacing.md * 5) / 6, 52); // responsive box sizing

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.md,
    position: 'relative',
    height: 70,
    width: '100%',
  },
  boxesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: Spacing.xs,
  },
  digitBox: {
    width: boxSize,
    height: boxSize + 6,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.surface,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  digitBoxFocused: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.white,
    borderWidth: 2,
    ...Platform.select({
      ios: {
        shadowColor: Colors.light.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  digitBoxError: {
    borderColor: Colors.light.error,
    backgroundColor: '#FEF2F2', // light red tint
  },
  digitBoxDisabled: {
    borderColor: Colors.light.borderLight,
    backgroundColor: Colors.light.surfaceAlt,
  },
  digitText: {
    fontSize: 22,
    textAlign: 'center',
  },
  cursor: {
    position: 'absolute',
    width: 2,
    height: 20,
    backgroundColor: Colors.light.primary,
  },
  hiddenTextInput: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0,
    fontSize: 1, // Minimize visible artifacts if any
    color: 'transparent',
    backgroundColor: 'transparent',
  },
});
