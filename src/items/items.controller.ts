import { Body, Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Param, ParseIntPipe, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@ApiTags('Items')
@Controller({ path: 'items', version: '1' })
export class ItemsController {
  constructor(private readonly service: ItemsService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: [Object] })
  findAll() {
    return this.service.findAll();
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOkResponse({ type: Object })
  create(@Body() dto: CreateItemDto, @Request() req) {
    const userId = req.user?.id ?? null;
    return this.service.create(dto, userId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: Object })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateItemDto,
    @Request() req,
  ) {
    const userId = req.user?.id ?? null;

    if (!Number.isInteger(id) || id <= 0) {
      throw new NotFoundException();
    }

    const updated = this.service.update(id, dto as any, userId);

    if (!updated) {
      throw new NotFoundException({ status: HttpStatus.NOT_FOUND, message: 'notFound' });
    }

    return updated;
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new NotFoundException();
    }

    const ok = this.service.remove(id);
    if (!ok) {
      throw new NotFoundException({ status: HttpStatus.NOT_FOUND, message: 'notFound' });
    }
  }
}
