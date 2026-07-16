import { Body, Controller, Get, Post } from '@nestjs/common';
import { GendersService } from './genders.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateGenderDto } from './dtos/create-gender/create-gender.dto';

@Controller('genders')
export class GendersController {
  constructor(private readonly gendersService: GendersService) {}

  @Post()
  @Roles('admin')
  create(@Body() createGenderDto: CreateGenderDto) {
    return this.gendersService.create(createGenderDto);
  }

  @Get()
  getAll() {
    return this.gendersService.findAll();
  }
}
