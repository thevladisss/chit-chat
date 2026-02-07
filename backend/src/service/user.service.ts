import UserRepository from '../repositories/user.repository';
import { mapUserToResponse } from '../mappers/user.mapper';

export const signUpUser = async (username: string): Promise<any> => {
  const user = await UserRepository.createOrFindFirstUser(username);

  return mapUserToResponse(user);
};

export const checkUserExists = (username: string): Promise<boolean> => {
  return UserRepository.existsByUsername(username);
};

export default {
  signUpUser,
  checkUserExists,
};
