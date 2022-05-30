import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import { loadFonts } from './plugins/webfontloader'
import { ResizeObserver } from "resize-observer";

loadFonts()

//This is an hack to make ResizeObserver working on older browsers.
//TODO: Develop a polyfill plugin to replace this hack
if(window.ResizeObserver === undefined) {
    // @ts-ignore
    window.ResizeObserver = ResizeObserver;
}


createApp(App)
  .use(vuetify)
  .mount('#app')
