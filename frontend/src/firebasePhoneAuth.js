
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";

import { firebaseAuth } from "./firebase";

let recaptchaVerifier = null;
let confirmationResult = null;

export async function sendPhoneOtp(phoneNumber, containerId) {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
    recaptchaVerifier = null;
  }

  recaptchaVerifier = new RecaptchaVerifier(
    firebaseAuth,
    containerId,
    {
      size: "normal",
    }
  );

  try {
    await recaptchaVerifier.render();

    confirmationResult = await signInWithPhoneNumber(
      firebaseAuth,
      phoneNumber,
      recaptchaVerifier
    );

    return { success: true };
  } catch (error) {
    recaptchaVerifier?.clear();
    recaptchaVerifier = null;
    throw error;
  }
}

export async function verifyPhoneOtp(code) {
  if (!confirmationResult) {
    throw new Error("Please request an OTP first.");
  }

  const result = await confirmationResult.confirm(code);

  const idToken = await result.user.getIdToken();

  return {
    phoneNumber: result.user.phoneNumber,
    idToken,
  };
}

export function clearPhoneOtp() {
  recaptchaVerifier?.clear();
  recaptchaVerifier = null;
  confirmationResult = null;
}
