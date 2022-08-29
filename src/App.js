import { useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import axios from 'axios';
import { Grommet, Box } from 'grommet';
import { Header, Footer, FileUpload, CollapsibleList } from './components';
import { customTheme } from './theme';

// add authorized javascript origins once you deploy the app to production
// get clientID from environment variable
// should you save the token in local storage?

// TODO
// 1. Logout button. Add a profile dropdown in the menu conditionally based on whether the user is logged in or not.
// 2. Show popup when user logsout
// 3. Show success/error message on file upload
// 4. Use react-query?
// 5. fetch csv files when user lands on the page

function App() {

  const getExpenditures = async () => {
    try {
      const url = 'http://localhost:8080/fetch-csv';
      const response = await axios.get(url, {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('credential'),
        },
      });
      console.log('response', response);
      return response.data;
    } catch (error) {
      console.log('Error fetching expenditures', error);
    }
  };

  useEffect(() => {
    getExpenditures();
    console.log('useEffect');
  }, []);

  return (
    <GoogleOAuthProvider clientId="1083413414522-bpk1bui746d1a470558mt8kkid90ukre.apps.googleusercontent.com">
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
          <CollapsibleList />
        </Box>
        <Footer />
      </Grommet>
    </GoogleOAuthProvider>
  );
}

export default App;
