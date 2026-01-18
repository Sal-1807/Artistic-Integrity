// components/ProfileStatCard.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Text from './Text';
import { Colors, Theme } from '@/constants/Colors';

export interface ProfileStatCardProps {
  /** Label for the stat (e.g., "Posts", "Verified") */
  label: string;
  
  /** Value to display (number or formatted string) */
  value: string | number;
  
  /** Theme setting */
  theme?: Theme;
  
  /** Color for the accent (value text) */
  accentColor?: string;
  
  /** Optional icon or custom content */
  icon?: React.ReactNode;
}

const ProfileStatCard: React.FC<ProfileStatCardProps> = ({
  label,
  value,
  theme = 'dark',
  accentColor,
  icon,
}) => {
  const colors = Colors[theme];
  const displayColor = accentColor || colors.blue;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.bg1,
          borderColor: colors.grey,
        },
      ]}
    >
      {/* Icon area (optional) */}
      {icon && <View style={styles.iconArea}>{icon}</View>}

      {/* Value */}
      <Text
        size={24}
        weight="700"
        style={{
          color: displayColor,
          marginBottom: 4,
        }}
      >
        {value}
      </Text>

      {/* Label */}
      <Text
        size={12}
        weight="500"
        style={{
          color: colors.light_grey,
          textTransform: 'capitalize',
        }}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  iconArea: {
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ProfileStatCard;