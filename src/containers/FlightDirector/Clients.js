import React, { Component } from "react";
import { Col, Row, Container } from "reactstrap";
import gql from "graphql-tag";
import { graphql, withApollo } from "react-apollo";
import moment from "moment";

const FLIGHTS_SUB = gql`
  subscription FlightsSub {
    flightsUpdate {
      id
      name
      date
      running
      simulators {
        id
        name
        stations {
          name
        }
      }
    }
  }
`;

const CLIENT_CHANGE_QUERY = gql`
  subscription ClientChanged {
    clientChanged {
      id
      flight {
        id
        name
        date
        simulators {
          id
          name
        }
      }
      simulator {
        id
        name
        alertlevel
        layout
        stations {
          name
        }
      }
      station {
        name
      }
      loginName
      loginState
      training
    }
  }
`;

class Clients extends Component {
  constructor(props) {
    super(props);
    this.subscription = null;
    this.flightsSub = null;
  }
  componentWillReceiveProps(nextProps) {
    if (!this.subscription && !nextProps.data.loading) {
      this.subscription = nextProps.data.subscribeToMore({
        document: CLIENT_CHANGE_QUERY,
        updateQuery: (previousResult, { subscriptionData }) => {
          const returnResult = Object.assign({}, previousResult);
          returnResult.clients = subscriptionData.data.clientChanged;
          return returnResult;
        }
      });
    }
    if (!this.flightsSub && !nextProps.data.loading) {
      this.flightsSub = nextProps.data.subscribeToMore({
        document: FLIGHTS_SUB,
        updateQuery: (previousResult, { subscriptionData }) => {
          return Object.assign({}, previousResult, {
            flights: subscriptionData.data.flightsUpdate
          });
        }
      });
    }
  }
  _select(p, type, e) {
    let m = null;
    if (type === "flight") {
      m = "clientSetFlight(client: $client, flightId: $id)";
    }
    if (type === "simulator") {
      m = "clientSetSimulator(client: $client, simulatorId: $id)";
    }
    if (type === "station") {
      m = "clientSetStation(client: $client, stationName: $id)";
    }
    const mutation = gql`mutation UpdateClient($client: ID!, $id: ID!) {
    ${m} 
    }`;
    const obj = {
      client: p.id,
      id: e.target.value
    };
    this.props.client.mutate({
      mutation: mutation,
      variables: obj
    });
  }
  render() {
    if (this.props.data.loading) return null;
    if (
      this.props.data.flights
        .map(f => f.id)
        .indexOf(this.props.match.params.flightId) === -1
    ) {
      this.props.history.push("/");
      return null;
    }
    return (
      <Container>
        <Row className="justify-content-md-center">
          <Col
            xs="12"
            style={{
              height: "60vh",
              overflowY: "scroll"
            }}
          >
            <h4>Clients</h4>
            <table className="table table-striped table-hover table-sm">
              <thead>
                <tr>
                  <th>Client Name</th>
                  <th>Flight</th>
                  <th>Simulator</th>
                  <th>Station</th>
                </tr>
              </thead>
              <tbody>
                {!this.props.data.loading ? (
                  this.props.data.clients &&
                  this.props.data.clients
                    .filter(
                      p =>
                        p.flight === "" ||
                        p.flight === null ||
                        p.flight.id === this.props.match.params.flightId
                    )
                    .map((p, index) => (
                      <tr key={`flight-${p.id}-${index}`}>
                        <td>{`${p.id}`}</td>
                        <td>
                          <select
                            value={(p.flight && p.flight.id) || ""}
                            onChange={this._select.bind(this, p, "flight")}
                            className="form-control-sm c-select"
                          >
                            <option value="">Select a flight</option>
                            {this.props.data.flights ? (
                              this.props.data.flights.map(f => {
                                return (
                                  <option
                                    key={`flight-${p.id}-${f.id}`}
                                    value={f.id}
                                  >
                                    {`${f.name}: ${moment(f.date).format(
                                      "MM/DD/YY hh:mma"
                                    )}`}
                                  </option>
                                );
                              })
                            ) : (
                              <option disabled>No Flights</option>
                            )}
                          </select>
                        </td>
                        <td>
                          <select
                            value={(p.simulator && p.simulator.id) || ""}
                            onChange={this._select.bind(this, p, "simulator")}
                            className="form-control-sm c-select"
                          >
                            <option value="">Select a simulator</option>
                            {p.flight ? (
                              p.flight.simulators.map(s => (
                                <option
                                  key={`${p.id}-simulator-${s.id}`}
                                  value={s.id}
                                >
                                  {s.name}
                                </option>
                              ))
                            ) : (
                              <option disabled>No Simulators</option>
                            )}
                          </select>
                        </td>
                        <td>
                          <select
                            value={(p.station && p.station.name) || ""}
                            onChange={this._select.bind(this, p, "station")}
                            className="form-control-sm c-select"
                          >
                            <option value="">Select a station</option>
                            {p.simulator ? (
                              p.simulator.stations.map(s => (
                                <option
                                  key={`${p.id}-station-${s.name}`}
                                  value={s.name}
                                >
                                  {s.name}
                                </option>
                              ))
                            ) : (
                              <option disabled>No Stations</option>
                            )}
                            <option value={"Viewscreen"}>Viewscreen</option>
                            <option value={"Blackout"}>Blackout</option>
                          </select>
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr />
                )}
              </tbody>
            </table>
          </Col>
        </Row>
      </Container>
    );
  }
}

const CLIENTS_QUERY = gql`
  query Clients {
    clients {
      id
      flight {
        id
        name
        date
        simulators {
          id
          name
        }
      }
      simulator {
        id
        name
        alertlevel
        layout
        stations {
          name
        }
      }
      station {
        name
      }
      loginName
      loginState
      training
    }
    flights {
      id
      name
      date
      running
      simulators {
        id
        name
        stations {
          name
        }
      }
    }
  }
`;

export default graphql(CLIENTS_QUERY)(withApollo(Clients));
