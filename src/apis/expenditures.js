import axios from 'axios';

export const fetchExpenditures = async () => {
    if (!localStorage.getItem('credential')) return;
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
