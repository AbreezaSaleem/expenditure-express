import axios from './middlewares';

const hostname = "https://enigmatic-cliffs-45128.herokuapp.com";
// const hostname = "http://localhost:8080";

axios.defaults.withCredentials = true;

export const sendToken = async (token) => {
  const response = await axios.post(
    `${hostname}/login`,
    { token },
    {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    }
  );
  return response.data;
};

export const logout = async () => {
  const response = await axios.post(
    `${hostname}/logout`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
};

// block call if the token has been expired. Delete it from local storage as well
export const fetchExpenditures = async () => {
  const email = localStorage.getItem('eeEmail');
  const response = await axios.get(
    `${hostname}/fetch-csv`, {
    params: { email },
    headers: {
      // 'Authorization': 'Bearer ' + localStorage.getItem('credential'),
    },
  });
  return response.data;
}

export const uploadExpenditureFile = async (formData) =>{
  if (!localStorage.getItem('eeEmail')) return;
  const email = localStorage.getItem('eeEmail');
  formData.append('email', email);
  return await axios.post(
    `${hostname}/parse-csv`, 
    formData, {
      headers: {
        'Content-Type': 'text/csv',
        // 'Authorization': 'Bearer ' + localStorage.getItem('credential'),
      },
    }
  );
};

export const updateExpenditure = async ({month, year, data, type}) => {
  if (!localStorage.getItem('eeEmail')) return;
  const email = localStorage.getItem('eeEmail');
  return await axios.put(
    `${hostname}/update-csv`, 
    { email, month, year, data, type }, {
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': 'Bearer ' + localStorage.getItem('credential'),
      },
    }
  );
};
