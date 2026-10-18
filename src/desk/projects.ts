import { GITHUB_ORG_D_AND_G, GITHUB_PROFILE, SITE } from "./links.js";

/* The projects shown on the monitor. Add a project by adding an object to PROJECTS. */

export interface ProjectImage {
  src: string;
  alt: string;
}

export interface ProjectLinks {
  /* Source repository on GitHub. */
  source: string;
  /* Live site, if there is one. */
  site?: string;
}

export interface Project {
  name: string;
  description: string;
  image: ProjectImage;
  links: ProjectLinks;
}

/* Image paths are relative to desk/index.html. */
export const PROJECTS: readonly Project[] = [
  {
    name: "Traveler Backend",
    description: "Web server and PostgreSQL database for a travel planning application.",
    image: { src: "../images/CrowLogo.svg", alt: "Crow logo" },
    links: { source: `${GITHUB_ORG_D_AND_G}/Traveler` },
  },
  {
    name: "ML Age Prediction Application",
    description: "Age prediction application using custom and fine-tuned (ResNet) convolutional neural networks.",
    image: { src: "../images/age-prediction-website-image.png", alt: "Age prediction website" },
    links: {
      source: `${GITHUB_PROFILE}/age-prediction`,
      site: `${SITE}/age-prediction`,
    },
  },
  {
    name: "C++ Library For Distributed Matrix Operations",
    description: "Custom C++ library to perform matrix operations and manipulations.",
    image: { src: "../images/matrix-project.png", alt: "Matrix library" },
    links: { source: `${GITHUB_PROFILE}/DistributedMatrixLibrary` },
  },
  {
    name: "TEST PROJECT",
    description: "TEST PROJECT",
    image: { src: "../images/matrix-project.png", alt: "Matrix library" },
    links: { source: "" },
  },
  {
    name: "TEST PROJECT",
    description: "TEST PROJECT",
    image: { src: "../images/matrix-project.png", alt: "Matrix library" },
    links: { source: "" },
  },
  {
    name: "TEST PROJECT",
    description: "TEST PROJECT",
    image: { src: "../images/matrix-project.png", alt: "Matrix library" },
    links: { source: "" },
  },
  {
    name: "TEST PROJECT",
    description: "TEST PROJECT",
    image: { src: "../images/matrix-project.png", alt: "Matrix library" },
    links: { source: "" },
  },
  {
    name: "TEST PROJECT",
    description: "TEST PROJECT",
    image: { src: "../images/matrix-project.png", alt: "Matrix library" },
    links: { source: "" },
  },
];
