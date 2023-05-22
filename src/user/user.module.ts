import { Module } from '@nestjs/common';
import {UserService} from "./user.service";
import {MongooseModule} from "@nestjs/mongoose";
import {User, UserSchema} from "./user.entity";
import {UserResolver} from "./user.resolver";

@Module({
    imports: [
        MongooseModule.forFeature([{name: User.name, schema: UserSchema}]),
    ],
    providers: [UserResolver, UserService],
    exports: [UserService],
})
export class UserModule {}
