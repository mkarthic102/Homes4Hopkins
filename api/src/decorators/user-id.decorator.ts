import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";

export interface RequestWithUser extends Request {
  user: {
    userId: number;
  };
}

export const UserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = (request as RequestWithUser).user;
    return user.userId;
  },
);
