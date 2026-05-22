import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class BiometricLoginDto {
  /**
   * Token biométrico generado por Expo LocalAuthentication.
   * En el cliente React Native / Expo, tras autenticar biométricamente
   * al usuario se firma este token con la clave privada del dispositivo y
   * se envía al servidor para verificación.
   */
  @IsString()
  @IsNotEmpty({ message: 'El token biométrico es requerido' })
  @MaxLength(512, { message: 'Token demasiado largo' })
  biometricToken: string;

  /**
   * ID del usuario asociado al dispositivo (almacenado en SecureStore de Expo).
   */
  @IsString()
  @IsNotEmpty({ message: 'El userId es requerido' })
  userId: string;
}
