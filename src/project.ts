import { makeProject } from "@motion-canvas/core";

import "./styles/global.css"; // <- import the css

import scene01 from "./scenes/scene01-coldopen?scene";
import scene02 from "./scenes/scene02-situation?scene";
import scene03 from "./scenes/scene03-colorrepo?scene";
import scene04 from "./scenes/scene04-monochrome?scene";
import scene05 from "./scenes/scene05-conflict?scene";
import scene06 from "./scenes/scene06-chaos?scene";
import scene07 from "./scenes/scene07-question?scene";
import scene08 from "./scenes/scene08-aitools?scene";
import scene09 from "./scenes/scene09-click?scene";
import scene10 from "./scenes/scene10-showcase?scene";
import scene11 from "./scenes/scene11-repos?scene";
import scene12 from "./scenes/scene12-website?scene";
import scene12b from "./scenes/scene12b-croptemplate?scene";
import scene13 from "./scenes/scene13-reflection?scene";
import scene14 from "./scenes/scene14-outro?scene";

export default makeProject({
  experimentalFeatures: true,
  scenes: [
    // scene01,   // Cold open — logo assembles
    scene02, // Situation — context switching
    scene03, // Situation — color per repo
    scene04, // Desire — monochromatic discovery
    scene05, // Conflict — everything blends
    scene06, // Conflict — manual chaos
    scene07, // Change — the question
    scene08, // Change — AI tools + scripts
    scene09, // Change — the click, all 8 gems
    scene10, // Result — gem showcase
    scene11, // Result — three repos
    scene12, // Result — the website
    scene12b, // Result — SVG crop pipeline
    scene13, // Reflection — timeline
    scene14, // Outro — logo fades out
  ],
});
