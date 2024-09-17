import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { favoritePost } from './favorite-post.entity';
import { Repository } from 'typeorm';
import { PostsService } from 'src/posts/posts.service';
import { Post } from 'src/posts/post.entity';

@Injectable()
export class FavoritePostService {
  constructor(
    @InjectRepository(favoritePost)
    private favoritePostRepository: Repository<favoritePost>,
    private postsService: PostsService,
  ) {}

  async create(postId: string, userId: number): Promise<favoritePost | null> {
    const favorite_post = await this.favoritePostRepository.create({
      postId,
      userId,
    });

    return this.favoritePostRepository.save(favorite_post);
  }

  async findOne(userId: number, postId: string): Promise<favoritePost | null> {
    return await this.favoritePostRepository.findOne({
      where: {
        userId,
        postId,
      },
    });
  }

  async remove(userId: number, postId: string): Promise<favoritePost | null> {
    const favorite_post = await this.findOne(userId, postId);
    if (!favorite_post) {
      return null;
    }
    return this.favoritePostRepository.remove(favorite_post);
  }

  async findAll(userId: number): Promise<Post[] | null> {
    // Retrieve favorite posts for the specified userId
    const favoritePosts = await this.favoritePostRepository.find({
      where: { userId },
    });

    // If no favorite posts are found, return empty array
    if (!favoritePosts) {
      return [];
    }

    // Extract post IDs from favorite posts
    const postIds = favoritePosts.map((fp) => fp.postId);

    // Use PostsService to find all posts with matching IDs
    const posts: Post[] = [];
    for (const postId of postIds) {
      const post = await this.postsService.findOne(postId);
      if (post) {
        posts.push(post);
      }
    }
    return posts;
  }
}
