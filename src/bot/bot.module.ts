import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BotService } from './bot.service';
import { BotUpdate } from './bot.update';
import { CarModule } from './car/car.module';
import { Car } from './models/car.model';

@Module({
  imports: [SequelizeModule.forFeature([Car]), CarModule],
  providers: [BotService, BotUpdate],
})
export class BotModule {}
