import { createModule } from "@nativefy/core";
import { ProfileScreen } from "./screens/ProfileScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { GetProfileUseCase } from "./usecases/GetProfileUseCase";

export const ProfileModule = createModule("profile", "Profile")
  .requires("http", "storage", "secureStorage", "navigation", "biometrics", "permissions", "imagePicker")
  .screen({
    name: "Profile",
    component: ProfileScreen,
    options: { headerShown: false },
  })
  .screen({
    name: "Settings",
    component: SettingsScreen,
    options: { title: "Configuración" },
  })
  // Tipos inferidos automáticamente
  .useCase("getProfile", (adapters) =>
    new GetProfileUseCase(adapters.secureStorage)
  )
  .initialRoute("Profile")
  .build();

