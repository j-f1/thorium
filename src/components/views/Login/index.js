import React, { Component } from "react";
import { Button, Row, Col, Input } from "reactstrap";
import { withApollo } from "react-apollo";
import gql from "graphql-tag";
import { Asset } from "../../../helpers/assets";
import "./login.css";

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loginName: ""
    };
  }
  _login() {
    const { loginName } = this.state;
    const client = this.props.clientObj.id;
    if (loginName.length > 0) {
      const obj = {
        client,
        loginName
      };
      const mutation = gql`
        mutation LoginClient($client: ID!, $loginName: String) {
          clientLogin(client: $client, loginName: $loginName)
        }
      `;
      this.props.client.mutate({
        mutation: mutation,
        variables: obj
      });
    }
  }
  render() {
    let simulatorName;
    if (this.props.simulator) simulatorName = this.props.simulator.name;
    return (
      <Row className="loginCard">
        <Col sm={{ size: 3, offset: 1 }}>
          <Asset asset="/Misc/Login Logo" simulatorId={this.props.simulator.id}>
            {({ src }) => (
              <img
                alt="login logo"
                role="presentation"
                src={src}
                className="img-fluid"
              />
            )}
          </Asset>
          <h1>{simulatorName}</h1>
        </Col>
        <Col sm={{ size: 7, offset: 1 }}>
          <Asset
            asset="/Ship Views/Right"
            simulatorId={this.props.simulator.id}
          >
            {({ src }) => (
              <img
                role="presentation"
                alt="ship right"
                src={src}
                className="img-fluid"
              />
            )}
          </Asset>

          <Col className="loginBlock" sm={{ size: 8, offset: 2 }}>
            <h2>Agent Login</h2>
            <Input
              onKeyDown={e => {
                if (e.which === 13) {
                  this._login.call(this);
                }
              }}
              value={this.state.loginName}
              onChange={e =>
                this.setState({
                  loginName: e.target.value
                })
              }
              ref="loginField"
            />
            <Button onClick={this._login.bind(this)} block>
              Login
            </Button>
          </Col>
        </Col>
      </Row>
    );
  }
}

export default withApollo(Login);
