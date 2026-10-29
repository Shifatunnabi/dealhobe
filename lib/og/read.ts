import { readFile } from 'node:fs/promises';
import path from 'node:path';

/** Reads a file from lib/og/ (fonts, small images). next.config.ts lists lib/og/** in outputFileTracingIncludes so it ships with the deployment. */
export const readOgFile = (rel: string) => readFile(path.join(process.cwd(), 'lib', 'og', rel));
