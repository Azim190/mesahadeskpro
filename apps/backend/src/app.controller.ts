import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import * as fs from 'fs';
import { join } from 'path';
import * as os from 'os';
import * as crypto from 'crypto';
import { exec } from 'child_process';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('api')
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('attachments/upload')
  uploadAttachment(
    @Body()
    body: {
      fileName: string;
      fileBase64: string;
      projectId: string;
      projectName?: string;
    },
  ) {
    const { fileName, fileBase64, projectId, projectName } = body;
    const fileBuffer = Buffer.from(fileBase64, 'base64');
    const fileId = crypto.randomUUID();

    // 1. Save locally in AppData attachments folder so it's loaded in project view
    const appDataPath =
      process.platform === 'win32'
        ? join(os.homedir(), 'AppData', 'Roaming', '@masahadesk', 'desktop')
        : join(os.homedir(), '.config', '@masahadesk', 'desktop');
    const destDir = join(appDataPath, 'attachments', projectId);

    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    const destFileName = `${fileId}-${fileName}`;
    const destPath = join(destDir, destFileName);
    fs.writeFileSync(destPath, fileBuffer);
    const stat = fs.statSync(destPath);

    // 2. Save directly in local OneDrive folder D:\OneDrive\مشاريع فرع مكة المكرمة\قسم أعمال المساحة
    try {
      const targetOneDriveDir =
        'D:\\OneDrive\\مشاريع فرع مكة المكرمة\\قسم أعمال المساحة';
      const folderName = (projectName || 'Unnamed Project')
        .replace(/[\\/:*?"<>|]/g, '_')
        .trim();
      const oneDriveProjectDir = join(targetOneDriveDir, folderName);

      if (!fs.existsSync(oneDriveProjectDir)) {
        fs.mkdirSync(oneDriveProjectDir, { recursive: true });
      }

      const oneDriveDestPath = join(oneDriveProjectDir, fileName);
      fs.writeFileSync(oneDriveDestPath, fileBuffer);
    } catch (e) {
      console.error('Failed to copy attachment to OneDrive in backend:', e);
    }

    return {
      id: fileId,
      fileName,
      filePath: destPath,
      sizeBytes: stat.size,
      uploadedAt: new Date().toISOString(),
    };
  }

  @Post('attachments/open-folder')
  openOneDriveFolder(@Body() body: { projectName: string }) {
    const { projectName } = body;
    try {
      const targetOneDriveDir =
        'D:\\OneDrive\\مشاريع فرع مكة المكرمة\\قسم أعمال المساحة';
      const folderName = (projectName || 'Unnamed Project')
        .replace(/[\\/:*?"<>|]/g, '_')
        .trim();
      const oneDriveProjectDir = join(targetOneDriveDir, folderName);

      if (!fs.existsSync(oneDriveProjectDir)) {
        fs.mkdirSync(oneDriveProjectDir, { recursive: true });
      }

      if (process.platform === 'win32') {
        exec(`explorer.exe "${oneDriveProjectDir}"`);
      }
    } catch (e) {
      console.error('Failed to open OneDrive project folder in backend:', e);
    }
    return { success: true };
  }
}
