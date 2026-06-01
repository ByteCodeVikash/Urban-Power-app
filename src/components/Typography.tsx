import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { Typography as ThemeTypography, Colors } from '../constants/Theme';

interface CustomTextProps extends TextProps {
  variant?: keyof typeof ThemeTypography;
  color?: string;
  weight?: '400' | '500' | '600' | '700';
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
}

export const Typography: React.FC<CustomTextProps> = ({
  variant = 'body1',
  color = Colors.light.text,
  weight,
  align = 'left',
  style,
  children,
  ...props
}) => {
  const baseStyle = ThemeTypography[variant];
  return (
    <Text
      style={[
        baseStyle,
        { color, textAlign: align },
        weight && { fontWeight: weight },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};
