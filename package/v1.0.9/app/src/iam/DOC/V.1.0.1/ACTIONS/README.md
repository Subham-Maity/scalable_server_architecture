##  IAM Actions
### 1. Authentication
#### **1.1 User Registration Process**
- **Key Functions**: The core functions involved in this process are `signupLocal` and `activateUser`.
- **Mail Queue**: It's important to ensure that the mail queue is functioning correctly for the verification emails to be sent out successfully.
- **Implementation Logic**
    1. User signs up with email and password.
    2. Password is encrypted.
    3. A token is generated and embedded in a verification link.
    4. Verification link is sent to the user's email.
    5. User clicks on the link to verify their account.
    6. If the token is valid and the email doesn't exist in the database, the user is activated.
    7. A welcome email is sent to the user.
    8. User is redirected to the login page.
#### **1.2. User Signin Process**
- **Key Functions**: The core functions involved in this process are `checkIfUserDeletedByEmail` and `signinLocal`.
- **Token Management**: The `TokenService` and `RtTokenService` are used for handling access and refresh tokens.
- **Geo Logging**: The `GeoService` and `queueService` are used for logging the user's geographical location and actions.
- **Implementation Logic**
    1. User signs in with email and password.
    2. The system checks if a user with the provided email exists and is not marked as deleted.
    3. The system verifies if the provided password matches the hashed password stored in the database.
    4. If the password matches, the system generates access and refresh tokens for the user.
    5. The refresh token hash is updated in the database(redis).
    6. The user's geographical location and action are logged.
    7. The access and refresh tokens are set in cookies.
    8. The user is now signed in and can access protected resources.

#### **1.3 User Signout Process**
- **Key Functions**: The core functions involved in this process are `signoutLocal`.
- **Token Management**: The `RedisService` is used for handling refresh tokens.
- **Geo Logging**: The `GeoService` and `queueService` are used for logging the user's geographical location and actions.
- **Implementation Logic**
    1. User initiates the signout process.
    2. The system deletes the refresh token associated with the user from the Redis database.
    3. The user's geographical location and action are logged.
    4. The access and refresh tokens are cleared from cookies.
    5. The user is now signed out and can't access protected resources until they sign in again.

#### **1.4 User Token Management Process**
- **Key Functions**: The core functions involved in this process are `getUserById`, `refreshToken`, `blacklistRefreshTokens`, and `blacklistAllRefreshTokens`.
- **Token Management**: The `TokenService` and `RedisService` are used for handling access and refresh tokens.
- **Implementation Logic**
    1. **Token Refresh**: When a user's access token expires, they can use their refresh token to get a new access token.
        - The system checks if the user ID and refresh token are provided.
        - The system retrieves the stored refresh token hash from Redis and verifies it against the provided refresh token.
        - If the refresh token matches, the system generates new access and refresh tokens for the user.
        - The new refresh token hash is stored in Redis.
        - The new access and refresh tokens are set in cookies.
    2. **Token Blacklisting**: The system provides two ways to blacklist refresh tokens:
        - **Multiple Users**: The system can blacklist refresh tokens for multiple users based on their emails. It finds the users with the provided emails, deletes their refresh token hashes from Redis, and throws an error if any of the emails are not found in the database.
        - **All Users**: The system can blacklist all refresh tokens by resetting the Redis database.

