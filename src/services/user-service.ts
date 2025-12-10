import bcrypt from 'bcrypt';
import { prismaClient } from '../utils/database-util';
import { validation } from '../validations/validation';
import { UserValidation } from '../validations/user-validation';
import {
  RegisteredUserRequest,
  LoginUserRequest,
  toUserResponse,
} from '../models/user-model';
import { ResponseError } from '../error/response-error';

export class UserService {
  static async register(request: RegisteredUserRequest) {
    const validateData = validation.validate(UserValidation.REGISTER, request);

    const existing = await prismaClient.user.findFirst({
      where: { email: validateData.email },
    });

    if (existing) {
      throw new ResponseError(400, 'Email already exists');
    }

    const hashedPassword = await bcrypt.hash(validateData.password, 10);

    const user = await prismaClient.user.create({
      data: {
        username: validateData.username,
        email: validateData.email,
        passwordHash: hashedPassword,
      },
    });

  return toUserResponse(user.id, user.username, user.email);
  }

  static async login(request: LoginUserRequest) {
    const validateData = validation.validate(UserValidation.LOGIN, request);

    const user = await prismaClient.user.findFirst({
      where: { email: validateData.email },
    });

    if (!user) {
      throw new ResponseError(400, 'Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(validateData.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new ResponseError(400, 'Invalid email or password');
    }

    return toUserResponse(user.id, user.username, user.email);
  }
}
