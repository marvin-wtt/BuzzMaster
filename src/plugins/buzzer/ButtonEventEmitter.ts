import type { IButtonEventEmitter } from '@/plugins/buzzer/types';
import EventEmitter from 'events';

export class ButtonEventEmitter extends (EventEmitter as new () => IButtonEventEmitter) {}
