import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const REPORT_FILE_NAME = 'report_2026-06-02.pdf';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const pdfPath = path.join(process.cwd(), REPORT_FILE_NAME);

  try {
    await access(pdfPath);
  } catch {
    return NextResponse.json({ error: `Fichier introuvable: ${REPORT_FILE_NAME}` }, { status: 404 });
  }

  const pdfBuffer = await readFile(pdfPath);
  const shouldDownload = request.nextUrl.searchParams.get('download') === '1';
  const disposition = shouldDownload ? 'attachment' : 'inline';

  return new NextResponse(pdfBuffer, {
    headers: {
      'Cache-Control': 'no-store',
      'Content-Disposition': `${disposition}; filename="${REPORT_FILE_NAME}"`,
      'Content-Type': 'application/pdf',
    },
  });
}
