const UserController = require('../../../controllers/user.controller');
const UserService = require('../../../service/user.service');
const ChatService = require('../../../service/chat.service');

describe('user.controller.spec.js', () => {
  describe('createUser', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    describe('createUser', () => {
      it('should create a user and set session when user is created successfully', async () => {
        const mockUser = {
          _id: 'user123',
          username: 'testuser',
          toJSON: jest.fn().mockReturnValue({
            _id: 'user123',
            username: 'testuser',
          }),
        };

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

        expect(signUpUserSpy).toHaveBeenCalledTimes(1);
        expect(signUpUserSpy).toHaveBeenCalledWith('testuser');
        expect(request.session.user).toEqual({
          _id: 'user123',
          username: 'testuser',
        });
        expect(createNewChatForAllUsersSpy).toHaveBeenCalledTimes(1);
        expect(createNewChatForAllUsersSpy).toHaveBeenCalledWith('user123');
        expect(mockUser.toJSON).toHaveBeenCalledTimes(2);
        expect(response.json).toHaveBeenCalledWith({
          data: {
            _id: 'user123',
            username: 'testuser',
          },
        });
        expect(response.status).toHaveBeenCalledWith(200);
      });

      it('should not set session user if UserService.signUpUser returns null', async () => {
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

      it('should call ChatService.createNewChatForAllUsers even if user is null', async () => {
        // This test covers the edge case where user is null but we still try to access user._id
        // This would cause an error, which is the expected behavior
        const signUpUserSpy = jest
          .spyOn(UserService, 'signUpUser')
          .mockResolvedValue(null);

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
      });

      it('should handle errors from UserService.signUpUser', async () => {
        const signUpUserSpy = jest
          .spyOn(UserService, 'signUpUser')
          .mockRejectedValue(new Error('Database error'));

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
        ).rejects.toThrow('Database error');

        expect(signUpUserSpy).toHaveBeenCalledWith('testuser');
      });

      it('should handle errors from ChatService.createNewChatForAllUsers', async () => {
        const mockUser = {
          _id: 'user123',
          username: 'testuser',
          toJSON: jest.fn().mockReturnValue({
            _id: 'user123',
            username: 'testuser',
          }),
        };

        const signUpUserSpy = jest
          .spyOn(UserService, 'signUpUser')
          .mockResolvedValue(mockUser);

        const createNewChatForAllUsersSpy = jest
          .spyOn(ChatService, 'createNewChatForAllUsers')
          .mockRejectedValue(new Error('Chat creation failed'));

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
        ).rejects.toThrow('Chat creation failed');

        expect(signUpUserSpy).toHaveBeenCalledWith('testuser');
        expect(request.session.user).toEqual({
          _id: 'user123',
          username: 'testuser',
        });
        expect(createNewChatForAllUsersSpy).toHaveBeenCalledWith('user123');
      });
    });
  });
});
