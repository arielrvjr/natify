import { StoragePort } from "@nativefy/core";
import { User } from "../../auth/usecases/LoginUseCase";

/**
 * UseCase para obtener el perfil del usuario
 */
export class GetProfileUseCase {
  constructor(private readonly secureStorage: StoragePort) {}

  async execute(): Promise<User | null> {
    const user = await this.secureStorage.getItem<User>("user");
    return user;
  }
}