#### **1.5 User Password Management Process**
- **Key Functions**: The core functions involved in this process are `checkIfUserDeletedByUserId`, `generateResetPasswordRequestToken`, `generateResetPasswordVerificationLink`, `returnPasswordResetLinkWithOtp`, `resetPasswordRequest`, `verifyOTP`, `validateToken`, `localVariables`, `resetPassword`, and `changePassword`.
- **Password Reset Flow**:
    1. **Password Reset Request**:
        - The user requests a password reset by providing their email address.
        - The system generates a password reset verification link containing a JWT token and an OTP.
        - The OTP is generated using the `generateOTP` function and stored in Redis with a key that includes the user's email and a prefix (`auth_otp_key_prefix_for_redis`). The OTP is stored with a TTL defined by `auth_otp_ttl_for_redis`.
        - The verification link and the OTP are sent to the user's email.
    2. **Password Reset Verification**:
        - The user clicks on the password reset link, which contains the JWT token and the OTP.
        - The system verifies the JWT token using the `validateToken` function and retrieves the user's email and ID from the payload.
        - The system then retrieves the stored OTP from Redis using the user's email and the prefix (`auth_otp_key_prefix_for_redis`).
        - If the provided OTP matches the stored OTP, the system sets the `resetSession` flag to `true`.
        - If the OTP verification is successful, the system responds with a success message, the user's email, and the token.
        - If an error occurs during the OTP verification, the system deletes the stored OTP from Redis.
    3. **Password Reset**:
        - After the OTP verification, the user provides a new password.
        - The system validates the token using the `validateToken` function and checks if the `resetSession` flag is set to `true`.
        - If the session is valid, the system updates the user's password in the database using the `PasswordHash.hashData` function.
        - The system then clears the `OTP` and `resetSession` variables using the `localVariables` function.
        - A password changed notification email is sent to the user using the `bullService.addMailJob` function.
- **Password Change Flow**:
    1. **Password Change Request**:
        - The user provides their current password and a new password.
        - The system checks if the user's account is not deleted using the `checkIfUserDeletedByUserId` function.
        - The system verifies the current password using the `PasswordHash.verifyPassword` function.
        - If the current password is correct, the system updates the user's password in the database using the `PasswordHash.hashData` function.
        - A password changed notification email is sent to the user using the `bullService.addMailJob` function.
