import React from "react";

interface Education {
  school?: string;
  institution?: string;
  degree?: string;
  program?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

interface Experience {
  position?: string;
  company?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

interface Skill {
  name: string;
  level?: string;
}

interface PortfolioProject {
  title: string;
  projectUrl?: string;
  description?: string;
  technologies?: string[];
}

interface ResumeTemplateProps {
  profileData: {
    fullName: string | null;
    phoneNumber: string | null;
    city: string | null;
    linkedin: string | null;
    github: string | null;
    instagram: string | null;
    portfolioSite: string | null;
    education: Education[];
    experience: Experience[];
    hardSkills: Skill[];
    softSkills: Skill[];
    portfolio: PortfolioProject[];
  };
}

export default function ResumeTemplate({ profileData }: ResumeTemplateProps) {
  const baseTextColor = "#000000";
  const sectionTitleColor = "#000000";
  const borderColor = "#000000";

  // Prepare skills text for Skills section (already existing)
  const hardSkillsText = profileData.hardSkills.length > 0
    ? profileData.hardSkills.map((s) => s.name).join(", ")
    : "None";
  const softSkillsText = profileData.softSkills.length > 0
    ? profileData.softSkills.map((s) => s.name).join(", ")
    : "None";

  // Generate dynamic summary text
  const summaryText = React.useMemo(() => {
    const { experience, hardSkills, softSkills, portfolio } = profileData;
    let summarySentences: string[] = [];

    // Introduction part from experience
    if (experience && experience.length > 0) {
      // Mengambil pengalaman pertama dalam array (bisa dianggap yang terbaru atau paling relevan)
      const currentOrMostRecentExperience = experience[0];
      let intro = `Seorang profesional`;
      if (currentOrMostRecentExperience.position) {
        intro += ` berpengalaman sebagai ${currentOrMostRecentExperience.position}`;
        if (currentOrMostRecentExperience.company) {
          intro += ` di ${currentOrMostRecentExperience.company}`;
        }
      }
      summarySentences.push(intro.trim() + ".");
    } else {
      summarySentences.push("Seorang profesional yang berdedikasi dan bermotivasi tinggi.");
    }

    // Skills summary
    const mainHardSkills = hardSkills?.slice(0, 3).map(s => s.name) || []; // Ambil 3 hard skill pertama
    const mainSoftSkills = softSkills?.slice(0, 2).map(s => s.name) || []; // Ambil 2 soft skill pertama

    if (mainHardSkills.length > 0) {
      let skillSentence = `Memiliki keahlian dalam ${mainHardSkills.join(', ')}`;
      if (mainSoftSkills.length > 0) {
        skillSentence += `, serta didukung oleh kemampuan interpersonal seperti ${mainSoftSkills.join(' dan ')}.`;
      } else {
        skillSentence += ".";
      }
      summarySentences.push(skillSentence);
    } else if (mainSoftSkills.length > 0) {
      summarySentences.push(`Unggul dalam kemampuan interpersonal seperti ${mainSoftSkills.join(' dan ')}.`);
    }
    
    // Portfolio/Projects summary
    if (portfolio && portfolio.length > 0) {
      let projectSentence = `Telah terlibat dalam pengembangan ${portfolio.length} proyek`;
      const notableProject = portfolio[0]; // Ambil proyek pertama sebagai contoh
      if (notableProject?.title) {
        projectSentence += `, termasuk "${notableProject.title}"`;
        if (notableProject.technologies && notableProject.technologies.length > 0) {
          projectSentence += ` yang memanfaatkan teknologi ${notableProject.technologies.slice(0,2).join(', ')}.`;
        } else {
            projectSentence += ".";
        }
      } else {
         projectSentence += ".";
      }
      summarySentences.push(projectSentence);
    }

    // Jika hanya ada kalimat intro default dan tidak ada data lain, jangan tampilkan summary.
    if (summarySentences.length <= 1 && summarySentences[0].includes("berdedikasi dan bermotivasi tinggi")) {
        return null; 
    }
    
    return summarySentences.join(' ').replace(/\.\.+/g, '.').trim();
  }, [profileData]);

  return (
    <div
      className="max-w-4xl mx-auto p-8 font-sans"
      style={{
        color: baseTextColor,
        backgroundColor: "#ffffff",
        fontSize: 12,
        lineHeight: 1.4,
        marginLeft: 20,
        marginRight: 20,
      }}
    >
      {/* Header */}
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: "bold", margin: 0 }}>
          {profileData.fullName || "No Name Provided"}
        </h1>
        <p style={{ margin: "4px 0" }}>
          {profileData.city || "-"} | {profileData.phoneNumber || "-"}
        </p>
        
