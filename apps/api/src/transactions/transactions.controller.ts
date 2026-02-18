import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
    constructor(private transactionsService: TransactionsService) { }

    @Post()
    create(@Request() req, @Body() data: any) {
        return this.transactionsService.create(req.user.userId, data);
    }

    @Get()
    findAll(@Request() req) {
        return this.transactionsService.findAll(req.user.userId);
    }

    @Get(':id')
    findOne(@Request() req, @Param('id') id: string) {
        return this.transactionsService.findOne(req.user.userId, id);
    }

    @Patch(':id')
    update(@Request() req, @Param('id') id: string, @Body() data: any) {
        return this.transactionsService.update(req.user.userId, id, data);
    }

    @Delete(':id')
    remove(@Request() req, @Param('id') id: string) {
        return this.transactionsService.remove(req.user.userId, id);
    }
}
