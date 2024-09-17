import { User } from 'src/user/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PostImage } from './post-images/post-image.entity';

export type PostType = 'Roommate' | 'Sublet' | 'Housing';

@Entity()
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  content: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;

  @Column()
  cost: number;

  @Column()
  address: string;

  // @Column('text', { array: true, default: {} })
  // images: string[];
  @OneToMany(() => PostImage, (postImage) => postImage.post)
  images: PostImage[];

  @ManyToOne(() => User, (user) => user.posts,  {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @Column()
  type: PostType;
}
