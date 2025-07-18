import path from 'node:path';
import fse from 'fs-extra';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { log } from '@/utils/logger';
import type { CacheableData } from './types'; // 从新的核心类型文件导入

const CACHE_FILE_PATH = path.join(process.cwd(), 'src/data/local-cache.json');
// 确保文件存在
if (!fse.existsSync(CACHE_FILE_PATH)) {
  fse.outputJSONSync(CACHE_FILE_PATH, {});
}

export class CacheManager {
  private db: Low<CacheableData>;

  private constructor(db: Low<CacheableData>) {
    this.db = db;
  }

  public static async create(): Promise<CacheManager> {
    await fse.ensureFile(CACHE_FILE_PATH);
    const adapter = new JSONFile<CacheableData>(CACHE_FILE_PATH);
    const db = new Low<CacheableData>(adapter, {});

    log('正在读取缓存文件...');
    await db.read();

    if (db.data === null) {
      db.data = {};
    }

    // 初始化时预设白名单
    if (!db.data.hotlinkDomains) {
      db.data.hotlinkDomains = {
        'github.com': false,
        'user-images.githubusercontent.com': false,
      };
    }

    return new CacheManager(db);
  }

  public get<K extends keyof CacheableData>(
    key: K,
  ): CacheableData[K] | undefined {
    return this.db.data?.[key];
  }

  public set<K extends keyof CacheableData>(
    key: K,
    value: CacheableData[K],
  ): void {
    if (this.db.data) {
      this.db.data[key] = value;
    }
  }

  public async write(): Promise<void> {
    if (this.db.data) {
      await this.db.write();
    }
  }
}
