import React, { useState } from 'react';
import { useQueryClient, useMutation } from 'react-query';
import { toast } from 'react-toastify';
import { Box, DataTable, CheckBox } from 'grommet';
import { Trash, ChapterAdd } from 'grommet-icons';
import { EditForm } from '../components';
import { updateExpenditure } from '../apis/expenditures';

const generateColumns = (columns) =>
  columns.map((column) => {
    return {
      property: column,
      header: column,
    };
  });

const getColumnNames = (data) => {
  const defaultColumns = ['Expense Description', 'Expenditure', 'Category', 'Mode of Payment'];
  const columnsNames = Object.keys(data[0]).filter((column) => column !== 'id');
  return columnsNames.length ? columnsNames : defaultColumns;
};

export const Table = ({ data, month, year }) => {
  const expenditureGrouped = data;
  // Data is grouped. We need to ungroup it to be able to display it in a table
  const expenditure = Object.values(expenditureGrouped).flat();
  const columnsNames = getColumnNames(expenditure);

  const columns = generateColumns(columnsNames);

  const [checked, setChecked] = useState([]);

  const [openEditForm, setOpenEditForm] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const onOpenEditForm = () => setOpenEditForm(true);
  const setCloseEditForm = (event) => { event.stopPropagation(); setOpenEditForm(false)};

  const [openAddForm, setOpenAddForm] = useState(false);
  const [addFormData, setAddFormData] = useState(columnsNames.reduce((o, key) => Object.assign(o, {[key]: ''}), {}));
  const onOpenAddForm = () => setOpenAddForm(true);
  const setCloseAddForm = (event) => { event.stopPropagation(); setOpenAddForm(false)};

  const queryClient = useQueryClient()
  const updateExpenditureMutation = useMutation(updateExpenditure, {
    onSuccess: (response) => {
      toast('File successfully updated!', {
        type: 'success',
        autoClose: 2000,
      });
      queryClient.invalidateQueries(['expendituresFiles'])
    },
  });
  
  const updateExpenditureMutationWrapped = (data, type) => {
    updateExpenditureMutation.mutate({month, year, data, type});
  }

  const onCheck = (value) => (event) => {
    event.preventDefault();
    if (event.target.checked) {
      setChecked([...checked, value]);
    } else {
      setChecked(checked.filter((item) => item !== value));
    }
  };

  const onCheckAll = (event) =>
    setChecked(event.target.checked ? expenditure.map(
      value => `${value['Expense Description']}-${value.id}`)
    : []);

  const openEditFormHandler = (event) => {
    const { datum, target: { type } } = event;
    // we're doing this because clicking on the checkbox also triggers this event
    // and event.stopPropogation in onCheck isn't working for some reason
    if (type === 'checkbox') return;
    setEditFormData(datum);
    onOpenEditForm();
  };

  const addData = () => {
    updateExpenditureMutationWrapped(addFormData, 'add');
    setOpenAddForm(false);
  }

  const updateData = () => {
    updateExpenditureMutationWrapped(editFormData, 'update');
    setOpenEditForm(false)
  }

  const deleteData = event => {
    event.stopPropagation();
    updateExpenditureMutationWrapped(checked, 'delete');
  }

  const renderUpdateIcons = () => {
    const trashColor = checked.length > 0 ? 'white' : 'status-disabled';
    return (
      <Box onClick={(event) => event.stopPropagation()} direction="row" gap="small" justify="end">
        <Trash onClick={deleteData} color={ trashColor } />
        <ChapterAdd onClick={onOpenAddForm} color="white" />
      </Box>
    );
  }

  return (
    <>
    <EditForm
      data={editFormData} updateData={setEditFormData}
      open={openEditForm} onClose={setCloseEditForm}
      updateFile={updateData}
    />
    <EditForm
      data={addFormData} updateData={setAddFormData}
      open={openAddForm} onClose={setCloseAddForm}
      edit={false} updateFile={addData}
    />
    <Box overflow="scroll" alignSelf="center" pad="none" width="large">
      <Box pad="small" fill>{ renderUpdateIcons() }</Box>
      <DataTable
        onClick={(event) => event.stopPropagation()}
        columns={[
          {
            property: 'checkbox',
            primary: true,
            render: (value) => {
              const name = value['Expense Description']
              const key = `${name}-${value.id}`;
              return (
                <CheckBox
                  key={key}
                  checked={checked.indexOf(value) !== -1}
                  onChange={onCheck(value)}
                  aria-label="row checkbox"
                />
            )},
            header: (
              <CheckBox
                checked={checked.length === expenditure.length}
                indeterminate={
                  checked.length > 0 && checked.length < expenditure.length
                }
                onChange={onCheckAll}
                aria-label="header checkbox"
              />
            ),
          },
          ...columns
        ]}
        data={ expenditure }
        onClickRow={openEditFormHandler}
        step={10}
        background={{
          header: { color: 'dark-3', opacity: 'strong' },
          body: ['light-1', 'light-3'],
          footer: { color: 'dark-3', opacity: 'strong' },
        }}
      />
    </Box>
    </>
  );
};
