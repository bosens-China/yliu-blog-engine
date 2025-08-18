# src/services/cache.py

import asyncio
import json
from pathlib import Path
from typing import Any, Dict, Optional, Self

import aiofiles
from ..utils.logger import log, warn

class CacheManager:
    """
    一个智能缓存管理器，支持：
    - 命名空间隔离
    - 基于 schema 版本的自动失效
    - 异步、防抖的磁盘写入
    """

    def __init__(
        self,
        cache_file_path: Path,
        schema_version: str,
        debounce_delay: float = 2.0,
    ):
        self._cache_file_path = cache_file_path
        self._schema_version = schema_version
        self._debounce_delay = debounce_delay
        self._in_memory_cache: Dict[str, Any] = {}
        self._dirty = False
        self._write_task: Optional[asyncio.Task] = None

    async def _load_from_disk(self):
        """从磁盘加载缓存文件，并进行版本校验。"""
        if not self._cache_file_path.exists():
            log("缓存文件不存在，将创建新缓存。")
            self._in_memory_cache = {"_metadata": {"schema_version": self._schema_version}}
            return

        try:
            async with aiofiles.open(self._cache_file_path, mode="r", encoding="utf-8") as f:
                content = await f.read()
                data = json.loads(content)

            # 校验 schema 版本
            loaded_version = data.get("_metadata", {}).get("schema_version")
            if loaded_version != self._schema_version:
                warn(
                    f"缓存版本不匹配 (文件版本: {loaded_version}, 代码版本: {self._schema_version})，缓存将被重置。"
                )
                self._in_memory_cache = {
                    "_metadata": {"schema_version": self._schema_version}
                }
            else:
                self._in_memory_cache = data
                log(f"成功加载缓存文件，版本: {loaded_version}")

        except (json.JSONDecodeError, IOError) as e:
            warn(f"读取或解析缓存文件失败: {e}，将创建新缓存。")
            self._in_memory_cache = {"_metadata": {"schema_version": self._schema_version}}

    @classmethod
    async def create(
        cls, cache_file_path: str = "local_cache.json", schema_version: str = "1.0"
    ) -> Self:
        """异步工厂方法，用于创建并初始化 CacheManager 实例。"""
        instance = cls(Path(cache_file_path), schema_version)
        await instance._load_from_disk()
        return instance

    def get(self, namespace: str, key: str) -> Optional[Any]:
        """从指定命名空间同步获取缓存。"""
        return self._in_memory_cache.get(namespace, {}).get(key)

    def set(self, namespace: str, key: str, value: Any):
        """向指定命名空间同步设置缓存，并调度一次异步写入。"""
        if namespace not in self._in_memory_cache:
            self._in_memory_cache[namespace] = {}
        
        # 只有当值发生变化时才标记为脏数据并调度写入
        if self._in_memory_cache[namespace].get(key) != value:
            self._in_memory_cache[namespace][key] = value
            self._dirty = True
            self._schedule_write()

    async def _write_to_disk(self):
        """实际执行写入磁盘的操作。"""
        await asyncio.sleep(self._debounce_delay)
        if not self._dirty:
            return

        log("执行异步缓存写入磁盘...")
        try:
            async with aiofiles.open(self._cache_file_path, mode="w", encoding="utf-8") as f:
                await f.write(json.dumps(self._in_memory_cache, indent=2, ensure_ascii=False))
            self._dirty = False
            log("✅ 缓存成功写入磁盘。")
        except IOError as e:
            warn(f"写入缓存文件失败: {e}")
        finally:
            self._write_task = None

    def _schedule_write(self):
        """调度一个防抖的写入任务。"""
        if self._write_task:
            self._write_task.cancel()
        
        self._write_task = asyncio.create_task(self._write_to_disk())

    async def flush(self):
        """立即执行一次写入操作，确保数据持久化。"""
        if self._write_task:
            self._write_task.cancel()
            self._write_task = None

        if self._dirty:
            log("正在强制刷新缓存到磁盘...")
            # 直接调用，不等延迟
            await self._write_to_disk()

    async def clear(self, namespace: Optional[str] = None):
        """清空整个缓存或指定的命名空间。"""
        if namespace:
            if namespace in self._in_memory_cache:
                del self._in_memory_cache[namespace]
                log(f"命名空间 '{namespace}' 已被清空。")
        else:
            self._in_memory_cache = {"_metadata": {"schema_version": self._schema_version}}
            log("所有缓存已被清空。")
        
        self._dirty = True
        await self.flush()
