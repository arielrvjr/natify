import { useCallback } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import {
  useBaseViewModel,
  useAdapter,
  NavigationPort,
} from "@natify/core";

interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/**
 * ViewModel de registro usando Formik directamente con Yup
 *
 * Usa Formik directamente con esquemas de Yup para validación.
 */
export function useRegisterViewModel() {
  const [baseState, { execute, clearError }] = useBaseViewModel();
  const navigation = useAdapter<NavigationPort>("navigation");

  // Crear esquema de validación usando Yup directamente
  const validationSchema = yup.object({
    name: yup.string().min(2, "El nombre debe tener al menos 2 caracteres").required("El nombre es requerido"),
    email: yup.string().email("Email inválido").required("El email es requerido"),
    password: yup.string().min(6, "La contraseña debe tener al menos 6 caracteres").required("La contraseña es requerida"),
    confirmPassword: yup.string().required("Confirma tu contraseña"),
  });

  // Usar Formik directamente (sin adapter)
  const formik = useFormik<RegisterFormValues>({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema,
    validate: (values) => {
      const errors: Partial<Record<keyof RegisterFormValues, string>> = {};
      
      // Validación personalizada: contraseñas deben coincidir
      if (values.password !== values.confirmPassword) {
        errors.confirmPassword = "Las contraseñas no coinciden";
      }

      return errors;
    },
    onSubmit: async (_values) => {
      await execute(async () => {
        // Simular registro
        await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000));
        // En una app real, llamaría al API
      });

      // Volver a login después de registro exitoso
      navigation.goBack();
    },
    validateOnChange: false, // No validar todos los campos al cambiar uno
    validateOnBlur: true, // Validar solo el campo cuando se hace blur
  });

  const register = useCallback(async () => {
    // Validar antes de enviar
    const errors = await formik.validateForm();
    if (Object.keys(errors).length > 0) {
      return;
    }

    // Enviar formulario
    await formik.submitForm();
  }, [formik]);

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Limpiar error del campo cuando cambia (solo si ya fue tocado)
  const handleSetName = useCallback((value: string) => {
    formik.setFieldValue("name", value, false);
    if (formik.touched.name) {
      formik.validateField("name");
    }
  }, [formik]);

  const handleSetEmail = useCallback((value: string) => {
    formik.setFieldValue("email", value, false);
    if (formik.touched.email) {
      formik.validateField("email");
    }
  }, [formik]);

  const handleSetPassword = useCallback((value: string) => {
    formik.setFieldValue("password", value, false);
    if (formik.touched.password) {
      formik.validateField("password");
    }
    // También validar confirmPassword si fue tocado
    if (formik.touched.confirmPassword) {
      formik.validateField("confirmPassword");
    }
  }, [formik]);

  const handleSetConfirmPassword = useCallback((value: string) => {
    formik.setFieldValue("confirmPassword", value, false);
    if (formik.touched.confirmPassword) {
      formik.validateField("confirmPassword");
    }
  }, [formik]);

  return {
    state: {
      ...baseState,
      name: formik.values.name,
      email: formik.values.email,
      password: formik.values.password,
      confirmPassword: formik.values.confirmPassword,
      fieldErrors: {
        name: formik.errors.name,
        email: formik.errors.email,
        password: formik.errors.password,
        confirmPassword: formik.errors.confirmPassword,
      },
      isFormValid: Object.keys(formik.errors).length === 0,
      isFormDirty: formik.dirty,
    },
    actions: {
      setName: handleSetName,
      setEmail: handleSetEmail,
      setPassword: handleSetPassword,
      setConfirmPassword: handleSetConfirmPassword,
      register,
      goBack,
      clearError,
      handleBlur: formik.handleBlur,
      handleChange: formik.handleChange,
    },
  };
}

