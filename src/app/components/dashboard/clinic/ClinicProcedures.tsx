"use client";

import { FormEvent, useState } from 'react';
import { Edit, Plus, Trash2, X } from 'lucide-react';
import { DashboardList } from './ClinicDoctors';
import type { ClinicProcedureRecord, MedicalProcedureOption } from '../../../dashboard/clinic/page';

export default function ClinicProcedures({ procedures, procedureOptions, onAddProcedure }: { procedures: ClinicProcedureRecord[]; procedureOptions: MedicalProcedureOption[]; onAddProcedure: (procedureId: string, startingPrice: number) => Promise<void> }) {
	const [isAdding, setIsAdding] = useState(false);
	const [procedureId, setProcedureId] = useState('');
	const [startingPrice, setStartingPrice] = useState('');
	const [error, setError] = useState('');
	const [saving, setSaving] = useState(false);

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
		<div className="space-y-4">{procedures.length === 0 && <p className="text-muted-foreground">No procedures found for this clinic.</p>}{procedures.map((procedure) => <div key={procedure.id} className="rounded-lg border border-border bg-card p-6"><div className="mb-4 flex items-start justify-between"><div><h3 className="mb-1 text-xl font-semibold">{procedure.procedure?.name || 'Procedure'}</h3><p className="text-sm text-muted-foreground">{procedure.procedure?.description || 'No description available.'}</p></div><div className="flex gap-2"><button aria-label="Edit procedure" className="rounded-lg p-2 hover:bg-accent"><Edit size={18} /></button><button aria-label="Delete procedure" className="rounded-lg p-2 text-destructive hover:bg-destructive/10"><Trash2 size={18} /></button></div></div><div className="grid gap-4 md:grid-cols-3"><Metric label="Price" value={`$${Number(procedure.starting_price || 0).toLocaleString()}`} primary /><Metric label="Duration" value={procedure.procedure?.duration_minutes ? `${procedure.procedure.duration_minutes} minutes` : 'Not specified'} /></div></div>)}</div>
	</DashboardList>;
}
function Metric({ label, value, primary = false }: { label: string; value: string; primary?: boolean }) { return <div><p className="text-sm text-muted-foreground">{label}</p><p className={`${primary ? 'text-lg text-primary' : ''} font-semibold`}>{value}</p></div>; }