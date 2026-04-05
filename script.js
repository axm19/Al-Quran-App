// 1. DOM Elements
const surahGrid = document.getElementById('surah-grid');
const surahDashboard = document.getElementById('surah-dashboard');
const heroCard = document.querySelector('.hero-verse-card');
const surahReading = document.getElementById('surah-reading-container');
const readingPanel = document.getElementById('ayah-reading-panel');
const backButton = document.getElementById('back-to-dashboard');
const readingArbTitle = document.getElementById('reading-surah-arb');
const readingEngTitle = document.getElementById('reading-surah-eng');

// 2. Fetch the Index (Dashboard)
async function fetchSurahs() {
    try {
        // FIXED: Using the "chapters" endpoint to load the dashboard list
        const response = await fetch('https://api.quran.com/api/v4/chapters?language=en');
        const data = await response.json();
        const chapters = data.chapters;

        surahGrid.innerHTML = ''; 

        chapters.forEach(surah => {
            const card = document.createElement('div');
            card.className = 'surah-card';
            card.innerHTML = `
                <div class="card-left">
                    <div class="surah-number-diamond"><span>${surah.id}</span></div>
                    <div class="eng-text">
                        <span class="eng-name">${surah.name_simple}</span>
                        <span class="eng-meaning">${surah.translated_name.name}</span>
                    </div>
                </div>
                <div class="card-right">
                    <span class="arb-name">${surah.name_arabic}</span>
                    <span class="ayah-count">Ayahs ${surah.verses_count}</span>
                </div>
            `;

            card.onclick = () => openSurahReader(surah);
            surahGrid.appendChild(card);
        });
    } catch (error) {
        console.error("Error fetching Surah List:", error);
    }
}

// 3. Open Surah Function with Translations
async function openSurahReader(surahData) {
    searchInput.value = '';
    surahDashboard.style.display = 'none';
    if(heroCard) heroCard.style.display = 'none';
    surahReading.style.display = 'block';

    readingPanel.innerHTML = '<p class="reading-status">Loading Surah text...</p>';
    readingArbTitle.textContent = surahData.name_arabic;
readingEngTitle.innerHTML = `<span style="direction: ltr; display: inline-block;">${surahData.id}. ${surahData.name_simple}</span>`;

    try {
        const response = await fetch(`https://api.quran.com/api/v4/verses/by_chapter/${surahData.id}?language=en&fields=text_uthmani&translations=149&per_page=300`);
        const ayahData = await response.json();

        readingPanel.innerHTML = '';

        // FIX: Add Bismillah image to the top of the reading panel
        if (surahData.id !== 9) { // Skip for Surah At-Tawbah
            const bismillah = document.createElement('div');
            // Standard Arabic Bismillah text
            bismillah.textContent = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ";
            bismillah.className = 'bismillah-text';
            readingPanel.appendChild(bismillah);

        }

        ayahData.verses.forEach(ayah => {
            const ayahRow = document.createElement('div');
            ayahRow.className = 'ayah-row';
            
            const ayahNumberArabic = Number(ayah.verse_number).toLocaleString('ar-EG');
            const endOfAyahGlyph = `\u06DD${ayahNumberArabic}`; 

            const translationText = (ayah.translations && ayah.translations.length > 0) 
                ? ayah.translations[0].text 
                : "Translation coming soon...";

            ayahRow.innerHTML = `
                <div class="ayah-content">
                    <div class="ayah-arabic" style="text-align: right; direction: rtl;">
                        ${ayah.text_uthmani} <span class="ayah-symbol">${endOfAyahGlyph}</span>
                    </div>
                    <div class="ayah-translation" style="text-align: left; direction: ltr; margin-top: 10px; color: #b0b0b0;">
                        ${translationText}
                    </div>
                </div>
            `;
            readingPanel.appendChild(ayahRow);
        });
        window.scrollTo(0,0);
    } catch (error) {
        console.error("Error fetching Ayahs:", error);
        readingPanel.innerHTML = '<p>Error loading Ayahs.</p>';
    }
}


// 4. Back Button Logic
// Place this right before the very last line of your file
backButton.addEventListener('click', () => {
    surahReading.style.display = 'none';
    surahDashboard.style.display = 'block';
    if(heroCard) heroCard.style.display = 'flex';
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// 5. Start the app
fetchSurahs();
// Get the search input element
const searchInput = document.getElementById('surah-search');

searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const allCards = document.querySelectorAll('.surah-card');
    let hasResults = false;

    allCards.forEach(card => {
        const engName = card.querySelector('.eng-name').textContent.toLowerCase();
        if (engName.includes(term)) {
            card.style.display = 'flex';
            hasResults = true;
        } else {
            card.style.display = 'none';
        }
    });

    // Handle "No Results" message
    const existingMsg = document.querySelector('.no-results');
    if (!hasResults && term !== '') {
        if (!existingMsg) {
            const msg = document.createElement('div');
            msg.className = 'no-results';
            msg.textContent = "No Surahs found matching your search.";
            surahGrid.appendChild(msg);
        }
    } else if (existingMsg) {
        existingMsg.remove();
    }
});