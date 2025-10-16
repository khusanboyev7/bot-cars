import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Car } from '../models/car.model';
import { Context, Markup, Telegraf } from 'telegraf';
import { Op } from 'sequelize';
import { InjectBot } from 'nestjs-telegraf';
import { BOT_NAME } from '../../app.constants';

type MessageLike = Context['message'] & { text?: string; photo?: any[] };

@Injectable()
export class CarService {
  private readonly logger = new Logger(CarService.name);

  constructor(
    @InjectModel(Car) private readonly carModel: typeof Car,
    @InjectBot(BOT_NAME) private readonly bot: Telegraf<Context>,
  ) {}

  private getText(ctx: Context): string | undefined {
    const msg = ctx.message as MessageLike | undefined;
    return msg && 'text' in msg ? msg.text : undefined;
  }

  async carMenu(ctx: Context, text = '🚗 Moshinalar bo‘limi') {
    await ctx.replyWithHTML(text, {
      ...Markup.keyboard([
        ['Mening moshinalarim'],
        ["Yangi moshina qo'shish"],
        ['Asosiy menyu qaytish'],
      ]).resize(),
    });
  }

  async showCars(ctx: Context) {
    const user_id = ctx.from!.id;
    const cars = await this.carModel.findAll({ where: { user_id } });

    if (!cars.length) {
      await ctx.reply('Sizda hali moshina yo‘q 🚘');
      return;
    }

    const keyboards = cars.map((car) => [
      {
        text: `${car.brand ?? ''} ${car.model ?? ''} (${car.car_number ?? ''})`,
        callback_data: `car_${car.id}`,
      },
      { text: '🗑 O‘chirish', callback_data: `delcar_${car.id}` },
    ]);

    await ctx.reply('<b>Sizning moshinalaringiz:</b>', {
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: keyboards },
    });
  }

  async addNewCar(ctx: Context) {
    const user_id = ctx.from!.id;
    await this.carModel.create({ user_id, last_state: 'car_number' });
    await ctx.replyWithHTML(
      'Moshina raqamini kiriting (masalan: <b>01A123AB</b>):',
    );
  }

  async onText(ctx: Context) {
    try {
      const user_id = ctx.from!.id;
      const car = await this.carModel.findOne({
        where: { user_id, last_state: { [Op.ne]: 'finish' } },
        order: [['id', 'DESC']],
      });
      if (!car) return;

      const text = this.getText(ctx);
      if (!text) return;

      switch (car.last_state) {
        case 'car_number':
          if (!/^[0-9]{2}[A-Z]{1}[0-9]{3}[A-Z]{2}$/i.test(text.trim())) {
            await ctx.reply('❌ Noto‘g‘ri format! Masalan: 01A123AB');
            return;
          }
          car.car_number = text.toUpperCase();
          car.last_state = 'color';
          await car.save();
          await ctx.reply('Moshina rangini kiriting:');
          break;

        case 'color':
          car.color = text;
          car.last_state = 'model';
          await car.save();
          await ctx.reply('Moshina modelini kiriting:');
          break;

        case 'model':
          car.model = text;
          car.last_state = 'brand';
          await car.save();
          await ctx.reply('Moshina markasini kiriting:');
          break;

        case 'brand':
          car.brand = text;
          car.last_state = 'photo';
          await car.save();
          await ctx.reply("Rasm yuboring yoki 'skip' deb yozing:");
          break;

        case 'photo':
          if (text.toLowerCase() === 'skip') {
            car.last_state = 'finish';
            await car.save();
            await this.carMenu(ctx, '✅ Moshina muvaffaqiyatli qo‘shildi!');
          } else {
            await ctx.reply("❌ Rasm yuboring yoki 'skip' deb yozing");
          }
          break;
      }
    } catch (err) {
      this.logger.error(err);
    }
  }

  async onPhoto(ctx: Context) {
    const user_id = ctx.from!.id;
    const car = await this.carModel.findOne({
      where: { user_id, last_state: 'photo' },
      order: [['id', 'DESC']],
    });
    if (!car) return;

    const photo = (ctx.message as any).photo?.at(-1);
    if (photo) {
      car.image_url = photo.file_id;
      car.last_state = 'finish';
      await car.save();
      await ctx.reply('✅ Moshina qo‘shildi!');
      await this.carMenu(ctx);
    }
  }

  async showCarDetails(ctx: Context) {
    const data = (ctx.callbackQuery as any).data;
    const carId = Number(data.split('_')[1]);
    const car = await this.carModel.findByPk(carId);
    if (!car) return;

    await ctx.replyWithHTML(
      `🚘 <b>${car.brand} ${car.model}</b>\n🔢 Raqam: ${car.car_number}\n🎨 Rang: ${car.color}`,
    );
  }

  async delCar(ctx: Context) {
    const data = (ctx.callbackQuery as any).data;
    const carId = Number(data.split('_')[1]);
    await this.carModel.destroy({ where: { id: carId } });
    await ctx.reply('🗑 Moshina o‘chirildi!');
    await this.showCars(ctx);
  }
}
