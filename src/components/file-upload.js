import React, { useState } from 'react';
import axios from 'axios';
import { Select, Box, Heading, Text, FileInput } from 'grommet';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const years = ['2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022'];

export const FileUpload = () => {
  const [timePeriod, setTimePeriod] = useState({ month: null, year: null });

  const updateMonth = (event) => setTimePeriod({ ...timePeriod, month: event.target.value });
  const updateYear = (event) => setTimePeriod({ ...timePeriod, year: event.target.value });

  const uploadFileOnServer = async formData => {
    try {
      console.log('formdata parsed', formData.get('csvFile'))
      const url = 'http://localhost:8080/parse-csv';
      await axios.post(url, formData, {
        headers: {
          'Content-Type': 'text/csv',
          'Authorization': 'Bearer ' + localStorage.getItem('credential'),
        },
      })
    } catch (error) {
      console.log('Error uploading file', error);
    }
  };

  const handleUploadFile = (event) => {
    const file = event.target.files[0];
    if(!file) return;
    const formData = new FormData()
    formData.append('csvFile', file);
    formData.append('email', 'ali.khilji94@gmail.com');
    formData.append('timePeriod', `${timePeriod.month}-${timePeriod.year}`);
    console.log('data', formData)
    uploadFileOnServer(formData);
  }

  return (
    <>
      <Box pad="small" direction="column">
        <Heading textAlign="center" margin="none">Welcome to Expenditures Express!</Heading>
        <Heading size="small" textAlign="center">A one stop to view and manage all your expenditures</Heading>
        <Text textAlign="center">Upload your file and view your monthly spenditure</Text>
      </Box>
      <Box pad="small" gap="small" direction="row" width="medium">
        <Select
          options={ months }
          value={ timePeriod.month }
          onChange={ updateMonth }
        />
        <Select
          options={ years }
          value={ timePeriod.year }
          onChange={ updateYear }
        />
      </Box>
      <FileInput
        disabled={ !timePeriod.month || !timePeriod.year }
        name="Upload File"
        background="neutral-1"
        onChange={ handleUploadFile }
        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
      />
    </>
  );
}
