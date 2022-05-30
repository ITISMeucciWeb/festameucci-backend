import {Types} from "mongoose";
import {Field, Int, ObjectType} from "@nestjs/graphql";
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@ObjectType()
@Schema()
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
    @Prop({required: true, index: true})
    email: string;

    @Field(()=>Int, {nullable: true})
    @Prop({required: false, index: true})
    class?: number;

    @Field(()=>String, {nullable: true})
    @Prop({required: false, index: true})
    division?: string;
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);
