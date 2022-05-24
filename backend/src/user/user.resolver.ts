import {Mutation, Query, registerEnumType, Resolver} from '@nestjs/graphql';

export enum CheckResult {
    OK,
    AlreadyIn,
    NotFound
}

registerEnumType(CheckResult, {
    name: 'CheckResult',
    description: 'Result of check mutation',
})

@Resolver()
export class UserResolver {
    @Mutation(() => CheckResult)
    checkUserById() {
        return 'Hello World!';
    }
}
