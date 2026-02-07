import * as UserController from '../../../src/controllers/user.controller';
import UserService from '../../../src/service/user.service';
import ChatService from '../../../src/service/chat.service';
import { mapUserToResponse } from '../../../src/mappers/user.mapper';
import { Request, Response } from 'express';

describe('user.controller.spec.ts', () => {
  describe('createUser', () => {
    beforeEach(() => {
      jest.restoreAllMocks();
    });

    describe('createUser', () => {
      it('should create a user if user does not exist', async () => {
        const mockUser = {
          _id: 'user123',
          username: 'testuser',
          toJSON: jest.fn().mockReturnValue({
            userId: 'user123',
            username: 'testuser',
            id: 'user123',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }),
        };

        const user = mapUserToResponse(mockUser as any);

        const checkUserExistsSpy = jest
          .spyOn(UserService, 'checkUserExists')
          .mockResolvedValue(false);

        const signUpUserSpy = jest
          .spyOn(UserService, 'signUpUser')
          .mockResolvedValue(user);

        jest
          .spyOn(ChatService, 'createNewChatForAllUsers')
          .mockResolvedValue([]);

        const request = {
          body: { username: 'testuser' },
          session: {} as any,
        } as Request;

        const response = {
          json: jest.fn().mockReturnThis(),
          status: jest.fn().mockReturnThis(),
        } as unknown as Response;

        await UserController.createUser(request, response);

        expect(checkUserExistsSpy).toHaveBeenCalledTimes(1);
        expect(signUpUserSpy).toHaveBeenCalledTimes(1);
        expect(signUpUserSpy).toHaveBeenCalledWith(request.body.username);
      });

      it('should not create a user if user exists', async () => {
        const mockUser = {
          _id: 'user123',
          username: 'testuser',
          toJSON: jest.fn().mockReturnValue({
            userId: 'user123',
            username: 'testuser',
            id: 'user123',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }),
        };

        const user = mapUserToResponse(mockUser as any);

        const checkUserExistsSpy = jest
          .spyOn(UserService, 'checkUserExists')
          .mockResolvedValue(true);

        const signUpUserSpy = jest
          .spyOn(UserService, 'signUpUser')
          .mockResolvedValue(user);

        const createNewChatForAllUsersSpy = jest
          .spyOn(ChatService, 'createNewChatForAllUsers')
          .mockResolvedValue([]);

        const request = {
          body: { username: 'testuser' },
          session: {} as any,
        } as Request;

        const response = {
          json: jest.fn().mockReturnThis(),
          status: jest.fn().mockReturnThis(),
        } as unknown as Response;

        await UserController.createUser(request, response);

        expect(checkUserExistsSpy).toHaveBeenCalledTimes(1);
        expect(checkUserExistsSpy).toHaveBeenCalledWith('testuser');
        expect(signUpUserSpy).toHaveBeenCalledTimes(1);
        expect(signUpUserSpy).toHaveBeenCalledWith('testuser');
        expect(createNewChatForAllUsersSpy).not.toHaveBeenCalled();
      });

      it('should set user session if user does not exist', async () => {
        const mockUser = {
          _id: 'user123',
          username: 'testuser',
          toJSON: jest.fn().mockReturnValue({
            userId: 'user123',
            username: 'testuser',
            id: 'user123',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }),
        };

        const user = mapUserToResponse(mockUser as any);

        jest.spyOn(UserService, 'checkUserExists').mockResolvedValue(false);
        jest.spyOn(UserService, 'signUpUser').mockResolvedValue(user);
        jest
          .spyOn(ChatService, 'createNewChatForAllUsers')
          .mockResolvedValue([]);

        const request = {
          body: { username: 'testuser' },
          session: {} as any,
        } as Request;

        const response = {
          json: jest.fn().mockReturnThis(),
          status: jest.fn().mockReturnThis(),
        } as unknown as Response;

        await UserController.createUser(request, response);

        expect(request.session.userId).toBe(user.id);
      });

      it('should set user session if user exists', async () => {
        const mockUser = {
          _id: 'user123',
          username: 'testuser',
          toJSON: jest.fn().mockReturnValue({
            userId: 'user123',
            username: 'testuser',
            id: 'user123',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }),
        };

        const user = mapUserToResponse(mockUser as any);

        jest.spyOn(UserService, 'checkUserExists').mockResolvedValue(true);
        jest.spyOn(UserService, 'signUpUser').mockResolvedValue(user);
        jest
          .spyOn(ChatService, 'createNewChatForAllUsers')
          .mockResolvedValue([]);

        const request = {
          body: { username: 'testuser' },
          session: {} as any,
        } as Request;

        const response = {
          json: jest.fn().mockReturnThis(),
          status: jest.fn().mockReturnThis(),
        } as unknown as Response;

        await UserController.createUser(request, response);

        expect(request.session.userId).toEqual(user.id);
      });

      it('should not set session user if UserService.signUpUser returns null', async () => {
        jest.spyOn(UserService, 'checkUserExists').mockResolvedValue(false);
        const signUpUserSpy = jest
          .spyOn(UserService, 'signUpUser')
          .mockResolvedValue(null);

        const createNewChatForAllUsersSpy = jest
          .spyOn(ChatService, 'createNewChatForAllUsers')
          .mockResolvedValue([]);

        const request = {
          body: { username: 'testuser' },
          session: {} as any,
        } as Request;

        const response = {
          json: jest.fn().mockReturnThis(),
          status: jest.fn().mockReturnThis(),
        } as unknown as Response;

        await expect(
          UserController.createUser(request, response),
        ).rejects.toThrow();

        expect(signUpUserSpy).toHaveBeenCalledWith('testuser');
        expect(request.session.userId).toBeUndefined();
        expect(createNewChatForAllUsersSpy).not.toHaveBeenCalled();
      });

      it('should return user in response', async () => {
        const mockUser = {
          _id: 'user123',
          username: 'testuser',
          toJSON: jest.fn().mockReturnValue({
            userId: 'user123',
            id: 'user123',
            username: 'testuser',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }),
        };

        const user = mapUserToResponse(mockUser as any);

        jest.spyOn(UserService, 'checkUserExists').mockResolvedValue(false);
        jest.spyOn(UserService, 'signUpUser').mockResolvedValue(user);
        jest
          .spyOn(ChatService, 'createNewChatForAllUsers')
          .mockResolvedValue([]);

        const request = {
          body: { username: 'testuser' },
          session: {} as any,
        } as Request;

        const response = {
          json: jest.fn().mockReturnThis(),
          status: jest.fn().mockReturnThis(),
        } as unknown as Response;

        await UserController.createUser(request, response);

        expect(response.json).toHaveBeenCalledWith({ data: user });
        expect(response.status).toHaveBeenCalledWith(200);
      });
    });
  });
});
