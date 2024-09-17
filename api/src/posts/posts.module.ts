import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { Post } from './post.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { PostImageService } from './post-images/post-image.service';
import { PostImage } from './post-images/post-image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post, User, PostImage])], 
  providers: [PostsService, UserService, PostImageService],
  controllers: [PostsController]
})
export class PostsModule {}
