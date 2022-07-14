"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20220714121710 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20220714121710 extends migrations_1.Migration {
    async up() {
        this.addSql('create table "user" ("_id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "username" text not null, "email" text not null, "password" text not null);');
        this.addSql('alter table "user" add constraint "user_username_unique" unique ("username");');
        this.addSql('alter table "user" add constraint "user_email_unique" unique ("email");');
        this.addSql('create table "post" ("_id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "title" text not null);');
    }
}
exports.Migration20220714121710 = Migration20220714121710;
//# sourceMappingURL=Migration20220714121710.js.map