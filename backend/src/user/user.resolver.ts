import {Args, Field, Mutation, ObjectType, registerEnumType, Resolver, Subscription} from '@nestjs/graphql';
import {CheckResult, UserService} from "./user.service";
import {Types} from "mongoose";
import { MongodbPubSub } from 'graphql-mongoose-subscriptions';
import {User} from "./user.entity";

const pubsub = new MongodbPubSub();

registerEnumType(CheckResult, {
    name: 'CheckResult',
    description: 'Result of update mutation',
})

@ObjectType()
export class Result {
    @Field(() => CheckResult)
    result: CheckResult;

    @Field(() => User)
    user: User;
}

@Resolver()
export class UserResolver {
    constructor(private readonly userService: UserService) {}

    @Mutation(() => CheckResult)
    updateStateById(@Args('id', {type: ()=> String}) id: Types.ObjectId) {
        return this.userService.updateStateById(id);
    }

    @Subscription(() => Number)
    getInCount() {
        return pubsub.asyncIterator('inCount');
    }

    @Subscription(() => Number)
    getRegisteredCount() {
        return pubsub.asyncIterator('registeredCount');
    }
}
