import React from 'react';
import { Box, Text, Button, Form, FormField, MaskedInput } from 'grommet';
import { Popup } from '../components';

export const EditForm = ({ data, updateData, open, onClose, updateFile, edit = true }) => {
  const heading = edit ? 'Edit Field' : 'Add Field';
  const description = edit ? 'Edit the field and click save' : 'Add a new field and click save';

  return (
    <>
    <Popup
      open={ open }
      onClose={ onClose }
      heading={ heading }
      description={ description }
      confirm="Confirm"
      allowClose
    >
      <Box width="large" overflow="scroll" onClick={(event) => event.stopPropagation()}>
      <Form
        value={data}
        onChange={(nextValue) => updateData(nextValue)}
        onSubmit={({ value: nextValue }) => { updateData(nextValue); updateFile(); } }
      >
        { data && Object.keys(data).filter(key => key !== 'id').map((key) => {
          /**
           * If we have the value then we can easily determine the type of input
           * and apply the numeric regex
           * but in case of new values being added, we have no way to tell which field is
           * the price field because we're not restricting the user on column names
           * in the sample sheet, the price column is called 'expenditure' but we're still
           * allowing the user to name the price column anything
           * 
           * we're running into a similar issue in the backend as well in the parse-csv api
           */
          const isNumberField =
            !isNaN(parseFloat(data[key])) && isFinite(data[key]) 
            || key === 'Expenditure';
          const regexp = isNumberField ? /^[1-9]\d*(\.\d+)?$/ : null;
          return (
          <FormField key={key} name={key} label={key} required>
            <MaskedInput name={key} mask={[{ regexp }]} />
          </FormField>
        )})}
        <Box direction="row" justify="between" margin={{ top: 'medium' }}>
          <Button
            type="submit"
            label={<Text color="white" weight="bold">Update</Text>}
            disabled={Object.values(data).some((value) => value === '')}
            color="status-warning"
            onClick={updateFile}
            primary
          />
        </Box>
      </Form>
      </Box>
    </Popup>
    </>
  );
};
