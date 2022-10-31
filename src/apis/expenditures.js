import axios from 'axios';
import { parseJwt } from '../utils/index';

const endpoint = process.env.REACT_APP_BUILD_ENV === "production"
  ? "https://enigmatic-cliffs-45128.herokuapp.com"
  : "http://localhost:8080";

// block call if the token has been expired. Delete it from local storage as well
export const fetchExpenditures = async () => {
  if (!localStorage.getItem('credential')) return;
  const token = localStorage.getItem('credential');
  const exp = parseJwt(token);
  const { email } = exp;
  const response = await axios.get(
    `${endpoint}/fetch-csv`, {
    params: { email },
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('credential'),
    },
  });
  return response.data;
}

export const uploadExpenditureFile = async (formData) =>{
  if (!localStorage.getItem('credential')) return;
  const token = localStorage.getItem('credential');
  const exp = parseJwt(token);
  const { email } = exp;
  formData.append('email', email);
  return await axios.post(
    `${endpoint}/parse-csv`, 
    formData, {
      headers: {
        'Content-Type': 'text/csv',
        'Authorization': 'Bearer ' + localStorage.getItem('credential'),
      },
    }
  );
};
