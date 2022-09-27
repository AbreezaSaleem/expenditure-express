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
        >
          <Box full={full} pad="medium" gap="small" >
            <Box full={full} direction="row" justify="between" pad="none">
              <Heading level={3} margin="none">{heading}</Heading>
              {allowClose && <Button icon={<FormClose />} onClick={onClose} plain />}
            </Box>
            <Text>{description}</Text>
            <Box gap="small" direction="column">
              { children }
            </Box>
          </Box>
        </Layer>
      )}
    </>
  );
}
