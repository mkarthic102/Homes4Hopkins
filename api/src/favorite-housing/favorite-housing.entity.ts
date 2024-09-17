import { User } from 'src/user/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class favoriteHousing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  housingId: string;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.favoriteHousings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;
}
