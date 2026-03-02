import {Link, useNavigate, useParams} from "react-router";
import {useEffect, useState} from "react";
import {usePuterStore} from "~/lib/puter";
import Summary from "~/components/feedback/Summary";
import ATS from "~/components/feedback/ATS";
import Details from "~/components/feedback/Details";

export const meta = () => ([
    { title: 'HireLens | Review' },
    { name: 'description', content: 'Detailed overview of your resume' },
])

const Resume = () => {
    const { auth, isLoading, fs, kv } = usePuterStore();
    const { id } = useParams();
    const [imageUrl, setImageUrl] = useState('');
    const [resumeUrl, setResumeUrl] = useState('');
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [errorMsg, setErrorMsg] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if(!isLoading && !auth.isAuthenticated) {
            navigate(`/auth?next=/resume/${id}`);
        }
    }, [isLoading]);

    useEffect(() => {
        const loadResume = async () => {
            try {
                const resume = await kv.get(`resume:${id}`);

                if(!resume) {
                    setErrorMsg('Resume not found. It may have been deleted.');
                    return;
                }

                const data = JSON.parse(resume);
                console.log('Loaded resume data:', data);

                // Check if feedback exists and is valid
                if(!data.feedback) {
                    setErrorMsg('Feedback not found. The AI analysis may have failed. Please try uploading again.');
                    return;
                }

                // Load PDF
                const resumeBlob = await fs.read(data.resumePath);
                if(resumeBlob) {
                    const pdfBlob = new Blob([resumeBlob], { type: 'application/pdf' });
                    setResumeUrl(URL.createObjectURL(pdfBlob));
                }

                // Load image
                const imageBlob = await fs.read(data.imagePath);
                if(imageBlob) {
                    setImageUrl(URL.createObjectURL(imageBlob));
                }

                setFeedback(data.feedback);
                console.log('Feedback loaded:', data.feedback);

            } catch(error) {
                console.error('Error loading resume:', error);
                setErrorMsg('Something went wrong loading your resume. Please go back and try again.');
            }
        }

        if(id) loadResume();
    }, [id]);

    return (
        <main className="!pt-0">
            <nav className="resume-nav">
                <Link to="/" className="back-button">
                    <img src="/icons/back.svg" alt="back" className="w-2.5 h-2.5" />
                    <span className="text-gray-800 text-sm font-semibold">Back to Homepage</span>
                </Link>
            </nav>

            {/* Show error if something went wrong */}
            {errorMsg && (
                <div className="flex items-center justify-center p-8">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md text-center">
                        <p className="text-red-600 font-semibold text-lg mb-2">Oops!</p>
                        <p className="text-red-500">{errorMsg}</p>
                        <Link to="/upload" className="mt-4 inline-block bg-red-500 text-white px-4 py-2 rounded-lg">
                            Try Again
                        </Link>
                    </div>
                </div>
            )}

            {!errorMsg && (
                <div className="flex flex-row w-full max-lg:flex-col-reverse">
                    <section className="feedback-section bg-[url('/images/bg-small.svg')] bg-cover h-[100vh] sticky top-0 items-center justify-center">
                        {imageUrl && resumeUrl ? (
                            <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-w-xl w-fit">
                                <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                                    <img
                                        src={imageUrl}
                                        className="w-full h-full object-contain rounded-2xl"
                                        title="resume"
                                    />
                                </a>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-gray-400">Loading resume...</p>
                            </div>
                        )}
                    </section>

                    <section className="feedback-section">
                        <h2 className="text-4xl !text-black font-bold">Resume Review</h2>

                        {feedback ? (
                            <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
                                <Summary feedback={feedback} />
                                <ATS 
                                    score={feedback.ATS?.score ?? 0}
                                    suggestions={feedback.ATS?.tips ?? []}
                                />
                                <Details feedback={feedback} />
                            </div>
                        ) : (
                            !errorMsg && (
                                <div className="flex flex-col items-center gap-4">
                                    <img src="/images/resume-scan-2.gif" className="w-full" />
                                    <p className="text-gray-500">Loading your feedback...</p>
                                </div>
                            )
                        )}
                    </section>
                </div>
            )}
        </main>
    )
}

export default Resume