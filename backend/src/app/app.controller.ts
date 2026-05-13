import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('system')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOkResponse({
    description: 'Backend health status.',
    schema: {
      example: {
        status: 'ok',
        service: 'nexus-social-backend',
      },
    },
  })
  getHealth() {
    return this.appService.getHealth();
  }
}
