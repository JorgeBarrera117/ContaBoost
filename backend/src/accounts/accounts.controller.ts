import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { RequirePermissions } from '../auth/require-permissions.decorator';

@Controller('accounts')
@RequirePermissions('cuentas.gestionar')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  create(@Body() createAccountDto: CreateAccountDto) {
    return this.accountsService.create(createAccountDto);
  }

  @Get()
  findAll() {
    return this.accountsService.findAll();
  }

  @Post('seed-ecuador')
  seedEcuadorAccounts() {
    return this.accountsService.seedEcuadorAccounts();
  }
}
