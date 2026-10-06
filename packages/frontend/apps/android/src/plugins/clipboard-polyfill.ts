/**
 * Override navigator.clipboard with the native Android implementation.
 *
 * On some Android WebViews (e.g. Huawei WebView) the async Clipboard API is
 * unavailable or rejects with NotAllowedError even inside a user gesture,
 * because the page is served from https://localhost inside Capacitor and does
 * not hold the clipboard permission. document.execCommand('copy') is also
 * unreliable there. Routing clipboard writes/reads through the native
 * ClipboardManager fixes copying share links and doc content.
 */
import { NativeClipboard } from './clipboard';

const TEXT_PLAIN = 'text/plain';
const TEXT_HTML = 'text/html';

const readClipboardItem = async (
  item: ClipboardItem
): Promise<{ text?: string; html?: string }> => {
  let text: string | undefined;
  let html: string | undefined;
  if (item.types.includes(TEXT_PLAIN)) {
    text = await item.getType(TEXT_PLAIN).then(b => b.text());
  }
  if (item.types.includes(TEXT_HTML)) {
    html = await item.getType(TEXT_HTML).then(b => b.text());
  }
  // Best-effort fallback for other mime types.
  if (text === undefined) {
    for (const type of item.types) {
      if (type !== TEXT_HTML) {
        text = await item.getType(type).then(b => b.text());
        break;
      }
    }
  }
  return { text, html };
};

class NativeClipboardAdapter {
  async readText(): Promise<string> {
    const result = await NativeClipboard.read();
    return result.text ?? '';
  }

  async write(items: ClipboardItems): Promise<void> {
    for (const item of items) {
      const { text, html } = await readClipboardItem(item);
      if (text !== undefined || html !== undefined) {
        await NativeClipboard.write({ text, html });
      }
    }
  }

  async writeText(text: string): Promise<void> {
    await NativeClipboard.write({ text });
  }
}

export const installClipboardPolyfill = () => {
  try {
    Object.defineProperty(globalThis.navigator, 'clipboard', {
      value: new NativeClipboardAdapter(),
      configurable: true,
      writable: true,
    });
  } catch (err) {
    console.error('Failed to install clipboard polyfill', err);
  }
};
