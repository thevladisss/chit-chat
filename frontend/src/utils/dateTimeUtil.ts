import dayjs from "dayjs";

export const formatUnixTimestamp = (timestamp: number) => {
  return dayjs(timestamp).toString();
};
