import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import { loadFonts } from './plugins/webfontloader'
import { ResizeObserver } from "resize-observer";
import router from "@/router";
import {apolloClient} from "@/apollo";
import {DefaultApolloClient} from "@vue/apollo-composable";

loadFonts()

//This is an hack to make ResizeObserver working on older browsers.
//TODO: Develop a polyfill plugin to replace this hack
if(window.ResizeObserver === undefined) {
    // @ts-ignore
    window.ResizeObserver = ResizeObserver;
}


createApp(App)
  .use(vuetify)
  .use(router)
  .provide(DefaultApolloClient, apolloClient)
  .mount('#app')
