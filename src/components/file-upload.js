import React, { useState, useEffect } from 'react';
import { useQueryClient, useMutation } from 'react-query';
import { toast } from 'react-toastify';
import { Select, Box, Button, Heading, Text, FileInput, TextInput } from 'grommet';
import { Popup, SampleFile } from '../components';
import { uploadExpenditureFile } from '../apis/expenditures';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const years = ['2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022'];

export const FileUpload = () => {
  const [timePeriod, setTimePeriod] = useState({ month: null, year: null });
  const [open, setOpen] = useState(false);
  const [groupBy, setGroupBy] = React.useState('');

  const onOpen = () => setOpen(true);
  const onClose = () => setOpen(false);

  const onChange = (event) => setGroupBy(event.target.value);

  const queryClient = useQueryClient()
  const uploadExpenditureFileMutation = useMutation(uploadExpenditureFile, {
    onSuccess: (response) => {
      const { data: { groupByValid } } = response;
      toast('File successfully loaded!', {
        type: 'success',
        autoClose: 2000,
      });
      if (!groupByValid) {
        toast('Column name was not found - used first column as default', {
          type: 'warning',
          autoClose: 5000,
        });
      }
      queryClient.invalidateQueries(['expendituresFiles'])
    },
  });

  const updateMonth = (event) => setTimePeriod({ ...timePeriod, month: event.target.value });
  const updateYear = (event) => setTimePeriod({ ...timePeriod, year: event.target.value });

  const uploadFileOnServer = formData => uploadExpenditureFileMutation.mutate(formData);

  const handleUploadFile = (event) => {
    const file = event.target.files[0];
    if(!file) return;
    const formData = new FormData()
    formData.append('csvFile', file);
    formData.append('email', 'ali.khilji94@gmail.com');
    formData.append('timePeriod', `${timePeriod.month}-${timePeriod.year}`);
    formData.append('groupBy', groupBy);
    uploadFileOnServer(formData);
  }

  useEffect(() => {
    if(timePeriod.month && timePeriod.year) {
      onOpen();
    }
  }, [timePeriod]);

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
      <Popup
        open={ open }
        onClose={ onClose }
        heading="Before we proceed..."
        description="Please enter the column name you want to group your data by:"
        confirm="Confirm"
      >
        <TextInput
          value={groupBy}
          onChange={onChange}
        />
        <Box
          as="footer"
          gap="small"
          direction="row"
          align="center"
          justify="end"
          pad={{ top: 'medium', bottom: 'small' }}
        >              
          <Button
            label={<Text color="white">Confirm</Text>}
            onClick={onClose}
            primary
            disabled={ !groupBy }
            color="status-critical"
          />
        </Box>
      </Popup>
      { groupBy && <Text>Grouping by: <strong>{groupBy}</strong></Text> }
      <FileInput
        disabled={ !timePeriod.month || !timePeriod.year }
        name="Upload File"
        background="neutral-1"
        onChange={ handleUploadFile }
        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
      />
      <SampleFile />
    </>
  );
}
