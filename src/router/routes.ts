import { RouteConfig } from 'vue-router';

const routes: RouteConfig[] = [
    {
        path: '/',
        component: () => import('layouts/MainLayout.vue'),
        children: [
            { path: '', component: () => import('pages/IndexPage.vue') },
        ],
    },

    {
        path: '/quiz/item-name-quiz',
        component: () => import('layouts/MainLayout.vue'),
        children: [
            { path: '', component: () => import('pages/Quiz/ItemNameQuizPage.vue') },
        ],
        props: true,
    },

    {
        path: '/room/:id',
        component: () => import('layouts/MainLayout.vue'),
        children: [
            { path: '', component: () => import('pages/Room/RoomPage.vue') },
        ],
    },

    {
        path: '/single-player',
        component: () => import('layouts/MainLayout.vue'),
        children: [
            { path: '', component: () => import('pages/SinglePlayerPage.vue') },
        ],
    },

    {
        path: '/rooms',
        component: () => import('layouts/MainLayout.vue'),
        children: [
            { path: '', component: () => import('pages/Room/RoomsPage.vue') },
        ],
    },

    // Always leave this as last one,
    // but you can also remove it
    {
        path: '*',
        component: () => import('pages/Error404Page.vue'),
    },
];

export default routes;
