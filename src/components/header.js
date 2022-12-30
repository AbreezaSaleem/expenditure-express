import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Header as GrommetHeader, Anchor, Box, Menu, ResponsiveContext } from 'grommet';
import { Menu as MenuIcon } from 'grommet-icons';
import { parseJwt } from '../utils/index';

const { Consumer } = ResponsiveContext;

export const Header = () => {
  const token = localStorage.getItem('credential');
  const exp = parseJwt(token);

  const onSuccess = async credentialResponse => {
    alert('User logged in successfully');
    const { credential } = credentialResponse;
    localStorage.setItem('credential', credential);
    window.location.reload(true);
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
                label: <Box pad="small">View Expenditures</Box>,
                href: '#expenditures',
              },
              (!!token ? {
                label: <Box pad="small">Logout</Box>,
                onClick: handleLogout,
              } : {}),
            ]}
          />
        </Box>
      );
    } else {
      return (
        <Box justify="end" direction="row" alignItems="center" gap="medium">
          <Anchor alignSelf="center" color="neutral-1" href="#expenditures" label="View Expenditures" />
          {!!token && <Menu
            label={`Hey, ${exp.given_name}`}
            alignItems="center"
            items={[
              { label: 'Logout', onClick: handleLogout },
            ]}
          />}
        </Box>
      );
    }
  };

  return (
    <GrommetHeader
      style={{ borderBottomLeftRadius: 15, borderBottomRightRadius: 15 }}
      background="#00873d2b"
      pad="small"
    >
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
