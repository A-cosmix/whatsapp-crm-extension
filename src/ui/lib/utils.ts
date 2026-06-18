import type { ExtensionMessage, MessageType } from '@infrastructure/di/container';

export async function sendMessage<T>(type: MessageType, payload?: unknown): Promise<T> {
  const message: ExtensionMessage = { type, payload };
  return chrome.runtime.sendMessage(message) as Promise<T>;
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function getScoreColor(score: number): string {
  if (score >= 80) return '#22C55E';
  if (score >= 60) return '#A855F7';
  if (score >= 40) return '#F59E0B';
  return '#EF4444';
}

export function getGradeColor(grade: string): string {
  if (grade.startsWith('A')) return '#22C55E';
  if (grade === 'B') return '#A855F7';
  if (grade === 'C') return '#F59E0B';
  return '#EF4444';
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export { formatCurrency } from '@domain/value-objects';
