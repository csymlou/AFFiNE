import { registerPlugin } from '@capacitor/core';

export type NativeClipboardReadResult = {
  text: string | null;
  html: string | null;
};

type NativeClipboardPlugin = {
  write(options: { text?: string; html?: string }): Promise<void>;
  read(): Promise<NativeClipboardReadResult>;
};

export const NativeClipboard =
  registerPlugin<NativeClipboardPlugin>('Clipboard');
