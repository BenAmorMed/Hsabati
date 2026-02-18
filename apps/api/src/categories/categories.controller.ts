import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
    constructor(private categoriesService: CategoriesService) { }

    @Get()
    findAll(@Request() req) {
        return this.categoriesService.findAll(req.user.userId);
    }

    @Post()
    create(@Request() req, @Body() data: any) {
        return this.categoriesService.create(req.user.userId, data);
    }

    @Delete(':id')
    remove(@Request() req, @Param('id') id: string) {
        return this.categoriesService.remove(req.user.userId, id);
    }
}
