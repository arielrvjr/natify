export interface GraphQLPort {
  /**
   * Ejecuta una consulta de lectura.
   * @param query El string de la query o documento GQL
   * @param variables Variables opcionales
   */
  query<T>(query: string, variables?: Record<string, any>): Promise<T>;

  /**
   * Ejecuta una modificación de datos.
   */
  mutate<T>(mutation: string, variables?: Record<string, any>): Promise<T>;

  /**
   * Opcional: Para resetear caché al hacer logout
   */
  clearCache(): Promise<void>;
}
