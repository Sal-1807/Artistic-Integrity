// components/Input.tsx
import React, { useState, forwardRef } from 'react';
import {
  TextInput,
  TextInputProps,
  View,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Text from './Text';
import { Colors, Theme } from '@/constants/Colors';

type InputType = 'default' | 'success' | 'warning' | 'danger';
type InputSize = 'small' | 'medium' | 'large';

interface InputProps extends Omit<TextInputProps, 'placeholderTextColor'> {
  type?: InputType;
  size?: InputSize;
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  theme?: Theme;
  compact?: boolean;
  fullWidth?: boolean;
  containerStyle?: ViewStyle;
}

const Input = forwardRef<TextInput, InputProps>(({
  type = 'default',
  size = 'medium',
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  theme = 'dark',
  compact = false,
  fullWidth = false,
  containerStyle,
  style,
  value,
  onFocus,
  onBlur,
  editable = true,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const colors = Colors[theme];
  const isLight = theme === 'light';

  const getContainerStyles = (): ViewStyle => {
    const base: ViewStyle = {
      width: fullWidth ? '100%' : 'auto',
      alignSelf: fullWidth ? 'stretch' : 'auto',
    };

    return {
      ...base,
      ...containerStyle,
    };
  };

  const getInputContainerStyles = (): ViewStyle => {
    const base: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 8,
      borderWidth: 1,
      backgroundColor: isLight ? colors.bg0 : colors.bg1,
    };

    const sizeStyles: Record<InputSize, ViewStyle> = {
      small: {
        paddingHorizontal: compact ? 10 : 12,
        paddingVertical: compact ? 6 : 8,
        minHeight: 36,
      },
      medium: {
        paddingHorizontal: compact ? 12 : 16,
        paddingVertical: compact ? 8 : 12,
        minHeight: 44,
      },
      large: {
        paddingHorizontal: compact ? 14 : 20,
        paddingVertical: compact ? 10 : 16,
        minHeight: 52,
      },
    };

    const borderColor = (): string => {
      if (error || type === 'danger') return colors.red;
      if (type === 'warning') return colors.yellow;
      if (type === 'success') return colors.green;
      if (isFocused) return colors.blue;
      return colors.grey;
    };

    const opacity = editable ? 1 : 0.6;

    return {
      ...base,
      ...sizeStyles[size],
      borderColor: borderColor(),
      opacity,
    };
  };

  const getInputStyles = (): TextStyle => {
    const sizeMap: Record<InputSize, number> = {
      small: 14,
      medium: 16,
      large: 18,
    };

    return {
      flex: 1,
      fontSize: sizeMap[size],
      color: colors.fg,
      fontFamily: 'Roboto',
      padding: 0,
      margin: 0,
      marginLeft: leftIcon ? 8 : 0,
      marginRight: rightIcon ? 8 : 0,
    };
  };

  const getIconColor = (): string => {
    if (error || type === 'danger') return colors.red;
    if (type === 'warning') return colors.yellow;
    if (type === 'success') return colors.green;
    if (isFocused) return colors.blue;
    return colors.light_grey;
  };

  const getIconSize = (): number => {
    const sizeMap: Record<InputSize, number> = {
      small: 16,
      medium: 20,
      large: 24,
    };
    return sizeMap[size];
  };

  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  return (
    <View style={getContainerStyles()}>
      {label && (
        <Text
          theme={theme}
          size={size === 'small' ? 14 : 16}
          weight="500"
          style={{ marginBottom: 4 }}
        >
          {label}
        </Text>
      )}

      <View style={getInputContainerStyles()}>
        {leftIcon && (
          React.cloneElement(leftIcon as React.ReactElement, {
            size: getIconSize(),
            color: getIconColor(),
          })
        )}

        <TextInput
          ref={ref}
          style={[getInputStyles(), style]}
          placeholderTextColor={colors.light_grey}
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={editable}
          {...props}
        />

        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            activeOpacity={onRightIconPress ? 0.7 : 1}
          >
            {React.cloneElement(rightIcon as React.ReactElement, {
              size: getIconSize(),
              color: getIconColor(),
            })}
          </TouchableOpacity>
        )}
      </View>

      {(error || hint) && (
        <Text
          theme={theme}
          type={error ? 'danger' : 'info'}
          size={size === 'small' ? 12 : 14}
          style={{ marginTop: 4 }}
        >
          {error || hint}
        </Text>
      )}
    </View>
  );
});

Input.displayName = 'Input';

export default Input;