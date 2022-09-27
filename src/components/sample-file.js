import { Box, Text, Anchor } from 'grommet';
import { Document } from 'grommet-icons';

export const SampleFile = () => {
  return (
    <Box pad="small">
      {/* <Text color="light-2">
        Please make sure that the file you are uploading is in the correct format. If you are not sure, please view the sample file and use it as a reference.
      </Text> */}
      <Anchor
        download
        target="_blank"
        color="neutral-1"
        icon={<Document />}
        label="Sample File"
        href="https://docs.google.com/spreadsheets/d/1Y_h3k883jTcVAjTzYvybglqSnxJbyZhAXocP-mpBQJo/edit?usp=sharing"
      />
    </Box>
  );
}
