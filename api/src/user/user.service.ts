import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDTO } from './create-user.dto';
import { UpdateUserDTO } from './update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(email: string): Promise<User | undefined> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['reviews'],
    });
  }

  async createUser(userDto: CreateUserDTO): Promise<User> {
    const existingUser = await this.findOne(userDto.email);
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }
    const verificationToken = this.generateVerificationToken();

    // HERE I would send the email
    sendEmail(userDto.email, verificationToken);

    const { password, ...userInfo } = userDto;
    const user = await this.userRepository.create({
      ...userInfo,
      password: await bcrypt.hash(password, 10),
      verificationToken: verificationToken,
    });
    return this.userRepository.save(user);
  }

  generateVerificationToken(): string {
    const min = 100000; // Minimum value for a 6-digit number
    const max = 999999; // Maximum value for a 6-digit number
    // Generate a random integer between min and max (inclusive)
    const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
    // Convert the random number to a string and return
    return randomNum.toString();
  }

  async verifyEmail(
    email: string,
    verificationToken: string,
  ): Promise<boolean> {
    const user = await this.findOne(email);
    if (!user) {
      return false;
    }
    if (
      user.verificationToken === verificationToken ||
      verificationToken === '000000'
    ) {
      // for cypress testing purposes
      user.isEmailVerified = true;
      await this.userRepository.save(user);
      return true;
    }

    // If verification token doesn't match, return false
    return false;
  }

  async deleteUser(email: string) {
    const user = await this.findOne(email);
    return this.userRepository.remove(user);
  }

  async update(id: number, updateUserDto: UpdateUserDTO): Promise<User | null> {
    const user = await this.userRepository.preload({ id, ...updateUserDto });
    if (!user) {
      return null;
    }
    return this.userRepository.save(user);
  }

  async incrementNotifs(email: string): Promise<User | null> {
    const user = await this.findOne(email);
    if (!user) {
      return null;
    }

    user.notifications += 1;
    await this.userRepository.save(user);
    return user;
  }

  async clearNotifs(email: string): Promise<User | null> {
    const user = await this.findOne(email);
    if (!user) {
      return null;
    }

    user.notifications = 0;
    await this.userRepository.save(user);
    return user;
  }
}

export const sendEmail = async (email: string, token: string) => {
  const apiKey = 'api-CE75802CDC984ECA988EAA1C66B5A40F';
  const url = 'https://api.smtp2go.com/v3/email/send';
  const clientURL = `${process.env.CLIENT_URL}/project-team-03/#/verify`;

  //console.log(clientURL);

  const emailData = {
    to: [email],
    sender: 'Off Campus Housing <ooseoffcampushousing@outlook.com>',
    subject: 'Verification Token',
    text_body: `Your verification token is: ${token}. Please follow the link: ${clientURL}. If that link doesn't work, then add /verify to the home page of the site. For example: http://localhost:5173/project-team-03/#/verify`,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: apiKey,
        ...emailData,
      }),
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(`Error: ${response.status} - ${errorResponse.message}`);
    }

    // const responseData = await response.json();
    // console.log("Email sent successfully:", responseData);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
