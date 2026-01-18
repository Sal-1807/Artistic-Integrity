// screens/SignUpScreen.tsx
import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Storage } from '@/lib/database';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Text from '@/components/Text';
import { Colors } from '@/constants/Colors';
import { Eye, EyeOff, Mail, Lock, ArrowRight, ChevronLeft } from '@/components/icons';
import PocketBase from 'pocketbase';

// Initialize PocketBase once
const pb = new PocketBase('http://172.16.210.61:8090/');

const SignUpScreen = () => {
  const router = useRouter();
  
  // Form state
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  
  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const theme = 'dark';
  const colors = Colors[theme];

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!username.trim()) {
      newErrors.username = 'Username is required';
    } else if (username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle image picker
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setProfilePicture(result.assets[0].base64);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
      console.log(error);
    }
  };

  // Handle signup
  const handleSignUp = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const formData = new FormData();
      
      // Add required fields
      formData.append('name', name.trim());
      formData.append('username', username.trim().toLowerCase());
      formData.append('email', email.trim().toLowerCase());
      formData.append('password', password);
      formData.append('passwordConfirm', password);
      formData.append('emailVisibility', 'true');

      // Add profile picture if selected
      if (profilePicture) {
        try {
          const blob = await (
            await fetch(`data:image/jpeg;base64,${profilePicture}`)
          ).blob();
          formData.append('profilePicture', blob, 'profile.jpg');
        } catch (err) {
          console.warn('Failed to prepare profile picture:', err);
        }
      }

      // Create user record
      const record = await pb.collection('users').create(formData);

      // Authenticate the user after successful signup
      try {
        await pb.collection('users').authWithPassword(email.trim().toLowerCase(), password);
        
        // Save auth data for persistence
        await Storage.setItem('pb_auth', pb.authStore.exportToCookie());
      } catch (authError) {
        console.warn('Auto-login after signup failed:', authError);
        // This is not critical - user can login manually
      }

      // Save user info to storage
      await Storage.setItem('user_id', record.id);
      await Storage.setItem('user_email', record.email);
      await Storage.setItem('user_name', record.name);

      // Success
      Alert.alert('Success', 'Account created successfully!', [
        {
          text: 'Continue',
          onPress: () => {
            router.replace('/');
          },
        },
      ]);
    } catch (error: any) {
      console.error('Signup error:', error);

      // Handle PocketBase validation errors
      if (error.response?.data) {
        const data = error.response.data;
        const newErrors: Record<string, string> = {};
        
        // Map PocketBase field validation errors
        if (data.username?.message) {
          newErrors.username = data.username.message;
        }
        if (data.email?.message) {
          newErrors.email = data.email.message;
        }
        if (data.password?.message) {
          newErrors.password = data.password.message;
        }

        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
        } else {
          // Generic error message if no specific field errors
          Alert.alert('Error', error.message || 'Failed to create account');
        }
      } else {
        Alert.alert('Error', error.message || 'Failed to create account');
      }
    } finally {
      setLoading(false);
    }
  };

  // Navigate to login
  const goToLogin = () => {
    router.push('/Login');
  };

  // Navigate back
  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/Login');
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.bg0 }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={goBack}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ChevronLeft size={24} color={colors.fg} />
          </TouchableOpacity>
          <Text size={24} weight="600" theme={theme}>
            Create Account
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <Text size={16} theme={theme} style={styles.subtitle}>
          Join our community
        </Text>

        {/* Profile Picture */}
        <TouchableOpacity
          style={styles.profilePictureContainer}
          onPress={pickImage}
          activeOpacity={0.7}
        >
          {profilePicture ? (
            <Image
              source={{ uri: `data:image/jpeg;base64,${profilePicture}` }}
              style={styles.profilePicture}
            />
          ) : (
            <View style={[styles.profilePlaceholder, { backgroundColor: colors.bg2, borderColor: colors.blue }]}>
              <Text size={40} theme={theme}>
                👤
              </Text>
            </View>
          )}
          <View style={[styles.profilePictureOverlay, { backgroundColor: colors.blue }]}>
            <Text size={14} weight="500" theme={theme}>
              {profilePicture ? 'Change' : 'Add Photo'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Form */}
        <View style={styles.form}>
          <Input
            label="Full Name"
            placeholder="Enter your full name"
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (errors.name) setErrors({ ...errors, name: '' });
            }}
            error={errors.name}
            theme={theme}
            size="large"
            fullWidth
            autoCapitalize="words"
            autoComplete="name"
          />

          <Input
            label="Username"
            placeholder="Choose a username"
            value={username}
            onChangeText={(text) => {
              setUsername(text);
              if (errors.username) setErrors({ ...errors, username: '' });
            }}
            error={errors.username}
            theme={theme}
            size="large"
            fullWidth
            autoCapitalize="none"
            autoComplete="username"
            maxLength={50}
          />

          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) setErrors({ ...errors, email: '' });
            }}
            error={errors.email}
            theme={theme}
            size="large"
            fullWidth
            leftIcon={<Mail />}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
          />

          <Input
            label="Password"
            placeholder="Create a password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) setErrors({ ...errors, password: '' });
            }}
            error={errors.password}
            theme={theme}
            size="large"
            fullWidth
            secureTextEntry={!showPassword}
            leftIcon={<Lock />}
            rightIcon={showPassword ? <Eye /> : <EyeOff />}
            onRightIconPress={() => setShowPassword(!showPassword)}
            autoCapitalize="none"
            autoComplete="password"
          />

          <Input
            label="Confirm Password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
            }}
            error={errors.confirmPassword}
            theme={theme}
            size="large"
            fullWidth
            secureTextEntry={!showConfirmPassword}
            leftIcon={<Lock />}
            rightIcon={showConfirmPassword ? <Eye /> : <EyeOff />}
            onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
            autoCapitalize="none"
            autoComplete="password"
          />

          {/* Terms and Conditions */}
          <View style={styles.termsContainer}>
            <Text size={14} theme={theme} style={styles.termsText}>
              By signing up, you agree to our{' '}
              <Text size={14} weight="500" theme={theme} style={[styles.link, { color: colors.blue }]}>
                Terms of Service
              </Text>{' '}
              and{' '}
              <Text size={14} weight="500" theme={theme} style={[styles.link, { color: colors.blue }]}>
                Privacy Policy
              </Text>
            </Text>
          </View>

          {/* Sign Up Button */}
          <Button
            type="primary"
            size="large"
            fullWidth
            loading={loading}
            onPress={handleSignUp}
            theme={theme}
            rightIcon={<ArrowRight />}
            style={styles.signUpButton}
          >
            Create Account
          </Button>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={[styles.divider, { backgroundColor: colors.grey }]} />
            <Text size={14} theme={theme} style={styles.dividerText}>
              OR
            </Text>
            <View style={[styles.divider, { backgroundColor: colors.grey }]} />
          </View>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text size={16} theme={theme}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={goToLogin}>
              <Text size={16} weight="600" theme={theme} style={[styles.loginLink, { color: colors.blue }]}>
                Log In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backButton: {
    padding: 4,
  },
  headerSpacer: {
    width: 32,
  },
  subtitle: {
    marginBottom: 32,
    opacity: 0.8,
  },
  profilePictureContainer: {
    alignSelf: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: Colors.dark.blue,
  },
  profilePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  profilePictureOverlay: {
    position: 'absolute',
    bottom: -4,
    left: 0,
    right: 0,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: 'center',
  },
  form: {
    gap: 20,
  },
  termsContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  termsText: {
    textAlign: 'center',
    lineHeight: 20,
  },
  link: {
    fontWeight: '500',
  },
  signUpButton: {
    marginTop: 8,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 16,
    opacity: 0.6,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  loginLink: {
    fontWeight: '600',
  },
});

export default SignUpScreen;