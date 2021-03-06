import React from "react";
import { Asset } from "../../../helpers/assets";

import "./style.css";

export default props => {
  const data = JSON.parse(props.viewscreen.data);
  return (
    <div className={`viewscreen-video ${data.overlay ? "overlay" : ""}`}>
      <Asset asset={data.asset || "/Viewscreen/Videos/Ship Scans"}>
        {({ src }) => (
          <video
            src={`${window.location.origin}${src}`}
            autoPlay={data.autoplay !== false || true}
            muted
            loop={data.loop}
          />
        )}
      </Asset>
    </div>
  );
};
