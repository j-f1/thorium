import React, { Component } from "react";
import {
  Col,
  Row,
  Container,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  Label,
  Input,
  FormText
} from "reactstrap";
import gql from "graphql-tag";
import { graphql, withApollo } from "react-apollo";
import { Link } from "react-router-dom";

import SimulatorProperties from "./SimulatorProperties";
import * as Config from "./config";

import "./SimulatorConfig.css";

const SIMULATOR_SUB = gql`
  subscription SimulatorsUpdate {
    simulatorsUpdate(template: true) {
      id
      name
      layout
      exocomps
      panels
      systems {
        id
        type
        name
        requiredDamageSteps {
          id
          name
          args {
            end
            cleanup
            name
            orders
            room
            preamble
            type
            message
            code
            inventory
            destination
            equipment
            query
            reactivate
          }
        }
        optionalDamageSteps {
          id
          name
          args {
            end
            cleanup
            name
            orders
            room
            preamble
            type
            message
            code
            inventory
            destination
            equipment
            query
            reactivate
          }
        }
      }
      stationSets {
        id
        name
        stations {
          name
          login
          messageGroups
          widgets
          cards {
            name
            component
          }
        }
      }
    }
  }
`;

const STATIONSET_SUB = gql`
  subscription StationSetUpdate {
    stationSetUpdate {
      id
      name
      simulator {
        id
      }
      stations {
        name
        login
        messageGroups
        widgets
        cards {
          name
          component
        }
      }
    }
  }
`;

