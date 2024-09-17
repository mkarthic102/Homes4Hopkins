import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { Repository } from 'typeorm';
import { Post } from './post.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from 'src/user/user.service';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/user.entity';
import { CreatePostDto } from './create-post.dto';
import { UpdatePostDto } from './update-post.dto';
import { NotFoundException } from '@nestjs/common';
import { PostResponseDto } from './post-response.dto';
import { PostImage } from './post-images/post-image.entity';
import { PostImageService } from './post-images/post-image.service';

describe('PostsController', () => {
  let controller: PostsController;
  let postsService: PostsService;
  let postRepository: Repository<Post>;
  let userService: UserService;
  let postImageRepository: Repository<PostImage>;
  let postImageService: PostImageService;
  // let authService: AuthService;
  // let jwtService: JwtService;

  const POST_REPO_TOKEN = getRepositoryToken(Post);
  const USER_REPO_TOKEN = getRepositoryToken(User);
  const POST_IMAGE_REPO_TOKEN = getRepositoryToken(PostImage);

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        PostsService,
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
        UserService,
        {
          provide: USER_REPO_TOKEN,
          useValue: {
            create: jest.fn(),
            remove: jest.fn(),
            findOneBy: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
          },
        },
        AuthService,
        JwtService,
        {
          provide: USER_REPO_TOKEN,
          useValue: {
            validateUser: jest.fn(),
            login: jest.fn(),
          },
        },
        PostImageService,
        {
          provide: POST_IMAGE_REPO_TOKEN,
          useValue: {
            create: jest.fn(),
            remove: jest.fn(),
            find: jest.fn(),
            save: jest.fn(),
          }
        },
      ],
    }).compile();

    controller = module.get<PostsController>(PostsController);
    postsService = module.get<PostsService>(PostsService);
    postRepository = module.get<Repository<Post>>(POST_REPO_TOKEN);
    userService = module.get<UserService>(UserService);
    postImageService = module.get<PostImageService>(PostImageService);
    postImageRepository = module.get<Repository<PostImage>>(POST_IMAGE_REPO_TOKEN);
    // authService = module.get<AuthService>(AuthService);
    // jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('postService should be defined', () => {
    expect(postsService).toBeDefined();
  });

  it('PostRepository should be defined', () => {
    expect(postRepository).toBeDefined();
  });

  it('postImageService should be defined', () => {
    expect(postImageService).toBeDefined();
  });

  it('postImageRepository should be defined', () => {
    expect(postImageRepository).toBeDefined();
  });

  // Test for create
  it('should create a new post', async () => {
    const createPostDto: CreatePostDto = {
      title: 'Looking for roomie',
      content: 'Please be good',
      cost: 0,
      address: '123 Charm Street',
      imagesData: [],
      type: 'Roommate',
    }; // Fill in with appropriate mock data
    jest.spyOn(postsService, 'create').mockResolvedValue(mockPost);

    const result = await controller.create(createPostDto, mockUser.id);

    expect(postsService.create).toHaveBeenCalledWith(
      createPostDto,
      mockUser.id,
    );
    expect(result).toEqual(mockPost);
  });

  // Test for findOne
  it('should retrieve a single post by ID', async () => {
    jest.spyOn(postsService, 'findOne').mockResolvedValue(mockPost);

    const result = await controller.findOne('1');

    expect(postsService.findOne).toHaveBeenCalledWith('1');
    expect(result).toEqual(mockPost);
  });

  it('should throw NotFoundException if post not found', async () => {
    jest.spyOn(postsService, 'findOne').mockResolvedValue(undefined);

    await expect(controller.findOne('non-existent-id')).rejects.toThrow(
      NotFoundException,
    );
  });

  // Test for findAll
  it('should retrieve all posts with pagination, search, and additional filters', async () => {
    const mockPosts = [mockPost];
    jest.spyOn(postsService, 'findAll').mockResolvedValue(mockPosts);

    const search = 'sample search';
    // const email = 'user@jhu.edu';
    const withUserData = true;
    const type = 'Housing';
    const cost = 5000;
    const newuse = new PostResponseDto();
    expect(newuse instanceof PostResponseDto).toBe(true);

    const result = await controller.findAll(
      10,
      0,
      search,
      undefined,
      withUserData,
      type,
      cost,
    );

    expect(postsService.findAll).toHaveBeenCalledWith(
      10,
      0,
      search,
      undefined, // Since userId is derived from the email inside the method
      withUserData,
      type,
      cost,
    );
    expect(result.data).toEqual(mockPosts);
    expect(result.pagination).toEqual({ limit: 10, offset: 0 });
    expect(result.search).toEqual(search);
  });

  // Test for findAll method
  describe('findAll', () => {
    it('should retrieve posts without email filter', async () => {
      const mockPosts = [mockPost]; // Use your mockPost array
      jest.spyOn(postsService, 'findAll').mockResolvedValue(mockPosts);

      const result = await controller.findAll(
        10,
        0,
        '',
        undefined,
        false,
        undefined,
        undefined,
      );

      expect(postsService.findAll).toHaveBeenCalledWith(
        10,
        0,
        '',
        undefined, // userId is undefined as no email is provided
        false, // withUserData is false
        undefined, // type is not provided, so it's undefined
        undefined,
      );
      expect(result.data).toEqual(
        mockPosts.map((post) => {
          delete post.userId;
          if (post.user) {
            delete post.user.password;
          }
          return post;
        }),
      );
      expect(result.pagination).toEqual({ limit: 10, offset: 0 });
      // Add additional assertions if needed, like for the 'filter' and 'search' fields
    });

    it('should retrieve posts with email filter', async () => {
      const mockPosts = [mockPost]; // Use your mockPost array
      const userEmail = 'user@example.com';
      jest.spyOn(userService, 'findOne').mockResolvedValue(mockUser); // Assuming mockUser exists
      jest.spyOn(postsService, 'findAll').mockResolvedValue(mockPosts);

      const result = await controller.findAll(10, 0, '', userEmail, false);

      expect(userService.findOne).toHaveBeenCalledWith(userEmail);
      expect(postsService.findAll).toHaveBeenCalledWith(
        10,
        0,
        '',
        mockUser.id, // Assuming the user exists and mockUser has an id property
        false,
        undefined, // type is not provided, so it's undefined
        undefined, // default cost value
      );
      expect(result.data).toEqual(
        mockPosts.map((post) => {
          delete post.userId;
          if (post.user) {
            delete post.user.password;
          }
          return post;
        }),
      );
      expect(result.pagination).toEqual({ limit: 10, offset: 0 });
      // The filter should reflect the email used for filtering
      expect(result.filter).toEqual(userEmail);
    });

    it('should throw NotFoundException if user not found for provided email', async () => {
      jest.spyOn(userService, 'findOne').mockResolvedValue(undefined);

      await expect(
        controller.findAll(10, 0, '', 'non-existent-email'),
      ).rejects.toThrow(NotFoundException);
    });
    // Add more tests as necessary for different scenarios
  });

  describe('update', () => {
    // Test for update
    it('should update a post', async () => {
      const updatePostDto: UpdatePostDto = {
        // title
        // content
        // cost
        // address
        // type
        imagesData: [],
      }; // Fill in with appropriate mock data
      postImageRepository.find = jest.fn().mockResolvedValue([]);
      jest.spyOn(postsService, 'update').mockResolvedValue(mockPost);

      const result = await controller.update('uuid-1234', updatePostDto);

      expect(postsService.update).toHaveBeenCalledWith('uuid-1234', updatePostDto);
      expect(result).toEqual(mockPost);
    });

    it('should throw NotFoundException if post to update not found', async () => {
      jest.spyOn(postsService, 'update').mockResolvedValue(undefined);

      await expect(
        controller.update('non-existent-id', new UpdatePostDto()),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    const queryBuilder = {
      softDelete: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      execute: jest.fn().mockReturnThis(), // TODO: simulate soft delete?
    }
    // Test for remove
    it('should delete a post', async () => {
      postImageRepository.createQueryBuilder = jest.fn().mockReturnValue(queryBuilder);
      jest.spyOn(postImageService, 'findAll').mockResolvedValue([]);
      jest.spyOn(postsService, 'findOne').mockResolvedValue(mockPost);
      jest.spyOn(postsService, 'remove').mockResolvedValue(mockPost);

      const result = await controller.remove(mockPost.id);

      expect(postsService.remove).toHaveBeenCalledWith(mockPost.id);
      expect(result).toEqual({
        statusCode: 200,
        message: 'Post deleted successfully',
      });
    });

    it('should throw NotFoundException if post to delete not found', async () => {
      jest.spyOn(postsService, 'remove').mockResolvedValue(undefined);

      await expect(controller.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
