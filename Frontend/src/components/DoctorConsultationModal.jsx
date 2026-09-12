import { useState, useEffect, useRef } from "react";
import Modal from "./Modal";
import { toast } from "react-toastify";
import {
  Mic, Square, Play, Trash2, Edit3, Sparkles, CheckCircle, Save, AlertTriangle, FileText, Calendar, User, RefreshCw, Clock
} from "lucide-react";
import {
  getConsultation, setPatientConsent, uploadAndTranscribeAudio, generateAIDraft, updateConsultationDraft, approveConsultation
} from "../services/consultationService";
import { getPatientMedicalRecords } from "../services/medicalRecordService";
import AddEditPrescriptionModal from "./AddEditPrescriptionModal";

function DoctorConsultationModal({ isOpen, onClose, appointment, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [consent, setConsent] = useState(false);
  
  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);

  // Transcript & Draft state
  const [transcript, setTranscript] = useState("");
  const [isEditingTranscript, setIsEditingTranscript] = useState(false);
  const [draft, setDraft] = useState({
    chief_complaint: "",
    symptoms: "",
    diagnosis: "",
    clinical_notes: "",
    recommended_tests: "",
    treatment_notes: "",
    follow_up_date: "",
    remarks: ""
  });
  
  const [previousHistory, setPreviousHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [status, setStatus] = useState("DRAFT");
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isOpen && appointment?.id) {
      loadConsultationData();
      if (appointment.patient_id) {
        loadPatientHistory(appointment.patient_id);
      }
    } else {
      resetState();
    }
  }, [isOpen, appointment]);

  const resetState = () => {
    setConsent(false);
    setIsRecording(false);
    setRecordingTime(0);
    setAudioBlob(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setTranscript("");
    setIsEditingTranscript(false);
    setDraft({
      chief_complaint: "",
      symptoms: "",
      diagnosis: "",
      clinical_notes: "",
      recommended_tests: "",
      treatment_notes: "",
      follow_up_date: "",
      remarks: ""
    });
    setStatus("DRAFT");
    setShowHistory(false);
    clearInterval(timerRef.current);
  };

  const loadConsultationData = async () => {
    try {
      setLoading(true);
      const res = await getConsultation(appointment.id);
      if (res.data) {
        setConsent(Boolean(res.data.consent_obtained));
        setTranscript(res.data.transcript || "");
        setStatus(res.data.status || "DRAFT");
        if (res.data.ai_draft && Object.keys(res.data.ai_draft).length > 0) {
          setDraft(prev => ({ ...prev, ...res.data.ai_draft }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadPatientHistory = async (patientId) => {
    try {
      const res = await getPatientMedicalRecords(patientId);
      setPreviousHistory(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleConsentToggle = async (e) => {
    const val = e.target.checked;
    setConsent(val);
    try {
      await setPatientConsent(appointment.id, val);
    } catch (err) {
      toast.error("Failed to save consent choice");
      setConsent(!val);
    }
  };

  // Audio Recording Handlers
  const startRecording = async () => {
    if (!consent) {
      toast.warning("Patient consent must be obtained before starting recording.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlobObj = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(audioBlobObj);
        const url = URL.createObjectURL(audioBlobObj);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error(err);
      toast.error("Microphone access denied or unavailable.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const deleteRecording = () => {
    setAudioBlob(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setRecordingTime(0);
  };

  const handleTranscribeAndGenerate = async () => {
    if (!audioBlob && !transcript) {
      toast.warning("Please record audio or provide a transcript first.");
      return;
    }

    try {
      setLoading(true);
      let currentTranscript = transcript;

      if (audioBlob) {
        toast.info("Transcribing audio via Speech-to-Text service...");
        const res = await uploadAndTranscribeAudio(appointment.id, audioBlob);
        currentTranscript = res.data.transcript;
        setTranscript(currentTranscript);
        toast.success("Transcription complete!");
      }

      if (currentTranscript) {
        toast.info("Generating AI Clinical Draft using Google Gemini...");
        const draftRes = await generateAIDraft(appointment.id, currentTranscript);
        if (draftRes.data?.ai_draft) {
          setDraft(prev => ({ ...prev, ...draftRes.data.ai_draft }));
          setStatus(draftRes.data.status || "REVIEWED");
          toast.success("AI Draft generated successfully! Please review below.");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to transcribe/generate draft. You can still enter clinical notes manually.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      setLoading(true);
      await updateConsultationDraft(appointment.id, {
        transcript,
        ai_draft: draft
      });
      toast.success("Draft saved successfully.");
    } catch (err) {
      toast.error("Failed to save draft.");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAndSave = async () => {
    try {
      setLoading(true);
      await approveConsultation(appointment.id, {
        ...draft,
        appointment_id: appointment.id
      });
      toast.success("Official Medical Record approved and saved! Patient notified.");
      if (onSuccess) onSuccess();
      setStatus("APPROVED");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve medical record.");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={`Doctor Consultation - Appointment #${appointment?.id}`} maxWidth="max-w-4xl">
        <div className="space-y-6">
          {/* Patient Overview */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 text-blue-700 font-bold rounded-full flex items-center justify-center text-lg">
                {appointment?.patient?.charAt(0) || "P"}
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 text-lg">{appointment?.patient}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                  <span>Reason: {appointment?.reason || "General Consultation"}</span> | 
                  <span>Date: {appointment?.date} ({appointment?.time})</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-xs font-medium bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              {showHistory ? "Hide Patient History" : `Previous Medical Records (${previousHistory.length})`}
            </button>
          </div>

          {/* Previous Medical History Drawer */}
          {showHistory && (
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 space-y-3 max-h-60 overflow-y-auto">
              <h4 className="font-semibold text-sm text-blue-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" /> Patient Medical History
              </h4>
              {previousHistory.length === 0 ? (
                <p className="text-xs text-slate-500">No previous approved medical records on file.</p>
              ) : (
                previousHistory.map((rec) => (
                  <div key={rec.id} className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-1">
                    <div className="flex justify-between font-medium text-slate-700">
                      <span>Date: {rec.created_at?.split('T')[0]} (Dr. {rec.doctor_name})</span>
                      <span className="text-blue-600 font-semibold">{rec.diagnosis || "No diagnosis"}</span>
                    </div>
                    <p className="text-slate-600"><strong>Chief Complaint:</strong> {rec.chief_complaint || "—"}</p>
                    <p className="text-slate-600"><strong>Notes:</strong> {rec.clinical_notes || "—"}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Step 1: Patient Consent & Recording */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Mic className="w-5 h-5 text-blue-600" /> 1. Consultation Recording
              </h3>
              {status === "APPROVED" && (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Official Approved Record
                </span>
              )}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
              <p className="font-medium mb-1">Consent Notice:</p>
              <p>"Consultation recording will be used to generate a draft clinical note for the doctor's review. The recording/transcription is processed for documentation purposes."</p>
              <label className="flex items-center space-x-2 mt-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={handleConsentToggle}
                  disabled={status === "APPROVED"}
                  className="rounded border-amber-400 text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <span className="font-semibold text-slate-800">Patient consent obtained</span>
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={startRecording}
                  disabled={!consent || status === "APPROVED" || loading}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
                >
                  <Mic className="w-4 h-4" /> Start Recording
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 animate-pulse transition-colors"
                >
                  <Square className="w-4 h-4 text-red-500 fill-red-500" /> 🔴 Recording ({formatTime(recordingTime)}) - Stop
                </button>
              )}

              {audioUrl && !isRecording && (
                <div className="flex items-center space-x-3 bg-slate-100 px-3 py-1.5 rounded-xl text-xs">
                  <audio src={audioUrl} controls className="h-8 w-48" />
                  <button onClick={deleteRecording} className="text-red-600 hover:text-red-800 p-1" title="Delete Audio">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={handleTranscribeAndGenerate}
                disabled={(!audioBlob && !transcript) || loading || status === "APPROVED"}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors ml-auto shadow-sm"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
                Generate Clinical Draft
              </button>
            </div>
          </div>

          {/* Step 2: Transcript Review */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-600" /> 2. Consultation Transcript
              </h3>
              <button
                type="button"
                onClick={() => setIsEditingTranscript(!isEditingTranscript)}
                disabled={status === "APPROVED"}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" /> {isEditingTranscript ? "Done Editing" : "Edit Transcript"}
              </button>
            </div>

            {isEditingTranscript ? (
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                rows={4}
                placeholder="Doctor: ... Patient: ..."
                className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
              />
            ) : (
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs text-slate-700 max-h-36 overflow-y-auto whitespace-pre-wrap font-mono">
                {transcript || <span className="text-slate-400 italic">No audio transcript generated yet. Record consultation or type transcript manually.</span>}
              </div>
            )}
          </div>

          {/* Step 3: AI Clinical Documentation Draft */}
          <div className="bg-white border border-blue-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" /> AI Clinical Documentation Draft
                </h3>
                <p className="text-xs text-amber-700 font-medium mt-0.5 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> AI-GENERATED DRAFT — REQUIRES DOCTOR REVIEW
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Chief Complaint</label>
                <textarea
                  value={draft.chief_complaint}
                  onChange={(e) => setDraft({ ...draft, chief_complaint: e.target.value })}
                  disabled={status === "APPROVED"}
                  rows={2}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Primary reason for visit..."
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Symptoms</label>
                <textarea
                  value={draft.symptoms}
                  onChange={(e) => setDraft({ ...draft, symptoms: e.target.value })}
                  disabled={status === "APPROVED"}
                  rows={2}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Fever, cough, duration..."
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Diagnosis</label>
                <textarea
                  value={draft.diagnosis}
                  onChange={(e) => setDraft({ ...draft, diagnosis: e.target.value })}
                  disabled={status === "APPROVED"}
                  rows={2}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-semibold text-blue-900"
                  placeholder="Explicitly discussed doctor diagnosis..."
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Clinical Notes</label>
                <textarea
                  value={draft.clinical_notes}
                  onChange={(e) => setDraft({ ...draft, clinical_notes: e.target.value })}
                  disabled={status === "APPROVED"}
                  rows={2}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Physical exam findings, vitals..."
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Recommended Tests</label>
                <textarea
                  value={draft.recommended_tests}
                  onChange={(e) => setDraft({ ...draft, recommended_tests: e.target.value })}
                  disabled={status === "APPROVED"}
                  rows={2}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Blood test, X-Ray, etc..."
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Treatment Notes</label>
                <textarea
                  value={draft.treatment_notes}
                  onChange={(e) => setDraft({ ...draft, treatment_notes: e.target.value })}
                  disabled={status === "APPROVED"}
                  rows={2}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Lifestyle advice, care instructions..."
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Follow-up Date</label>
                <input
                  type="date"
                  value={draft.follow_up_date}
                  onChange={(e) => setDraft({ ...draft, follow_up_date: e.target.value })}
                  disabled={status === "APPROVED"}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Remarks</label>
                <textarea
                  value={draft.remarks}
                  onChange={(e) => setDraft({ ...draft, remarks: e.target.value })}
                  disabled={status === "APPROVED"}
                  rows={2}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional remarks..."
                />
              </div>
            </div>

            {/* Modal Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleTranscribeAndGenerate}
                  disabled={loading || status === "APPROVED" || (!transcript && !audioBlob)}
                  className="px-3 py-2 text-xs font-medium border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Regenerate Draft
                </button>
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={loading || status === "APPROVED"}
                  className="px-3 py-2 text-xs font-medium border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" /> Save Draft
                </button>
              </div>

              <div className="flex items-center gap-2">
                {status === "APPROVED" && (
                  <button
                    type="button"
                    onClick={() => setIsPrescriptionModalOpen(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <FileText className="w-4 h-4" /> Create Prescription
                  </button>
                )}

                {status !== "APPROVED" && (
                  <button
                    type="button"
                    onClick={handleApproveAndSave}
                    disabled={loading}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
                  >
                    <CheckCircle className="w-4 h-4" /> ✓ Approve & Save Medical Record
                  </button>
                )}
                
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Prescription Integration Modal */}
      {isPrescriptionModalOpen && (
        <AddEditPrescriptionModal
          isOpen={isPrescriptionModalOpen}
          onClose={() => setIsPrescriptionModalOpen(false)}
          onSuccess={() => {
            setIsPrescriptionModalOpen(false);
            toast.success("Prescription created successfully!");
          }}
          prescription={null}
          defaultAppointmentId={appointment?.id}
        />
      )}
    </>
  );
}

export default DoctorConsultationModal;
