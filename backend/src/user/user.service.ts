import { Injectable } from '@nestjs/common';
import {Model, Types} from "mongoose";
import {InjectModel} from "@nestjs/mongoose";
import {User, UserDocument} from "./user.entity";

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private UserModel: Model<UserDocument>) {}

    getClassByNameAndSurName(name: string, surname: string): [number, string] {
        return [1, 'A'];
    }

    async getStateById(id: Types.ObjectId): Promise<boolean> {
        return (await this.UserModel.findById(id)).isIn;
    }
}
