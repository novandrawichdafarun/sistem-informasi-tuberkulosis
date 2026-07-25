import { PasienData } from "./pasien";
import { PemeriksaanKlinisData } from "./pemeriksaanKlinis";
import { PemeriksaanLabData } from "./pemeriksaanLab";
import { AdherenceSummary } from "./pasienPortal";

export interface EpisodeRingkas {
  id_episode: number;
  tanggal_mulai: string | null;
  tanggal_selesai: string | null;
  tipe_pasien: string | null;
  status_episode: string;
}

export interface PasienDetail {
  profil: PasienData;
  episodes: EpisodeRingkas[];
  vitals: PemeriksaanKlinisData[];
  lab: PemeriksaanLabData[];
  adherence: AdherenceSummary;
}
