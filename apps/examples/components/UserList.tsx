import { HttpClientPort, useAdapter } from '@nativefy/core';
import { useState } from 'react';
import { Button, Text, View } from 'react-native';

// --- Componente de Prueba (Consumidor) ---
const UserList = () => {
  // USAMOS EL FRAMEWORK: No importamos Axios, importamos 'http'
  const httpClient = useAdapter<HttpClientPort>('http');
  const [data, setData] = useState<any>(null);

  const fetchUsers = async () => {
    try {
      // TypeScript sabe que .get devuelve HttpResponse<T>
      const response = await httpClient.get(
        'https://jsonplaceholder.typicode.com/users/1',
      );
      setData(response.data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Button title="Cargar Usuario (vía Framework)" onPress={fetchUsers} />
      {data && <Text style={{ marginTop: 20 }}>Nombre: {data.name}</Text>}
    </View>
  );
};

export default UserList;
