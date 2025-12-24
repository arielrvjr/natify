import { CapabilityPortMap, RequiredCapability } from '../types/adapters';
import { Port } from '../ports/Port';

/**
 * Tipo para validar que un mapa de adapters contenga todas las capacidades requeridas.
 *
 * Uso en compile-time:
 * ```typescript
 * type MyAdapters = ValidateAdapters<
 *   typeof myAdapters,
 *   ['http', 'storage', 'navigation']
 * >;
 * ```
 */
export type ValidateAdapters<
  TAdapters extends Record<string, Port>,
  TRequired extends RequiredCapability[],
> = {
  [K in TRequired[number]]: K extends keyof TAdapters
    ? TAdapters[K] extends CapabilityPortMap[K]
      ? TAdapters[K]
      : `Error: Adapter '${K}' does not match expected type ${K}`
    : `Error: Missing required adapter '${K}'`;
};

/**
 * Helper para verificar adapters en runtime con mensajes de error claros
 */
export function validateAdaptersConfig<C extends RequiredCapability[]>(
  adapters: Record<string, Port>,
  required: C,
): void {
  const errors: string[] = [];

  for (const capability of required) {
    if (!(capability in adapters)) {
      errors.push(`Missing required adapter: '${capability}'`);
    } else if (!adapters[capability]) {
      errors.push(`Adapter '${capability}' is null or undefined`);
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `[Natify] Adapter configuration errors:\n${errors.map(e => `  - ${e}`).join('\n')}`,
    );
  }
}

/**
 * Helper type para crear un mapa de adapters tipado
 *
 * @example
 * ```typescript
 * const adapters: AdaptersFor<['http', 'storage', 'navigation']> = {
 *   http: new AxiosHttpAdapter(),
 *   storage: new MMKVStorageAdapter(),
 *   navigation: createReactNavigationAdapter(),
 * };
 * ```
 */
export type AdaptersFor<C extends RequiredCapability[]> = {
  [K in C[number]]: CapabilityPortMap[K];
};

/**
 * Tipo para asegurar que un objeto tiene todas las propiedades requeridas
 */
export type EnsureCapabilities<
  T extends Record<string, unknown>,
  Required extends string,
> = Required extends keyof T ? T : T & { [K in Required]: never };
