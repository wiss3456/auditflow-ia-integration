import { execFile } from 'node:child_process';
import { access, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const execFileAsync = promisify(execFile);
const REPORT_FILE_NAME = 'report_2026-06-02.pdf';

async function resolvePdfToImageCommand(): Promise<string> {
  const preferredWindowsPath = 'C:\\Program Files\\MiKTeX\\miktex\\bin\\x64\\pdftoppm.exe';

  try {
    await access(preferredWindowsPath);
    return preferredWindowsPath;
  } catch {
    return 'pdftoppm';
  }
}

async function renderPdfPreview(pdfPath: string): Promise<Buffer> {
  const command = await resolvePdfToImageCommand();
  const tempDirectory = await mkdtemp(path.join(tmpdir(), 'auditflow-report-preview-'));
  const outputBasePath = path.join(tempDirectory, 'report-preview');
  const outputFilePath = `${outputBasePath}.png`;

  try {
    await execFileAsync(command, ['-png', '-singlefile', '-f', '1', '-scale-to', '1400', pdfPath, outputBasePath], {
      maxBuffer: 20 * 1024 * 1024,
    });

    return await readFile(outputFilePath);
  } finally {
    await rm(tempDirectory, { force: true, recursive: true });
  }
}

export async function GET(): Promise<NextResponse> {
  const pdfPath = path.join(process.cwd(), REPORT_FILE_NAME);

  try {
    await access(pdfPath);
  } catch {
    return NextResponse.json({ error: `Fichier introuvable: ${REPORT_FILE_NAME}` }, { status: 404 });
  }

  const imageBuffer = await renderPdfPreview(pdfPath);

  return new NextResponse(imageBuffer, {
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'image/png',
    },
  });
}
