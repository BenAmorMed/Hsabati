import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
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
}
