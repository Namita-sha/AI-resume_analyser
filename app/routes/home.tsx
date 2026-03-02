import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import { usePuterStore } from "~/lib/puter";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "HireLens" },
    { name: "description", content: "Smart feedback for your dream job!" },
  ];
}

export default function Home() {
  const { auth, kv, fs } = usePuterStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.isAuthenticated) navigate('/auth?next=/');
  }, [auth.isAuthenticated]);

  useEffect(() => {
    const loadResumes = async () => {
      setLoadingResumes(true);
      try {
        const items = (await kv.list('resume:*', true)) as KVItem[];
        const parsedResumes = items
          ?.map((item) => {
            try {
              return JSON.parse(item.value) as Resume;
            } catch {
              return null;
            }
          })
          // Filter out deleted or invalid entries
          .filter((r): r is Resume => r !== null && !(r as any)._deleted);
        setResumes(parsedResumes || []);
      } catch (e) {
        console.error('Failed to load resumes:', e);
        setResumes([]);
      }
      setLoadingResumes(false);
    };
    loadResumes();
  }, []);

  const handleDelete = async (resume: Resume) => {
    const confirmed = window.confirm(
      `Delete this resume?\n"${resume.jobTitle} at ${resume.companyName}"\n\nThis cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingId(resume.id);

    try {
      // Mark as deleted in KV store (workaround for Puter kv.delete not working)
      await kv.set(`resume:${resume.id}`, JSON.stringify({ _deleted: true }));

      // Delete PDF file from Puter storage
      if (resume.resumePath) {
        try { await fs.delete(resume.resumePath); }
        catch (e) { console.warn('Could not delete PDF file:', e); }
      }

      // Delete image file from Puter storage
      if (resume.imagePath) {
        try { await fs.delete(resume.imagePath); }
        catch (e) { console.warn('Could not delete image file:', e); }
      }

      // Remove from UI instantly
      setResumes((prev) => prev.filter((r) => r.id !== resume.id));
      console.log('Resume deleted successfully:', resume.id);

    } catch (error) {
      console.error('Failed to delete resume:', error);
      alert('Failed to delete. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />

      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Track Your Applications & Resume Ratings</h1>
          {!loadingResumes && resumes?.length === 0 ? (
            <h2>No resumes found. Upload your first resume to get feedback.</h2>
          ) : (
            <h2>Review your submissions and check AI-powered feedback.</h2>
          )}
        </div>

        {loadingResumes && (
          <div className="flex flex-col items-center justify-center">
            <img src="/images/resume-scan-2.gif" className="w-[200px]" />
            <p className="text-gray-500 mt-2">Loading your resumes...</p>
          </div>
        )}

        {!loadingResumes && resumes.length > 0 && (
          <>
            <div className="resumes-section">
              {resumes.map((resume) => (
                <div key={resume.id} className="relative group">
                  <ResumeCard resume={resume} />

                  {/* Delete button - visible on hover */}
                  <button
                    onClick={() => handleDelete(resume)}
                    disabled={deletingId === resume.id}
                    className="
                      absolute top-3 right-3
                      bg-red-500 hover:bg-red-600
                      text-white text-xs font-semibold
                      px-3 py-1.5 rounded-lg
                      opacity-0 group-hover:opacity-100
                      transition-all duration-200
                      disabled:opacity-50 disabled:cursor-not-allowed
                      flex items-center gap-1.5
                      shadow-md z-10
                    "
                  >
                    {deletingId === resume.id ? '⏳ Deleting...' : '🗑️ Delete'}
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-8 mb-8">
              <Link to="/upload" className="primary-button w-fit text-lg font-semibold">
                + Upload New Resume
              </Link>
            </div>
          </>
        )}

        {!loadingResumes && resumes?.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-10 gap-4">
            <Link to="/upload" className="primary-button w-fit text-xl font-semibold">
              Upload Resume
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}