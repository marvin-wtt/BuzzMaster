import type { IButtonEventEmitter } from 'src/plugins/buzzer/types';
import EventEmitter from 'events';

export class ButtonEventEmitter extends (EventEmitter as new () => IButtonEventEmitter) {}
