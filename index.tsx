process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';
import dns from 'dns';

import cors from 'cors';
app.use(cors());

const app = express();
const port = 3000;

app.use(express.json());

// Ana Sayfa
app.get('/', (req, res) => {
    res.send('🚀 SEO Plugin Gelişmiş Sürüm Çalışıyor!');
});

// SEO Analiz Endpoint'i
app.post('/seo-check', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'Lütfen analiz edilecek bir URL girin.' });
    }

    try {
        const start = Date.now();
        const { data } = await axios.get(url);
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

        // Mobil Uyumluluk Kontrolü
        const isMobileFriendly = viewport.includes('width=device-width');

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
            { item: 'Viewport Etiketi', status: isMobileFriendly ? '✅' : '❌', value: viewport },
            { item: 'Robots Etiketi', status: robots.includes('index') ? '✅' : '⚠️', value: robots },
            { item: 'HTTPS Güvenliği', status: isHTTPS ? '✅' : '❌', value: isHTTPS ? 'Güvenli' : 'Güvensiz' },
            { item: 'Sayfa Yükleme Süresi', status: loadTime < 3000 ? '✅' : '⚠️', value: `${loadTime} ms` },
            { item: 'DNS Kontrolü', status: dnsCheck, value: dnsCheck },
            { item: 'Sitemap.xml Kontrolü', status: sitemapExists ? '✅' : '❌', value: sitemapExists ? 'Var' : 'Yok' },
        ];

        res.json({
            url,
            title,
            description,
            h1,
            viewport,
            robots,
            https: isHTTPS,
            loadTime: `${loadTime} ms`,
            dnsCheck,
            sitemapExists,
            seoChecklist,
        });

    } catch (error) {
        console.error('SEO Analiz Hatası:', error);
        res.status(500).json({ error: 'URL analiz edilirken bir hata oluştu.' });
    }
});

// Sunucu Başlatma
app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 SEO Plugin Gelişmiş Sürüm http://localhost:${port} üzerinde çalışıyor.`);
});