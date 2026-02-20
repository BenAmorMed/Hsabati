import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, Patch, Put } from '@nestjs/common';
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

    @Get(':id')
    findOne(@Request() req, @Param('id') id: string) {
        return this.categoriesService.findOne(req.user.userId, id);
    }

    @Post()
    create(@Request() req, @Body() data: any) {
        return this.categoriesService.create(req.user.userId, data);
    }

    @Patch(':id')
    update(@Request() req, @Param('id') id: string, @Body() data: any) {
        return this.categoriesService.update(req.user.userId, id, data);
    }

    @Delete(':id')
    remove(@Request() req, @Param('id') id: string) {
        return this.categoriesService.remove(req.user.userId, id);
    }
}
