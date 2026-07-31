"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = void 0;
const common_1 = require("@nestjs/common");
const database_wrapper_1 = require("./database.wrapper");
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [
            {
                provide: 'DATABASE_POOL',
                useFactory: () => {
                    const url = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_lCmeJM5jPs7u@ep-late-wind-ayrskl71-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
                    return new database_wrapper_1.PostgresPoolWrapper(url);
                },
            },
        ],
        exports: ['DATABASE_POOL'],
    })
], DatabaseModule);
//# sourceMappingURL=database.module.js.map