import React, { Component } from "react";
import ReactDOM from "react-dom";
import gql from "graphql-tag";
import { graphql, withApollo } from "react-apollo";
import FontAwesome from "react-fontawesome";
import ContactContextMenu from "./contactContextMenu";
import { Row, Col, Container, Button, Input } from "reactstrap";
import { SliderPicker } from "react-color";
import tinycolor from "tinycolor2";
import Grid from "./GridDom";
import Nudge from "./nudge";
import { Asset } from "../../../helpers/assets";
import "./gridCore.css";

function distance3d(coord2, coord1) {
  const { x: x1, y: y1, z: z1 } = coord1;
  let { x: x2, y: y2, z: z2 } = coord2;
  return Math.sqrt((x2 -= x1) * x2 + (y2 -= y1) * y2 + (z2 -= z1) * z2);
}

const ADD_ARMY_CONTACT = gql`
  mutation(
    $id: ID!
    $name: String
    $size: Float
    $icon: String
    $picture: String
    $infrared: Boolean
    $cloaked: Boolean
  ) {
    createSensorArmyContact(
      id: $id
      contact: {
        name: $name
        size: $size
        icon: $icon
        picture: $picture
        infrared: $infrared
        cloaked: $cloaked
      }
    )
  }
`;

const REMOVE_ARMY_CONTACT = gql`
  mutation($id: ID!, $contact: ID!) {
    removeSensorArmyContact(id: $id, contact: $contact)
  }
`;

