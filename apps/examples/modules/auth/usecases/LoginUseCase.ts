import {
  HttpClientPort,
  StoragePort,
  NativefyError,
  NativefyErrorCode,
} from "@nativefy/core";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

/**
 * UseCase para iniciar sesión
 */
export class LoginUseCase {
  constructor(
    private readonly http: HttpClientPort,
    private readonly secureStorage: StoragePort
  ) {}

  async execute(credentials: LoginCredentials): Promise<User> {
    // Validación de negocio
    if (!credentials.email || !credentials.email.includes("@")) {
      throw new NativefyError(
        NativefyErrorCode.VALIDATION_ERROR,
        "Por favor ingresa un email válido"
      );
    }

    if (!credentials.password || credentials.password.length < 4) {
      throw new NativefyError(
        NativefyErrorCode.VALIDATION_ERROR,
        "La contraseña debe tener al menos 4 caracteres"
      );
    }

    // Simular llamada a API (usando jsonplaceholder)
    // En una app real, esto sería POST /auth/login
    const response = await this.http.get<User>(
      `https://jsonplaceholder.typicode.com/users/1`
    );

    // Simular token
    const fakeToken = `token_${Date.now()}_${response.data.id}`;

    // Guardar token de forma segura
    await this.secureStorage.setItem("auth_token", fakeToken);
    await this.secureStorage.setItem("user", response.data);

    // Configurar header para futuras peticiones
    this.http.setHeader("Authorization", `Bearer ${fakeToken}`);

    return response.data;
  }
}

