'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { FileText, Upload, Trash2, Loader2, ExternalLink, X, Plus } from 'lucide-react'
import { getDocuments, uploadDocument, deleteDocument } from '@app/actions/documents'

export default function DocumentManager({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const [documents, setDocuments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isUploading, startUploadTransition] = useTransition()

    useEffect(() => {
        if (isOpen) {
            loadDocs()
        }
    }, [isOpen])

    async function loadDocs() {
        setLoading(true)
        const docs = await getDocuments()
        setDocuments(docs)
        setLoading(false)
    }

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        startUploadTransition(async () => {
            const formData = new FormData()
            formData.append('file', file)
            const result = await uploadDocument(formData)
            if (result.success) {
                loadDocs()
            } else {
                alert(result.error)
            }
        })
    }

    const handleDelete = async (id: string, url: string) => {
        if (!confirm('¿Estás seguro de eliminar este documento?')) return

        // Extract path from URL
        const path = url.split('/assets/')[1]

        const result = await deleteDocument(id, path)
        if (result.success) {
            loadDocs()
        } else {
            alert(result.error)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 no-print">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                            <FileText size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-foreground">Mis Documentos</h3>
                            <p className="text-xs text-gray-400 font-medium">Gestiona tus certificados y títulos</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 min-h-[300px] max-h-[500px] overflow-y-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
                            <Loader2 size={32} className="animate-spin" />
                            <p className="text-sm font-medium">Cargando documentos...</p>
                        </div>
                    ) : documents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                                <FileText size={32} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-500">No tienes documentos aún</p>
                                <p className="text-xs text-gray-400 mt-1">Sube tus certificados para tenerlos a mano</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {documents.map((doc) => (
                                <div key={doc.id} className="group flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-primary/20 hover:bg-primary/5 transition-all">
                                    <div className="flex items-center gap-4 overflow-hidden">
                                        <div className="w-10 h-10 bg-white rounded-lg border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors">
                                            <FileText size={20} />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-sm font-bold text-foreground truncate">{doc.name}</p>
                                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                                                {new Date(doc.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <a
                                            href={doc.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 text-gray-400 hover:text-primary hover:bg-white rounded-lg transition-all"
                                        >
                                            <ExternalLink size={18} />
                                        </a>
                                        <button
                                            onClick={() => handleDelete(doc.id, doc.file_url)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer / Upload Area */}
                <div className="p-6 bg-gray-50 border-t border-gray-100">
                    <label className="relative flex items-center justify-center gap-3 w-full py-4 bg-primary text-white rounded-2xl font-bold text-sm cursor-pointer hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-[0.98]">
                        <input
                            type="file"
                            className="hidden"
                            onChange={handleUpload}
                            disabled={isUploading}
                        />
                        {isUploading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Subiendo...
                            </>
                        ) : (
                            <>
                                <Upload size={18} />
                                Subir Nuevo Documento
                            </>
                        )}
                    </label>
                </div>
            </div>
        </div>
    )
}
