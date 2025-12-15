/**
 * Contenedor de Inyección de Dependencias
 *
 * Permite registrar y resolver dependencias de forma centralizada.
 * Soporta factories y singletons.
 */

type Factory<T> = () => T;

export class DIContainer {
  private singletons = new Map<string, unknown>();
  private factories = new Map<string, Factory<unknown>>();

  /**
   * Registra una factory que crea una nueva instancia cada vez
   */
  register<T>(key: string, factory: Factory<T>): void {
    this.factories.set(key, factory);
  }

  /**
   * Registra un singleton (una sola instancia compartida)
   */
  singleton<T>(key: string, factory: Factory<T>): void {
    this.factories.set(key, () => {
      if (!this.singletons.has(key)) {
        this.singletons.set(key, factory());
      }
      return this.singletons.get(key);
    });
  }

  /**
   * Registra una instancia ya creada como singleton
   */
  instance<T>(key: string, instance: T): void {
    this.singletons.set(key, instance);
    this.factories.set(key, () => this.singletons.get(key));
  }

  /**
   * Resuelve una dependencia por su key
   */
  resolve<T>(key: string): T {
    const factory = this.factories.get(key);
    if (!factory) {
      throw new Error(`[DIContainer] Dependency not registered: "${key}"`);
    }
    return factory() as T;
  }

  /**
   * Intenta resolver una dependencia, retorna undefined si no existe
   */
  tryResolve<T>(key: string): T | undefined {
    const factory = this.factories.get(key);
    if (!factory) {
      return undefined;
    }
    return factory() as T;
  }

  /**
   * Verifica si una dependencia está registrada
   */
  has(key: string): boolean {
    return this.factories.has(key);
  }

  /**
   * Elimina una dependencia registrada
   */
  remove(key: string): void {
    this.factories.delete(key);
    this.singletons.delete(key);
  }

  /**
   * Limpia todas las dependencias
   */
  clear(): void {
    this.factories.clear();
    this.singletons.clear();
  }

  /**
   * Obtiene todas las keys registradas
   */
  getKeys(): string[] {
    return Array.from(this.factories.keys());
  }
}

/**
 * Instancia global del contenedor
 */
export const container = new DIContainer();
