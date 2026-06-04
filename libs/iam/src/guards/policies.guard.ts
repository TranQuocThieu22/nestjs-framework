import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import {
  CaslAbilityFactory,
  AppAbility,
} from '../services/casl-ability.factory';
import type { ActiveUserData } from '@app/shared-types';

export interface PolicyHandler {
  handle(ability: AppAbility): boolean;
}

export const CHECK_POLICIES_KEY = 'check_policy';

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policyHandlers = this.reflector.get<PolicyHandler[]>(
      CHECK_POLICIES_KEY,
      context.getHandler(),
    );

    if (!policyHandlers) {
      return true; // Không yêu cầu quyền cụ thể
    }

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: ActiveUserData }>();
    const user = request.user;
    if (!user) return false;

    const ability = await this.caslAbilityFactory.createForUser(user);

    return policyHandlers.every((handler) => handler.handle(ability));
  }
}
