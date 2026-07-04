import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Parameter decorator that returns the authenticated user attached to the
 * request by the JWT strategy (via `JwtAuthGuard`). Use on controller args:
 * `@CurrentUser() user: { id: number }`.
 *
 * @param _data - Unused; kept to satisfy `createParamDecorator`'s signature.
 * @param ctx - Current Nest execution context; must be an HTTP request.
 * @returns The `request.user` object populated by the Passport strategy,
 *   or `undefined` if the route is not protected by an auth guard.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
