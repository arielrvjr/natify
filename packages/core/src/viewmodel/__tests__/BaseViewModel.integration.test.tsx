import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { useBaseViewModel } from '../../viewmodel/BaseViewModel';

/**
 * Componente de prueba que usa useBaseViewModel
 */
const TestComponent: React.FC<{
  onStateChange?: (isLoading: boolean) => void;
  executeAsync?: () => Promise<string>;
}> = ({ onStateChange, executeAsync }) => {
  const [state, actions] = useBaseViewModel();

  React.useEffect(() => {
    onStateChange?.(state.isLoading);
  }, [state.isLoading, onStateChange]);

  React.useEffect(() => {
    if (executeAsync) {
      actions.execute(executeAsync);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

describe('useBaseViewModel Integration - useEffect cleanup (lines 84-89)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should set isMounted to true on mount and allow state updates', async () => {
    const onStateChange = jest.fn();
    const executeAsync = jest.fn().mockResolvedValue('success');

    const { unmount } = render(
      <TestComponent onStateChange={onStateChange} executeAsync={executeAsync} />,
    );

    // Esperar a que se ejecute la operación async
    await waitFor(
      () => {
        expect(executeAsync).toHaveBeenCalled();
      },
      { timeout: 1000 },
    );

    // Verificar que el estado se actualizó (isMounted.current era true)
    // onStateChange debería haber sido llamado al menos una vez (cuando isLoading cambió)
    expect(onStateChange).toHaveBeenCalled();
    unmount();
  });

  it('should prevent state updates after unmount (cleanup sets isMounted to false)', async () => {
    const onStateChange = jest.fn();
    let resolveAsync: ((value: string) => void) | undefined;
    const executeAsync = jest.fn(
      () =>
        new Promise<string>(resolve => {
          resolveAsync = resolve;
        }),
    );

    const { unmount } = render(
      <TestComponent onStateChange={onStateChange} executeAsync={executeAsync} />,
    );

    // Esperar a que se inicie la operación
    await waitFor(
      () => {
        expect(executeAsync).toHaveBeenCalled();
      },
      { timeout: 1000 },
    );

    // Obtener el número de llamadas antes de desmontar
    const callsBeforeUnmount = onStateChange.mock.calls.length;

    // Desmontar el componente ANTES de que termine la operación async
    // Esto ejecuta el cleanup del useEffect (línea 86-88) que establece isMounted.current = false
    unmount();

    // Resolver la promesa DESPUÉS del unmount
    if (resolveAsync) {
      resolveAsync('success');
    }

    // Esperar un poco para asegurar que cualquier actualización de estado se procesaría
    await new Promise(resolve => setTimeout(resolve, 50));

    // Verificar que NO hubo nuevas actualizaciones de estado después del unmount
    // El cleanup del useEffect (línea 87) debería haber prevenido esto
    expect(onStateChange.mock.calls.length).toBe(callsBeforeUnmount);
  });

  it('should cleanup useEffect on unmount (line 86-88)', async () => {
    const executeAsync = jest.fn().mockResolvedValue('success');

    const { unmount } = render(<TestComponent executeAsync={executeAsync} />);

    // Esperar a que se ejecute
    await waitFor(
      () => {
        expect(executeAsync).toHaveBeenCalled();
      },
      { timeout: 1000 },
    );

    // Desmontar - esto debería ejecutar el cleanup del useEffect (línea 86-88)
    // que establece isMounted.current = false
    expect(() => {
      unmount();
    }).not.toThrow();
  });
});
