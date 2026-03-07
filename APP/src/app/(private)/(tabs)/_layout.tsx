import { theme } from "@/lib/theme";
import { Tabs } from "expo-router";
import { MapIcon, Users2 } from "lucide-react-native";
import React from "react";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.text.secondary,
      }}
    >
      <Tabs.Screen
        name="customers"
        options={{
          title: "Leads",
          tabBarIcon: ({ color, focused }) => (
            <Users2 color={focused ? theme.colors.primary : color} size={26} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Mapa",
          tabBarIcon: ({ color, focused }) => (
            <MapIcon color={focused ? theme.colors.primary : color} size={26} />
          ),
        }}
      />
    </Tabs>
  );
}
