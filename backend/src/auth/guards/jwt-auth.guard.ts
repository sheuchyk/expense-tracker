import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * NestJS route guard that validates the incoming JWT using the `'jwt'`
 * Passport strategy. On success, the decoded user is attached to
 * `request.user` and readable via the {@link CurrentUser} param decorator.
 *
 * @throws {UnauthorizedException} When the Authorization header is missing,
 *   malformed, or the JWT fails signature / expiry checks.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
