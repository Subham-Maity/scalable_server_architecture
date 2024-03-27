import { Query, Resolver } from '@nestjs/graphql';
import { Book } from './book.schema';
import { Book as BookModel } from '../graphql';

@Resolver(() => Book)
export class BookResolver {
  @Query(() => [Book], { name: 'books' }) //name set instead of getAllBooks it's now books
  getAllBooks() {
    const arr: BookModel[] = [
      {
        id: 1,
        title: 'Book 1',
        price: 10,
      },
      {
        id: 2,
        title: 'Book 2',
        price: 20,
      },
      {
        id: 3,
        title: 'Book 3',
        price: 30,
      },
    ];
    return arr;
  }
}
