import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateUserDTO } from './create-user.dto';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UpdateUserDTO } from './update-user.dto';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: Repository<User>;

  const USER_REPO_TOKEN = getRepositoryToken(User);

  const mockUser: User = {
    id: 1,
    email: 'example@jhu.edu',
    password: 'hashedPassword', // In real scenarios, this would be a hashed password
    firstName: 'John',
    lastName: 'Doe',
    avatar: 'http://example.com/avatar.jpg', // Can be null if testing for nullability
    isEmailVerified: false,
    verificationToken: '123456', // Can also be null
    posts: [], // Assuming this user has no posts initially; you can add mock posts if needed
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

  const userDto: CreateUserDTO = {
    email: 'example@jhu.edu',
    password: 'StrongPass123!',
    firstName: 'John',
    lastName: 'Doe',
    avatar: 'http://example.com/avatar.jpg', // This field is optional
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: USER_REPO_TOKEN,
          useValue: {
            create: jest.fn(),
            remove: jest.fn(),
            findOne: jest.fn(),
            preload: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(USER_REPO_TOKEN);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  it('UserRepository should be defined', () => {
    expect(userRepository).toBeDefined();
  });

  describe('getAll', () => {
    it('should return an array of users', async () => {
      const mockUsers: User[] = [mockUser, mockUser];
      jest.spyOn(userRepository, 'find').mockResolvedValue(mockUsers);

      const result = await userService.getAll();
      expect(result).toEqual(mockUsers);
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

      const result = await userService.findOne('user@example.com');
      expect(result).toEqual(mockUser);
    });
  });

  describe('createUser', () => {
    it('should successfully create a user', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);
      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(() => Promise.resolve('hashedPassword'));
      jest.spyOn(userRepository, 'create').mockReturnValue(mockUser);
      jest.spyOn(userRepository, 'save').mockResolvedValue(mockUser);

      const result = await userService.createUser(userDto);
      expect(result).toEqual(mockUser);
    });

    it('should throw an error if email already exists', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

      await expect(userService.createUser(userDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(userRepository, 'remove').mockResolvedValue(mockUser);

      const result = await userService.deleteUser('user@example.com');
      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    const updateUserDto: UpdateUserDTO = {
      firstName: 'Jane',
      lastName: 'Love',
      avatar: 'http://example.com/avatar2.jpg',
      bio: 'Hello',
      notifications: 1,
      age: '100',
      gender: 'Female',
      major: 'Psychology',
      gradYear: '2021',
      stayLength: 'Summer',
      budget: '>$900',
      idealDistance: '<0.3 miles',
      petPreference: 'Pet-Free',
      cleanliness: 'Not Clean',
      smoker: 'Non-Smoker',
      socialPreference: 'Ambivert',
      peakProductivity: 'Afternoon Person',
    };
    it('should update a user', async () => {
      const userId = 1;
      // Assuming mockUser is already defined as shown previously
      mockUser.firstName = updateUserDto.firstName ?? mockUser.firstName;
      mockUser.lastName = updateUserDto.lastName ?? mockUser.lastName;
      mockUser.avatar = updateUserDto.avatar ?? mockUser.avatar;
      mockUser.bio = updateUserDto.bio ?? mockUser.bio;
      mockUser.notifications =
        updateUserDto.notifications ?? mockUser.notifications;

      jest.spyOn(userRepository, 'preload').mockResolvedValue(mockUser);
      jest.spyOn(userRepository, 'save').mockResolvedValue(mockUser);

      const result = await userService.update(userId, updateUserDto);

      expect(result).toEqual(mockUser);
      expect(userRepository.preload).toHaveBeenCalledWith({
        id: userId,
        ...updateUserDto,
      });
      expect(userRepository.save).toHaveBeenCalledWith(mockUser);
    });

    it('should return null if user does not exist', async () => {
      jest.spyOn(userRepository, 'preload').mockResolvedValue(null);

      const result = await userService.update(0, updateUserDto);

      expect(result).toBeNull();
    });
  });

  describe('verifyEmail', () => {
    const verificationToken = '123456';

    it('should verify email and return true', async () => {
      const email = 'example@jhu.edu';
      const updatedUser = { ...mockUser, isEmailVerified: true };
      jest.spyOn(userService, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(userRepository, 'save').mockResolvedValue(updatedUser);

      const result = await userService.verifyEmail(email, verificationToken);

      expect(result).toBe(true);
      expect(userService.findOne).toHaveBeenCalledWith(email);
      expect(userRepository.save).toHaveBeenCalledWith({
        ...mockUser,
        isEmailVerified: true,
      });
    });

    it('should not verify email if user does not exist and return false', async () => {
      const email = 'nonexistent@example.com';
      jest.spyOn(userService, 'findOne').mockResolvedValue(null);

      const result = await userService.verifyEmail(email, verificationToken);

      expect(result).toBe(false);
      expect(userService.findOne).toHaveBeenCalledWith(email);
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should not verify email if verification token does not match and return false', async () => {
      const email = 'example@jhu.edu';
      const invalidVerificationToken = 'invalidToken';
      jest.spyOn(userService, 'findOne').mockResolvedValue(mockUser);

      const result = await userService.verifyEmail(
        email,
        invalidVerificationToken,
      );

      expect(result).toBe(false);
      expect(userService.findOne).toHaveBeenCalledWith(email);
      expect(userRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('incrementNotifs', () => {
    beforeEach(() => {
      // Reset mockUser notifications to 0 before each test
      mockUser.notifications = 0;
    });

    it('should increment notifications for existing user', async () => {
      jest.spyOn(userRepository, 'preload').mockResolvedValue(mockUser);
      jest.spyOn(userRepository, 'save').mockResolvedValue(mockUser);

      jest.spyOn(userService, 'findOne').mockResolvedValue(mockUser);

      const updatedUser = await userService.incrementNotifs(mockUser.email);

      expect(updatedUser.notifications).toBe(1);
    });

    it('should return null for non-existing user', async () => {
      jest.spyOn(userRepository, 'preload').mockResolvedValue(null);

      const userEmail = 'nonexisting@example.com';
      const updatedUser = await userService.incrementNotifs(userEmail);
      expect(updatedUser).toBeNull();
    });
  });

  describe('clearNotifs', () => {
    it('should clear notifications for existing user', async () => {
      jest.spyOn(userRepository, 'preload').mockResolvedValue(mockUser);
      jest.spyOn(userRepository, 'save').mockResolvedValue(mockUser);

      jest.spyOn(userService, 'findOne').mockResolvedValue(mockUser);

      const updatedUser = await userService.clearNotifs(mockUser.email);

      expect(updatedUser.notifications).toBe(0);
    });

    it('should return null for non-existing user', async () => {
      jest.spyOn(userRepository, 'preload').mockResolvedValue(null);

      const userEmail = 'nonexisting@example.com';
      const updatedUser = await userService.clearNotifs(userEmail);
      expect(updatedUser).toBeNull();
    });
  });
});
