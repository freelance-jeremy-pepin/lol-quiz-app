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
        path: '/quiz/name-quiz',
        component: () => import('layouts/MainLayout.vue'),
        children: [
            { path: '', component: () => import('pages/Quiz/NameQuizPage.vue') },
        ],
        props: true,
    },

    {
        path: '/rooms',
        component: () => import('layouts/MainLayout.vue'),
        children: [
            { path: '', component: () => import('pages/RoomsPage.vue') },
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
