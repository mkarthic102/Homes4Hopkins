import { User } from 'src/user/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class favoritePost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  postId: string;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.favoritePosts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;
}
