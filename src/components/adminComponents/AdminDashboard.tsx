import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuthStore } from "../../store/authStore";

import { userService, User } from "../../services/userService";
import {
  sessionService,
  Session,
  CreateSessionRequest,
} from "../../services/sessionService";
import { fieldReservationService } from "../../services/fieldReservationService";
import {
  messageService,
  CreateMessageRequest,
} from "../../services/messageService";
import { teamService, Team } from "../../services/teamService";

import { AdminHeader } from "./AdminHeader";
import { AdminSidebar } from "./AdminSidebar";

import { DashboardView } from "./DashboardView";
import { MembresView } from "./MembresView";
import { CoachesView } from "./CoachesView";
import { SeancesView } from "./SeancesView";
import { ReservationsView } from "./ReservationsView";
import { MessagesView } from "./messagesView";
import { AdminChatView } from "./AdminChatView";
import { PaymentsView } from "./PaymentsView";
import { SportsView } from "./SportsView";
import { CategoriesView } from "./CategoriesView";
import { TeamsView } from "./TeamsView";
import { CompetitionsView } from "./CompetitionsView";
import { SubscriptionsView } from "./SubscriptionsView";
import { sportService, Sport } from "../../services/sportService";
import { roomService, Room } from "../../services/roomService";

type AdminView =
  | "dashboard"
  | "membres"
  | "coaches"
  | "seances"
  | "reservations"
  | "messages"
  | "chat"
  | "payments"
  | "teams"
  | "subscriptions";

type MembreFormState = {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  date_of_birth: string;
  adress: string;
  gender: string;
  medical_note: string;
  teamId: string;
};

type CoachFormState = {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adress: string;
  gender: string;
  specialty: string;
  diploma: string;
  experience_years: string;
};

type SeanceFormState = {
  sessionDate: string;
  startTime: string;
  endTime: string;
  idCoach: string;
  idRoom: string;
  idTeam: string;
  sportId: string;
  categoryId: string;
};

