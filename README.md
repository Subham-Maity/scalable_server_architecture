# NestJS 🔥

**Develop high-quality, reliable, and scalable APIs with NestJS.** This guide uses modern technologies like Prisma, TypeORM, Passport, JWT, Pactum, and more. It provides proper documentation and testing methods for each version of the application.

> _Note:_ Each version of the application is implemented separately, allowing you to understand the changes and new features added in each version.

```markdown
📂 example
│   └───microservices
│           └───ordering-app
📂 package
    ├───v1.0.0 
    │   ├───app 
    │   └───documentation
    ├───v1.0.1
    │   ├───app 
    │   └───documentation
    ├───v1.0.2 
    │   ├───app 
    │   └───documentation
    ├───v1.0.3
        ├───app
        └───documentation
More versions to come.....
``` 
> The `app` directory contains the main application codebase, while the `documentation` directory provides a comprehensive guide to the application.
> #### [Prisma Example Reference](https://github.com/Subham-Maity/prisma-the-ultimate-resource/blob/main/prisma/schema.prisma)

### 📚 Guide Table of Contents:

-  📌 [Version 1.0.0](package/v1.0.0/documentation/README.md) - `Focus`: Basic structure, Passport authentication, basic DTO, database setup, testing environment
-  📌 [Version 1.0.1](package/v1.0.1/documentation/README.md) - `Focus`: Refresh token, access token, testing with Pactum
-  📌 [Version 1.0.2](package/v1.0.2/documentation/README.md) - `Focus`: Swagger setup, Swagger configuration
-  📌 [Version 1.0.3](package/v1.0.3/documentation/README.md) - `Focus`: Sending tokens using cookies
-  📌 [Version 1.0.4](package/v1.0.4/documentation/README.md) - `Focus`: Setting tokens to headers automatically using cookies, user checking, logger
-  📌 [Version 1.0.5](package/v1.0.5/documentation/README.md) - `Focus`: Resetting password using JWT reset password link with OTP verification, generating refresh token without access token
-  📌 [Version 1.0.6](package/v1.0.6/documentation/README.md) - `Focus`: Emailing with Nodemailer, OAuth Gmail, BullMq, DLQ
-  📌 [Version 1.0.7](package/v1.0.7/documentation/README.md) - `Focus`: Registering user using link, changing password, user control, filter search, pagination, sorting (Get All users)—using types, using DTO
-  📌 [Version 1.0.8](package/v1.0.8/documentation/README.md) - `Focus`: Redis setup with testing and using in auth OTP + user gets, rate limit, helmet setup, token blacklist, error handling and auth documentation, rtTokenHash Db to Redis for scalability
