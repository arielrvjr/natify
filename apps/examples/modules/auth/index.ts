import { createModule, actionBus } from "@nativefy/core";

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
  .requires("http", "secureStorage", "navigation")

  // Pantallas
  .screen({
    name: "Login",
    component: LoginScreen,
    options: { headerShown: false },
  })
  .screen({
    name: "Register",
    component: RegisterScreen,
    options: { title: "Crear Cuenta" },
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

  // Registrar handler de logout en ActionBus para comunicación inter-módulo
  .onInit(async (adapters) => {
    const logoutUseCase = new LogoutUseCase(adapters.http, adapters.secureStorage);
    
    // Registrar acción de logout que otros módulos pueden invocar
    actionBus.register("auth:logout", async () => {
      await logoutUseCase.execute();
      console.log("[AuthModule] User logged out via ActionBus");
    });

    console.log("[AuthModule] Initialized with ActionBus handlers");
  })

  // Ruta inicial
  .initialRoute("Login")

  // Inicialización
  .onInit(async () => {
    console.log("[AuthModule] Initialized");
  })

  .build();

