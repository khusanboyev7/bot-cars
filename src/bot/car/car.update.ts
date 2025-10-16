import { Update, Hears, On, Ctx, Action } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { CarService } from './car.service';

@Update()
export class CarUpdate {
  constructor(private readonly carService: CarService) {}

  @Hears('Moshinalar')
  async menu(@Ctx() ctx: Context) {
    await this.carService.carMenu(ctx);
  }

  @Hears('Mening moshinalarim')
  async list(@Ctx() ctx: Context) {
    await this.carService.showCars(ctx);
  }

  @Hears("Yangi moshina qo'shish")
  async add(@Ctx() ctx: Context) {
    await this.carService.addNewCar(ctx);
  }

  @On('text')
  async onText(@Ctx() ctx: Context) {
    await this.carService.onText(ctx);
  }

  @On('photo')
  async onPhoto(@Ctx() ctx: Context) {
    await this.carService.onPhoto(ctx);
  }

  @Action(/^car_\d+$/)
  async details(@Ctx() ctx: Context) {
    await this.carService.showCarDetails(ctx);
  }

  @Action(/^delcar_\d+$/)
  async delete(@Ctx() ctx: Context) {
    await this.carService.delCar(ctx);
  }
}
