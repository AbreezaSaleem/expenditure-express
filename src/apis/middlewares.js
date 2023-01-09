import axios from 'axios';
import { toast } from 'react-toastify';

axios.interceptors.request.use(function (config) {
  return config;
}, function (error) {
  return Promise.reject(error);
});

axios.interceptors.response.use(function (response) {
    return response;
  }, function (error) {
    if (error.response.status === 401) {
      localStorage.removeItem('eeEmail');
      toast(error.response.data.message, { type: 'error' });
    }
    return Promise.reject(error);
  });

export default axios;
