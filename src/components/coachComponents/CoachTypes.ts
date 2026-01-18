export type CoachView = 'seances' | 'absences' | 'messages';

export interface Seance {
  id: string;
  sport: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  capacite: number;
  inscrits: string[];
}

export interface Membre {
  id: string;
  nom: string;
  prenom: string;
}

export interface Absence {
  id: string;
  seanceId: string;
  membreId: string;
  membreNom: string;
  date: string;
  sport: string;
  enregistrePar: string;
}

export interface Message {
  id: string;
  expediteur: string;
  expediteurRole: string;
  contenu: string;
  date: string;
  reponses?: Message[];
}