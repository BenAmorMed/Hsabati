import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { RecurringTransactionsService } from './recurring-transactions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('recurring-transactions')
@UseGuards(JwtAuthGuard)
export class RecurringTransactionsController {
    constructor(private recurringService: RecurringTransactionsService) { }

    @Post()
    create(@Request() req, @Body() data: any) {
        return this.recurringService.createRecurring(req.user.userId, data);
    }

    @Get()
    findAll(@Request() req) {
        return this.recurringService.findAll(req.user.userId);
    }

    @Patch(':id/toggle')
    toggleActive(@Param('id') id: string, @Request() req) {
        return this.recurringService.toggleActive(id, req.user.userId);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Request() req) {
        return this.recurringService.remove(id, req.user.userId);
    }
}
