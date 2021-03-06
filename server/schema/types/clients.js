export default `
type Client {
  id: ID
  connected: Boolean
  flight: Flight
  simulator: Simulator
  station: Station
  loginName: String
  loginState: String
  ping: String
  offlineState: String
  training: Boolean
  caches: [String]
}
`;
