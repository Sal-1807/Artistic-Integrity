import { Tabs, usePathname } from "expo-router";
import { Text } from "react-native";
import { useFonts } from 'expo-font';
import { Home, Search, Upload, Verify, Profile } from "../components/icons";
import { Colors } from "@/constants/Colors";
import React from "react";
import "./global.css";

const HIDE_TAB_ROUTES = ['/login', '/Login','/(auth)/Login', '/(auth)/SignUp', '/(auth)/login', '/(auth)/signup', '/signup', '/SignUp'];

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': require('@/assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Bold': require('@/assets/fonts/Poppins-Bold.ttf'),
    'OpenSans-Bold': require("@/assets/fonts/OpenSans-Bold.ttf"),
    'OpenSans-Regular': require("@/assets/fonts/OpenSans-Regular.ttf"),
    'Roboto': require('@/assets/fonts/Roboto-VariableFont_wdth,wght.ttf')
  });
  
  const pathname = usePathname();
  const showTabBar = !HIDE_TAB_ROUTES.includes(pathname);

  if (!fontsLoaded) return <Text>Loading...</Text>;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          display: showTabBar ? 'flex' : 'none',
          backgroundColor: Colors.dark.bg0,
          borderTopColor: Colors.dark.bg2,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: Colors.dark.blue,
        tabBarInactiveTintColor: Colors.dark.grey,
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'Poppins-Regular',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color, size }) => (
            <Home size={size} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ focused, color, size }) => (
            <Search size={size} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="upload"
        options={{
          title: 'Upload',
          tabBarIcon: ({ focused, color, size }) => (
            <Upload size={size} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="verify"
        options={{
          title: 'Verify',
          tabBarIcon: ({ focused, color, size }) => (
            <Verify size={size} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused, color, size }) => (
            <Profile size={size} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="(auth)/Login"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="(auth)/SignUp"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
      name="(profile)/[profile_id]"
      options={{
        href:null
      }}/>
      <Tabs.Screen
      name="(artwork)/[artwork_id]"
      options={{
        href:null
      }}/>
      <Tabs.Screen
      name="(comments)/[artwork_id]"
      options={{
        href:null
      }}/>
    </Tabs>
  );
}