export const LLM_PROVIDERS = [
  { id: "openai", name: "OpenAI" },
  { id: "anthropic", name: "Anthropic" },
  { id: "google", name: "Google" },
  { id: "azure", name: "Azure OpenAI" },
];

export const PROVIDER_TO_MODELS: Record<string, { id: string; name: string }[]> = {
  openai: [
    { id: "gpt-4o-mini", name: "GPT-4o mini" },
    { id: "gpt-4o", name: "GPT-4o" },
  ],
  anthropic: [
    { id: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet" },
    { id: "claude-3-haiku", name: "Claude 3 Haiku" },
  ],
  google: [
    { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro" },
    { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash" },
  ],
  azure: [
    { id: "gpt-4o-mini", name: "GPT-4o mini (Azure)" },
  ],
};

export const ROUTES = {
  api: {
    // Local Next.js API routes
    login: "/api/auth/login",
    logout: "/api/auth/logout",
    session: "/api/auth/session",

    user: "/api/user",
    models: "/api/models",
    userModelMapper: "/api/user-model-mapper",
  },
  pages: {
    dashboard: "/dashboard",
    home: "/",
    profile: "/profile",
    models: "/models",
  },
};


