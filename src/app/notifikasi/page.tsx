"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type NotifikasiItem = {
  id: number;
  type: "peminjaman" | "permintaan";
  nama: string;
  keperluan: string;
  barang: string;
  tanggal: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

export default function NotifikasiPage() {
  const [notifikasi, setNotifikasi] = useState<NotifikasiItem[]>([]);
  const [filterType, setFilterType] = useState<"all" | "peminjaman" | "permintaan">("all");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/notifikasi", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Gagal ambil data");
        const data = await res.json();
        const sorted = data.sort(
          (a: NotifikasiItem, b: NotifikasiItem) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setNotifikasi(sorted);
      } catch (err) {
        console.error(err);
      }
    }

    fetchData();
  }, []);

  const filtered = filterType === "all" ? notifikasi : notifikasi.filter((n) => n.type === filterType);
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const getStatusBadge = (status: NotifikasiItem["status"]) => {
    const colors = {
      pending: "secondary",
      approved: "success",
      rejected: "destructive",
    };

    return (
      <Badge variant={colors[status] as any} className="capitalize">
        {status}
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Notifikasi</h1>

      <ToggleGroup
        type="single"
        value={filterType}
        onValueChange={(val) => {
          setFilterType((val as any) || "all");
          setPage(1);
        }}
        className="gap-2"
      >
        <ToggleGroupItem value="all">Semua</ToggleGroupItem>
        <ToggleGroupItem value="peminjaman">Peminjaman</ToggleGroupItem>
        <ToggleGroupItem value="permintaan">Permintaan</ToggleGroupItem>
      </ToggleGroup>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Barang</TableHead>
                <TableHead>Keperluan</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Jenis</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length > 0 ? (
                paginated.map((item) => (
                  <TableRow key={`${item.type}-${item.id}`}>
                    <TableCell>{item.nama}</TableCell>
                    <TableCell>{item.barang}</TableCell>
                    <TableCell>{item.keperluan}</TableCell>
                    <TableCell>{new Date(item.tanggal).toLocaleDateString()}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="capitalize">{item.type}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    Tidak ada data
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-2">
          <span className="text-sm text-muted-foreground">
            Halaman {page} dari {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
