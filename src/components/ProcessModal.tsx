import { useRef, useEffect } from 'react';
import type { Process } from '../types';
import { ICONS } from '../constants';

interface ProcessModalProps {
    show: boolean;
    processes: Process[];
    onClose: () => void;
    onAdd: (name: string) => void;
    onDelete: (id: string) => void;
}

export default function ProcessModal({
    show,
    processes,
    onClose,
    onAdd,
    onDelete,
}: ProcessModalProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!show) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [show, onClose]);

    if (!show) return null;

    const handleAdd = () => {
        const el = inputRef.current;
        if (el && el.value) {
            onAdd(el.value);
            el.value = '';
        }
    };

    return (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="process-modal-title">
            <div className="flex max-h-[90vh] w-[90%] max-w-[600px] flex-col rounded-2xl bg-white p-8 shadow-2xl">
                <div className="mb-6 flex items-center justify-between">
                    <h2 id="process-modal-title" className="m-0 text-xl font-bold text-slate-800">Manage Processes</h2>
                    <button className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100" onClick={onClose} autoFocus><ICONS.x size={16} /></button>
                </div>
                <div className="mb-6 flex gap-2">
                    <input type="text" ref={inputRef} id="new-process-name" placeholder="New process name..." />
                    <button className="btn btn-primary whitespace-nowrap px-6" onClick={handleAdd}>Add Process</button>
                </div>
                <div className="table-responsive">
                    <table className="table">
                        <tbody className="divide-y divide-slate-100">
                            {processes.map(p => (
                                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="font-medium text-slate-700">{p.process_name}</td>
                                    <td className="w-10 text-right">
                                        <button className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors" onClick={() => onDelete(p.id)}><ICONS.trash size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                            {processes.length === 0 && <tr><td colSpan={2} className="p-8 text-center text-sm italic text-slate-400">No processes.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}