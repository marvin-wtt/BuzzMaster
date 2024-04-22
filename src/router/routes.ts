import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      {
        path: 'devices',
        component: () => import('pages/DevicesPage.vue'),
        meta: {
          title: 'devices.title',
        },
      },
      {
        path: 'gameModes',
        children: [
          {
            path: '',
            component: () => import('pages/gameModes/GameModesIndexPage.vue'),
            meta: {
              title: 'gameMode.title',
            },
          },
          {
            path: 'buzzer',
            name: 'buzzer-game',
            component: () => import('pages/gameModes/BuzzerGamePage.vue'),
            meta: {
              title: 'gameMode.buzzer.title',
            },
          },
          {
            path: 'quiz',
            name: 'quiz-game',
            component: () => import('pages/gameModes/QuizGamePage.vue'),
            meta: {
              title: 'gameMode.quiz.title',
            },
          },
          {
            path: 'stopwatch',
            name: 'stopwatch-game',
            component: () => import('pages/gameModes/StopwatchGamePage.vue'),
            meta: {
              title: 'gameMode.stopwatch.title',
            },
          },
        ],
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
