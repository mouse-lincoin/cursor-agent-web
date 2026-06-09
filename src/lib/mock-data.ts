import type { ProjectGroup, UserProfile } from "@/types";

export const MOCK_PROJECT_GROUPS: ProjectGroup[] = [
  {
    id: "home",
    label: "Home",
    projects: [
      {
        id: "home-1",
        name: "全局技能在cursor中的新增",
        path: "~",
        sessions: [],
      },
    ],
  },
  {
    id: "tesseract",
    label: "tesseract",
    projects: [
      {
        id: "tess-1",
        name: "页面 404 错误",
        path: "~/tesseract",
        sessions: [{ id: "s1", title: "页面 404 错误", isCloud: true }],
      },
      {
        id: "tess-2",
        name: "Prd code implementa...",
        path: "~/tesseract",
        sessions: [{ id: "s2", title: "Prd code implementa...", isCloud: true }],
      },
      {
        id: "tess-3",
        name: "Prd readme 内容",
        path: "~/tesseract",
        sessions: [{ id: "s3", title: "Prd readme 内容", isCloud: true }],
      },
    ],
  },
  {
    id: "other",
    label: "",
    projects: [
      {
        id: "webrtc",
        name: "webrtc-ai-console",
        path: "~/webrtc-ai-console",
        sessions: [],
      },
      {
        id: "ce8",
        name: "compoundengine8",
        path: "~/compoundengine8",
        sessions: [],
      },
      {
        id: "ce8-cap",
        name: "CompoundEngine8",
        path: "~/CompoundEngine8",
        sessions: [],
      },
    ],
  },
];

export const MOCK_USER: UserProfile = {
  name: "福毅 林",
  plan: "Pro Plan",
};

export const MOCK_MODELS = [
  { id: "composer-2.5-fast", label: "Composer 2.5 Fast" },
  { id: "composer-2.5", label: "Composer 2.5" },
  { id: "auto", label: "Auto" },
];
