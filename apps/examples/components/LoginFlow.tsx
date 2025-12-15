import {
  StoragePort,
  HttpClientPort,
  NativefyError,
  NativefyErrorCode,
  useAdapter,
} from '@nativefy/core';
import { useState } from 'react';
import { Alert, Button, Text, View } from 'react-native';

const LoginFlow = () => {
  // Inyección por nombre o tipo
  const storage = useAdapter<StoragePort>('storage');
  const http = useAdapter<HttpClientPort>('http');

  const [status, setStatus] = useState('Esperando...');

  const doLogin = async () => {
    try {
      setStatus('Autenticando...');

      // 1. Petición HTTP (Simulada)
      // Forzamos un error para probar el sistema (cambia la URL para probar éxito)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const response = await http.get<{ id: number }>(
        'https://jsonplaceholder.typicode.com/users/1',
      );

      // 2. Guardar Token (Usando MMKV transparente)
      await storage.setItem('auth_token', 'token-super-secreto-123');

      const savedToken = await storage.getItem('auth_token');
      setStatus(`¡Éxito! Token guardado: ${savedToken}`);
    } catch (error) {
      // 3. Manejo de Errores Tipado (Governance)
      if (error instanceof NativefyError) {
        if (error.code === NativefyErrorCode.UNAUTHORIZED) {
          Alert.alert('Sesión Expirada', 'Por favor inicia sesión de nuevo');
        } else if (error.code === NativefyErrorCode.NETWORK_ERROR) {
          Alert.alert('Sin Conexión', 'Revisa tu internet');
        } else {
          Alert.alert('Error', `Código: ${error.code} - ${error.message}`);
        }
        setStatus('Falló la operación');
      }
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 20 }}>{status}</Text>
      <Button title="Simular Login & Guardar" onPress={doLogin} />
    </View>
  );
};
export default LoginFlow;
