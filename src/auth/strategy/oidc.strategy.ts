import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import {
  Client,
  Issuer,
  Strategy,
  StrategyVerifyCallback,
  TokenSet,
  UserinfoResponse,
} from 'openid-client';
import { AuthService } from '../auth.service';

export const buildOpenIdClient = async () => {
  const TrustIssuer = await Issuer.discover(process.env.SSO_ISSUE_URL);
  const client = new TrustIssuer.Client({
    client_id: process.env.SSO_CLIENT_ID,
    client_secret: process.env.SSO_CLIENT_SECRET,
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
        redirect_uri: process.env.SSO_CALLBACK_URI,
        scope: process.env.SSO_SCOPE,
        response_type: 'code',
      },
      passReqToCallback: false,
      usePKCE: false,
    });

    this.client = client;
  }

  async validate(tokenset: TokenSet): Promise<any> {
    const userinfo: UserinfoResponse = await this.client.userinfo(tokenset);
    console.log({ tokenset });

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
