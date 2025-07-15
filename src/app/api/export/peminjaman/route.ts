import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import ExcelJS from 'exceljs';

export async function GET(req: NextRequest) {
  const range = req.nextUrl.searchParams.get('range'); // all | 1bulan | 3bulan | 1tahun

  let dateFilter: Date | null = null;
  const now = new Date();

  if (range === '1bulan') {
    dateFilter = new Date(now);
    dateFilter.setMonth(now.getMonth() - 1);
  } else if (range === '3bulan') {
    dateFilter = new Date(now);
    dateFilter.setMonth(now.getMonth() - 3);
  } else if (range === '1tahun') {
    dateFilter = new Date(now);
    dateFilter.setFullYear(now.getFullYear() - 1);
  }

  try {
    const where = dateFilter ? { tanggalPengajuan: { gte: dateFilter } } : {};

    const data = await prisma.peminjamanBarang.findMany({
      where,
      orderBy: { tanggalPengajuan: 'desc' },
      include: {
        barang: true, // ✅ ambil data relasi barang untuk namaBarang
      },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Peminjaman');

    // ✅ Sesuai dengan table tampilan
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 5 },
      { header: 'Nama', key: 'nama', width: 20 },
      { header: 'Jabatan', key: 'jabatan', width: 15 },
      { header: 'Nama Barang', key: 'namaBarang', width: 20 },
      { header: 'Jumlah', key: 'jumlahBarang', width: 10 },
      { header: 'Tgl Pengajuan', key: 'tanggalPengajuan', width: 15 },
      { header: 'Tgl Pengembalian', key: 'tanggalPengembalian', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
    ];

    // ✅ Isi data row sesuai tampilan tabel
    data.forEach((item) => {
      worksheet.addRow({
        id: item.id,
        nama: item.nama,
        jabatan: item.jabatan,
        namaBarang: item.barang?.nama || '-', // tampilkan nama barang dari relasi
        jumlahBarang: item.jumlahBarang,
        tanggalPengajuan: new Date(item.tanggalPengajuan).toLocaleDateString('id-ID'),
        tanggalPengembalian: new Date(item.tanggalPengembalian).toLocaleDateString('id-ID'),
        status: item.status,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename=peminjaman_${range || 'all'}.xlsx`,
      },
    });
  } catch (err: any) {
    console.error('Export error:', err);
    return NextResponse.json({ error: 'Gagal export', detail: err.message }, { status: 500 });
  }
}
