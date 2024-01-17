import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'devices', component: () => import('pages/DevicesPage.vue') },
      {
        path: 'questions',
        children: [
          {
            path: '',
            component: () => import('pages/questions/QuestionIndexPage.vue'),
          },
          {
            path: 'buzzer',
            name: 'buzzer-question',
            component: () => import('pages/questions/BuzzerQuestionPage.vue'),
          },
          {
            path: 'quiz',
            name: 'quiz-question',
            component: () => import('pages/questions/QuizQuestionPage.vue'),
          },
          {
            path: 'stopwatch',
            name: 'stopwatch-question',
            component: () =>
              import('pages/questions/StopwatchQuestionPage.vue'),
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
