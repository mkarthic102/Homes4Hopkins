import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Post } from "../post.entity";

// Table for storing meta-data of images uploaded to Supabase storage
@Entity()
export class PostImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  url: string;

  @Column()
  path: string;

  @ManyToOne(() => Post, (post) => post.images, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'postId'})
  post: Post;

  @Column({ nullable: true })
  postId: string; // for joining table row

  @DeleteDateColumn()
  deletedAt: Date;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;
}