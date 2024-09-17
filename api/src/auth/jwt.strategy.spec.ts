import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('secret'), // Mock the JWT_SECRET or other config values
          },
        },
      ],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(jwtStrategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return user object based on JWT payload', async () => {
      const payload = { id: 1, email: 'user@example.com' };
      const expectedUser = { userId: payload.id, email: payload.email };
  
      const result = await jwtStrategy.validate(payload);
  
      expect(result).toEqual(expectedUser);
    });
  });
  
});
