import { GraphQLError } from 'graphql';

export class UserInputError extends GraphQLError {
  constructor(message: string) {
    super(message, {
      extensions: {
        code: 'USER_INPUT_ERROR',
      },
    });
  }
}

export class AuthorizationError extends GraphQLError {
    constructor(message: string = 'Not authorized') {
      super(message, {
        extensions: {
          code: 'AUTHORIZATION_ERROR',
        },
      });
    }
  }