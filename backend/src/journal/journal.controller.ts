import { Controller, Get, Post, Body } from '@nestjs/common';
import { JournalService } from './journal.service';
import { CreateJournalEntryDto } from './dto/create-journal.dto';
import { RequirePermissions } from '../auth/require-permissions.decorator';

@Controller('journal')
@RequirePermissions('libro_diario.ver')
export class JournalController {
  constructor(private readonly journalService: JournalService) {}

  @Post()
  create(@Body() createJournalDto: CreateJournalEntryDto) {
    return this.journalService.create(createJournalDto);
  }

  @Get()
  findAll() {
    return this.journalService.findAll();
  }
}
