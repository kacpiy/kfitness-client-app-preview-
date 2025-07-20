import { createApp } from 'vue'
import './style.css'
import './assets/base.css'
import 'primeicons/primeicons.css'
import App from './App.vue'

import { createPinia } from 'pinia'

import router from './router/router'

import PrimeVue from 'primevue/config';

import PullToRefresh from './components/PullToRefresh.vue' 

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faAnglesRight, faArrowRightArrowLeft, faArrowsTurnToDots, faAward, faBarcode, faBars, faBell, faCircle, faCreditCard, faDoorOpen, faDumbbell, faEllipsis, faEllipsisVertical, faExclamationTriangle, faHeartPulse, faKey, faLocationDot, faPowerOff, faQrcode, faSpinner, faSun, faUserGraduate, faUsers, faUserShield } from '@fortawesome/free-solid-svg-icons'

library.add([faUserGraduate, faDumbbell, faHeartPulse, faDoorOpen, faKey, faSpinner, faEllipsis, faAward, faUsers, faSun, faPowerOff,
  faUserShield, faQrcode, faArrowRightArrowLeft, faArrowsTurnToDots, faBars, faBell, faEllipsisVertical, faCreditCard, faAnglesRight, faBarcode, faLocationDot, faCircle, faExclamationTriangle])

const pinia = createPinia()

const app = createApp(App)

app.component('font-awesome-icon', FontAwesomeIcon)
app.component('PullToRefresh', PullToRefresh)
app.use(pinia);
app.use(router);

app.mount('#app')