import { HttpClientPort, StoragePort } from "@nativefy/core";
import { User } from "./LoginUseCase";

/**
 * UseCase para verificar si hay sesión activa
 */
export class CheckAuthUseCase {
  constructor(
    private readonly http: HttpClientPort,
    private readonly secureStorage: StoragePort
  ) {}

  async execute(): Promise<User | null> {
    const token = await this.secureStorage.getItem<string>("auth_token");

    if (!token) {
      return null;
    }

    // Configurar header
    this.http.setHeader("Authorization", `Bearer ${token}`);

    // Obtener usuario guardado
    const user = await this.secureStorage.getItem<User>("user");

    return user;
  }
}

