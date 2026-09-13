export const formatDisplayText = (value?: string | null): string => {
  if (typeof value !== "string") {
    return "";
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return "";
  }

  return trimmedValue.charAt(0).toUpperCase() + trimmedValue.slice(1);
};
