import { CommandOptions } from '../types';

export async function modifyCommand(file: string, request: string, options: CommandOptions) {
  console.log('Modify command - to be implemented');
  console.log(`File: ${file}`);
  console.log(`Request: ${request}`);
  console.log(`Options:`, options);
} 