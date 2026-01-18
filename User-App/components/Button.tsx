// components/Button.tsx
import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Text from './Text';
import { Colors, Theme } from '@/constants/Colors';

type ButtonType = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline' | 'ghost';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends Omit<TouchableOpacityProps, 'activeOpacity'> {
  type?: ButtonType;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  theme?: Theme;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  compact?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  type = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  theme = 'dark',
  compact = false,
  leftIcon,
  rightIcon,
  children,
  style,
  onPress,
  ...props
}) => {
  const colors = Colors[theme];
  const isLight = theme === 'light';

  const getButtonStyles = (): ViewStyle => {
    const baseStyles: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      width: fullWidth ? '100%' : 'auto',
      alignSelf: fullWidth ? 'stretch' : 'auto',
      opacity: disabled ? 0.6 : 1,
    };

    const sizeStyles: Record<ButtonSize, ViewStyle> = {
      small: {
        paddingHorizontal: compact ? 12 : 16,
        paddingVertical: compact ? 6 : 8,
        minHeight: 32,
      },
      medium: {
        paddingHorizontal: compact ? 16 : 20,
        paddingVertical: compact ? 8 : 12,
        minHeight: 44,
      },
      large: {
        paddingHorizontal: compact ? 20 : 24,
        paddingVertical: compact ? 12 : 16,
        minHeight: 56,
      },
    };

    const typeStyles: Record<ButtonType, ViewStyle> = {
      primary: {
        backgroundColor: colors.blue,
      },
      secondary: {
        backgroundColor: colors.grey,
      },
      success: {
        backgroundColor: colors.green,
      },
      warning: {
        backgroundColor: colors.yellow,
      },
      danger: {
        backgroundColor: colors.red,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.blue,
      },
      ghost: {
        backgroundColor: 'transparent',
      },
    };

    return {
      ...baseStyles,
      ...sizeStyles[size],
      ...typeStyles[type],
    };
  };

  const getTextStyles = (): TextStyle => {
    const baseColor = (): string => {
      if (type === 'outline' || type === 'ghost') return colors.blue;
      if (type === 'warning') return isLight ? colors.black : colors.bg0;
      if (['primary', 'secondary', 'success', 'danger'].includes(type)) {
        return isLight ? colors.black : colors.bg0;
      }
      return colors.fg;
    };

    const sizeMap: Record<ButtonSize, number> = {
      small: 14,
      medium: 16,
      large: 18,
    };

    const weightMap: Record<ButtonType, 'normal' | '500' | '600'> = {
      primary: '600',
      secondary: '500',
      success: '600',
      warning: '600',
      danger: '600',
      outline: '500',
      ghost: 'normal',
    };

    return {
      color: baseColor(),
      fontWeight: weightMap[type],
      fontSize: sizeMap[size],
      marginLeft: leftIcon ? 8 : 0,
      marginRight: rightIcon ? 8 : 0,
    };
  };

  const getIconColor = (): string => {
    if (type === 'outline' || type === 'ghost') return colors.blue;
    if (type === 'warning') return isLight ? colors.black : colors.bg0;
    if (['primary', 'secondary', 'success', 'danger'].includes(type)) {
      return isLight ? colors.black : colors.bg0;
    }
    return colors.fg;
  };

  const handlePress = (e: any) => {
    if (!loading && !disabled && onPress) {
      onPress(e);
    }
  };

  return (
    <TouchableOpacity
      style={[getButtonStyles(), style]}
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={getIconColor()}
          style={{ marginRight: 8 }}
        />
      ) : leftIcon ? (
        React.cloneElement(leftIcon as React.ReactElement, {
          size: size === 'small' ? 16 : size === 'medium' ? 18 : 20,
          color: getIconColor(),
        })
      ) : null}

      <Text
        theme={theme}
        size={getTextStyles().fontSize}
        weight={getTextStyles().fontWeight as any}
        style={getTextStyles()}
      >
        {children}
      </Text>

      {!loading && rightIcon ? (
        React.cloneElement(rightIcon as React.ReactElement, {
          size: size === 'small' ? 16 : size === 'medium' ? 18 : 20,
          color: getIconColor(),
        })
      ) : null}
    </TouchableOpacity>
  );
};

export default Button;