//Reference: https://github.com/github/webauthn-json/blob/main/src/dev/demo/state.ts
import { RegistrationPublicKeyCredential } from "./browser-ponyfill/package.json";
import type { RegistrationResponseExtendedJSON } from "./browser-ponyfill/package.json";

export function getRegistrations(): RegistrationResponseExtendedJSON[] {
  const registrations = JSON.parse(
    localStorage.webauthnExampleRegistrations || "[]",
  );
  return registrations;
}

export function setRegistrations(
  registrations: RegistrationResponseExtendedJSON[],
): void {
  localStorage.webauthnExampleRegistrations = JSON.stringify(
    registrations,
    null,
    "  ",
  );
  displayRegistrations();
}

export function saveRegistration(
  registration: RegistrationPublicKeyCredential,
): void {
  const registrations = getRegistrations();
  registrations.push(registration.toJSON());
  setRegistrations(registrations);
}

function registrationElem(): HTMLTextAreaElement {
  return document.querySelector("#registrations")! as HTMLTextAreaElement;
}

export function displayRegistrations() {
  registrationElem().value = JSON.stringify(getRegistrations(), null, "  ");
}

export function withStatus(selector: string, fn: () => Promise<any>) {
  return async function () {
    document.querySelector("#error")!.textContent = "";
    document.querySelector(selector)!.textContent = "…";
    try {
      await fn();
      document.querySelector(selector)!.textContent = " ✅";
    } catch (e) {
      document.querySelector(selector)!.textContent = " ❌";
      console.error(e);
      document.querySelector("#error")!.textContent = e;
    }
  };
}

async function saveInput(): Promise<void> {
  document.querySelector("#error")!.textContent = "";
  registrationElem().style.backgroundColor = "rgba(255, 127, 0, 0.5)";
  try {
    setRegistrations(JSON.parse(registrationElem().value));
    registrationElem().style.backgroundColor = "rgba(0, 255, 0, 0.5)";
  } catch (e) {
    registrationElem().style.backgroundColor = "rgba(255, 0, 0, 0.5)";
    console.error(e);
    document.querySelector("#error")!.textContent = e;
  }
}

window.addEventListener("load", () => {
  try {
    displayRegistrations();
    registrationElem().addEventListener("keyup", saveInput);
    registrationElem().addEventListener("change", saveInput);
    registrationElem().addEventListener("paste", saveInput);
  } catch (e) {
    console.error(e);
  }
});
