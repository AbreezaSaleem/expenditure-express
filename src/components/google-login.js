import { GoogleLogin as GoogleLoginLib } from '@react-oauth/google';
import { useMutation } from 'react-query';
import { toast } from 'react-toastify';
import { sendToken } from '../apis/expenditures';

export const GoogleLogin = () => {
  const sendTokenMutation = useMutation(sendToken, {
    onSuccess: ({ email, name }) => {
      toast('Logged in successfully', {
        type: 'success',
        autoClose: 1000,
      });
      localStorage.setItem('eeEmail', email);
      localStorage.setItem('eeName', name);
      setTimeout(function () {
        window.location.reload(true);
      }, 1500);
    },
  });

  const onSuccess = async credentialResponse => {
    console.log(credentialResponse);
    const { credential } = credentialResponse;
    sendTokenMutation.mutate(credential)
  };

  const onError = error => {
    toast('There was a problem with login', {
      type: 'error',
      autoClose: 2000,
    });
  };

  return (
    <GoogleLoginLib
      onSuccess={ onSuccess }
      onError={ onError }
    />
  );
}
