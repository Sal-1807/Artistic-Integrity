/* eslint-disable import/no-unresolved */
import React from 'react';
import {
  Text as RNText,
  StyleSheet,
  TextStyle,
  TextProps as RNTextProps,
} from 'react-native';
import { Colors, Theme } from '@/constants/Colors';

type TextType = 'text' | 'info' | 'warning' | 'danger';
type FontWeight = 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';

interface TextProps extends RNTextProps {
  size?: number;
  type?: TextType;
  padding?: number;
  compactness?: number;
  theme?: Theme;
  weight?: FontWeight;
  inline?: boolean;
  opacity?: number;
}

const Text: React.FC<TextProps> = ({
  size = 16,
  type = 'text',
  padding = 0,
  compactness = 0,
  theme = 'dark',
  weight = 'normal',
  inline = false,
  opacity = 1,
  style,
  children,
  ...props
}) => {
  const colors = Colors[theme];

  const getColor = (textType: TextType): string => {
    switch (textType) {
      case 'info':
        return colors.cyan;
      case 'warning':
        return colors.yellow;
      case 'danger':
        return colors.red;
      case 'text':
      default:
        return colors.fg;
    }
  };

  const getBackgroundColor = (textType: TextType): string => {
    if (inline) return 'transparent';
    
    switch (textType) {
      case 'info':
        return colors.diff_change;
      case 'warning':
        return colors.diff_add;
      case 'danger':
        return colors.diff_delete;
      default:
        return 'transparent';
    }
  };

  const textStyles = StyleSheet.create({
    combined: {
      fontSize: size,
      color: getColor(type),
      paddingHorizontal: padding,
      paddingVertical: padding / 2,
      lineHeight: size + compactness + (size * 0.4),
      letterSpacing: compactness > 0 ? 0 : compactness < 0 ? -0.2 : 0,
      backgroundColor: getBackgroundColor(type),
      borderRadius: (type !== 'text' && !inline) ? 4 : 0,
      fontWeight: weight,
      opacity: opacity,
      fontFamily: 'Roboto'
    } as TextStyle,
  });

  return (
    <RNText style={[textStyles.combined, style]} {...props}>
      {children}
    </RNText>
  );
};

export default Text;