const SENSOR_SUB = gql`
  subscription SensorsChanged($id: ID) {
    sensorsUpdate(simulatorId: $id, domain: "external") {
      id
      type
      autoTarget
      autoThrusters
      interference
      segments {
        segment
        state
      }
      armyContacts {
        id
        name
        size
        icon
        picture
        color
        infrared
        cloaked
        destroyed
      }
    }
  }
`;
class GridCore extends Component {
  constructor(props) {
    super(props);
    this.state = {
      movingContact: {},
      selectedContact: null,
      removeContacts: false,
      contextContact: null,
      speed: 0.6,
      planetSize: 1,
      planetColor: "#663399",
      borderColor: "#663399",
      askForSpeed:
        localStorage.getItem("thorium-core-sensors-askforspeed") === "yes"
          ? true
          : false
    };
    this.sensorsSubscription = null;
  }
  componentWillReceiveProps(nextProps) {
    if (!this.sensorsSubscription && !nextProps.data.loading) {
      this.sensorsSubscription = nextProps.data.subscribeToMore({
        document: SENSOR_SUB,
        variables: {
          id: nextProps.simulator.id
        },
        updateQuery: (previousResult, { subscriptionData }) => {
          return Object.assign({}, previousResult, {
            sensors: subscriptionData.data.sensorsUpdate
          });
        }
      });
    }
  }
  componentWillUnmount() {
    this.sensorsSubscription && this.sensorsSubscription();
  }
  componentDidMount() {
    if (!this.state.dimensions && ReactDOM.findDOMNode(this)) {
      const domNode = ReactDOM.findDOMNode(this).querySelector("#threeSensors");
      if (domNode) {
        this.setState({
          dimensions: domNode.getBoundingClientRect()
        });
      }
    }
  }
  componentDidUpdate() {
    if (!ReactDOM.findDOMNode(this)) return;
    const domNode = ReactDOM.findDOMNode(this).querySelector("#threeSensors");
    if (!domNode) return;
    if (
      !this.state.dimensions ||
      this.state.dimensions.width !== domNode.getBoundingClientRect().width
    ) {
      this.setState({
        dimensions: domNode.getBoundingClientRect()
      });
    }
  }
  dragStart = movingContact => {
    const self = this;
    this.setState({
      movingContact: Object.assign({}, movingContact, {
        location: null
      })
    });
    document.addEventListener("mousemove", this.moveMouse);
    document.addEventListener("mouseup", _mouseUp);
    function _mouseUp() {
      document.removeEventListener("mousemove", self.moveMouse);
      document.removeEventListener("mouseup", _mouseUp);
      self.dragStop();
    }
  };
  moveMouse = evt => {
    const { dimensions } = this.state;
    const { movingContact = {} } = this.state;
    const { width: dimWidth, height: dimHeight } = dimensions;
    const padding = 15;
    const width = Math.min(dimWidth, dimHeight) - padding;
    const destination = {
      x:
        (evt.clientX - dimensions.left - padding / 2 - width / 2) /
          (width / 2) -
        0.08,
      y:
        (evt.clientY - dimensions.top - padding / 2 - width / 2) / (width / 2) -
        0.08,
      z: 0
    };
    this.setState({
      movingContact: Object.assign({}, movingContact, { location: destination })
    });
  };
  dragStop = () => {
    const { movingContact } = this.state;
    this.setState({
      movingContact: null
    });
    const {
      location,
      icon,
      type,
      size,
      name,
      color,
      picture,
      cloaked,
      infrared
    } = movingContact;
    if (!location) return;
    const distance = distance3d({ x: 0, y: 0, z: 0 }, location);
    const maxDistance = type === "planet" ? 2 : 1.1;
    if (distance > maxDistance) {
      return;
    }
    const mutation = gql`
      mutation CreateContact($id: ID!, $contact: SensorContactInput!) {
        createSensorContact(id: $id, contact: $contact)
      }
    `;
    const variables = {
      id: this.props.data.sensors[0].id,
      contact: {
        icon,
        type,
        size,
        name,
        color,
        picture,
        cloaked,
        location,
        infrared,
        destination: location
      }
    };
    this.props.client.mutate({
      mutation,
      variables
    });
  };
  _addArmyContact() {
    const { armyContacts, id } = this.props.data.sensors[0] || {
      armyContacts: []
    };
    const templateContact = armyContacts[armyContacts.length - 1] || {
      name: "Contact",
      size: 1,
      icon: "/Sensor Contacts/Icons/N",
      picture: "/Sensor Contacts/Pictures/N",
      infrared: false,
      cloaked: false
    };
    const defaultContact = {
      name: templateContact.name,
      size: templateContact.size,
      icon: templateContact.icon,
      picture: templateContact.picture,
      infrared: templateContact.infrared,
      cloaked: templateContact.cloaked
    };
    //Run the mutation to create the army contact
    this.props.client.mutate({
      mutation: ADD_ARMY_CONTACT,
      variables: Object.assign(
        {
          id: id
        },
        defaultContact
      )
    });
  }
  _updateArmyContact(contact, key, value) {
    const { id } = this.props.data.sensors[0];
    const newContact = {
      id: contact.id,
      name: contact.name,
      size: contact.size,
      icon: contact.icon,
      picture: contact.picture,
      speed: contact.speed,
      infrared: contact.infrared,
      cloaked: contact.cloaked
    };
    newContact[key] = value;
    this.props.client.mutate({
      mutation: gql`
        mutation($id: ID!, $contact: SensorContactInput!) {
          updateSensorArmyContact(id: $id, contact: $contact)
        }
      `,
      variables: {
        id,
        contact: newContact
      }
    });
  }
  _updateSensorContact(contact, key, value) {
    const { id } = this.props.data.sensors[0];
    const newContact = {
      id: contact.id,
      name: contact.name,
      size: contact.size,
      icon: contact.icon,
      picture: contact.picture,
      speed: contact.speed,
      infrared: contact.infrared,
      cloaked: contact.cloaked
    };
    newContact[key] = value;
    this.props.client.mutate({
      mutation: gql`
        mutation($id: ID!, $contact: SensorContactInput!) {
          updateSensorContact(id: $id, contact: $contact)
        }
      `,
      variables: {
        id,
        contact: newContact
      }
    });
  }
  _removeArmyContact(contact) {
    const { id } = this.props.data.sensors[0] || { armyContacts: [] };
    this.props.client.mutate({
      mutation: REMOVE_ARMY_CONTACT,
      variables: Object.assign({
        id: id,
        contact: contact.id
      })
    });
  }
  _contextMenu(contact, e) {
    e.preventDefault();
    const { top: outerTop, left: outerLeft } = document
      .getElementsByClassName("sensorGridCore")[0]
      .getBoundingClientRect();
    const { top, left } = e.target.getBoundingClientRect();
    const obj = {
      left: left - outerLeft + 20,
      top: top - outerTop,
      contact: contact.id
    };
    this.setState({
      contextContact: obj
    });
  }
  _closeContext() {
    this.setState({
      contextContact: null,
      selectedContact: null
    });
  }
  _clearContacts() {
    const mutation = gql`
      mutation DeleteContact($id: ID!) {
        removeAllSensorContacts(id: $id)
      }
    `;
    const { id } = this.props.data.sensors[0];
    const variables = {
      id
    };
    this.props.client.mutate({
      mutation,
      variables
    });
  }
  _stopContacts() {
    const mutation = gql`
      mutation StopContacts($id: ID!) {
        stopAllSensorContacts(id: $id)
      }
    `;
    const { id } = this.props.data.sensors[0];
    const variables = {
      id
    };
    this.props.client.mutate({
      mutation,
      variables
    });
  }
  _freezeContacts() {}
  _changeSpeed(e) {
    this.setState({
      speed: e.target.value
    });
  }
  _setSelectedContact(selectedContact) {
    this.setState({
      selectedContact
    });
  }
  autoTarget = e => {
    const mutation = gql`
      mutation SensorsAutoTarget($id: ID!, $target: Boolean!) {
        toggleSensorsAutoTarget(id: $id, target: $target)
      }
    `;
    const sensors = this.props.data.sensors[0];
    const variables = {
      id: sensors.id,
      target: e.target.checked
    };
    this.props.client.mutate({
      mutation,
      variables
    });
  };
  autoThrusters = e => {
    const mutation = gql`
      mutation SensorsAutoThrusters($id: ID!, $thrusters: Boolean!) {
        toggleSensorsAutoThrusters(id: $id, thrusters: $thrusters)
      }
    `;
    const sensors = this.props.data.sensors[0];
    const variables = {
      id: sensors.id,
      thrusters: e.target.checked
    };
    this.props.client.mutate({
      mutation,
      variables
    });
  };
  updateInterference = e => {
    const mutation = gql`
      mutation SensorsInterference($id: ID!, $interference: Float!) {
        setSensorsInterference(id: $id, interference: $interference)
      }
    `;
    const sensors = this.props.data.sensors[0];
    const variables = {
      id: sensors.id,
      interference: e.target.value
    };
    this.props.client.mutate({
      mutation,
      variables
    });
  };
  render() {
    if (this.props.data.loading) return <p>Loading...</p>;
    if (!this.props.data.sensors[0]) return <p>No Sensor Grid</p>;
    const sensors = this.props.data.sensors[0];
    const {
      speed,
      selectedContact,
      movingContact,
      removeContacts,
      contextContact,
      askForSpeed
    } = this.state;
    const speeds = [
      { value: "1000", label: "Instant" },
      { value: "5", label: "Warp" },
      { value: "2", label: "Very Fast" },
      { value: "1", label: "Fast" },
      { value: "0.6", label: "Moderate" },
      { value: "0.4", label: "Slow" },
      { value: "0.1", label: "Very Slow" }
    ];
    return (
      <Container className="sensorGridCore" fluid style={{ height: "100%" }}>
        <Row style={{ height: "100%" }}>
          <Col sm={3}>
            <Input
              type="select"
              name="select"
              onChange={this._changeSpeed.bind(this)}
              defaultValue={speed}
            >
              {speeds.map(s => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
              <option disabled>─────────</option>
              <option disabled>Timed</option>
            </Input>
            <Button
              size="sm"
              color="danger"
              block
              onClick={this._clearContacts.bind(this)}
            >
              Clear
            </Button>
            <Button
              size="sm"
              color="warning"
              block
              onClick={this._stopContacts.bind(this)}
            >
              Stop
            </Button>
            <Button
              size="sm"
              color="info"
              disabled
              block
              onClick={this._freezeContacts.bind(this)}
            >
              Freeze
            </Button>
            <div>
              <label>
                Ask for speed{" "}
                <input
                  type="checkbox"
                  checked={this.state.askForSpeed}
                  onClick={evt => {
                    this.setState({ askForSpeed: evt.target.checked });
                    localStorage.setItem(
                      "thorium-core-sensors-askforspeed",
                      evt.target.checked ? "yes" : "no"
                    );
                  }}
                />
              </label>
            </div>
            <label>
              Add to targeting{" "}
              <input
                type="checkbox"
                checked={sensors.autoTarget}
                onClick={this.autoTarget}
              />
            </label>
            <label>
              Auto Thrusters{" "}
              <input
                type="checkbox"
                checked={sensors.autoThrusters}
                onClick={this.autoThrusters}
              />
            </label>
            <Nudge
              sensor={sensors.id}
              client={this.props.client}
              speed={speed}
            />
            <small>Click grid segments to black out</small>
            <Row>
              <Col sm={10}>
                <label>Planet</label>
                <input
                  type="range"
                  min={0.01}
                  max={2}
                  step={0.01}
                  value={this.state.planetSize}
                  onChange={e => this.setState({ planetSize: e.target.value })}
                />
                <label>Color</label>
                <SliderPicker
                  color={this.state.planetColor}
                  onChangeComplete={color =>
                    this.setState({ planetColor: color.hex })
                  }
                />
              </Col>
              <Col sm={2}>
                <div
                  className="planet-dragger"
                  onMouseDown={() =>
                    this.dragStart({
                      color: this.state.planetColor,
                      type: "planet",
                      size: this.state.planetSize
                    })
                  }
                  style={{
                    borderColor: tinycolor(this.state.planetColor)
                      .darken(10)
                      .toString(),
                    backgroundColor: tinycolor(
                      this.state.planetColor
                    ).toString()
                  }}
                />
              </Col>
            </Row>
            <Row>
              <Col sm={10}>
                <label>Border</label>
                <SliderPicker
                  color={this.state.borderColor}
                  onChangeComplete={color =>
                    this.setState({ borderColor: color.hex })
                  }
                />
              </Col>
              <Col sm={2}>
                <div
                  className="border-dragger"
                  onMouseDown={() =>
                    this.dragStart({
                      color: this.state.borderColor,
                      type: "border"
                    })
                  }
                  style={{
                    borderColor: tinycolor(this.state.borderColor)
                      .darken(10)
                      .toString(),
                    backgroundColor: tinycolor(
                      this.state.borderColor
                    ).toString()
                  }}
                />
              </Col>
            </Row>
            <Row>
              <Col sm={12}>
                <label>Interference</label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  defaultValue={sensors.interference}
                  onMouseUp={this.updateInterference}
                />
              </Col>
            </Row>
          </Col>
          <Col sm={6} style={{ height: "100%" }}>
            <div
              id="threeSensors"
              className="array"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0
              }}
            >
              <Grid
                mouseover={this.props.hoverContact}
                core
                dimensions={this.state.dimensions}
                sensor={sensors.id}
                moveSpeed={speed}
                speeds={speeds}
                askForSpeed={askForSpeed}
                setSelectedContact={this._setSelectedContact.bind(this)}
                selectedContact={selectedContact}
                armyContacts={sensors.armyContacts}
                movingContact={movingContact}
                segments={sensors.segments}
              />
            </div>
          </Col>
          <Col sm={3} className="contacts-container">
            <p>Contacts:</p>
            <div className="contact-scroll">
              {sensors.armyContacts.map(contact => {
                return (
                  <Col key={contact.id} className={"flex-container"} sm={12}>
                    <Asset asset={contact.icon}>
                      {({ src }) => (
                        <img
                          alt="contact"
                          onMouseDown={() => this.dragStart(contact)}
                          onContextMenu={this._contextMenu.bind(this, contact)}
                          draggable="false"
                          role="presentation"
                          className="armyContact"
                          src={src}
                        />
                      )}
                    </Asset>
                    <label
                      onContextMenu={this._contextMenu.bind(this, contact)}
                    >
                      {contact.name}
                    </label>
                    {removeContacts && (
                      <FontAwesome
                        name="ban"
                        className="text-danger pull-right clickable"
                        onClick={this._removeArmyContact.bind(this, contact)}
                      />
                    )}
                  </Col>
                );
              })}
            </div>
            <Button
              size="sm"
              color="success"
              onClick={this._addArmyContact.bind(this)}
            >
              Add Contact
            </Button>
            <label>
              <input
                type="checkbox"
                onChange={e => {
                  this.setState({ removeContacts: e.target.checked });
                }}
              />{" "}
              Remove
            </label>
            {contextContact && (
              <ContactContextMenu
                closeMenu={this._closeContext.bind(this)}
                updateArmyContact={this._updateArmyContact.bind(this)}
                contact={sensors.armyContacts.find(
                  c => c.id === contextContact.contact
                )}
                x={contextContact.left}
                y={0}
              />
            )}
            {selectedContact && (
              <ContactContextMenu
                closeMenu={this._closeContext.bind(this)}
                updateArmyContact={this._updateSensorContact.bind(this)}
                contact={selectedContact}
                x={0}
                y={0}
              />
            )}
          </Col>
        </Row>
      </Container>
    );
  }
}

const GRID_QUERY = gql`
  query GetSensors($simulatorId: ID) {
    sensors(simulatorId: $simulatorId, domain: "external") {
      id
      type
      autoTarget
      autoThrusters
      interference
      segments {
        segment
        state
      }
      armyContacts {
        id
        name
        size
        icon
        picture
        color
        infrared
        cloaked
        destroyed
      }
    }
  }
`;

export default graphql(GRID_QUERY, {
  options: ownProps => ({
    fetchPolicy: "cache-and-network",
    variables: { simulatorId: ownProps.simulator.id }
  })
})(withApollo(GridCore));
