// components/Card.styles.ts
import { StyleSheet } from 'react-native';
import { Colors, Theme } from '@/constants/Colors';

export const createCardStyles = (theme: Theme = 'dark') => {
  const colors = Colors[theme];

  return StyleSheet.create({
    // Shadow styles (optional - for platforms that support it)
    shadow: {
      shadowColor: colors.black,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    
    // Compact variant for dense layouts
    compact: {
      borderRadius: 8,
      padding: 12,
    },
    
    // Full width card
    fullWidth: {
      width: '100%',
    },
    
    // Interactive state styles
    pressed: {
      transform: [{ scale: 0.98 }],
    },
    
    // Disabled state
    disabled: {
      opacity: 0.5,
    },
    
    // Special variant for verification cards
    verification: {
      borderWidth: 2,
      borderColor: colors.green,
      backgroundColor: colors.diff_add,
    },
    
    // Special variant for warning cards
    warning: {
      borderWidth: 2,
      borderColor: colors.yellow,
      backgroundColor: colors.diff_add,
    },
    
    // Special variant for error cards
    error: {
      borderWidth: 2,
      borderColor: colors.red,
      backgroundColor: colors.diff_delete,
    },
  });
};

// Common card layout styles
export const cardLayoutStyles = StyleSheet.create({
  // Horizontal layout for cards in a row
  horizontal: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  // Vertical layout (default)
  vertical: {
    flexDirection: 'column',
  },
  
  // Grid layout for card collections
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  // Equal height cards in a grid
  gridItem: {
    width: '48%', // 2 columns with gap
    marginBottom: 16,
  },
  
  // Centered content
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Space between header/content/footer
  spaceBetween: {
    justifyContent: 'space-between',
  },
});