import { Column, DataType, Model, Table } from 'sequelize-typescript';

interface ICarCreationAttr {
  user_id: number;
  last_state?: string;
}

@Table({ tableName: 'cars' })
export class Car extends Model<Car, ICarCreationAttr> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  declare user_id: number;

  @Column(DataType.STRING)
  declare car_number: string;

  @Column(DataType.STRING)
  declare color: string;

  @Column(DataType.STRING)
  declare model: string;

  @Column(DataType.STRING)
  declare brand: string;

  @Column(DataType.STRING)
  declare image_url: string;

  @Column(DataType.STRING)
  declare last_state: string;
}
