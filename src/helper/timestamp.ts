export const formatToPostgresTimestamp = (value: string) => {
  if (!value) return "";

  const date = new Date(value);

  if (isNaN(date.getTime())) {
    throw new Error("Invalid date");
  }

  return date.toISOString();
};
