"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20220710110834 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20220710110834 extends migrations_1.Migration {
    async up() {
        this.addSql('create table "user" ("_id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "username" text not null, "password" text not null);');
        this.addSql('alter table "user" add constraint "user_username_unique" unique ("username");');
        this.addSql('create table "post" ("_id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "title" text not null);');
    }
}
exports.Migration20220710110834 = Migration20220710110834;
//# sourceMappingURL=Migration20220710110834.js.map