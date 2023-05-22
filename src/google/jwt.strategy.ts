import { ExtractJwt, Strategy } from 'passport-jwt';
import {PassportStrategy} from '@nestjs/passport';
import {Injectable} from "@nestjs/common";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET,
        });
    }

    async validate(payload: any) {
        const {_id, name, surname, email, avatar, role} = payload;
        return{
            _id, name, surname, email, avatar, role
        }
    }
}
