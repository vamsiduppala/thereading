import fs from 'fs';
import path from 'path';

// Define the state shape
export interface ChatJob {
  status: string;
  result?: any;
  timestamp: number;
}

const BUFFER_FILE = path.join(process.cwd(), 'data', 'buffer.json');

// Ensure data directory exists
if (!fs.existsSync(path.dirname(BUFFER_FILE))) {
  fs.mkdirSync(path.dirname(BUFFER_FILE), { recursive: true });
}

function readBuffer(): Record<string, ChatJob> {
  if (!fs.existsSync(BUFFER_FILE)) {
    return {};
  }
  try {
    const data = fs.readFileSync(BUFFER_FILE, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to read buffer.json', e);
    return {};
  }
}

function writeBuffer(data: Record<string, ChatJob>) {
  try {
    // Only keep jobs from the last 24 hours to prevent endless growth
    const now = Date.now();
    const filtered: Record<string, ChatJob> = {};
    for (const [key, job] of Object.entries(data)) {
      if (now - job.timestamp < 24 * 60 * 60 * 1000) {
        filtered[key] = job;
      }
    }
    fs.writeFileSync(BUFFER_FILE, JSON.stringify(filtered, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to write buffer.json', e);
  }
}

export function updateChatStatus(messageId: string, status: string, result?: any) {
  const buffer = readBuffer();
  if (!buffer[messageId]) {
    buffer[messageId] = { status, timestamp: Date.now() };
  } else {
    buffer[messageId].status = status;
    buffer[messageId].timestamp = Date.now();
  }
  
  if (result !== undefined) {
    buffer[messageId].result = result;
  }
  writeBuffer(buffer);
}

export function getChatStatus(messageId: string): ChatJob | null {
  const buffer = readBuffer();
  return buffer[messageId] || null;
}

export function ackChat(messageId: string) {
  const buffer = readBuffer();
  if (buffer[messageId]) {
    delete buffer[messageId];
    writeBuffer(buffer);
  }
}