export function AdminDashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [currentView, setCurrentView] = useState<AdminView>("dashboard");

  const [showAddMembre, setShowAddMembre] = useState(false);
  const [showAddCoach, setShowAddCoach] = useState(false);
  const [showAddSeance, setShowAddSeance] = useState(false);

  const [membres, setMembres] = useState<User[]>([]);
  const [coaches, setCoaches] = useState<User[]>([]);
  const [seances, setSeances] = useState<Session[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [reservationsLoading, setReservationsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingMembre, setEditingMembre] = useState<User | null>(null);
  const [editingCoach, setEditingCoach] = useState<User | null>(null);
  const [editingSeance, setEditingSeance] = useState<Session | null>(null);
  const [sports, setSports] = useState<Sport[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  // Pré-sélection membre côté Paiements (UX)
  const [selectedMemberForPayment, setSelectedMemberForPayment] =
    useState<User | null>(null);

  const [membreForm, setMembreForm] = useState<MembreFormState>({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    date_of_birth: "",
    adress: "",
    gender: "",
    medical_note: "",
    teamId: '',
  });

  const [coachForm, setCoachForm] = useState<CoachFormState>({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    adress: "",
    gender: "",
    specialty: "",
    diploma: "",
    experience_years: "0",
  });

  const [seanceForm, setSeanceForm] = useState<SeanceFormState>({
    sessionDate: "",
    startTime: "",
    endTime: "",
    idCoach: "",
    idRoom: "",
    idTeam: "",
    sportId: "1",
    categoryId: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        let teamsData: Team[] = [];
try {
  teamsData = await teamService.getAll();
} catch (e) {
  teamsData = [];
}
setTeams(teamsData);

        const [
          membresData,
          coachesData,
          seancesData,
          reservationsData,
          messagesData
          
        ] = await Promise.all([
          userService.getMembers(),
          userService.getCoaches(),
          sessionService.getAll(),
          fieldReservationService.getAll(),
          messageService.getAll(),
          
        ]);

        setMembres(membresData);
        setCoaches(coachesData);
        setSeances(seancesData);
        setReservations(reservationsData as any[]);
        setMessages(messagesData as any[]);
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setError("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // ---------- Membres ----------
  const resetMembreForm = () => {
    setMembreForm({
      nom: "",
      prenom: "",
      email: "",
      telephone: "",
      date_of_birth: "",
      adress: "",
      gender: "",
      medical_note: "",
      teamId: '',

    });
  };

  const handleAddMembre = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingMembre) {
        // UPDATE (garde /users/:id)
        const payload = {
          full_name: `${membreForm.prenom} ${membreForm.nom}`.trim(),
          email: membreForm.email,
          phone: membreForm.telephone || undefined,
          adress: membreForm.adress || undefined,
          date_of_birth: membreForm.date_of_birth || undefined,
          gender: membreForm.gender || undefined,
          medical_note: membreForm.medical_note || undefined,
        };

        const updated = await userService.update(editingMembre.id, payload);
        setMembres((prev) =>
          prev.map((m) => (m.id === updated.id ? updated : m))
        );
      } else {
        // CREATE via /users/members
        const payload = {
          full_name: `${membreForm.prenom} ${membreForm.nom}`.trim(),
          email: membreForm.email,
          password: "defaultPassword123",
          phone: membreForm.telephone || undefined,
          adress: membreForm.adress || undefined,
          date_of_birth: membreForm.date_of_birth || undefined,
          gender: membreForm.gender || undefined,
          medical_note: membreForm.medical_note || undefined,
        };
if (!membreForm.teamId) {
  alert("Veuillez sélectionner une équipe.");
  return;
}

        const created = await userService.createMember(payload);
await teamService.addMember(parseInt(membreForm.teamId, 10), created.id);

        // Règle métier UI: nouveau membre désactivé jusqu’au paiement
        const createdInactive = { ...created, status: "INACTIVE" as any };
        setMembres((prev) => [...prev, createdInactive]);
      }

      setShowAddMembre(false);
      setEditingMembre(null);
      resetMembreForm();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'enregistrement");
    }
  };

  const handleEditMembre = (membre: User) => {
    const [prenom, ...nomParts] = (membre.fullName || "").split(" ");
    const nom = nomParts.join(" ");

    setMembreForm({
      nom,
      prenom,
      email: membre.email || "",
      telephone: membre.phone || "",
      date_of_birth: (membre as any).date_of_birth || "",
      gender: (membre as any).gender || "",
      adress: (membre as any).adress || "",
      medical_note: (membre as any).medical_note || "",
      teamId: ((membre as any).teamId ? String((membre as any).teamId) : ''),
    });

    setEditingMembre(membre);
    setShowAddMembre(true);
  };

  const handleMembreFormChange = (
    field: keyof MembreFormState,
    value: string
  ) => {
    setMembreForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancelMembreForm = () => {
    setShowAddMembre(false);
    setEditingMembre(null);
    resetMembreForm();
  };

  const handleToggleStatutMembre = async (id: number) => {
    try {
      const membre = membres.find((m) => m.id === id);
      if (!membre) return;

      const newStatus = membre.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      const updated = await userService.updateStatus(id, { status: newStatus });

      // on garde l'objet backend comme source de vérité
      setMembres((prev) => prev.map((m) => (m.id === id ? updated : m)));
    } catch (err) {
      console.error("Erreur lors de la modification du statut:", err);
      alert("Erreur lors de la modification du statut");
    }
  };

  const handleDeleteMembre = async (id: number) => {
    if (!confirm("Voulez-vous vraiment supprimer ce membre ?")) return;

    try {
      await userService.delete(id);
      setMembres((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      alert("Erreur lors de la suppression du membre");
    }
  };

  const handleGoToPaymentForMember = (membre: User) => {
    setSelectedMemberForPayment(membre);
    setCurrentView("payments");
  };

  // Après paiement paid: activer localement (UX immédiate)
  const handlePaymentSuccess = (memberId: number) => {
    setMembres((prev) =>
      prev.map((m) =>
        m.id === memberId ? { ...m, status: "ACTIVE" as any } : m
      )
    );
  };

  // ---------- Coaches ----------
  const resetCoachForm = () => {
    setCoachForm({
      nom: "",
      prenom: "",
      email: "",
      telephone: "",
      adress: "",
      gender: "",
      specialty: "",
      diploma: "",
      experience_years: "0",
    });
  };

  const handleAddCoach = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCoach) {
        const payload = {
          full_name: `${coachForm.prenom} ${coachForm.nom}`.trim(),
          email: coachForm.email,
          phone: coachForm.telephone || undefined,
          adress: coachForm.adress || undefined,
          gender: coachForm.gender || undefined,

          // attention: ton backend/service utilise "speciality" (pas "specialty")
          speciality: coachForm.specialty || undefined,
          diploma: coachForm.diploma || undefined,
          experience_years: parseInt(coachForm.experience_years, 10) || 0,
        };

        const updated = await userService.update(editingCoach.id, payload);
        setCoaches((prev) =>
          prev.map((c) => (c.id === updated.id ? updated : c))
        );
      } else {
        const payload = {
          full_name: `${coachForm.prenom} ${coachForm.nom}`.trim(),
          email: coachForm.email,
          password: "defaultPassword123",
          phone: coachForm.telephone || undefined,
          adress: coachForm.adress || undefined,
          gender: coachForm.gender || undefined,

          speciality: coachForm.specialty || undefined,
          diploma: coachForm.diploma || undefined,
          experience_years: parseInt(coachForm.experience_years, 10) || 0,
        };

        const created = await userService.createCoach(payload);
        setCoaches((prev) => [...prev, created]);
      }

      setShowAddCoach(false);
      setEditingCoach(null);
      resetCoachForm();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'enregistrement");
    }
  };

  const handleEditCoach = (coach: User) => {
    const [prenom, ...nomParts] = (coach.fullName || "").split(" ");
    const nom = nomParts.join(" ");

    setCoachForm({
      nom,
      prenom,
      email: coach.email || "",
      telephone: coach.phone || "",
      gender: (coach as any).gender || "",
      adress: (coach as any).adress || "",
      specialty: (coach as any).speciality || (coach as any).specialty || "",
      diploma: (coach as any).diploma || "",
      experience_years: String((coach as any).experience_years ?? 0),
    });

    setEditingCoach(coach);
    setShowAddCoach(true);
  };

  const handleToggleStatutCoach = async (id: number) => {
    try {
      const coach = coaches.find((c) => c.id === id);
      if (!coach) return;

      const newStatus = coach.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      const updated = await userService.updateStatus(id, { status: newStatus });

      setCoaches((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } catch (err) {
      console.error("Erreur lors de la modification du statut:", err);
      alert("Erreur lors de la modification du statut");
    }
  };

  const handleCoachFormChange = (
    field: keyof CoachFormState,
    value: string
  ) => {
    setCoachForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancelCoachForm = () => {
    setShowAddCoach(false);
    setEditingCoach(null);
    resetCoachForm();
  };

  const handleDeleteCoach = async (id: number) => {
    if (!confirm("Voulez-vous vraiment supprimer ce coach ?")) return;

    try {
      await userService.delete(id);
      setCoaches((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      alert("Erreur lors de la suppression du coach");
    }
  };

  // ---------- Séances ----------
  const resetSeanceForm = () => {
    setSeanceForm({
      sessionDate: "",
      startTime: "",
      endTime: "",
      idCoach: "",
      idRoom: "",
      idTeam: "",
      sportId: "1",
      categoryId: "",
    });
  };

  const handleAddSeance = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: CreateSessionRequest = {
      session_date: seanceForm.sessionDate,
      start_time: seanceForm.startTime,
      end_time: seanceForm.endTime,
      id_coach: seanceForm.idCoach
        ? parseInt(seanceForm.idCoach, 10)
        : undefined,
      id_room: seanceForm.idRoom ? parseInt(seanceForm.idRoom, 10) : undefined,
      id_team: seanceForm.idTeam ? parseInt(seanceForm.idTeam, 10) : undefined,

      // Si ton backend supporte déjà ces champs, décommente:
      // id_sport: seanceForm.sportId ? parseInt(seanceForm.sportId, 10) : undefined,
      // id_category: seanceForm.categoryId ? parseInt(seanceForm.categoryId, 10) : undefined,
    };

    try {
      if (editingSeance) {
        const updated = await sessionService.update(
          (editingSeance as any).id,
          payload
        );
        setSeances((prev) =>
          prev.map((s) => ((s as any).id === (updated as any).id ? updated : s))
        );
      } else {
        const created = await sessionService.create(payload);
        setSeances((prev) => [...prev, created]);
      }

      setShowAddSeance(false);
      setEditingSeance(null);
      resetSeanceForm();
    } catch (err) {
      console.error("Erreur lors de l'enregistrement de la séance:", err);
      alert("Erreur lors de l'enregistrement de la séance");
    }
  };

  const handleEditSeance = (seance: Session) => {
    setSeanceForm({
      sessionDate: (seance as any).sessionDate,
      startTime: (seance as any).startTime,
      endTime: (seance as any).endTime,
      idCoach: (seance as any).idCoach?.toString() || "",
      idRoom: (seance as any).idRoom?.toString() || "",
      idTeam: (seance as any).idTeam?.toString() || "",
      sportId: "1",
      categoryId: "",
    });

    setEditingSeance(seance);
    setShowAddSeance(true);
  };

  const handleSeanceFormChange = (
    field: keyof SeanceFormState,
    value: string
  ) => {
    setSeanceForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancelSeanceForm = () => {
    setShowAddSeance(false);
    setEditingSeance(null);
    resetSeanceForm();
  };

  const handleDeleteSeance = async (id: number) => {
    if (!confirm("Voulez-vous vraiment supprimer cette séance ?")) return;

    try {
      await sessionService.delete(id);
      setSeances((prev) => prev.filter((s) => (s as any).id !== id));
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      alert("Erreur lors de la suppression de la séance");
    }
  };

  // ---------- Réservations ----------
  const handleUpdateReservationStatus = async (
    id: number,
    status: "acceptee" | "refusee"
  ) => {
    try {
      setReservationsLoading(true);
      const updated = await fieldReservationService.update(id, { status });
      setReservations((prev) =>
        prev.map((r: any) => (r.id === id ? updated : r))
      );
      alert(
        `Réservation ${
          status === "acceptee" ? "acceptée" : "refusée"
        } avec succès`
      );
    } catch (err) {
      console.error("Erreur lors de la mise à jour du statut:", err);
      alert("Erreur lors de la mise à jour du statut de la réservation");
    } finally {
      setReservationsLoading(false);
    }
  };

  // ---------- Messages ----------
  const handleSendMessage = async (recipientIds: number[], contenu: string) => {
    try {
      const payload: CreateMessageRequest = {
        idemetteur: (user as any).id,
        iddestinataires: recipientIds,
        contenu,
        statut: "sent",
        canreply: true,
      };

      await messageService.create(payload);
      const updatedMessages = await messageService.getAll();
      setMessages(updatedMessages as any[]);
      alert(`Message envoyé à ${recipientIds.length} destinataire(s)`);
    } catch (err) {
      console.error("Erreur lors de l'envoi du message:", err);
      alert("Erreur lors de l'envoi du message");
    }
  };

  const handleReplyMessage = async (messageId: string, contenu: string) => {
    try {
      const emetteurId = (() => {
        const m = messages.find(
          (ms) =>
            String((ms as any).id) === messageId ||
            String((ms as any).id_message) === messageId
        );
        return (
          (m as any)?.id_emetteur ||
          (m as any)?.idemetteur ||
          (m as any)?.id_emetteur
        );
      })();

      if (!emetteurId) {
        alert("Impossible de trouver le destinataire pour la réponse");
        return;
      }

      const payload: any = {
        id_emetteur: (user as any).id,
        id_destinataires: [emetteurId],
        contenu,
        statut: "sent",
        can_reply: true,
        id_messageRepondu: messageId,
      };

      await messageService.create(payload);
      const updatedMessages = await messageService.getAll((user as any).id);
      setMessages(updatedMessages as any[]);
    } catch (err) {
      console.error("Erreur lors de la réponse au message:", err);
      alert("Erreur lors de l'envoi de la réponse");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (loading) return <div className="p-6">Chargement...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader onLogout={handleLogout} />
      <div className="flex">
        <AdminSidebar
          currentView={currentView as any}
          onViewChange={(v: any) => setCurrentView(v)}
        />

        <main className="flex-1 p-6">
          {currentView === "dashboard" && (
            <DashboardView
              membres={membres}
              coaches={coaches}
              seances={seances}
              reservations={reservations}
            />
          )}

          {currentView === "membres" && (
            <MembresView
              membres={membres}
              showAddMembre={showAddMembre}
              membreForm={membreForm as any}
              isEditing={!!editingMembre}
              onToggleForm={() => setShowAddMembre(!showAddMembre)}
              onFormChange={handleMembreFormChange as any}
              onSubmit={handleAddMembre}
              onEdit={handleEditMembre}
              onToggleStatus={handleToggleStatutMembre}
              onDelete={handleDeleteMembre}
              onCancel={handleCancelMembreForm}
              onGoToPayment={handleGoToPaymentForMember}
              teams={teams}
            />
          )}

          {currentView === "coaches" && (
            <CoachesView
              coaches={coaches}
              showAddCoach={showAddCoach}
              coachForm={coachForm as any}
              isEditing={!!editingCoach}
              onToggleForm={() => setShowAddCoach(!showAddCoach)}
              onFormChange={handleCoachFormChange as any}
              onSubmit={handleAddCoach}
              onEdit={handleEditCoach}
              onToggleStatus={handleToggleStatutCoach}
              onDelete={handleDeleteCoach as any}
              onCancel={handleCancelCoachForm}
            />
          )}

          {currentView === "seances" && (
            <SeancesView
              seances={seances}
              coaches={coaches}
              sports={sports}
              rooms={rooms}
              showAddSeance={showAddSeance}
              seanceForm={seanceForm as any}
              isEditing={!!editingSeance}
              onToggleForm={() => setShowAddSeance(!showAddSeance)}
              onFormChange={handleSeanceFormChange as any}
              onSubmit={handleAddSeance}
              onEdit={handleEditSeance}
              onDelete={handleDeleteSeance}
              onCancel={handleCancelSeanceForm}
            />
          )}

          {currentView === "teams" && (
            <TeamsView
              teams={teams}
              setTeams={setTeams}
              sports={sports}
              coaches={coaches}
              // plus tard: showAddTeam, teamForm, isEditing, handlers...
            />
          )}

          {currentView === "reservations" && (
            <ReservationsView
              reservations={reservations as any}
              loading={reservationsLoading}
              onUpdateStatus={handleUpdateReservationStatus as any}
            />
          )}

          {currentView === "messages" && (
            <AdminChatView
              admin={user as any}
              membres={membres}
              coaches={coaches}
              onSendMessage={handleSendMessage}
            />
          )}

          {currentView === "chat" && <AdminChatView />}

          {currentView === "payments" && (
            <PaymentsView
              membres={membres as any}
              selectedMember={selectedMemberForPayment as any}
              onPaymentSuccess={handlePaymentSuccess}
              onBack={() => setCurrentView("membres")}
            />
          )}

          {currentView === "subscriptions" && (
            <SubscriptionsView
              membres={membres}
            />
          )}
        </main>
      </div>
    </div>
  );
}
