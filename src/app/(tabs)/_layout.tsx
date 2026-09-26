import Ionicons from '@expo/vector-icons/Ionicons';
import { Link, Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, type ColorValue } from 'react-native';

import { haptic } from '@/ui/haptics';
import { colors, headerBackground, spacing, withAlpha } from '@/ui/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

function tabIcon(name: IconName) {
  function TabIcon({ color, size }: { color: ColorValue; size: number }) {
    return <Ionicons name={name} color={color} size={size} />;
  }
  return TabIcon;
}

function SettingsButton() {
  return (
    <Link href="/settings" asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Settings"
        hitSlop={12}
        style={{ paddingHorizontal: spacing.md }}
        onPressIn={() => void haptic('selection')}
      >
        <Ionicons name="settings-outline" size={22} color={colors.text} />
      </Pressable>
    </Link>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: headerBackground },
        headerShadowVisible: false,
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '800' },
        headerRight: SettingsButton,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: withAlpha(colors.purple, 0.35),
        },
        tabBarActiveTintColor: colors.pink,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
      screenListeners={{ tabPress: () => void haptic('selection') }}
    >
      <Tabs.Screen
        name="remote"
        options={{ title: 'Remote', tabBarIcon: tabIcon('game-controller') }}
      />
      <Tabs.Screen name="apps" options={{ title: 'Apps', tabBarIcon: tabIcon('apps') }} />
      <Tabs.Screen name="devices" options={{ title: 'Devices', tabBarIcon: tabIcon('tv') }} />
    </Tabs>
  );
}
