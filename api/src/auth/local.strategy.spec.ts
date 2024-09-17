import { Test } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { LocalStrategy } from './local.strategy';
import { AuthService } from './auth.service';

describe('LocalStrategy', () => {
  let localStrategy: LocalStrategy;
  let authService: AuthService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        LocalStrategy,
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(),
          },
        },
      ],
    }).compile();

    localStrategy = moduleRef.get<LocalStrategy>(LocalStrategy);
    authService = moduleRef.get<AuthService>(AuthService);
  });

  it('should validate and return the user object if credentials are valid', async () => {
    const user = { id: 1, username: 'john.doe', password: 'strongPassword123' };
    jest.spyOn(authService, 'validateUser').mockResolvedValue(user);

    const result = await localStrategy.validate('john.doe', 'strongPassword123');
    expect(result).toEqual(user);
    expect(authService.validateUser).toHaveBeenCalledWith('john.doe', 'strongPassword123');
  });

  it('should throw an UnauthorizedException if user cannot be validated', async () => {
    jest.spyOn(authService, 'validateUser').mockResolvedValue(null);

    await expect(localStrategy.validate('john.doe', 'wrongPassword'))
      .rejects
      .toThrow(UnauthorizedException);
    expect(authService.validateUser).toHaveBeenCalledWith('john.doe', 'wrongPassword');
  });

  // Add more tests as necessary for different scenarios
});
