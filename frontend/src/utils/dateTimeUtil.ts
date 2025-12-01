import dayjs from "dayjs";

export const formatUnixTimestamp = (
  timestamp: number,
  format = "MM/DD/YYYY HH:mm"
) => {
  return dayjs(timestamp).format(format).toString();
};
