// src/components/List/SkillsList.tsx
import React, { useEffect, useState, Fragment } from "react";
import { auth, db } from "../../firebase";
import {
  Plus,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Lightbulb,
  Zap,
  ClipboardList,
  PlusCircle,
  // Check, // Jika Anda memerlukan ikon centang umum dari lucide
} from "lucide-react";
import Swal from "sweetalert2";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Combobox, Transition } from '@headlessui/react';

interface Skill {
  id: string;
  name: string;
  level: string;
}

interface MasterSkill {
  id: string;
  name: string;
}

const LEVEL_OPTIONS = ["Beginner", "Intermediate", "Advanced", "Expert"];

// Icon SVG Sederhana untuk Combobox (jika tidak menggunakan dari library lain)
const SimpleChevronUpDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-gray-400">
    <path fillRule="evenodd" d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.24a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z" clipRule="evenodd" />
  </svg>
);

const SimpleCheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
  </svg>
);

export default function SkillsList() {
  const [hardSkills, setHardSkills] = useState<Skill[]>([]);
  const [softSkills, setSoftSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [masterHardSkills, setMasterHardSkills] = useState<MasterSkill[]>([]);
  const [masterSoftSkills, setMasterSoftSkills] = useState<MasterSkill[]>([]);
  const [loadingMasterSkills, setLoadingMasterSkills] = useState(true);

  const [showAddHardSkill, setShowAddHardSkill] = useState(false);
  const [showAddSoftSkill, setShowAddSoftSkill] = useState(false);

  const [newHardSkill, setNewHardSkill] = useState({ name: "", level: "" });
  const [newSoftSkill, setNewSoftSkill] = useState({ name: "", level: "" });

  // State untuk query pencarian Combobox, dipisahkan untuk hard dan soft skill
  const [hardSkillQuery, setHardSkillQuery] = useState('');
  const [softSkillQuery, setSoftSkillQuery] = useState('');

  async function fetchMasterSkills() {
    setLoadingMasterSkills(true);
    try {
      const hardSkillsCollectionRef = collection(db, "hard_skills");
      const hardSkillsQuery = query(hardSkillsCollectionRef, orderBy("name"));
      const hardSkillsSnapshot = await getDocs(hardSkillsQuery);
      const fetchedMasterHardSkills = hardSkillsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MasterSkill));
      setMasterHardSkills(fetchedMasterHardSkills);

      const softSkillsCollectionRef = collection(db, "soft_skills");
      const softSkillsQuery = query(softSkillsCollectionRef, orderBy("name"));
      const softSkillsSnapshot = await getDocs(softSkillsQuery);
      const fetchedMasterSoftSkills = softSkillsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MasterSkill));
      setMasterSoftSkills(fetchedMasterSoftSkills);
    } catch (err) {
      console.error("Error fetching master skills:", err);
      Swal.fire("Error", "Gagal memuat pilihan daftar keahlian dari database.", "error");
    } finally {
      setLoadingMasterSkills(false);
    }
  }

  async function fetchUserSkills() {
    setLoading(true);
    setError(null);
    try {
      const user = auth.currentUser;
      if (!user) {
        setError("User belum login.");
        setHardSkills([]); setSoftSkills([]); setLoading(false); return;
      }
      const token = await user.getIdToken();
      const [resHard, resSoft] = await Promise.all([
        fetch("https://jobseeker-capstone-705829099986.asia-southeast2.run.app/hard-skills", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("https://jobseeker-capstone-705829099986.asia-southeast2.run.app/soft-skills", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (!resHard.ok) throw new Error((await resHard.json().catch(() => ({}))).error || `Error fetching hard skills: ${resHard.statusText}`);
      if (!resSoft.ok) throw new Error((await resSoft.json().catch(() => ({}))).error || `Error fetching soft skills: ${resSoft.statusText}`);

      const hardData = await resHard.json();
      const softData = await resSoft.json();
      setHardSkills(Array.isArray(hardData.skills) ? hardData.skills : (Array.isArray(hardData) ? hardData : []));
      setSoftSkills(Array.isArray(softData.skills) ? softData.skills : (Array.isArray(softData) ? softData : []));
    } catch (err) {
      setError((err as Error).message); setHardSkills([]); setSoftSkills([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMasterSkills();
    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      if (user) { fetchUserSkills(); }
      else { setHardSkills([]); setSoftSkills([]); setLoading(false); setError("User belum login untuk melihat atau menambah keahlian."); }
    });
    return () => unsubscribeAuth();
  }, []);

  async function handleAddOrEditSkill(
    skillType: "hard" | "soft",
    currentSkill: { name: string; level: string },
    resetFormAndQuery: () => void, // Diperbarui untuk mereset query juga
    setShowForm: (show: boolean) => void
  ) {
    if (!currentSkill.name.trim() || !currentSkill.level.trim()) {
      Swal.fire("Error", `Mohon pilih nama dan level ${skillType} skill`, "error"); return;
    }
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User belum login");
      const token = await user.getIdToken();
      const endpoint = skillType === "hard" ? "hard-skills" : "soft-skills";
      const res = await fetch(`https://jobseeker-capstone-705829099986.asia-southeast2.run.app/${endpoint}`, {
        method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify([{ name: currentSkill.name, level: currentSkill.level }]),
      });
      if (!res.ok) throw new Error((await res.json()).error || `Gagal menambah ${skillType} skill`);
      const responseData = await res.json();
      Swal.fire({ title: "Berhasil", text: responseData.message || `${skillType.charAt(0).toUpperCase() + skillType.slice(1)} skill berhasil ditambahkan`, icon: "success" });
      resetFormAndQuery(); // Panggil fungsi reset yang sudah termasuk query
      setShowForm(false);
      fetchUserSkills();
    } catch (err) {
      Swal.fire("Gagal", (err as Error).message || `Terjadi kesalahan saat menambah ${skillType} skill`, "error");
    }
  }

  async function handleDeleteSkill(skillType: "hard" | "soft", id: string, skillName: string) {
    const confirmed = await Swal.fire({
      title: `Yakin ingin menghapus ${skillType} skill "${skillName}"?`, icon: "warning", showCancelButton: true,
      confirmButtonColor: "#d33", cancelButtonColor: "#3085d6", confirmButtonText: "Ya, hapus!", cancelButtonText: "Batal",
    });
    if (!confirmed.isConfirmed) return;
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User belum login");
      const token = await user.getIdToken();
      const endpoint = skillType === "hard" ? "hard-skills" : "soft-skills";
      const res = await fetch(`https://jobseeker-capstone-705829099986.asia-southeast2.run.app/${endpoint}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ skillIds: [id] }),
      });
      if (!res.ok) throw new Error((await res.json()).error || `Gagal menghapus ${skillType} skill`);
      const responseData = await res.json();
      Swal.fire({ title: "Terhapus!", text: responseData.message || `${skillType.charAt(0).toUpperCase() + skillType.slice(1)} skill berhasil dihapus.`, icon: "success" });
      fetchUserSkills();
    } catch (err) {
      Swal.fire("Gagal!", (err as Error).message || `Terjadi kesalahan saat menghapus ${skillType} skill`, "error");
    }
  }

  const renderSkillSection = (
    title: string,
    userSkills: Skill[],
    masterSkillsOptions: MasterSkill[],
    showAddForm: boolean,
    setShowAddForm: (show: boolean) => void,
    newSkillState: { name: string; level: string },
    setNewSkillState: (state: { name: string; level: string }) => void,
    currentQuery: string, // Terima query saat ini
    setCurrentQuery: (query: string) => void, // Terima fungsi untuk set query
    skillType: "hard" | "soft",
    icon: React.ReactNode,
    colorTheme: { base: string; lighter: string; textDark: string; textLight: string, addBtnBg: string, addBtnHoverBg: string }
  ) => {
    const availableMasterSkills = masterSkillsOptions.filter(
      masterSkill => !userSkills.some(userSkill => userSkill.name === masterSkill.name)
    );

    const filteredMasterSkillsForCombobox =
      currentQuery === ''
        ? availableMasterSkills
        : availableMasterSkills.filter((skill) =>
            skill.name.toLowerCase().replace(/\s+/g, '').includes(currentQuery.toLowerCase().replace(/\s+/g, ''))
          );

    return (
      <section className="mb-8">
        <div className={`flex items-center justify-between mb-4 pb-3 border-b border-gray-200`}>
          <h3 className={`text-xl font-semibold text-gray-700 flex items-center`}>
            {icon} <span className="ml-2">{title}</span>
          </h3>
          <button
            onClick={() => {
                if (loadingMasterSkills && !showAddForm) { // Hanya cek jika akan membuka form
                    Swal.fire("Info", "Daftar pilihan keahlian masih dimuat, mohon tunggu.", "info"); return;
                }
                if (showAddForm) { // Jika form sedang terbuka dan akan ditutup
                    setNewSkillState({ name: "", level: "" }); // Reset state skill
                    setCurrentQuery(''); // Reset query
                }
                setShowAddForm(!showAddForm);
            }}
            aria-label={`Toggle Tambah ${title}`}
            className={`p-1.5 rounded-full transition-colors duration-150 ${
              showAddForm ? 'text-red-600 hover:bg-red-100' : `${colorTheme.textDark} hover:bg-gray-100`
            }`}
            disabled={loadingMasterSkills && !showAddForm}
          >
            {showAddForm ? <X size={22} /> : <Plus size={22} />}
          </button>
        </div>

        {showAddForm && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddOrEditSkill(skillType, newSkillState, () => {
                setNewSkillState({name: '', level: ''});
                setCurrentQuery(''); // Reset query spesifik section ini setelah submit
              }, setShowAddForm);
            }}
            className={`mb-6 p-4 border border-${colorTheme.base}-200 bg-${colorTheme.base}-50 rounded-lg space-y-4`}
          >
            <Combobox 
              value={newSkillState.name} 
              onChange={(selectedValue) => {
                if (selectedValue) setNewSkillState({ ...newSkillState, name: selectedValue });
              }}
              disabled={loadingMasterSkills || (availableMasterSkills.length === 0 && masterSkillsOptions.length > 0 && currentQuery === '')}
            >
              <div className="relative">
                <div className="relative w-full cursor-default overflow-hidden rounded-md bg-white text-left shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-300 sm:text-sm border border-gray-300">
                  <Combobox.Input
                    className="w-full border-none py-2.5 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                    displayValue={(skillName: string) => skillName || ""}
                    onChange={(event) => setCurrentQuery(event.target.value)} // Gunakan setCurrentQuery dari props
                    placeholder={`-- Pilih atau Cari Nama ${title.slice(0,-1)} --`}
                  />
                  <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <SimpleChevronUpDownIcon />
                  </Combobox.Button>
                </div>
                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                  afterLeave={() => setCurrentQuery('')} // Reset query spesifik section ini
                >
                  <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-20">
                    {loadingMasterSkills ? (
                      <div className="relative cursor-default select-none px-4 py-2 text-gray-700">Memuat pilihan...</div>
                    ) : filteredMasterSkillsForCombobox.length === 0 && currentQuery !== '' ? (
                      <div className="relative cursor-default select-none px-4 py-2 text-gray-700">Keahlian tidak ditemukan.</div>
                    ) : availableMasterSkills.length === 0 && masterSkillsOptions.length > 0 && currentQuery === '' ? (
                      <div className="relative cursor-default select-none px-4 py-2 text-gray-700">Semua keahlian sudah ditambahkan.</div>
                    ) : (
                      filteredMasterSkillsForCombobox.map((skill) => (
                        <Combobox.Option
                          key={skill.id || skill.name}
                          className={({ active }) =>
                            `relative cursor-default select-none py-2 pl-10 pr-4 ${
                              active ? `${colorTheme.base === 'blue' ? 'bg-blue-600' : 'bg-green-600'} text-white` : 'text-gray-900'
                            }`
                          }
                          value={skill.name}
                        >
                          {({ selected, active }) => (
                            <>
                              <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                {skill.name}
                              </span>
                              {selected ? (
                                <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-white' : (colorTheme.base === 'blue' ? 'text-blue-600' : 'text-green-600')}`}>
                                  <SimpleCheckIcon />
                                </span>
                              ) : null}
                            </>
                          )}
                        </Combobox.Option>
                      ))
                    )}
                  </Combobox.Options>
                </Transition>
              </div>
            </Combobox>

            <select
              value={newSkillState.level}
              onChange={(e) => setNewSkillState({ ...newSkillState, level: e.target.value })}
              className="w-full border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">-- Pilih Level Keahlian --</option>
              {LEVEL_OPTIONS.map((lvl) => ( <option key={lvl} value={lvl}>{lvl}</option> ))}
            </select>
            <button
              type="submit"
              className={`w-full ${colorTheme.addBtnBg} text-white rounded-md py-2.5 font-semibold ${colorTheme.addBtnHoverBg} transition-colors shadow-sm hover:shadow-md`}
              disabled={loadingMasterSkills && availableMasterSkills.length === 0 && masterSkillsOptions.length > 0 && currentQuery === ''}
            >
              Tambah {title.slice(0,-1)}
            </button>
          </form>
        )}

        {userSkills.length === 0 && !showAddForm && (
          <p className="text-sm text-gray-500 italic py-2">Belum ada {title.toLowerCase()} yang ditambahkan.</p>
        )}
        {userSkills.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {userSkills.map((skill) => (
              <div key={skill.id} className={`flex items-center ${colorTheme.lighter} ${colorTheme.textDark} text-sm font-medium pl-3 pr-2 py-1.5 rounded-full shadow-sm`}>
                <span>{skill.name}</span>
                <span className={`ml-2 text-xs bg-white ${colorTheme.textLight} px-2 py-0.5 rounded-full border border-${colorTheme.base}-200`}>{skill.level}</span>
                <button onClick={() => handleDeleteSkill(skillType, skill.id, skill.name)} aria-label={`Hapus ${skillType} skill ${skill.name}`}
                  className={`ml-2 p-1 ${colorTheme.textDark} hover:${colorTheme.textDark} hover:bg-white rounded-full transition-colors`} type="button" >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    );
  };

  const overallLoading = loading || loadingMasterSkills;

  if (overallLoading && !error) {
    return (
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg mb-8">
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-3" />
          <p className="text-sm">Memuat data keahlian...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg mb-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-8 rounded-lg text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-3" />
          <p className="font-semibold text-lg mb-1">Gagal Memuat Data</p>
          <p className="text-sm">{error}</p>
          {error.includes("User belum login") && (
             <button onClick={() => Swal.fire("Info", "Silakan login ulang untuk mengakses fitur ini.", "info")} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Ke Halaman Login
             </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg mb-8">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
            <Lightbulb size={26} className="mr-3 text-yellow-500" /> Keahlian
        </h2>
      </div>
      
      {!loading && !error && hardSkills.length === 0 && softSkills.length === 0 && !showAddHardSkill && !showAddSoftSkill && (
          <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
            <ClipboardList size={56} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Belum Ada Keahlian</h3>
            <p className="text-sm text-gray-500 mb-6">Tambahkan keahlian teknis dan non-teknis Anda untuk meningkatkan profil.</p>
            <button
                onClick={() => {
                    if (loadingMasterSkills) { Swal.fire("Info", "Daftar pilihan keahlian masih dimuat, mohon tunggu.", "info"); return; }
                    setShowAddHardSkill(true)
                }}
                className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm hover:shadow-md transition-all"
                disabled={loadingMasterSkills} >
                <PlusCircle size={18} className="mr-2" /> Tambah Hard Skill
            </button>
          </div>
      )}

      {renderSkillSection(
        "Hard Skills", hardSkills, masterHardSkills, showAddHardSkill, setShowAddHardSkill,
        newHardSkill, setNewHardSkill, hardSkillQuery, setHardSkillQuery, // Kirim state query hard skill
        "hard", <Zap size={20} className="text-blue-500" />,
        { base: 'blue', lighter: 'bg-blue-100', textDark: 'text-blue-800', textLight: 'text-blue-600', addBtnBg: 'bg-blue-600', addBtnHoverBg: 'hover:bg-blue-700' }
      )}

      {renderSkillSection(
        "Soft Skills", softSkills, masterSoftSkills, showAddSoftSkill, setShowAddSoftSkill,
        newSoftSkill, setNewSoftSkill, softSkillQuery, setSoftSkillQuery, // Kirim state query soft skill
        "soft", <CheckCircle size={20} className="text-green-500" />,
        { base: 'green', lighter: 'bg-green-100', textDark: 'text-green-800', textLight: 'text-green-600', addBtnBg: 'bg-green-600', addBtnHoverBg: 'hover:bg-green-700' }
      )}
    </div>
  );
}