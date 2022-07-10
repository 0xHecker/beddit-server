import { Resolver, Mutation, Arg, InputType, Field, Ctx, ObjectType } from "type-graphql";
import { MyContext } from 'src/types';
import { User } from "src/entities/User";
import argon2 from 'argon2'

@InputType()
class UsernamePasswordImport {
    @Field()
    username: string
    @Field()
    password: string
    
}

@ObjectType()
class FieldError {
    @Field(() => String)
    field: string
    @Field(() => String)
    message: string
}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], {nullable: true})
    errors?: FieldError[];
    @Field(() => User, {nullable: true})
    user?: User;
}

@Resolver()
export class UserResolver {

    @Mutation(() => UserResponse)
    async register(
        @Arg('options') options: UsernamePasswordImport,
        @Ctx() {em}: MyContext
    ): Promise<UserResponse> {


        if(options.username.length < 2) {
            return{
                errors: [{
                    field: 'username',
                    message: 'username length should bre greater than 2'
                }]
            }
        }

        if(options.password.length <= 3) {
            return{
                errors: [{
                    field: 'password',
                    message: 'password length should be greater than 3'
                }]
            }
        }

        const hashedPassword = await argon2.hash(options.password)
        const user = em.create(User, {
            username: options.username,
            password: hashedPassword,
            createdAt: new Date, 
            updatedAt: new Date
        });
        try{
            await em.persistAndFlush(user)
        }catch(err) {
            if(err.code === '23505' || err.detail.includes('already exists')){
                return {
                    errors: [
                        {
                            field: 'username',
                            message: 'username already taken'
                        }
                    ]
                }
            }
        }
        return {user};
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg('options') options: UsernamePasswordImport,
        @Ctx() { em, req }: MyContext
    ): Promise<UserResponse> {
        const user = await em.findOne(User, {
            username: options.username,
        });
        if(!user) {
            return{
                errors: [{
                    field: 'username',
                    message: 'that username does not exist'
                }]
            }
        }

        const valid = await argon2.verify(user.password, options.password)
        if(!valid) {
            return{
                errors: [{
                    field: 'password',
                    message: 'incorrect password'
                }]
            }
        }

        req.session!.userId = user._id;

        return {user};
    }
}