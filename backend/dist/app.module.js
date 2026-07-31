"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./auth/auth.module");
const database_module_1 = require("./database/database.module");
const accounts_module_1 = require("./accounts/accounts.module");
const users_module_1 = require("./users/users.module");
const journal_module_1 = require("./journal/journal.module");
const contacts_module_1 = require("./contacts/contacts.module");
const invoices_module_1 = require("./invoices/invoices.module");
const products_module_1 = require("./products/products.module");
const purchases_module_1 = require("./purchases/purchases.module");
const reports_module_1 = require("./reports/reports.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const core_1 = require("@nestjs/core");
const jwt_auth_guard_1 = require("./auth/jwt-auth.guard");
const permissions_guard_1 = require("./auth/permissions.guard");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            database_module_1.DatabaseModule,
            auth_module_1.AuthModule,
            accounts_module_1.AccountsModule, users_module_1.UsersModule, journal_module_1.JournalModule, contacts_module_1.ContactsModule, invoices_module_1.InvoicesModule, products_module_1.ProductsModule, purchases_module_1.PurchasesModule, reports_module_1.ReportsModule, dashboard_module_1.DashboardModule
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: permissions_guard_1.PermissionsGuard,
            }
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map