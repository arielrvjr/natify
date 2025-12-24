/**
 * Serializa un valor para almacenarlo en AsyncStorage (solo strings)
 */
export function serializeValue<T>(value: T): string {
  const serializers: Record<string, (val: T) => string> = {
    object: val => JSON.stringify(val),
    string: val => val as unknown as string,
    number: val => (val as unknown as number).toString(),
    boolean: val => (val as unknown as boolean).valueOf().toString(),
  };

  const type = typeof value;
  const serializer = serializers[type];

  if (!serializer) {
    return String(value);
  }

  return serializer(value);
}
