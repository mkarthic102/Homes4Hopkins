import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { UserService } from './user.service';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDTO } from './create-user.dto';
import { UserResponseDTO } from './user-response.dto';
import { UserLoginDTO } from './user-login.dto';
import { UpdateUserDTO } from './update-user.dto';
import { BadRequestException } from '@nestjs/common';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;
  let userRepository: Repository<User>;
  let authService: AuthService;
  let jwtService: JwtService;

  const exampleUser: User = {
    id: 1,
    password: 'hashedPassword123', // Assume this is a hashed password
    email: 'example@domain.com',
    avatar: 'http://example.com/avatar.jpg', // Can be null if you want to test the nullable field
    firstName: 'John',
    lastName: 'Doe',
    isEmailVerified: false,
    verificationToken: 'someRandomToken123', // Can be null as well
    posts: [],
    reviews: [],
    favoriteHousings: [],
    favoritePosts: [],
    bio: 'Hello',
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

  const USER_REPO_TOKEN = getRepositoryToken(User);
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: USER_REPO_TOKEN,
          useValue: {
            create: jest.fn(),
            remove: jest.fn(),
            findOneBy: jest.fn(),
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
            incrementNotifs: jest.fn(),
            clearNotifs: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(USER_REPO_TOKEN);
    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('userService should be defined', () => {
    expect(userService).toBeDefined();
  });

  it('UserRepository should be defined', () => {
    expect(userRepository).toBeDefined();
  });

  it('authService should be defined', () => {
    expect(authService).toBeDefined();
  });

  it('jwtService should be defined', () => {
    expect(jwtService).toBeDefined();
  });

  // Test for getAll
  it('should get all users', async () => {
    jest.spyOn(userService, 'getAll').mockResolvedValueOnce([]);
    expect(await controller.getAll()).toEqual([]);
  });

  // Test for getOne
  it('should get one user', async () => {
    jest.spyOn(userService, 'findOne').mockResolvedValueOnce(exampleUser);
    expect(await controller.getOne('example@domain.com')).toEqual(exampleUser);
  });

  // Test for remove
  it('should remove a user', async () => {
    jest.spyOn(userService, 'deleteUser').mockResolvedValueOnce(exampleUser);
    expect(await controller.remove('test@example.com')).toEqual({
      statusCode: 200,
      message: 'User removed successfully',
    });
  });

  // Test for register
  it('should register a user', async () => {
    const userDto: CreateUserDTO = {
      email: 'user@jhu.edu',
      password: 'strongPassword123',
      firstName: 'John',
      lastName: 'Doe',
      avatar: 'http://example.com/avatar.jpg', // optional, can be omitted
    };
    const newuser = new UserResponseDTO();
    expect(newuser instanceof UserResponseDTO).toBe(true);
    /*
    const userResponse: UserResponseDTO = {
      id: 1, // Assuming a sample ID for the user
      email: userDto.email,
      firstName: userDto.firstName,
      lastName: userDto.lastName,
      avatar: userDto.avatar || 'default_avatar_url', // Fallback to a default if avatar is optional
      isEmailVerified: false, // Assuming the email has not been verified yet
      bio: 'A brief user biography', // Sample bio, could also be an empty string or other default
      notifications: 1, // default is 0 but could be any number
    };
    */
    jest.spyOn(userService, 'createUser').mockResolvedValueOnce(exampleUser);
    const result: UserResponseDTO = await controller.register(userDto);
    expect(result).toEqual(exampleUser);
  });

  it('should verify email successfully', async () => {
    const verifyEmailDto = {
      email: 'test@example.com',
      verificationToken: 'randomToken',
    };
    jest.spyOn(userService, 'verifyEmail').mockResolvedValueOnce(true);

    const result = await controller.verifyEmail(verifyEmailDto);

    expect(result).toEqual({
      statusCode: 200,
      message: 'Email verified. You may now log in.',
    });
  });

  it('should throw BadRequestException on failed email verification', async () => {
    const verifyEmailDto = {
      email: 'test@example.com',
      verificationToken: 'randomToken',
    };
    jest.spyOn(userService, 'verifyEmail').mockResolvedValueOnce(false);

    await expect(controller.verifyEmail(verifyEmailDto)).rejects.toThrow(
      BadRequestException,
    );
  });

  // Test for login
  it('should login a user', async () => {
    const userDto: UserLoginDTO = {
      email: 'user@jhu.edu',
      password: 'userPassword',
    };
    const response = { access_token: 'token' };
    jest
      .spyOn(authService, 'validateUser')
      .mockResolvedValueOnce({ email: userDto.email, id: 1 });
    jest.spyOn(authService, 'login').mockResolvedValueOnce(response);
    expect(await controller.login(userDto)).toEqual(response);
  });

  //Test for edit user
  it('should update a user', async () => {
    const updateUserDto = new UpdateUserDTO(); // Fill in with appropriate mock data
    jest.spyOn(userService, 'update').mockResolvedValue(exampleUser);

    const result = await controller.update(1, updateUserDto);

    expect(userService.update).toHaveBeenCalledWith(1, updateUserDto);
    expect(result).toEqual(exampleUser);
  });

  // test for incremement notifications
  it('should increment notifications for a user', async () => {
    jest
      .spyOn(userService, 'incrementNotifs')
      .mockResolvedValueOnce(exampleUser);
    const result: UserResponseDTO = await controller.incrementNotifications(
      exampleUser.email,
    );
    expect(userService.incrementNotifs).toHaveBeenCalledWith(exampleUser.email);
    expect(result).toEqual(exampleUser);
  });

  // test for clear notifications
  it('should clear notifications for a user', async () => {
    jest.spyOn(userService, 'clearNotifs').mockResolvedValueOnce(exampleUser);
    const result: UserResponseDTO = await controller.clearNotifs(
      exampleUser.email,
    );
    expect(userService.clearNotifs).toHaveBeenCalledWith(exampleUser.email);
    expect(result).toEqual(exampleUser);
  });
});
