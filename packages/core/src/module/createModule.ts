import {
  ModuleDefinition,
  ScreenDefinition,
  UseCaseDefinition,
  RequiredCapability,
  TypedAdapterMap,
} from './types';

/**
 * Builder para crear módulos de forma fluida con tipos inferidos
 */
interface ModuleBuilder<C extends RequiredCapability[] = []> {
  /**
   * Define las capacidades requeridas por el módulo.
   * Los adapters estarán tipados según estas capacidades.
   */
  requires<T extends RequiredCapability[]>(...capabilities: T): ModuleBuilder<[...C, ...T]>;

  /**
   * Agrega una pantalla al módulo
   */
  screen(definition: ScreenDefinition): ModuleBuilder<C>;

  /**
   * Agrega un UseCase al módulo.
   * La factory recibe adapters tipados según las capacidades declaradas.
   */
  useCase<T>(key: string, factory: (adapters: TypedAdapterMap<C>) => T): ModuleBuilder<C>;

  /**
   * Define la ruta inicial del módulo
   */
  initialRoute(route: string): ModuleBuilder<C>;

  /**
   * Define la función de inicialización
   */
  onInit(fn: (adapters: TypedAdapterMap<C>) => Promise<void> | void): ModuleBuilder<C>;

  /**
   * Define la función de cleanup
   */
  onDestroy(fn: () => Promise<void> | void): ModuleBuilder<C>;

  /**
   * Construye el módulo
   */
  build(): ModuleDefinition<C>;
}

/**
 * Crea un nuevo módulo usando el patrón builder con tipos inferidos.
 *
 * Las capacidades declaradas en `.requires()` determinan los tipos
 * de los adapters disponibles en las factories de UseCases.
 *
 * @example
 * ```typescript
 * const AuthModule = createModule('auth', 'Authentication')
 *   .requires('http', 'secureStorage', 'navigation')
 *   .screen({ name: 'Login', component: LoginScreen })
 *   .useCase('login', (adapters) => {
 *     // adapters.http es HttpClientPort
 *     // adapters.secureStorage es StoragePort
 *     // adapters.navigation es NavigationPort
 *     return new LoginUseCase(adapters.http, adapters.secureStorage);
 *   })
 *   .build();
 * ```
 */
export function createModule<C extends RequiredCapability[] = []>(
  id: string,
  name: string,
): ModuleBuilder<C> {
  const definition: ModuleDefinition<C> = {
    id,
    name,
    requires: [] as unknown as C,
    screens: [],
    useCases: [],
    initialRoute: undefined,
  };

  const builder: ModuleBuilder<C> = {
    requires<T extends RequiredCapability[]>(...capabilities: T) {
      (definition.requires as RequiredCapability[]).push(...capabilities);
      return builder as unknown as ModuleBuilder<[...C, ...T]>;
    },

    screen(screenDef) {
      definition.screens.push(screenDef);
      // Si no hay ruta inicial, usar la primera pantalla
      if (!definition.initialRoute) {
        definition.initialRoute = screenDef.name;
      }
      return builder;
    },

    useCase<T>(key: string, factory: (adapters: TypedAdapterMap<C>) => T) {
      definition.useCases.push({ key, factory } as UseCaseDefinition<T, C>);
      return builder;
    },

    initialRoute(route) {
      definition.initialRoute = route;
      return builder;
    },

    onInit(fn) {
      definition.onInit = fn;
      return builder;
    },

    onDestroy(fn) {
      definition.onDestroy = fn;
      return builder;
    },

    build() {
      // Validaciones
      if (!definition.id) {
        throw new Error('Module must have an id');
      }

      // Módulos sin pantallas (compartidos) deben tener al menos un UseCase
      if (definition.screens.length === 0) {
        if (definition.useCases.length === 0) {
          throw new Error(`Module "${definition.id}" must have at least one screen or one UseCase`);
        }
        // Módulos compartidos no necesitan initialRoute
        return definition;
      }

      // Módulos con pantallas deben tener initialRoute
      if (!definition.initialRoute) {
        definition.initialRoute = definition.screens[0].name;
      }

      // Verificar que la ruta inicial existe
      const initialScreen = definition.screens.find(s => s.name === definition.initialRoute);
      if (!initialScreen) {
        throw new Error(
          `Module "${definition.id}": initialRoute "${definition.initialRoute}" does not match any screen`,
        );
      }

      return definition;
    },
  };

  return builder;
}
