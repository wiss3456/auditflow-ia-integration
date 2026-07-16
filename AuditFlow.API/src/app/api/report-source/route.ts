import { access, readFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';
import path from 'node:path';

import { NextResponse } from 'next/server';

import { parseReportPdfText } from '@/lib/reports/report-pdf-source';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const execFileAsync = promisify(execFile);
const REPORT_FILE_NAME = 'report_2026-06-02.pdf';

async function resolvePdfToTextCommand(): Promise<string> {
  const preferredWindowsPath = 'C:\\Program Files\\MiKTeX\\miktex\\bin\\x64\\pdftotext.exe';

  try {
    await access(preferredWindowsPath);
    return preferredWindowsPath;
  } catch {
    return 'pdftotext';
  }
}

async function extractPdfText(pdfPath: string): Promise<string> {
  const command = await resolvePdfToTextCommand();

  try {
    const { stdout } = await execFileAsync(command, ['-q', '-layout', pdfPath, '-'], {
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024,
    });

    if (stdout.trim()) {
      return stdout;
    }
  } catch (error) {
    if (error && typeof error === 'object' && 'stdout' in error) {
      const stdout = typeof error.stdout === 'string' ? error.stdout : '';

      if (stdout.trim()) {
        return stdout;
      }
    }
  }

  const fallbackBuffer = await readFile(pdfPath);
  return fallbackBuffer.toString('latin1');
}

export async function GET(): Promise<NextResponse> {
  const pdfPath = path.join(process.cwd(), REPORT_FILE_NAME);

  try {
    await access(pdfPath);
  } catch {
    return NextResponse.json({ error: `Fichier introuvable: ${REPORT_FILE_NAME}` }, { status: 404 });
  }

  const extractedText = await extractPdfText(pdfPath);
  const document = parseReportPdfText(extractedText, REPORT_FILE_NAME);

  return NextResponse.json(
    {
      document,
      generatedAt: new Date().toISOString(),
      pdfPreviewUrl: '/api/report-source/pdf',
    },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  );
}
