import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Car } from '../models/car.model';
import { CarService } from './car.service';
import { CarUpdate } from './car.update';

@Module({
  imports: [SequelizeModule.forFeature([Car])],
  providers: [CarService, CarUpdate],
  exports: [CarService],
})
export class CarModule {}
