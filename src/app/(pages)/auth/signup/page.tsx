"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  User, 
  Briefcase, 
  ArrowRight, 
  ArrowLeft, 
  ShieldAlert, 
  Activity,
  Eye,
  EyeOff,
  CheckCircle2,
  FileText,
  PlusSquare,
  Link2,
  Image as ImageIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

// 🌐 Minimal layout type definition for fetched database services
interface DynamicServiceSchema {
  id: string;
  name: string;
  category: string;
}

export default function SignupWizardPage() {
  const router = useRouter();

  // 🕹️ Global Step Controls (1 to 4)
  const [currentLayer, setCurrentLayer] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // 🛰️ Global Platform Service Catalog Array State
  const [globalServices, setGlobalServices] = useState<DynamicServiceSchema[]>([]);
  const [isFetchingServices, setIsFetchingServices] = useState<boolean>(false);
  const [showCustomSkillsInput, setShowCustomSkillsInput] = useState<boolean>(false);

  // 📝 Combined Multi-Layer Wizard State Machine
  const [formData, setFormData] = useState({
    // Layer 1
    role: "CUSTOMER" as "CUSTOMER" | "WORKER",
    
    // Layer 2
    email: "",
    password: "",
    confirmPassword: "",
    
    // Layer 3 (Coordinated with User Prisma model fields)
    name: "",
    phone: "",
    address: "",
    profilePic: "",          // Mapped directly to User.profilePic scalar
    
    // Layer 4 (Worker Exclusive Parameters mapped to Worker model)
    dob: "",
    experience: 0,
    idProofType: "AADHAAR",  // Synchronized with IdProofType Prisma Enum
    idProofNumber: "",
    idProofUrl: "",          // Managed asset link destination for compliance checking
    serviceIds: [] as string[], 
    customSkills: ""             
  });

  // 🔄 Asynchronously stream global catalog services when transitioning towards layer 4
  useEffect(() => {
    if (formData.role === "WORKER" && currentLayer === 4 && globalServices.length === 0) {
      const loadServiceCatalog = async () => {
        setIsFetchingServices(true);
        try {
          const res = await fetch("/api/services");
          if (res.ok) {
            const data = await res.json();
            setGlobalServices(data);
          } else {
            setErrorMessage("Failed to coordinate global catalog synchronization stream.");
          }
        } catch {
          setErrorMessage("Network timeout connecting to global services catalog node.");
        } finally {
          setIsFetchingServices(false);
        }
      };
      loadServiceCatalog();
    }
  }, [currentLayer, formData.role, globalServices.length]);

  // 🔄 State mutation handler
  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // 🎛️ Many-to-Many Relational ID Toggler
  const toggleServiceRelation = (serviceId: string) => {
    const current = [...formData.serviceIds];
    if (current.includes(serviceId)) {
      updateField("serviceIds", current.filter((id) => id !== serviceId));
    } else {
      updateField("serviceIds", [...current, serviceId]);
    }
  };

  // 🛰️ Core Validation & Progression Pipeline Logic
  const handleLayerContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // --- LAYER 2 CHECKS ---
    if (currentLayer === 2) {
      if (formData.password !== formData.confirmPassword) {
        setErrorMessage("Cryptographic parameters mismatch. Passwords do not align.");
        return;
      }
      
      setIsLoading(true);
      try {
        const checkRes = await fetch("/api/auth/check-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email }),
        });
        const checkData = await checkRes.json();
        
        if (!checkRes.ok) {
          throw new Error(checkData.message || "Email address vector already allocated.");
        }
        
        setCurrentLayer(3);
      } catch (err: any) {
        setErrorMessage(err.message);
        return;
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // --- LAYER 3 CHECKS ---
    if (currentLayer === 3) {
      if (formData.role === "CUSTOMER") {
        executeFinalRegistration();
      } else {
        setCurrentLayer(4);
      }
      return;
    }

    // --- LAYER 4 CHECKS ---
    if (currentLayer === 4) {
      if (!formData.idProofUrl.trim()) {
        setErrorMessage("Verification vector requires valid proof file url attachment.");
        return;
      }
      if (formData.serviceIds.length === 0 && !formData.customSkills.trim()) {
        setErrorMessage("Please select at least one core competency or specify in the 'Others' segment.");
        return;
      }
      executeFinalRegistration();
    }
  };

  // 🚀 Final Database Commit
  const executeFinalRegistration = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Database registration pipeline breakdown.");
      }

      router.push("/auth/login");
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-zinc-950 text-zinc-400 font-sans px-4 py-16 select-none">
      <div className="app-grid-overlay absolute inset-0 opacity-20" />

      {/* 📊 STEP-BY-STEP FLOW MATRIX PREVIEW */}
      <div className="relative w-full max-w-xl flex items-center justify-between mb-8 px-4">
        {[1, 2, 3, formData.role === "WORKER" ? 4 : null].filter(Boolean).map((step, idx) => (
          <React.Fragment key={step}>
            <div className="flex items-center gap-2">
              <div className={cn(
                "h-6 w-6 rounded-md flex items-center justify-center text-label font-black tracking-tight transition-all duration-300",
                currentLayer >= (step as number) 
                  ? "bg-primary text-white shadow-sm shadow-primary/20 border border-primary" 
                  : "bg-zinc-900 border border-zinc-800 text-zinc-600"
              )}>
                {step}
              </div>
              <span className={cn(
                "text-micro font-black uppercase tracking-widest hidden sm:inline",
                currentLayer === step ? "text-zinc-200" : "text-zinc-600"
              )}>
                {step === 1 && "Role"}
                {step === 2 && "Credentials"}
                {step === 3 && "Profile"}
                {step === 4 && "Compliance"}
              </span>
            </div>
            {idx < (formData.role === "WORKER" ? 3 : 2) && (
              <div className={cn("flex-1 h-[1px] mx-2 transition-colors duration-300", currentLayer > (step as number) ? "bg-primary/50" : "bg-zinc-900")} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* 🧱 WIZARD FORM CONTEXT WRAPPER */}
      <div className="relative w-full max-w-xl rounded-2xl border border-zinc-900 bg-zinc-950 p-6 sm:p-8 shadow-2xl shadow-black/90">
        
        {errorMessage && (
          <div className="mb-6 rounded-xl border border-red-950/40 bg-red-950/10 p-3 text-control font-bold text-red-400 uppercase tracking-wide flex items-center gap-2">
            <ShieldAlert size={14} className="shrink-0 animate-pulse" /> {errorMessage}
          </div>
        )}

        <form onSubmit={handleLayerContinue} className="flex flex-col gap-6">

          {/* LAYER 1: ROLE SELECTION MAP */}
          {currentLayer === 1 && (
            <div className="flex flex-col gap-4">
              <div className="text-center sm:text-left">
                <h2 className="text-sm font-black uppercase tracking-widest text-zinc-200">// LAYER 01: ACCOUNT ORIENTATION</h2>
                <p className="text-xs text-zinc-500 mt-1">Designate your vector context within the engine workspace ecosystem.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    updateField("role", "CUSTOMER");
                    updateField("idProofType", "AADHAAR");
                  }}
                  className={cn(
                    "p-5 rounded-xl border text-left flex flex-col gap-3 transition-all duration-200 group",
                    formData.role === "CUSTOMER" ? "bg-zinc-900/40 border-primary shadow-lg" : "bg-zinc-950/20 border-zinc-900"
                  )}
                >
                  <div className={cn("p-2 rounded-lg w-fit", formData.role === "CUSTOMER" ? "bg-primary text-white" : "bg-zinc-900 text-zinc-500")}>
                    <User size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-zinc-200">Customer Core Portal</h4>
                    <p className="text-control text-zinc-500 mt-1 leading-relaxed">Book elite mechanical field deployments, log diagnostics, and track logistics.</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => updateField("role", "WORKER")}
                  className={cn(
                    "p-5 rounded-xl border text-left flex flex-col gap-3 transition-all duration-200 group",
                    formData.role === "WORKER" ? "bg-zinc-900/40 border-primary shadow-lg" : "bg-zinc-950/20 border-zinc-900"
                  )}
                >
                  <div className={cn("p-2 rounded-lg w-fit", formData.role === "WORKER" ? "bg-primary text-white" : "bg-zinc-900 text-zinc-500")}>
                    <Briefcase size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-zinc-200">Field Service Engineer</h4>
                    <p className="text-control text-zinc-500 mt-1 leading-relaxed">Process work tickets, manage tooling catalogs, and undergo manual vetting layers.</p>
                  </div>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setCurrentLayer(2)}
                className="w-full mt-4 rounded-xl bg-primary py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-red-600 transition-all flex items-center justify-center gap-2"
              >
                Confirm Path & Continue <ArrowRight size={13} />
              </button>
            </div>
          )}

          {/* LAYER 2: SECURITY IDENTIFIERS */}
          {currentLayer === 2 && (
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-zinc-200">// LAYER 02: CORE AUTHENTICATION IDENTIFIER</h2>
                <p className="text-xs text-zinc-500 mt-1">Configure your distinct verification keys to establish network parameters.</p>
              </div>

              <div className="flex flex-col gap-1.5 mt-2">
                <label className="text-label font-black uppercase tracking-widest text-zinc-500">System Channel Email Address</label>
                <input 
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-3 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-primary transition-colors"
                  placeholder="operator@domain.com"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 relative">
                  <label className="text-label font-black uppercase tracking-widest text-zinc-500">Cryptographic Cipher</label>
                  <div className="relative w-full">
                    <input 
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={(e) => updateField("password", e.target.value)}
                      className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-3 pr-10 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-primary transition-colors font-mono"
                      placeholder="••••••••••••"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-label font-black uppercase tracking-widest text-zinc-500">Re-verify Cipher Vector</label>
                  <input 
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => updateField("confirmPassword", e.target.value)}
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-3 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-primary transition-colors font-mono"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 mt-4 border-t border-zinc-900 pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentLayer(1)}
                  className="px-4 py-3 border border-zinc-800 text-xs font-bold uppercase rounded-xl flex items-center gap-2"
                >
                  <ArrowLeft size={13} /> Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 rounded-xl bg-primary py-3 text-xs font-black uppercase text-white hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? <Activity size={12} className="animate-spin" /> : <>Scan Identifier & Next <ArrowRight size={13} /></>}
                </button>
              </div>
            </div>
          )}

          {/* LAYER 3: DEMOGRAPHICS STRUCTURE */}
          {currentLayer === 3 && (
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-zinc-200">// LAYER 03: STRUCTURAL IDENTITY BLOCK</h2>
                <p className="text-xs text-zinc-500 mt-1">Inject valid demographic variables to organize workspace routing layers.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-label font-black uppercase tracking-widest text-zinc-500">Full Signature Name</label>
                  <input 
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-3 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-primary transition-colors"
                    placeholder="Rahul Sharma"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-label font-black uppercase tracking-widest text-zinc-500">Contact Number (Phone Vector)</label>
                  <input 
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-3 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-primary transition-colors"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
              </div>

              {/* 🖼️ PROFILE PICTURE ASSET URL INPUT */}
              <div className="flex flex-col gap-1.5">
                <label className="text-label font-black uppercase tracking-widest text-zinc-500">Profile Picture Avatar Link (Optional)</label>
                <div className="relative w-full">
                  <input 
                    type="url"
                    value={formData.profilePic}
                    onChange={(e) => updateField("profilePic", e.target.value)}
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-3 pr-10 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-primary transition-colors"
                    placeholder="https://res.cloudinary.com/bucket/image/upload/v1/avatar.png"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none">
                    <ImageIcon size={13} />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-label font-black uppercase tracking-widest text-zinc-500">Full Structural Operational Address</label>
                <textarea 
                  required
                  rows={2}
                  value={formData.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-3 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-primary transition-colors font-medium resize-none"
                  placeholder="Sector-4, Bhilai, Chhattisgarh, India"
                />
              </div>

              <div className="flex items-center justify-between gap-4 mt-4 border-t border-zinc-900 pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentLayer(2)}
                  className="px-4 py-3 border border-zinc-800 text-xs font-bold uppercase rounded-xl flex items-center gap-2"
                >
                  <ArrowLeft size={13} /> Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 rounded-xl bg-primary py-3 text-xs font-black uppercase text-white hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <Activity size={12} className="animate-spin" />
                  ) : formData.role === "CUSTOMER" ? (
                    <>Finalize & Launch Workspace <CheckCircle2 size={13} /></>
                  ) : (
                    <>Next: Compliance Review <ArrowRight size={13} /></>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* LAYER 4: WORKER ENGINEERING & DYNAMIC SERVICES COMPLIANCE */}
          {currentLayer === 4 && formData.role === "WORKER" && (
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-zinc-200">// LAYER 04: PROFESSIONAL COMPLIANCE TELEMETRY</h2>
                <p className="text-xs text-zinc-500 mt-1">Submit fields for structural platform orchestration audit and background evaluation queues.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-label font-black uppercase tracking-widest text-zinc-500">Date of Birth Metric</label>
                  <input 
                    title="select date of birth for age verification and compliance routing"
                    type="date"
                    required
                    value={formData.dob}
                    onChange={(e) => updateField("dob", e.target.value)}
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-3 text-xs text-zinc-200 focus:outline-none focus:border-primary text-left"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-label font-black uppercase tracking-widest text-zinc-500">Total Structural Experience (Years)</label>
                  <input 
                    type="number"
                    min={0}
                    required
                    value={formData.experience || ""}
                    onChange={(e) => updateField("experience", parseInt(e.target.value) || 0)}
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-3 text-xs text-zinc-200 focus:outline-none focus:border-primary"
                    placeholder="5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-label font-black uppercase tracking-widest text-zinc-500">Identity Document Type</label>
                  <select
                    title="select the type of identity document for verification"
                    value={formData.idProofType}
                    onChange={(e) => updateField("idProofType", e.target.value)}
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-3 text-xs text-zinc-200 focus:outline-none focus:border-primary font-bold uppercase tracking-wider"
                  >
                    <option value="AADHAAR">Aadhaar Verification Channel</option>
                    <option value="DRIVERS_LICENSE">Driver's License Vector</option>
                    <option value="PASSPORT">Global Passport File</option>
                    <option value="VOTER_ID">National Voter Card ID</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-label font-black uppercase tracking-widest text-zinc-500">Identity Secure ID Number</label>
                  <input 
                    type="text"
                    required
                    value={formData.idProofNumber}
                    onChange={(e) => updateField("idProofNumber", e.target.value)}
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-3 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-primary font-mono"
                    placeholder="ID-XXXXXXXXXXXX"
                  />
                </div>
              </div>

              {/* 📂 SECURE PROOF URL ASSET */}
              <div className="flex flex-col gap-1.5">
                <label className="text-label font-black uppercase tracking-widest text-zinc-500">Identity Document Remote Asset URL</label>
                <div className="relative w-full">
                  <input 
                    type="url"
                    required
                    value={formData.idProofUrl}
                    onChange={(e) => updateField("idProofUrl", e.target.value)}
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-3 pr-10 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-primary transition-colors"
                    placeholder="https://res.cloudinary.com/bucket/image/upload/v1/proof.pdf"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none">
                    <Link2 size={13} />
                  </div>
                </div>
              </div>

              {/* 🛠️ ASYNC DATABASE CONNECTED SERVICE SELECTION MATRIX */}
              <div className="flex flex-col gap-1.5">
                <label className="text-label font-black uppercase tracking-widest text-zinc-500">Select Global Core Competencies</label>
                
                {isFetchingServices ? (
                  <div className="flex items-center gap-2 p-4 justify-center bg-zinc-900/50 rounded-xl border border-zinc-900">
                    <Activity size={12} className="animate-spin text-primary" />
                    <span className="text-control uppercase tracking-widest text-zinc-600">Streaming operational catalogs...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                    {globalServices.map((service) => {
                      const isSelected = formData.serviceIds.includes(service.id);
                      return (
                        <button
                          type="button"
                          key={service.id}
                          onClick={() => toggleServiceRelation(service.id)}
                          className={cn(
                            "p-2.5 rounded-lg border text-left text-control font-bold uppercase tracking-wider transition-all flex items-center justify-between",
                            isSelected 
                              ? "bg-primary/5 border-primary text-primary" 
                              : "bg-zinc-900 border-zinc-800/80 text-zinc-500 hover:text-zinc-400"
                          )}
                        >
                          <span className="truncate">{service.name}</span>
                          {isSelected && <FileText size={11} className="text-primary" />}
                        </button>
                      );
                    })}

                    {/* ⚙️ SPECIALIZED FALLBACK TRIGGER FOR UNLISTED COMPETENCIES */}
                    <button
                      type="button"
                      onClick={() => setShowCustomSkillsInput(!showCustomSkillsInput)}
                      className={cn(
                        "p-2.5 rounded-lg border text-left text-control font-bold uppercase tracking-wider transition-all flex items-center justify-between",
                        showCustomSkillsInput || formData.customSkills.trim()
                          ? "bg-zinc-900 border-zinc-700 text-zinc-200"
                          : "bg-zinc-950 border-dashed border-zinc-800 text-zinc-600 hover:text-zinc-400"
                      )}
                    >
                      <span>{formData.customSkills.trim() ? "Others (Custom Specified)" : "Others / Unlisted Skill"}</span>
                      <PlusSquare size={12} className="shrink-0" />
                    </button>
                  </div>
                )}
              </div>

              {/* DYNAMIC COMPLIANCE FALLBACK STRINGS BOX */}
              {(showCustomSkillsInput || formData.customSkills.trim() !== "") && (
                <div className="flex flex-col gap-1.5 animate-fadeIn">
                  <label className="text-label font-black uppercase tracking-widest text-primary">Specify Unlisted Competency Elements</label>
                  <input
                    type="text"
                    value={formData.customSkills}
                    onChange={(e) => updateField("customSkills", e.target.value)}
                    className="w-full rounded-xl bg-zinc-900 border border-primary/30 p-3 text-xs text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-primary transition-colors"
                    placeholder="e.g., Heavy-Duty Hydraulic Arm Repair, Vintage Carburetor Machining"
                  />
                </div>
              )}

              <div className="flex items-center justify-between gap-4 mt-4 border-t border-zinc-900 pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentLayer(3)}
                  className="px-4 py-3 border border-zinc-800 text-xs font-bold uppercase rounded-xl flex items-center gap-2"
                >
                  <ArrowLeft size={13} /> Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 rounded-xl bg-primary py-3 text-xs font-black uppercase text-white hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? <>Submitting Pipeline... <Activity size={12} className="animate-spin" /></> : <>Compile Application File &rarr;</>}
                </button>
              </div>
            </div>
          )}

        </form>

        <div className="mt-6 text-center text-control font-bold tracking-wide border-t border-zinc-900 pt-4">
          <span className="text-zinc-600 uppercase">Already Synchronized? </span>
          <Link href="/auth/login" className="text-primary hover:text-red-400 transition-colors uppercase ml-1">
            Execute Login &rarr;
          </Link>
        </div>

      </div>
    </div>
  );
}