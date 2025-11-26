# Project TODO List

## Features 

- [ ] Unread messages: shows count of unread messages in chat in sidebar. Logic to mark messages as read in opened chat
- [ ] Implement voice messages functionality

## Architecture

- [ ] Use redux selectors directly intead of custom hooks (useChatStore)
- [ ] Update logic for showing "typing"

## Acessibility 

- [ ] Enforce components are accessible

## UI Improvements

- [ ] Add skeletons loading indicators for chat list search in sidebar 

- [ ] Security
  - [ ] Implement proper authentication flow
  - [ ] Add CSRF protection
  - [ ] Secure API requests
  - [ ] Implement proper error handling
  - [ ] Add input validation

## Code Quality

- [ ] Testing
  - [ ] Add unit tests for components
  - [ ] Add integration tests
  - [ ] Set up testing library
  - [ ] Achieve 80% code coverage
  - [ ] Add end-to-end tests

## Technical Debt

- [ ] Code Refactoring
  - [ ] Refactor components to use custom hooks
  - [ ] Improve state management
  - [ ] Fix TODO comments in the codebase
  - [ ] Group CSS files as mentioned in App.tsx

## Documentation

- [ ] Component Documentation
  - [ ] Add JSDoc comments to all components
  - [ ] Create Storybook for UI components
  - [ ] Document state management flow
  - [ ] Add README for each major feature

## Performance

- [ ] Optimization
  - [ ] Implement code splitting
  - [ ] Optimize bundle size
  - [ ] Add lazy loading for components
  - [ ] Implement memoization where needed

## DevOps

- [ ] Build Process
  - [ ] Set up CI/CD pipeline
  - [ ] Configure production build
  - [ ] Add environment-specific configurations
  - [ ] Set up monitoring and error tracking

