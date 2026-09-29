import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { PartsService } from './parts.service.js';
import { CreatePartDto } from './dto/create-part.dto.js';
import { UpdatePartDto } from './dto/update-part.dto.js';

@Controller('parts')
export class PartsController {
  constructor(
    private readonly partsService: PartsService,
  ) {}

  @Post()
  create(@Body() createPartDto: CreatePartDto) {
    return this.partsService.create(createPartDto);
  }

  @Get()
  findAll() {
    return this.partsService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.partsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePartDto: UpdatePartDto,
  ) {
    return this.partsService.update(
      id,
      updatePartDto,
    );
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.partsService.remove(id);
  }
}