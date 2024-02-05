// oidc.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import {
  Client,
  Issuer,
  Strategy,
  TokenSet,
  UserinfoResponse,
} from 'openid-client';
import { AuthService } from '../auth.service';

export const buildOpenIdClient = async () => {
  const TrustIssuer = await Issuer.discover(
    `https://sso.insw.go.id/connect/.well-known/openid-configuration`,
  );
  const client = new TrustIssuer.Client({
    client_id: '90b61241-8687-40f8-942d-391b54529936',
    client_secret: '77a1bae1-b452-46ea-8ade-5fba53a908f6',
  });
  return client;
};

@Injectable()
export class OidcStrategy extends PassportStrategy(Strategy, 'oidc') {
  client: Client;

  constructor(
    private readonly authService: AuthService,
    client: Client,
  ) {
    super({
      client: client,
      params: {
        redirect_uri: 'https://insw-app.vercel.app', //TODO: CHANGE REDIRECT URI
        scope: 'openid + profile + role + organization',
        response_type: 'code',
      },
      passReqToCallback: false,
      usePKCE: false,
    });

    this.client = client;
  }

  async validate(tokenset: TokenSet): Promise<any> {
    const userinfo: UserinfoResponse = await this.client.userinfo(tokenset);

    try {
      const id_token = tokenset.id_token;
      const access_token = tokenset.access_token;
      const refresh_token = tokenset.refresh_token;
      const user = {
        id_token,
        access_token,
        refresh_token,
        userinfo,
      };
      return user;
    } catch (err) {
      throw new UnauthorizedException();
    }
  }
}
