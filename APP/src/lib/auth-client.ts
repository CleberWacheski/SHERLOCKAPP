import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";
import { envClient } from "./env-client";

export const authClient = createAuthClient({
  baseURL: envClient.BETTER_AUTH_URL,
  plugins: [
    expoClient({
      scheme: "sherlockcrm",
      storagePrefix: "sherlockcrm",
      storage: SecureStore,
    }),
  ],
});
