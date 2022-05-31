import { Injectable } from '@nestjs/common';
import {Model, Types} from "mongoose";
import {InjectModel} from "@nestjs/mongoose";
import {User, UserDocument} from "./user.entity";

import {Result} from "./user.resolver";

export enum CheckResult {
    OK,
    AlreadyIn,
    NotFound
}


@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private UserModel: Model<UserDocument>) {}

    async updateStateById(id: Types.ObjectId): Promise<Result> {
        const user = await this.UserModel.findById(id).select({'isIn': 1, 'name': 1, 'surname': 1});
        let result: CheckResult;
        if(!user) {
            result = CheckResult.NotFound;
        }else {
            if(user.isIn) {
                result = CheckResult.AlreadyIn;
            }else {
                result = CheckResult.OK;
                user.isIn = true;
                await user.save();
            }
        }

        return {result, user};
    }

    async processUser(email: string, name: string, surname: string){
        const dbUser = await this.UserModel.findOne({email: email}, {}, {collation: {locale: "it", strength: 1}}).exec();

        if(!dbUser) {
            return await new this.UserModel({email, name, surname}).save();
        }

        return dbUser;
    }
}
