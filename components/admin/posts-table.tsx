"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock data
const posts = [
  {
    id: 1,
    title: "Panduan Lengkap Analisis Sentimen YouTube",
    slug: "panduan-analisis-sentimen-youtube",
    category: "Tutorial YouTube",
    author: "Admin",
    status: "published",
    views: 1250,
    createdAt: "2024-03-15",
  },
  {
    id: 2,
    title: "Teknologi AI Terbaru 2024",
    slug: "teknologi-ai-terbaru-2024",
    category: "Teknologi AI",
    author: "Admin",
    status: "published",
    views: 890,
    createdAt: "2024-03-14",
  },
  {
    id: 3,
    title: "Strategi Marketing Digital",
    slug: "strategi-marketing-digital",
    category: "Marketing",
    author: "Admin",
    status: "draft",
    views: 0,
    createdAt: "2024-03-13",
  },
  {
    id: 4,
    title: "Cara Membuat Konten Viral",
    slug: "cara-membuat-konten-viral",
    category: "Konten Kreator",
    author: "Admin",
    status: "published",
    views: 2100,
    createdAt: "2024-03-12",
  },
  {
    id: 5,
    title: "Optimasi SEO untuk YouTube",
    slug: "optimasi-seo-youtube",
    category: "Tutorial YouTube",
    author: "Admin",
    status: "published",
    views: 1567,
    createdAt: "2024-03-11",
  },
];

export function PostsTable() {
  const [selectedPost, setSelectedPost] = useState<number | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleEdit = (id: number) => {
    setSelectedPost(id);
    setIsEditOpen(true);
  };

  const handleDelete = (id: number) => {
    setSelectedPost(id);
    setIsDeleteOpen(true);
  };

  const getStatusBadge = (status: string) => {
    if (status === "published") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
          Dipublikasikan
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
        Draft
      </span>
    );
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Postingan
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {posts.map((post, index) => (
                <motion.tr
                  key={post.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50">
                        <FileText className="h-5 w-5 text-violet-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 truncate max-w-[200px]">
                          {post.title}
                        </p>
                        <p className="text-sm text-slate-500 truncate max-w-[200px]">
                          {post.slug}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      {post.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(post.status)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-900 font-medium">{post.views.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-500">
                      {new Date(post.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(post.id)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          <p className="text-sm text-slate-500">
            Menampilkan 1-{posts.length} dari {posts.length} postingan
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" disabled>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditOpen && selectedPost && (
          <PostEditModal postId={selectedPost} onClose={() => setIsEditOpen(false)} />
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {isDeleteOpen && selectedPost && (
          <PostDeleteModal postId={selectedPost} onClose={() => setIsDeleteOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}

function PostEditModal({ postId, onClose }: { postId: number; onClose: () => void }) {
  const post = posts.find((p) => p.id === postId);
  const [formData, setFormData] = useState({
    title: post?.title || "",
    slug: post?.slug || "",
    category: "1",
    status: post?.status || "draft",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: API call to update post
    console.log("Updating post:", postId, formData);
    onClose();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-xl shadow-xl z-50 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900 font-heading">Edit Postingan</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Judul</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
              >
                <option value="1">Teknologi AI</option>
                <option value="2">Tutorial YouTube</option>
                <option value="3">Marketing</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
            >
              <option value="draft">Draft</option>
              <option value="published">Dipublikasikan</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
            <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white">
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </motion.div>
    </>
  );
}

function PostDeleteModal({ postId, onClose }: { postId: number; onClose: () => void }) {
  const post = posts.find((p) => p.id === postId);

  const handleDelete = () => {
    // TODO: API call to delete post
    console.log("Deleting post:", postId);
    onClose();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-xl shadow-xl z-50 overflow-hidden"
      >
        <div className="p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
            <Trash2 className="h-6 w-6 text-rose-600" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900 font-heading">Hapus Postingan</h3>
          <p className="mt-2 text-sm text-slate-500">
            Apakah Anda yakin ingin menghapus postingan "{post?.title}"? Tindakan ini tidak dapat dibatalkan.
          </p>

          <div className="mt-6 flex justify-center gap-3">
            <Button variant="outline" onClick={onClose}>Batal</Button>
            <Button onClick={handleDelete} className="bg-rose-600 hover:bg-rose-700 text-white">
              Hapus Postingan
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
