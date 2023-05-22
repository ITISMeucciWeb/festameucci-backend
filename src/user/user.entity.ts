import {Types} from "mongoose";
import {Field, ObjectType} from "@nestjs/graphql";
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@ObjectType()
@Schema({
    timestamps: true
})
export class User{
    @Field(()=>String)
    _id: Types.ObjectId;

    @Field(()=>Boolean, {defaultValue: false})
    @Prop({required: true, default: false})
    admin: boolean = false;

    @Field(()=>Boolean, {defaultValue: false})
    @Prop({required: true, default: false})
    isIn: boolean = false;

    @Field(()=>String)
    @Prop({required: true})
    name: string;

    @Field(()=>String)
    @Prop({required: true})
    surname: string;

    @Field(()=>String)
    @Prop({required: true, index: true})
    email: string;
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);
