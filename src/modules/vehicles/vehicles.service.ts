import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Vehicle } from './entities/vehicle.entity.js';
import { CreateVehicleDto } from './dto/create-vehicle.dto.js';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehiclesRepository: Repository<Vehicle>,
  ) {}

  async create(
    userId: string,
    createVehicleDto: CreateVehicleDto,
  ): Promise<Vehicle> {
    const vehicle = this.vehiclesRepository.create({
      ...createVehicleDto,
      vin: createVehicleDto.vin ?? undefined,
      color: createVehicleDto.color ?? undefined,
      userId,
    });

    return this.vehiclesRepository.save(vehicle);
  }

  async findAllByUser(userId: string): Promise<Vehicle[]> {
    return this.vehiclesRepository.find({
      where: { userId },
    });
  }
}
