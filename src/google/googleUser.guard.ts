import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import {AuthGuard} from "@nestjs/passport";

@Injectable()
export class GoogleUserGuard extends AuthGuard("googleUser") implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  handleRequest(err, user) {
    if (err || !user) {
      return false;
    }
    return user;
  }
}
