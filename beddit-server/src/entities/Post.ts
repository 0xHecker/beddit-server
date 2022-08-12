import { Field, Int, ObjectType } from "type-graphql";
import {
	BaseEntity,
	Column,
	CreateDateColumn,
	Entity,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";
import { Updoot } from "./Updoot";
import { User } from "./User";

@ObjectType()
@Entity()
export class Post extends BaseEntity {
	@Field(() => Int)
	@PrimaryGeneratedColumn()
	_id!: number;

	@Field(() => Int)
	@Column()
	creatorId!: number;

	@Field(() => Int, { nullable: true })
	voteStatus: number | null; // 1 or -1 or null

	@Field()
	@Column()
	title!: string;

	@Field()
	@Column()
	text!: string;

	@Field(() => Int)
	@Column({ type: "int", default: 0 })
	points!: number;

	@Field()
	@ManyToOne(() => User, (user) => user.posts, { nullable: true })
	creator!: User;

	@OneToMany(() => User, (updoot) => updoot.posts)
	updoots: Updoot[];

	@Field(() => String)
	@CreateDateColumn()
	createdAt: Date;

	@Field(() => String)
	@UpdateDateColumn()
	updatedAt: Date;
}
