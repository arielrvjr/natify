import { useState, useCallback } from "react";
import {
  useBaseViewModel,
  useAdapter,
  NavigationPort,
  NativefyError,
  NativefyErrorCode,
} from "@nativefy/core";

export function useRegisterViewModel() {
  const [baseState, { execute, clearError, setError }] = useBaseViewModel();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigation = useAdapter<NavigationPort>("navigation");

  const register = useCallback(async () => {
    // Validaciones
    if (!name || name.length < 2) {
      setError(
        new NativefyError(
          NativefyErrorCode.VALIDATION_ERROR,
          "El nombre debe tener al menos 2 caracteres"
        )
      );
      return;
    }

    if (!email.includes("@")) {
      setError(
        new NativefyError(
          NativefyErrorCode.VALIDATION_ERROR,
          "Email inválido"
        )
      );
      return;
    }

    if (password.length < 6) {
      setError(
        new NativefyError(
          NativefyErrorCode.VALIDATION_ERROR,
          "La contraseña debe tener al menos 6 caracteres"
        )
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        new NativefyError(
          NativefyErrorCode.VALIDATION_ERROR,
          "Las contraseñas no coinciden"
        )
      );
      return;
    }

    await execute(async () => {
      // Simular registro
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // En una app real, llamaría al API
    });

    // Volver a login después de registro exitoso
    navigation.goBack();
  }, [name, email, password, confirmPassword, execute, setError, navigation]);

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return {
    state: {
      ...baseState,
      name,
      email,
      password,
      confirmPassword,
    },
    actions: {
      setName,
      setEmail,
      setPassword,
      setConfirmPassword,
      register,
      goBack,
      clearError,
    },
  };
}

