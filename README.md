# ! NestJS 🔥

**The best way to develop high-quality and reliable scalable APIs—with proper documentation and testing using NestJS and modern technologies like Prisma, TypeORM, Passport, JWT, Pactum, and more.**

> _Note:_ These bookmarks are only meant for testing purposes, and you can easily change this part to the desired features at any time you wish.

### [Prisma Example Reference ](https://github.com/Subham-Maity/prisma-the-ultimate-resource/blob/main/prisma/schema.prisma)

```markdown
📂 package
    ├───v1.0.0 [focus: basic structure, passport auth,basic dto, db setup,testing environment]
    │   ├───app - the main application
    │   └───documentation
    ├───v1.0.1 [focus: refresh token, access token]
    │   ├───app - the main application
    │   └───documentation
``` 
-------

-------
### 📚 GUIDE TOC:

#### 📌 [Version 1.0.0](package/v1.0.0/documentation/README.md)
- 1. Basic Understanding and Setup
    - 1.1 Let's make a module
        - 1. Create a Basic Module
        - 2. Define the Module
        - 3. Use the Module
        - 4. Create More Modules
        - 5. Create a `bookmarks` Module
        - 6. Final Structure
    - 1.2 Let's make a basic controller and service
        - 1. Create the Controller and Service files
        - 2. Define the Controller
        - 3. Define the Service
        - 4. Register the Controller and Service in the Module
        - 5. Inject the Service into the Controller
        - 6. Use the Service's methods in the Controller
- 2. Setting Up the Auth Controller
    - 2.1 Creating Basic Endpoints
- 3. Setting up DB with docker(Prisma)
- 4. Setting up TypeORM with NestJS (Prisma)
- 5. Understanding DTOs and Class-Validator in NestJS
    - 5.1 Installing Class-Validator
    - 5.2 Creating and Validating DTOs
    - 5.3 Using DTOs in Controllers
    - 5.4 Global Validation Pipe
- 6. Implementing Signup Logic with Argon2 and Prisma
    - 6.1 Installing Argon2
    - 6.2 Basic Signup Logic
    - 6.3 Handling Unique Email Validation
    - 6.4 Handling Errors
    - 6.5 Creating a Custom Exception Filter
- 7. Implementing Login Logic
- 8. Automate postgres restart & prisma migrations
- 9. NestJs config module
- 10. Passport & JWT module setup
    - 10.1 Basic Setup of Passport & JWT
    - 10.2 Let's setup strategy
- 11. NestGuard
    - 11.1 Protecting Routes with Guards
    - 11.2 Providers
    - 11.3 Return User Payload
    - 11.4 JWT Guard
- 12. Custom Param Decorator
    - 12.1 Creating a GetUser Decorator
    - 12.2 Http Decorator
- 13. E2E Testing
- 14. Setting Up Test Database
- 15. Dotenv for Development and Testing
- 16. Database Tear Down
    - 16.1 Cleaning the Database
    - 16.2 Database Tear Down in E2E Tests
    - 16.3 Create the test
- 17. Auth E2E Testing with Pactum
    - 17.1 Signup test
    - 17.2 Signin test
    - 17.3 Error handling
    - 17.4 Multiple Error handling
    - 17.5 Storing the token
- 18. User E2E Testing with Pactum
    - 18.1 Get User with Bearer Token
    - 18.2 Edit User with Bearer Token
        - 18.2.1 DTO for Edit User
        - 18.2.2 Service for Edit User
        - 18.2.3 Controller for Edit User
        - 18.2.4 Pactum Test for Edit User
> **⭐ Let's Revise the concepts and implement bookmarks [CRUD]**
- 19. Bookmarks Crud with Testing E2E

### 📚 GUIDE TOC:

#### 📌 [Version 1.0.1](package/v1.0.1/documentation/README.md)

- 1. MongoDB Setup
- 2. Auth Controller
- 3. Auth DTO
- 4. Auth Service
    - 4.1 `signupLocal`
    - 4.2 `signinLocal`
    - 4.3 `signoutLocal`
    - 4.4 `refreshToken`
- 5. Hashing Passwords with Argon2
- 6. Token Service
- 7. RtTokenService
- 8. AT & RT Strategy
    - 8.1 `AtStrategy (Access Token Strategy)`
    - 8.2 `RtStrategy (Refresh Token Strategy)`
- 9. AT & RT Guard
    - 9.1 `at.guard.ts`
    - 9.2 `rt.guard.ts`
- 10. Decorator
    - 10.1 public.decorator.ts
    - 10.2 get-current-user.decorator.ts
    - 10.3 get-current-user-id.decorator.ts
- 11. Auth Module
