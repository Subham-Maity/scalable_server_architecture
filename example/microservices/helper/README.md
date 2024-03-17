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

### 4. Microservice

```bash
yarn add @nestjs/microservices
```

1. **Why we use RabbitMQ**: RabbitMQ is a message broker that allows applications to communicate with each other asynchronously. It's often used in microservices architecture to ensure loose coupling between services. It provides features like reliable message delivery, message persistence, and message routing.

2. **Why we use RabbitMQ as microservices**: In a microservices architecture, services need to communicate with each other. This communication can be synchronous or asynchronous. RabbitMQ provides a way for services to communicate asynchronously, which can be beneficial for operations that don't need an immediate response and can be processed in the background.

3. **How `rmq.service.ts` works and its purpose**: The `RmqService` is a service class that provides methods to interact with RabbitMQ.

    - The `getOptions` method returns the options needed to connect to a RabbitMQ server. It takes the name of a queue and a boolean indicating whether to acknowledge messages automatically. It uses the `ConfigService` to get the URL of the RabbitMQ server and the name of the queue.

    - The `ack` method is used to acknowledge a message. It takes a `RmqContext`, which contains information about the message and the channel it was received on. Acknowledging a message tells RabbitMQ that the message has been processed and can be removed from the queue.

4. **How `rmq.module.ts` works and its purpose**: The `RmqModule` is a module that provides and configures the `RmqService`.

    - The `register` method allows you to create a dynamic module with a configured `RmqService`. This method takes an options object that specifies the name of the RabbitMQ queue to connect to. The `register` method returns a `DynamicModule` that imports a dynamically registered module from `ClientsModule` with the specified options.

5. **Why we use `RmqModule.register({ name: BILLING_SERVICE })` inside `orders.module.ts` and pass a name**: The `OrdersModule` needs to communicate with the `BILLING_SERVICE`, so it imports the `RmqModule` and registers it with the name of the `BILLING_SERVICE`. This sets up a RabbitMQ client that can send messages to the `BILLING_SERVICE` queue. The name passed to `RmqModule.register` is used to get the name of the queue from the configuration (`RABBIT_MQ_${name}_QUEUE`).

