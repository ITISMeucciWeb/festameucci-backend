import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView
        },
        {
            path: '/scanner',
            name: 'scanner',
            component: () => import('../views/Scanner.vue')
        },
        {
            path: "/:catchAll(.*)",
            redirect: '/'
        }
    ]
})

export default router
