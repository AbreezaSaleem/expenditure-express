import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Header as GrommetHeader, Anchor, Box, Menu, ResponsiveContext } from 'grommet';
import { Menu as MenuIcon } from 'grommet-icons';

const { Consumer } = ResponsiveContext;

export const Header = () => {
  const onSuccess = async credentialResponse => {
    console.log('success', credentialResponse);
    alert('User logged in successfully');
    const { credential } = credentialResponse;
    localStorage.setItem('credential', credential);
  };

  const onError = error => {  console.log(error); };

  const handleLogout = () => {
    localStorage.removeItem('credential');
    alert('User logged out successfully');
    window.location.reload(true);
  };

  const renderNaviagtion = (size) => {
    if (size === 'small') {
      return (
        <Box justify="end" alignItems="center">
          <Menu
            a11yTitle="Navigation Menu"
            dropProps={{ align: { top: 'bottom', right: 'right' } }}
            icon={<MenuIcon color="neutral-1" />}
            items={[
              {
                label: <Box pad="small">Expenditures</Box>,
                href: '#',
              },
              {
                label: <Box pad="small">Profile</Box>,
                href: '#',
              },
            ]}
          />
        </Box>
      );
    } else {
      return (
        <Box justify="end" direction="row" alignItems="center" gap="medium">
          <Anchor alignSelf="center" color="neutral-1" href="#" label="Expenditures" />
          <Menu
            label="Hey, Abreeza"
            alignItems="center"
            items={[
              { label: 'Logout', onClick: handleLogout },
            ]}
          />
        </Box>
      );
    }
  };

  return (
    <GrommetHeader background="light-6" pad="small">
      <GoogleLogin
        onSuccess={ onSuccess }
        onError={ onError }
      />
      <Consumer>
        {(size) => renderNaviagtion(size)}
      </Consumer>
    </GrommetHeader>
  );
}
