import React, { useState } from 'react';
import { Collapsible, Box, Text } from 'grommet';

const CollapsibleItem = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Box
        background={{ color: 'neutral-3', opacity: true, width: '100%' }}
        elevation="medium"
        pad="small"
        fill
        onClick={() => setOpen(!open)}
      >
        <Text color="white">August, 2022</Text>
      </Box>
      <Box fill>
        <Collapsible fill open={open}>
          <Box
            background="light-2"
            fill
            pad="medium"
            align="center"
            justify="center"
          >
            <Text>This is a box inside a Collapsible component</Text>
          </Box>
        </Collapsible>
      </Box>
    </>
  );
}


export const CollapsibleList = () => {

  return (
    <CollapsibleItem />
  );
}
