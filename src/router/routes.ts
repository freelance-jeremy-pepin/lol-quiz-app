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
