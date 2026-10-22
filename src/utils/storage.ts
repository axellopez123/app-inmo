import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/**
 * Universal Storage Adapter
 * - Native (iOS / Android): Uses hardware-encrypted SecureStore (Keychain / Keystore)
 * - Web (Browsers): Uses localStorage (since SecureStore is not supported on web)
 */
export const appStorage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage.getItem(key);
        }
      } catch (e) {
        console.warn('[Storage] Error reading localStorage:', e);
      }
      return null;
    }

    try {
      return await SecureStore.getItemAsync(key);
    } catch (e) {
      console.warn('[Storage] Error reading SecureStore:', e);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, value);
        }
      } catch (e) {
        console.warn('[Storage] Error writing localStorage:', e);
      }
      return;
    }

    try {
      await SecureStore.setItemAsync(key, value);
    } catch (e) {
      console.warn('[Storage] Error writing SecureStore:', e);
    }
  },

  async deleteItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(key);
        }
      } catch (e) {
        console.warn('[Storage] Error removing localStorage:', e);
      }
      return;
    }

    try {
      await SecureStore.deleteItemAsync(key);
    } catch (e) {
      console.warn('[Storage] Error deleting SecureStore:', e);
    }
  },
};

export default appStorage;
