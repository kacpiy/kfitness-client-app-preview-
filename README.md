# 🏋️ kFitness Client App

Nowoczesna aplikacja PWA dla klubowiczów siłowni. Kompleksowe rozwiązanie do zarządzania karnetem, wejściami na siłownię i korzystania z dodatkowych usług klubu fitness.

## 🔧 Technologie

- **Vue.js 3** + Vite - nowoczesny framework frontend
- **TypeScript** - typowane JavaScript dla lepszej jakości kodu
- **TailwindCSS** - utility-first CSS framework
- **PWA** - Progressive Web App z offline support
- **Pinia** - zarządzanie stanem aplikacji
- **WebSocket** - komunikacja real-time z serwerem

## ⚡ Funkcjonalności

### 👤 Panel Użytkownika
- **Logowanie i autoryzacja** - bezpieczny dostęp do konta klubowicza
- **Profil użytkownika** - zarządzanie danymi osobowymi
- **Historia aktywności** - przegląd poprzednich wizyt i treningów

### 📊 Statystyki i Monitoring
- **Aktualna liczba osób** - sprawdź ile osób jest obecnie na siłowni
- **Własne statystyki** - czas treningów, częstotliwość wizyt
- **Wykresy aktywności** - wizualizacja postępów

### 💳 Karta Klubowicza
- **Status karnetu** - sprawdzenie ważności i pozostałych wejść

### 🚪 System Wejść
- **Kod QR** - wejście przez zeskanowanie kodu QR
- **Lokalizacja** - automatyczne wejście na podstawie GPS
- **WebSocket integration** - real-time komunikacja z systemem kontroli dostępu
- **Powiadomienia** - informacje o statusie wejścia

### ☀️ Solarium
- **Rezerwacja karnetów** - wybór karnetu i czasu trwania
- **Automatyczne włączanie** - integracja z Shelly/Supla
- **Timer sesji** - odliczanie czasu i automatyczne wyłączanie

### 🤝 System Poleceń
- **Polecanie znajomych** - udostępnianie kodów promocyjnych
- **Bonusy za polecenia** - nagrody za skuteczne polecenia
- **Śledzenie statusu** - informacje o poleconych osobach

## 📱 PWA Features

- **Instalacja na urządzeniu** - aplikacja może być zainstalowana jak natywna
- **Praca offline** - podstawowe funkcje działają bez internetu
- **Push notifications** - powiadomienia o ważnych wydarzeniach
- **Cache** - szybkie ładowanie dzięki cachowaniu

## 🔌 Integracje

### WebSocket
- Real-time komunikacja z serwerem

### Shelly/Supla
- Kontrola urządzeń IoT (solarium)
- Automatyzacja włączania/wyłączania
- Monitoring stanu urządzeń

### Geolokalizacja
- Automatyczne wykrywanie lokalizacji
- Wejścia na siłownię na podstawie GPS
