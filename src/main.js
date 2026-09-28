import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

// No zooming: iOS Safari ignores user-scalable=no, so block pinch and double-tap zoom here too.
document.addEventListener('gesturestart', (e) => e.preventDefault())
document.addEventListener('dblclick', (e) => e.preventDefault(), { passive: false })

createApp(App).mount('#app')
