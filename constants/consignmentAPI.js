import axios from "axios";

export const apiURL = process.env.NEXT_PUBLIC_API_URL;
export const api_endpoint = {
  consignments: `${apiURL}/consignments`,
  consignmetitem: `${apiURL}/consignmetitem`,
  commodity: `${apiURL}/commodity`,
  consignee: `${apiURL}/consignee`,
  trader: `${apiURL}/trader`,
  packer: `${apiURL}/packer`,
  packaging: `${apiURL}/packaging`,
  IataAgent: `${apiURL}/iata-agent`,
  customAgent: `${apiURL}/custom-agent`,
};

export const createConsignment = async (consignmentData) => {
  const response = await axios.post(`${apiURL}/consignment`, consignmentData);
  return response.data;
};
export const fetchConsignments = async () => {
  const response = await axios.get(`${apiURL}/consignment`);
  return response.data;
};
export const fetchConsignmentById = async (id) => {
  const response = await axios.get(`${apiURL}/consignment/${id}`);
  return response.data;
};
export const deleteConsignment = async (id) => {
  await axios.delete(`${apiURL}/consignment${id}`);
};
export const fetchConsignees = async () => {
  const response = await axios.get(`${apiURL}/consignee`);
  return response.data;
};
export const fetchTraders = async () => {
  const response = await axios.get(`${apiURL}/trader`);
  return response.data;
};
export const fetchPackers = async () => {
  const response = await axios.get(`${apiURL}/packer`);
  return response.data;
};
export const fetchPackaging = async () => {
  const response = await axios.get(`${apiURL}/packaging`);
  return response.data;
};
export const fetchIata = async () => {
  const response = await axios.get(`${apiURL}/iataagent`);
  return response.data;
};
export const fetchCustomAgents = async () => {
  const response = await axios.get(`${apiURL}/customagent`);
  return response.data;
};
export const fetchFinancialInstrument = async () => {
  const response = await axios.get(`${apiURL}/financialinstrument`);
  return response.data;
};
export const fetchGoodsDeclarations = async () => {
  const response = await axios.get(`${apiURL}/goods-declaration`);
  return response.data;
};
export const fetchFiu = async () => {
  const response = await axios.get(`${apiURL}/fiu`);
  return response.data;
};
