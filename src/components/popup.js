import React from 'react';
import { Box, Button, Heading, Layer, Text } from 'grommet';
import { FormClose } from 'grommet-icons';

export const Popup = ({
  open = false, onClose, allowClose = false,
  heading, description, full = false, children,
}) => {
  return (
    <>
      {open && (
        <Layer
          full={full}
          position="center"
          onEsc={onClose}
          onClickOutside={allowClose && onClose}
          background="white"
        >
          <Box full={full} pad="medium" gap="small" >
            <Box
              full={full} direction="row" justify="between" pad="none"
            >
              {allowClose && <Box width="33%" />}
              <Heading width="33%" textAlign="center" level={3} margin="none">{heading}</Heading>
              {allowClose && (
                <Box width="33%">
                  <Button alignSelf="end" icon={<FormClose color="#444444" />} onClick={onClose} plain />
                </Box>
              )}
            </Box>
            <Text weight="bold" alignSelf="center">{description}</Text>
            <Box gap="small" direction="column">
              { children }
            </Box>
          </Box>
        </Layer>
      )}
    </>
  );
}
