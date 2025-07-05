class IslamicApp {
    constructor() {
        this.currentPage = 'home';
        this.userLocation = null;
        this.prayerTimes = {};
        this.qiblaDirection = 0;
        this.tasbihCount = 0;
        this.theme = localStorage.getItem('theme') || 'light';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSampleData();
        this.updateDateTime();
        this.setTheme(this.theme);
        this.requestLocation();
        
        // Hide loading screen after initialization
        setTimeout(() => {
            document.getElementById('loading-screen').style.opacity = '0';
            setTimeout(() => {
                document.getElementById('loading-screen').style.display = 'none';
            }, 500);
        }, 2000);
        
        // Update time every minute
        setInterval(() => this.updateDateTime(), 60000);
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const page = e.currentTarget.dataset.page;
                this.navigateToPage(page);
            });
        });

        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Quick actions
        document.querySelectorAll('.action-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.handleQuickAction(action);
            });
        });

        // Feature items
        document.querySelectorAll('.feature-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const feature = e.currentTarget.dataset.feature;
                this.handleFeature(feature);
            });
        });

        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Modal controls
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.closeModal(e.currentTarget.closest('.modal'));
            });
        });

        // Tasbih functionality
        document.getElementById('tasbih-btn').addEventListener('click', () => {
            this.incrementTasbih();
        });

        document.getElementById('reset-tasbih').addEventListener('click', () => {
            this.resetTasbih();
        });

        // Search functionality
        document.getElementById('quran-search-input').addEventListener('input', (e) => {
            this.searchQuran(e.target.value);
        });

        // Location button
        document.getElementById('location-btn').addEventListener('click', () => {
            this.requestLocation();
        });

        // Close modals when clicking outside
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal);
                }
            });
        });

        // Dhikr buttons
        document.querySelectorAll('.dhikr-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectDhikr(e.currentTarget.textContent);
            });
        });
    }

    navigateToPage(page) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-page="${page}"]`).classList.add('active');

        // Update pages
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
        });
        document.getElementById(`${page}-page`).classList.add('active');

        this.currentPage = page;

        // Load page-specific data
        if (page === 'quran') {
            this.loadQuranData();
        } else if (page === 'prayer') {
            this.loadPrayerTimes();
        } else if (page === 'qibla') {
            this.initQiblaCompass();
        }
    }

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        this.setTheme(this.theme);
        localStorage.setItem('theme', this.theme);
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        const themeIcon = document.querySelector('#theme-toggle i');
        themeIcon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }

    updateDateTime() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        
        const dateStr = now.toLocaleDateString('en-US', options);
        const islamicDate = this.getIslamicDate(now);
        
        document.getElementById('current-date').textContent = `${dateStr} • ${islamicDate}`;
        
        if (document.getElementById('current-date-prayer')) {
            document.getElementById('current-date-prayer').textContent = dateStr;
        }

        this.updateGreeting();
        this.updateNextPrayer();
    }

    updateGreeting() {
        const hour = new Date().getHours();
        let greeting;
        
        if (hour < 12) {
            greeting = 'Good Morning';
        } else if (hour < 17) {
            greeting = 'Good Afternoon';
        } else if (hour < 20) {
            greeting = 'Good Evening';
        } else {
            greeting = 'Good Night';
        }
        
        document.getElementById('greeting-text').textContent = `${greeting} • السلام عليكم`;
    }

    getIslamicDate(date) {
        // Simplified Islamic date calculation
        const islamicMonths = [
            'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
            'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Shaban',
            'Ramadan', 'Shawwal', 'Dhu al-Qidah', 'Dhu al-Hijjah'
        ];
        
        // This is a simplified calculation - in a real app, use a proper Islamic calendar library
        const islamicYear = 1445; // Current approximate Hijri year
        const islamicMonth = Math.floor(Math.random() * 12); // Random for demo
        const islamicDay = Math.floor(Math.random() * 29) + 1; // Random for demo
        
        return `${islamicDay} ${islamicMonths[islamicMonth]} ${islamicYear} AH`;
    }

    requestLocation() {
        if (navigator.geolocation) {
            document.getElementById('location-text').textContent = 'Getting location...';
            
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.userLocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    };
                    this.updateLocationDisplay();
                    this.calculatePrayerTimes();
                    this.calculateQiblaDirection();
                },
                (error) => {
                    console.error('Location error:', error);
                    this.showError('Unable to get your location. Please enable location services.');
                    this.loadDefaultLocation();
                }
            );
        } else {
            this.showError('Geolocation is not supported by this browser.');
            this.loadDefaultLocation();
        }
    }

    loadDefaultLocation() {
        // Default to Mecca coordinates
        this.userLocation = {
            latitude: 21.4225,
            longitude: 39.8262
        };
        document.getElementById('location-text').textContent = 'Mecca, Saudi Arabia (Default)';
        this.calculatePrayerTimes();
        this.calculateQiblaDirection();
    }

    async updateLocationDisplay() {
        try {
            // In a real app, use a geocoding service to get city name
            const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${this.userLocation.latitude}&longitude=${this.userLocation.longitude}&localityLanguage=en`);
            const data = await response.json();
            const locationText = `${data.city || data.locality || 'Unknown'}, ${data.countryName || 'Unknown'}`;
            
            document.getElementById('location-text').textContent = locationText;
            
            if (document.getElementById('current-location')) {
                document.getElementById('current-location').textContent = locationText;
            }
            
            if (document.getElementById('user-location')) {
                document.getElementById('user-location').textContent = locationText;
            }
        } catch (error) {
            console.error('Geocoding error:', error);
            document.getElementById('location-text').textContent = 'Location found';
        }
    }

    calculatePrayerTimes() {
        if (!this.userLocation) return;

        // Simplified prayer time calculation
        // In a real app, use a proper Islamic prayer time calculation library
        const now = new Date();
        const times = {
            fajr: this.addMinutesToTime('05:30', 0),
            dhuhr: this.addMinutesToTime('12:15', 0),
            asr: this.addMinutesToTime('15:45', 0),
            maghrib: this.addMinutesToTime('18:20', 0),
            isha: this.addMinutesToTime('19:45', 0)
        };

        this.prayerTimes = times;
        this.updatePrayerTimesDisplay();
    }

    addMinutesToTime(timeStr, minutes) {
        const [hours, mins] = timeStr.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, mins + minutes, 0, 0);
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
    }

    updatePrayerTimesDisplay() {
        const prayerNames = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
        const prayerItems = document.querySelectorAll('.prayer-time-item');
        
        prayerItems.forEach((item, index) => {
            const timeElement = item.querySelector('.prayer-time');
            if (timeElement && this.prayerTimes[prayerNames[index]]) {
                timeElement.textContent = this.prayerTimes[prayerNames[index]];
            }
        });

        this.updateNextPrayer();
        this.loadDetailedPrayerTimes();
    }

    updateNextPrayer() {
        if (!this.prayerTimes || Object.keys(this.prayerTimes).length === 0) return;

        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        const prayerNames = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
        let nextPrayer = null;
        let minDiff = Infinity;

        prayerNames.forEach(prayer => {
            const prayerTime = this.prayerTimes[prayer];
            if (prayerTime) {
                const [time, period] = prayerTime.split(' ');
                const [hours, minutes] = time.split(':').map(Number);
                let prayerMinutes = hours * 60 + minutes;
                
                if (period === 'PM' && hours !== 12) {
                    prayerMinutes += 12 * 60;
                } else if (period === 'AM' && hours === 12) {
                    prayerMinutes = minutes;
                }

                let diff = prayerMinutes - currentTime;
                if (diff < 0) {
                    diff += 24 * 60; // Next day
                }

                if (diff < minDiff) {
                    minDiff = diff;
                    nextPrayer = prayer;
                }
            }
        });

        if (nextPrayer) {
            const hours = Math.floor(minDiff / 60);
            const minutes = minDiff % 60;
            const timeStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
            
            document.getElementById('next-prayer').innerHTML = 
                `Next Prayer: <strong>${nextPrayer.charAt(0).toUpperCase() + nextPrayer.slice(1)} in ${timeStr}</strong>`;
        }
    }

    loadDetailedPrayerTimes() {
        const container = document.getElementById('prayer-times-detailed');
        if (!container) return;

        const prayerData = [
            { name: 'Fajr', arabic: 'الفجر', time: this.prayerTimes.fajr, icon: 'fas fa-sun' },
            { name: 'Dhuhr', arabic: 'الظهر', time: this.prayerTimes.dhuhr, icon: 'fas fa-sun' },
            { name: 'Asr', arabic: 'العصر', time: this.prayerTimes.asr, icon: 'fas fa-cloud-sun' },
            { name: 'Maghrib', arabic: 'المغرب', time: this.prayerTimes.maghrib, icon: 'fas fa-moon' },
            { name: 'Isha', arabic: 'العشاء', time: this.prayerTimes.isha, icon: 'fas fa-moon' }
        ];

        container.innerHTML = prayerData.map(prayer => `
            <div class="card">
                <div class="prayer-detail">
                    <div class="prayer-icon">
                        <i class="${prayer.icon}"></i>
                    </div>
                    <div class="prayer-info">
                        <h3>${prayer.name}</h3>
                        <p class="arabic-text">${prayer.arabic}</p>
                    </div>
                    <div class="prayer-time-large">
                        ${prayer.time || '--:--'}
                    </div>
                </div>
            </div>
        `).join('');
    }

    calculateQiblaDirection() {
        if (!this.userLocation) return;

        // Mecca coordinates
        const mecca = { latitude: 21.4225, longitude: 39.8262 };
        
        // Calculate bearing to Mecca
        const lat1 = this.userLocation.latitude * Math.PI / 180;
        const lat2 = mecca.latitude * Math.PI / 180;
        const deltaLng = (mecca.longitude - this.userLocation.longitude) * Math.PI / 180;

        const x = Math.sin(deltaLng) * Math.cos(lat2);
        const y = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);

        let bearing = Math.atan2(x, y) * 180 / Math.PI;
        bearing = (bearing + 360) % 360;

        this.qiblaDirection = bearing;
        this.updateQiblaDisplay();
    }

    updateQiblaDisplay() {
        const qiblaDegreeElement = document.getElementById('qibla-degree');
        const qiblaIndicator = document.getElementById('qibla-indicator');
        const kaabaDistance = document.getElementById('kaaba-distance');

        if (qiblaDegreeElement) {
            qiblaDegreeElement.textContent = `${Math.round(this.qiblaDirection)}°`;
        }

        if (qiblaIndicator) {
            qiblaIndicator.style.transform = `rotate(${this.qiblaDirection}deg)`;
        }

        if (kaabaDistance && this.userLocation) {
            const distance = this.calculateDistance(
                this.userLocation.latitude,
                this.userLocation.longitude,
                21.4225,
                39.8262
            );
            kaabaDistance.textContent = `${Math.round(distance)} km`;
        }
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    initQiblaCompass() {
        if ('DeviceOrientationEvent' in window) {
            window.addEventListener('deviceorientation', (event) => {
                const compass = event.alpha; // Device heading
                if (compass !== null) {
                    const needle = document.getElementById('compass-needle');
                    if (needle) {
                        needle.style.transform = `translate(-50%, -50%) rotate(${360 - compass}deg)`;
                    }
                }
            });
        }
    }

    loadQuranData() {
        const surahsList = document.getElementById('surahs-list');
        if (!surahsList) return;

        // Sample Quran data
        const surahs = [
            { number: 1, name: 'Al-Fatihah', arabic: 'الفاتحة', verses: 7, revelation: 'Meccan' },
            { number: 2, name: 'Al-Baqarah', arabic: 'البقرة', verses: 286, revelation: 'Medinan' },
            { number: 3, name: 'Ali Imran', arabic: 'آل عمران', verses: 200, revelation: 'Medinan' },
            { number: 4, name: 'An-Nisa', arabic: 'النساء', verses: 176, revelation: 'Medinan' },
            { number: 5, name: 'Al-Maidah', arabic: 'المائدة', verses: 120, revelation: 'Medinan' },
            { number: 6, name: 'Al-Anam', arabic: 'الأنعام', verses: 165, revelation: 'Meccan' },
            { number: 7, name: 'Al-Araf', arabic: 'الأعراف', verses: 206, revelation: 'Meccan' },
            { number: 8, name: 'Al-Anfal', arabic: 'الأنفال', verses: 75, revelation: 'Medinan' },
            { number: 9, name: 'At-Tawbah', arabic: 'التوبة', verses: 129, revelation: 'Medinan' },
            { number: 10, name: 'Yunus', arabic: 'يونس', verses: 109, revelation: 'Meccan' }
        ];

        surahsList.innerHTML = surahs.map(surah => `
            <div class="surah-item" onclick="app.openSurah(${surah.number})">
                <div class="surah-number">${surah.number}</div>
                <div class="surah-info">
                    <div class="surah-name">${surah.name}</div>
                    <div class="surah-details">${surah.verses} verses • ${surah.revelation}</div>
                </div>
                <div class="surah-arabic">${surah.arabic}</div>
            </div>
        `).join('');

        // Load Juz data
        const juzList = document.getElementById('juz-list');
        if (juzList) {
            const juzData = Array.from({length: 30}, (_, i) => ({
                number: i + 1,
                name: `Juz ${i + 1}`,
                arabic: `الجزء ${i + 1}`
            }));

            juzList.innerHTML = juzData.map(juz => `
                <div class="surah-item" onclick="app.openJuz(${juz.number})">
                    <div class="surah-number">${juz.number}</div>
                    <div class="surah-info">
                        <div class="surah-name">${juz.name}</div>
                        <div class="surah-details">Para ${juz.number}</div>
                    </div>
                    <div class="surah-arabic">${juz.arabic}</div>
                </div>
            `).join('');
        }
    }

    openSurah(number) {
        // In a real app, this would navigate to the surah reading page
        this.showInfo(`Opening Surah ${number}. This would navigate to the reading interface.`);
    }

    openJuz(number) {
        // In a real app, this would navigate to the juz reading page
        this.showInfo(`Opening Juz ${number}. This would navigate to the reading interface.`);
    }

    searchQuran(query) {
        if (!query.trim()) {
            this.loadQuranData();
            return;
        }

        // Simple search simulation
        const surahsList = document.getElementById('surahs-list');
        const items = surahsList.querySelectorAll('.surah-item');
        
        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            if (text.includes(query.toLowerCase())) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }

    handleQuickAction(action) {
        switch (action) {
            case 'quran':
                this.navigateToPage('quran');
                break;
            case 'qibla':
                this.navigateToPage('qibla');
                break;
            case 'tasbih':
                this.openModal('tasbih-modal');
                break;
            case 'duas':
                this.showInfo('Daily Duas feature coming soon!');
                break;
            case 'names':
                this.showInfo('99 Names of Allah feature coming soon!');
                break;
            case 'hadith':
                this.showInfo('Hadith collection feature coming soon!');
                break;
            default:
                this.showInfo(`${action} feature coming soon!`);
        }
    }

    handleFeature(feature) {
        switch (feature) {
            case 'tasbih':
                this.openModal('tasbih-modal');
                break;
            case 'notifications':
                this.toggleNotifications();
                break;
            case 'theme':
                this.toggleTheme();
                break;
            case 'language':
                this.showInfo('Language settings coming soon!');
                break;
            case 'about':
                this.showAbout();
                break;
            default:
                this.showInfo(`${feature} feature coming soon!`);
        }
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    incrementTasbih() {
        this.tasbihCount++;
        document.getElementById('tasbih-count').textContent = this.tasbihCount;
        
        // Add vibration feedback if available
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
        
        // Add visual feedback
        const button = document.getElementById('tasbih-btn');
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 100);
    }

    resetTasbih() {
        this.tasbihCount = 0;
        document.getElementById('tasbih-count').textContent = this.tasbihCount;
    }

    selectDhikr(dhikr) {
        // In a real app, this would set the current dhikr being counted
        this.showInfo(`Selected: ${dhikr}`);
    }

    toggleNotifications() {
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                this.showInfo('Notifications are enabled');
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        this.showInfo('Notifications enabled successfully!');
                    }
                });
            } else {
                this.showInfo('Notifications are blocked. Please enable them in browser settings.');
            }
        } else {
            this.showInfo('Notifications are not supported in this browser.');
        }
    }

    showAbout() {
        this.showInfo('Sirate Mustaqeem v1.0\n\nA comprehensive Islamic companion app featuring Quran, prayer times, Qibla direction, and more.\n\nDeveloped with love for the Muslim community.');
    }

    showInfo(message) {
        alert(message); // In a real app, use a proper toast/notification system
    }

    showError(message) {
        const modal = document.getElementById('error-modal');
        const messageElement = document.getElementById('error-message');
        
        if (modal && messageElement) {
            messageElement.textContent = message;
            this.openModal('error-modal');
        } else {
            alert(`Error: ${message}`);
        }
    }

    loadSampleData() {
        // Load sample daily verse
        const verses = [
            {
                arabic: 'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا',
                translation: 'And whoever fears Allah - He will make for him a way out.',
                reference: 'Quran 65:2'
            },
            {
                arabic: 'وَاللَّهُ خَيْرُ الرَّازِقِينَ',
                translation: 'And Allah is the best of providers.',
                reference: 'Quran 62:11'
            },
            {
                arabic: 'وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ',
                translation: 'And my success is not but through Allah.',
                reference: 'Quran 11:88'
            }
        ];

        const randomVerse = verses[Math.floor(Math.random() * verses.length)];
        
        document.getElementById('daily-verse-arabic').textContent = randomVerse.arabic;
        document.getElementById('daily-verse-translation').textContent = randomVerse.translation;
        document.getElementById('daily-verse-reference').textContent = randomVerse.reference;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new IslamicApp();
});

// Add CSS for prayer detail styling
const additionalCSS = `
.prayer-detail {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.prayer-icon {
    width: 50px;
    height: 50px;
    background: var(--primary-color);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
}

.prayer-info h3 {
    margin: 0 0 0.25rem 0;
    font-size: 1.1rem;
    font-weight: 600;
}

.prayer-info .arabic-text {
    margin: 0;
    font-size: 1rem;
    color: var(--text-secondary);
}

.prayer-time-large {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--primary-color);
    margin-left: auto;
}

@media (max-width: 768px) {
    .prayer-detail {
        gap: 0.75rem;
    }
    
    .prayer-icon {
        width: 40px;
        height: 40px;
        font-size: 1rem;
    }
    
    .prayer-time-large {
        font-size: 1.2rem;
    }
}
`;

// Add the additional CSS to the document
const style = document.createElement('style');
style.textContent = additionalCSS;
document.head.appendChild(style);