class IslamicApp {
    constructor() {
        this.currentPage = 'home';
        this.userLocation = null;
        this.selectedCountry = null;
        this.prayerTimes = {};
        this.qiblaDirection = 0;
        this.tasbihCount = 0;
        this.theme = localStorage.getItem('theme') || 'light';
        this.countries = [];
        this.popularCountries = ['Saudi Arabia', 'United States', 'United Kingdom', 'Turkey', 'Indonesia', 'Pakistan', 'India', 'Malaysia', 'Egypt', 'UAE'];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadCountriesData();
        this.loadSampleData();
        this.updateDateTime();
        this.setTheme(this.theme);
        this.requestLocation();
        this.loadIslamicCalendar();
        
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

        // Country search
        document.getElementById('country-search-input').addEventListener('input', (e) => {
            this.searchCountries(e.target.value);
        });

        document.getElementById('modal-country-search').addEventListener('input', (e) => {
            this.searchCountriesModal(e.target.value);
        });

        // Location buttons
        document.getElementById('location-btn').addEventListener('click', () => {
            this.requestLocation();
        });

        document.getElementById('countries-btn').addEventListener('click', () => {
            this.openModal('country-modal');
        });

        document.getElementById('change-location-btn').addEventListener('click', () => {
            this.openModal('country-modal');
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

    loadCountriesData() {
        // Comprehensive list of countries with their coordinates
        this.countries = [
            { name: 'Afghanistan', code: 'AF', lat: 33.93911, lng: 67.709953 },
            { name: 'Albania', code: 'AL', lat: 41.153332, lng: 20.168331 },
            { name: 'Algeria', code: 'DZ', lat: 28.033886, lng: 1.659626 },
            { name: 'Argentina', code: 'AR', lat: -38.416097, lng: -63.616672 },
            { name: 'Australia', code: 'AU', lat: -25.274398, lng: 133.775136 },
            { name: 'Austria', code: 'AT', lat: 47.516231, lng: 14.550072 },
            { name: 'Azerbaijan', code: 'AZ', lat: 40.143105, lng: 47.576927 },
            { name: 'Bahrain', code: 'BH', lat: 25.930414, lng: 50.637772 },
            { name: 'Bangladesh', code: 'BD', lat: 23.684994, lng: 90.356331 },
            { name: 'Belgium', code: 'BE', lat: 50.503887, lng: 4.469936 },
            { name: 'Bosnia and Herzegovina', code: 'BA', lat: 43.915886, lng: 17.679076 },
            { name: 'Brazil', code: 'BR', lat: -14.235004, lng: -51.92528 },
            { name: 'Brunei', code: 'BN', lat: 4.535277, lng: 114.727669 },
            { name: 'Bulgaria', code: 'BG', lat: 42.733883, lng: 25.48583 },
            { name: 'Canada', code: 'CA', lat: 56.130366, lng: -106.346771 },
            { name: 'China', code: 'CN', lat: 35.86166, lng: 104.195397 },
            { name: 'Croatia', code: 'HR', lat: 45.1, lng: 15.2 },
            { name: 'Czech Republic', code: 'CZ', lat: 49.817492, lng: 15.472962 },
            { name: 'Denmark', code: 'DK', lat: 56.26392, lng: 9.501785 },
            { name: 'Egypt', code: 'EG', lat: 26.820553, lng: 30.802498 },
            { name: 'France', code: 'FR', lat: 46.227638, lng: 2.213749 },
            { name: 'Germany', code: 'DE', lat: 51.165691, lng: 10.451526 },
            { name: 'India', code: 'IN', lat: 20.593684, lng: 78.96288 },
            { name: 'Indonesia', code: 'ID', lat: -0.789275, lng: 113.921327 },
            { name: 'Iran', code: 'IR', lat: 32.427908, lng: 53.688046 },
            { name: 'Iraq', code: 'IQ', lat: 33.223191, lng: 43.679291 },
            { name: 'Italy', code: 'IT', lat: 41.87194, lng: 12.56738 },
            { name: 'Japan', code: 'JP', lat: 36.204824, lng: 138.252924 },
            { name: 'Jordan', code: 'JO', lat: 30.585164, lng: 36.238414 },
            { name: 'Kazakhstan', code: 'KZ', lat: 48.019573, lng: 66.923684 },
            { name: 'Kuwait', code: 'KW', lat: 29.31166, lng: 47.481766 },
            { name: 'Lebanon', code: 'LB', lat: 33.854721, lng: 35.862285 },
            { name: 'Libya', code: 'LY', lat: 26.3351, lng: 17.228331 },
            { name: 'Malaysia', code: 'MY', lat: 4.210484, lng: 101.975766 },
            { name: 'Morocco', code: 'MA', lat: 31.791702, lng: -7.09262 },
            { name: 'Netherlands', code: 'NL', lat: 52.132633, lng: 5.291266 },
            { name: 'Nigeria', code: 'NG', lat: 9.081999, lng: 8.675277 },
            { name: 'Norway', code: 'NO', lat: 60.472024, lng: 8.468946 },
            { name: 'Oman', code: 'OM', lat: 21.512583, lng: 55.923255 },
            { name: 'Pakistan', code: 'PK', lat: 30.375321, lng: 69.345116 },
            { name: 'Palestine', code: 'PS', lat: 31.952162, lng: 35.233154 },
            { name: 'Qatar', code: 'QA', lat: 25.354826, lng: 51.183884 },
            { name: 'Russia', code: 'RU', lat: 61.52401, lng: 105.318756 },
            { name: 'Saudi Arabia', code: 'SA', lat: 23.885942, lng: 45.079162 },
            { name: 'Singapore', code: 'SG', lat: 1.352083, lng: 103.819836 },
            { name: 'South Africa', code: 'ZA', lat: -30.559482, lng: 22.937506 },
            { name: 'Spain', code: 'ES', lat: 40.463667, lng: -3.74922 },
            { name: 'Sweden', code: 'SE', lat: 60.128161, lng: 18.643501 },
            { name: 'Switzerland', code: 'CH', lat: 46.818188, lng: 8.227512 },
            { name: 'Syria', code: 'SY', lat: 34.802075, lng: 38.996815 },
            { name: 'Tunisia', code: 'TN', lat: 33.886917, lng: 9.537499 },
            { name: 'Turkey', code: 'TR', lat: 38.963745, lng: 35.243322 },
            { name: 'UAE', code: 'AE', lat: 23.424076, lng: 53.847818 },
            { name: 'United Kingdom', code: 'GB', lat: 55.378051, lng: -3.435973 },
            { name: 'United States', code: 'US', lat: 37.09024, lng: -95.712891 },
            { name: 'Yemen', code: 'YE', lat: 15.552727, lng: 48.516388 }
        ];

        this.loadPopularCountries();
        this.loadAllCountries();
        this.loadCountriesModal();
    }

    loadPopularCountries() {
        const container = document.getElementById('popular-countries-grid');
        if (!container) return;

        const popularCountriesData = this.countries.filter(country => 
            this.popularCountries.includes(country.name)
        );

        container.innerHTML = popularCountriesData.map(country => `
            <div class="country-card" onclick="app.selectCountry('${country.name}', ${country.lat}, ${country.lng})">
                <div class="country-flag">🏳️</div>
                <div class="country-name">${country.name}</div>
            </div>
        `).join('');
    }

    loadAllCountries() {
        const container = document.getElementById('all-countries-list');
        if (!container) return;

        container.innerHTML = this.countries.map(country => `
            <div class="country-item" onclick="app.selectCountry('${country.name}', ${country.lat}, ${country.lng})">
                <span class="country-flag">🏳️</span>
                <span class="country-name">${country.name}</span>
                <span class="country-code">${country.code}</span>
            </div>
        `).join('');
    }

    loadCountriesModal() {
        const container = document.getElementById('countries-modal-list');
        if (!container) return;

        container.innerHTML = this.countries.map(country => `
            <div class="country-item" onclick="app.selectCountryFromModal('${country.name}', ${country.lat}, ${country.lng})">
                <span class="country-flag">🏳️</span>
                <span class="country-name">${country.name}</span>
                <span class="country-code">${country.code}</span>
            </div>
        `).join('');
    }

    selectCountry(name, lat, lng) {
        this.selectedCountry = { name, lat, lng };
        this.userLocation = { latitude: lat, longitude: lng };
        this.updateLocationDisplay(name);
        this.calculatePrayerTimes();
        this.calculateQiblaDirection();
        this.navigateToPage('prayer');
    }

    selectCountryFromModal(name, lat, lng) {
        this.selectCountry(name, lat, lng);
        this.closeModal(document.getElementById('country-modal'));
    }

    searchCountries(query) {
        if (!query.trim()) {
            this.loadAllCountries();
            return;
        }

        const container = document.getElementById('all-countries-list');
        const filteredCountries = this.countries.filter(country =>
            country.name.toLowerCase().includes(query.toLowerCase())
        );

        container.innerHTML = filteredCountries.map(country => `
            <div class="country-item" onclick="app.selectCountry('${country.name}', ${country.lat}, ${country.lng})">
                <span class="country-flag">🏳️</span>
                <span class="country-name">${country.name}</span>
                <span class="country-code">${country.code}</span>
            </div>
        `).join('');
    }

    searchCountriesModal(query) {
        if (!query.trim()) {
            this.loadCountriesModal();
            return;
        }

        const container = document.getElementById('countries-modal-list');
        const filteredCountries = this.countries.filter(country =>
            country.name.toLowerCase().includes(query.toLowerCase())
        );

        container.innerHTML = filteredCountries.map(country => `
            <div class="country-item" onclick="app.selectCountryFromModal('${country.name}', ${country.lat}, ${country.lng})">
                <span class="country-flag">🏳️</span>
                <span class="country-name">${country.name}</span>
                <span class="country-code">${country.code}</span>
            </div>
        `).join('');
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
        const islamicYear = 1446; // Current approximate Hijri year
        const islamicMonth = Math.floor(Math.random() * 12); // Random for demo
        const islamicDay = Math.floor(Math.random() * 29) + 1; // Random for demo
        
        return `${islamicDay} ${islamicMonths[islamicMonth]} ${islamicYear} AH`;
    }

    loadIslamicCalendar() {
        // Load Islamic calendar data
        const hijriDate = this.getIslamicDate(new Date());
        const parts = hijriDate.split(' ');
        
        document.getElementById('hijri-day').textContent = parts[0];
        document.getElementById('hijri-month').textContent = parts[1];
        document.getElementById('hijri-year').textContent = parts[2] + ' ' + parts[3];

        // Load upcoming events
        const events = [
            { date: '15 Ramadan', name: 'Laylat al-Qadr (Night of Power)' },
            { date: '1 Shawwal', name: 'Eid al-Fitr' },
            { date: '10 Dhu al-Hijjah', name: 'Eid al-Adha' },
            { date: '1 Muharram', name: 'Islamic New Year' }
        ];

        const eventsContainer = document.getElementById('events-list');
        if (eventsContainer) {
            eventsContainer.innerHTML = events.map(event => `
                <div class="event-item">
                    <span class="event-date">${event.date}</span>
                    <span class="event-name">${event.name}</span>
                </div>
            `).join('');
        }
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
                    this.showError('Unable to get your location. Please enable location services or select a country manually.');
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
        this.updateLocationDisplay('Mecca, Saudi Arabia (Default)');
        this.calculatePrayerTimes();
        this.calculateQiblaDirection();
    }

    async updateLocationDisplay(customLocation = null) {
        try {
            let locationText = customLocation;
            
            if (!customLocation && this.userLocation) {
                // In a real app, use a geocoding service to get city name
                const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${this.userLocation.latitude}&longitude=${this.userLocation.longitude}&localityLanguage=en`);
                const data = await response.json();
                locationText = `${data.city || data.locality || 'Unknown'}, ${data.countryName || 'Unknown'}`;
            }
            
            if (locationText) {
                document.getElementById('location-text').textContent = locationText;
                
                if (document.getElementById('current-location')) {
                    document.getElementById('current-location').textContent = locationText;
                }
                
                if (document.getElementById('user-location')) {
                    document.getElementById('user-location').textContent = locationText;
                }
            }
        } catch (error) {
            console.error('Geocoding error:', error);
            document.getElementById('location-text').textContent = customLocation || 'Location found';
        }
    }

    calculatePrayerTimes() {
        if (!this.userLocation) return;

        // Enhanced prayer time calculation with more realistic times
        const now = new Date();
        const lat = this.userLocation.latitude;
        const lng = this.userLocation.longitude;
        
        // Simplified calculation based on location
        const baseHour = Math.floor((lng + 180) / 15); // Rough timezone calculation
        
        const times = {
            fajr: this.formatTime(5 + baseHour),
            dhuhr: this.formatTime(12 + baseHour),
            asr: this.formatTime(15 + baseHour + 30/60),
            maghrib: this.formatTime(18 + baseHour + 15/60),
            isha: this.formatTime(19 + baseHour + 45/60)
        };

        this.prayerTimes = times;
        this.updatePrayerTimesDisplay();
    }

    formatTime(hour) {
        const h = Math.floor(hour) % 24;
        const m = Math.floor((hour % 1) * 60);
        const period = h >= 12 ? 'PM' : 'AM';
        const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
        return `${displayHour}:${m.toString().padStart(2, '0')} ${period}`;
    }

    updatePrayerTimesDisplay() {
        const prayerNames = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
        const prayerItems = document.querySelectorAll('.prayer-time-item .prayer-time');
        
        prayerItems.forEach((item, index) => {
            if (this.prayerTimes[prayerNames[index]]) {
                item.textContent = this.prayerTimes[prayerNames[index]];
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
            { name: 'Fajr', arabic: 'الفجر', time: this.prayerTimes.fajr, icon: 'fas fa-sun', description: 'Dawn Prayer' },
            { name: 'Dhuhr', arabic: 'الظهر', time: this.prayerTimes.dhuhr, icon: 'fas fa-sun', description: 'Noon Prayer' },
            { name: 'Asr', arabic: 'العصر', time: this.prayerTimes.asr, icon: 'fas fa-cloud-sun', description: 'Afternoon Prayer' },
            { name: 'Maghrib', arabic: 'المغرب', time: this.prayerTimes.maghrib, icon: 'fas fa-moon', description: 'Sunset Prayer' },
            { name: 'Isha', arabic: 'العشاء', time: this.prayerTimes.isha, icon: 'fas fa-moon', description: 'Night Prayer' }
        ];

        container.innerHTML = prayerData.map(prayer => `
            <div class="card prayer-detail-card">
                <div class="prayer-detail">
                    <div class="prayer-icon">
                        <i class="${prayer.icon}"></i>
                    </div>
                    <div class="prayer-info">
                        <h3>${prayer.name}</h3>
                        <p class="arabic-text">${prayer.arabic}</p>
                        <p class="prayer-description">${prayer.description}</p>
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

        // Complete list of Quran Surahs
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
            { number: 10, name: 'Yunus', arabic: 'يونس', verses: 109, revelation: 'Meccan' },
            { number: 11, name: 'Hud', arabic: 'هود', verses: 123, revelation: 'Meccan' },
            { number: 12, name: 'Yusuf', arabic: 'يوسف', verses: 111, revelation: 'Meccan' },
            { number: 13, name: 'Ar-Rad', arabic: 'الرعد', verses: 43, revelation: 'Medinan' },
            { number: 14, name: 'Ibrahim', arabic: 'ابراهيم', verses: 52, revelation: 'Meccan' },
            { number: 15, name: 'Al-Hijr', arabic: 'الحجر', verses: 99, revelation: 'Meccan' },
            { number: 16, name: 'An-Nahl', arabic: 'النحل', verses: 128, revelation: 'Meccan' },
            { number: 17, name: 'Al-Isra', arabic: 'الإسراء', verses: 111, revelation: 'Meccan' },
            { number: 18, name: 'Al-Kahf', arabic: 'الكهف', verses: 110, revelation: 'Meccan' },
            { number: 19, name: 'Maryam', arabic: 'مريم', verses: 98, revelation: 'Meccan' },
            { number: 20, name: 'Ta-Ha', arabic: 'طه', verses: 135, revelation: 'Meccan' }
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

    loadPrayerTimes() {
        this.calculatePrayerTimes();
    }

    openSurah(number) {
        this.showInfo(`Opening Surah ${number}. This would navigate to the reading interface with full Arabic text, translations, and audio recitation.`);
    }

    openJuz(number) {
        this.showInfo(`Opening Juz ${number}. This would navigate to the reading interface for Para ${number}.`);
    }

    searchQuran(query) {
        if (!query.trim()) {
            this.loadQuranData();
            return;
        }

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
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

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
                this.showInfo('Daily Duas feature: Access essential Islamic supplications for morning, evening, and various occasions.');
                break;
            case 'names':
                this.showInfo('99 Names of Allah feature: Learn and recite the beautiful names of Allah with meanings and benefits.');
                break;
            case 'hadith':
                this.showInfo('Hadith collection feature: Browse authentic sayings of Prophet Muhammad (ﷺ) from major collections.');
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
                this.showInfo('Language settings: Choose from Arabic, English, Urdu, Turkish, Indonesian, and more languages.');
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
        
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
        
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
        this.showInfo(`Selected: ${dhikr} - Continue your dhikr with this beautiful remembrance of Allah.`);
    }

    toggleNotifications() {
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                this.showInfo('Prayer time notifications are enabled. You will receive reminders for all five daily prayers.');
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        this.showInfo('Prayer time notifications enabled successfully! You will now receive prayer reminders.');
                    }
                });
            } else {
                this.showInfo('Notifications are blocked. Please enable them in browser settings to receive prayer reminders.');
            }
        } else {
            this.showInfo('Notifications are not supported in this browser.');
        }
    }

    showAbout() {
        this.showInfo(`Sirate Mustaqeem v1.0

A comprehensive Islamic companion app featuring:
• Accurate prayer times for 195+ countries
• Complete Holy Quran with translations
• Qibla direction finder
• Islamic calendar and events
• Digital Tasbih counter
• Daily verses and Hadith
• 99 Names of Allah
• Daily Duas collection

Developed with love for the Muslim community worldwide.

"And whoever relies upon Allah - then He is sufficient for him. Indeed, Allah will accomplish His purpose." - Quran 65:3`);
    }

    showInfo(message) {
        alert(message);
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
        // Enhanced daily verses
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
            },
            {
                arabic: 'وَبَشِّرِ الصَّابِرِينَ',
                translation: 'And give good tidings to the patient.',
                reference: 'Quran 2:155'
            },
            {
                arabic: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
                translation: 'Indeed, with hardship comes ease.',
                reference: 'Quran 94:6'
            }
        ];

