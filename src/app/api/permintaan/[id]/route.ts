import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
 
  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) {
    return NextResponse.json({ error: 'ID tidak valid' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { status } = body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Status tidak valid. Gunakan "approved" atau "rejected".' }, { status: 400 });
    }

    const updateResult = await prisma.permintaanBarang.update({
      where: { id: numericId },
      data: { status },
    });

    return NextResponse.json(updateResult);
  } catch (err: any) {
    console.error('Error update status:', err);
    return NextResponse.json(
      { error: 'Gagal mengubah status', detail: err.message },
      { status: 500 }
    );
  }
}
