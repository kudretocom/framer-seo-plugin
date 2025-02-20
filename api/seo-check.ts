import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import * as cheerio from 'cheerio';
import dns from 'dns';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Yalnızca POST isteklerine izin verilir.' });
    }

    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'Lütfen analiz edilecek bir URL girin.' });
    }

    try {
        const start = Date.now();
        const { data } = await axios.get(url, { timeout: 10000 });
        const loadTime = Date.now() - start;

        const $ = cheerio.load(data);

        // Meta Etiket Kontrolleri
        const title = $('title').text() || 'Başlık bulunamadı';
        const description = $('meta[name="description"]').attr('content') || 'Açıklama bulunamadı';
        const h1 = $('h1').first().text() || 'H1 etiketi bulunamadı';
        const viewport = $('meta[name="viewport"]').attr('content') || 'Viewport etiketi yok';
        const robots = $('meta[name="robots"]').attr('content') || 'index, follow';

        // HTTPS Kontrolü
        const isHTTPS = url.startsWith('https://');

        // Sitemap Kontrolü
        const sitemapExists = await axios.head(`${url}/sitemap.xml`).then(() => true).catch(() => false);

        // DNS Kontrolü
        const dnsCheck = await new Promise((resolve) => {
            dns.lookup(new URL(url).hostname, (err) => {
                resolve(err ? '❌ DNS Hatası' : '✅ DNS Başarılı');
            });
        });

        // SEO Checklist
        const seoChecklist = [
            { item: 'Başlık Etiketi', status: title !== 'Başlık bulunamadı' ? '✅' : '❌', value: title },
            { item: 'Açıklama Etiketi', status: description !== 'Açıklama bulunamadı' ? '✅' : '❌', value: description },
            { item: 'H1 Etiketi', status: h1 !== 'H1 etiketi bulunamadı' ? '✅' : '❌', value: h1 },
            { item: 'Viewport Etiketi', status: viewport.includes('width=device-width') ? '✅' : '❌', value: viewport },
            { item: 'Robots Etiketi', status: robots.includes('index') ? '✅' : '⚠️', value: robots },
            { item: 'HTTPS Güvenliği', status: isHTTPS ? '✅' : '❌', value: isHTTPS ? 'Güvenli' : 'Güvensiz' },
            { item: 'Sayfa Yükleme Süresi', status: loadTime < 3000 ? '✅' : '⚠️', value: `${loadTime} ms` },
            { item: 'DNS Kontrolü', status: dnsCheck, value: dnsCheck },
            { item: 'Sitemap.xml Kontrolü', status: sitemapExists ? '✅' : '❌', value: sitemapExists ? 'Var' : 'Yok' },
        ];

        res.json({ url, title, description, h1, robots, seoChecklist });

    } catch (error: any) {
        console.error('SEO Analiz Hatası:', error.message);
        res.status(500).json({ error: 'URL analiz edilirken bir hata oluştu.', details: error.message });
    }
}