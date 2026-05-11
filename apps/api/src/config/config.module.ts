import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import configuration from './configuration';
import { envValidationSchema } from './env.validation';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: envValidationSchema,
      validationOptions: { abortEarly: true },
    }),
  ],
})
export class AppConfigModule {}
