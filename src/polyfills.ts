// Vite 5.x Node.js 16 兼容性补丁
import crypto from 'crypto';

// 为 Node.js 16 提供 getRandomValues polyfill
if (!globalThis.crypto?.getRandomValues) {
  (globalThis as any).crypto = {
    getRandomValues: function <T extends ArrayBufferView>(buffer: T): T {
      const bytes = crypto.randomBytes(buffer.byteLength);
      new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength).set(
        bytes,
      );
      return buffer;
    },
  };
}
