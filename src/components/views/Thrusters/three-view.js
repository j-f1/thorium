import React, { Component } from "react";
import * as THREE from "three";
import OBJLoader from "three-obj-loader";
import { withApollo } from "react-apollo";
import gql from "graphql-tag";
import Arrow from "./arrow";
import Circle from "./circle";

OBJLoader(THREE);
window.THREE = THREE;

function degtorad(deg) {
  return deg * (Math.PI / 180);
}

class ThreeView extends Component {
  constructor(props) {
    super(props);
    const { width, height } = props.dimensions;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);

    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    this.renderer.setSize(width, height);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
    hemiLight.position.set(0, 500, 0);
    this.scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(-1, 0.75, 1);
    dirLight.position.multiplyScalar(50);
    dirLight.name = "dirlight";
    this.scene.add(dirLight);

    this.camera.position.y = 1;
    this.camera.position.z = 3;
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    this.objectGroup = new THREE.Group();

    this.makeArrows();
    this.makeCircles();
    this.scene.add(this.objectGroup);
  }
  makeArrows = () => {
    const arrowScaleVector = new THREE.Vector3(0.4, 0.4, 0.4);
    this.starboardArrow = new Arrow({
      rotation: new THREE.Euler(Math.PI / 2, 0, 0),
      position: new THREE.Vector3(1.2, 0, 0),
      scale: arrowScaleVector
    });
    this.portArrow = new Arrow({
      rotation: new THREE.Euler(Math.PI / 2, Math.PI, 0),
      position: new THREE.Vector3(-1.2, 0, 0),
      scale: arrowScaleVector
    });

    this.foreArrow = new Arrow({
      rotation: new THREE.Euler(Math.PI / 2, 0, Math.PI / 2),
      position: new THREE.Vector3(0, 0, 1.3),
      scale: arrowScaleVector
    });
    this.reverseArrow = new Arrow({
      rotation: new THREE.Euler(Math.PI / -2, 0, Math.PI / 2),
      position: new THREE.Vector3(0, 0, -1.3),
      scale: arrowScaleVector
    });

    this.upArrow = new Arrow({
      rotation: new THREE.Euler(0, 0, Math.PI / 2),
      position: new THREE.Vector3(0, 1, 0),
      scale: arrowScaleVector
    });
    this.downArrow = new Arrow({
      rotation: new THREE.Euler(0, 0, Math.PI / -2),
      position: new THREE.Vector3(0, -1, 0),
      scale: arrowScaleVector
    });

    this.objectGroup.add(this.starboardArrow);
    this.objectGroup.add(this.portArrow);
    this.objectGroup.add(this.foreArrow);
    this.objectGroup.add(this.reverseArrow);
    this.objectGroup.add(this.upArrow);
    this.objectGroup.add(this.downArrow);
  };
  makeCircles = () => {
    this.objectGroup.add(
      new Circle({
        rotation: new THREE.Euler(Math.PI / 2, 0, 0),
        color: 0xff0000
      })
    );
    this.objectGroup.add(
      new Circle({ rotation: new THREE.Euler(0, 0, 0), color: 0x00ff00 })
    );
    this.objectGroup.add(
      new Circle({
        rotation: new THREE.Euler(0, Math.PI / 2, 0),
        color: 0x0000ff
      })
    );
  };
  componentWillMount() {
    const query = gql`
      query GetAsset(
        $assetKey: String!
        $textureAsset: String!
        $simulatorId: ID
      ) {
        asset(assetKey: $assetKey, simulatorId: $simulatorId) {
          assetKey
          url
        }
        textureAsset: asset(
          assetKey: $textureAsset
          simulatorId: $simulatorId
        ) {
          assetKey
          url
        }
      }
    `;
    const variables = {
      assetKey: "/3D/Mesh/Simulator",
      textureAsset: "/3D/Texture/Simulator",
      simulatorId: this.props.simulatorId
    };
    this.props.client
      .query({
        query,
        variables
      })
      .then(res => {
        const meshSrc = (res.data.asset.url || "").replace(
          /http(s|):\/\/.*:[0-9]{4}/gi,
          ""
        );
        const texSrc = (res.data.textureAsset.url || "").replace(
          /http(s|):\/\/.*:[0-9]{4}/gi,
          ""
        );
        const objLoader = new window.THREE.OBJLoader();
        var texture = new THREE.TextureLoader().load(texSrc);
        var material = new THREE.MeshBasicMaterial({ map: texture });

        this.scene.add(this.cube);

        this.animate();
        objLoader.load(meshSrc, obj => {
          obj.scale.set(0.2, 0.2, 0.2);
          obj.children[0].material = material;
          this.objectGroup.add(obj);
        });
      });
  }
  componentWillReceiveProps({ direction, rotation }) {
    const directions = [
      "starboardArrow",
      "portArrow",
      "foreArrow",
      "reverseArrow",
      "upArrow",
      "downArrow"
    ];
    directions.forEach(d => {
      this[d].visible = false;
    });
    if (direction.x > 0.2) this.portArrow.visible = true;
    if (direction.x < -0.2) this.starboardArrow.visible = true;
    if (direction.y > 0.2) this.downArrow.visible = true;
    if (direction.y < -0.2) this.upArrow.visible = true;
    if (direction.z > 0.2) this.foreArrow.visible = true;
    if (direction.z < -0.2) this.reverseArrow.visible = true;

    if (rotation) {
      const rot = new THREE.Euler(
        degtorad(rotation.pitch),
        degtorad(rotation.yaw * -1),
        degtorad(rotation.roll)
      );
      this.objectGroup.rotation.setFromVector3(rot);
    }
  }
  componentDidMount() {
    document
      .getElementById("thrustersMount")
      .appendChild(this.renderer.domElement);
    this.animate();
  }
  animate = () => {
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.animate);
  };
  render() {
    return <div id="thrustersMount" />;
  }
}
export default withApollo(ThreeView);
