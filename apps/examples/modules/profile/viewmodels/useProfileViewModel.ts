import { useState, useCallback, useEffect } from "react";
import {
  useBaseViewModel,
  useUseCase,
  useActionDispatch,
  useAdapter,
  NavigationPort,
  LoggerPort,
} from "@natify/core";
import { GetProfileUseCase } from "../usecases/GetProfileUseCase";
import { User } from "../../auth/usecases/LoginUseCase";

/**
 * ViewModel del perfil usando ActionBus para comunicación inter-módulo
 */
export function useProfileViewModel() {
  const [baseState, { execute }] = useBaseViewModel();
  const [user, setUser] = useState<User | null>(null);

  const getProfileUseCase = useUseCase<GetProfileUseCase>("profile:getProfile");
  
  // Usar hooks del core en lugar de adapters directamente
  const dispatch = useActionDispatch();
  const navigation = useAdapter<NavigationPort>('navigation');
  const logger = useAdapter<LoggerPort>('logger');

  const loadProfile = useCallback(async () => {
    const result = await execute(() => getProfileUseCase.execute());
    if (result) {
      setUser(result);
    }
  }, [getProfileUseCase, execute]);

  const goToSettings = useCallback(() => {
    navigation.navigate("profile/Settings");
  }, [navigation]);

  /**
   * Logout usando ActionBus - desacoplado del módulo Auth
   * El módulo Auth registra el handler para 'auth:logout'
   */
  const logout = useCallback(async () => {
    logger.info("[ProfileViewModel] Dispatching logout action...");
    const result = await dispatch({ type: "auth:logout" });
    logger.info("[ProfileViewModel] Logout result", { success: result.success });
    
    if (result.success) {
      // Navegar a login y limpiar el stack
      navigation.reset([{ name: "auth/Login" }]);
    } else {
      logger.error("[ProfileViewModel] Logout failed", result.error);
    }
  }, [dispatch, navigation, logger]);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    state: {
      ...baseState,
      user,
    },
    actions: {
      loadProfile,
      goToSettings,
      logout,
      goBack: handleGoBack,
    },
  };
}

