import { Event, Target, createEventName } from '@web-media/event-target';
import type { EventName } from '@web-media/event-target';

import type { Subscriber } from './DataSource';

export interface PureAtomName<T> {
  initialValue: T;
}
export interface FunctionAtomName<T> {
  initializeFunction: () => T;
}
export type AtomName<T> = PureAtomName<T> | FunctionAtomName<T>;

// eslint-disable-next-line max-len
export const AtomDefinition = <T = null>(initialValue: T) => Object.freeze({ initialValue }) as PureAtomName<T>;

export const FunctionalAtomDefinition = <T = null>(
  initializeFunction: () => T,
) => Object.freeze({ initializeFunction }) as FunctionAtomName<T>;

type SubscriberWrap<T> = (x: CustomEvent<T>) => void;

class NotRegisteredError extends Error {
  name = 'NotRegistered';

  constructor() {
    super('Could not find store with given name.');
  }
}

export class AtomStore {
  private readonly store: Map<AtomName<unknown>, unknown> = new Map();

  private readonly eventNameTable: Map<AtomName<unknown>, EventName<unknown>> = new Map();

  private readonly subscriberTable: Map<
  AtomName<unknown>,
  Set<SubscriberWrap<unknown>>
  > = new Map();

  private readonly SubScribeToWrapMap: WeakMap<
  Subscriber<any>,
  SubscriberWrap<any>
  > = new WeakMap();

  private readonly eventTarget = new Target();

  getSubScribersAndEventName<T>(name: AtomName<T>) {
    const subscribers = this.subscriberTable.get(name);
    const eventName = this.eventNameTable.get(name);

    if (!subscribers || !eventName) {
      throw new NotRegisteredError();
    }

    return {
      subscribers: subscribers as Set<SubscriberWrap<T>>,
      eventName: eventName as EventName<T>,
    };
  }

  register<T>(name: AtomName<T>) {
    if (this.store.has(name)) {
      return;
    }

    if ('initializeFunction' in name) {
      this.store.set(name, name.initializeFunction());
    } else {
      this.store.set(name, name.initialValue);
    }
    this.eventNameTable.set(name, createEventName());
    this.subscriberTable.set(name, new Set());
  }

  deregister<T>(name: AtomName<T>) {
    this.store.delete(name);

    const { subscribers, eventName } = this.getSubScribersAndEventName(name);

    subscribers.forEach((subscriber) => {
      this.eventTarget.off(eventName, subscriber);
    });

    this.subscriberTable.delete(name);
  }

  subscribe<T>(name: AtomName<T>, fn: Subscriber<T>) {
    const { subscribers, eventName } = this.getSubScribersAndEventName(name);

    const listener: SubscriberWrap<T> = (x: CustomEvent<T>) => {
      fn(x.detail);
    };

    (subscribers as Set<SubscriberWrap<T>>).add(listener);

    this.eventTarget.on(eventName, listener);
    this.SubScribeToWrapMap.set(fn, listener);

    return () => this.unsubscribe(name, fn);
  }

  unsubscribe<T>(name: AtomName<T>, fn: Subscriber<T>) {
    const { subscribers, eventName } = this.getSubScribersAndEventName(name);

    const listener = this.SubScribeToWrapMap.get(fn);
    if (listener) {
      this.SubScribeToWrapMap.delete(listener);
      this.eventTarget.off(eventName, listener);
      subscribers.delete(listener);
    }
  }

  getValue<T>(name: AtomName<T>) {
    return this.store.get(name) as T;
  }

  setValue<T>(name: AtomName<T>, value: T) {
    this.store.set(name, value);

    const { eventName } = this.getSubScribersAndEventName(name);

    this.eventTarget.fire(new Event(eventName, value));
  }

  createStore<T>(initialValue: T, diff = false) {
    const store = AtomDefinition<T>(initialValue);
    this.register(store);
    const that = this;
    return {
      get value() {
        return that.getValue(store);
      },
      set value(x: T) {
        if (diff && that.getValue(store) === x) {
          return;
        }

        that.setValue(store, x);
      },
      reset(hard: boolean = false) {
        if (hard) {
          that.store.set(store, initialValue);
        } else {

          that.setValue(store, initialValue);
        }
      },
      subscribe: (fn: Subscriber<T>, instantlyTrigger = false) => {
        this.subscribe(store, fn);

        if (instantlyTrigger) {
          fn(that.getValue(store));
        }
      },
    };
  }

  createMemorizedStore<T>(initialValue: T, key: string) {
    let localInitialValue = initialValue;

    try {
      const str = localStorage.getItem(key);
      if (!str) throw undefined;
      localInitialValue = JSON.parse(str);
    } catch (e) {}

    const store = AtomDefinition<T>(localInitialValue);
    this.register(store);
    const that = this;
    return {
      get value() {
        return that.getValue(store);
      },
      set value(x: T) {
        localStorage.setItem(key, JSON.stringify(x));
        that.setValue(store, x);
      },
      subscribe: (fn: Subscriber<T>, instantlyTrigger = false) => {
        this.subscribe(store, fn);

        if (instantlyTrigger) {
          fn(that.getValue(store));
        }
      },
    };
  }

  dispose() {
    this.store.clear();
    this.eventNameTable.clear();
    this.subscriberTable.clear();
  }
}