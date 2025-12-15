import { useState, useCallback } from "react";
import {
  useBaseViewModel,
  useUseCase,
  useAdapter,
  NavigationPort,
} from "@nativefy/core";
import { LoginUseCase } from "../usecases/LoginUseCase";

export function useLoginViewModel() {
  // Estado base (loading, error)
  const [baseState, { execute, clearError }] = useBaseViewModel();

  // Estado del formulario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UseCase inyectado
  const loginUseCase = useUseCase<LoginUseCase>("auth:login");

  // Navigation
  const navigation = useAdapter<NavigationPort>("navigation");

  const handleSetEmail = useCallback(
    (value: string) => {
      setEmail(value);
      clearError();
    },
    [clearError]
  );

  const handleSetPassword = useCallback(
    (value: string) => {
      setPassword(value);
      clearError();
    },
    [clearError]
  );

  const login = useCallback(async () => {
    const result = await execute(() =>
      loginUseCase.execute({ email, password })
    );

    if (result) {
      // Éxito - navegar a Products
      navigation.reset([{ name: "products/ProductList" }]);
    }
  }, [email, password, loginUseCase, navigation, execute]);

  const goToRegister = useCallback(() => {
    navigation.navigate("auth/Register");
  }, [navigation]);

  return {
    state: {
      ...baseState,
      email,
      password,
    },
    actions: {
      setEmail: handleSetEmail,
      setPassword: handleSetPassword,
      login,
      goToRegister,
      clearError,
    },
  };
}

