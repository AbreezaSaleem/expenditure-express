import { Footer as GrommetFooter, Text, Anchor } from 'grommet';

export const Footer = () => {
  return (
    <GrommetFooter background="#00873d2b" pad="medium">
      <Text color="neutral-1">Copyright</Text>
      <Anchor label="About" color="neutral-1" />
    </GrommetFooter>
  );
}
