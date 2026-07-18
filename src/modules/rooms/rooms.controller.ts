import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto.ts/create-room.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Room } from '../../generated/prisma/client';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { PaginationResult } from '../../common/interfaces/pagination-result.interface';

@Public()
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createRoomDto: CreateRoomDto): Promise<Room> {
    return this.roomsService.create(createRoomDto);
  }

  @Get(':slug')
  @HttpCode(HttpStatus.OK)
  findOneBySlug(@Param('slug') slug: string): Promise<Room> {
    return this.roomsService.findOneBySlug(slug);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(@Query() pagination: PaginationDto): Promise<PaginationResult<Room>> {
    return this.roomsService.findAll(pagination);
  }
}
