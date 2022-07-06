"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20220706144222 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20220706144222 extends migrations_1.Migration {
    async up() {
        this.addSql('create table "post" ("_id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "title" text not null);');
    }
}
exports.Migration20220706144222 = Migration20220706144222;
//# sourceMappingURL=Migration20220706144222.js.map