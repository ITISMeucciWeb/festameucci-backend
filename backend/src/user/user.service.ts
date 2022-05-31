import { Injectable } from '@nestjs/common';
import {Model, Types} from "mongoose";
import {InjectModel} from "@nestjs/mongoose";
import {User, UserDocument} from "./user.entity";

import { MongodbPubSub } from 'graphql-mongoose-subscriptions';
import {Result} from "./user.resolver";

const pubsub = new MongodbPubSub();

export enum CheckResult {
    OK,
    AlreadyIn,
    NotFound
}


@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private UserModel: Model<UserDocument>) {}

    inCount: number;
    registeredCount: number;

    async onModuleInit() {
        this.registeredCount = await this.UserModel.countDocuments({isIn: false});
        this.inCount = await this.UserModel.countDocuments({isIn: true});
    }

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
                this.inCount++;
                this.updateInCount();
            }
        }

        return {result, user};
    }

    updateInCount(){
        // noinspection TypeScriptValidateJSTypes
        pubsub.publish('inCount', this.inCount);
    }

    updateTotalCount() {
        // noinspection TypeScriptValidateJSTypes
        pubsub.publish('registeredCount', this.registeredCount);
    }

    async processUser(email: string, name: string, surname: string){
        const dbUser = await this.UserModel.findOne({email: email}, {}, {collation: {locale: "it", strength: 1}}).exec();

        if(!dbUser) {
            return await new this.UserModel({email, name, surname}).save();
        }

        return dbUser;
    }
}
