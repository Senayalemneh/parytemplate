import React from "react";

import Subcity from "./subcity";
import District from "./district";
import Federal from "./federal";
import Regional from "./regional";

function allorgstruct() {
  return (
    <div>
      <Federal />
      <Regional />
      <Subcity />
      <District />
    </div>
  );
}

export default allorgstruct;
