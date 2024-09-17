import { Module } from '@nestjs/common';
import { FavoritePostService } from './favorite-post.service';
import { FavoritePostController } from './favorite-post.controller';
import { favoritePost } from './favorite-post.entity';
import { User } from 'src/user/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from 'src/user/user.service';
import { Post } from 'src/posts/post.entity';
import { PostsService } from 'src/posts/posts.service';

@Module({
  imports: [TypeOrmModule.forFeature([favoritePost, User, Post])],
  providers: [FavoritePostService, UserService, PostsService],
  controllers: [FavoritePostController],
})
export class FavoritePostModule {}
