import { useCallback, useEffect, useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import {
  useBaseViewModel,
  useUseCase,
  useAdapter,
  NavigationPort,
} from "@natify/core";
import { useTheme } from "@natify/ui";
import { LoginUseCase } from "../usecases/LoginUseCase";
import { CheckAuthUseCase } from "../usecases/CheckAuthUseCase";
import { GetAppPreferencesUseCase } from "../../shared/usecases/GetAppPreferencesUseCase";

interface LoginFormValues {
  email: string;
  password: string;
}

/**
 * ViewModel de login usando Formik directamente con Yup
 *
 * Usa Formik directamente con esquemas de Yup para validación.
 */
export function useLoginViewModel() {
  const [baseState, { execute, clearError, setLoading }] = useBaseViewModel();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const loginUseCase = useUseCase<LoginUseCase>("auth:login");
  const checkAuthUseCase = useUseCase<CheckAuthUseCase>("auth:checkAuth");
  const navigation = useAdapter<NavigationPort>("navigation");
  const { setDarkMode } = useTheme();
  const getPreferences = useUseCase<GetAppPreferencesUseCase>(
    "shared:getAppPreferences",
  );

  // Cargar preferencias y verificar autenticación al montar
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      setIsCheckingAuth(true);
      
      try {
        // Cargar preferencias
        const preferences = await getPreferences.execute();
        // Sincronizar dark mode con ThemeProvider
        setDarkMode(preferences.darkMode);

        // Verificar si hay sesión activa
        const user = await checkAuthUseCase.execute();
        if (user) {
          // Si hay sesión activa, redirigir a la pantalla principal
          navigation.reset([{ name: "products/ProductList" }]);
        }
      } catch (error) {
        console.error("[useLoginViewModel] Error initializing:", error);
      } finally {
        setLoading(false);
        setIsCheckingAuth(false);
      }
    };

    initialize();
  }, [getPreferences, setDarkMode, checkAuthUseCase, navigation, setLoading]);

  // Crear esquema de validación usando Yup directamente
  const validationSchema = yup.object({
    email: yup.string().email("Email inválido").required("El email es requerido"),
    password: yup.string().min(6, "La contraseña debe tener al menos 6 caracteres").required("La contraseña es requerida"),
  });

  // Usar Formik directamente (sin adapter)
  const formik = useFormik<LoginFormValues>({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      const result = await execute(() =>
        loginUseCase.execute({ email: values.email, password: values.password })
      );

      if (result) {
        // Éxito - navegar a Products
        navigation.reset([{ name: "products/ProductList" }]);
      }
    },
    validateOnChange: false, // No validar todos los campos al cambiar uno
    validateOnBlur: true, // Validar solo el campo cuando se hace blur
  });

  const login = useCallback(async () => {
    // Validar antes de enviar
    const errors = await formik.validateForm();
    if (Object.keys(errors).length > 0) {
      return;
    }

    // Enviar formulario
    await formik.submitForm();
  }, [formik]);

  const goToRegister = useCallback(() => {
    navigation.navigate("auth/Register");
  }, [navigation]);

  // Validar campo cuando cambia si ya fue tocado o tiene un error
  const handleSetEmail = useCallback((value: string) => {
    formik.setFieldValue("email", value, false);
    // Validar si el campo ya fue tocado o tiene un error (para quitar el error cuando se corrige)
    if (formik.touched.email || formik.errors.email) {
      formik.validateField("email");
    }
  }, [formik]);

  const handleSetPassword = useCallback((value: string) => {
    formik.setFieldValue("password", value, false);
    // Validar si el campo ya fue tocado o tiene un error (para quitar el error cuando se corrige)
    if (formik.touched.password || formik.errors.password) {
      formik.validateField("password");
    }
  }, [formik]);

  // Handlers de blur específicos para cada campo
  const handleEmailBlur = useCallback(() => {
    formik.setFieldTouched("email", true);
    formik.validateField("email");
  }, [formik]);

  const handlePasswordBlur = useCallback(() => {
    formik.setFieldTouched("password", true);
    formik.validateField("password");
  }, [formik]);

  return {
    state: {
      ...baseState,
      isLoading: baseState.isLoading || isCheckingAuth,
      email: formik.values.email,
      password: formik.values.password,
      fieldErrors: {
        email: formik.errors.email,
        password: formik.errors.password,
      },
      isFormValid: Object.keys(formik.errors).length === 0,
      isFormDirty: formik.dirty,
      isCheckingAuth,
    },
    actions: {
      setEmail: handleSetEmail,
      setPassword: handleSetPassword,
      login,
      goToRegister,
      clearError,
      handleEmailBlur,
      handlePasswordBlur,
    },
  };
}

