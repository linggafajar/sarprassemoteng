import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET as string;

export async function GET() {
  try {
    // Ambil cookie token
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: Token missing' }, { status: 401 });
    }

    // Verifikasi token
    const payload = jwt.verify(token, SECRET) as { id: number };

    const userId = payload.id;

    // Ambil data peminjaman
    const peminjaman = await prisma.peminjamanBarang.findMany({
      where: { userId },
      include: { barang: true },
    });

    // Ambil data permintaan
    const permintaan = await prisma.permintaanBarang.findMany({
      where: { userId },
      include: { barang: true },
    });

    // Gabungkan dan map agar seragam
    const hasil = [
      ...peminjaman.map(p => ({
        id: p.id,
        type: 'peminjaman' as const,
        nama: p.nama,
        keperluan: p.keperluan,
        barang: p.barang.nama,
        tanggal: p.tanggalPengajuan.toISOString(),
        status: p.status as 'pending' | 'approved' | 'rejected',
        createdAt: p.createdAt.toISOString(),
      })),
      ...permintaan.map(p => ({
        id: p.id,
        type: 'permintaan' as const,
        nama: p.nama,
        keperluan: p.keperluan,
        barang: p.barang.nama,
        tanggal: p.tanggal.toISOString(),
        status: p.status as 'pending' | 'approved' | 'rejected',
        createdAt: p.createdAt.toISOString(),
      })),
    ];

    return NextResponse.json(hasil);
  } catch (err: any) {
    console.error('Error:', err);
    if (err.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
