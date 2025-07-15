"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { jwtDecode } from "jwt-decode";

type JWTPayload = {
  id: string;
};

export default function PermintaanBarangForm() {
  const [userId, setUserId] = useState<number | null>(null);
  const [nama, setNama] = useState("");
  const [jabatan, setJabatan] = useState("");
  const [kelas, setKelas] = useState("");
  const [keperluan, setKeperluan] = useState("");
  const [tanggal, setTanggal] = useState<Date | undefined>(new Date());
  const [jumlah, setJumlah] = useState<number | "">(0);
  const [listBarang, setListBarang] = useState<{ id: number; nama: string; stok: number; jenis: string }[]>([]);
  const [selectedBarangId, setSelectedBarangId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    function getUserFromCookie() {
      const cookieStr = document.cookie;
      const token = cookieStr
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      if (!token) {
        alert("Token tidak ditemukan, silakan login ulang.");
        return;
      }

      try {
        const decoded = jwtDecode<JWTPayload>(decodeURIComponent(token));
        const parsedId = parseInt(decoded.id);
        if (isNaN(parsedId)) throw new Error("ID tidak valid di dalam token");
        setUserId(parsedId);
      } catch (err) {
        console.error("Gagal decode token:", err);
        alert("Token tidak valid. Silakan login ulang.");
      }
    }

    async function fetchBarang() {
      try {
        const res = await fetch("/api/barang");
        const data = await res.json();

        const filtered = data.filter((barang: any) =>
          barang.jenis?.toLowerCase() === "permintaan"
        );

        setListBarang(filtered);

        if (filtered.length > 0) {
          setSelectedBarangId(filtered[0].id);
        } else {
          setSelectedBarangId(null);
          alert("Tidak ada barang permintaan tersedia.");
        }
      } catch (error) {
        console.error("Gagal ambil data barang:", error);
      }
    }

    getUserFromCookie();
    fetchBarang();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!userId) return alert("User tidak ditemukan. Silakan login ulang.");
    if (!selectedBarangId) return alert("Pilih barang terlebih dahulu.");
    if (jumlah === "" || jumlah <= 0) return alert("Jumlah harus lebih dari 0.");

    setIsSubmitting(true);

    const data = {
      userId,
      nama: nama.trim(),
      jabatan,
      kelas: kelas.trim(),
      keperluan: keperluan.trim(),
      tanggal: tanggal ? format(tanggal, "yyyy-MM-dd") : null,
      jumlah: Number(jumlah),
      barangId: selectedBarangId,
    };

    try {
      const res = await fetch("/api/permintaan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Gagal mengirim permintaan");
      }

      alert("Permintaan berhasil dikirim");

      // Reset form
      setNama("");
      setJabatan("");
      setKelas("");
      setKeperluan("");
      setTanggal(new Date());
      setJumlah(0);
      setSelectedBarangId(listBarang.length > 0 ? listBarang[0].id : null);

    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat submit");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-6 max-w-md mx-auto" onSubmit={handleSubmit}>
      <div>
        <Label htmlFor="nama">Nama</Label>
        <Input
          id="nama"
          type="text"
          placeholder="Masukkan nama"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="jabatan">Jabatan</Label>
        <select
          id="jabatan"
          value={jabatan}
          onChange={(e) => setJabatan(e.target.value)}
          required
          className="w-full border border-input rounded-md px-3 py-2"
        >
          <option value="">Pilih jabatan</option>
          <option value="Guru">Guru</option>
          <option value="Staf">Staf</option>
          <option value="Siswa">Siswa</option>
        </select>
      </div>

      <div>
        <Label htmlFor="kelas">Kelas</Label>
        <Input
          id="kelas"
          type="text"
          placeholder="Masukkan kelas"
          value={kelas}
          onChange={(e) => setKelas(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="barang">Barang</Label>
        <select
          id="barang"
          value={selectedBarangId ?? ""}
          onChange={(e) => setSelectedBarangId(Number(e.target.value))}
          required
          className="w-full border border-input rounded-md px-3 py-2"
        >
          {listBarang.length === 0 && <option value="">Tidak ada barang</option>}
          {listBarang.map((barang) => (
            <option key={barang.id} value={barang.id}>
              {barang.nama} (Stok: {barang.stok})
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="keperluan">Keperluan</Label>
        <Textarea
          id="keperluan"
          placeholder="Tuliskan keperluan"
          value={keperluan}
          onChange={(e) => setKeperluan(e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="tanggal">Tanggal</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="tanggal"
              variant="outline"
              className="w-full justify-start text-left"
            >
              {tanggal ? format(tanggal, "dd MMM yyyy") : "Pilih tanggal"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={tanggal}
              onSelect={setTanggal}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <Label htmlFor="jumlah">Jumlah</Label>
        <Input
          id="jumlah"
          type="number"
          placeholder="Masukkan jumlah"
          value={jumlah}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "") setJumlah("");
            else setJumlah(Number(val));
          }}
          min={1}
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Mengirim..." : "Submit"}
      </Button>
    </form>
  );
}
