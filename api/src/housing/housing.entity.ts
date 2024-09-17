import { Review } from 'src/reviews/review.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Housing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column('decimal', { precision: 10, scale: 6 })
  latitude: number;

  @Column('decimal', { precision: 10, scale: 6 })
  longitude: number;

  @Column({ nullable: true })
  imageURL: string;

  @Column({ default: '$' })
  price: string;

  @Column('decimal', { precision: 6, scale: 1 })
  distance: number;

  @Column('decimal', { default: 0, precision: 2, scale: 1 })
  avgRating: number; // calculated from Reviews posted

  @Column({ default: 0 })
  reviewCount: number; // calculated from Reviews posted

  // NEW - housing can have multiple reviews
  @OneToMany(() => Review, (review) => review.housing)
  reviews: Review[];

  @Column({ nullable: true })
  aggregateReview: string;
}
