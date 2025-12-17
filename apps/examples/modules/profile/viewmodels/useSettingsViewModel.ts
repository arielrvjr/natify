import { useState, useCallback, useEffect } from "react";
import { Alert } from "react-native";
import {
  useBaseViewModel,
  useAdapter,
  useUseCase,
  NavigationPort,
  BiometricPort,
  PermissionPort,
  PermissionStatus,
  ImagePickerPort,
} from "@nativefy/core";
import { useTheme } from "@nativefy/ui";
import { GetAppPreferencesUseCase } from "../../shared/usecases/GetAppPreferencesUseCase";
import { UpdateAppPreferencesUseCase } from "../../shared/usecases/UpdateAppPreferencesUseCase";
import { UpdateDarkModeUseCase } from "../../shared/usecases/UpdateDarkModeUseCase";
import { AppPreferences } from "../../shared/types/AppPreferences";

export function useSettingsViewModel() {
  const [baseState, { execute }] = useBaseViewModel();
  const { isDark, setDarkMode } = useTheme();
  
  const [settings, setSettings] = useState<AppPreferences>({
    notifications: true,
    darkMode: false,
    language: "es",
    biometricsEnabled: false
  });
  const [biometryAvailable, setBiometryAvailable] = useState(false);
  const [biometryType, setBiometryType] = useState<string>("");
  const [cameraPermissionStatus, setCameraPermissionStatus] = useState<PermissionStatus | null>(null);

  const navigation = useAdapter<NavigationPort>("navigation");
  const biometrics = useAdapter<BiometricPort>("biometrics");
  const permissions = useAdapter<PermissionPort>("permissions");
  const imagePicker = useAdapter<ImagePickerPort>("imagePicker");

  // UseCases del módulo shared
  const getPreferences = useUseCase<GetAppPreferencesUseCase>("shared:getAppPreferences");
  const updatePreferences = useUseCase<UpdateAppPreferencesUseCase>("shared:updateAppPreferences");
  const updateDarkMode = useUseCase<UpdateDarkModeUseCase>("shared:updateDarkMode");

  const updateSetting = useCallback(
    async <K extends keyof AppPreferences>(key: K, value: AppPreferences[K]) => {
      await execute(async () => {
        const updated = await updatePreferences.execute({ [key]: value });
        setSettings(updated);
      });
    },
    [updatePreferences, execute]
  );

  const toggleNotifications = useCallback(() => {
    updateSetting("notifications", !settings.notifications);
  }, [settings.notifications, updateSetting]);

  const toggleDarkMode = useCallback(async () => {
    const newDarkMode = !isDark; // Usar isDark del ThemeProvider como fuente de verdad
    
    await execute(async () => {
      // Actualizar preferencias usando UseCase
      const updated = await updateDarkMode.execute(newDarkMode);
      setSettings(updated);
      
      // Actualizar el tema globalmente usando ThemeProvider
      setDarkMode(newDarkMode);
    });
  }, [isDark, setDarkMode, updateDarkMode, execute]);

  const toggleBiometrics = useCallback(async () => {
    if (!settings.biometricsEnabled) {
      // Activar biometría - primero verificar disponibilidad
      const available = await biometrics.isAvailable();
      if (!available) {
        Alert.alert("Biometría", "La biometría no está disponible en este dispositivo");
        return;
      }

      // Autenticar con biometría
      const result = await biometrics.authenticate("Activar autenticación biométrica");
      if (result.success) {
        updateSetting("biometricsEnabled", true);
      } else {
        Alert.alert("Error", result.error || "Error al activar biometría");
      }
    } else {
      // Desactivar biometría
      updateSetting("biometricsEnabled", false);
    }
  }, [settings.biometricsEnabled, biometrics, updateSetting]);

  const requestCameraPermission = useCallback(async () => {
    const status = await permissions.request("camera");
    setCameraPermissionStatus(status);
    
    if (status === PermissionStatus.GRANTED) {
      Alert.alert("Permiso concedido", "El permiso de cámara ha sido concedido");
    } else if (status === PermissionStatus.BLOCKED) {
      Alert.alert(
        "Permiso bloqueado",
        "El permiso fue bloqueado. Por favor, habilítalo en configuración.",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Abrir configuración", onPress: () => permissions.openSettings() },
        ]
      );
    } else {
      Alert.alert("Permiso denegado", "El permiso de cámara fue denegado");
    }
  }, [permissions]);

  const requestPhotoLibraryPermission = useCallback(async () => {
    const status = await permissions.request("photoLibrary");
    
    if (status === PermissionStatus.GRANTED) {
      Alert.alert("Permiso concedido", "El permiso de galería ha sido concedido");
    } else if (status === PermissionStatus.BLOCKED) {
      Alert.alert(
        "Permiso bloqueado",
        "El permiso fue bloqueado. Por favor, habilítalo en configuración.",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Abrir configuración", onPress: () => permissions.openSettings() },
        ]
      );
    } else {
      Alert.alert("Permiso denegado", "El permiso de galería fue denegado");
    }
  }, [permissions]);

  const pickImage = useCallback(async () => {
    try {
      const result = await imagePicker.pickImage({
        quality: 0.8,
        maxWidth: 800,
        maxHeight: 800,
      });
      
      if (result) {
        Alert.alert("Imagen seleccionada", `Archivo: ${result.fileName || "Sin nombre"}\nTamaño: ${result.fileSize ? `${(result.fileSize / 1024).toFixed(2)} KB` : "Desconocido"}`);
      }
    } catch (error) {
      Alert.alert("Error", `Error al seleccionar imagen: ${error instanceof Error ? error.message : "Error desconocido"}`);
    }
  }, [imagePicker]);

  const checkBiometryAvailability = useCallback(async () => {
    const available = await biometrics.isAvailable();
    setBiometryAvailable(available);
    
    if (available) {
      const type = await biometrics.getBiometryType();
      setBiometryType(type === "FaceID" ? "Face ID" : type === "Fingerprint" ? "Touch ID" : "Biometría");
    }
  }, [biometrics]);

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Cargar configuración guardada al iniciar
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await getPreferences.execute();
        setSettings(savedSettings);
        
        // Sincronizar el tema con el ThemeProvider si hay una preferencia guardada
        if (savedSettings.darkMode !== isDark) {
          setDarkMode(savedSettings.darkMode);
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };
    
    loadSettings();
    checkBiometryAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sincronizar settings.darkMode con isDark cuando cambia el tema
  useEffect(() => {
    if (settings.darkMode !== isDark) {
      setSettings(prev => ({ ...prev, darkMode: isDark }));
    }
  }, [isDark, settings.darkMode]);

  return {
    state: {
      ...baseState,
      settings: {
        ...settings,
        darkMode: isDark, // Sincronizar con el tema actual
      },
      biometryAvailable,
      biometryType,
      cameraPermissionStatus,
    },
    actions: {
      toggleNotifications,
      toggleDarkMode,
      toggleBiometrics,
      requestCameraPermission,
      requestPhotoLibraryPermission,
      pickImage,
      checkBiometryAvailability,
      goBack,
    },
  };
}

