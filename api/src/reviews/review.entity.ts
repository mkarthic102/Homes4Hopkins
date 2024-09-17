import { Housing } from 'src/housing/housing.entity';
import { User } from 'src/user/user.entity';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;

  @Column({ default: null })
  rating: number;

  @Column({ default: 0 })
  upvoteCount: number;

  @Column('int', { array: true, default: [] })
  likedBy: number[];

  // many reviews written by a single user
  @ManyToOne(() => User, (user) => user.reviews, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  // many reviews for a single housing
  @ManyToOne(() => Housing, (housing) => housing.reviews, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'housingId' })
  housing: Housing;

  @Column()
  housingId: string;

  // ensures rating is never negative
  @BeforeInsert()
  ensureRatingNonNegative() {
    if (this.rating < 0) {
      this.rating = 0; // set rating to 0 if negative
    }
  }
}
