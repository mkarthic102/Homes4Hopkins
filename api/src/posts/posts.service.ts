import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post, PostType } from './post.entity';
import { CreatePostDto } from './create-post.dto';
import { UpdatePostDto } from './update-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  async create(createPostDto: CreatePostDto, userId: number): Promise<Post> {
    const { title, content, cost, address, type } = createPostDto;
    const post = await this.postRepository.create({
      title,
      content,
      cost,
      address,
      type,
      userId,
    });
    return this.postRepository.save(post);
  }

  async findOne(id: string): Promise<Post | null> {
    return this.postRepository.findOneBy({ id });
  }

  async findAll(
    limit: number,
    offset: number,
    search?: string,
    userId?: number,
    withUserData?: boolean,
    type?: PostType,
    cost?: number,
  ): Promise<Post[]> {
    const queryBuilder = this.postRepository.createQueryBuilder('posts');
    // Add condition to join user data
    if (withUserData) {
      queryBuilder.leftJoinAndSelect('posts.user', 'user');
    }

    let hasWhereCondition = false;

    if (search !== undefined) {
      queryBuilder.where('posts.content ILIKE :search OR posts.title ILIKE :search', {
        search: `%${search}%`,
      });
      hasWhereCondition = true;
    }

    if (userId !== undefined) {
      if (hasWhereCondition) {
        queryBuilder.andWhere('posts.userId = :userId', { userId });
      } else {
        queryBuilder.where('posts.userId = :userId', { userId });
        hasWhereCondition = true;
      }
    }

    if (type !== undefined) {
      if (hasWhereCondition) {
        queryBuilder.andWhere('posts.type = :type', { type });
      } else {
        queryBuilder.where('posts.type = :type', { type });
        hasWhereCondition = true;
      }
    }

    if (cost !== undefined) {
      if (hasWhereCondition) {
        queryBuilder.andWhere('posts.cost <= :cost', { cost });
      } else {
        queryBuilder.where('posts.cost <= :cost', { cost });
        hasWhereCondition = true;
      }
    }

    queryBuilder.limit(limit);
    queryBuilder.offset(offset);

    queryBuilder.orderBy('posts.timestamp', 'DESC');

    return await queryBuilder.getMany();
  }

  async update(id: string, updatePostDto: UpdatePostDto): Promise<Post | null> {
    const post = await this.postRepository.preload({ id, ...updatePostDto });
    if (!post) {
      return null;
    }
    return this.postRepository.save(post);
  }

  async remove(id: string): Promise<Post | null> {
    const post = await this.findOne(id);
    if (!post) {
      return null;
    }
    return this.postRepository.remove(post);
  }
}
