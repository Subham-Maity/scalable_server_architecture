import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { JwtGuard } from '../auth/guard';

import { GetUser } from '../auth/decorator';

import { CreateBookmarkDto, EditBookmarkDto } from './dto';
import { BookmarkService } from './bookmark.service';
import { ConfigId } from '../types/configId';

@UseGuards(JwtGuard)
@Controller('bookmarks')
export class BookmarkController {
  constructor(private bookmarksService: BookmarkService) {}

  @Get()
  getBookmarks(@GetUser('id') userId: ConfigId) {
    return this.bookmarksService.getBookmarks(userId);
  }

  @Get(':id')
  getBookmarkById(@GetUser('id') userId: ConfigId, @Param('id') bookmarkId: ConfigId) {
    return this.bookmarksService.getBookmarkById(userId, bookmarkId);
  }

  @Post()
  createBookmark(@GetUser('id') userId: ConfigId, @Body() dto: CreateBookmarkDto) {
    return this.bookmarksService.createBookmark(userId, dto);
  }

  @Patch(':id')
  editBookmarkById(
    @GetUser('id') userId: ConfigId,
    @Param('id') bookmarkId: ConfigId,
    @Body() dto: EditBookmarkDto,
  ) {
    return this.bookmarksService.editBookmarkById(userId, bookmarkId, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deleteBookmarkById(@GetUser('id') userId: ConfigId, @Param('id') bookmarkId: ConfigId) {
    return this.bookmarksService.deleteBookmarkById(userId, bookmarkId);
  }
}
