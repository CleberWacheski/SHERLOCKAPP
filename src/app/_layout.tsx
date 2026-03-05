import { ReactQueryProvider } from "@/components/ReactQueryProvider";
import { authClient } from "@/lib/auth-client";
import {
  HostGrotesk_300Light,
  HostGrotesk_400Regular,
  HostGrotesk_500Medium,
  HostGrotesk_700Bold,
  HostGrotesk_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/host-grotesk";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isPending, data } = authClient.useSession();
  const isAuthenticated = !!data?.session.id;
  const [fontsLoaded] = useFonts({
    HostGrotesk_300Light,
    HostGrotesk_400Regular,
    HostGrotesk_500Medium,
    HostGrotesk_700Bold,
    HostGrotesk_800ExtraBold,
  });

  if (fontsLoaded) {
    SplashScreen.hideAsync();
  }

  if (isPending || !fontsLoaded) {
    return null;
  }

  return (
    <ReactQueryProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Protected guard={isAuthenticated}>
          <Stack.Screen name="(private)" />
        </Stack.Protected>
        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen name="index" />
        </Stack.Protected>
      </Stack>
    </ReactQueryProvider>
  );
}
