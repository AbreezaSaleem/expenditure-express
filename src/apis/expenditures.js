import axios from 'axios';
import { parseJwt } from '../utils/index';

// block call if the token has been expired. Delete it from local storage as well
export const fetchExpenditures = async () => {
  if (!localStorage.getItem('credential')) return;
  const token = localStorage.getItem('credential');
  const exp = parseJwt(token);
  // console.log(exp);
  const response = await axios.get('http://localhost:8080/fetch-csv', {
    params: { email: 'ali.khilji94@gmail.com' },
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('credential'),
    },
  });
  return response.data;
}

export const uploadExpenditureFile = async (formData) => await axios.post('http://localhost:8080/parse-csv', 
  formData, {
    headers: {
      'Content-Type': 'text/csv',
      'Authorization': 'Bearer ' + localStorage.getItem('credential'),
    },
  }
);
