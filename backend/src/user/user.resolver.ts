import {Args, Mutation, registerEnumType, Resolver, Subscription} from '@nestjs/graphql';
import {CheckResult, UserService} from "./user.service";
import {Types} from "mongoose";
import { MongodbPubSub } from 'graphql-mongoose-subscriptions';

const pubsub = new MongodbPubSub();

registerEnumType(CheckResult, {
    name: 'CheckResult',
    description: 'Result of update mutation',
})

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
