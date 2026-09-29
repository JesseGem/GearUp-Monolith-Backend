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

import { VehiclesService } from './vehicles.service.js';

import { CreateVehicleDto } from './dto/create-vehicle.dto.js';
import { UpdateVehicleDto } from './dto/update-vehicle.dto.js';

import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@Controller('vehicles')
@UseGuards(JwtAuthGuard)
export class VehiclesController {
  constructor(
    private readonly vehiclesService: VehiclesService,
  ) {}

  @Post()
  create(
    @CurrentUser() user: any,
    @Body() createVehicleDto: CreateVehicleDto,
  ) {
    return this.vehiclesService.create(
      user.userId,
      createVehicleDto,
    );
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.vehiclesService.findAllByUser(
      user.userId,
    );
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    return this.vehiclesService.findOne(
      id,
      user.userId,
    );
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
    @Body() updateVehicleDto: UpdateVehicleDto,
  ) {
    return this.vehiclesService.update(
      id,
      user.userId,
      updateVehicleDto,
    );
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    return this.vehiclesService.remove(
      id,
      user.userId,
    );
  }
}