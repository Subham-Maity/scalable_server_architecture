import { PaginationParams } from './query/pagination-user.type';
import { SortParams } from './query/sort-user.type';
import { SearchParams } from './query/search-user.type';
import { FilterParams } from './query/filter-user.type';

export interface GetAllUsersParams
  extends PaginationParams,
    SortParams,
    SearchParams,
    FilterParams {}
