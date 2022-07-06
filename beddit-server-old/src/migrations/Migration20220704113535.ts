import { Migration } from '@mikro-orm/migrations';

export class Migration20220704113535 extends Migration {

  async up(): Promise<void> {
    this.addSql('drop table if exists "user" cascade;');

    this.addSql('alter table "post" alter column "_id" type timestamptz(0) using ("_id"::timestamptz(0));');
    this.addSql('alter table "post" alter column "_id" drop default;');
  }

  async down(): Promise<void> {
    this.addSql('create table "user" ("_id" serial primary key, "created_at" timestamptz not null default null, "updated_at" timestamptz not null default null, "username" text not null default null, "password" text not null default null);');
    this.addSql('alter table "user" add constraint "user_username_unique" unique ("username");');
  }

}
