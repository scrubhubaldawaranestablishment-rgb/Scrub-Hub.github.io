import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ContentService } from './content.service';
import { CreateContentItemDto, UpdateContentItemDto } from './dto/content.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('content')
@UseGuards(JwtAuthGuard)
export class ContentController {
  constructor(private contentService: ContentService) {}

  @Get('channels/:channelId')
  findByChannel(
    @Param('channelId') channelId: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.contentService.findByChannel(channelId, req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.contentService.findOne(id, req.user.id);
  }

  @Post('channels/:channelId')
  create(
    @Param('channelId') channelId: string,
    @Body() dto: CreateContentItemDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.contentService.create(channelId, req.user.id, dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateContentItemDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.contentService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.contentService.remove(id, req.user.id);
  }
}
