import { format, add, parseISO } from "date-fns";

export const formatDate = (date, format) => {
  return;
};

export const formatDateGMTPlus3 = (date) => {
  return format(add(parseISO(date), { hours: 3 }), "MM/dd/yyyy, HH:mm:ss a");
};

export function parseTimeString(timeStr) {
  const [hours, minutes] = timeStr.split(":");
  const date = new Date();
  date.setHours(parseInt(hours), parseInt(minutes));
  return `${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
}
