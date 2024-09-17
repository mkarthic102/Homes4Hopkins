import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth/auth.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './auth/local.strategy';
import { User } from './user/user.entity';
import { UserService } from './user/user.service';
import { UserController } from './user/user.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './auth/jwt.strategy';
import { HousingModule } from './housing/housing.module';
import { PostsModule } from './posts/posts.module';
import { ReviewsModule } from './reviews/reviews.module';
import { FavoritePostModule } from './favorite-post/favorite-post.module';
import { FavoriteHousingModule } from './favorite-housing/favorite-housing.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION'),
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User]),
    PassportModule,
    ConfigModule.forRoot({}), // Loads the .env file
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
      }),
      inject: [ConfigService],
    }),
    HousingModule,
    PostsModule,
    ReviewsModule,
    FavoritePostModule,
    FavoriteHousingModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController, UserController],
  providers: [AppService, AuthService, LocalStrategy, JwtStrategy, UserService],
})
export class AppModule {}
