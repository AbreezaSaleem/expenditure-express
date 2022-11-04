import React, { useState } from 'react';
import isempty from 'lodash.isempty';
import { Collapsible, Box, Text, Heading } from 'grommet';
import { Table, Analytics } from '../components';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const MonthlyExpenditures = ({ year, month, expenditure }) => {
  const [openMonthly, setOpenMonthly] = useState(false);

  const handleClick = (event) => {
    event.stopPropagation();
    setOpenMonthly(!openMonthly);
  };

  return (
    <Box
      background={{ color: 'neutral-1', opacity: true, width: '100%' }}
      elevation="medium"
      pad="small"
      fill
      onClick={handleClick}
    >
      <Text color="white">{month}</Text>
      <Box fill>
        <Collapsible fill open={openMonthly}>
          {!isempty(expenditure) && <Table data={expenditure} month={month} year={year} />}
        </Collapsible>
      </Box>
    </Box>
  );
};

export const YearlyExpenditures = ({ year, expenditure }) => {
  const [openYearly, setOpenYearly] = useState(false);
  const { analytics, ...rest } = expenditure;

  const monthDataSorted = Object.entries(rest).sort((a, b) => months.indexOf(a[0]) - months.indexOf(b[0]));

  const renderMonthlyExpenditures = () => 
    monthDataSorted.map(([month, data]) =>
      <MonthlyExpenditures
        key={`${year}-${month}`}
        year={ year }
        month={ month }
        expenditure={ data }
      />
    );

  return (
    <Box
      background={{ color: 'neutral-1', opacity: true, width: '100%' }}
      elevation="medium"
      pad="small"
      fill
      onClick={() => setOpenYearly(!openYearly)}
    >
      <Text color="white">{year}</Text>
      <Box fill>
        <Collapsible fill open={openYearly}>
          { renderMonthlyExpenditures() }
        </Collapsible>
      </Box>
    </Box>
  );
}

export const ExpendituresList = ({ data }) => {

  const renderYearlyExpenditures = () => 
    Object.keys(data).map(year => 
      <YearlyExpenditures
        key={year}
        year={ year }
        expenditure={ data[year] }
      />
    );

  return (
    <>
      <Box justify="between" direction="row" fill pad="none">
        <Heading level={3}>Expenditures List</Heading>
        <Analytics />
      </Box>
      { renderYearlyExpenditures() }
    </>
  );
}
