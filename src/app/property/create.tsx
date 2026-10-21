import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  useColorScheme,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/api/client';

const PROPERTY_TYPES = [
  { id: 'casa', label: 'Casa', icon: 'home-outline' },
  { id: 'departamento', label: 'Depto', icon: 'business-outline' },
  { id: 'terreno', label: 'Terreno', icon: 'map-outline' },
  { id: 'local', label: 'Local Comercial', icon: 'storefront-outline' },
];

const OPERATION_TYPES = [
  { id: 'venta', label: 'Venta' },
  { id: 'renta', label: 'Renta' },
];

export default function CreatePropertyScreen() {
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];
  const router = useRouter();
  const { user, isVendor } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('casa');
  const [typeMode, setTypeMode] = useState('venta');

  // Specs
  const [bedrooms, setBedrooms] = useState('3');
  const [bathrooms, setBathrooms] = useState('2');
  const [parkings, setParkings] = useState('1');
  const [build, setBuild] = useState('160');
  const [sizeLength, setSizeLength] = useState('20');
  const [sizeWidth, setSizeWidth] = useState('8');

  // Location & Pricing
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('0'); // Margen confidencial

  // Images: [{ uri, fileName, type }]
  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);

  // Disparar Cámara Nativa
  const handleTakePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permiso necesario', 'Requerimos acceso a la cámara para fotografiar la propiedad');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (_) {}
        setImages((prev) => [...prev, result.assets[0]]);
      }
    } catch (e) {
      console.warn('[Camera] Error capturando foto:', e);
    }
  };

  // Disparar Galería
  const handlePickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (_) {}
        setImages((prev) => [...prev, ...result.assets]);
      }
    } catch (e) {
      console.warn('[Gallery] Error seleccionando fotos:', e);
    }
  };

  const handleRemoveImage = (index: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (_) {}
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Cálculos de descuento
  const numericPrice = parseFloat(price.replace(/\D/g, '')) || 0;
  const numericDiscount = parseFloat(discount) || 0;
  const priceWithDiscount = numericDiscount > 0 ? numericPrice * (1 - numericDiscount / 100) : numericPrice;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(val);

  // Validación por paso
  const validateStep = (step: number) => {
    if (step === 1) {
      if (!name.trim()) {
        Alert.alert('Campo requerido', 'Por favor ingresa el Alias / Nombre clave de la propiedad');
        return false;
      }
    } else if (step === 2) {
      // Las specs son opcionales o tienen default
      return true;
    } else if (step === 3) {
      if (!address.trim()) {
        Alert.alert('Campo requerido', 'Por favor ingresa la calle o dirección');
        return false;
      }
      if (!numericPrice || numericPrice <= 0) {
        Alert.alert('Campo requerido', 'Por favor ingresa el precio de lista');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (_) {}
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (_) {}
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Envío final al Backend
  const handleSubmit = async () => {
    if (images.length === 0) {
      Alert.alert('Fotos requeridas', 'Toma o selecciona al menos 1 fotografía de la propiedad');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        title: title.trim() || name.trim(),
        description: description.trim(),
        type,
        typeMode: [typeMode],
        moodsBuy: ['contado', 'bancario'],
        bedrooms: type === 'terreno' ? 0 : parseInt(bedrooms, 10) || 0,
        bathrooms: type === 'terreno' ? 0 : parseFloat(bathrooms) || 0,
        cleanrooms: 0,
        parkings: parseInt(parkings, 10) || 0,
        build: parseFloat(build) || 0,
        sizeLength: parseFloat(sizeLength) || 0,
        sizeWidth: parseFloat(sizeWidth) || 0,
        address: address.trim(),
        city: city.trim() || 'Monterrey',
        state: state.trim() || 'Nuevo León',
        country: 'México',
        zip_code: zipCode.trim() || '64000',
        price: numericPrice,
        discount: numericDiscount,
        priceWithDiscount: priceWithDiscount,
      };

      // 1. Crear producto
      const { data: createdProduct } = await apiClient.post('/products/', payload);
      const productId = createdProduct.id;

      // 2. Subir imágenes secuencialmente con multipart/form-data
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const formData = new FormData();
        const filename = img.uri.split('/').pop() || `photo_${i}.jpg`;
        const match = /\.(\w+)$/.exec(filename);
        const fileType = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('file', {
          uri: img.uri,
          name: filename,
          type: fileType,
        } as any);
        formData.append('order', String(i));
        formData.append('cover_index', i === 0 ? '0' : '-1');

        await apiClient.post(`/products/${productId}/images`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (_) {}

      Alert.alert(
        '¡Propiedad Publicada con Éxito!',
        'El inmueble ha sido registrado correctamente en la plataforma.',
        [
          {
            text: 'Ver Inmueble',
            onPress: () => router.replace({ pathname: '/property/[id]', params: { id: String(productId) } } as any),
          },
        ]
      );
    } catch (err: any) {
      console.error('[CreateProperty] Error al publicar:', err);
      const msg = err.response?.data?.detail || 'No se pudo publicar la propiedad. Revisa tu conexión.';
      Alert.alert('Error al publicar', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Barra de Progreso del Stepper */}
      <View style={[styles.stepperContainer, { borderBottomColor: theme.cardBorder }]}>
        {[1, 2, 3, 4].map((step) => {
          const isDone = step < currentStep;
          const isCurrent = step === currentStep;
          return (
            <View key={step} style={styles.stepTrackItem}>
              <View
                style={[
                  styles.stepDot,
                  isDone
                    ? { backgroundColor: theme.success }
                    : isCurrent
                    ? { backgroundColor: theme.primary }
                    : { backgroundColor: scheme === 'dark' ? '#27272a' : '#e2e8f0' },
                ]}
              >
                {isDone ? (
                  <Ionicons name="checkmark" size={12} color="#ffffff" />
                ) : (
                  <Text style={[styles.stepDotText, { color: isCurrent ? '#ffffff' : theme.textMuted }]}>
                    {step}
                  </Text>
                )}
              </View>
              {step < 4 && (
                <View
                  style={[
                    styles.stepLine,
                    { backgroundColor: isDone ? theme.success : scheme === 'dark' ? '#27272a' : '#e2e8f0' },
                  ]}
                />
              )}
            </View>
          );
        })}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.scrollContent}
      >
        {/* PASO 1: TIPO DE INMUEBLE & DATOS BÁSICOS */}
        {currentStep === 1 && (
          <View style={styles.stepBox}>
            <Text style={[styles.stepTitle, { color: theme.text }]}>Tipo de Inmueble y Título</Text>
            <Text style={[styles.stepSubtitle, { color: theme.textSecondary }]}>
              Selecciona si es casa, depto, terreno o local comercial
            </Text>

            {/* Selector de Tipo (con Local Comercial) */}
            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>TIPO DE PROPIEDAD</Text>
            <View style={styles.typeGrid}>
              {PROPERTY_TYPES.map((pt) => {
                const selected = type === pt.id;
                return (
                  <Pressable
                    key={pt.id}
                    onPress={() => {
                      setType(pt.id);
                      try {
                        Haptics.selectionAsync();
                      } catch (_) {}
                    }}
                    style={({ pressed }) => [
                      styles.typeCard,
                      {
                        backgroundColor: selected ? (scheme === 'dark' ? '#27272a' : '#ffedd5') : theme.card,
                        borderColor: selected ? theme.primary : theme.cardBorder,
                        transform: [{ scale: pressed ? 0.97 : 1 }],
                      },
                    ]}
                  >
                    <Ionicons
                      name={pt.icon as any}
                      size={22}
                      color={selected ? theme.primary : theme.textSecondary}
                    />
                    <Text
                      style={[
                        styles.typeCardText,
                        { color: selected ? theme.primary : theme.text, fontWeight: selected ? '800' : '600' },
                      ]}
                    >
                      {pt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Modalidad de Operación */}
            <Text style={[styles.fieldLabel, { color: theme.textSecondary, marginTop: 16 }]}>OPERACIÓN</Text>
            <View style={styles.toggleRow}>
              {OPERATION_TYPES.map((op) => {
                const selected = typeMode === op.id;
                return (
                  <TouchableOpacity
                    key={op.id}
                    onPress={() => setTypeMode(op.id)}
                    style={[
                      styles.toggleBtn,
                      {
                        backgroundColor: selected ? theme.primary : theme.card,
                        borderColor: selected ? theme.primary : theme.cardBorder,
                      },
                    ]}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '700', color: selected ? '#ffffff' : theme.textSecondary }}>
                      {op.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Campos de Nombre y Descripción */}
            <Text style={[styles.fieldLabel, { color: theme.textSecondary, marginTop: 16 }]}>
              ALIAS / CLAVE DEL INMUEBLE *
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, borderColor: theme.cardBorder, color: theme.text }]}
              placeholder="Ej. Casa Cumbres 4to Sector"
              placeholderTextColor={theme.textMuted}
              value={name}
              onChangeText={setName}
            />

            <Text style={[styles.fieldLabel, { color: theme.textSecondary, marginTop: 14 }]}>
              TÍTULO COMERCIAL ATRACTIVO
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, borderColor: theme.cardBorder, color: theme.text }]}
              placeholder="Ej. Hermosa residencia con alberca y acabados de lujo"
              placeholderTextColor={theme.textMuted}
              value={title}
              onChangeText={setTitle}
            />

            <Text style={[styles.fieldLabel, { color: theme.textSecondary, marginTop: 14 }]}>
              DESCRIPCIÓN DETALLADA
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                { backgroundColor: theme.card, borderColor: theme.cardBorder, color: theme.text },
              ]}
              placeholder="Describe amenidades, distribución, equipamiento y facilidades de pago..."
              placeholderTextColor={theme.textMuted}
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
            />
          </View>
        )}

        {/* PASO 2: ESPECIFICACIONES & MEDIDAS */}
        {currentStep === 2 && (
          <View style={styles.stepBox}>
            <Text style={[styles.stepTitle, { color: theme.text }]}>Medidas y Distribución</Text>
            <Text style={[styles.stepSubtitle, { color: theme.textSecondary }]}>
              {type === 'local'
                ? 'Especifica áreas comerciales, cajones y medidas'
                : type === 'terreno'
                ? 'Especifica metros de frente, fondo y área total'
                : 'Indica recámaras, baños y cajones de estacionamiento'}
            </Text>

            {type !== 'terreno' && (
              <View style={styles.twoCol}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                    {type === 'local' ? 'DESPACHOS / PRIVADOS' : 'RECÁMARAS'}
                  </Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.card, borderColor: theme.cardBorder, color: theme.text }]}
                    keyboardType="numeric"
                    value={bedrooms}
                    onChangeText={setBedrooms}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>BAÑOS COMPLETOS</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.card, borderColor: theme.cardBorder, color: theme.text }]}
                    keyboardType="numeric"
                    value={bathrooms}
                    onChangeText={setBathrooms}
                  />
                </View>
              </View>
            )}

            <View style={styles.twoCol}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>ESTACIONAMIENTOS</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.card, borderColor: theme.cardBorder, color: theme.text }]}
                  keyboardType="numeric"
                  value={parkings}
                  onChangeText={setParkings}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>CONSTRUCCIÓN (M²)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.card, borderColor: theme.cardBorder, color: theme.text }]}
                  keyboardType="numeric"
                  value={build}
                  onChangeText={setBuild}
                />
              </View>
            </View>

            <View style={styles.twoCol}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>FRENTE / ANCHO (M)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.card, borderColor: theme.cardBorder, color: theme.text }]}
                  keyboardType="numeric"
                  value={sizeWidth}
                  onChangeText={setSizeWidth}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>FONDO / LARGO (M)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.card, borderColor: theme.cardBorder, color: theme.text }]}
                  keyboardType="numeric"
                  value={sizeLength}
                  onChangeText={setSizeLength}
                />
              </View>
            </View>
          </View>
        )}

        {/* PASO 3: UBICACIÓN & PRECIOS (CON MARGEN CONFIDENCIAL) */}
        {currentStep === 3 && (
          <View style={styles.stepBox}>
            <Text style={[styles.stepTitle, { color: theme.text }]}>Ubicación y Precios</Text>
            <Text style={[styles.stepSubtitle, { color: theme.textSecondary }]}>
              Establece el precio público y el margen de descuento exclusivo para el equipo
            </Text>

            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>CALLE / DIRECCIÓN *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, borderColor: theme.cardBorder, color: theme.text }]}
              placeholder="Av. Paseo de los Leones #1234"
              placeholderTextColor={theme.textMuted}
              value={address}
              onChangeText={setAddress}
            />

            <View style={styles.twoCol}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>CIUDAD</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.card, borderColor: theme.cardBorder, color: theme.text }]}
                  placeholder="Monterrey"
                  placeholderTextColor={theme.textMuted}
                  value={city}
                  onChangeText={setCity}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>ESTADO</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.card, borderColor: theme.cardBorder, color: theme.text }]}
                  placeholder="Nuevo León"
                  placeholderTextColor={theme.textMuted}
                  value={state}
                  onChangeText={setState}
                />
              </View>
            </View>

            {/* PRECIO PÚBLICO */}
            <Text style={[styles.fieldLabel, { color: theme.textSecondary, marginTop: 14 }]}>
              PRECIO PÚBLICO DE LISTA ($ MXN) *
            </Text>
            <TextInput
              style={[styles.input, styles.priceInput, { backgroundColor: theme.card, borderColor: theme.cardBorder, color: theme.text }]}
              placeholder="$ 3,500,000"
              placeholderTextColor={theme.textMuted}
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />

            {/* BANNER DE DESCUENTO CONFIDENCIAL PARA VENDEDORES */}
            <View style={styles.vendorNoticeCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="lock-closed" size={16} color="#a855f7" />
                <Text style={styles.vendorNoticeTitle}>Margen de Negociación Confidencial</Text>
              </View>
              <Text style={styles.vendorNoticeDesc}>
                Este descuento es solo informativo para que los vendedores conozcan el precio piso. Los clientes verán el precio público de lista sin ningún descuento ni tachado.
              </Text>

              <View style={styles.twoCol}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fieldLabel, { color: '#a855f7' }]}>DESCUENTO MÁXIMO (%)</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.card, borderColor: 'rgba(168, 85, 247, 0.4)', color: theme.text }]}
                    placeholder="0"
                    placeholderTextColor={theme.textMuted}
                    keyboardType="numeric"
                    value={discount}
                    onChangeText={setDiscount}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fieldLabel, { color: '#a855f7' }]}>PRECIO PISO RESULTANTE</Text>
                  <View style={[styles.input, { backgroundColor: 'rgba(168, 85, 247, 0.08)', borderColor: 'rgba(168, 85, 247, 0.3)', justifyContent: 'center' }]}>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: '#a855f7' }}>
                      {formatCurrency(priceWithDiscount)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* PASO 4: CAPTURA DE FOTOGRAFÍAS */}
        {currentStep === 4 && (
          <View style={styles.stepBox}>
            <Text style={[styles.stepTitle, { color: theme.text }]}>Fotografías de la Propiedad</Text>
            <Text style={[styles.stepSubtitle, { color: theme.textSecondary }]}>
              Toma fotos con la cámara de tu celular o elígelas de tu carrete
            </Text>

            {/* Botones de Captura */}
            <View style={styles.photoActionsRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleTakePhoto}
                style={[styles.photoActionButton, { backgroundColor: theme.primary }]}
              >
                <Ionicons name="camera" size={20} color="#ffffff" />
                <Text style={styles.photoActionText}>Tomar con Cámara</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handlePickFromGallery}
                style={[styles.photoActionButton, { backgroundColor: theme.card, borderColor: theme.cardBorder, borderWidth: 1 }]}
              >
                <Ionicons name="images" size={20} color={theme.text} />
                <Text style={[styles.photoActionText, { color: theme.text }]}>Elegir de Galería</Text>
              </TouchableOpacity>
            </View>

            {/* Grid de Fotos Seleccionadas */}
            <Text style={[styles.fieldLabel, { color: theme.textSecondary, marginTop: 14 }]}>
              FOTOS SELECCIONADAS ({images.length})
            </Text>

            {images.length === 0 ? (
              <View style={[styles.emptyPhotos, { borderColor: theme.cardBorder, backgroundColor: theme.card }]}>
                <Ionicons name="camera-outline" size={44} color={theme.textMuted} />
                <Text style={[styles.emptyPhotosTitle, { color: theme.text }]}>Sin fotos todavía</Text>
                <Text style={[styles.emptyPhotosSub, { color: theme.textSecondary }]}>
                  Las fotos de calidad aumentan 5x el interés de los prospectos
                </Text>
              </View>
            ) : (
              <View style={styles.imageGrid}>
                {images.map((img, idx) => (
                  <View key={img.uri + idx} style={styles.thumbnailWrapper}>
                    <Image source={{ uri: img.uri }} style={styles.thumbnail} />
                    {idx === 0 && (
                      <View style={styles.coverBadge}>
                        <Text style={styles.coverBadgeText}>PORTADA</Text>
                      </View>
                    )}
                    <TouchableOpacity
                      onPress={() => handleRemoveImage(idx)}
                      style={styles.deletePhotoBtn}
                    >
                      <Ionicons name="trash" size={14} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Footer Nav Controls */}
      <View style={[styles.footerBar, { backgroundColor: theme.card, borderTopColor: theme.cardBorder }]}>
        {currentStep > 1 && (
          <Button
            title="Atrás"
            variant="secondary"
            onPress={handleBack}
            style={{ flex: 1 }}
          />
        )}

        {currentStep < 4 ? (
          <Button
            title="Siguiente"
            variant="primary"
            onPress={handleNext}
            style={{ flex: currentStep === 1 ? 1 : 2 }}
          />
        ) : (
          <Button
            title="Publicar Propiedad"
            variant="primary"
            loading={submitting}
            onPress={handleSubmit}
            style={{ flex: 2 }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  stepTrackItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotText: {
    fontSize: 11,
    fontWeight: '800',
  },
  stepLine: {
    flex: 1,
    height: 2,
    marginHorizontal: 4,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  stepBox: {
    gap: 10,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  stepSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeCard: {
    width: '48%',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    gap: 6,
  },
  typeCardText: {
    fontSize: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
    fontWeight: '600',
  },
  priceInput: {
    fontSize: 18,
    fontWeight: '800',
  },
  textArea: {
    height: 90,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  twoCol: {
    flexDirection: 'row',
    gap: 10,
  },
  vendorNoticeCard: {
    backgroundColor: 'rgba(168, 85, 247, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.25)',
    borderRadius: 18,
    padding: 14,
    gap: 10,
    marginTop: 14,
  },
  vendorNoticeTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#a855f7',
  },
  vendorNoticeDesc: {
    fontSize: 11,
    color: '#9333ea',
    lineHeight: 16,
  },
  photoActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 8,
  },
  photoActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  photoActionText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
  emptyPhotos: {
    borderRadius: 20,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    gap: 6,
    marginTop: 8,
  },
  emptyPhotosTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  emptyPhotosSub: {
    fontSize: 12,
    textAlign: 'center',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  thumbnailWrapper: {
    width: '48%',
    height: 120,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  coverBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#f97316',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  coverBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
  },
  deletePhotoBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.85)',
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    gap: 10,
    borderTopWidth: 1,
  },
});
