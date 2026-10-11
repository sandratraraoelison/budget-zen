import * as SecureStore from "expo-secure-store";
import type { TokenStore } from "../api/client";
const key = "budgetzen.access-token";
export const tokenStore: TokenStore = {
  read: () => SecureStore.getItemAsync(key),
  write: (token) =>
    SecureStore.setItemAsync(key, token, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    }),
  clear: () => SecureStore.deleteItemAsync(key),
};
