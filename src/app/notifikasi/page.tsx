'use client';

import { useEffect, useState } from 'react';

type NotifikasiItem = {
  id: number;
  type: 'peminjaman' | 'permintaan';
  nama: string;
  keperluan: string;
  barang: string;
  tanggal: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
};

export default function NotifikasiPage() {
  const [notifikasi, setNotifikasi] = useState<NotifikasiItem[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'peminjaman' | 'permintaan'>('all');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token'); // atau dari state/context kalau kamu pakai
        const res = await fetch('/api/notifikasi', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error('Gagal ambil data');
        const data = await res.json();
        const sorted = data.sort(
          (a: NotifikasiItem, b: NotifikasiItem) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setNotifikasi(sorted);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const filtered = filterType === 'all'
    ? notifikasi
    : notifikasi.filter(n => n.type === filterType);

  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Notifikasi Form</h2>

      <div className="flex gap-2 mb-4">
        {['all', 'peminjaman', 'permintaan'].map((type) => (
          <button
            key={type}
            onClick={() => {
              setFilterType(type as any);
              setPage(1);
            }}
            className={`px-3 py-1 rounded ${
              filterType === type ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            {type.toUpperCase()}
          </button>
        ))}
      </div>

      <table className="w-full border text-sm">
        <thead className="bg-gray-200">
          <tr>
            <th className="border px-2 py-1">Nama</th>
            <th className="border px-2 py-1">Barang</th>
            <th className="border px-2 py-1">Keperluan</th>
            <th className="border px-2 py-1">Tanggal</th>
            <th className="border px-2 py-1">Status</th>
            <th className="border px-2 py-1">Jenis</th>
          </tr>
        </thead>
        <tbody>
          {paginated.map((item) => (
            <tr key={`${item.type}-${item.id}`}>
              <td className="border px-2 py-1">{item.nama}</td>
              <td className="border px-2 py-1">{item.barang}</td>
              <td className="border px-2 py-1">{item.keperluan}</td>
              <td className="border px-2 py-1">{new Date(item.tanggal).toLocaleDateString()}</td>
              <td className="border px-2 py-1 capitalize">{item.status}</td>
              <td className="border px-2 py-1 capitalize">{item.type}</td>
            </tr>
          ))}
        </tbody>
      </table>

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
