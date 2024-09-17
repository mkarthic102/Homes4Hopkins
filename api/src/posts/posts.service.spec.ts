import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.entity';
import { CreatePostDto } from './create-post.dto';
import { UpdatePostDto } from './update-post.dto';
import { User } from 'src/user/user.entity';

describe('PostsService', () => {
  let service: PostsService;
  let repository: Repository<Post>;

  const POST_REPO_TOKEN = getRepositoryToken(Post);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    repository = module.get<Repository<Post>>(POST_REPO_TOKEN);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const mockUser: User = {
    id: 1, // Mock user ID
    password: 'hashedpassword123', // Normally, this would be a hashed password
    email: 'example@jhu.edu', // needs to end in jhu.edu
    avatar: 'http://example.com/avatar.jpg', // URL to an avatar image, can be null
    firstName: 'John',
    lastName: 'Doe',
    isEmailVerified: false, // Indicates whether the email is verified
    verificationToken: 'verificationToken123', // Mock verification token, can be null
    posts: [], // Mock posts array, can be empty or contain multiple Post entities
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

  const resultPost: Post = {
    id: 'uuid-id', // Mock UUID
    title: 'Spacious 2 Bedroom Apartment',
    content:
      'A lovely two-bedroom apartment in the heart of the city, close to amenities. Fully furnished and ready to move in.',
    timestamp: new Date(), // Current date and time
    cost: 1200,
    address: '123 Main Street, CityTown',
    images: [],
    // images: ['http://example.com/image1.jpg'], // Array of image URLs, can be empty
    user: mockUser, // This should be a mock User entity
    userId: 1, // Mock user ID
    type: 'Housing', // Must be 'Roommate', 'Sublet', or 'Housing'
  };

  describe('create a post', () => {
    it('should create a new post', async () => {
      const createPostDto: CreatePostDto = {
        title: 'Spacious 2 Bedroom Apartment',
        content:
          'A lovely two-bedroom apartment in the heart of the city, close to amenities. Fully furnished and ready to move in.',
        cost: 1200,
        address: '123 Main Street, CityTown',
        imagesData: [],
        // images: ['http://example.com/apartment.jpg'], // This field is optional
        type: 'Housing', // Must be one of ['Roommate', 'Sublet', 'Housing']
      };
      const userId = 1;

      jest.spyOn(repository, 'create').mockReturnValue(resultPost);
      jest.spyOn(repository, 'save').mockResolvedValue(resultPost);
      delete createPostDto.imagesData;
      expect(await service.create(createPostDto, userId)).toEqual(resultPost);
      expect(repository.create).toHaveBeenCalledWith({
        ...createPostDto,
        userId,
      });
      expect(repository.save).toHaveBeenCalledWith(resultPost);
    });
  });

  describe('findOne', () => {
    it('should return a single post', async () => {
      const postId = 'uuid-id';

      jest.spyOn(repository, 'findOneBy').mockResolvedValue(resultPost);

      expect(await service.findOne(postId)).toEqual(resultPost);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: postId });
    });
  });

  describe('findAll', () => {
    // Mock Array of Post items
    const resultPostArray: Post[] = [
      { ...resultPost, content: 'Post A' },
      { ...resultPost, content: 'Post B' },
      { ...resultPost, content: 'Post C' },
    ];
    const limit = 10;
    const offset = 0;
    const queryBuilder = {
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(resultPostArray),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
    };

    it('should return an array of posts', async () => {
      const search = undefined;
      const userId = undefined;
      const withUserData = false;

      repository.createQueryBuilder = jest.fn().mockReturnValue(queryBuilder);

      const result = await service.findAll(
        limit,
        offset,
        search,
        userId,
        withUserData,
      );

      expect(repository.createQueryBuilder).toHaveBeenCalledWith('posts');
      expect(queryBuilder.limit).toHaveBeenCalledWith(limit);
      expect(queryBuilder.offset).toHaveBeenCalledWith(offset);
      expect(queryBuilder.orderBy).toHaveBeenCalledWith(
        'posts.timestamp',
        'DESC',
      );
      if (search !== undefined) {
        expect(queryBuilder.where).toHaveBeenCalledWith(
          'posts.content ILIKE :search',
          {
            search: `%${search}%`,
          },
        );
      }
      // Add conditions for userId and withUserData if necessary
      expect(queryBuilder.getMany).toHaveBeenCalled();
      expect(result).toEqual(resultPostArray);
    });

    // Additional test cases for different scenarios, e.g., with a search term or userId
  });

  describe('update', () => {
    const updatePostDto: UpdatePostDto = {
      title: 'Updated Title for Existing Post',
      content: 'Updated content with more detailed information.',
      cost: 1500,
      address: '321 Updated Address Lane',
      imagesData: [],
      // images: ['http://example.com/updated-image.jpg'],
      type: 'Sublet',
    };
    it('should update a post', async () => {
      const postId = 'uuid-id';
      // Assuming resultPost is already defined as shown previously
      resultPost.title = updatePostDto.title ?? resultPost.title;
      resultPost.content = updatePostDto.content ?? resultPost.content;
      resultPost.cost = updatePostDto.cost ?? resultPost.cost;
      resultPost.address = updatePostDto.address ?? resultPost.address;
      // // Assuming image is now a single string rather than an array
      // resultPost.images = updatePostDto.images
      //   ? updatePostDto.images
      //   : resultPost.images;
      resultPost.type = updatePostDto.type ?? resultPost.type;

      jest.spyOn(repository, 'preload').mockResolvedValue(resultPost);
      jest.spyOn(repository, 'save').mockResolvedValue(resultPost);

      expect(await service.update(postId, updatePostDto)).toEqual(resultPost);
      expect(repository.preload).toHaveBeenCalledWith({
        id: postId,
        ...updatePostDto,
      });
      expect(repository.save).toHaveBeenCalledWith(resultPost);
    });

    it('should return null if post does not exist', async () => {
      jest.spyOn(repository, 'preload').mockResolvedValue(null);

      const result = await service.update('invalid-id', updatePostDto);

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should remove a post', async () => {
      const postId = 'uuid-id';
      jest.spyOn(service, 'findOne').mockResolvedValue(resultPost);
      jest.spyOn(repository, 'remove').mockResolvedValue(resultPost);

      expect(await service.remove(postId)).toEqual(resultPost);
      expect(service.findOne).toHaveBeenCalledWith(postId);
      expect(repository.remove).toHaveBeenCalledWith(resultPost);
    });

    it('should return null if post does not exist', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(null);
      const result = await service.remove('invalid-id');
      expect(result).toBeNull();
    });
  });
});
