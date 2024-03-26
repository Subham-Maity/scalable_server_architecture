import { ApolloDriverConfig, ApolloDriver } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { BookResolver } from './book/book.resolver';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: true, //make it false for the productions
      typePaths: ['./**/*.graphql'],
    }),
    BookResolver,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
