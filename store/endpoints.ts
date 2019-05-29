import { ActionContext, ActionTree, MutationTree } from "vuex";
import { RootState } from ".";

import { Languages } from "./i18n";

export const API_ROOT = "https://api2018.coscup.org";
export const name = "endpoints";

export enum Apis {
  main = "main",
  about = "about",
  programs = "programs",
  cohosts = "cohosts",
  sponsors = "sponsors",
  transportation = "transportation",
  staffs = "staffs"
}

export const types = {
  UPDATE_API: "updateApi"
};

type Endpoints = {
  [N in keyof typeof Apis]: string
};

export type APIEndpoints = {
  [L in keyof typeof Languages]: Endpoints
};

export type State = APIEndpoints & {
  __loaded: boolean;
};

const dummyEndpoints = Object.keys(Apis).reduce((collection, key) => {
  collection[key as any] = "";
  return collection;
}, {}) as Endpoints;

export const state = (): State => ({
  __loaded: false,

  "zh-TW": dummyEndpoints,
  en: dummyEndpoints,
  ja: dummyEndpoints
});

export interface Actions<S, R> extends ActionTree<S, R> {
  nuxtServerInit(context: ActionContext<S, R>): void;
}

export const actions: Actions<State, RootState> = {
  async nuxtServerInit({ commit }) {
    const response = await fetch(`${API_ROOT}/index.json`);
    const { index: data = {} } = await response.json();
    const apisWithLangs: APIEndpoints = Object.entries(Languages).reduce(
      (langs, [langCode, apiLang]) => {
        langs[langCode] = Object.entries(data[apiLang] || {}).reduce(
          (apis, [name, endpoint]) => {
            apis[name] = `${API_ROOT}${endpoint}`;

            return apis;
          },
          {} as Endpoints
        );

        return langs;
      },
      {} as APIEndpoints
    );

    commit(types.UPDATE_API, apisWithLangs);
  }
};

export const mutations: MutationTree<State> = {
  [types.UPDATE_API](state, apis: APIEndpoints) {
    state.__loaded = true;

    for (let key in apis) {
      state[key] = apis[key];
    }
  }
};
