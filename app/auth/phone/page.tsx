import { PhoneLogin } from "@/components/auth/phone-login";

export const metadata = {
  title: "Phone Sign-In - CultureLens",
  description: "Sign in with your phone number",
};

export default function PhonePage() {
  return <PhoneLogin />;
}
