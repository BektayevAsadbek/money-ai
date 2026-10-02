# Hamyon — AI budjet ilovasi

Claude Design'dagi **“Hamyon — AI budjet ilovasi”** kanvasidagi 20 ta ekran asosida yozilgan mobil-first web ilova (React + TypeScript + Vite).

## Ishga tushirish

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
```

Kompyuterda ilova 390×844 telefon ramkasida, telefonda esa to‘liq ekranda ochiladi.

### Bitta HTML fayl (claude.ai Artifact)

```bash
npm run build:artifact   # dist-artifact/hamyon.html — CSS va JS ichida
```

Bu faylda router manzillarni xotirada saqlaydi (`VITE_ROUTER=memory`). Oddiy build esa hash-routing ishlatadi (`/#/budget`), shuning uchun `dist/` ni istalgan statik hostingga (GitHub Pages, Vercel, Netlify) qo‘shimcha sozlamasiz qo‘yish mumkin.

## Ekranlar

| Bo‘lim | Yo‘l | Fayl |
|---|---|---|
| Xush kelibsiz · Telefon · Toifalar · Budjet tayyorlanmoqda | `/welcome`, `/onboarding/*` | `src/screens/Onboarding.tsx` |
| Asosiy | `/` | `src/screens/Main.tsx` |
| Tahlil (hafta / oy / yil, donut) | `/analytics` | `src/screens/Analytics.tsx` |
| Budjet (toifa limitlari) | `/budget` | `src/screens/Budget.tsx` |
| AI maslahatlar + chat | `/advice` | `src/screens/Advice.tsx` |
| Ovoz / Matn / Chek bilan kiritish | `/add/voice`, `/add/text`, `/add/scan` | `src/screens/Voice.tsx`, `Text.tsx`, `Scan.tsx` |
| Saqlandi | `/saved` | `src/screens/Success.tsx` |
| Amallar tarixi · Amal tafsiloti | `/history`, `/tx/:id` | `src/screens/History.tsx`, `Detail.tsx` |
| Jamg‘arma · Maqsad tafsiloti | `/goals`, `/goals/:id` | `src/screens/Goals.tsx` |
| Profil · Obunalar · Bildirishnomalar · Hamyon Plus | `/profile`, `/subscriptions`, `/notifications`, `/premium` | `src/screens/Account.tsx` |

## Arxitektura

- `src/styles.css` — dizayn tokenlari (`--bg #0E0F0C`, `--surface #17181A`, `--accent #C8F169` …), shriftlar: **Unbounded** (raqam/sarlavha) va **Onest** (matn).
- `src/data/store.tsx` — React Context store, `localStorage`da saqlanadi; balans, oylik daromad/xarajat va limitlar shu yerdan hisoblanadi.
- `src/data/seed.ts` — dizayndagi demo ma’lumotlar (balans 12 480 000, xarajat 5 340 000 …).
- `src/lib/ai.ts` — qurilmaning o‘zida ishlaydigan “AI”:
  - `parseEntries()` — “tushlik 45 000, benzin 150 ming, oylik tushdi 8,2 mln” → 3 ta amal (summa, toifa, sana);
  - `insights()` / `healthScore()` — limit, obuna va jamg‘arma bo‘yicha maslahatlar va moliyaviy ball;
  - `answer()` — Maslahat chatidagi oddiy savol-javob.
- Ovoz — brauzerning Web Speech API (`uz-UZ`); qo‘llab-quvvatlanmasa demo rejim.
- Chek — kamera/surat tanlash ishlaydi, OCR hozircha namuna chek qaytaradi (`recognise()` ni haqiqiy OCR/vision API bilan almashtirish kerak).

## Keyingi qadamlar

- `recognise()` (chek) va `parseEntries()` / `answer()` ni LLM yoki OCR backend bilan ulash.
- SMS tasdiqlash va haqiqiy autentifikatsiya (hozir “Kod olish” to‘g‘ridan-to‘g‘ri keyingi qadamga o‘tadi).
- Hamyon Plus narxlari: `src/screens/Account.tsx` → `PRICING` (dizayndagidek hozir `[YILLIK NARX]` kabi placeholder).
