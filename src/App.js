import { Grommet, Box } from 'grommet';
import { ToastContainer } from 'react-toastify';
import { useQuery } from 'react-query';
import { Header, Footer, FileUpload, CollapsibleList } from './components';
import { customTheme } from './theme';
import { fetchExpenditures } from './apis/expenditures';

// add authorized javascript origins once you deploy the app to production
// get clientID from environment variable
// should you save the token in local storage?

// TODO
// 1. Logout button. Add a profile dropdown in the menu conditionally based on whether the user is logged in or not.
// 2. Does google logout work? The prev token still validates
// 3. After the user logs in, the google button still shows 'Sign in as abreeza'

function App() {
  const { data, isLoading, isError } = useQuery(
    'expendituresFiles',
    () => fetchExpenditures(),
    { refetchOnWindowFocus: false, refetchOnMount: false }
  );

  return (
    <>
      <ToastContainer />
      <Grommet theme={ customTheme }>
        <Header />
        <Box
          direction="column"
          justify="center"
          align="center"
          pad="large"
          background="status-disabled"
          gap="medium"
        >
          <FileUpload />
          <CollapsibleList data={ data } />
        </Box>
        <Footer />
      </Grommet>
    </>
  );
}

export default App;
