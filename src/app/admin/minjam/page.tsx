'use client';

import { useEffect, useState } from 'react';

type PeminjamanBarang = {
  id: number;
  userId: number;
  barangId: number;
  nama: string;
  jabatan: string;
  kelas: string;
  keperluan: string;
  jumlahBarang: number;
  tanggalPengajuan: string;
  tanggalPengembalian: string;
  status: 'pending' | 'approved' | 'rejected' | 'dikembalikan';
  createdAt: string;
  barang: {
    id: number;
    nama: string;
    jenis: string;
    stok: number;
    createdAt: string;
    updatedAt: string;
  };
};

export default function PengajuanPage() {
  const [peminjaman, setPeminjaman] = useState<PeminjamanBarang[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'dikembalikan'>('all');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/peminjaman');
        if (!res.ok) throw new Error('Gagal ambil data');
        const data = await res.json();
        const sorted = data.sort(
          (a: PeminjamanBarang, b: PeminjamanBarang) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setPeminjaman(sorted);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleApprove = async (
    id: number,
    status: 'approved' | 'rejected' | 'dikembalikan'
  ) => {
    try {
      const res = await fetch(`/api/peminjaman/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setPeminjaman((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status } : item))
        );
      } else {
        console.error(await res.text());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered =
    filter === 'all' ? peminjaman : peminjaman.filter((p) => p.status === filter);

  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const handleExport = (range: '1bulan' | '3bulan' | '1tahun' | 'semua') => {
    window.location.href = `/api/export/peminjaman?range=${range}`;
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Data Pengajuan Peminjaman</h2>

      {/* Filter Status */}
      <div className="flex gap-2 mb-4">
        {['all', 'pending', 'approved', 'rejected', 'dikembalikan'].map((f) => (
          <button
            key={f}
            onClick={() => {
              setFilter(f as any);
              setPage(1);
            }}
            className={`px-3 py-1 rounded ${
              filter === f ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Export Button */}
      <div className="flex gap-2 mb-4">
        <span className="font-semibold">Export Data:</span>
        <button
          onClick={() => handleExport('1bulan')}
          className="bg-green-500 text-white px-2 py-1 rounded text-xs"
        >
          1 Bulan
        </button>
        <button
          onClick={() => handleExport('3bulan')}
          className="bg-green-500 text-white px-2 py-1 rounded text-xs"
        >
          3 Bulan
        </button>
        <button
          onClick={() => handleExport('1tahun')}
          className="bg-green-500 text-white px-2 py-1 rounded text-xs"
        >
          1 Tahun
        </button>
        <button
          onClick={() => handleExport('semua')}
          className="bg-green-500 text-white px-2 py-1 rounded text-xs"
        >
          Semua
        </button>
      </div>

      {/* Tabel Data */}
      <table className="w-full border text-sm">
        <thead className="bg-gray-200">
          <tr>
            <th className="border px-2 py-1">Nama</th>
            <th className="border px-2 py-1">Jabatan</th>
            <th className="border px-2 py-1">Nama Barang</th>
            <th className="border px-2 py-1">Jumlah</th>
            <th className="border px-2 py-1">Tgl Pengajuan</th>
            <th className="border px-2 py-1">Tgl Pengembalian</th>
            <th className="border px-2 py-1">Status</th>
            <th className="border px-2 py-1">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {paginated.map((item) => (
            <tr key={item.id}>
              <td className="border px-2 py-1">{item.nama}</td>
              <td className="border px-2 py-1">{item.jabatan}</td>
              <td className="border px-2 py-1">{item.barang.nama}</td>
              <td className="border px-2 py-1">{item.jumlahBarang}</td>
              <td className="border px-2 py-1">
                {new Date(item.tanggalPengajuan).toLocaleDateString()}
              </td>
              <td className="border px-2 py-1">
                {new Date(item.tanggalPengembalian).toLocaleDateString()}
              </td>
              <td className="border px-2 py-1 capitalize">
                <span
                  className={`px-2 py-1 rounded text-xs text-white ${
                    item.status === 'pending'
                      ? 'bg-yellow-500'
                      : item.status === 'approved'
                      ? 'bg-blue-500'
                      : item.status === 'rejected'
                      ? 'bg-red-500'
                      : 'bg-green-600'
                  }`}
                >
                  {item.status}
                </span>
              </td>
              <td className="border px-2 py-1 space-x-1">
                {item.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApprove(item.id, 'approved')}
                      className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleApprove(item.id, 'rejected')}
                      className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                    >
                      Reject
                    </button>
                  </>
                )}
                {item.status === 'approved' && (
                  <button
                    onClick={() => handleApprove(item.id, 'dikembalikan')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
                  >
                    Kembalikan
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <span>
          Page {page} of {totalPages}
        </span>
        <div className="space-x-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-2 py-1 bg-gray-300 rounded disabled:opacity-50"
          >
            Prev
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-2 py-1 bg-gray-300 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
