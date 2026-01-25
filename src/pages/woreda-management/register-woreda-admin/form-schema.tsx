// subcity-management/form-schema.ts
import * as yup from "yup";

export default yup.object().shape({
  name: yup.object().shape({
    en: yup.string().required("English name is required"),
    am: yup.string().required("Amharic name is required"),
  }),
  description: yup.string().required("Description is required"),
});