        {/* Bagian Summary Baru */}
        {summaryText && (
          <p style={{ 
            margin: "12px 0", // Memberi jarak dari info kontak dan social links
            fontSize: 11.5,      // Sedikit lebih kecil dari teks utama
            lineHeight: 1.5,   // Keterbacaan
            textAlign: 'justify',// Rata kiri-kanan untuk tampilan formal
            fontStyle: 'normal' // Mengubah dari italic jika dirasa lebih formal
          }}>
            {summaryText}
          </p>
        )}

        {/* Social Links */}
        <p style={{ 
          margin: summaryText ? "12px 0 0 0" : "8px 0 0 0", // Margin atas dinamis berdasarkan keberadaan summary
          display: "flex", 
          gap: 16, 
          flexWrap: "wrap" 
        }}>
          {profileData.linkedin && (
            <a href={profileData.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: baseTextColor, textDecoration: "underline" }}>
              LinkedIn
            </a>
          )}
          {profileData.github && (
            <a href={profileData.github} target="_blank" rel="noopener noreferrer" style={{ color: baseTextColor, textDecoration: "underline" }}>
              GitHub
            </a>
          )}
          {profileData.instagram && (
            <a href={profileData.instagram} target="_blank" rel="noopener noreferrer" style={{ color: baseTextColor, textDecoration: "underline" }}>
              Instagram
            </a>
          )}
          {profileData.portfolioSite && (
            <a href={profileData.portfolioSite} target="_blank" rel="noopener noreferrer" style={{ color: baseTextColor, textDecoration: "underline" }}>
              Portfolio
            </a>
          )}
        </p>
      </header>

      {/* Sections (Education, Experience, Portfolio, Skills) */}
      <main>
        {/* Education */}
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontWeight: "bold", fontSize: 16, borderBottom: `1px solid ${borderColor}`, paddingBottom: 4, marginBottom: 8, color: sectionTitleColor }}>
            Education
          </h2>
          {profileData.education.length > 0 ? (
            profileData.education.map((edu, idx) => (
              <div key={idx} style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: "bold" }}>
                  {edu.degree || edu.program || "Education"}{" "}
                  {edu.school ? `- ${edu.school}` : ""}
                  {edu.institution ? `, ${edu.institution}` : ""}
                </div>
                <div style={{ fontStyle: "italic", fontSize: 11 }}>
                  {edu.startDate || ""} - {edu.endDate || "Present"}
                </div>
                {edu.description && (
                  <div style={{ marginTop: 4 }}>{edu.description}</div>
                )}
              </div>
            ))
          ) : (
            <div style={{ fontStyle: "italic" }}>No education data available.</div>
          )}
        </section>

        {/* Experience */}
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontWeight: "bold", fontSize: 16, borderBottom: `1px solid ${borderColor}`, paddingBottom: 4, marginBottom: 8, color: sectionTitleColor }}>
            Experience
          </h2>
          {profileData.experience.length > 0 ? (
            profileData.experience.map((exp, idx) => (
              <div key={idx} style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: "bold" }}>{exp.position || "Position"}</div>
                <div style={{ fontStyle: "italic", fontSize: 11 }}>
                  {exp.company || "-"} | {exp.startDate || ""} - {exp.endDate || "Present"}
                </div>
                {exp.description && <div style={{ marginTop: 4 }}>{exp.description}</div>}
              </div>
            ))
          ) : (
            <div style={{ fontStyle: "italic" }}>No experience data available.</div>
          )}
        </section>

        {/* Portfolio */}
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontWeight: "bold", fontSize: 16, borderBottom: `1px solid ${borderColor}`, paddingBottom: 4, marginBottom: 8, color: sectionTitleColor }}>
            Portfolio
          </h2>
          {profileData.portfolio.length > 0 ? (
            profileData.portfolio.map((project, idx) => (
              <div key={idx} style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: "bold" }}>{project.title}</div>
                {project.projectUrl && (
                  <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" style={{ color: baseTextColor, textDecoration: "underline" }}>
                    {project.projectUrl}
                  </a>
                )}
                {project.description && <div>{project.description}</div>}
                {project.technologies && project.technologies.length > 0 && (
                  <div style={{ fontSize: 11 }}>
                    Technologies: {project.technologies.join(", ")}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div style={{ fontStyle: "italic" }}>No portfolio projects listed.</div>
          )}
        </section>

        {/* Skills combined */}
        <section>
          <h2 style={{ fontWeight: "bold", fontSize: 16, borderBottom: `1px solid ${borderColor}`, paddingBottom: 4, marginBottom: 8, color: sectionTitleColor }}>
            Skills
          </h2>
          <p style={{ marginBottom: 4 }}>
            <strong>Hard skills:</strong> {hardSkillsText}
          </p>
          <p>
            <strong>Soft skills:</strong> {softSkillsText}
          </p>
        </section>
      </main>
    </div>
  );
}