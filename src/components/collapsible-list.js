import React, { useState } from 'react';
import { Collapsible, Box, Text, Heading } from 'grommet';
import { Table, Analytics } from '../components';

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
          <Table data={expenditure} />
        </Collapsible>
      </Box>
    </Box>
  );
};

export const YearlyExpenditures = ({ year, expenditure }) => {
  const [openYearly, setOpenYearly] = useState(false);
  const { analytics, ...rest } = expenditure;

  const renderMonthlyExpenditures = () => 
    Object.keys(rest).map(month =>
      <MonthlyExpenditures
        key={`${year}-${month}`}
        year={ year }
        month={ month }
        expenditure={ rest[month] }
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
