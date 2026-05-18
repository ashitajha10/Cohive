import { BACKEND_URL } from "../services/api";

export const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) return null;
  if (avatarPath.startsWith('http') || avatarPath.startsWith('data:')) return avatarPath;
  return `${BACKEND_URL}${avatarPath}`;
};
