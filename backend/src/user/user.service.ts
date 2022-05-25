import { Injectable } from '@nestjs/common';
import {Model, Types} from "mongoose";
import {InjectModel} from "@nestjs/mongoose";
import {User, UserDocument} from "./user.entity";
import {Field, ObjectType} from "@nestjs/graphql";

import { MongodbPubSub } from 'graphql-mongoose-subscriptions';

const pubsub = new MongodbPubSub();

export enum CheckResult {
    OK,
    AlreadyIn,
    NotFound
}

@ObjectType({
    description: 'Result of update mutation. If NotFound, name and surname are null',
})
export class CheckResultType {

    @Field(() => CheckResult)
    result: CheckResult;

    @Field(() => String, {nullable: true})
    name?: string;

    @Field(() => String, {nullable: true})
    surname?: string;
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

    getClassByNameAndSurName(name: string, surname: string): [number, string] {
        return [1, 'A'];
    }

    async updateStateById(id: Types.ObjectId): Promise<CheckResultType> {
        const user = await this.UserModel.findById(id).select({'isIn': 1, 'name': 1, 'surname': 1});
        const result = new CheckResultType();
        if(!user) {
            result.result = CheckResult.NotFound;
        }else {
            result.name = user.name;
            result.surname = user.surname;
            if(user.isIn) {
                result.result = CheckResult.AlreadyIn;
            }else {
                result.result = CheckResult.OK;
                user.isIn = true;
                await user.save();
                this.inCount++;
                this.updateInCount();
            }
        }

        return result;
    }

    updateInCount(){
        // noinspection TypeScriptValidateJSTypes
        pubsub.publish('inCount', this.inCount);
    }

    updateTotalCount() {
        // noinspection TypeScriptValidateJSTypes
        pubsub.publish('registeredCount', this.registeredCount);
    }
}
