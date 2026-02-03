"use client";

import React, { useState, useTransition, useRef } from 'react';
import Image from 'next/image';
import {
    User,
    Phone,
    Briefcase,
    GraduationCap,
    Plus,
    Trash2,
    ChevronRight,
    Save,
    Camera,
    Loader2,
    Check
} from 'lucide-react';
import { selectAvatar, uploadAvatar } from '@app/actions/profile';

const CVEditor = ({ data, onChange }: { data: any, onChange: (newData: any) => void }) => {
    const [activeTab, setActiveTab] = useState('personal');
    const [isUploading, startUploadTransition] = useTransition();
    const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
    const fileInputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

    const updatePersonal = (field: string, value: string) => {
        onChange({
            ...data,
            personalInfo: { ...data.personalInfo, [field]: value }
        });
    };

    const handlePhotoClick = async (idx: number, photoUrl: string) => {
        if (photoUrl) {
            startUploadTransition(async () => {
                const result = await selectAvatar(photoUrl);
                if (result.success) {
                    onChange({
                        ...data,
                        personalInfo: { ...data.personalInfo, photo: photoUrl }
                    });
                } else {
                    alert('Error al seleccionar: ' + result.error);
                }
            });
        } else {
            fileInputRefs[idx].current?.click();
        }
    };

    const handleFileChange = async (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert('Archivo demasiado grande (máx. 5MB)');
            return;
        }

        setUploadingSlot(idx);
        startUploadTransition(async () => {
            const formData = new FormData();
            formData.append('avatar', file);
            formData.append('slotIndex', idx.toString());

            const result = await uploadAvatar(formData);
            if (result.success && result.url) {
                const newPhotos = [...(data.personalInfo.photos || ['', '', ''])];
                newPhotos[idx] = result.url;
                onChange({
                    ...data,
                    personalInfo: {
                        ...data.personalInfo,
                        photos: newPhotos,
                        photo: result.url
                    }
                });
            } else {
                alert('Error al subir: ' + result.error);
            }
            setUploadingSlot(null);
        });
    };

    const updateContact = (id: number, value: string) => {
        const newContact = data.personalInfo.contactInfo.map((ci: any) =>
            ci.id === id ? { ...ci, value } : ci
        );
        onChange({
            ...data,
            personalInfo: { ...data.personalInfo, contactInfo: newContact }
        });
    };

    // ... Skills, Experience, Education update functions remain same or similar
    const updateSkill = (index: number, value: string) => {
        const newSkills = [...data.skills.professional];
        newSkills[index] = value;
        onChange({ ...data, skills: { professional: newSkills } });
    };

    const addSkill = () => {
        onChange({
            ...data,
            skills: { professional: [...data.skills.professional, 'Nueva Habilidad'] }
        });
    };

    const removeSkill = (index: number) => {
        const newSkills = data.skills.professional.filter((_: any, i: number) => i !== index);
        onChange({ ...data, skills: { professional: newSkills } });
    };

    const updateExperience = (id: number, field: string, value: any) => {
        const newExp = data.experience.map((exp: any) =>
            exp.id === id ? { ...exp, [field]: value } : exp
        );
        onChange({ ...data, experience: newExp });
    };

    const addExperience = () => {
        const newId = Math.max(...data.experience.map((e: any) => e.id), 0) + 1;
        const newExp = {
            id: newId,
            period: "20XX — 20XX",
            title: "PUESTO — EMPRESA",
            description: "Descripción del puesto...",
            bullets: ["Logro 1", "Logro 2"]
        };
        onChange({ ...data, experience: [...data.experience, newExp] });
    };

    const removeExperience = (id: number) => {
        onChange({ ...data, experience: data.experience.filter((e: any) => e.id !== id) });
    };

    const updateEducation = (id: number, field: string, value: string) => {
        const newEdu = data.education.map((edu: any) =>
            edu.id === id ? { ...edu, [field]: value } : edu
        );
        onChange({ ...data, education: newEdu });
    };

    const addEducation = () => {
        const newId = Math.max(...data.education.map((e: any) => e.id), 0) + 1;
        const newEdu = {
            id: newId,
            period: "20XX — 20XX",
            degree: "TÍTULO",
            institution: "INSTITUCIÓN"
        };
        onChange({ ...data, education: [...data.education, newEdu] });
    };

    const removeEducation = (id: number) => {
        onChange({ ...data, education: data.education.filter((e: any) => e.id !== id) });
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-[600px] flex flex-col md:flex-row">
            {/* Sidebar Tabs */}
            <div className="w-full md:w-64 bg-gray-50 border-r border-gray-100 p-6 flex flex-col gap-2">
                <button
                    onClick={() => setActiveTab('personal')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'personal' ? 'bg-white shadow-sm text-foreground' : 'text-gray-500 hover:bg-white/50'}`}
                >
                    <User size={18} /> Personal
                </button>
                <button
                    onClick={() => setActiveTab('skills')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'skills' ? 'bg-white shadow-sm text-foreground' : 'text-gray-500 hover:bg-white/50'}`}
                >
                    <Plus size={18} /> Habilidades
                </button>
                <button
                    onClick={() => setActiveTab('experience')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'experience' ? 'bg-white shadow-sm text-foreground' : 'text-gray-500 hover:bg-white/50'}`}
                >
                    <Briefcase size={18} /> Experiencia
                </button>
                <button
                    onClick={() => setActiveTab('education')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'education' ? 'bg-white shadow-sm text-foreground' : 'text-gray-500 hover:bg-white/50'}`}
                >
                    <GraduationCap size={18} /> Educación
                </button>

                <div className="mt-auto pt-6 border-t border-gray-200">
                    <div className="p-4 bg-foreground/5 rounded-2xl border border-foreground/10">
                        <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-1">Status</p>
                        <p className="text-sm font-bold text-foreground flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            Edición Activa
                        </p>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-8 overflow-y-auto max-h-[800px] custom-scrollbar">
                {activeTab === 'personal' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                        <h3 className="text-xl font-bold font-display uppercase tracking-widest border-b pb-4">Info Personal</h3>

                        {/* Photo Selection Section */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Camera size={16} /> Fotos de Perfil (Máx 3)
                                </h4>
                                {isUploading && <Loader2 size={16} className="animate-spin text-foreground" />}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                {[0, 1, 2].map((idx) => {
                                    const photoUrl = data.personalInfo.photos?.[idx] || '';
                                    const isActive = data.personalInfo.photo === photoUrl && photoUrl !== '';
                                    const isLoading = uploadingSlot === idx;

                                    return (
                                        <div key={idx} className="relative group">
                                            <input
                                                type="file"
                                                ref={fileInputRefs[idx]}
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => handleFileChange(idx, e)}
                                            />
                                            <div
                                                onClick={() => !isLoading && handlePhotoClick(idx, photoUrl)}
                                                className={`relative aspect-[4/5] rounded-2xl overflow-hidden border-2 transition-all cursor-pointer shadow-sm ${isActive ? 'border-foreground ring-4 ring-foreground/5' : 'border-gray-100 hover:border-gray-300'} ${isLoading ? 'opacity-50' : 'opacity-100'}`}
                                            >
                                                {photoUrl ? (
                                                    <>
                                                        <Image
                                                            src={photoUrl}
                                                            alt={`Profile ${idx + 1}`}
                                                            fill
                                                            className="object-cover transition-transform group-hover:scale-110"
                                                        />
                                                        {isActive && (
                                                            <div className="absolute top-2 right-2 bg-foreground text-white p-1 rounded-full shadow-lg">
                                                                <Check size={12} strokeWidth={4} />
                                                            </div>
                                                        )}
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); fileInputRefs[idx].current?.click(); }}
                                                                className="bg-white/20 backdrop-blur-md text-white p-2 rounded-full hover:bg-white/40"
                                                            >
                                                                <Camera size={16} />
                                                            </button>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center text-gray-300 gap-2 border-2 border-dashed border-gray-100">
                                                        <Plus size={24} />
                                                        <span className="text-[10px] font-bold uppercase tracking-widest">Subir</span>
                                                    </div>
                                                )}

                                                {isLoading && (
                                                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                                                        <Loader2 size={24} className="animate-spin text-foreground" />
                                                    </div>
                                                )}
                                            </div>
                                            {photoUrl && (
                                                <div className="mt-2 text-center">
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-foreground' : 'text-gray-300'}`}>
                                                        {isActive ? 'Foto Actual' : 'Disponible'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            <p className="text-[10px] text-gray-400 italic bg-gray-50 p-3 rounded-xl border border-gray-100">
                                Tip: Haz clic en una foto existente para seleccionarla, o en los espacios vacíos para subir una nueva desde tu dispositivo.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Nombre</label>
                                <input
                                    value={data.personalInfo.name}
                                    onChange={(e) => updatePersonal('name', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-foreground/5 focus:border-foreground"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Apellido</label>
                                <input
                                    value={data.personalInfo.lastName}
                                    onChange={(e) => updatePersonal('lastName', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-foreground/5 focus:border-foreground"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Rol / Cargo</label>
                                <input
                                    value={data.personalInfo.role}
                                    onChange={(e) => updatePersonal('role', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-foreground/5 focus:border-foreground"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Contacto</h4>
                            <div className="grid grid-cols-1 gap-3">
                                {data.personalInfo.contactInfo.map((ci: any) => (
                                    <div key={ci.id} className="flex gap-4 items-center">
                                        <div className="w-24 text-[10px] font-black uppercase text-gray-400 tracking-tighter shrink-0">{ci.type}</div>
                                        <input
                                            value={ci.value}
                                            onChange={(e) => updateContact(ci.id, e.target.value)}
                                            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-foreground/5 focus:border-foreground"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Objetivo Profesional</h4>
                            <textarea
                                value={data.objective}
                                onChange={(e) => onChange({ ...data, objective: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-foreground/5 focus:border-foreground min-h-[120px] resize-none"
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'skills' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex justify-between items-center border-b pb-4">
                            <h3 className="text-xl font-bold font-display uppercase tracking-widest">Habilidades</h3>
                            <button onClick={addSkill} className="p-2 bg-foreground text-white rounded-lg hover:bg-gray-800 transition-colors">
                                <Plus size={20} />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {data.skills.professional.map((skill: string, index: number) => (
                                <div key={index} className="group flex items-center gap-2 bg-gray-50 p-1 pl-4 rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-foreground/5 focus-within:border-foreground transition-all">
                                    <input
                                        value={skill}
                                        onChange={(e) => updateSkill(index, e.target.value)}
                                        className="flex-1 py-2 bg-transparent outline-none text-sm font-medium text-gray-700"
                                        placeholder="Habilidad..."
                                    />
                                    <button
                                        onClick={() => removeSkill(index)}
                                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all active:scale-90"
                                        title="Eliminar habilidad"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'experience' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex justify-between items-center border-b pb-4">
                            <h3 className="text-xl font-bold font-display uppercase tracking-widest">Experiencia</h3>
                            <button onClick={addExperience} className="p-2 bg-foreground text-white rounded-lg hover:bg-gray-800 transition-colors">
                                <Plus size={20} />
                            </button>
                        </div>
                        <div className="space-y-12">
                            {data.experience.map((exp: any) => (
                                <div key={exp.id} className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100 relative group">
                                    <button
                                        onClick={() => removeExperience(exp.id)}
                                        className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Periodo</label>
                                            <input
                                                value={exp.period}
                                                onChange={(e) => updateExperience(exp.id, 'period', e.target.value)}
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-foreground/5 focus:border-foreground"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Cargo — Empresa</label>
                                            <input
                                                value={exp.title}
                                                onChange={(e) => updateExperience(exp.id, 'title', e.target.value)}
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-foreground/5 focus:border-foreground"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Descripción Corta</label>
                                            <textarea
                                                value={exp.description}
                                                onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-foreground/5 focus:border-foreground min-h-[80px] resize-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Logros (uno por línea)</label>
                                            <textarea
                                                value={exp.bullets.join('\n')}
                                                onChange={(e) => updateExperience(exp.id, 'bullets', e.target.value.split('\n'))}
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-foreground/5 focus:border-foreground min-h-[100px] resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'education' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex justify-between items-center border-b pb-4">
                            <h3 className="text-xl font-bold font-display uppercase tracking-widest">Educación</h3>
                            <button onClick={addEducation} className="p-2 bg-foreground text-white rounded-lg hover:bg-gray-800 transition-colors">
                                <Plus size={20} />
                            </button>
                        </div>
                        <div className="space-y-8">
                            {data.education.map((edu: any) => (
                                <div key={edu.id} className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100 relative group">
                                    <button
                                        onClick={() => removeEducation(edu.id)}
                                        className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Periodo</label>
                                            <input
                                                value={edu.period}
                                                onChange={(e) => updateEducation(edu.id, 'period', e.target.value)}
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-foreground/5 focus:border-foreground"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Título</label>
                                            <input
                                                value={edu.degree}
                                                onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-foreground/5 focus:border-foreground"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Institución</label>
                                            <input
                                                value={edu.institution}
                                                onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-foreground/5 focus:border-foreground"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CVEditor;
