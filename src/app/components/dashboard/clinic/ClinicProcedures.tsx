"use client";

import { FormEvent, useState } from 'react';
import { Edit, Trash2, X } from 'lucide-react';
import { DashboardList } from './ClinicDoctors';
import type { ClinicProcedureRecord, MedicalProcedureOption } from '../../../dashboard/clinic/page';

type ClinicProceduresProps = {
	procedures: ClinicProcedureRecord[];
	procedureOptions: MedicalProcedureOption[];
	onAddProcedure: (procedureId: string, startingPrice: number) => Promise<void>;
	onUpdateProcedure: (clinicProcedureId: string, startingPrice: number) => Promise<void>;
	onDeleteProcedure: (clinicProcedureId: string) => Promise<void>;
};

export default function ClinicProcedures({ procedures, procedureOptions, onAddProcedure, onUpdateProcedure, onDeleteProcedure }: ClinicProceduresProps) {
	const [isAdding, setIsAdding] = useState(false);
	const [procedureId, setProcedureId] = useState('');
	const [startingPrice, setStartingPrice] = useState('');
	const [error, setError] = useState('');
	const [saving, setSaving] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editPrice, setEditPrice] = useState('');
	const [pendingId, setPendingId] = useState<string | null>(null);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError('');
		setSaving(true);
		try {
			await onAddProcedure(procedureId, Number(startingPrice));
			setIsAdding(false);
			setProcedureId('');
			setStartingPrice('');
		} catch (addError) {
			setError(addError instanceof Error ? addError.message : 'The procedure could not be added.');
		} finally {
			setSaving(false);
		}
	};

	const handleUpdate = async (clinicProcedureId: string) => {
		const price = Number(editPrice);
		if (!Number.isFinite(price) || price < 0) {
			setError('Enter a valid price of 0 or more.');
			return;
		}

		setError('');
		setPendingId(clinicProcedureId);
		try {
			await onUpdateProcedure(clinicProcedureId, price);
			setEditingId(null);
		} catch (updateError) {
			setError(updateError instanceof Error ? updateError.message : 'The procedure could not be updated.');
		} finally {
			setPendingId(null);
		}
	};

	const handleDelete = async (procedure: ClinicProcedureRecord) => {
		const name = procedure.procedure?.name || 'this procedure';
		if (!window.confirm(`Are you sure you want to remove "${name}" from your clinic?`)) return;

		setError('');
		setPendingId(procedure.id);
		try {
			await onDeleteProcedure(procedure.id);
		} catch (deleteError) {
			setError(deleteError instanceof Error ? deleteError.message : 'The procedure could not be removed.');
		} finally {
			setPendingId(null);
		}
	};

	return <DashboardList title="Procedures" action="Add Procedure" onAction={() => setIsAdding(true)}>
		{isAdding && <div className="mb-5 rounded-lg border border-border bg-card p-6">
			<div className="mb-4 flex items-center justify-between"><h3 className="text-lg font-semibold">Add procedure</h3><button type="button" onClick={() => setIsAdding(false)} aria-label="Close add procedure form" className="rounded-lg p-2 hover:bg-accent"><X size={18} /></button></div>
			<form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-[1fr_180px_auto] md:items-end">
				<label className="text-sm font-medium">Procedure<select required value={procedureId} onChange={(event) => setProcedureId(event.target.value)} className="mt-1.5 w-full rounded-lg border border-border bg-input-background px-3 py-2.5 font-normal"><option value="">Select a procedure</option>{procedureOptions.filter((option) => !procedures.some((procedure) => procedure.procedure_id === option.id)).map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</select></label>
				<label className="text-sm font-medium">Starting price<input required min="0" step="0.01" type="number" value={startingPrice} onChange={(event) => setStartingPrice(event.target.value)} className="mt-1.5 w-full rounded-lg border border-border bg-input-background px-3 py-2.5 font-normal" /></label>
				<button disabled={saving} type="submit" className="rounded-lg bg-primary px-4 py-2.5 text-primary-foreground disabled:opacity-50">{saving ? 'Adding...' : 'Add'}</button>
			</form>
			{error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
		</div>}
		{error && !isAdding && <p role="alert" className="mb-4 text-sm text-destructive">{error}</p>}
		<div className="space-y-4">{procedures.length === 0 && <p className="text-muted-foreground">No procedures found for this clinic.</p>}{procedures.map((procedure) => {
			const isEditing = editingId === procedure.id;
			const isPending = pendingId === procedure.id;
			return <div key={procedure.id} className="rounded-lg border border-border bg-card p-6">
				<div className="mb-4 flex items-start justify-between"><div><h3 className="mb-1 text-xl font-semibold">{procedure.procedure?.name || 'Procedure'}</h3><p className="text-sm text-muted-foreground">{procedure.procedure?.description || 'No description available.'}</p></div><div className="flex gap-2">
					<button type="button" aria-label={`Edit ${procedure.procedure?.name || 'procedure'} price`} disabled={isPending || (editingId !== null && !isEditing)} onClick={() => { setError(''); setEditingId(procedure.id); setEditPrice(String(procedure.starting_price ?? 0)); }} className="rounded-lg p-2 hover:bg-accent disabled:opacity-50"><Edit size={18} /></button>
					<button type="button" aria-label={`Delete ${procedure.procedure?.name || 'procedure'}`} disabled={isPending || editingId !== null} onClick={() => void handleDelete(procedure)} className="rounded-lg p-2 text-destructive hover:bg-accent disabled:opacity-50"><Trash2 size={18} /></button>
				</div></div>
				<div className="grid gap-4 md:grid-cols-3">
					{isEditing ? <div><label htmlFor={`procedure-price-${procedure.id}`} className="text-sm text-muted-foreground">Starting price</label><div className="mt-1 flex items-center gap-2"><span className="font-semibold">$</span><input id={`procedure-price-${procedure.id}`} type="number" min="0" step="0.01" value={editPrice} onChange={(event) => setEditPrice(event.target.value)} className="w-full rounded-lg border border-border bg-input-background px-3 py-2" /></div><div className="mt-3 flex gap-2"><button type="button" disabled={isPending} onClick={() => void handleUpdate(procedure.id)} className="rounded-lg bg-primary px-3 py-1.5 text-sm text-primary-foreground disabled:opacity-50">{isPending ? 'Saving...' : 'Save'}</button><button type="button" disabled={isPending} onClick={() => { setEditingId(null); setError(''); }} className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-50">Cancel</button></div></div> : <Metric label="Price" value={`$${Number(procedure.starting_price || 0).toLocaleString()}`} primary />}
					<Metric label="Duration" value={procedure.procedure?.duration_minutes ? `${procedure.procedure.duration_minutes} minutes` : 'Not specified'} />
				</div>
			</div>;
		})}</div>
	</DashboardList>;
}
function Metric({ label, value, primary = false }: { label: string; value: string; primary?: boolean }) { return <div><p className="text-sm text-muted-foreground">{label}</p><p className={`${primary ? 'text-lg text-primary' : ''} font-semibold`}>{value}</p></div>; }
