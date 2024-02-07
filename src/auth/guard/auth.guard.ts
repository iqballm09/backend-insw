import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Extract the authorization header and split the token
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token must be provide');
    }

    const token = authHeader.split(' ')[1];

    // Now you have the token, you can perform any necessary authentication/authorization logic
    const isAuthorized = await this.authService.isAuthenticated(token);
    request.token = token;

    return !!isAuthorized;
  }
}
