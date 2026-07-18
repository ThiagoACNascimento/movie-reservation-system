import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto.ts/create-room.dto';
import { createSlug } from '../../common/utils/create-slug.utils';
import { Room } from '../../generated/prisma/client';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { PaginationResult } from '../../common/interfaces/pagination-result.interface';

@Injectable()
export class RoomsService {
  constructor(private readonly prismaService: PrismaService) {}

  create(createRoomDto: CreateRoomDto) {
    const slug = createSlug(createRoomDto.name);
    const data = { ...createRoomDto, slug };

    return this.prismaService.room.create({ data });
  }

  async findOneBySlug(slug: string): Promise<Room> {
    const room = await this.prismaService.room.findUnique({ where: { slug } });

    if (!room) {
      throw new NotFoundException('Room not found.');
    }

    return room;
  }

  async findAll(pagination: PaginationDto): Promise<PaginationResult<Room>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await this.prismaService.$transaction([
      this.prismaService.room.findMany({
        skip,
        take: limit,
        orderBy: { slug: 'desc' },
      }),
      this.prismaService.room.count(),
    ]);

    const lastPage = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        lastPage,
        prev: page > 1 ? page - 1 : null,
        next: page < lastPage ? page + 1 : null,
      },
    };
  }
}