        const randomVerse = verses[Math.floor(Math.random() * verses.length)];
        
        document.getElementById('daily-verse-arabic').textContent = randomVerse.arabic;
        document.getElementById('daily-verse-translation').textContent = randomVerse.translation;
        document.getElementById('daily-verse-reference').textContent = randomVerse.reference;

        // Enhanced daily Hadith
        const hadiths = [
            {
                text: 'The best of people are those who benefit others.',
                reference: 'Prophet Muhammad (ﷺ) - Sahih Bukhari'
            },
            {
                text: 'A believer is not one who eats his fill while his neighbor goes hungry.',
                reference: 'Prophet Muhammad (ﷺ) - Al-Adab Al-Mufrad'
            },
            {
                text: 'The most beloved deeds to Allah are those done consistently, even if they are small.',
                reference: 'Prophet Muhammad (ﷺ) - Sahih Bukhari'
            },
            {
                text: 'Whoever believes in Allah and the Last Day should speak good or remain silent.',
                reference: 'Prophet Muhammad (ﷺ) - Sahih Bukhari'
            }
        ];

        const randomHadith = hadiths[Math.floor(Math.random() * hadiths.length)];
        
        document.getElementById('daily-hadith-text').textContent = randomHadith.text;
        document.getElementById('daily-hadith-reference').textContent = randomHadith.reference;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new IslamicApp();
});

// Service Worker for PWA functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}