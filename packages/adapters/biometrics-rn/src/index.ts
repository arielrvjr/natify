import RnBiometrics from 'react-native-biometrics';
import { BiometricPort, BiometryType } from '@nativefy/core';

export class RnBiometricAdapter implements BiometricPort {
  readonly capability = 'biometrics';
  private rnBiometrics = new RnBiometrics();

  async isAvailable(): Promise<boolean> {
    try {
      const { available } = await this.rnBiometrics.isSensorAvailable();
      return available;
    } catch {
      return false;
    }
  }

  async getBiometryType(): Promise<BiometryType> {
    const { biometryType } = await this.rnBiometrics.isSensorAvailable();
    if (biometryType === 'FaceID') return BiometryType.FaceID;
    if (biometryType === 'TouchID' || biometryType === 'Biometrics')
      return BiometryType.Fingerprint;
    return BiometryType.None;
  }

  async authenticate(prompt: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { success } = await this.rnBiometrics.simplePrompt({
        promptMessage: prompt,
      });
      return { success };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
}
