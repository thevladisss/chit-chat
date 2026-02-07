import type { IUser } from '../models/user.model';
import type { UserResponse } from '../types/responses';

/**
 * Maps a user document to the API response shape.
 */
export const mapUserToResponse = (user: IUser): UserResponse => {
  return user.toJSON() as UserResponse;
};

export default {
  mapUserToResponse,
};
