import { logger } from "@/lib/logger";

// password strength validation utilities

export interface PasswordRequirement {
  label: string;
  met: boolean;
  test: (password: string) => boolean;
}

export interface PasswordStrength {
  score: number; // 0-100
  strength: "weak" | "fair" | "good" | "strong";
  requirements: PasswordRequirement[];
  isValid: boolean;
}

const requirements = [
  {
    label: "At least 8 characters",
    test: (password: string) => password.length >= 8,
  },
  {
    label: "Contains uppercase letter",
    test: (password: string) => /[A-Z]/.test(password),
  },
  {
    label: "Contains lowercase letter",
    test: (password: string) => /[a-z]/.test(password),
  },
  {
    label: "Contains number",
    test: (password: string) => /\d/.test(password),
  },
  {
    label: "Contains special character (!@#$%^&*)",
    test: (password: string) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
  },
];

export function checkPasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return {
      score: 0,
      strength: "weak",
      requirements: requirements.map((req) => ({
        label: req.label,
        met: false,
        test: req.test,
      })),
      isValid: false,
    };
  }

  const metRequirements = requirements.map((req) => ({
    label: req.label,
    met: req.test(password),
    test: req.test,
  }));

  const metCount = metRequirements.filter((req) => req.met).length;
  const score = (metCount / requirements.length) * 100;

  let strength: "weak" | "fair" | "good" | "strong";
  if (score < 40) {
    strength = "weak";
  } else if (score < 60) {
    strength = "fair";
  } else if (score < 80) {
    strength = "good";
  } else {
    strength = "strong";
  }

  // password is valid only if ALL requirements are met
  const isValid = metCount === requirements.length;

  logger.info(
    {
      score,
      strength,
      metRequirements: metCount,
      totalRequirements: requirements.length,
      isValid,
    },
    `[PASSWORD_STRENGTH] Password strength check:`
  );

  return {
    score,
    strength,
    requirements: metRequirements,
    isValid,
  };
}

export function getStrengthColor(
  strength: "weak" | "fair" | "good" | "strong"
): string {
  switch (strength) {
    case "weak":
      return "bg-red-500";
    case "fair":
      return "bg-orange-500";
    case "good":
      return "bg-yellow-500";
    case "strong":
      return "bg-green-500";
  }
}

export function getStrengthTextColor(
  strength: "weak" | "fair" | "good" | "strong"
): string {
  switch (strength) {
    case "weak":
      return "text-red-500";
    case "fair":
      return "text-orange-500";
    case "good":
      return "text-yellow-500";
    case "strong":
      return "text-green-500";
  }
}
