import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { OidcStrategy, buildOpenIdClient } from './strategy/oidc.strategy';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { SessionSerializer } from './session.serializer';
import { UserService } from 'src/user/user.service';
import { UserModule } from 'src/user/user.module';

const OidcStrategyFactory = {
  provide: 'OidcStrategy',
  useFactory: async (authService: AuthService) => {
    const client = await buildOpenIdClient(); // secret sauce! build the dynamic client before injecting it into the strategy for use in the constructor super call.
    const strategy = new OidcStrategy(authService, client);
    return strategy;
  },
  inject: [AuthService],
};

@Module({
  imports: [
    PassportModule.register({ session: true, defaultStrategy: 'oidc' }),
    UserModule,
  ],
  controllers: [AuthController],
  exports: [AuthService],
  providers: [
    OidcStrategyFactory,
    SessionSerializer,
    AuthService,
    UserService
  ],
})
export class AuthModule {}
