import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { GendersService } from './genders.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateGenderDto } from './dtos/create-gender/create-gender.dto';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { PaginationResult } from '../../common/interfaces/pagination-result.interface';
import { Genre } from '../../generated/prisma/client';

@Controller('genders')
export class GendersController {
  constructor(private readonly gendersService: GendersService) {}

  @Post()
  @Roles('admin')
  create(@Body() createGenderDto: CreateGenderDto) {
    return this.gendersService.create(createGenderDto);
  }

  @Get()
  getMany(
    @Query() pagination: PaginationDto,
  ): Promise<PaginationResult<Genre>> {
    return this.gendersService.getMany(pagination);
  }
}
