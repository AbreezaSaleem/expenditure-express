import React from 'react';
import isempty from 'lodash.isempty';
import { Box, DataTable } from 'grommet';

const generateColumns = (columns) =>
  columns.map((column) => {
    return {
      property: column,
      header: column,
    };
  });

export const Table = ({ data }) => {
  if (isempty(data)) return null;

  const expenditureGrouped = data;
  // Data is grouped. We need to ungroup it to be able to display it in a table
  const expenditure = Object.values(expenditureGrouped).flat();
  const columns = generateColumns(Object.keys(expenditure[0]));

  return (
    <Box align="center" pad="large">
      <DataTable columns={columns} data={ expenditure } step={10} />
    </Box>
  );
};
