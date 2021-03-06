import React, { Component } from "react";
import { Table, Button } from "reactstrap";
import { InputField, OutputField } from "../../generic/core";
import { graphql, withApollo } from "react-apollo";

import gql from "graphql-tag";

const SHIELD_SUB = gql`
  subscription ShieldSub($id: ID) {
    shieldsUpdate(simulatorId: $id) {
      id
      name
      state
      position
      frequency
      integrity
      simulatorId
    }
  }
`;

class ShieldsCore extends Component {
  constructor(props) {
    super(props);
    this.shieldSub = null;
  }
  componentWillReceiveProps(nextProps) {
    if (!this.shieldSub && !nextProps.data.loading) {
      this.shieldSub = nextProps.data.subscribeToMore({
        document: SHIELD_SUB,
        variables: {
          id: nextProps.simulator.id
        },
        updateQuery: (previousResult, { subscriptionData }) => {
          return Object.assign({}, previousResult, {
            shields: subscriptionData.data.shieldsUpdate
          });
        }
      });
    }
  }
  componentWillUnmount() {
    this.shieldSub && this.shieldSub();
  }
  setFrequency(shields, freq) {
    if (freq < 100 || freq > 350) return;
    const mutation = gql`
      mutation SetShieldFrequency($id: ID!, $freq: Float) {
        shieldFrequencySet(id: $id, frequency: $freq)
      }
    `;
    const variables = {
      id: shields.id,
      freq: Math.round(freq * 10) / 10
    };
    this.props.client.mutate({
      mutation,
      variables
    });
  }
  setIntegrity(shields, integrity) {
    if (integrity < 0 || integrity > 100) return;
    const mutation = gql`
      mutation SetShieldIntegrity($id: ID!, $integrity: Float) {
        shieldIntegritySet(id: $id, integrity: $integrity)
      }
    `;
    const variables = {
      id: shields.id,
      integrity: Math.round(integrity) / 100
    };
    this.props.client.mutate({
      mutation,
      variables
    });
  }
  _hitShields(shields) {
    if (shields === "all") {
      this.props.data.shields.forEach(s => {
        this._hitShields(s);
      });
      return;
    }
    let integrity = shields.integrity * 100;
    integrity -= Math.random() * 10;
    if (integrity < 0) integrity = 0;
    this.setIntegrity(shields, integrity);
  }
  render() {
    if (this.props.data.loading || !this.props.data.shields) return null;
    return (
      <div>
        {this.props.data.shields.length > 0 ? (
          <div>
            <Table responsive size="sm">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>State</th>
                  <th>Frequency</th>
                  <th>Integrity</th>
                </tr>
              </thead>
              <tbody>
                {this.props.data.shields.map(s => {
                  return (
                    <tr key={s.id}>
                      <td>{s.name}</td>
                      <td>
                        <OutputField>
                          {s.state ? "Raised" : "Lowered"}
                        </OutputField>
                      </td>
                      <td>
                        <InputField
                          prompt="What is the frequency? (100.0 - 350.0)"
                          onClick={this.setFrequency.bind(this, s)}
                        >
                          {Math.round(s.frequency * 10) / 10}
                        </InputField>
                      </td>
                      <td>
                        <InputField
                          style={{ width: "50%", float: "left" }}
                          prompt="What is the integrity? (0 - 100)"
                          onClick={this.setIntegrity.bind(this, s)}
                        >
                          {Math.round(s.integrity * 100)}
                        </InputField>
                        <Button
                          style={{ width: "50%", height: "16px" }}
                          size="sm"
                          color="danger"
                          onClick={this._hitShields.bind(this, s)}
                        >
                          Hit
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
            <Button
              style={{ width: "50%" }}
              size="sm"
              color="danger"
              onClick={this._hitShields.bind(this, "all")}
            >
              Hit All
            </Button>
          </div>
        ) : (
          "No shields"
        )}
      </div>
    );
  }
}

const SHIELD_QUERY = gql`
  query Shields($simulatorId: ID!) {
    shields(simulatorId: $simulatorId) {
      id
      name
      state
      position
      frequency
      integrity
      simulatorId
    }
  }
`;

export default graphql(SHIELD_QUERY, {
  options: ownProps => ({
    fetchPolicy: "cache-and-network",
    variables: { simulatorId: ownProps.simulator.id }
  })
})(withApollo(ShieldsCore));
