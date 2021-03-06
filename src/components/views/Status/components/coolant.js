import React, { Component } from "react";
import { Label } from "reactstrap";
import gql from "graphql-tag";
import { graphql } from "react-apollo";
import Dots from "./dots";
const SUB = gql`
  subscription Coolant($simulatorId: ID!) {
    coolantUpdate(simulatorId: $simulatorId) {
      id
      coolant
    }
  }
`;

class Coolant extends Component {
  sub = null;
  componentWillReceiveProps(nextProps) {
    if (!this.sub && !nextProps.data.loading) {
      this.sub = nextProps.data.subscribeToMore({
        document: SUB,
        variables: { simulatorId: nextProps.simulator.id },
        updateQuery: (previousResult, { subscriptionData }) => {
          return Object.assign({}, previousResult, {
            coolant: subscriptionData.data.coolantUpdate
          });
        }
      });
    }
  }
  componentWillUnmount() {
    // Cancel the subscription
    this.sub();
  }
  render() {
    if (this.props.data.loading || !this.props.data.coolant) return null;
    const coolant = this.props.data.coolant && this.props.data.coolant[0];
    if (!coolant) return null;
    return (
      <div>
        <Label>Coolant</Label>
        <Dots level={coolant.coolant} color="rgb(40,60,255)" />
      </div>
    );
  }
}
const QUERY = gql`
  query Coolant($simulatorId: ID!) {
    coolant(simulatorId: $simulatorId) {
      id
      coolant
    }
  }
`;

export default graphql(QUERY, {
  options: ownProps => ({
    fetchPolicy: "cache-and-network",
    variables: { simulatorId: ownProps.simulator.id }
  })
})(Coolant);
