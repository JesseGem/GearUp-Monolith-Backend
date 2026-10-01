import { CanActivate, ExecutionContext, Global, Injectable, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(_context: ExecutionContext): boolean {
    return true;
  }
}

@Global()
@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
  ],
  providers: [
    RolesGuard,
  ],
  exports: [
    PassportModule,
    RolesGuard,
  ],
})
export class CoreModule {}