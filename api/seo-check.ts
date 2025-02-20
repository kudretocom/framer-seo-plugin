import React, { useEffect, useState } from "react";

export default function SEOChecklist() {
    const [results, setResults] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const currentUrl = window.location.href;
        fetchSEOData(currentUrl);
    }, []);

    const fetchSEOData = async (url: string) => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch("https://framer-seo-plugin.vercel.app/api/seo-check", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url }),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch SEO data. Status: ${response.status}`);
            }

            const data = await response.json();
            setResults(data);
        } catch (err: any) {
            setError(err.message || "An unknown error occurred.");
        } finally {
            setLoading(false);
        }
    };

    const checklist = [
        { key: "title", label: "Meta Title", passed: results?.title ? true : false },
        { key: "description", label: "Meta Description", passed: results?.description ? true : false },
        { key: "h1", label: "H1 Tag", passed: results?.h1 ? true : false },
        { key: "alt", label: "Image Alt Attributes", passed: results?.alt ? true : false },
        { key: "mobile", label: "Mobile Friendly", passed: results?.mobile ? true : false },
        { key: "speed", label: "Page Speed", passed: results?.speed > 80 },
        { key: "canonical", label: "Canonical Tag", passed: results?.canonical ? true : false },
        { key: "og", label: "Open Graph Tags", passed: results?.og ? true : false },
        { key: "twitter", label: "Twitter Card", passed: results?.twitter ? true : false },
        { key: "robots", label: "Robots.txt & Sitemap", passed: results?.robots ? true : false },
    ];

    return (
        <div className="p-6 max-w-xl mx-auto bg-white rounded-xl shadow-md">
            <h1 className="text-2xl font-bold mb-4">🚀 SEO Checklist for Your Page</h1>
            {loading ? (
                <p>Loading SEO analysis...</p>
            ) : error ? (
                <p className="text-red-500">Error: {error}</p>
            ) : results ? (
                <ul className="space-y-2">
                    {checklist.map((item) => (
                        <li key={item.key} className="flex items-center">
                            {item.passed ? (
                                <span className="text-green-500">✅</span>
                            ) : (
                                <span className="text-red-500">❌</span>
                            )}
                            <span className="ml-2">{item.label}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No results available.</p>
            )}
        </div>
    );
}
