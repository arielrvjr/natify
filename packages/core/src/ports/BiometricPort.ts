import { Port } from './Port';

export enum BiometryType {
  Fingerprint = 'Fingerprint',
  FaceID = 'FaceID',
  None = 'None',
}

export interface BiometricPort extends Port {
  readonly capability: 'biometrics';

  isAvailable(): Promise<boolean>;
  getBiometryType(): Promise<BiometryType>;
  // promptTitle: Texto que sale en el popup nativo (ej: "Ingresa para pagar")
  authenticate(
    promptTitle: string,
    cancelText?: string,
  ): Promise<{ success: boolean; error?: string }>;
}
