import { FileText, Upload } from "lucide-react";
import { mockDocuments } from "../../mock/MockData";

export default function PatientDocuments() {
  return (
    <section>
      <h2 className="mb-6 text-2xl font-bold">Medical Documents</h2>
      <div className="mb-6 rounded-lg border border-border bg-card p-6">
        <div className="rounded-lg border-2 border-dashed border-border p-8 text-center">
          <Upload className="mx-auto mb-4 text-muted-foreground" size={48} />
          <h3 className="mb-2 font-semibold">Upload Documents</h3>
          <p className="mb-4 text-muted-foreground">Upload medical records, lab results, or prescriptions</p>
          <button className="rounded-lg bg-primary px-6 py-3 text-primary-foreground transition-opacity hover:opacity-90">Choose Files</button>
        </div>
      </div>
      <div className="space-y-3">
        <h3 className="mb-4 font-semibold">Uploaded Documents</h3>
        {mockDocuments.map((document) => (
          <div key={document.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3"><FileText className="text-primary" size={24} /><div><p className="font-medium">{document.name}</p><p className="text-sm text-muted-foreground">{document.uploadDate}</p></div></div>
            <div className="flex gap-2"><button className="rounded border border-border px-3 py-1 text-sm transition-colors hover:bg-accent">View</button><button className="rounded px-3 py-1 text-sm text-destructive transition-colors hover:bg-destructive/10">Delete</button></div>
          </div>
        ))}
      </div>
    </section>
  );
}