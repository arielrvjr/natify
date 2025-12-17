import { useCallback, useEffect } from "react";
import { useFormik } from "formik";
import {
  useBaseViewModel,
  useUseCase,
  useAdapter,
  NavigationPort,
  ValidationPort,
} from "@nativefy/core";
import { useTheme } from "@nativefy/ui";
import { LoginUseCase } from "../usecases/LoginUseCase";
import { GetAppPreferencesUseCase } from "../../shared/usecases/GetAppPreferencesUseCase";

interface LoginFormValues {
  email: string;
  password: string;
}

/**
 * ViewModel de login usando Formik directamente y ValidationPort
 *
 * Usa Formik directamente (sin adapter) para simplicidad, pero mantiene
 * ValidationPort para crear esquemas de forma consistente y poder
 * intercambiar entre Yup y Zod fácilmente.
 */
export function useLoginViewModel() {
  const [baseState, { execute, clearError }] = useBaseViewModel();
  const loginUseCase = useUseCase<LoginUseCase>("auth:login");
  const navigation = useAdapter<NavigationPort>("navigation");
  const validator = useAdapter<ValidationPort>("validation");
  const { setDarkMode } = useTheme();
  const getPreferences = useUseCase<GetAppPreferencesUseCase>(
    "shared:getAppPreferences",
  );

  // Cargar preferencias al montar (primera pantalla del módulo inicial)
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const preferences = await getPreferences.execute();
        // Sincronizar dark mode con ThemeProvider
        setDarkMode(preferences.darkMode);
      } catch (error) {
        console.error("[useLoginViewModel] Error loading preferences:", error);
      }
    };

    loadPreferences();
  }, [getPreferences, setDarkMode]);

  // Crear esquema de validación usando ValidationPort
  const validationSchema = validator.createSchema({
    email: validator.string().email("Email inválido").required("El email es requerido").build(),
    password: validator.string().min(6, "La contraseña debe tener al menos 6 caracteres").required("La contraseña es requerida").build(),
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
      email: formik.values.email,
      password: formik.values.password,
      fieldErrors: {
        email: formik.errors.email,
        password: formik.errors.password,
      },
      isFormValid: Object.keys(formik.errors).length === 0,
      isFormDirty: formik.dirty,
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

