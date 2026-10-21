import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  useColorScheme,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';

// Ensure web browser auth completions are resolved
WebBrowser.maybeCompleteAuthSession();

const GOOGLE_WEB_CLIENT_ID =
  '669566577029-8sgd2if3rdbc2udj7v42nrch6i5l6p6p.apps.googleusercontent.com';

interface GoogleButtonProps {
  text?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

export const GoogleButton: React.FC<GoogleButtonProps> = ({
  text = 'Continuar con Google',
  onSuccess,
  onError,
  disabled = false,
}) => {
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    selectAccount: true,
  });

  useEffect(() => {
    const handleAuthResponse = async () => {
      if (!response) return;

      if (response.type === 'success') {
        const idToken =
          response.params?.id_token || (response as any).authentication?.idToken;

        if (idToken) {
          try {
            setLoading(true);
            const res = await loginWithGoogle(idToken);
            setLoading(false);
            if (res.success) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              if (onSuccess) onSuccess();
            } else {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              if (onError) onError(res.error || 'Error al autenticar con Google');
            }
          } catch (e: any) {
            setLoading(false);
            if (onError) onError(e?.message || 'Error en inicio de sesión con Google');
          }
        } else {
          setLoading(false);
          if (onError) onError('No se recibió la credencial de Google');
        }
      } else if (response.type === 'error') {
        setLoading(false);
        if (onError) onError(response.error?.message || 'Cancelado o error con Google');
      } else if (response.type === 'dismiss' || response.type === 'cancel') {
        setLoading(false);
      }
    };

    handleAuthResponse();
  }, [response]);

  const handlePress = async () => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      setLoading(true);
      await promptAsync();
    } catch (err: any) {
      setLoading(false);
      if (onError) onError(err?.message || 'No se pudo abrir el acceso de Google');
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[
        styles.button,
        {
          backgroundColor: scheme === 'dark' ? '#0f172a' : '#ffffff',
          borderColor: scheme === 'dark' ? '#334155' : '#e2e8f0',
        },
        (disabled || loading) && styles.disabled,
      ]}
      onPress={handlePress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color={theme.primary} />
      ) : (
        <View style={styles.content}>
          {/* Official Google G emblem colors representation */}
          <View style={styles.iconWrapper}>
            <Ionicons name="logo-google" size={18} color="#ea4335" />
          </View>
          <Text
            style={[
              styles.text,
              { color: scheme === 'dark' ? '#f8fafc' : '#0f172a' },
            ]}
          >
            {text}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 25, // Sleek pill shape matching web
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
    marginVertical: 4,
  },
  disabled: {
    opacity: 0.6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  iconWrapper: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
});
