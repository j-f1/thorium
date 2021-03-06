import React from "react";

const Frame = ({ simulator }) => {
  const colors = {
    "1": "#701919",
    "2": "#704419",
    "3": "#707019",
    "4": "#18236f",
    "5": "#18236f",
    p: "#441970"
  };
  const color = colors[simulator.alertlevel] || colors["5"];
  return (
    <svg
      preserveAspectRatio="none"
      viewBox="0 0 1024 768"
      fillRule="evenodd"
      clipRule="evenodd"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit="1.5"
      pointerEvents="none"
      style={{ width: "100vw", height: "100vh" }}
    >
      <g id="Station-Frame-ORIG">
        <path
          id="Frame-Blur"
          filter="url(#blur)"
          d="M26,92.156L51.188,67L972.813,66.563L998.406,92.156L998,675.844L972.813,701L51.188,701L26,675.844L26,92.156Z"
          fill="none"
          stroke="#bfbfbf"
          strokeWidth="7"
        />
        <path
          id="Frame"
          d="M26,92.156L51.188,67L972.813,66.563L998.406,92.156L998,675.844L972.813,701L51.188,701L26,675.844L26,92.156Z"
          fill="none"
          stroke="#bfbfbf"
          strokeWidth="7"
        />
        <path
          id="Top-Curve"
          d="M1076,-56L-52,-56L-52,51.188L614.761,51.188L666.108,76.813L1052,76.813L1076,-56Z"
          fill={color}
          fillOpacity=".639"
        />
        <path
          id="Top-Stroke"
          d="M1077.06,-58.265L1077.92,-57.603L1078.42,-56.639L1078.46,-55.555L1054.46,77.257C1054.06,78.346 1053.27,79.088 1052,79.313L666.108,79.313C665.536,79.246 665.533,79.245 664.991,79.049L614.172,53.688L-52,53.688L-52.957,53.497C-53.762,52.959 -53.771,52.95 -54.31,52.144L-54.5,51.188L-54.5,-56L-54.31,-56.957C-53.771,-57.762 -53.762,-57.771 -52.957,-58.31L-52,-58.5L1076,-58.5C1076.35,-58.422 1076.71,-58.343 1077.06,-58.265ZM-49.5,-53.5L-49.5,48.688L614.761,48.688C615.334,48.754 615.336,48.755 615.878,48.951L666.697,74.313L1049.91,74.313L1073.01,-53.5C698.838,-53.5 324.669,-53.5 -49.5,-53.5Z"
          fill="#bfbfbf"
          fillRule="nonzero"
        />
        <path
          id="Top-Stroke-Blur"
          filter="url(#blur)"
          d="M1077.06,-58.265L1077.92,-57.603L1078.42,-56.639L1078.46,-55.555L1054.46,77.257C1054.06,78.346 1053.27,79.088 1052,79.313L666.108,79.313C665.536,79.246 665.533,79.245 664.991,79.049L614.172,53.688L-52,53.688L-52.957,53.497C-53.762,52.959 -53.771,52.95 -54.31,52.144L-54.5,51.188L-54.5,-56L-54.31,-56.957C-53.771,-57.762 -53.762,-57.771 -52.957,-58.31L-52,-58.5L1076,-58.5C1076.35,-58.422 1076.71,-58.343 1077.06,-58.265ZM-49.5,-53.5L-49.5,48.688L614.761,48.688C615.334,48.754 615.336,48.755 615.878,48.951L666.697,74.313L1049.91,74.313L1073.01,-53.5C698.838,-53.5 324.669,-53.5 -49.5,-53.5Z"
          fill="#bfbfbf"
          fillRule="nonzero"
        />
        <path
          d="M1076,-56L-52,-56L-52,51.188L614.761,51.188L666.108,76.813L1052,76.813L1076,-56Z"
          fill={color}
          fillOpacity=".639"
          transform="rotate(180 512 383.906)"
          id="Bottom-Curve"
        />
        <path
          d="M665.534,79.246L664.991,79.049L614.172,53.688L-52,53.687L-52.957,53.497L-53.768,52.955L-54.31,52.144L-54.5,51.187L-54.5,-56C-54.311,-56.95 -54.306,-56.962 -53.768,-57.768L-52.957,-58.31L-52,-58.5L1076,-58.5L1077.06,-58.265L1077.92,-57.603L1078.42,-56.639L1078.46,-55.555L1054.46,77.257C1054.46,77.257 1054.89,78.805 1052,79.313L666.108,79.313C665.917,79.29 665.726,79.268 665.534,79.246ZM1049.91,74.313L1073.01,-53.5L-49.5,-53.5L-49.5,48.687L614.761,48.688C615.334,48.754 615.336,48.755 615.878,48.951L666.697,74.313C794.435,74.313 922.173,74.313 1049.91,74.313Z"
          fill="#bfbfbf"
          fillRule="nonzero"
          id="Bottom-Stroke-Blur"
          filter="url(#blur)"
          transform="rotate(180 512 383.906)"
        />
        <path
          d="M665.534,79.246L664.991,79.049L614.172,53.688L-52,53.687L-52.957,53.497L-53.768,52.955L-54.31,52.144L-54.5,51.187L-54.5,-56C-54.311,-56.95 -54.306,-56.962 -53.768,-57.768L-52.957,-58.31L-52,-58.5L1076,-58.5L1077.06,-58.265L1077.92,-57.603L1078.42,-56.639L1078.46,-55.555L1054.46,77.257C1054.46,77.257 1054.89,78.805 1052,79.313L666.108,79.313C665.917,79.29 665.726,79.268 665.534,79.246ZM1049.91,74.313L1073.01,-53.5L-49.5,-53.5L-49.5,48.687L614.761,48.688C615.334,48.754 615.336,48.755 615.878,48.951L666.697,74.313C794.435,74.313 922.173,74.313 1049.91,74.313Z"
          fill="#bfbfbf"
          fillRule="nonzero"
          transform="rotate(180 512 383.906)"
          id="Bottom-Stroke"
        />
      </g>
      <defs>
        <filter id="blur">
          <fegaussianblur in="SourceGraphic" stdDeviation="5,5" />
        </filter>
      </defs>
    </svg>
  );
};

export default Frame;
