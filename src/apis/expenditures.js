import axios from 'axios';
import { parseJwt } from '../utils/index';

const hostname = "https://enigmatic-cliffs-45128.herokuapp.com";
// const hostname = "http://localhost:8080";

// block call if the token has been expired. Delete it from local storage as well
export const fetchExpenditures = async () => {
  if (!localStorage.getItem('credential')) return;
  const token = localStorage.getItem('credential');
  const exp = parseJwt(token);
  const { email } = exp;
  const response = await axios.get(
    `${hostname}/fetch-csv`, {
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
    `${hostname}/parse-csv`, 
    formData, {
      headers: {
        'Content-Type': 'text/csv',
        'Authorization': 'Bearer ' + localStorage.getItem('credential'),
      },
    }
  );
};

export const updateExpenditure = async ({month, year, data, type}) => {
  if (!localStorage.getItem('credential')) return;
  const token = localStorage.getItem('credential');
  const exp = parseJwt(token);
  const { email } = exp;
  return await axios.put(
    `${hostname}/update-csv`, 
    { email, month, year, data, type }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('credential'),
      },
    }
  );
};
