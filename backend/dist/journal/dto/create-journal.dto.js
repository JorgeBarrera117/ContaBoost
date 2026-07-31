"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateJournalEntryDto = exports.CreateJournalLineDto = void 0;
class CreateJournalLineDto {
    accountId;
    debit;
    credit;
    description;
}
exports.CreateJournalLineDto = CreateJournalLineDto;
class CreateJournalEntryDto {
    date;
    description;
    reference;
    userId;
    lines;
}
exports.CreateJournalEntryDto = CreateJournalEntryDto;
//# sourceMappingURL=create-journal.dto.js.map