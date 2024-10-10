import { BASE_API_URL } from "@/config";
import SDK from "@hashfund/sdk";

export class Api {
  static #instance: SDK;

  static get instance() {
    if (!Api.#instance) Api.#instance = new SDK(BASE_API_URL);
    return Api.#instance;
  }
}
