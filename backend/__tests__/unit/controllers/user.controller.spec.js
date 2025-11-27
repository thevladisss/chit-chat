const UserController = require('../../../controllers/user.controller');
const UserService = require('../../../service/user.service');
const ChatService = require('../../../service/chat.service');

describe('user.controller.spec.js', () => {
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
          }),
        };

        const checkUserExistsSpy = jest
          .spyOn(UserService, 'checkUserExists')
          .mockResolvedValue(false);

        const signUpUserSpy = jest
          .spyOn(UserService, 'signUpUser')
          .mockResolvedValue(mockUser);

        jest
          .spyOn(ChatService, 'createNewChatForAllUsers')
          .mockResolvedValue([]);

        const request = {
          body: {
            username: 'testuser',
          },
          session: {},
        };

        const response = {
          json: jest.fn().mockReturnThis(),
          status: jest.fn().mockReturnThis(),
        };

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
          }),
        };

        const checkUserExistsSpy = jest
          .spyOn(UserService, 'checkUserExists')
          .mockResolvedValue(true);

        const signUpUserSpy = jest
          .spyOn(UserService, 'signUpUser')
          .mockResolvedValue(mockUser);

        const createNewChatForAllUsersSpy = jest
          .spyOn(ChatService, 'createNewChatForAllUsers')
          .mockResolvedValue([]);

        const request = {
          body: {
            username: 'testuser',
          },
          session: {},
        };

        const response = {
          json: jest.fn().mockReturnThis(),
          status: jest.fn().mockReturnThis(),
        };

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
          }),
        };

        jest.spyOn(UserService, 'checkUserExists').mockResolvedValue(false);

        jest.spyOn(UserService, 'signUpUser').mockResolvedValue(mockUser);

        jest
          .spyOn(ChatService, 'createNewChatForAllUsers')
          .mockResolvedValue([]);

        const request = {
          body: {
            username: 'testuser',
          },
          session: {},
        };

        const response = {
          json: jest.fn().mockReturnThis(),
          status: jest.fn().mockReturnThis(),
        };

        await UserController.createUser(request, response);

        expect(request.session.user).toEqual({
          userId: 'user123',
          username: 'testuser',
        });
      });

      it('should set user session if user exists', async () => {
        const mockUser = {
          _id: 'user123',
          username: 'testuser',
          toJSON: jest.fn().mockReturnValue({
            userId: 'user123',
            username: 'testuser',
          }),
        };

        jest.spyOn(UserService, 'checkUserExists').mockResolvedValue(true);

        jest.spyOn(UserService, 'signUpUser').mockResolvedValue(mockUser);

        jest
          .spyOn(ChatService, 'createNewChatForAllUsers')
          .mockResolvedValue([]);

        const request = {
          body: {
            username: 'testuser',
          },
          session: {},
        };

        const response = {
          json: jest.fn().mockReturnThis(),
          status: jest.fn().mockReturnThis(),
        };

        await UserController.createUser(request, response);

        expect(request.session.user).toEqual({
          userId: 'user123',
          username: 'testuser',
        });
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
          body: {
            username: 'testuser',
          },
          session: {},
        };

        const response = {
          json: jest.fn().mockReturnThis(),
          status: jest.fn().mockReturnThis(),
        };

        await expect(
          UserController.createUser(request, response),
        ).rejects.toThrow();

        expect(signUpUserSpy).toHaveBeenCalledWith('testuser');
        expect(request.session.user).toBeUndefined();
        expect(createNewChatForAllUsersSpy).not.toHaveBeenCalled();
      });

      it('should return user in response', async () => {
        const mockUser = {
          _id: 'user123',
          username: 'testuser',
          toJSON: jest.fn().mockReturnValue({
            userId: 'user123',
            userId: 'user123',
            username: 'testuser',
          }),
        };

        jest.spyOn(UserService, 'checkUserExists').mockResolvedValue(false);

        jest.spyOn(UserService, 'signUpUser').mockResolvedValue(mockUser);

        jest
          .spyOn(ChatService, 'createNewChatForAllUsers')
          .mockResolvedValue([]);

        const request = {
          body: {
            username: 'testuser',
          },
          session: {},
        };

        const response = {
          json: jest.fn().mockReturnThis(),
          status: jest.fn().mockReturnThis(),
        };

        await UserController.createUser(request, response);

        expect(response.json).toHaveBeenCalledWith({
          data: {
            userId: 'user123',
            username: 'testuser',
          },
        });
        expect(response.status).toHaveBeenCalledWith(200);
      });
    });
  });
});
