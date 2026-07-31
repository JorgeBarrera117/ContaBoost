import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { RequirePermissions } from '../auth/require-permissions.decorator';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @RequirePermissions('contactos.gestionar')
  @Post()
  create(@Body() dto: CreateContactDto) {
    return this.contactsService.create(dto);
  }

  @RequirePermissions('contactos.gestionar')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: CreateContactDto) {
    return this.contactsService.update(id, dto);
  }

  @RequirePermissions('contactos.gestionar')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contactsService.remove(id);
  }

  @RequirePermissions('contactos.ver')
  @Get()
  findAll() {
    return this.contactsService.findAll();
  }
}
