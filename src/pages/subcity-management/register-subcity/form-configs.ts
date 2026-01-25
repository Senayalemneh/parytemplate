// subcity-management/form-configs.ts
import { Field } from "../../../models/main";

export const getFields = (t: (key: string) => string): Field[] => [
  {
    key: "name.en",
    label: t("subcity.form.nameEnglish"),
    type: "text",
    should_take_full_width: false,
  },
  {
    key: "name.am",
    label: t("subcity.form.nameAmharic"),
    type: "text",
    should_take_full_width: false,
  },
  {
    key: "description",
    label: t("subcity.form.description"),
    type: "textarea",
    should_take_full_width: true,
  },
];

export const initialValues = {
  name: {
    en: "",
    am: "",
  },
  description: "",
};