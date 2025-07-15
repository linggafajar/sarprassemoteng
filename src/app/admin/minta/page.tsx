'use client';

import { useEffect, useState } from 'react';

type PermintaanBarang = {
  id: number;
  nama: string;
  jabatan: string;
  kelas?: string;
  keperluan: string;
  tanggal: string;
  jumlah: number;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
  barang: {
    nama: string;
  };
};

export default function PermintaanPage() {
  const [permintaan, setPermintaan] = useState<PermintaanBarang[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/permintaan');
        if (!res.ok) throw new Error('Gagal ambil data');
        const data = await res.json();
        const sorted = data.sort(
          (a: PermintaanBarang, b: PermintaanBarang) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setPermintaan(sorted);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleApprove = async (id: number, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`/api/permintaan/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setPermintaan((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status } : item))
        );
      } else {
        console.error(await res.text());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExport = (range: '1bulan' | '3bulan' | '1tahun' | 'semua') => {
    window.location.href = `/api/export/permintaan?range=${range}`;
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Menunggu';
      case 'approved':
        return 'Disetujui';
      case 'rejected':
        return 'Ditolak';
      default:
        return status;
    }
  };

  const filtered = filter === 'all' ? permintaan : permintaan.filter(p => p.status === filter);
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Data Permintaan Barang</h2>

      <div className="flex gap-2 mb-4">
        {['all', 'pending', 'approved', 'rejected'].map((f) => (
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
            {f === 'all'
              ? 'SEMUA'
              : f === 'pending'
              ? 'MENUNGGU'
              : f === 'approved'
              ? 'DISETUJUI'
              : 'DITOLAK'}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        <span className="font-semibold">Export Data:</span>
        <button onClick={() => handleExport('1bulan')} className="bg-green-500 text-white px-2 py-1 rounded text-xs">
          1 Bulan
        </button>
        <button onClick={() => handleExport('3bulan')} className="bg-green-500 text-white px-2 py-1 rounded text-xs">
          3 Bulan
        </button>
        <button onClick={() => handleExport('1tahun')} className="bg-green-500 text-white px-2 py-1 rounded text-xs">
          1 Tahun
        </button>
        <button onClick={() => handleExport('semua')} className="bg-green-500 text-white px-2 py-1 rounded text-xs">
          Semua
        </button>
      </div>

      <table className="w-full border text-sm">
        <thead className="bg-gray-200">
          <tr>
            <th className="border px-2 py-1">Nama</th>
            <th className="border px-2 py-1">Jabatan</th>
            <th className="border px-2 py-1">Nama Barang</th>
            <th className="border px-2 py-1">Keperluan</th>
            <th className="border px-2 py-1">Jumlah</th>
            <th className="border px-2 py-1">Tanggal</th>
            <th className="border px-2 py-1">Status</th>
            <th className="border px-2 py-1">Tindakan</th>
          </tr>
        </thead>
        <tbody>
          {paginated.map((item) => (
            <tr key={item.id}>
              <td className="border px-2 py-1">{item.nama}</td>
              <td className="border px-2 py-1">{item.jabatan}</td>
              <td className="border px-2 py-1">{item.barang?.nama || '-'}</td>
              <td className="border px-2 py-1">{item.keperluan}</td>
              <td className="border px-2 py-1">{item.jumlah}</td>
              <td className="border px-2 py-1">{new Date(item.tanggal).toLocaleDateString()}</td>
              <td className="border px-2 py-1 capitalize">{translateStatus(item.status)}</td>
              <td className="border px-2 py-1 space-x-1">
                {item.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApprove(item.id, 'approved')}
                      className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
                    >
                      Setujui
                    </button>
                    <button
                      onClick={() => handleApprove(item.id, 'rejected')}
                      className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                    >
                      Tolak
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-between items-center mt-4">
        <span>
          Halaman {page} dari {totalPages}
        </span>
        <div className="space-x-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-2 py-1 bg-gray-300 rounded disabled:opacity-50"
          >
            Sebelumnya
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-2 py-1 bg-gray-300 rounded disabled:opacity-50"
          >
            Selanjutnya
          </button>
        </div>
      </div>
    </div>
  );
}
