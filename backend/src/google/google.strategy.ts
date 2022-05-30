import {PassportStrategy} from '@nestjs/passport';
import {Injectable} from "@nestjs/common";
import {Strategy, VerifyCallback} from "passport-google-oauth20";
import {UserService} from "../user/user.service";
import {JwtService} from "@nestjs/jwt";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(private jwtService: JwtService, private readonly userService: UserService) {
        super({
            clientID: process.env['GOOGLE_CLIENT_ID'],
            clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
            callbackURL: process.env.API_BACKEND + '/google/redirect',
            scope: ['email', 'profile'],
            authorizationURL: 'https://accounts.google.com/o/oauth2/v2/auth?hd=itismeucci.com',
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
        const {name, surname, emails} = profile;

        if(!emails[0].value.endsWith('@itismeucci.com')) {
            done('No emails found');
        }

        const finalUser = await this.userService.processUser(emails[0].value, name, surname);

        return await this.jwtService.signAsync(finalUser.toJSON());
    }
}