class SimulatorConfig extends Component {
  subscription = null;
  stationSetSub = null;
  state = {};
  componentWillReceiveProps(nextProps) {
    if (!this.subscription && !nextProps.data.loading) {
      this.subscription = nextProps.data.subscribeToMore({
        document: SIMULATOR_SUB,
        updateQuery: (previousResult, { subscriptionData }) => {
          return Object.assign({}, previousResult, {
            simulators: subscriptionData.data.simulatorsUpdate
          });
        }
      });
    }
    if (!this.stationSetSub && !nextProps.data.loading) {
      this.stationSetSub = nextProps.data.subscribeToMore({
        document: STATIONSET_SUB,
        updateQuery: (previousResult, { subscriptionData }) => {
          const stationSets = subscriptionData.data.stationSetUpdate;
          return Object.assign({}, previousResult, {
            simulators: previousResult.simulators.map(s => {
              const returnSimulator = Object.assign({}, s);
              returnSimulator.stationSets = [];
              stationSets.forEach(ss => {
                if (ss.simulator && returnSimulator.id === ss.simulator.id) {
                  returnSimulator.stationSets.push({
                    id: ss.id,
                    name: ss.name,
                    stations: ss.stations,
                    __typename: ss.__typename
                  });
                }
              });
              return returnSimulator;
            })
          });
        }
      });
    }
  }
  componentWillUnmount() {
    this.subscription && this.subscription();
    this.stationSetSub && this.stationSetSub();
  }
  selectProperty = prop => {
    this.setState({
      selectedProperty: prop
    });
  };
  createSimulator = () => {
    const name = prompt("What is the simulator name? eg. Voyager");
    if (name) {
      const variables = {
        name: name,
        template: true
      };
      this.props.client.mutate({
        mutation: gql`
          mutation AddSimulator($name: String!, $template: Boolean) {
            createSimulator(name: $name, template: $template)
          }
        `,
        variables
      });
    }
  };
  importSimulator = evt => {
    if (evt.target.files[0]) {
      const data = new FormData();
      Array.from(evt.target.files).forEach((f, index) =>
        data.append(`files[${index}]`, f)
      );
      this.setState({
        loadingMission: true
      });
      fetch(
        `${window.location.protocol}//${window.location.hostname}:${parseInt(
          window.location.port,
          10
        ) + 1}/importSimulator`,
        {
          method: "POST",
          body: data
        }
      ).then(() => {
        window.location.reload();
      });
    }
  };
  renameSimulator = () => {
    const name = prompt("What is the simulator name? eg. Voyager");
    const simulator = this.state.selectedSimulator;
    if (name && simulator) {
      let variables = {
        name: name,
        id: simulator
      };
      this.props.client.mutate({
        mutation: gql`
          mutation RenameSimulator($id: ID!, $name: String!) {
            renameSimulator(simulatorId: $id, name: $name)
          }
        `,
        variables
      });
    }
  };
  removeSimulator = () => {
    const simulator = this.state.selectedSimulator;
    if (simulator) {
      if (window.confirm("Are you sure you want to delete that simulator?")) {
        let obj = {
          id: simulator
        };
        this.props.client.mutate({
          mutation: gql`
            mutation RemoveSimulator($id: ID!) {
              removeSimulator(simulatorId: $id)
            }
          `,
          variables: obj
        });
        this.setState({
          selectedSimulator: null,
          selectedProperty: null
        });
      }
    }
  };
  render() {
    const { data } = this.props;
    const { selectedSimulator, selectedProperty } = this.state;
    const ConfigComponent = Config[selectedProperty];
    if (data.loading) return null;
    const { simulators } = data;
    if (!simulators) return;
    return (
      <Container fluid className="simulator-config">
        <h4>
          Simulator Config{" "}
          <small>
            <Link to="/">Return to Main</Link>
          </small>
        </h4>
        <Row>
          <Col sm={2}>
            <Card>
              {simulators.map(s => (
                <li
                  key={s.id}
                  className={`list-group-item simulator-item ${
                    selectedSimulator && selectedSimulator === s.id
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    this.setState({
                      selectedSimulator: s.id,
                      selectedProperty: null
                    })
                  }
                >
                  {s.name}
                </li>
              ))}
            </Card>
            <ButtonGroup>
              <Button onClick={this.createSimulator} size="sm" color="success">
                Add
              </Button>
            </ButtonGroup>
            <ButtonGroup>
              {selectedSimulator && (
                <Button
                  onClick={this.renameSimulator}
                  size="sm"
                  color="warning"
                >
                  Rename
                </Button>
              )}
              {selectedSimulator && (
                <Button onClick={this.removeSimulator} size="sm" color="danger">
                  Remove
                </Button>
              )}
            </ButtonGroup>
            <Label>Import Simulator</Label>
            <Input
              type="file"
              name="file"
              id="importFile"
              onChange={this.importSimulator}
            />
            <FormText color="muted">
              Simulator files will be in a ".sim" format.
            </FormText>
          </Col>
          <Col sm={2}>
            {selectedSimulator && (
              <div>
                <SimulatorProperties
                  selectProperty={this.selectProperty}
                  selectedProperty={selectedProperty}
                />
                <Button
                  tag="a"
                  href={`${window.location.protocol}//${
                    window.location.hostname
                  }:${parseInt(window.location.port, 10) +
                    1}/exportSimulator/${selectedSimulator}`}
                  block
                  size="sm"
                  color="info"
                >
                  Export
                </Button>
              </div>
            )}
          </Col>
          <Col sm={8}>
            <Card>
              <CardBody>
                {ConfigComponent && (
                  <ConfigComponent
                    selectedSimulator={simulators.find(
                      s => s.id === selectedSimulator
                    )}
                  />
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }
}

const SIMULATOR_QUERY = gql`
  query Simulators {
    simulators(template: true) {
      id
      name
      layout
      exocomps
      panels
      requiredDamageSteps {
        id
        name
        args {
          end
          cleanup
          name
          orders
          room
          preamble
          type
          message
          code
          inventory
          destination
          equipment
          query
          reactivate
        }
      }
      optionalDamageSteps {
        id
        name
        args {
          end
          cleanup
          name
          orders
          room
          preamble
          type
          message
          code
          inventory
          destination
          equipment
          query
          reactivate
        }
      }
      systems {
        id
        type
        name
        requiredDamageSteps {
          id
          name
          args {
            end
            cleanup
            name
            orders
            room
            preamble
            type
            message
            code
            inventory
            destination
            equipment
            query
            reactivate
          }
        }
        optionalDamageSteps {
          id
          name
          args {
            end
            cleanup
            name
            orders
            room
            preamble
            type
            message
            code
            inventory
            destination
            equipment
            query
            reactivate
          }
        }
      }
      stationSets {
        id
        name
        stations {
          name
          login
          messageGroups
          widgets
          cards {
            name
            component
          }
        }
      }
    }
  }
`;

export default graphql(SIMULATOR_QUERY)(withApollo(SimulatorConfig));
