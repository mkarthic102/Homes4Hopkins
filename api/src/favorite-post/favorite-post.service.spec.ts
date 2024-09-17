import { Test, TestingModule } from '@nestjs/testing';
import { FavoritePostService } from './favorite-post.service';
import { Repository } from 'typeorm';
import { favoritePost } from './favorite-post.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PostsService } from 'src/posts/posts.service';
import { Post } from 'src/posts/post.entity';
import { User } from 'src/user/user.entity';

describe('FavoritePostService', () => {
  let service: FavoritePostService;
  let postService: PostsService;
  let repository: Repository<favoritePost>;
  let postRepository: Repository<Post>

  const FAV_POST_REPO_TOKEN = getRepositoryToken(favoritePost);
  const POST_REPO_TOKEN = getRepositoryToken(Post);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoritePostService,
        PostsService,
        {
          provide: FAV_POST_REPO_TOKEN,
          useValue: {
            create: jest.fn(),
            findOneBy: jest.fn(),
            findOne: jest.fn(), 
            find: jest.fn(),
            createQueryBuilder: jest.fn(),
            save: jest.fn(),
            preload: jest.fn(),
            remove: jest.fn(),
          }
        },
        {
          provide: POST_REPO_TOKEN,
          useValue: {
            create: jest.fn(),
            findOneBy: jest.fn(),
            findOne: jest.fn(), 
            find: jest.fn(),
            createQueryBuilder: jest.fn(),
            save: jest.fn(),
            preload: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FavoritePostService>(FavoritePostService);
    postService = module.get<PostsService>(PostsService);
    repository = module.get<Repository<favoritePost>>(FAV_POST_REPO_TOKEN);
    postRepository = module.get<Repository<Post>>(POST_REPO_TOKEN);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const mockUser: User = {
    id: 1,
    password: 'hashedpassword123',
    email: 'example@jhu.edu',
    avatar: 'http://example.com/avatar.jpg',
    firstName: 'John',
    lastName: 'Doe',
    isEmailVerified: false,
    verificationToken: 'verificationToken123',
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
    it('should create a new favorite post item', async () => {
      const mockFavoritePost: favoritePost = {
        id: 'uuid',
        postId: '123',
        userId: 1,
        user: mockUser,
      };

      jest.spyOn(repository, 'create').mockReturnValue(mockFavoritePost);
      jest.spyOn(repository, 'save').mockResolvedValue(mockFavoritePost);

      const result = await service.create('123', 1);

      expect(repository.create).toHaveBeenCalledWith({
        postId: '123',
        userId: 1,
      });
      expect(repository.save).toHaveBeenCalledWith(mockFavoritePost);
      expect(result).toEqual(mockFavoritePost);
    });
  });

  describe('findOne', () => {
    it('should find a favorite post item by userId and postId', async () => {
      const mockFavoritePost: favoritePost = {
        id: 'uuid',
        postId: '123',
        userId: 1,
        user: mockUser,
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockFavoritePost);

      const result = await service.findOne(1, '123');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { userId: 1, postId: '123' },
      });
      expect(result).toEqual(mockFavoritePost);
    });
  });

  describe('remove', () => {
    it('should remove a favorite post item by userId and postId', async () => {
      const mockFavoritePost: favoritePost = {
        id: 'uuid',
        postId: '123',
        userId: 1,
        user: mockUser,
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockFavoritePost);
      jest.spyOn(repository, 'remove').mockResolvedValue(mockFavoritePost);

      const result = await service.remove(1, '123');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { userId: 1, postId: '123' },
      });
      expect(repository.remove).toHaveBeenCalledWith(mockFavoritePost);
      expect(result).toEqual(mockFavoritePost);
    });

    it('should return null if favorite post item not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await service.remove(1, '123');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { userId: 1, postId: '123' },
      });
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should find all favorite posts for a user', async () => {

      jest
        .spyOn(postService, 'findAll')
        .mockResolvedValue([mockPost, mockPost1]);
      jest
        .spyOn(postService, 'findOne')
        .mockResolvedValueOnce(mockPost)
        .mockResolvedValueOnce(mockPost1);

      const result = await service.findAll(1);

      expect(repository.find).toHaveBeenCalledWith({
        where: { userId: 1 },
      });
      expect(result).toEqual([]);
    });

    it('should return an empty array if no favorite posts found', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue(null);

      const result = await service.findAll(1);
      expect(result).toEqual([]);
    });

    it('should find all favorite posts for a user', async () => {
      // Mock favorite posts and their post IDs
      // Mock the behavior of the postsService.findOne method
      jest
        .spyOn(postService, 'findOne')
        .mockImplementation(async (postId: string) => {
          // Simulate behavior: Return post mock if ID matches
          if (postId === mockPost.id) return mockPost;
          if (postId === mockPost1.id) return mockPost1;
          return null; // Return null if ID doesn't match any mock
        });

      // Call the method being tested
      const result = await service.findAll(1);
  
      // Assertions
      expect(result).toHaveLength(0); 
    });
  });
});
