import React, { useState } from "react";

export default function SEOForm() {
    const [url, setUrl] = useState("");
    const [results, setResults] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch("https://fictional-space-giggle-jj7vp5664jv6hpjjx-3000.preview.app.github.dev/seo-check", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url }),
            });

            if (!response.ok) {
                throw new Error("SEO analizi sırasında hata oluştu.");
            }

            const data = await response.json();
            setResults(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-xl mx-auto bg-white rounded-xl shadow-md">
            <h1 className="text-2xl font-bold mb-4">🔍 SEO Analiz Aracı</h1>

            <form onSubmit={handleSubmit} className="mb-4">
                <input
                    type="url"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                    className="w-full p-2 border rounded-md"
                />
                <button
                    type="submit"
                    className="mt-2 w-full bg-blue-500 text-white py-2 rounded-md"
                    disabled={loading}
                >
                    {loading ? "Analiz ediliyor..." : "SEO Analizi Yap"}
                </button>
            </form>

            {error && <p className="text-red-500">{error}</p>}

            {results && (
                <div className="mt-6">
                    <h2 className="text-xl font-semibold mb-2">📊 Analiz Sonuçları:</h2>
                    <ul className="list-disc pl-5">
                        {results.seoChecklist.map((item: any, index: number) => (
                            <li key={index} className="mb-2">
                                {item.item}: {item.status} – <strong>{item.value}</strong>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}