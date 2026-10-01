import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class AuthThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(
    req: Record<string, any>,
  ): Promise<string> {
    const ip = await super.getTracker(req);

    const email =
      typeof req.body?.email === 'string'
        ? req.body.email
            .trim()
            .normalize('NFC')
            .toLowerCase()
        : '';

    return email ? `${email}|${ip}` : ip;
  }
}