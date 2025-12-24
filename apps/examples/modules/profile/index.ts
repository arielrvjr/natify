import { createModule } from "@natify/core";
import { createTopAppBarHeader } from "@natify/ui";
import { ProfileScreen } from "./screens/ProfileScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { GetProfileUseCase } from "./usecases/GetProfileUseCase";

export const ProfileModule = createModule("profile", "Profile")
  .requires("http", "storage", "secureStorage", "navigation", "biometrics", "permissions", "imagePicker")
  .screen({
    name: "Profile",
    component: ProfileScreen,
    options: createTopAppBarHeader({
      title: "Perfil",
      showBack: true,
    }),
  })
  .screen({
    name: "Settings",
    component: SettingsScreen,
    options: createTopAppBarHeader({
      title: "Configuración",
      showBack: true,
    }),
  })
  // Tipos inferidos automáticamente
  .useCase("getProfile", (adapters) =>
    new GetProfileUseCase(adapters.secureStorage)
  )
  .initialRoute("Profile")
  .build();

