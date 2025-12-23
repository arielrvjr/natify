import { createModule, actionBus, LoggerPort } from "@nativefy/core";

// Screens
import { LoginScreen } from "./screens/LoginScreen";
import { RegisterScreen } from "./screens/RegisterScreen";

// UseCases
import { LoginUseCase } from "./usecases/LoginUseCase";
import { LogoutUseCase } from "./usecases/LogoutUseCase";
import { CheckAuthUseCase } from "./usecases/CheckAuthUseCase";

/**
 * Módulo de Autenticación
 *
 */
export const AuthModule = createModule("auth", "Authentication")
  // Capacidades requeridas - tipos inferidos automáticamente
  .requires("http", "secureStorage", "navigation", "logger")

  // Pantallas
  .screen({
    name: "Login",
    component: LoginScreen,
    options: { headerShown: false },
    // Deeplink automático: "auth/login"
    // O personalizado:
    // deeplink: { path: "login" }
  })
  .screen({
    name: "Register",
    component: RegisterScreen,
    options: { title: "Crear Cuenta" },
    // Deeplink automático: "auth/register"
  })

  // UseCases - adapters.http es HttpClientPort, adapters.secureStorage es StoragePort
  .useCase("login", (adapters) =>
    new LoginUseCase(adapters.http, adapters.secureStorage)
  )
  .useCase("logout", (adapters) =>
    new LogoutUseCase(adapters.http, adapters.secureStorage)
  )
  .useCase("checkAuth", (adapters) =>
    new CheckAuthUseCase(adapters.http, adapters.secureStorage)
  )

  // Ruta inicial
  .initialRoute("Login")

  // Inicialización - Registrar handler de logout en ActionBus para comunicación inter-módulo
  .onInit(async (adapters) => {
    const logger = adapters.logger as LoggerPort;
    logger.info("[AuthModule] Starting initialization...");
    
    const logoutUseCase = new LogoutUseCase(adapters.http, adapters.secureStorage);
    
    // Registrar acción de logout que otros módulos pueden invocar
    actionBus.register("auth:logout", async (action) => {
      logger.info("[AuthModule] Logout action received", { action });
      await logoutUseCase.execute();
      logger.info("[AuthModule] User logged out via ActionBus");
    });

    // Verificar que el handler se registró
    const hasHandler = actionBus.hasHandlers("auth:logout");
    logger.info("[AuthModule] Handler registered", { hasHandler });
    logger.info("[AuthModule] Initialized with ActionBus handlers");
  })

  .build();

