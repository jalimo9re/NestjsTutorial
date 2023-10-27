import { ExecutionContext, createParamDecorator } from '@nestjs/common';

//Decorador para acceder al usuario obtenido del JWT

export const Usr = createParamDecorator((data: any, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user.user;
  });