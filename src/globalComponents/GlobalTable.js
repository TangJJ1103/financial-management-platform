import * as React from "react";
import Box from "@mui/material/Box";
import { DataGrid } from "@mui/x-data-grid";

const CustomDataGrid = ({
  columns,
  rows,
  pageSize = 5,
  height = 400,
  loading = false,
}) => {
  return (
    <Box sx={{ height: height, width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading} // Show loading state while fetching data
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: pageSize,
            },
          },
        }}
        pageSizeOptions={[5, 10, 20]}
        checkboxSelection
        disableRowSelectionOnClick
      />
    </Box>
  );
};

export default CustomDataGrid;
