import type { Language } from "./settings";

/**
 * Tiny dictionary-based i18n. Use `t(lang, "Some English text")` everywhere a
 * literal user-facing string would otherwise live. If a key is missing from
 * the Bahasa Melayu dictionary we fall back to the English source string —
 * that keeps the UI safe even when a new string slips in untranslated.
 */

export const LANGUAGES: { id: Language; label: string; native: string; emoji: string }[] = [
  { id: "en", label: "English", native: "English", emoji: "🇬🇧" },
  { id: "ms", label: "Bahasa Melayu", native: "Bahasa Melayu", emoji: "🇲🇾" },
];

/** English source → Bahasa Melayu translations.
 *  Keep keys exactly as they appear in the UI source. */
const MS: Record<string, string> = {
  // Bottom nav
  "Home": "Laman",
  "Quests": "Misi",
  "Journal": "Jurnal",
  "Shop": "Kedai",
  "Profile": "Profil",

  // Onboarding & generic
  "Choose your language": "Pilih bahasa anda",
  "You can change this anytime in Settings.": "Anda boleh ubah ini bila-bila masa di Tetapan.",
  "Continue": "Teruskan",
  "Cancel": "Batal",
  "Save": "Simpan",
  "Saving…": "Menyimpan…",
  "Close": "Tutup",
  "Reset": "Set semula",
  "Done": "Selesai",
  "Retry": "Cuba lagi",
  "Loading the board…": "Memuatkan papan…",
  "Begin adventure": "Mulakan pengembaraan",
  "Begin journey": "Mulakan perjalanan",
  "Save changes": "Simpan perubahan",
  "Language": "Bahasa",
  "English": "Inggeris",
  "Bahasa Melayu": "Bahasa Melayu",

  // Adventure style picker
  "Adventure Style": "Gaya Pengembaraan",
  "Choose your Adventure Style": "Pilih Gaya Pengembaraan anda",
  "Pick the one that fits you best — you can change this anytime in Settings.":
    "Pilih yang paling sesuai dengan anda — boleh ubah bila-bila masa di Tetapan.",
  "Daily walking goal (meters)": "Sasaran berjalan harian (meter)",
  "Set anything you like — even 0. There's no minimum.":
    "Tetapkan apa sahaja — walaupun 0. Tiada minimum.",
  "The Wanderer": "Si Pengembara",
  "The standard adventure.": "Pengembaraan biasa.",
  "Walk a short distance to unlock your daily nature quest camera. The classic outdoor experience.":
    "Berjalan sedikit untuk membuka kamera misi alam harian anda. Pengalaman luar yang klasik.",
  "The Observer": "Si Pemerhati",
  "Adventures from anywhere.": "Pengembaraan dari mana sahaja.",
  "Window-friendly quests like spotting cloud shapes or interesting shadows. Set your own (any-size) walking goal — no minimums.":
    "Misi mesra tingkap seperti melihat bentuk awan atau bayang-bayang menarik. Tetapkan sasaran berjalan anda sendiri — tiada minimum.",
  "The Focused Voyager": "Si Pengembara Fokus",
  "Calm, clear, and steady.": "Tenang, jelas, dan stabil.",
  "Dyslexia-friendly font, high-contrast bold theme, and all bouncing/pulsing animations turned off.":
    "Fon mesra disleksia, tema kontras tinggi, dan animasi melantun/berdenyut dimatikan.",

  // Character creator
  "New explorer": "Penjelajah baru",
  "Edit explorer": "Sunting penjelajah",
  "Begin your story": "Mulakan kisah anda",
  "Refresh your story": "Segarkan kisah anda",
  "Pick an avatar, a name, and a motto to carry on every walk.":
    "Pilih avatar, nama, dan motto untuk dibawa pada setiap perjalanan.",
  "Avatar": "Avatar",
  "Accent": "Aksen",
  "Explorer": "Penjelajah",
  "Explorer name": "Nama penjelajah",
  "Motto / bio": "Motto / bio",
  "Wandering Fox": "Musang Mengembara",
  "Your name": "Nama anda",
  "Moss": "Lumut",
  "Leaf": "Daun",
  "Bloom": "Kembang",
  "Bark": "Kulit kayu",
  "Sky": "Langit",
  "Sun": "Matahari",

  // Home / index
  "Welcome back,": "Selamat kembali,",
  "Good morning,": "Selamat pagi,",
  "Today's quest": "Misi hari ini",
  "Window quest": "Misi tingkap",
  "Tap to capture proof": "Ketuk untuk tangkap bukti",
  "Sketch saved": "Lakaran disimpan",
  "Reroll": "Gulung semula",
  "Meet the cast": "Kenali kru",
  "Quest complete": "Misi selesai",
  "Read fact": "Baca fakta",
  "Retake": "Ambil semula",
  "Ready when you are": "Sedia bila anda sedia",
  "Start your walk": "Mulakan perjalanan",
  "of {x} km goal": "daripada sasaran {x} km",
  "tracking live": "menjejak langsung",
  "walked this trip": "dijalan trip ini",
  "quests today": "misi hari ini",
  "How are you feeling?": "Bagaimana perasaan anda?",
  "How do you feel now?": "Bagaimana anda rasa sekarang?",
  "Log your mood before heading out.": "Catat mood anda sebelum keluar.",
  "A quick check-in before we wrap up.": "Daftar masuk pantas sebelum kita selesai.",
  "Low": "Rendah",
  "Okay": "Okey",
  "Good": "Baik",
  "Great": "Hebat",
  "Walk in progress": "Perjalanan sedang berjalan",
  "Finish": "Selesai",
  "Waiting for GPS…": "Menunggu GPS…",
  "GPS locked · have fun out there 🍃": "GPS dikunci · seronoklah di luar sana 🍃",
  "Location denied — distance won't be tracked.": "Lokasi ditolak — jarak tidak akan dijejak.",
  "Geolocation unavailable in this browser.": "Geolokasi tidak tersedia di pelayar ini.",
  "Couldn't read location.": "Tidak dapat membaca lokasi.",
  "Starting GPS…": "Memulakan GPS…",
  "Nice walk! You went from": "Perjalanan yang baik! Anda berubah dari",
  "to": "kepada",
  "day streak": "hari berturut",
  "{x} day": "{x} hari",
  "{x} days": "{x} hari",

  // Daily extras
  "Today's extras": "Tambahan hari ini",
  "Tiny bonus moments from the woods. Tap when done.":
    "Detik bonus kecil dari hutan. Ketuk bila selesai.",
  "Tiny bonus moments from right where you are. Tap when done.":
    "Detik bonus kecil dari tempat anda berada. Ketuk bila selesai.",
  "All done!": "Semua selesai!",
  "Today's reflection": "Refleksi hari ini",
  "A line or two — just for you.": "Satu dua baris — untuk anda sahaja.",
  "Saved · +{x} coins": "Disimpan · +{x} duit",
  "Save · +{x}": "Simpan · +{x}",

  // Vitamin D
  "Sun check setup": "Persediaan semakan matahari",
  "Tell us a bit about you so we can suggest how long to walk for your daily vitamin D.":
    "Beritahu sedikit tentang anda supaya kami boleh cadangkan berapa lama untuk berjalan bagi vitamin D harian.",
  "Skin type (Fitzpatrick)": "Jenis kulit (Fitzpatrick)",
  "Age group": "Kumpulan umur",
  "What you usually wear outside": "Apa yang anda biasa pakai di luar",
  "Save & check sun": "Simpan & semak matahari",
  "Create your character first to save your sun profile.":
    "Cipta watak anda dahulu untuk menyimpan profil matahari.",
  "Vitamin D Tracker": "Penjejak Vitamin D",
  "Edit profile": "Sunting profil",
  "Wearing sunscreen?": "Memakai pelindung matahari?",
  "Check sun where I am": "Semak matahari di tempat saya",
  "Reading the sky…": "Membaca langit…",
  "{x} min outside": "{x} min di luar",
  "No sun D right now": "Tiada vitamin D matahari sekarang",
  "Recheck": "Semak semula",
  "Friendly estimate, not medical advice. UV data: open-meteo.com.":
    "Anggaran mesra, bukan nasihat perubatan. Data UV: open-meteo.com.",

  // Quests page
  "The Quest Board": "Papan Misi",
  "Bronze & Silver rotate weekly. Gold takes a whole month.":
    "Gangsa & Perak berputar mingguan. Emas mengambil sebulan penuh.",
  "Bronze": "Gangsa",
  "Silver": "Perak",
  "Gold": "Emas",
  "Bronze Quests": "Misi Gangsa",
  "Silver Quests": "Misi Perak",
  "Gold Quests": "Misi Emas",
  "No": "Tiada",
  "sketches yet": "lakaran lagi",
  "Active": "Aktif",
  "New batch in {x}d": "Kelompok baru dalam {x}h",
  "New month in {x}d": "Bulan baru dalam {x}h",
  "Already claimed earlier — nice work!": "Sudah dituntut sebelum ini — syabas!",
  "+{x} coins!": "+{x} duit!",
  "Couldn't claim that.": "Tidak dapat menuntutnya.",
  "{x} coins": "{x} duit",
  "Claimed": "Dituntut",
  "Claim": "Tuntut",
  "Sketch {x} more": "Lakar {x} lagi",
  "Sketch matching subjects in your journal to make progress. 🌿":
    "Lakar subjek sepadan dalam jurnal anda untuk membuat kemajuan. 🌿",

  // Journal
  "Field Records": "Rekod Lapangan",
  "Your Journal": "Jurnal Anda",
  "{x} discoveries collected": "{x} penemuan dikumpul",
  "{x} discovery collected": "{x} penemuan dikumpul",
  "All": "Semua",
  "Tree": "Pokok",
  "Plant": "Tumbuhan",
  "Flower": "Bunga",
  "Bird": "Burung",
  "Insect": "Serangga",
  "Mushroom": "Cendawan",
  "Stone": "Batu",
  "Water": "Air",
  "Other": "Lain-lain",
  "Your journal is empty": "Jurnal anda kosong",
  "Head outside, complete a quest, and snap your first proof.":
    "Keluar, selesaikan misi, dan tangkap bukti pertama anda.",
  "Did you know?": "Tahukah anda?",
  "From quest:": "Daripada misi:",

  // Shop
  "Welcome to the den": "Selamat datang ke sarang",
  "Björn's Shop": "Kedai Björn",
  "\"Pick something warm. The forest gets chilly.\"":
    "\"Pilih sesuatu yang hangat. Hutan boleh menjadi sejuk.\"",
  "Basics": "Asas",
  "Got it — {x}!": "Dapat — {x}!",
  "Couldn't buy that.": "Tidak dapat membeli itu.",
  "Not enough coins yet.": "Duit belum mencukupi.",
  "Bought": "Dibeli",
  "Wearing": "Memakai",
  "Wear it": "Pakainya",
  "Earn coins by saving sketches in your journal. 🌿":
    "Dapatkan duit dengan menyimpan lakaran dalam jurnal anda. 🌿",

  // Profile
  "Wardrobe": "Almari pakaian",
  "Your dress-up": "Pakaian anda",
  "Shop clothes": "Beli pakaian",
  "Customize character": "Sesuaikan watak",
  "Day streak": "Hari berturut",
  "Quests done": "Misi selesai",
  "Total km": "Jumlah km",
  "Badges": "Lencana",
  "Recent badges": "Lencana terkini",
  "Settings": "Tetapan",
  "Adventure style, accessibility, sound": "Gaya pengembaraan, kebolehcapaian, bunyi",

  // Settings page
  "Preferences": "Pilihan",
  "Changes how quests and walks work for you.": "Mengubah cara misi dan perjalanan untuk anda.",
  "Custom walking goal (meters)": "Sasaran berjalan tersuai (meter)",
  "Any number works — even 0. Set 0 to use this style's default":
    "Sebarang nombor — termasuk 0. Tetapkan 0 untuk menggunakan default gaya ini",
  "Visual & Audio": "Visual & Audio",
  "Quest celebration": "Sambutan misi",
  "Switch between confetti animations and a clean static message.":
    "Tukar antara animasi konfeti dan mesej statik bersih.",
  "✨ Super Sparkly": "✨ Sangat Berkilau",
  "Simple": "Ringkas",
  "Sound effects": "Kesan bunyi",
  "Play a chime when you complete a quest or earn coins.":
    "Mainkan loceng apabila anda selesaikan misi atau dapat duit.",
  "Nature sounds while reflecting": "Bunyi alam semasa berfikir",
  "Accessibility": "Kebolehcapaian",
  "Read to me": "Bacakan untuk saya",
  "Adds a 🔊 button next to quests, NPC dialogue, and fun facts.":
    "Menambah butang 🔊 di sebelah misi, dialog watak, dan fakta menarik.",
  "Narrator voice": "Suara pencerita",
  "Pick the voice flavor used to read quests aloud.":
    "Pilih jenis suara yang digunakan untuk membaca misi.",
  "Warm": "Hangat",
  "Bright": "Cerah",
  "Calm": "Tenang",
  "Storyteller": "Pencerita",
  "Voice note quests": "Misi nota suara",
  "Replace the camera with a microphone — describe what you found out loud.":
    "Ganti kamera dengan mikrofon — terangkan apa yang anda temui dengan suara.",
  "Auto-snap camera": "Auto-tangkap kamera",
  "A big tap-anywhere shutter banner — easier with shaky hands.":
    "Sepanduk pengatup ketuk-mana-mana yang besar — lebih mudah dengan tangan menggeletar.",
  "Settings are saved on this device.": "Tetapan disimpan pada peranti ini.",
  "Back to profile": "Kembali ke profil",
  "Back home": "Kembali ke laman",
  "Today": "Hari ini",

  // Cast
  "The Cast": "Kru",
  "A handful of woodland friends who take turns handing out quests.":
    "Beberapa rakan hutan yang bergilir-gilir memberikan misi.",

  // Customizer tabs
  "Customize": "Sesuaikan",
  "Style your explorer": "Gayakan penjelajah anda",
  "Skin": "Kulit",
  "Face": "Muka",
  "Hair": "Rambut",
  "Accessories": "Aksesori",
  "Clothing": "Pakaian",
  "Extras": "Tambahan",
  "Skin tone": "Warna kulit",
  "Body shape": "Bentuk badan",
  "Face shape": "Bentuk muka",
  "Head size": "Saiz kepala",
  "Smaller": "Lebih kecil",
  "Bigger": "Lebih besar",
  "Hair color": "Warna rambut",
  "Hairstyles": "Gaya rambut",
  "Bangs": "Poni",
  "Mix any bangs with any hairstyle.": "Campurkan apa-apa poni dengan apa-apa gaya rambut.",
  "Eyebrows": "Kening",
  "Facial hair": "Bulu muka",
  "Looking great!": "Nampak hebat!",
  "Not enough coins yet — earn more in your journal.":
    "Duit belum mencukupi — dapatkan lebih dalam jurnal anda.",
  "Couldn't apply that.": "Tidak dapat menggunakannya.",
  "Earrings": "Subang",
  "Necklace": "Rantai leher",
  "Bracelet": "Gelang",
  "Hair clip": "Klip rambut",
  "Glasses & more": "Cermin mata & lain-lain",
  "Tops": "Baju atas",
  "Bottoms": "Baju bawah",
  "Dresses": "Gaun",
  "Shoes": "Kasut",
  "Hats": "Topi",
  "Ear piercings": "Tindik telinga",
  "Face piercings": "Tindik muka",
  "Hearing aids & headphones": "Alat dengar & fon kepala",

  // Streak tree
  "Your streak tree": "Pokok bersiri anda",
  "Every day you complete a quest, your tree grows a little. Miss a day? That's okay — your tree just rests. It will keep growing the next time you return.":
    "Setiap hari anda selesaikan misi, pokok anda tumbuh sedikit. Terlepas sehari? Tak apa — pokok anda berehat. Ia akan terus tumbuh lain kali anda kembali.",
  "Seed": "Benih",
  "Sprout": "Tunas",
  "Sapling": "Anak pokok",
  "Young tree": "Pokok muda",
  "Flowering tree": "Pokok berbunga",
  "Full bloom": "Bunga penuh",
  "Ancient tree": "Pokok purba",
  "spring": "musim bunga",
  "summer": "musim panas",
  "autumn": "musim luruh",
  "winter": "musim sejuk",

  // Ambience labels
  "Morning birdsong": "Kicauan burung pagi",
  "Midday ocean": "Lautan tengah hari",
  "Evening surf": "Ombak petang",
  "Night crickets": "Cengkerik malam",

  // Misc
  "of": "daripada",
};

const DICTIONARIES: Record<Language, Record<string, string>> = {
  en: {},
  ms: MS,
};

/** Translate `key` (the English source) into the active language. Falls back
 *  to the original key if a translation is missing.
 *
 *  Supports `{x}` placeholders that are replaced by `vars.x`. */
export function t(
  lang: Language | null | undefined,
  key: string,
  vars?: Record<string, string | number>,
): string {
  const dict = DICTIONARIES[lang ?? "en"] ?? {};
  let out = dict[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      out = out.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return out;
}