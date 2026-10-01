import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { PartsService } from './parts.service.js';
import { CreatePartDto } from './dto/create-part.dto.js';
import { UpdatePartDto } from './dto/update-part.dto.js';

import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../core/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UserRole } from '../users/enums/user-role.enum.js';

@Controller('parts')
export class PartsController {
  constructor(
    private readonly partsService: PartsService,
  ) {}

  // Public: customers and unauthenticated users
  // can browse the parts catalogue.
  @Get()
  findAll() {
    return this.partsService.findAll();
  }

  // Public: view a specific part.
  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.partsService.findOne(id);
  }

  // Mechanic/Admin only.
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MECHANIC, UserRole.ADMIN)
  create(@Body() createPartDto: CreatePartDto) {
    return this.partsService.create(createPartDto);
  }

  // Mechanic/Admin only.
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MECHANIC, UserRole.ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePartDto: UpdatePartDto,
  ) {
    return this.partsService.update(
      id,
      updatePartDto,
    );
  }

  // Mechanic/Admin only.
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MECHANIC, UserRole.ADMIN)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.partsService.remove(id);
  }
}