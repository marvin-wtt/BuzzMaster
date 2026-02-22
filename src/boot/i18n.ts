import { defineBoot } from '#q-app/wrappers';
import { createI18n } from 'vue-i18n';

import messages from 'src/i18n';
import { watch } from 'vue';

export type MessageLanguages = keyof typeof messages;
// Type-define 'en-US' as the master schema for the resource
export type MessageSchema = (typeof messages)['en-US'];

// See https://vue-i18n.intlify.dev/guide/advanced/typescript.html#global-resource-schema-type-definition
/* eslint-disable @typescript-eslint/no-empty-object-type */
declare module 'vue-i18n' {
  // define the locale messages schema
  export interface DefineLocaleMessage extends MessageSchema {}

  // define the datetime format schema
  export interface DefineDateTimeFormat {}

  // define the number format schema
  export interface DefineNumberFormat {}
}
/* eslint-enable @typescript-eslint/no-empty-object-type */

export default defineBoot(async ({ app }) => {
  const locale = window.appAPI?.getLocale
    ? await window.appAPI.getLocale()
    : 'en-US';

  const i18n = createI18n({
    locale,
    // @TODO kann in vue-i18n v12 entfernt werden, legacyAPI entfällt
    legacy: false,
    messages,
  });

  if (window.appAPI?.getLocale !== undefined) {
    watch(i18n.global.locale, (value, oldValue) => {
      if (oldValue !== value) {
        window.appAPI.setLocale(value);
      }
    });
  }

  // Set i18n instance on app
  app.use(i18n);
});
