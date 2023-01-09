import React from 'react';
import { Header as GrommetHeader, Anchor, Box, Menu, ResponsiveContext } from 'grommet';
import { Menu as MenuIcon } from 'grommet-icons';
import { toast } from 'react-toastify';
import { GoogleLogin } from './google-login';
import { useMutation } from 'react-query';
import { logout } from '../apis/expenditures';

const { Consumer } = ResponsiveContext;

export const Header = () => {
  const email = localStorage.getItem('eeEmail');
  const name = localStorage.getItem('eeName');

  const logoutMutation = useMutation(logout, {
    onSuccess: () => {
      toast('Logged out successfully', {
        type: 'success',
        autoClose: 2000,
      });
      setTimeout(function () {
        localStorage.removeItem('eeEmail');
        window.location.reload(true);
      }, 2500);
    },
  });

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
              (!!email ? {
                label: <Box pad="small">Logout</Box>,
                onClick: logoutMutation.mutate,
              } : {}),
            ]}
          />
        </Box>
      );
    } else {
      return (
        <>
        {email && (
          <Box justify="end" direction="row" alignItems="center" gap="medium">
          <Anchor alignSelf="center" color="neutral-1" href="#expenditures" label="View Expenditures" />
          <Menu
            label={`Hey ${name}`}
            alignItems="center"
            items={[
              { label: 'Logout', onClick: logoutMutation.mutate },
            ]}
          />
          </Box>
        )}
        </>
      );
    }
  };

  return (
    <GrommetHeader
      style={{ borderBottomLeftRadius: 15, borderBottomRightRadius: 15 }}
      background="#00873d2b"
      pad="small"
    >
      {!email ? <GoogleLogin /> : <div />}
      <Consumer>
        {(size) => renderNaviagtion(size)}
      </Consumer>
    </GrommetHeader>
  );
}