#### **1.6 User Authentication Check Process**
- **Key Function**: The core function involved in this process is `checkUser`.
- **Implementation Logic**
    1. The system receives a request from a user.
    2. The `checkUser` function is called with the request as a parameter.
    3. The function checks if the request has a user object and if the user object has a `sub` property (which usually represents the user's ID).
    4. If the user object or the `sub` property is not present, the function throws an `UnauthorizedException`, indicating that the user is not authenticated.
    5. If the user object and the `sub` property are present, the function returns an object with the user's ID.

### 2. Ability
#### **2.1 Permission Process**
- **Key Functions**: The core functions involved in this process are `createPermission`, `getPermissions`, `getPermissionById`, `getPermissionsByNames`, `updatePermissionById`, and `deletePermissionById`.
- **Caching with Redis**: The `PermissionsService` uses Redis to cache the permissions data, improving the performance and reducing the load on the database.
    - The caching is implemented for the `getPermissions`, `getPermissionById`, and `getPermissionsByNames` methods.
    - When a permission is created, updated, or deleted, the cached data is cleared to ensure the latest information is retrieved.
- **Implementation Logic**:
    1. **Create Permission**:
        - The user provides a name and an action for the new permission.
        - The system checks if the name and action are provided.
        - The system creates a new permission in the database.
        - The cache for all permissions is cleared to ensure the latest data is retrieved.
    2. **Get Permissions**:
        - The user can retrieve a list of permissions with optional filtering, sorting, and pagination.
        - The system first checks the Redis cache for the cached permissions data based on the provided parameters.
        - If the cache is not available, the system retrieves the permissions from the database, applies the requested filters, sorting, and pagination, and caches the result in Redis.
    3. **Get Permission by ID**:
        - The user provides the ID of the permission they want to retrieve.
        - The system first checks the Redis cache for the cached permission data.
        - If the cache is not available, the system retrieves the permission from the database and caches the result in Redis.
    4. **Get Permissions by Names**:
        - The user provides a list of permission names they want to retrieve.
        - The system first checks the Redis cache for the cached permissions data based on the provided names.
        - If the cache is not available, the system retrieves the permissions from the database and caches the result in Redis.
    5. **Update Permission**:
        - The user provides the ID of the permission they want to update and the new name and action.
        - The system checks if the name and action are provided.
        - The system updates the permission in the database.
        - The cache for the specific permission and all permissions is cleared to ensure the latest data is retrieved.
    6. **Delete Permission**:
        - The user provides the ID of the permission they want to delete.
        - The system deletes the permission from the database.
        - The cache for the specific permission and all permissions is cleared to ensure the latest data is retrieved.

#### **2.2 Role Management Process**
- **Key Functions**: The core functions involved in this process are `createRole`, `getRoles`, `getRoleById`, `updateRoleName`, and `deleteRole`.
- **Caching with Redis**: The `RolesService` uses Redis to cache the roles data, improving the performance and reducing the load on the database.
    - The caching is implemented for the `getRoles` and `getRoleById` methods.
    - When a role is created, updated, or deleted, the cached data is cleared to ensure the latest information is retrieved.
- **Implementation Logic**:
    1. **Create Role**:
        - The user provides a name and an optional description for the new role.
        - The system checks if the name is provided.
        - The system creates a new role in the database.
        - The cache for all roles is cleared to ensure the latest data is retrieved.
    2. **Get Roles**:
        - The user can retrieve a list of roles with optional filtering, sorting, and pagination.
        - The system first checks the Redis cache for the cached roles data based on the provided parameters.
        - If the cache is not available, the system retrieves the roles from the database, applies the requested filters, sorting, and pagination, and caches the result in Redis.
    3. **Get Role by ID**:
        - The user provides the ID of the role they want to retrieve.
        - The system first checks the Redis cache for the cached role data.
        - If the cache is not available, the system retrieves the role from the database, including its associated permissions, and caches the result in Redis.
    4. **Update Role Name**:
        - The user provides the ID of the role they want to update and the new name and description.
        - The system checks if the ID and name are provided.
        - The system updates the role in the database.
        - The cache for all roles is cleared to ensure the latest data is retrieved.
    5. **Delete Role**:
        - The user provides the ID of the role they want to delete.
        - The system deletes the role and its associated permissions from the database.
        - The cache for all roles is cleared to ensure the latest data is retrieved.
          Sure, here's the section for **2.3 Role-Permission Mapping Process** following the same pattern:
    6. **Create Admin Role**:
      - This function is used by the Super Admin to create the initial Admin role if it doesn't already exist.
      - The system checks if the Admin role already exists in the database.
      - If the Admin role doesn't exist, the system creates a new role with the name "Admin" and the description "Can do everything".
      — The cache for all roles is cleared to ensure the latest data is retrieved.
#### **2.3 Role-Permission Mapping Process**
- **Key Functions**: The core functions involved in this process are `assignPermissionsToRole`, `updatePermissionsForRole`, and `removePermissionsFromRole`.
- **Implementation Logic**:
    1. **Assign Permissions to Role**:
        - The user provides a role ID and a list of permission IDs.
        - The system checks if the role ID and at least one permission ID are provided.
        - The system creates a mapping between the role and the permissions in the database.
        - If any of the provided permissions are not found, the system throws a `NotFoundException`.
    2. **Update Permissions for Role**:
        - The user provides a role ID and a list of permission IDs.
        - The system checks if the role ID and at least one permission ID are provided.
        - The system first retrieves the existing permissions associated with the role.
        - The system then updates the permissions by:
            - Deleting the existing permissions that are not in the provided list.
            - Creating new mappings for the permissions in the provided list.
        - If any of the provided permissions are not found, the system throws a `NotFoundException`.
    3. **Remove Permissions from Role**:
        - The user provides a role ID and a list of permission IDs.
        - The system checks if the role ID and at least one permission ID are provided.
        - The system first retrieves the permissions to ensure they exist.
        - The system then removes the mappings between the role and the provided permissions in the database.
        - If any of the provided permissions are not found, the system throws a `NotFoundException`.

#### **2.4 User-Role Management Process**
- **Key Functions**: The core functions involved in this process are `setAdminRole` and `assignRoleToUser`.
- **Implementation Logic**:
    1. **Set Admin Role**:
        - The user provides the email of the user they want to set as an admin.
        - The system checks if a user with the provided email exists.
        - The system retrieves the admin role, which is assumed to have all permissions.
        - The system updates the user's role to the admin role.
    2. **Assign Role to User**:
        - The user provides the user's ID and the role ID they want to assign to the user.
        - The system checks if a user with the provided ID exists.
        - The system checks if a role with the provided ID exists.
        - The system updates the user's role to the specified role.

### 3. User
#### **3.1 Edit User Process**
- **Key Function**: The core function involved in this process is `editUser`.
- **Caching with Redis**: The `editUser` function clears the cache for the user after updating their information.
- **Implementation Logic**:
    1. The system checks if a user with the provided ID exists.
    2. If the user exists, the system updates the user's information in the database using the provided data.
    3. The system then deletes the cached user data from Redis to ensure the latest information is retrieved.
    4. The updated user information is returned.

#### **3.2 Get User by ID Process**
- **Key Function**: The core function involved in this process is `getUserById`.
- **Caching with Redis**: The `getUserById` function first checks the Redis cache for the user data. If the data is not found in the cache, it retrieves the user from the database, sanitizes the data, and stores it in the Redis cache.
- **Implementation Logic**:
    1. The system checks the Redis cache for the user data using the user ID as the key.
    2. If the user data is found in the cache, it is returned.
    3. If the user data is not found in the cache, the system retrieves the user from the database using the provided ID.
    4. If the user is not found in the database, the system throws a `NotFoundException`.
    5. The retrieved user data is sanitized by removing the `hash` field and stored in the Redis cache.
    6. The sanitized user data is returned.

#### **3.3 Get All Users Process**
- **Key Function**: The core function involved in this process is `getAllUsers`.
- **Caching with Redis**: The `getAllUsers` function first checks the Redis cache for the user data based on the provided query parameters. If the data is not found in the cache, it retrieves the users from the database, sanitizes the data, and stores it in the Redis cache.
- **Implementation Logic**:
    1. The system checks the Redis cache for the user data using a cache key generated from the provided query parameters.
    2. If the user data is found in the cache, it is returned.
    3. If the user data is not found in the cache, the system retrieves the users from the database using the provided query parameters for pagination, sorting, searching, and filtering.
    4. If no users are found, the system throws a `NotFoundException`.
    5. The retrieved user data is sanitized by removing the `hash` field and stored in the Redis cache.
    6. The sanitized user data is returned.

#### **3.4 Delete User Process**
- **Key Function**: The core functions involved in this process are `userDelete` and `dangerUserDelete`.
- **Caching with Redis**: Both the `userDelete` and `dangerUserDelete` functions clear the cache for the user after the deletion.
- **Implementation Logic**:
    1. **User Delete**:
        - The system checks if a user with the provided ID exists.
        - If the user exists, the system updates the user's `deleted` field to `true` in the database.
        - The system then clears the cached user data from Redis.
        - The updated user data is returned.
    2. **Danger User Delete**:
        - The system checks if a user with the provided ID exists.
        - If the user exists, the system deletes the user from the database.
        - The system then clears the cached user data from Redis.
        - The deleted user data is returned.

#### **3.5 Restore Deleted User Process**
- **Key Function**: The core function involved in this process is `userBack`.
- **Caching with Redis**: The `userBack` function clears the cache for the user after restoring the deleted user.
- **Implementation Logic**:
    1. The system checks if a user with the provided ID exists.
    2. If the user exists, the system updates the user's `deleted` field to `false` in the database.
    3. The system then clears the cached user data from Redis.
    4. The updated user data is returned.

### 3. User
#### **3.1 Edit User Process**
- **Key Function**: The core function involved in this process is `editUser`.
- **Caching with Redis**: The `editUser` function clears the cache for the user after updating their information.
- **Implementation Logic**:
    1. The system checks if a user with the provided ID exists.
    2. If the user exists, the system updates the user's information in the database using the provided data.
    3. The system then deletes the cached user data from Redis to ensure the latest information is retrieved.
    4. The updated user information is returned.

#### **3.2 Get User by ID Process**
- **Key Function**: The core function involved in this process is `getUserById`.
- **Caching with Redis**: The `getUserById` function first checks the Redis cache for the user data. If the data is not found in the cache, it retrieves the user from the database, sanitizes the data, and stores it in the Redis cache.
- **Implementation Logic**:
    1. The system checks the Redis cache for the user data using the user ID as the key.
    2. If the user data is found in the cache, it is returned.
    3. If the user data is not found in the cache, the system retrieves the user from the database using the provided ID.
    4. If the user is not found in the database, the system throws a `NotFoundException`.
    5. The retrieved user data is sanitized by removing the `hash` field and stored in the Redis cache.
    6. The sanitized user data is returned.

#### **3.3 Get All Users Process**
- **Key Function**: The core function involved in this process is `getAllUsers`.
- **Caching with Redis**: The `getAllUsers` function first checks the Redis cache for the user data based on the provided query parameters. If the data is not found in the cache, it retrieves the users from the database, sanitizes the data, and stores it in the Redis cache.
- **Implementation Logic**:
    1. The system checks the Redis cache for the user data using a cache key generated from the provided query parameters.
    2. If the user data is found in the cache, it is returned.
    3. If the user data is not found in the cache, the system retrieves the users from the database using the provided query parameters for pagination, sorting, searching, and filtering.
    4. If no users are found, the system throws a `NotFoundException`.
    5. The retrieved user data is sanitized by removing the `hash` field and stored in the Redis cache.
    6. The sanitized user data is returned.

#### **3.4 Delete User Process**
- **Key Function**: The core functions involved in this process are `userDelete` and `dangerUserDelete`.
- **Caching with Redis**: Both the `userDelete` and `dangerUserDelete` functions clear the cache for the user after the deletion.
- **Implementation Logic**:
    1. **User Delete**:
        - The system checks if a user with the provided ID exists.
        - If the user exists, the system updates the user's `deleted` field to `true` in the database.
        - The system then clears the cached user data from Redis.
        - The updated user data is returned.
    2. **Danger User Delete**:
        - The system checks if a user with the provided ID exists.
        - If the user exists, the system deletes the user from the database.
        - The system then clears the cached user data from Redis.
        - The deleted user data is returned.

#### **3.5 Restore Deleted User Process**
- **Key Function**: The core function involved in this process is `userBack`.
- **Caching with Redis**: The `userBack` function clears the cache for the user after restoring the deleted user.
- **Implementation Logic**:
    1. The system checks if a user with the provided ID exists.
    2. If the user exists, the system updates the user's `deleted` field to `false` in the database.
    3. The system then clears the cached user data from Redis.
    4. The updated user data is returned.


### 4. Geo Tracking
#### **4.1 Geo Tracking Process**
- **Key Function**: The core function involved in this process is `geoTrack`.
- **Implementation Logic**:
    1. The system checks if a user ID or email is provided.
    2. If a user ID is provided, the system retrieves the user's email from the database.
    3. If an email is provided, the system retrieves the user's ID from the database.
    4. If neither a user ID nor an email is provided, the system throws an error.
    5. The system creates a new geo log in the database with the provided IP address, action, user agent, user ID, email, and reason.

#### **4.2 Get All Geo Logs Process**
- **Key Function**: The core function involved in this process is `getAllGeoLogs`.
- **Caching with Redis**: The `getAllGeoLogs` function first checks the Redis cache for the geo log data based on the provided query parameters. If the data is not found in the cache, it retrieves the geo logs from the database, and stores it in the Redis cache.
- **Implementation Logic**:
    1. The system checks the Redis cache for the geo log data using a cache key generated from the provided query parameters.
    2. If the geo log data is found in the cache, it is returned.
    3. If the geo log data is not found in the cache, the system retrieves the geo logs from the database using the provided query parameters for pagination, sorting, searching, and filtering.
    4. If no geo logs are found, the system throws a `NotFoundException`.
    5. The retrieved geo log data is stored in the Redis cache.
    6. The geo log data is returned.

#### **4.3 Get IP Details Process**
- **Key Function**: The core function involved in this process is `getIpDetails`.
- **Implementation Logic**:
    1. The system receives an IP address as input.
    2. The system constructs the IP details URL using the `IP_API_URL` configuration value and the provided IP address.
    3. The system makes a GET request to the IP details URL using the `axios` library.
    4. The system returns the IP details data received in the response.

