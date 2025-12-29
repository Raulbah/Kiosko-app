"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, Plus } from "lucide-react";
import { createModifierGroupAction, deleteModifierGroupAction, createModifierOptionAction, deleteModifierOptionAction } from "@/lib/actions/modifier-actions";
import { toast } from "sonner";

interface ModifierManagerProps {
    productId: string;
    initialGroups: any[];
}

export function ModifierManager({ productId, initialGroups }: ModifierManagerProps) {
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

    // --- HANDLERS GRUPOS ---
    const handleCreateGroup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const res = await createModifierGroupAction(productId, formData);
        if (res.success) {
            toast.success(res.message);
            setIsGroupModalOpen(false);
        } else toast.error(res.message);
    };

    const handleDeleteGroup = async (groupId: string) => {
        if(!confirm("¿Borrar grupo y sus opciones?")) return;
        const res = await deleteModifierGroupAction(groupId, productId);
        if (res.success) toast.success(res.message);
        else toast.error(res.message);
    };

    // --- HANDLERS OPCIONES ---
    const handleCreateOption = async (e: React.FormEvent<HTMLFormElement>, groupId: string) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);
        const res = await createModifierOptionAction(groupId, productId, formData);
        if (res.success) {
            toast.success(res.message);
            form.reset(); // Limpiar inputs para agregar otro rápido
        } else toast.error(res.message);
    };

    const handleDeleteOption = async (optionId: string) => {
        const res = await deleteModifierOptionAction(optionId, productId);
        if (!res.success) toast.error(res.message);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Grupos de Modificadores</h2>
                <Dialog open={isGroupModalOpen} onOpenChange={setIsGroupModalOpen}>
                    <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4"/> Nuevo Grupo</Button></DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Crear Grupo de Toppings</DialogTitle></DialogHeader>
                        <form onSubmit={handleCreateGroup} className="space-y-4">
                            <div>
                                <Label>Nombre (Ej. Salsas)</Label>
                                <Input name="name" required placeholder="Salsas, Toppings..." />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><Label>Min. Selección</Label><Input type="number" name="minSelect" defaultValue={0} /></div>
                                <div><Label>Max. Selección</Label><Input type="number" name="maxSelect" defaultValue={1} /></div>
                                <div><Label>Incluidos Gratis</Label><Input type="number" name="includedSelect" defaultValue={0} /></div>
                                <div><Label>Precio Extra ($)</Label><Input type="number" name="extraPrice" step="0.5" defaultValue={0} /></div>
                            </div>
                            <Button type="submit" className="w-full">Crear Grupo</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {initialGroups.length === 0 ? (
                <div className="text-center p-10 border border-dashed rounded bg-slate-50 text-slate-500">
                    Este producto no tiene modificadores configurados.
                </div>
            ) : (
                <Accordion type="multiple" className="space-y-4">
                    {initialGroups.map((group) => (
                        <AccordionItem key={group.id} value={group.id} className="border rounded-lg bg-white px-4">
                            <div className="flex items-center justify-between py-2">
                                <AccordionTrigger className="hover:no-underline flex-1">
                                    <span className="font-bold text-lg">{group.name}</span>
                                    <span className="ml-4 text-xs font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                        Min: {group.minSelect} | Max: {group.maxSelect} | Gratis: {group.includedSelect}
                                    </span>
                                </AccordionTrigger>
                                <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); handleDeleteGroup(group.id); }}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            
                            <AccordionContent>
                                <div className="pl-4 border-l-2 border-slate-100 space-y-4">
                                    {/* Lista de Opciones Existentes */}
                                    <div className="space-y-2">
                                        {group.options.map((opt: any) => (
                                            <div key={opt.id} className="flex justify-between items-center bg-slate-50 p-2 rounded border">
                                                <span className="font-medium">{opt.name}</span>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-sm font-mono">${Number(opt.price).toFixed(2)}</span>
                                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-400" onClick={() => handleDeleteOption(opt.id)}>
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                        {group.options.length === 0 && <p className="text-xs text-slate-400 italic">Sin opciones aún.</p>}
                                    </div>

                                    {/* Formulario Inline para agregar Opción */}
                                    <form onSubmit={(e) => handleCreateOption(e, group.id)} className="flex gap-2 items-end pt-2 border-t mt-2">
                                        <div className="flex-1">
                                            <Input name="name" placeholder="Nombre opción (ej. Queso)" className="h-8 text-sm" required />
                                        </div>
                                        <div className="w-24">
                                            <Input name="price" type="number" step="0.5" placeholder="$0.00" className="h-8 text-sm" defaultValue={0} />
                                        </div>
                                        <Button type="submit" size="sm" className="h-8"><Plus className="h-3 w-3 mr-1"/> Agregar</Button>
                                    </form>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            )}
        </div>
    );
}