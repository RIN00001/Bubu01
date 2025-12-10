import { generateToken } from "../utils/jwt-util";

export interface UserJWTPayload {
  Id: string;
  username: string;
  email: string;
}

export interface RegisteredUserRequest {
  username: string;
  email: string;
  password: string;
}
export interface LoginUserRequest {
  email: string;
  password: string;
}

export interface UserResponse {
 token?: string;
}

export function toUserResponse(
  id: string,
  username: string,
  email: string
): UserResponse{
  return {
    token: generateToken({
      Id: id,
      username: username,
      email: email,
  }, '1h'

),
  
  }
}