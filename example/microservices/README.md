# Microservices

> **Written By**: [ﾒΛM](https://github.com/Subham-Maity)

### 1. Install 

```bash
 nest new ordering-app
```

### 2. Generate App

#### 2.1 Generate `orders` App


- Let's generate the `orders` app.

```bash
nest g app orders
```

- Open apps folder and you will see the `orders` and `ordering-app` folder.
- Remove the `ordering-app` folder.
- Remove from the nest-cli.json file.


#### 2.2 Generate `billing` App

- Let's generate the `billing` app.

```bash
nest g app billing
```

#### 2.3 Generate `Auth` App

- Let's generate the `auth` app.

```bash
nest g app auth
```     


### 2. Run The Application

- Run the following command to start the monorepo application.

```bash
yarn start:dev auth
```

- Run the entire application.

```bash\
yarn start:dev
```

### 3. Share code between different apps

- Install the following package.

```bash
nest g library common
```
> - ? What prefix would you like to use for the library (default: @app or 'defaultLibraryPrefix' setting value)?
> - Just enter

- you will see a `lib` folder inside that folder you will get the `common` folder and inside that, you will get the `src` folder.

