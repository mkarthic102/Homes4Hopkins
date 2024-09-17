import { Test, TestingModule } from '@nestjs/testing';
import { FavoritePostController } from './favorite-post.controller';
import { FavoritePostService } from './favorite-post.service';
import { FavoritePostModule } from './favorite-post.module';
import { PostsService } from 'src/posts/posts.service';
import { Repository } from 'typeorm';
import { favoritePost } from './favorite-post.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Post } from 'src/posts/post.entity';
import { NotFoundException } from '@nestjs/common';
import { favoritePostResponseDto } from './favoritePost-response.dto';
import { User } from 'src/user/user.entity';

describe('FavoritePostController', () => {
  let controller: FavoritePostController;
  let service: FavoritePostService;
  let postsService: PostsService; // Declare a variable for the dependency
  let repository: Repository<favoritePost>;
  let postRepository: Repository<Post>;

  const FAV_POST_REPO_TOKEN = getRepositoryToken(favoritePost);
  const POST_REPO_TOKEN = getRepositoryToken(Post);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FavoritePostController],
      providers: [
        FavoritePostService,
        PostsService, // Add PostsService to the providers array
        {
          provide: FAV_POST_REPO_TOKEN,
          useValue: {
            create: jest.fn(),
            findOneBy: jest.fn(),
            createQueryBuilder: jest.fn(),
            save: jest.fn(),
            preload: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: POST_REPO_TOKEN,
          useValue: {
            create: jest.fn(),
            findOneBy: jest.fn(),
            createQueryBuilder: jest.fn(),
            save: jest.fn(),
            preload: jest.fn(),
            remove: jest.fn(),
          },
        },
        // Add other dependencies if any
        // You might need to provide the repository here if it's not imported through a module
      ],
    }).compile();

    controller = module.get<FavoritePostController>(FavoritePostController);
    service = module.get<FavoritePostService>(FavoritePostService);
    postsService = module.get<PostsService>(PostsService); // Get instance of PostsService
    repository = module.get<Repository<favoritePost>>(FAV_POST_REPO_TOKEN);
    postRepository = module.get<Repository<Post>>(POST_REPO_TOKEN);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  const mockUser: User = {
    id: 1,
    email: 'user@example.com',
    password: 'hashedPassword',
    firstName: 'John',
    lastName: 'Doe',
    avatar: 'http://example.com/avatar.jpg',
    isEmailVerified: true,
    verificationToken: null,
    posts: [],
    reviews: [],
    favoriteHousings: [],
    favoritePosts: [],
    bio: null,
    notifications: 0,
    age: '21',
    gender: 'Female',
    major: 'Computer Science',
    gradYear: '2030',
    stayLength: 'Summer',
    budget: '>$900',
    idealDistance: '<0.3 miles',
    petPreference: 'Pet-Free',
    cleanliness: 'Not Clean',
    smoker: 'Non-Smoker',
    socialPreference: 'Ambivert',
    peakProductivity: 'Afternoon Person',
  };

  const mockPost: Post = {
    id: 'uuid-1234', // Mock UUID
    title: 'Spacious Room Available',
    content: 'A spacious room in a shared apartment is available for rent.',
    timestamp: new Date(), // Current timestamp
    cost: 500, // Example cost in your preferred currency
    address: '123 Main Street, City, Country',
    images: [],
    // images: ['http://example.com/image1.jpg'], // Array of image URLs
    user: mockUser, // Associated User entity
    userId: mockUser.id, // ID of the associated user
    type: 'Roommate', // PostType, e.g., 'Roommate', 'Sublet', or 'Housing'
  };

  const mockPost1: Post = {
    id: 'uuid-1234', // Mock UUID
    title: 'Spacious Room Available',
    content: 'A spacious room in a shared apartment is available for rent.',
    timestamp: new Date(), // Current timestamp
    cost: 501, // Example cost in your preferred currency
    address: '123 Main Street, City, Country',
    images: [],
    // images: ['http://example.com/image1.jpg'], // Array of image URLs
    user: mockUser, // Associated User entity
    userId: mockUser.id, // ID of the associated user
    type: 'Roommate', // PostType, e.g., 'Roommate', 'Sublet', or 'Housing'
  };

  describe('create', () => {
    it('should create a favorite post', async () => {
      const mockFavoritePostResponse: favoritePost = {
        id: 'uuid-id',
        postId: '1',
        userId: mockUser.id,
        user: mockUser,
      };
      jest.spyOn(service, 'create').mockResolvedValue(mockFavoritePostResponse);

      const result = await controller.create('postId', 1);

      expect(result).toBe(mockFavoritePostResponse);
    });
  });

  describe('findOne', () => {
    it('should find a favorite post', async () => {
      const mockFavoritePostResponse: favoritePost = {
        id: 'uuid-id',
        postId: '1',
        userId: mockUser.id,
        user: mockUser,
      };
      jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(mockFavoritePostResponse);

      const result = await controller.findOne(1, 'postId');
      expect(result).toStrictEqual({ id: 'uuid-id' });
    });

    it('should return null if no favorite post found', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(null);

      const result = await controller.findOne(1, 'postId');

      expect(result).toEqual({ id: null });
    });
  });

  describe('remove', () => {
    it('should remove a favorite post', async () => {
      const mockFavoritePostResponse: favoritePost = {
        id: 'uuid-id',
        postId: '1',
        userId: mockUser.id,
        user: mockUser,
      };
      jest.spyOn(service, 'remove').mockResolvedValue(mockFavoritePostResponse);

      const result = await controller.remove(1, 'postId');
      const mockResponse = {
        statusCode: 200,
        message: 'favoritePost deleted successfully',
      };
      expect(result).toStrictEqual(mockResponse);
    });

    it('should throw NotFoundException if no favorite post found', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(null);

      await expect(controller.remove(1, 'postId')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should find all favorite posts', async () => {
      const mockFavoritePosts = [mockPost, mockPost1];
      jest.spyOn(service, 'findAll').mockResolvedValue(mockFavoritePosts);

      const result = await controller.findAll(1);

      expect(result).toEqual(mockFavoritePosts);
    });
  });
});
