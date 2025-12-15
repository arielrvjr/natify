import { HttpClientPort, StoragePort } from "@nativefy/core";

/**
 * UseCase para cerrar sesión
 */
export class LogoutUseCase {
  constructor(
    private readonly http: HttpClientPort,
    private readonly secureStorage: StoragePort
  ) {}

  async execute(): Promise<void> {
    // Limpiar token y datos de usuario
    await this.secureStorage.removeItem("auth_token");
    await this.secureStorage.removeItem("user");

    // Remover header de autorización
    this.http.removeHeader("Authorization");
  }
}

