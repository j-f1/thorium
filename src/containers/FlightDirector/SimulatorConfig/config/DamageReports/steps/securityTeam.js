import React, { Component } from "react";
import { Label, Input } from "reactstrap";
import gql from "graphql-tag";

export default class SecurityTeamConfig extends Component {
  constructor(props) {
    super(props);
    this.state = props.args;
  }
  componentWillReceiveProps(nextProps) {
    this.setState(nextProps.args);
  }
  update = (evt, which) => {
    const { simulatorId, systemId, id, client } = this.props;
    const mutation =
      systemId === "simulator"
        ? gql`
            mutation UpdateDamageStep(
              $simulatorId: ID!
              $step: DamageStepInput!
            ) {
              updateSimulatorDamageStep(simulatorId: $simulatorId, step: $step)
            }
          `
        : gql`
            mutation UpdateDamageStep($systemId: ID!, $step: DamageStepInput!) {
              updateSystemDamageStep(systemId: $systemId, step: $step)
            }
          `;
    const variables = {
      simulatorId,
      systemId,
      step: {
        id,
        args: {
          [which]: evt.target.value
        }
      }
    };
    client.mutate({ mutation, variables });
  };
  render() {
    return (
      <div>
        <div>Security Team Config</div>
        <small>
          You can use some hashtags to make your report dynamic:
          <ul>
            <li>
              <strong>#COLOR</strong> - a random color of red, green, blue,
              yellow
            </li>
            <li>
              <strong>#PART</strong> - a random exocomp part
            </li>
            <li>
              <strong>#[1 - 2]</strong> - a random whole number between the two
              listed numbers
            </li>
            <li>
              <strong>#["string1", "string2", "string3", etc.]</strong> - a
              random string from the list provided
            </li>
          </ul>
        </small>
        <Label>Preamble</Label>
        <Input
          type="textarea"
          value={this.state.preamble || ""}
          onChange={evt => this.setState({ preamble: evt.target.value })}
          onBlur={evt => this.update(evt, "preamble")}
        />
        <Label>Name</Label>
        <Input
          type="textarea"
          value={this.state.name || ""}
          onChange={evt => this.setState({ name: evt.target.value })}
          onBlur={evt => this.update(evt, "name")}
        />
        <Label>Orders</Label>
        <Input
          type="textarea"
          value={this.state.orders || ""}
          onChange={evt => this.setState({ orders: evt.target.value })}
          onBlur={evt => this.update(evt, "orders")}
        />
        <Label>Room</Label>
        <Input
          type="text"
          value={this.state.room || ""}
          onChange={evt => this.setState({ room: evt.target.value })}
          onBlur={evt => this.update(evt, "room")}
        />
      </div>
    );
  }
}
