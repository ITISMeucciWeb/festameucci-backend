import { Module } from '@nestjs/common';
import {GoogleStrategy} from "./google.strategy";
import {JwtStrategy} from "./jwt.strategy";
import {ConfigModule} from "@nestjs/config";
import { GoogleController } from './google.controller';
import {JwtModule} from "@nestjs/jwt";
import {UserModule} from "../user/user.module";

@Module({
    controllers: [GoogleController],
    imports: [ConfigModule.forRoot(), JwtModule.register({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '180d' }
    }), UserModule],
    providers: [GoogleStrategy, JwtStrategy]
})
export class GoogleModule {}
