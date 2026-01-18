import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import PocketBase from 'pocketbase';
import Text from '@/components/Text';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { Colors, Theme } from '@/constants/Colors';
import * as Icons from '@/components/icons';
import { Storage } from '@/lib/database'; // Import Storage utility

const pb = new PocketBase('http://172.16.210.61:8090/');

interface LoginFormData {
  email: string;
  password: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function LoginScreen() {
  const router = useRouter();
  const [theme] = useState<Theme>('dark');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });

  const colors = Colors[theme];

  // Check if user is already logged in
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        // Check if PocketBase has a valid auth token
        if (pb.authStore.isValid) {
          router.replace('/');
        } else {
          // Try to restore auth from storage using our Storage utility
          try {
            const savedAuth = await Storage.getItem('pb_auth');
            if (savedAuth) {
              pb.authStore.save(savedAuth);
              if (pb.authStore.isValid) {
                router.replace('/');
                return;
              }
            }
          } catch (e) {
            console.log('No stored auth found or invalid:', e);
            // Clear invalid stored auth
            await Storage.deleteItem('pb_auth');
          }
          setCheckingAuth(false);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        setCheckingAuth(false);
      }
    };

    checkUserSession();
  }, [router]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const authData = await pb
        .collection('users')
        .authWithPassword(
          formData.email.trim().toLowerCase(),
          formData.password
        );

      // Save auth data for persistence using Storage utility
      await Storage.setItem('pb_auth', pb.authStore.exportToCookie());

      router.replace('/');
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Provide more specific error messages
      const errorMsg = error?.response?.data?.message || 
                       error?.message || 
                       'Invalid email or password';
      
      Alert.alert('Login failed', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  if (checkingAuth) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg0 }]}>
        <ActivityIndicator size="large" color={colors.blue} />
        <Text theme={theme} size={16} style={{ marginTop: 16 }}>
          Checking authentication...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg0 }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.headerContainer}>
        <Text
          theme={theme}
          size={32}
          weight="600"
          style={{ marginBottom: 8 }}
        >
          Welcome Back
        </Text>
        <Text
          theme={theme}
          size={14}
          style={{ color: colors.light_grey, marginBottom: 32 }}
        >
          Sign in to your account to continue
        </Text>
      </View>

      <View style={styles.formContainer}>
        <Input
          theme={theme}
          label="Email Address"
          placeholder="john@example.com"
          value={formData.email}
          onChangeText={(val) => updateField('email', val)}
          error={errors.email}
          leftIcon={<Icons.Mail />}
          fullWidth
          size="large"
          containerStyle={{ marginBottom: 16 }}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Input
          theme={theme}
          label="Password"
          placeholder="••••••••"
          value={formData.password}
          onChangeText={(val) => updateField('password', val)}
          error={errors.password}
          leftIcon={<Icons.Lock />}
          rightIcon={showPassword ? <Icons.Eye /> : <Icons.EyeOff />}
          onRightIconPress={() => setShowPassword(!showPassword)}
          fullWidth
          size="large"
          containerStyle={{ marginBottom: 24 }}
          secureTextEntry={!showPassword}
        />

        <Button
          theme={theme}
          type="primary"
          size="large"
          fullWidth
          onPress={handleLogin}
          loading={loading}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </View>

      <View style={styles.footerContainer}>
        <Text theme={theme} size={14} style={{ textAlign: 'center' }}>
          Don&apos;t have an account?{' '}
          <Text
            theme={theme}
            size={14}
            weight="600"
            style={{ color: colors.blue }}
            onPress={() => router.push('/(auth)/SignUp')}
          >
            Sign up
          </Text>
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  headerContainer: {
    marginBottom: 32,
  },
  formContainer: {
    marginBottom: 32,
  },
  footerContainer: {
    alignItems: 'center',
  },
});