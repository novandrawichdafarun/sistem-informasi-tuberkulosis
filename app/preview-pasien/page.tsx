import PatientShell from "@/components/dashboard/PatientShell";
import MedicationBanner from "@/components/dashboard/MedicationBanner";
import PatientOverview from "@/components/dashboard/PatientOverview";

// TEMPORARY preview route for visual verification only. Safe to delete.
export default function PreviewPasienPage() {
  return (
    <PatientShell
      user={{ name: "Budi Santoso", roleLabel: "Pasien", phase: "Fase Intensif" }}
    >
      <MedicationBanner />
      <PatientOverview />
    </PatientShell>
  );
}
