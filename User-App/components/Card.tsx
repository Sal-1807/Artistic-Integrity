// components/Card.tsx
import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
  StyleSheet,
} from 'react-native';
import { Colors, Theme } from '@/constants/Colors';

export type CardVariant = 'default' | 'outlined' | 'subtle';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps extends Omit<TouchableOpacityProps, 'style'> {
  /** Main content of the card */
  children: React.ReactNode;
  
  /** Visual style variant */
  variant?: CardVariant;
  
  /** Padding scale */
  padding?: CardPadding;
  
  /** Whether the card is pressable */
  pressable?: boolean;
  
  /** Optional header section */
  header?: React.ReactNode;
  
  /** Optional footer section */
  footer?: React.ReactNode;
  
  /** Optional left accent border */
  accentBorder?: boolean;
  
  /** Accent border color (defaults to theme's blue) */
  accentBorderColor?: string;
  
  /** Theme setting */
  theme?: Theme;
  
  /** Custom container style */
  style?: ViewStyle;
  
  /** Whether to show loading state */
  loading?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  pressable = false,
  header,
  footer,
  accentBorder = false,
  accentBorderColor,
  theme = 'dark',
  loading = false,
  style,
  onPress,
  disabled,
  ...props
}) => {
  const colors = Colors[theme];
  const isLight = theme === 'light';

  // Get card container styles based on variant
  const getCardContainerStyles = (): ViewStyle => {
    const base: ViewStyle = {
      borderRadius: 12,
      overflow: 'hidden' as const,
      position: 'relative' as const,
    };

    const variantStyles: Record<CardVariant, ViewStyle> = {
      default: {
        backgroundColor: colors.bg1,
        borderWidth: 1,
        borderColor: colors.grey,
      },
      outlined: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: colors.grey,
      },
      subtle: {
        backgroundColor: isLight ? colors.bg1 : colors.bg2,
        borderWidth: 0,
      },
    };

    return {
      ...base,
      ...variantStyles[variant],
    };
  };

  // Get padding styles
  const getPaddingStyles = (): ViewStyle => {
    const paddingMap: Record<CardPadding, ViewStyle> = {
      none: {
        padding: 0,
      },
      sm: {
        padding: 8,
      },
      md: {
        padding: 16,
      },
      lg: {
        padding: 20,
      },
    };

    return paddingMap[padding];
  };

  // Get content container styles
  const getContentStyles = (): ViewStyle => {
    const base: ViewStyle = {
      flex: 1,
    };

    // Adjust padding for header/footer presence
    if (header && footer) {
      return base; // Both header and footer handle their own padding
    } else if (header) {
      return { ...base, paddingBottom: 0 };
    } else if (footer) {
      return { ...base, paddingTop: 0 };
    }

    return base;
  };

  // Accent border styles
  const getAccentBorderStyles = (): ViewStyle => {
    if (!accentBorder) return {};

    const borderColor = accentBorderColor || colors.blue;
    
    return {
      borderLeftWidth: 3,
      borderLeftColor: borderColor,
    };
  };

  // Combined container styles
  const containerStyles: ViewStyle = {
    ...getCardContainerStyles(),
    ...getPaddingStyles(),
    ...getAccentBorderStyles(),
  };

  // Render loading state
  if (loading) {
    return (
      <View
        style={[
          containerStyles,
          style,
          { opacity: 0.7 },
        ]}
      >
        <View style={styles.loadingContent}>
          {/* Loading skeleton could be added here */}
          <View style={[styles.loadingLine, { backgroundColor: colors.grey }]} />
          <View style={[styles.loadingLine, { backgroundColor: colors.grey, width: '70%', marginTop: 8 }]} />
        </View>
      </View>
    );
  }

  // Render content
  const renderContent = () => (
    <View style={[containerStyles, style]}>
      {header && (
        <View style={styles.header}>
          {header}
        </View>
      )}
      
      <View style={[styles.content, getContentStyles()]}>
        {children}
      </View>
      
      {footer && (
        <View style={styles.footer}>
          {footer}
        </View>
      )}
    </View>
  );

  // If pressable, wrap with TouchableOpacity
  if (pressable && onPress) {
    return (
      <TouchableOpacity
        style={containerStyles}
        onPress={onPress}
        activeOpacity={0.85}
        disabled={disabled}
        {...props}
      >
        {renderContent()}
      </TouchableOpacity>
    );
  }

  return renderContent();
};

const styles = StyleSheet.create({
  header: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
    marginBottom: 16,
  },
  content: {
    flex: 1,
  },
  footer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
    marginTop: 16,
  },
  loadingContent: {
    padding: 16,
  },
  loadingLine: {
    height: 16,
    borderRadius: 4,
    width: '100%',
  },
});

export default Card;