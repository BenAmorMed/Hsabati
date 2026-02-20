import { Controller, Get, Post, Body, Param, UseGuards, Request, Put, Delete } from '@nestjs/common';
import { AdvancedPaymentsService } from './advanced-payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('advanced-payments')
@UseGuards(JwtAuthGuard)
export class AdvancedPaymentsController {
    constructor(private advancedPaymentsService: AdvancedPaymentsService) { }

    @Post()
    create(@Request() req, @Body() data: any) {
        return this.advancedPaymentsService.create(req.user.userId, data);
    }

    @Post(':id/repayment')
    addRepayment(@Request() req, @Param('id') id: string, @Body() body: { amount: number, note?: string }) {
        return this.advancedPaymentsService.addRepayment(req.user.userId, id, body.amount, body.note);
    }

    @Get()
    findAll(@Request() req) {
        return this.advancedPaymentsService.findAll(req.user.userId);
    }

    @Get(':id')
    findOne(@Request() req, @Param('id') id: string) {
        return this.advancedPaymentsService.findOne(req.user.userId, id);
    }

    @Put(':id')
    update(@Request() req, @Param('id') id: string, @Body() data: any) {
        return this.advancedPaymentsService.update(req.user.userId, id, data);
    }

    @Delete(':id')
    remove(@Request() req, @Param('id') id: string) {
        return this.advancedPaymentsService.remove(req.user.userId, id);
    }
}
