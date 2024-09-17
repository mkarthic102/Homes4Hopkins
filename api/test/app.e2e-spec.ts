import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { UserLoginDTO } from 'src/user/user-login.dto';
import { CreateUserDTO } from 'src/user/create-user.dto';
import { UserResponseDTO } from 'src/user/user-response.dto';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let token;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    const response = await request(app.getHttpServer())
      .post('/users/login')
      .send({ email: 'user@jhu.edu', password: 'validPassword' });

    token = response.body.access_token;
  });

  it('/users/:email (GET)', () => {
    return request(app.getHttpServer())
      .get('/users/user@jhu.edu')
      .set('Authorization', `Bearer ${token}`) // Use the token for authorization
      .expect(HttpStatus.OK);
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  // Example data for UserLoginDTO
  const loginDto: UserLoginDTO = {
    email: 'test@jhu.edu',
    password: 'password123',
  };

  // Example data for CreateUserDTO
  const createUserDto: CreateUserDTO = {
    email: 'newuser@jhu.edu',
    password: 'newpassword123',
    firstName: 'New',
    lastName: 'User',
    avatar: 'http://example.com/avatar.jpg', // This field is optional
  };

  // Example data for CreateUserDTO
  const userResponseDto = {
    email: 'newuser@jhu.edu',
    avatar: 'http://example.com/avatar.jpg',
    firstName: 'New',
    lastName: 'User',
    verificationToken: null,
    id: 1,
    isEmailVerified: false
  };

  // Test for GET one user by email
  it('/users/:email (GET)', () => {
    return request(app.getHttpServer())
      .get('/users/user@jhu.edu')
      .expect(HttpStatus.OK);
  });

  it('/users/register (POST)', () => {
    return request(app.getHttpServer())
      .post('/users/register')
      .send(createUserDto)
      .expect(userResponseDto);
  });
  

  // Test for login
  it('/users/login (POST)', () => {
    return request(app.getHttpServer())
      .post('/users/login')
      .send(loginDto)
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(res.body).toHaveProperty('access_token');
      });
  });

  
  // ... (rest of the imports and setup)

});
