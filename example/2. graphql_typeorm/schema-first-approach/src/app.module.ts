import { ApolloDriverConfig, ApolloDriver } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { BookResolver } from './book/book.resolver';
import { join } from 'path';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: true, //make it false for the productions
      autoSchemaFile: join(process.cwd(), 'src/schema.graphql'),
      //ts-morph
      definitions: {
        path: join(process.cwd(), 'src/graphql.ts'),
      },
    }),
    BookResolver,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
